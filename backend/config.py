import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

# Deployment verification: 2025-10-16

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

    # Frontend URL for email links
    FRONTEND_URL = os.getenv('FRONTEND_URL', 'https://www.octovoc.be')

    # Flask-Mail Configuration (One.com SMTP)
    MAIL_SERVER = os.getenv('MAIL_SERVER', 'send.one.com')
    MAIL_PORT = int(os.getenv('MAIL_PORT', 587))
    MAIL_USE_TLS = os.getenv('MAIL_USE_TLS', 'True').lower() == 'true'
    MAIL_USE_SSL = False
    MAIL_USERNAME = os.getenv('MAIL_USERNAME')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = ('Octovoc', os.getenv('MAIL_USERNAME', 'octovoc@katern.be'))

    # Data Retention (in days)
    ACCOUNT_INACTIVE_DAYS = 730  # 2 years

    # Upload Configuration
    UPLOAD_FOLDER = 'uploads'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
