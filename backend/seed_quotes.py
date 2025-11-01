#!/usr/bin/env python
"""
Seed quotes into the database
"""
import json
import os
from app import create_app, db
from app.models.quote import Quote

def seed_quotes():
    """Seed quotes from quotes_export.json"""
    app = create_app()

    with app.app_context():
        # Check if quotes already exist
        existing_count = Quote.query.count()
        if existing_count > 0:
            print(f"Database already has {existing_count} quotes. Skipping seed.")
            return

        # Load quotes from JSON file
        json_path = os.path.join(os.path.dirname(__file__), 'quotes_export.json')

        if not os.path.exists(json_path):
            print(f"Error: {json_path} not found!")
            return

        with open(json_path, 'r', encoding='utf-8') as f:
            quotes_data = json.load(f)


        # Add quotes to database
        for quote_data in quotes_data:
            quote = Quote(
                text=quote_data['text'],
                author=quote_data['author'],
                video_url=quote_data['video_url'],
                is_active=quote_data['is_active']
            )
            db.session.add(quote)

        db.session.commit()
        print(f"✓ Successfully seeded {len(quotes_data)} quotes!")

if __name__ == '__main__':
    seed_quotes()
