#!/bin/bash

echo "==================================="
echo "Octovoc Setup Script"
echo "==================================="
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "Error: PostgreSQL is not installed"
    echo "Please install PostgreSQL first"
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    exit 1
fi

echo "✓ All prerequisites are installed"
echo ""

# Setup Backend
echo "Setting up backend..."
cd backend

# Create virtual environment
echo "Creating Python virtual environment..."
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "✓ .env file created. Please update it with your configuration."
fi

# Create PostgreSQL database
echo "Creating PostgreSQL database..."
createdb octovoc 2>/dev/null || echo "Database octovoc already exists"

# Initialize database
echo "Initializing database..."
python init_db.py

cd ..

# Setup Frontend
echo ""
echo "Setting up frontend..."
cd frontend

# Install Node dependencies
echo "Installing Node dependencies..."
npm install

cd ..

echo ""
echo "==================================="
echo "Setup Complete!"
echo "==================================="
echo ""
echo "To start the application:"
echo ""
echo "1. Start the backend (in one terminal):"
echo "   cd backend"
echo "   source venv/bin/activate  # On Windows: venv\\Scripts\\activate"
echo "   python run.py"
echo ""
echo "2. Start the frontend (in another terminal):"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "3. Open your browser at http://localhost:3000"
echo ""
echo "Admin login:"
echo "  Email: info@katern.be"
echo "  Password: Warempelwachtwoord007"
echo ""
