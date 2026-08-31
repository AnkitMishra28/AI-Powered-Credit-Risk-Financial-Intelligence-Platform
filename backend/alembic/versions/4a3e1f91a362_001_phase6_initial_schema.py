"""001_phase6_initial_schema

Idempotent baseline. This revision is written so that `alembic upgrade head`
is safe against EVERY supported production database state:

  * a brand-new empty database                         -> every object is created
  * a database whose schema was created by the app's
    `Base.metadata.create_all()` but was never stamped -> every object already
    exists, so each step is skipped and Alembic simply records this revision in
    a fresh `alembic_version` table (NO data is touched, NO table is dropped)
  * a database already stamped at 001/002/003          -> this revision does not
    run at all

Every `CREATE` is guarded by a live-schema inspection. Nothing here drops or
alters an existing object, so it can never destroy production data.

Revision ID: 4a3e1f91a362
Revises:
Create Date: 2026-08-30 12:16:50.533188
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision: str = '4a3e1f91a362'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _inspector():
    return inspect(op.get_bind())


def _has_table(name: str) -> bool:
    return _inspector().has_table(name)


def _has_index(table: str, index: str) -> bool:
    insp = _inspector()
    if not insp.has_table(table):
        return False
    return any(ix["name"] == index for ix in insp.get_indexes(table))


def _create_table(name: str, *cols):
    if not _has_table(name):
        op.create_table(name, *cols)


def _create_index(index: str, table: str, cols, *, unique: bool = False):
    if _has_table(table) and not _has_index(table, index):
        op.create_index(op.f(index), table, cols, unique=unique)


def upgrade() -> None:
    """Create the Phase-6 schema, skipping anything that already exists."""
    _create_table(
        'documents',
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('source_type', sa.String(length=100), nullable=False),
        sa.Column('source_url', sa.String(length=500), nullable=True),
        sa.Column('publisher', sa.String(length=255), nullable=False),
        sa.Column('version', sa.String(length=50), nullable=False),
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    _create_table(
        'users',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('is_superuser', sa.Boolean(), nullable=False),
        sa.Column('is_demo', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    _create_index('ix_users_email', 'users', ['email'], unique=True)
    _create_table(
        'copilot_queries',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('conversation_id', sa.String(length=64), nullable=False),
        sa.Column('query', sa.Text(), nullable=False),
        sa.Column('answer', sa.Text(), nullable=False),
        sa.Column('sources', sa.JSON(), nullable=True),
        sa.Column('grounding_facts', sa.JSON(), nullable=True),
        sa.Column('key_points', sa.JSON(), nullable=True),
        sa.Column('personalized_insights', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    _create_index('ix_copilot_queries_conversation_id', 'copilot_queries', ['conversation_id'])
    _create_index('ix_copilot_queries_created_at', 'copilot_queries', ['created_at'])
    _create_index('ix_copilot_queries_user_id', 'copilot_queries', ['user_id'])
    _create_table(
        'credit_health_snapshots',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('score', sa.Integer(), nullable=False),
        sa.Column('tier', sa.String(length=50), nullable=False),
        sa.Column('score_delta', sa.Integer(), nullable=False),
        sa.Column('payment_reliability_score', sa.Float(), nullable=False),
        sa.Column('utilization_score', sa.Float(), nullable=False),
        sa.Column('debt_burden_score', sa.Float(), nullable=False),
        sa.Column('tenure_score', sa.Float(), nullable=False),
        sa.Column('spending_stability_score', sa.Float(), nullable=False),
        sa.Column('factors', sa.JSON(), nullable=True),
        sa.Column('disclaimer', sa.String(length=500), nullable=False),
        sa.Column('calculated_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    _create_index('ix_credit_health_snapshots_user_id', 'credit_health_snapshots', ['user_id'])
    _create_table(
        'document_chunks',
        sa.Column('document_id', sa.Integer(), nullable=False),
        sa.Column('chunk_index', sa.Integer(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('token_count', sa.Integer(), nullable=False),
        sa.Column('meta_info', sa.JSON(), nullable=True),
        sa.Column('embedding_placeholder', sa.JSON(), nullable=True),
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
        sa.ForeignKeyConstraint(['document_id'], ['documents.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    _create_index('ix_document_chunks_document_id', 'document_chunks', ['document_id'])
    _create_table(
        'financial_profiles',
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('monthly_income', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('employment_type', sa.String(length=100), nullable=True),
        sa.Column('credit_limit_total', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('revolving_balance_total', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('credit_score_cibil_reference', sa.Integer(), nullable=True),
        sa.Column('onboarding_completed', sa.Boolean(), nullable=False),
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    _create_index('ix_financial_profiles_user_id', 'financial_profiles', ['user_id'])
    _create_table(
        'insights',
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('insight_type', sa.String(length=50), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('summary', sa.Text(), nullable=False),
        sa.Column('structured_facts', sa.JSON(), nullable=False),
        sa.Column('actionable_recommendation', sa.String(length=500), nullable=True),
        sa.Column('is_dismissed', sa.Boolean(), nullable=False),
        sa.Column('is_educational', sa.Boolean(), nullable=False),
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    _create_index('ix_insights_user_id', 'insights', ['user_id'])
    _create_table(
        'loans',
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('loan_type', sa.String(length=100), nullable=False),
        sa.Column('principal_amount', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('outstanding_balance', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('interest_rate', sa.Numeric(precision=5, scale=2), nullable=False),
        sa.Column('monthly_emi', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('tenure_months', sa.Integer(), nullable=False),
        sa.Column('remaining_months', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    _create_index('ix_loans_user_id', 'loans', ['user_id'])
    _create_table(
        'risk_predictions',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('risk_category', sa.String(length=50), nullable=False),
        sa.Column('confidence_percentage', sa.Float(), nullable=False),
        sa.Column('low_risk_probability', sa.Float(), nullable=False),
        sa.Column('medium_risk_probability', sa.Float(), nullable=False),
        sa.Column('high_risk_probability', sa.Float(), nullable=False),
        sa.Column('top_positive_factors', sa.JSON(), nullable=True),
        sa.Column('risk_factors', sa.JSON(), nullable=True),
        sa.Column('shap_explanations', sa.JSON(), nullable=True),
        sa.Column('model_version', sa.String(length=100), nullable=False),
        sa.Column('evaluated_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    _create_index('ix_risk_predictions_user_id', 'risk_predictions', ['user_id'])
    _create_table(
        'statements',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('filename', sa.String(length=255), nullable=False),
        sa.Column('file_type', sa.String(length=20), nullable=False),
        sa.Column('file_size_bytes', sa.Integer(), nullable=False),
        sa.Column('uploaded_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
        sa.Column('processing_status', sa.String(length=50), nullable=False),
        sa.Column('transaction_count', sa.Integer(), nullable=False),
        sa.Column('file_hash', sa.String(length=64), nullable=True),
        sa.Column('date_range_start', sa.String(length=50), nullable=True),
        sa.Column('date_range_end', sa.String(length=50), nullable=True),
        sa.Column('total_inflows', sa.Float(), nullable=False),
        sa.Column('total_outflows', sa.Float(), nullable=False),
        sa.Column('net_cashflow', sa.Float(), nullable=False),
        sa.Column('error_message', sa.String(length=500), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    _create_index('ix_statements_file_hash', 'statements', ['file_hash'])
    _create_index('ix_statements_user_id', 'statements', ['user_id'])
    _create_table(
        'transactions',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('statement_id', sa.String(length=64), nullable=False),
        sa.Column('transaction_date', sa.String(length=50), nullable=False),
        sa.Column('original_narration', sa.String(length=500), nullable=False),
        sa.Column('normalized_merchant', sa.String(length=255), nullable=False),
        sa.Column('category', sa.String(length=100), nullable=False),
        sa.Column('classification_method', sa.String(length=50), nullable=False),
        sa.Column('classification_confidence', sa.Float(), nullable=False),
        sa.Column('debit', sa.Float(), nullable=True),
        sa.Column('credit', sa.Float(), nullable=True),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('transaction_type', sa.String(length=20), nullable=False),
        sa.Column('balance', sa.Float(), nullable=True),
        sa.Column('transaction_hash', sa.String(length=64), nullable=False),
        sa.Column('is_anomaly', sa.Boolean(), nullable=False),
        sa.Column('anomaly_score', sa.Float(), nullable=True),
        sa.Column('anomaly_reason', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
        sa.ForeignKeyConstraint(['statement_id'], ['statements.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    _create_index('ix_transactions_category', 'transactions', ['category'])
    _create_index('ix_transactions_normalized_merchant', 'transactions', ['normalized_merchant'])
    _create_index('ix_transactions_statement_id', 'transactions', ['statement_id'])
    _create_index('ix_transactions_transaction_date', 'transactions', ['transaction_date'])
    _create_index('ix_transactions_transaction_hash', 'transactions', ['transaction_hash'])
    _create_index('ix_transactions_user_id', 'transactions', ['user_id'])


def _drop_index(index: str, table: str):
    if _has_index(table, index):
        op.drop_index(op.f(index), table_name=table)


def _drop_table(name: str):
    if _has_table(name):
        op.drop_table(name)


def downgrade() -> None:
    """Guarded teardown (never used by the production deploy; here for CI/local)."""
    for ix in (
        'ix_transactions_user_id', 'ix_transactions_transaction_hash',
        'ix_transactions_transaction_date', 'ix_transactions_statement_id',
        'ix_transactions_normalized_merchant', 'ix_transactions_category',
    ):
        _drop_index(ix, 'transactions')
    _drop_table('transactions')
    for ix in ('ix_statements_user_id', 'ix_statements_file_hash'):
        _drop_index(ix, 'statements')
    _drop_table('statements')
    _drop_index('ix_risk_predictions_user_id', 'risk_predictions')
    _drop_table('risk_predictions')
    _drop_index('ix_loans_user_id', 'loans')
    _drop_table('loans')
    _drop_index('ix_insights_user_id', 'insights')
    _drop_table('insights')
    _drop_index('ix_financial_profiles_user_id', 'financial_profiles')
    _drop_table('financial_profiles')
    _drop_index('ix_document_chunks_document_id', 'document_chunks')
    _drop_table('document_chunks')
    _drop_index('ix_credit_health_snapshots_user_id', 'credit_health_snapshots')
    _drop_table('credit_health_snapshots')
    for ix in (
        'ix_copilot_queries_user_id', 'ix_copilot_queries_created_at',
        'ix_copilot_queries_conversation_id',
    ):
        _drop_index(ix, 'copilot_queries')
    _drop_table('copilot_queries')
    _drop_index('ix_users_email', 'users')
    _drop_table('users')
    _drop_table('documents')
