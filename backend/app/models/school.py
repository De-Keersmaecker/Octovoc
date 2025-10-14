from app import db
from datetime import datetime


class School(db.Model):
    __tablename__ = 'schools'

    id = db.Column(db.Integer, primary_key=True)
    school_code = db.Column(db.String(4), unique=True, nullable=False, index=True)  # 4 letters, e.g., 'ABCD'
    school_name = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    classrooms = db.relationship('Classroom', backref='school', lazy=True)
    class_codes = db.relationship('ClassCode', backref='school', lazy=True)
    teacher_codes = db.relationship('TeacherCode', backref='school', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'school_code': self.school_code,
            'school_name': self.school_name,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'classroom_count': len(self.classrooms),
            'class_code_count': len(self.class_codes),
            'teacher_code_count': len(self.teacher_codes)
        }
