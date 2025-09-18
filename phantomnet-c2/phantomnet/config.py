```python
Configuration settings for PhantomNet C2 Server
"""

import secrets
from datetime import timedelta

class Config:
    """Base configuration class"""

    # Flask configuration
    SECRET_KEY = secrets.token_urlsafe(32)
    DEBUG = False
    TESTING = False

    # Database configuration
    SQLALCHEMY_DATABASE_URI = 'sqlite:///phantom_c2.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Server configuration
    HOST = '0.0.0.0'
    PORT = 8443
    SSL_CONTEXT = 'adhoc'  # Use proper SSL certificates in production

    # Session configuration
    PERMANENT_SESSION_LIFETIME = timedelta(hours=24)
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'

    # Logging configuration
    LOG_LEVEL = 'INFO'
    LOG_FORMAT = '%(asctime)s - %(levelname)s - %(message)s'
    LOG_FILE = 'phantom.log'

    # API Keys (set via environment variables)
    SHODAN_API_KEY = ""
    CENSYS_API_ID = ""
    CENSYS_API_SECRET = ""
    VIRUSTOTAL_API_KEY = ""
    ABUSEIPDB_API_KEY = ""
    OTX_API_KEY = ""

    # C2 Server configuration
    C2_SERVER_IP = '3.148.91.3'
    C2_SERVER_PORT = '8443'

    # Background task intervals
    BACKGROUND_TASK_INTERVAL = 300  # 5 minutes
    BOT_INACTIVE_TIMEOUT = 7200  # 2 hours
    DATA_RETENTION_DAYS = 30

    # Payload generation
    MSFVENOM_PATH = '/usr/bin/msfvenom'  # Default path, adjust for your system

    # Security settings
    MAX_LOGIN_ATTEMPTS = 5
    LOCKOUT_DURATION = 900  # 15 minutes
    PASSWORD_MIN_LENGTH = 8

class DevelopmentConfig(Config):
    """Development configuration"""

    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///phantom_c2_dev.db'
    SSL_CONTEXT = None
    SESSION_COOKIE_SECURE = False
    SESSION_COOKIE_SAMESITE = 'Lax'

class TestingConfig(Config):
    """Testing configuration"""

    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    WTF_CSRF_ENABLED = False
    SESSION_COOKIE_SECURE = False
    SESSION_COOKIE_SAMESITE = 'Lax'

class ProductionConfig(Config):
    """Production configuration"""

    DEBUG = False
    SQLALCHEMY_DATABASE_URI = 'sqlite:///phantom_c2.db'

    # In production, use proper SSL certificates
    SSL_CONTEXT = ('/path/to/cert.pem', '/path/to/key.pem')

    # Security headers
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_SAMESITE = 'Strict'

# Configuration mapping
config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': Config
}

def get_config(config_name=None):
    """Get configuration class based on environment"""
    if config_name is None:
        config_name = 'default'

    return config.get(config_name, Config)
```
