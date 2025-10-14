from app import db
from datetime import datetime

class Classroom(db.Model):
    __tablename__ = 'classrooms'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    teacher_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    class_code_id = db.Column(db.Integer, db.ForeignKey('class_codes.id'), nullable=True)
    school_id = db.Column(db.Integer, db.ForeignKey('schools.id'), nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    teacher = db.relationship('User', backref='taught_classrooms', foreign_keys=[teacher_id])

    def to_dict(self):
        school_name = None
        school_code = None

        if self.school_id:
            from app.models.school import School
            school = School.query.get(self.school_id)
            if school:
                school_name = school.school_name
                school_code = school.school_code

        return {
            'id': self.id,
            'name': self.name,
            'teacher_id': self.teacher_id,
            'class_code_id': self.class_code_id,
            'school_id': self.school_id,
            'school_name': school_name,
            'school_code': school_code,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
