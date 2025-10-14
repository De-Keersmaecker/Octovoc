from app import create_app, db
from sqlalchemy import text

app = create_app()

with app.app_context():
    try:
        # Try to add the column
        db.session.execute(text('ALTER TABLE modules ADD COLUMN display_order INTEGER DEFAULT 0'))
        db.session.commit()
        print("✓ Column display_order added to modules table")
    except Exception as e:
        if 'duplicate column name' in str(e).lower() or 'already exists' in str(e).lower():
            print("✓ Column display_order already exists")
        else:
            print(f"Error: {e}")
            db.session.rollback()
