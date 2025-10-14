from app import db
from datetime import datetime

class StudentProgress(db.Model):
    """Tracks overall progress for a student on a module"""
    __tablename__ = 'student_progress'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    module_id = db.Column(db.Integer, db.ForeignKey('modules.id'), nullable=False)

    # Progress tracking
    current_battery_id = db.Column(db.Integer, db.ForeignKey('batteries.id'), nullable=True)
    current_phase = db.Column(db.Integer, default=1)  # 1, 2, or 3
    battery_order = db.Column(db.JSON, nullable=True)  # Randomized order of battery IDs
    completed_batteries = db.Column(db.JSON, default=list)  # List of completed battery IDs

    # Final round
    in_final_round = db.Column(db.Boolean, default=False)
    final_round_word_ids = db.Column(db.JSON, default=list)  # Words that were wrong during module

    # Completion
    is_completed = db.Column(db.Boolean, default=False)
    completion_date = db.Column(db.DateTime, nullable=True)
    total_attempts = db.Column(db.Integer, default=0)
    total_time_spent = db.Column(db.Integer, default=0)  # in seconds

    # Timestamps
    started_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_activity = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    module = db.relationship('Module', backref='student_progress')
    current_battery = db.relationship('Battery', foreign_keys=[current_battery_id])
    battery_progress = db.relationship('BatteryProgress', backref='student_progress', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'module_id': self.module_id,
            'current_battery_id': self.current_battery_id,
            'current_phase': self.current_phase,
            'battery_order': self.battery_order,
            'completed_batteries': self.completed_batteries,
            'in_final_round': self.in_final_round,
            'final_round_word_ids': self.final_round_word_ids,
            'is_completed': self.is_completed,
            'completion_date': self.completion_date.isoformat() if self.completion_date else None,
            'total_attempts': self.total_attempts,
            'total_time_spent': self.total_time_spent,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'last_activity': self.last_activity.isoformat() if self.last_activity else None
        }


class BatteryProgress(db.Model):
    """Tracks progress within a specific battery"""
    __tablename__ = 'battery_progress'

    id = db.Column(db.Integer, primary_key=True)
    student_progress_id = db.Column(db.Integer, db.ForeignKey('student_progress.id'), nullable=False)
    battery_id = db.Column(db.Integer, db.ForeignKey('batteries.id'), nullable=False)

    current_phase = db.Column(db.Integer, default=1)  # 1, 2, or 3
    phase1_completed = db.Column(db.Boolean, default=False)
    phase2_completed = db.Column(db.Boolean, default=False)
    phase3_completed = db.Column(db.Boolean, default=False)

    # Question queue for current phase (word IDs that still need to be answered correctly)
    current_question_queue = db.Column(db.JSON, default=list)

    is_completed = db.Column(db.Boolean, default=False)
    completed_at = db.Column(db.DateTime, nullable=True)

    # Relationships
    battery = db.relationship('Battery', backref='battery_progress')
    question_progress = db.relationship('QuestionProgress', backref='battery_progress', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'student_progress_id': self.student_progress_id,
            'battery_id': self.battery_id,
            'current_phase': self.current_phase,
            'phase1_completed': self.phase1_completed,
            'phase2_completed': self.phase2_completed,
            'phase3_completed': self.phase3_completed,
            'current_question_queue': self.current_question_queue,
            'is_completed': self.is_completed,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }


class QuestionProgress(db.Model):
    """Tracks individual question attempts"""
    __tablename__ = 'question_progress'

    id = db.Column(db.Integer, primary_key=True)
    battery_progress_id = db.Column(db.Integer, db.ForeignKey('battery_progress.id'), nullable=False)
    word_id = db.Column(db.Integer, db.ForeignKey('words.id'), nullable=False)

    phase = db.Column(db.Integer, nullable=False)  # 1, 2, or 3
    user_answer = db.Column(db.Text, nullable=True)
    is_correct = db.Column(db.Boolean, nullable=False)
    attempt_number = db.Column(db.Integer, default=1)

    answered_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    word = db.relationship('Word', backref='question_progress')

    def to_dict(self):
        return {
            'id': self.id,
            'battery_progress_id': self.battery_progress_id,
            'word_id': self.word_id,
            'phase': self.phase,
            'user_answer': self.user_answer,
            'is_correct': self.is_correct,
            'attempt_number': self.attempt_number,
            'answered_at': self.answered_at.isoformat() if self.answered_at else None
        }
