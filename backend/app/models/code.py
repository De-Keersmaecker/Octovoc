from app import db
from datetime import datetime
import random
import string

# Characters for code generation - exclude confusing characters
# Exclude: 0 (zero), O (letter O), I (letter I), 1 (one)
SAFE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

class ClassCode(db.Model):
    __tablename__ = 'class_codes'

    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(9), unique=True, nullable=False, index=True)  # Format: ABCD-XXXX (school_code + random)
    classroom_id = db.Column(db.Integer, db.ForeignKey('classrooms.id'), nullable=True)
    school_id = db.Column(db.Integer, db.ForeignKey('schools.id'), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    deactivated_at = db.Column(db.DateTime, nullable=True)

    # Relationships
    classroom = db.relationship('Classroom', backref='class_code', uselist=False, foreign_keys='ClassCode.classroom_id')

    @staticmethod
    def generate_code(school_code):
        """Generate a unique class code in format ABCD-XXXX (school_code + 4 random characters)"""
        while True:
            random_part = ''.join(random.choices(SAFE_CHARS, k=4))
            code = f"{school_code}-{random_part}"

            if not ClassCode.query.filter_by(code=code).first():
                return code

    def to_dict(self):
        return {
            'id': self.id,
            'code': self.code,
            'classroom_id': self.classroom_id,
            'school_id': self.school_id,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'deactivated_at': self.deactivated_at.isoformat() if self.deactivated_at else None
        }


class TeacherCode(db.Model):
    __tablename__ = 'teacher_codes'

    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(9), unique=True, nullable=False, index=True)  # Format: ABCD-XXXX (school_code + random)
    school_id = db.Column(db.Integer, db.ForeignKey('schools.id'), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    deactivated_at = db.Column(db.DateTime, nullable=True)

    # Relationships - many to many with classrooms
    classrooms = db.relationship('Classroom', secondary='teacher_code_classrooms', backref='teacher_codes')

    @staticmethod
    def generate_code(school_code):
        """Generate a unique teacher code in format ABCD-XXXX (school_code + 4 random characters)"""
        while True:
            random_part = ''.join(random.choices(SAFE_CHARS, k=4))
            code = f"{school_code}-{random_part}"

            if not TeacherCode.query.filter_by(code=code).first():
                return code

    def to_dict(self):
        return {
            'id': self.id,
            'code': self.code,
            'school_id': self.school_id,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'deactivated_at': self.deactivated_at.isoformat() if self.deactivated_at else None,
            'classroom_ids': [c.id for c in self.classrooms],
            'classrooms': [{'id': c.id, 'name': c.name} for c in self.classrooms]
        }


# Association table for teacher codes and classrooms
teacher_code_classrooms = db.Table('teacher_code_classrooms',
    db.Column('teacher_code_id', db.Integer, db.ForeignKey('teacher_codes.id'), primary_key=True),
    db.Column('classroom_id', db.Integer, db.ForeignKey('classrooms.id'), primary_key=True)
)
