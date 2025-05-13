"""
PovertyLine API Server Entry Point

This script runs the Flask application for the PovertyLine API.
It creates the application using the factory pattern and runs it with the specified configuration.
"""
import os
from app import create_app

# Get environment configuration
env = os.getenv('FLASK_ENV', 'development')
app = create_app(env)

if __name__ == '__main__':
    # Run the application
    app.run(host='0.0.0.0', port=5000, debug=env == 'development')
