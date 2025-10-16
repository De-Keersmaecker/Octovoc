#!/usr/bin/env python
"""
Entrypoint script for Railway deployment.
Runs migrations before starting the application.
"""
import os
import sys
import subprocess

def run_command(cmd, description):
    """Run a command and handle errors."""
    print(f"\n{'='*60}")
    print(f"  {description}")
    print(f"{'='*60}")
    try:
        result = subprocess.run(
            cmd,
            shell=True,
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True
        )
        print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"ERROR: {e}")
        print(e.stdout)
        return False

def main():
    """Main entrypoint."""
    print("\n" + "="*60)
    print("  OCTOVOC BACKEND DEPLOYMENT")
    print("="*60)

    # Set Flask app
    os.environ['FLASK_APP'] = 'run.py'

    # Check database connection
    db_url = os.getenv('DATABASE_URL', 'Not set')
    print(f"\nDatabase: {db_url[:30]}...")

    # Run migrations
    if not run_command(
        '/opt/venv/bin/flask db upgrade',
        'Running database migrations'
    ):
        print("WARNING: Migrations failed, but continuing...")

    # Fix missing case_sensitive column (temporary fix for migration issues)
    if not run_command(
        '/opt/venv/bin/python fix_case_sensitive_column.py',
        'Checking and fixing case_sensitive column'
    ):
        print("WARNING: Column fix failed, but continuing...")

    # Seed admin user
    if not run_command(
        '/opt/venv/bin/python seed_admin.py',
        'Seeding admin user'
    ):
        print("WARNING: Admin seeding failed, but continuing...")

    # Seed quotes
    if not run_command(
        '/opt/venv/bin/python seed_quotes.py',
        'Seeding motivational quotes'
    ):
        print("WARNING: Quotes seeding failed, but continuing...")

    # Start Gunicorn
    print("\n" + "="*60)
    print("  STARTING GUNICORN SERVER")
    print("="*60 + "\n")

    port = os.getenv('PORT', '8080')
    os.execvp('/opt/venv/bin/gunicorn', [
        'gunicorn',
        'run:app',
        '--bind', f'0.0.0.0:{port}',
        '--access-logfile', '-',
        '--error-logfile', '-',
        '--workers', '2'
    ])

if __name__ == '__main__':
    main()
