"""Add reset_token_expiry column to users

Revision ID: 003
Revises: 002
Create Date: 2025-01-17

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None


def upgrade():
    # Add reset_token_expiry column to users table
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('reset_token_expiry', sa.DateTime(), nullable=True))


def downgrade():
    # Remove reset_token_expiry column
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_column('reset_token_expiry')
