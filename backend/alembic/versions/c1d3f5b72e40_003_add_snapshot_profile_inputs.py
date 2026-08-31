"""003_add_snapshot_profile_inputs

Adds a nullable ``profile_inputs`` JSON column to ``credit_health_snapshots`` so
the raw structured credit-profile inputs a score was computed from are persisted
alongside the score. This lets the Copilot ground answers in the user's OWN
numbers (utilization, balances, income) instead of any canonical placeholder.

Idempotent: only added if missing. Nullable, no default -> existing snapshots
are untouched and simply carry no profile_inputs until the user recalculates.
NO data is read, modified, or deleted.

Revision ID: c1d3f5b72e40
Revises: b7c2e4a91f10
Create Date: 2026-08-31 00:00:01.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


revision: str = 'c1d3f5b72e40'
down_revision: Union[str, Sequence[str], None] = 'b7c2e4a91f10'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_column(table: str, column: str) -> bool:
    insp = inspect(op.get_bind())
    if not insp.has_table(table):
        return False
    return any(c["name"] == column for c in insp.get_columns(table))


def upgrade() -> None:
    if not _has_column("credit_health_snapshots", "profile_inputs"):
        op.add_column(
            "credit_health_snapshots",
            sa.Column("profile_inputs", sa.JSON(), nullable=True),
        )


def downgrade() -> None:
    if _has_column("credit_health_snapshots", "profile_inputs"):
        op.drop_column("credit_health_snapshots", "profile_inputs")
