"""
Pytest bootstrap for the CreditLens backend test suite.

This module is imported by pytest *before* any `app.*` module, so the whole
suite runs against a disposable, self-contained SQLite database and never
requires a running PostgreSQL instance. The production code paths are exercised
unchanged — same async SQLAlchemy engine, same models, same schema produced by
`Base.metadata.create_all` (which mirrors the Alembic migration chain).

To run the suite against a real database instead, export `DATABASE_URL` before
invoking pytest (the `setdefault` calls below yield to it).
"""
import os
import pathlib

_BACKEND_DIR = pathlib.Path(__file__).parent.resolve()
_TEST_DB_PATH = _BACKEND_DIR / "test_creditlens.db"

# 1. Force an isolated on-disk SQLite DB unless the caller supplied their own.
#    On-disk (not :memory:) so every engine connection/session sees the same data.
os.environ.setdefault("DATABASE_URL", f"sqlite+aiosqlite:///{_TEST_DB_PATH.as_posix()}")
os.environ.setdefault("ENVIRONMENT", "testing")
# Keep rate limiting wired (production parity) but see the per-test reset below.
os.environ.setdefault("RATE_LIMIT_ENABLED", "true")

# 2. Start each test session from a clean schema.
try:
    _TEST_DB_PATH.unlink()
except FileNotFoundError:
    pass

import asyncio  # noqa: E402

import pytest  # noqa: E402

from app.db.session import init_db  # noqa: E402
from app.core.rate_limiter import rate_limiter  # noqa: E402


@pytest.fixture(scope="session", autouse=True)
def _bootstrap_test_database():
    """Create the schema (and seed the demo analyst) once for the session."""
    asyncio.run(init_db())
    yield
    try:
        _TEST_DB_PATH.unlink()
    except (FileNotFoundError, PermissionError):
        # Windows may still hold the handle briefly; a stale file is harmless
        # because the next session unlinks it before creating the schema.
        pass


@pytest.fixture(autouse=True)
def _reset_rate_limiter():
    """
    The sliding-window limiter is a process-wide singleton. Across a long suite
    the accumulated auth calls would eventually trip a 429 that has nothing to do
    with the behaviour under test, so reset it around every test. Production
    behaviour is unchanged — this only isolates tests from each other.
    """
    rate_limiter.reset()
    yield
    rate_limiter.reset()
