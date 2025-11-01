"""Add indexes on foreign keys for performance

Revision ID: 004_add_foreign_key_indexes
Revises: 003_add_reset_token_expiry
Create Date: 2025-11-01

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '004_add_foreign_key_indexes'
down_revision = '003_add_reset_token_expiry'
branch_labels = None
depends_on = None


def upgrade():
    # Add indexes on foreign keys in users table
    op.create_index('idx_users_classroom_id', 'users', ['classroom_id'])
    op.create_index('idx_users_class_code', 'users', ['class_code'])
    op.create_index('idx_users_teacher_code', 'users', ['teacher_code'])

    # Add indexes on foreign keys in student_progress table
    op.create_index('idx_student_progress_user_id', 'student_progress', ['user_id'])
    op.create_index('idx_student_progress_module_id', 'student_progress', ['module_id'])
    op.create_index('idx_student_progress_current_battery_id', 'student_progress', ['current_battery_id'])

    # Add indexes on foreign keys in battery_progress table
    op.create_index('idx_battery_progress_student_progress_id', 'battery_progress', ['student_progress_id'])
    op.create_index('idx_battery_progress_battery_id', 'battery_progress', ['battery_id'])

    # Add indexes on foreign keys in question_progress table
    op.create_index('idx_question_progress_battery_progress_id', 'question_progress', ['battery_progress_id'])
    op.create_index('idx_question_progress_word_id', 'question_progress', ['word_id'])

    # Add indexes on foreign keys in classrooms table
    op.create_index('idx_classrooms_school_id', 'classrooms', ['school_id'])
    op.create_index('idx_classrooms_teacher_id', 'classrooms', ['teacher_id'])

    # Add indexes on foreign keys in batteries table
    op.create_index('idx_batteries_module_id', 'batteries', ['module_id'])

    # Add indexes on foreign keys in words table
    op.create_index('idx_words_module_id', 'words', ['module_id'])
    op.create_index('idx_words_battery_id', 'words', ['battery_id'])

    # Add indexes on foreign keys in difficult_words table
    op.create_index('idx_difficult_words_user_id', 'difficult_words', ['user_id'])
    op.create_index('idx_difficult_words_word_id', 'difficult_words', ['word_id'])

    # Add indexes on foreign keys in class_codes table
    op.create_index('idx_class_codes_classroom_id', 'class_codes', ['classroom_id'])

    # Add indexes on foreign keys in teacher_codes table
    op.create_index('idx_teacher_codes_school_id', 'teacher_codes', ['school_id'])


def downgrade():
    # Remove indexes in reverse order
    op.drop_index('idx_teacher_codes_school_id', table_name='teacher_codes')
    op.drop_index('idx_class_codes_classroom_id', table_name='class_codes')
    op.drop_index('idx_difficult_words_word_id', table_name='difficult_words')
    op.drop_index('idx_difficult_words_user_id', table_name='difficult_words')
    op.drop_index('idx_words_battery_id', table_name='words')
    op.drop_index('idx_words_module_id', table_name='words')
    op.drop_index('idx_batteries_module_id', table_name='batteries')
    op.drop_index('idx_classrooms_teacher_id', table_name='classrooms')
    op.drop_index('idx_classrooms_school_id', table_name='classrooms')
    op.drop_index('idx_question_progress_word_id', table_name='question_progress')
    op.drop_index('idx_question_progress_battery_progress_id', table_name='question_progress')
    op.drop_index('idx_battery_progress_battery_id', table_name='battery_progress')
    op.drop_index('idx_battery_progress_student_progress_id', table_name='battery_progress')
    op.drop_index('idx_student_progress_current_battery_id', table_name='student_progress')
    op.drop_index('idx_student_progress_module_id', table_name='student_progress')
    op.drop_index('idx_student_progress_user_id', table_name='student_progress')
    op.drop_index('idx_users_teacher_code', table_name='users')
    op.drop_index('idx_users_class_code', table_name='users')
    op.drop_index('idx_users_classroom_id', table_name='users')
