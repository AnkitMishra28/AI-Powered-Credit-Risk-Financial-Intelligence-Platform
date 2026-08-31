"""002_add_user_designation

Adds a nullable ``designation`` column to ``users`` so a member's
"Designation / Financial Profile" from Settings can be persisted.

Idempotent: the column is only added if it does not already exist (it may
already be present on a database whose schema was built by the app's
``create_all()`` after the model gained this field). Nullable, no server
default -> existing rows are untouched and simply have no designation until
the user saves one. NO data is read, modified, or deleted.

Revision ID: b7c2e4a91f10
Revises: 4a3e1f91a362
Create Date: 2026-08-31 00:00:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


revision: str = 'b7c2e4a91f10'
down_revision: Union[str, Sequence[str], None] = '4a3e1f91a362'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_column(table: str, column: str) -> bool:
    insp = inspect(op.get_bind())
    if not insp.has_table(table):
        return False
    return any(c["name"] == column for c in insp.get_columns(table))


def upgrade() -> None:
    if not _has_column("users", "designation"):
        op.add_column("users", sa.Column("designation", sa.String(length=120), nullable=True))


def downgrade() -> None:
    if _has_column("users", "designation"):
        op.drop_column("users", "designation")
