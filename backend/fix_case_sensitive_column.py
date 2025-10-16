#!/usr/bin/env python
"""
Quick fix script to add case_sensitive column if it doesn't exist.
Run this on Railway to fix the missing column issue.
"""
import os
import sys
from sqlalchemy import create_engine, text, inspect

def main():
    # Get database URL
    db_url = os.getenv('DATABASE_URL')
    if not db_url:
        print("ERROR: DATABASE_URL not set")
        sys.exit(1)

    print(f"Connecting to database...")
    engine = create_engine(db_url)

    # Check if column exists
    inspector = inspect(engine)
    columns = [col['name'] for col in inspector.get_columns('modules')]

    print(f"Current columns in modules table: {columns}")

    if 'case_sensitive' in columns:
        print("✓ case_sensitive column already exists!")
    else:
        print("✗ case_sensitive column is missing. Adding it now...")

        with engine.connect() as conn:
            # Add the column
            conn.execute(text(
                "ALTER TABLE modules ADD COLUMN case_sensitive BOOLEAN DEFAULT FALSE NOT NULL"
            ))
            conn.commit()
            print("✓ case_sensitive column added successfully!")

    # Update alembic_version if needed
    with engine.connect() as conn:
        result = conn.execute(text("SELECT version_num FROM alembic_version")).fetchone()
        current_version = result[0] if result else None
        print(f"Current alembic version: {current_version}")

        if current_version != '002':
            print(f"Updating alembic_version from {current_version} to 002...")
            conn.execute(text("UPDATE alembic_version SET version_num = '002'"))
            conn.commit()
            print("✓ alembic_version updated!")

if __name__ == '__main__':
    main()
