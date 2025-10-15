from flask import Blueprint, jsonify
from app import db
from flask_migrate import upgrade
from app.models.user import User
from werkzeug.security import generate_password_hash
import os

bp = Blueprint('setup', __name__, url_prefix='/api/setup')

@bp.route('/migrate', methods=['POST'])
def run_migrations():
    """Run database migrations - ONLY USE ONCE ON FIRST DEPLOYMENT"""
    try:
        # Run migrations
        upgrade()

        # Create admin user
        admin_email = os.getenv('ADMIN_EMAIL', 'info@katern.be')
        admin_password = os.getenv('ADMIN_PASSWORD', 'Warempelwachtwoord007')

        admin = User.query.filter_by(email=admin_email).first()
        if not admin:
            admin = User(
                email=admin_email,
                role='admin',
                is_active=True,
                is_verified=True
            )
            admin.password_hash = generate_password_hash(admin_password)
            db.session.add(admin)
            db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Database migrated and admin user created successfully'
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
