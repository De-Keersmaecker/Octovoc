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
    case_sensitive = db.Column(db.Boolean, default=False)  # Whether answers must match case
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
            'case_sensitive': self.case_sensitive,
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
        - Prefer batteries of 5 words, then 4 words, then 3 words
        - Avoid batteries of 1 or 2 words
        - Maximize the size of battery groups

        Examples:
        - 13 words: 5+4+4 (better than 5+5+3)
        - 12 words: 4+4+4 (better than 5+5+2)
        - 11 words: 4+4+3
        - 8 words: 4+4 (better than 5+3)
        """
        total_words = len(word_ids)
        batteries = []

        # Special cases for small numbers
        if total_words <= 5:
            battery_sizes = [total_words]
        elif total_words == 6:
            battery_sizes = [3, 3]
        elif total_words == 7:
            battery_sizes = [4, 3]
        elif total_words == 8:
            battery_sizes = [4, 4]
        elif total_words == 9:
            battery_sizes = [5, 4]
        else:
            # For 10+ words, use optimized distribution
            battery_sizes = []
            remaining = total_words

            # Try to fit as many 5s as possible, but check if remainder works
            fives = remaining // 5
            remainder = remaining % 5

            if remainder == 0:
                # Perfect: all 5s
                battery_sizes = [5] * fives
            elif remainder == 1:
                # 5n+1: convert two 5s to one 4 and two 3s
                # e.g., 11 = 5+5+1 → 5+3+3 or better: 4+4+3
                if fives >= 2:
                    battery_sizes = [5] * (fives - 2) + [4, 4, 3]
                else:
                    # 6 words → 3+3
                    battery_sizes = [4, 3] if remaining == 7 else [3, 3]
            elif remainder == 2:
                # 5n+2: convert one 5 to 4+3
                # e.g., 12 = 5+5+2 → 4+4+4
                if fives >= 2:
                    battery_sizes = [5] * (fives - 2) + [4, 4, 4]
                elif fives == 1:
                    # 7 words → 4+3
                    battery_sizes = [4, 3]
                else:
                    # 2 words → impossible, should not happen
                    battery_sizes = [2]  # fallback
            elif remainder == 3:
                # 5n+3: convert one 5 to 4+4 or keep 5+3
                # e.g., 13 = 5+5+3 → 5+4+4 (better)
                # e.g., 8 = 5+3 → 4+4 (better)
                if fives >= 2:
                    battery_sizes = [5] * (fives - 1) + [4, 4]
                elif fives == 1:
                    # 8 words → 4+4
                    battery_sizes = [4, 4]
                else:
                    # 3 words → 3
                    battery_sizes = [3]
            elif remainder == 4:
                # 5n+4: just add a 4
                battery_sizes = [5] * fives + [4]

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
        word_dict = self.word.to_dict() if self.word else None
        # Add case_sensitive setting from the word's module
        if word_dict and self.word:
            module = Module.query.get(self.word.module_id)
            word_dict['case_sensitive'] = module.case_sensitive if module else False

        return {
            'id': self.id,
            'user_id': self.user_id,
            'word_id': self.word_id,
            'word': word_dict,
            'added_at': self.added_at.isoformat() if self.added_at else None
        }
