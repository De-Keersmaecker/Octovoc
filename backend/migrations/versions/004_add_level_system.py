"""Add level system to modules and classrooms

Revision ID: 004_add_level_system
Revises: 003
Create Date: 2025-10-18 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '004'
down_revision = '003'
branch_labels = None
depends_on = None


def upgrade():
    # Add level column to modules
    with op.batch_alter_table('modules', schema=None) as batch_op:
        batch_op.add_column(sa.Column('level', sa.Integer(), nullable=True))

    # Migrate data from difficulty to level
    # "Niveau 1" -> 1, "Niveau 2" -> 2, etc.
    # SQLite-compatible approach
    connection = op.get_bind()

    # Update each level
    for i in range(1, 7):
        connection.execute(
            sa.text(f"UPDATE modules SET level = {i} WHERE difficulty LIKE '%{i}%'")
        )

    # Set default level 1 for any remaining NULL values
    connection.execute(
        sa.text("UPDATE modules SET level = 1 WHERE level IS NULL")
    )

    # Make level non-nullable after migration
    with op.batch_alter_table('modules', schema=None) as batch_op:
        batch_op.alter_column('level', nullable=False)

    # Add allowed_levels to classrooms (JSON array of integers [1,2,3,4,5,6])
    # Default: all levels allowed
    with op.batch_alter_table('classrooms', schema=None) as batch_op:
        batch_op.add_column(sa.Column('allowed_levels', sa.JSON(), nullable=True))

    # Set default allowed_levels to all levels for existing classrooms
    connection.execute(
        sa.text("UPDATE classrooms SET allowed_levels = '[1,2,3,4,5,6]'")
    )


def downgrade():
    with op.batch_alter_table('classrooms', schema=None) as batch_op:
        batch_op.drop_column('allowed_levels')

    with op.batch_alter_table('modules', schema=None) as batch_op:
        batch_op.drop_column('level')
