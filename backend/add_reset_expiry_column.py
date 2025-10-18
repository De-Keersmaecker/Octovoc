#!/usr/bin/env python
"""Add reset_token_expiry column to users table - One-time script"""
import os
from sqlalchemy import create_engine, text

# Get DATABASE_URL from environment
db_url = os.getenv('DATABASE_URL')

if not db_url:
    print("ERROR: DATABASE_URL not set")
    exit(1)

print(f"Connecting to database...")

try:
    # Create engine
    engine = create_engine(db_url)

    # Add column
    with engine.connect() as conn:
        print("Adding reset_token_expiry column...")
        conn.execute(text("""
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP
        """))
        conn.commit()

        print("✓ SUCCESS! Column added.")

        # Update alembic version to 003
        print("Updating alembic version...")
        conn.execute(text("UPDATE alembic_version SET version_num = '003'"))
        conn.commit()

        print("✓ Migration complete!")

except Exception as e:
    print(f"✗ ERROR: {e}")
    import traceback
    traceback.print_exc()
    exit(1)
