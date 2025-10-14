#!/bin/bash
set -e

echo "========================================="
echo "Starting Octovoc Backend Deployment"
echo "========================================="

# Set Flask app for migrations
export FLASK_APP=run.py

# Show database URL (without password for security)
echo "Database configured: ${DATABASE_URL:0:20}..."

# Run database migrations
echo "Running database migrations..."
cd /app
/opt/venv/bin/flask db upgrade || {
    echo "ERROR: Database migrations failed!"
    echo "Trying to initialize database..."
    /opt/venv/bin/flask db init || echo "Database already initialized"
    /opt/venv/bin/flask db migrate -m "Initial migration" || echo "Migration creation failed"
    /opt/venv/bin/flask db upgrade || echo "Migration upgrade failed"
}

# Seed admin user if not exists
echo "Seeding admin user..."
/opt/venv/bin/python seed_admin.py || echo "Admin seeding skipped or failed"

echo "========================================="
echo "Starting Gunicorn Server..."
echo "========================================="
# Start the application
exec /opt/venv/bin/gunicorn run:app --bind 0.0.0.0:$PORT --access-logfile - --error-logfile -
