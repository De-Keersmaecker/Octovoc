from app import db
from datetime import datetime
import random

class Module(db.Model):
    __tablename__ = 'modules'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    difficulty = db.Column(db.String(50), nullable=True)  # e.g., 'beginner', 'intermediate', 'advanced'
    is_free = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    version = db.Column(db.Integer, default=1)  # For tracking module updates
    display_order = db.Column(db.Integer, default=0)  # For custom ordering in UI
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    words = db.relationship('Word', backref='module', lazy='dynamic', cascade='all, delete-orphan')
    batteries = db.relationship('Battery', backref='module', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self, include_words=False):
        data = {
            'id': self.id,
            'name': self.name,
            'difficulty': self.difficulty,
            'is_free': self.is_free,
            'is_active': self.is_active,
            'version': self.version,
            'display_order': self.display_order,
            'word_count': self.words.count(),
            'battery_count': self.batteries.count(),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

        if include_words:
            data['words'] = [w.to_dict() for w in self.words.all()]
            data['batteries'] = [b.to_dict() for b in self.batteries.all()]

        return data


class Word(db.Model):
    __tablename__ = 'words'

    id = db.Column(db.Integer, primary_key=True)
    module_id = db.Column(db.Integer, db.ForeignKey('modules.id'), nullable=False)
    word = db.Column(db.String(200), nullable=False)
    meaning = db.Column(db.Text, nullable=False)
    example_sentence = db.Column(db.Text, nullable=False)
    position_in_module = db.Column(db.Integer, nullable=False)  # Original position in the module

    def to_dict(self):
        return {
            'id': self.id,
            'module_id': self.module_id,
            'word': self.word,
            'meaning': self.meaning,
            'example_sentence': self.example_sentence,
            'position_in_module': self.position_in_module
        }


class Battery(db.Model):
    __tablename__ = 'batteries'

    id = db.Column(db.Integer, primary_key=True)
    module_id = db.Column(db.Integer, db.ForeignKey('modules.id'), nullable=False)
    battery_number = db.Column(db.Integer, nullable=False)  # 1, 2, 3, etc.
    word_ids = db.Column(db.JSON, nullable=False)  # Array of word IDs in this battery

    def to_dict(self):
        return {
            'id': self.id,
            'module_id': self.module_id,
            'battery_number': self.battery_number,
            'word_ids': self.word_ids,
            'word_count': len(self.word_ids) if self.word_ids else 0
        }

    @staticmethod
    def create_batteries_for_module(module_id, word_ids):
        """
        Creates batteries for a module following the algorithm:
        - Prefer batteries of 5 words
        - Remainder distributed as 4-word batteries
        - If still remainder, create 3-word batteries
        """
        total_words = len(word_ids)
        batteries = []

        # Calculate distribution
        fives = total_words // 5
        remainder = total_words % 5

        if remainder == 0:
            # Perfect division by 5
            battery_sizes = [5] * fives
        elif remainder == 4:
            # e.g., 9 words = 1x5 + 1x4
            battery_sizes = [5] * (fives - 1) + [5, 4] if fives > 0 else [4]
        elif remainder == 3:
            # e.g., 8 words = 1x5 + 1x3
            battery_sizes = [5] * (fives - 1) + [5, 3] if fives > 0 else [3]
        elif remainder == 2:
            # e.g., 7 words = 1x4 + 1x3
            battery_sizes = [5] * (fives - 1) + [4, 3] if fives > 0 else [4, 3]
        elif remainder == 1:
            # e.g., 6 words = 1x3 + 1x3
            battery_sizes = [5] * (fives - 2) + [3, 3] if fives >= 2 else [4, 3] if fives == 1 else [3, 3]

        # Create batteries
        start_idx = 0
        for i, size in enumerate(battery_sizes):
            battery_word_ids = word_ids[start_idx:start_idx + size]
            battery = Battery(
                module_id=module_id,
                battery_number=i + 1,
                word_ids=battery_word_ids
            )
            batteries.append(battery)
            start_idx += size

        return batteries


class DifficultWord(db.Model):
    """Personal module for each student containing words they got wrong in final rounds"""
    __tablename__ = 'difficult_words'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    word_id = db.Column(db.Integer, db.ForeignKey('words.id'), nullable=False)
    added_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    word = db.relationship('Word', backref='difficult_for_users')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'word_id': self.word_id,
            'word': self.word.to_dict() if self.word else None,
            'added_at': self.added_at.isoformat() if self.added_at else None
        }
