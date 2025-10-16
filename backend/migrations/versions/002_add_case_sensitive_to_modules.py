"""Add case_sensitive column to modules

Revision ID: 002_add_case_sensitive
Revises: 001_initial_schema
Create Date: 2025-01-16

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '002_add_case_sensitive'
down_revision = '001_initial_schema'
branch_labels = None
depends_on = None


def upgrade():
    # Add case_sensitive column to modules table with default value
    # SQLite doesn't support ALTER COLUMN, so we add it with server_default directly
    with op.batch_alter_table('modules', schema=None) as batch_op:
        batch_op.add_column(sa.Column('case_sensitive', sa.Boolean(), nullable=False, server_default='0'))

    # Set default value for existing rows (in case server_default didn't work)
    op.execute('UPDATE modules SET case_sensitive = 0 WHERE case_sensitive IS NULL')


def downgrade():
    # Remove case_sensitive column
    op.drop_column('modules', 'case_sensitive')
