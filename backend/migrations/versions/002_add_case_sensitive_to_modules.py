"""Add case_sensitive column to modules

Revision ID: 002
Revises: 001
Create Date: 2025-01-16

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade():
    # Add case_sensitive column to modules table
    op.add_column('modules', sa.Column('case_sensitive', sa.Boolean(), nullable=True))

    # Set default value for existing rows
    op.execute('UPDATE modules SET case_sensitive = 0 WHERE case_sensitive IS NULL')

    # Make column not nullable after setting defaults
    op.alter_column('modules', 'case_sensitive', nullable=False, server_default='0')


def downgrade():
    # Remove case_sensitive column
    op.drop_column('modules', 'case_sensitive')
