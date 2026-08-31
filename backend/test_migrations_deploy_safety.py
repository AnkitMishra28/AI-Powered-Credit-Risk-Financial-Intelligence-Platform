"""
Deployment-safety tests for the Alembic migration chain.

These prove `alembic upgrade head` (what Render runs on every deploy) is safe and
non-destructive from every production database state we might encounter:

  A. a brand-new empty database
  B. a database whose full schema exists but was NEVER stamped by Alembic
     (i.e. it was created by the app's `Base.metadata.create_all()`), and which
     is MISSING the columns added in 002/003 — the realistic current prod state
  C. a database already stamped at head

In every case: no table is dropped, existing rows survive, and the chain ends at
head with `users.designation` and `credit_health_snapshots.profile_inputs`
present.

Run standalone (uses its own throwaway SQLite files, never the app DB):
    pytest -q test_migrations_deploy_safety.py
"""
import os
import sqlite3
import subprocess
import sys
import pathlib

import pytest

_BACKEND = pathlib.Path(__file__).parent.resolve()
_PY = sys.executable
HEAD = "c1d3f5b72e40"

CORE_TABLES = [
    "users", "documents", "copilot_queries", "credit_health_snapshots",
    "document_chunks", "financial_profiles", "insights", "loans",
    "risk_predictions", "statements", "transactions",
]


def _alembic(db_path: pathlib.Path, *args: str) -> subprocess.CompletedProcess:
    env = dict(os.environ)
    env["DATABASE_URL"] = f"sqlite+aiosqlite:///{db_path.as_posix()}"
    env["ENVIRONMENT"] = "testing"
    return subprocess.run(
        [_PY, "-m", "alembic", *args],
        cwd=_BACKEND, env=env, capture_output=True, text=True,
    )


def _cols(db_path: pathlib.Path, table: str):
    con = sqlite3.connect(db_path)
    try:
        return [r[1] for r in con.execute(f"PRAGMA table_info({table})")]
    finally:
        con.close()


def _tables(db_path: pathlib.Path):
    con = sqlite3.connect(db_path)
    try:
        return {r[0] for r in con.execute("SELECT name FROM sqlite_master WHERE type='table'")}
    finally:
        con.close()


@pytest.fixture()
def db(tmp_path):
    return tmp_path / "deploy.db"


def test_A_fresh_database_migrates_to_head(db):
    r = _alembic(db, "upgrade", "head")
    assert r.returncode == 0, r.stderr
    tabs = _tables(db)
    for t in CORE_TABLES:
        assert t in tabs, f"{t} missing after fresh upgrade"
    assert "designation" in _cols(db, "users")
    assert "profile_inputs" in _cols(db, "credit_health_snapshots")
    cur = _alembic(db, "current")
    assert HEAD in cur.stdout


def test_B_unstamped_legacy_schema_missing_new_columns_is_healed(db):
    # 1. Build a full schema, then simulate the real production state:
    #    drop the columns 002/003 add AND drop alembic_version entirely, so the
    #    DB looks like it was created by create_all() and never stamped.
    assert _alembic(db, "upgrade", "head").returncode == 0
    con = sqlite3.connect(db)
    con.execute("INSERT INTO users (email, hashed_password, full_name, is_active, is_superuser, is_demo) "
                "VALUES ('legacy@user.test', 'x', 'Legacy User', 1, 0, 0)")
    con.commit()
    con.execute("ALTER TABLE users DROP COLUMN designation")
    con.execute("ALTER TABLE credit_health_snapshots DROP COLUMN profile_inputs")
    con.execute("DROP TABLE alembic_version")
    con.commit()
    con.close()
    assert "designation" not in _cols(db, "users")
    assert "alembic_version" not in _tables(db)

    # 2. This is exactly what Render runs on deploy.
    r = _alembic(db, "upgrade", "head")
    assert r.returncode == 0, f"deploy migration failed:\n{r.stdout}\n{r.stderr}"

    # 3. Healed: columns re-added, chain stamped at head, existing row intact.
    assert "designation" in _cols(db, "users")
    assert "profile_inputs" in _cols(db, "credit_health_snapshots")
    assert set(CORE_TABLES).issubset(_tables(db))
    con = sqlite3.connect(db)
    try:
        n = con.execute("SELECT COUNT(*) FROM users WHERE email='legacy@user.test'").fetchone()[0]
        assert n == 1, "existing user row was lost by the migration"
    finally:
        con.close()
    assert HEAD in _alembic(db, "current").stdout


