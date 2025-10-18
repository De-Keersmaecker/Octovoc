from app import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'student', 'teacher', 'admin'

    # Student specific
    class_code = db.Column(db.String(9), db.ForeignKey('class_codes.code'), nullable=True)
    classroom_id = db.Column(db.Integer, db.ForeignKey('classrooms.id'), nullable=True)

    # Teacher specific
    teacher_code = db.Column(db.String(9), db.ForeignKey('teacher_codes.code'), nullable=True)

    # Account management
    is_active = db.Column(db.Boolean, default=False)
    is_verified = db.Column(db.Boolean, default=False)
    verification_token = db.Column(db.String(100), nullable=True)
    reset_token = db.Column(db.String(100), nullable=True)
    # reset_token_expiry = db.Column(db.DateTime, nullable=True)  # TODO: Add after column exists in DB
    gdpr_accepted = db.Column(db.Boolean, default=False)
    gdpr_accepted_at = db.Column(db.DateTime, nullable=True)

    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_activity = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    classroom = db.relationship('Classroom', backref='students', foreign_keys=[classroom_id])
    student_progress = db.relationship('StudentProgress', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    difficult_words = db.relationship('DifficultWord', backref='user', lazy='dynamic', cascade='all, delete-orphan')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        classroom_name = None
        school_id = None
        school_name = None
        school_code = None

        if self.classroom_id and self.classroom:
            classroom_name = self.classroom.name
            school_id = self.classroom.school_id

            # Get school information if available
            if self.classroom.school_id:
                from app.models.school import School
                school = School.query.get(self.classroom.school_id)
                if school:
                    school_name = school.school_name
                    school_code = school.school_code

        return {
            'id': self.id,
            'email': self.email,
            'role': self.role,
            'class_code': self.class_code,
            'classroom_id': self.classroom_id,
            'classroom_name': classroom_name,
            'school_id': school_id,
            'school_name': school_name,
            'school_code': school_code,
            'teacher_code': self.teacher_code,
            'is_active': self.is_active,
            'is_verified': self.is_verified,
            'gdpr_accepted': self.gdpr_accepted,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_activity': self.last_activity.isoformat() if self.last_activity else None
        }
