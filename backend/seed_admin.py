from app import create_app, db
from app.models.user import User

app = create_app()

with app.app_context():
    # Check if admin exists
    admin = User.query.filter_by(email='info@katern.be').first()

    if not admin:
        admin = User(
            email='info@katern.be',
            role='admin',
            is_active=True,
            is_verified=True
        )
        admin.set_password('Katern2025!')
        db.session.add(admin)
        db.session.commit()
        print("Admin user created: info@katern.be / Katern2025!")
    else:
        print("Admin user already exists")
