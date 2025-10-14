"""
Database initialization script
Creates tables and seeds initial data
"""
from app import create_app, db
from app.models.user import User
from app.models.quote import Quote
from config import Config

app = create_app()

with app.app_context():
    # Drop all tables and recreate
    print('Dropping all tables...')
    db.drop_all()

    print('Creating all tables...')
    db.create_all()

    # Create admin user
    print('Creating admin user...')
    admin = User(
        email=Config.ADMIN_EMAIL,
        role='admin',
        is_active=True,
        is_verified=True,
        gdpr_accepted=True
    )
    admin.set_password(Config.ADMIN_PASSWORD)
    db.session.add(admin)

    # Add some default quotes
    print('Adding default quotes...')
    quotes = [
        Quote(text='Goed gedaan! Je hebt deze module succesvol afgerond.', author=''),
        Quote(text='Kennis is macht.', author='Francis Bacon'),
        Quote(text='De enige manier om goed werk te leveren is door lief te hebben wat je doet.', author='Steve Jobs'),
        Quote(text='Succes is de som van kleine inspanningen, dag in dag uit herhaald.', author='Robert Collier'),
        Quote(text='Een investering in kennis levert het beste rendement op.', author='Benjamin Franklin'),
    ]

    for quote in quotes:
        db.session.add(quote)

    db.session.commit()

    print('\nDatabase initialized successfully!')
    print(f'\nAdmin login:')
    print(f'Email: {Config.ADMIN_EMAIL}')
    print(f'Password: {Config.ADMIN_PASSWORD}')
