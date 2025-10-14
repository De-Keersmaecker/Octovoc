#!/bin/bash
set -e

echo "Starting Octovoc Backend..."

# Run database migrations
echo "Running database migrations..."
/opt/venv/bin/flask db upgrade

# Seed admin user if not exists
echo "Checking admin user..."
/opt/venv/bin/python seed_admin.py || echo "Admin user already exists or error occurred"

# Start the application
echo "Starting Gunicorn..."
exec /opt/venv/bin/gunicorn run:app --bind 0.0.0.0:$PORT