def test_C_running_upgrade_head_twice_is_a_noop(db):
    assert _alembic(db, "upgrade", "head").returncode == 0
    r = _alembic(db, "upgrade", "head")
    assert r.returncode == 0, r.stderr
    assert HEAD in _alembic(db, "current").stdout


def test_D_single_head_revision(db):
    r = _alembic(db, "heads")
    assert r.returncode == 0
    assert r.stdout.count("(head)") == 1, f"expected exactly one head:\n{r.stdout}"
    assert HEAD in r.stdout


def test_E_downgrade_then_reupgrade_is_clean(db):
    assert _alembic(db, "upgrade", "head").returncode == 0
    d = _alembic(db, "downgrade", "4a3e1f91a362")
    assert d.returncode == 0, d.stderr
    assert "designation" not in _cols(db, "users")
    u = _alembic(db, "upgrade", "head")
    assert u.returncode == 0, u.stderr
    assert "designation" in _cols(db, "users")
    assert "profile_inputs" in _cols(db, "credit_health_snapshots")


def test_F_in_process_apply_migrations_sync_heals_unstamped_prod_like_db(db, tmp_path):
    """
    The app's startup lifespan calls `app.db.session.apply_migrations_sync()`.
    Prove it (not just the `alembic` CLI) heals the realistic production state:
    tables present (built by create_all), `alembic_version` absent, and the
    002/003 columns missing — with an existing user row that must survive.
    """
    script = tmp_path / "run_apply.py"
    script.write_text(
        "import os, sqlite3, asyncio\n"
        f"os.environ['DATABASE_URL'] = 'sqlite+aiosqlite:///{db.as_posix()}'\n"
        "os.environ['ENVIRONMENT'] = 'testing'\n"
        "from app.db.session import init_db, apply_migrations_sync\n"
        "asyncio.run(init_db())\n"
        f"con = sqlite3.connect(r'{db}')\n"
        "con.execute(\"INSERT INTO users (email,hashed_password,full_name,is_active,is_superuser,is_demo)"
        " VALUES ('legacy@heal.test','h','Legacy',1,0,0)\")\n"
        "con.commit()\n"
        "con.execute('ALTER TABLE users DROP COLUMN designation')\n"
        "con.execute('ALTER TABLE credit_health_snapshots DROP COLUMN profile_inputs')\n"
        "con.execute('DROP TABLE IF EXISTS alembic_version')\n"
        "con.commit(); con.close()\n"
        "apply_migrations_sync()\n"
    )
    env = dict(os.environ)
    env.pop("DATABASE_URL", None)
    env["PYTHONPATH"] = str(_BACKEND)
    r = subprocess.run([_PY, str(script)], cwd=_BACKEND, env=env, capture_output=True, text=True)
    assert r.returncode == 0, f"{r.stdout}\n{r.stderr}"
    assert "designation" in _cols(db, "users")
    assert "profile_inputs" in _cols(db, "credit_health_snapshots")
    con = sqlite3.connect(db)
    try:
        assert con.execute("SELECT COUNT(*) FROM users WHERE email='legacy@heal.test'").fetchone()[0] == 1
        assert con.execute("SELECT version_num FROM alembic_version").fetchone()[0] == HEAD
    finally:
        con.close()
