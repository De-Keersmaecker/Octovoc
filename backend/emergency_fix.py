#!/usr/bin/env python
"""Emergency one-time fix for case_sensitive column"""
import os
import psycopg2

# Get the DATABASE_URL from environment
db_url = os.getenv('DATABASE_URL')

if not db_url:
    print("ERROR: DATABASE_URL not set")
    print("Set it to your Railway PostgreSQL connection string")
    exit(1)

print(f"Connecting to: {db_url[:50]}...")

try:
    # Connect to database
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()

    print("\nAdding case_sensitive column...")
    cur.execute("""
        ALTER TABLE modules
        ADD COLUMN IF NOT EXISTS case_sensitive BOOLEAN DEFAULT FALSE NOT NULL
    """)

    print("Updating alembic version...")
    cur.execute("UPDATE alembic_version SET version_num = '002'")

    conn.commit()
    print("\n✓ SUCCESS! Column added and version updated.")

    # Verify
    cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'modules'")
    columns = [row[0] for row in cur.fetchall()]
    print(f"\nModules table columns: {columns}")

    cur.close()
    conn.close()

except Exception as e:
    print(f"\n✗ ERROR: {e}")
    exit(1)
