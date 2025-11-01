from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from config import Config
import os

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
mail = Mail()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Set SQLAlchemy engine options for faster startup
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        'pool_pre_ping': True,
        'pool_recycle': 300,
        'connect_args': {
            'connect_timeout': 10
        }
    }

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    mail.init_app(app)

    # CORS configuration - restrict to specific origins
    allowed_origins_str = os.getenv('ALLOWED_ORIGINS', 'http://localhost:5173,https://www.octovoc.be,https://octovoc-production.up.railway.app')
    allowed_origins = [origin.strip() for origin in allowed_origins_str.split(',')]

    # Allow Railway preview deployments (*.up.railway.app)
    def is_allowed_origin(origin):
        if origin in allowed_origins:
            return True
        # Allow Railway subdomains
        if origin and origin.endswith('.up.railway.app'):
            return True
        return False

    CORS(app, resources={
        r"/*": {
            "origins": lambda origin, *args: is_allowed_origin(origin),
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        }
    })

    jwt.init_app(app)

    # Register blueprints
    from app.routes import auth, student, teacher, admin, order
    app.register_blueprint(auth.bp)
    app.register_blueprint(student.bp)
    app.register_blueprint(teacher.bp)
    app.register_blueprint(admin.bp)
    app.register_blueprint(order.bp)

    # Health check endpoint
    @app.route('/health')
    def health_check():
        """Health check endpoint for monitoring"""
        try:
            # Test database connection
            db.session.execute('SELECT 1')
            return {'status': 'healthy', 'database': 'connected'}, 200
        except Exception as e:
            return {'status': 'unhealthy', 'error': str(e)}, 500

    # Create upload folder
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])

    return app
