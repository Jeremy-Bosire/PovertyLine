"""
PovertyLine Backend Application Factory

This module initializes the Flask application using the application factory pattern.
It sets up all necessary extensions and registers blueprints.
"""
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate

from app.config.config import config_by_name
from app.models.db import db

# Import blueprints
from app.api.users import users_bp
from app.api.profiles import profiles_bp
from app.api.resources import resources_bp
from app.api.admin import admin_bp
from app.auth.routes import auth_bp

# Import seed commands
from app.seeds import register_seed_commands

jwt = JWTManager()
migrate = Migrate()


def create_app(config_name="development"):
    """
    Application factory function to create and configure the Flask app
    
    Args:
        config_name (str): The configuration environment to use (development, testing, production)
        
    Returns:
        Flask: The configured Flask application instance
    """
    app = Flask(__name__)
    app.config.from_object(config_by_name[config_name])
    
    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    CORS(app)
    
    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(profiles_bp, url_prefix='/api/profiles')
    app.register_blueprint(resources_bp, url_prefix='/api/resources')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    
    # Error handlers
    @app.errorhandler(404)
    def handle_404_error(e):
        return {"error": "Not found", "message": str(e)}, 404
    
    @app.errorhandler(500)
    def handle_500_error(e):
        return {"error": "Internal server error", "message": str(e)}, 500
    
    @app.route('/api/health')
    def health_check():
        """Health check endpoint"""
        return {"status": "healthy"}, 200
    
    # Register seed commands with Flask CLI
    register_seed_commands(app)
    
    return app
