from app import db
from datetime import datetime
import random

class Quote(db.Model):
    """Motivational quotes or video links shown after module completion"""
    __tablename__ = 'quotes'

    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text, nullable=False)
    author = db.Column(db.String(200), nullable=True)
    video_url = db.Column(db.String(500), nullable=True)  # YouTube or other video URL
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    @staticmethod
    def get_random_quote():
        """Get a random active quote"""
        quotes = Quote.query.filter_by(is_active=True).all()
        if quotes:
            return random.choice(quotes)
        return None

    def to_dict(self):
        return {
            'id': self.id,
            'text': self.text,
            'author': self.author,
            'video_url': self.video_url,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
