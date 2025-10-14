import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'postgresql://localhost/octovoc')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # JWT Configuration
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)

    # Admin Configuration
    ADMIN_EMAIL = os.getenv('ADMIN_EMAIL', 'info@katern.be')
    ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'Warempelwachtwoord007')
    ADMIN_GMAIL = os.getenv('ADMIN_GMAIL', 'info@katern.be')

    # Data Retention (in days)
    ACCOUNT_INACTIVE_DAYS = 730  # 2 years

    # Upload Configuration
    UPLOAD_FOLDER = 'uploads'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
