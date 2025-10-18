from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)

    # CORS configuration - allow frontend domains
    CORS(app, resources={
        r"/api/*": {
            "origins": [
                "http://localhost:5173",
                "http://localhost:3000",
                "https://www.octovoc.be",
                "https://octovoc.be",
                "https://octovoc.katern.be",
                "https://www.octovoc.katern.be"
            ],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        }
    })

    jwt.init_app(app)

    # Register blueprints
    from app.routes import auth, student, teacher, admin
    app.register_blueprint(auth.bp)
    app.register_blueprint(student.bp)
    app.register_blueprint(teacher.bp)
    app.register_blueprint(admin.bp)

    # Create upload folder
    import os
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])

    return app
