"""Initial schema

Revision ID: 001_initial_schema
Revises:
Create Date: 2025-10-15 06:15:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Create tables WITHOUT foreign keys first
    # 1. Independent tables (no dependencies)
    op.create_table('schools',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('school_code', sa.String(length=4), nullable=False),
        sa.Column('school_name', sa.String(length=200), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_schools_school_code'), 'schools', ['school_code'], unique=True)

    op.create_table('modules',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('difficulty', sa.String(length=50), nullable=True),
        sa.Column('is_free', sa.Boolean(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('version', sa.Integer(), nullable=True),
        sa.Column('display_order', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table('quotes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('text', sa.Text(), nullable=False),
        sa.Column('author', sa.String(length=200), nullable=True),
        sa.Column('video_url', sa.String(length=500), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    # 2. Tables with simple dependencies
    op.create_table('teacher_codes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('code', sa.String(length=9), nullable=False),
        sa.Column('school_id', sa.Integer(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('deactivated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['school_id'], ['schools.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_teacher_codes_code'), 'teacher_codes', ['code'], unique=True)

    op.create_table('words',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('module_id', sa.Integer(), nullable=False),
        sa.Column('word', sa.String(length=200), nullable=False),
        sa.Column('meaning', sa.Text(), nullable=False),
        sa.Column('example_sentence', sa.Text(), nullable=False),
        sa.Column('position_in_module', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['module_id'], ['modules.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table('batteries',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('module_id', sa.Integer(), nullable=False),
        sa.Column('battery_number', sa.Integer(), nullable=False),
        sa.Column('word_ids', sa.JSON(), nullable=False),
        sa.ForeignKeyConstraint(['module_id'], ['modules.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # 3. Classrooms WITHOUT foreign keys first
    op.create_table('classrooms',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('teacher_id', sa.Integer(), nullable=True),  # Will add FK later
        sa.Column('class_code_id', sa.Integer(), nullable=True),
        sa.Column('school_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['school_id'], ['schools.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # 4. Class codes (now classrooms exists)
    op.create_table('class_codes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('code', sa.String(length=9), nullable=False),
        sa.Column('classroom_id', sa.Integer(), nullable=True),
        sa.Column('school_id', sa.Integer(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('deactivated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['classroom_id'], ['classrooms.id'], ),
        sa.ForeignKeyConstraint(['school_id'], ['schools.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_class_codes_code'), 'class_codes', ['code'], unique=True)

    # 5. Users
    op.create_table('users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(length=120), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=20), nullable=False),
        sa.Column('class_code', sa.String(length=9), nullable=True),
        sa.Column('classroom_id', sa.Integer(), nullable=True),
        sa.Column('teacher_code', sa.String(length=9), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('is_verified', sa.Boolean(), nullable=True),
        sa.Column('verification_token', sa.String(length=100), nullable=True),
        sa.Column('reset_token', sa.String(length=100), nullable=True),
        sa.Column('gdpr_accepted', sa.Boolean(), nullable=True),
        sa.Column('gdpr_accepted_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('last_activity', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['class_code'], ['class_codes.code'], ),
        sa.ForeignKeyConstraint(['classroom_id'], ['classrooms.id'], ),
        sa.ForeignKeyConstraint(['teacher_code'], ['teacher_codes.code'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)

    # Now add the missing FK to classrooms.teacher_id
    with op.batch_alter_table('classrooms', schema=None) as batch_op:
        batch_op.create_foreign_key('fk_classrooms_teacher', 'users', ['teacher_id'], ['id'])

    # 6. Remaining tables
    op.create_table('difficult_words',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('word_id', sa.Integer(), nullable=False),
        sa.Column('added_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['word_id'], ['words.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table('student_progress',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('module_id', sa.Integer(), nullable=False),
        sa.Column('current_battery_id', sa.Integer(), nullable=True),
        sa.Column('current_phase', sa.Integer(), nullable=True),
        sa.Column('battery_order', sa.JSON(), nullable=True),
        sa.Column('completed_batteries', sa.JSON(), nullable=True),
        sa.Column('in_final_round', sa.Boolean(), nullable=True),
        sa.Column('final_round_word_ids', sa.JSON(), nullable=True),
        sa.Column('is_completed', sa.Boolean(), nullable=True),
        sa.Column('completion_date', sa.DateTime(), nullable=True),
        sa.Column('total_attempts', sa.Integer(), nullable=True),
        sa.Column('total_time_spent', sa.Integer(), nullable=True),
        sa.Column('started_at', sa.DateTime(), nullable=True),
        sa.Column('last_activity', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['current_battery_id'], ['batteries.id'], ),
        sa.ForeignKeyConstraint(['module_id'], ['modules.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table('teacher_code_classrooms',
        sa.Column('teacher_code_id', sa.Integer(), nullable=False),
        sa.Column('classroom_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['classroom_id'], ['classrooms.id'], ),
        sa.ForeignKeyConstraint(['teacher_code_id'], ['teacher_codes.id'], ),
        sa.PrimaryKeyConstraint('teacher_code_id', 'classroom_id')
    )

    op.create_table('battery_progress',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('student_progress_id', sa.Integer(), nullable=False),
        sa.Column('battery_id', sa.Integer(), nullable=False),
        sa.Column('current_phase', sa.Integer(), nullable=True),
        sa.Column('phase1_completed', sa.Boolean(), nullable=True),
        sa.Column('phase2_completed', sa.Boolean(), nullable=True),
        sa.Column('phase3_completed', sa.Boolean(), nullable=True),
        sa.Column('current_question_queue', sa.JSON(), nullable=True),
        sa.Column('is_completed', sa.Boolean(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['battery_id'], ['batteries.id'], ),
        sa.ForeignKeyConstraint(['student_progress_id'], ['student_progress.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table('question_progress',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('battery_progress_id', sa.Integer(), nullable=False),
        sa.Column('word_id', sa.Integer(), nullable=False),
        sa.Column('phase', sa.Integer(), nullable=False),
        sa.Column('user_answer', sa.Text(), nullable=True),
        sa.Column('is_correct', sa.Boolean(), nullable=False),
        sa.Column('attempt_number', sa.Integer(), nullable=True),
        sa.Column('answered_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['battery_progress_id'], ['battery_progress.id'], ),
        sa.ForeignKeyConstraint(['word_id'], ['words.id'], ),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade():
    op.drop_table('question_progress')
    op.drop_table('battery_progress')
    op.drop_table('teacher_code_classrooms')
    op.drop_table('student_progress')
    op.drop_table('difficult_words')
    op.drop_table('users')
    op.drop_table('class_codes')
    op.drop_table('classrooms')
    op.drop_table('batteries')
    op.drop_table('words')
    op.drop_table('teacher_codes')
    op.drop_table('quotes')
    op.drop_table('modules')
    op.drop_table('schools')
