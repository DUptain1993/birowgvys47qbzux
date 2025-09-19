#!/usr/bin/env python3
"""
Startup script for PhantomNet C2 Server
"""

import os
import sys
import logging
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

def setup_logging():
    """Setup logging configuration"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(),
            logging.FileHandler('phantomnet.log')
        ]
    )

def check_dependencies():
    """Check if all required dependencies are installed"""
    try:
        import flask
        import flask_sqlalchemy
        import werkzeug
        import cryptography
        import requests
        print("✓ All required dependencies are installed")
        return True
    except ImportError as e:
        print(f"✗ Missing dependency: {e}")
        print("Please install dependencies with: pip install -r phantomnet-c2/requirements.txt")
        return False

def create_environment_file():
    """Create .env file if it doesn't exist"""
    env_file = project_root / "phantomnet-c2" / ".env"
    if not env_file.exists():
        print("Creating .env file...")
        env_content = """# PhantomNet C2 Server Environment Configuration
FLASK_ENV=development
SECRET_KEY=your-secret-key-here-change-this-in-production
DEBUG=True

# Database Configuration
DATABASE_URL=sqlite:///phantom_c2.db

# Server Configuration
HOST=0.0.0.0
PORT=8443

# API Keys (optional)
SHODAN_API_KEY=
CENSYS_API_ID=
CENSYS_API_SECRET=
VIRUSTOTAL_API_KEY=
ABUSEIPDB_API_KEY=
OTX_API_KEY=

# DuckDNS Configuration
DUCKDNS_DOMAIN=into-the-nothingnesssss.duckdns.org
DUCKDNS_TOKEN=d6d0b3fa-a957-47c5-ba7f-f17e668990cb
"""
        env_file.write_text(env_content)
        print("✓ .env file created")

def start_server():
    """Start the PhantomNet C2 Server"""
    try:
        # Change to the phantomnet-c2 directory
        os.chdir(project_root / "phantomnet-c2")
        
        # Import and start the server
        from phantomnet.app import app
        
        print("Starting PhantomNet C2 Server...")
        print("=" * 50)
        print("Server URL: https://localhost:8443")
        print("Admin Panel: https://localhost:8443/admin/dashboard")
        print("Default Credentials:")
        print("  Username: wappafloppa")
        print("  Password: Stelz17@")
        print("=" * 50)
        print("Press Ctrl+C to stop the server")
        print()
        
        # Start the server
        app.run(
            host=app.config['HOST'],
            port=app.config['PORT'],
            ssl_context='adhoc',  # Use adhoc SSL for development
            threaded=True,
            debug=app.config['DEBUG']
        )
        
    except KeyboardInterrupt:
        print("\n\nServer stopped by user")
    except Exception as e:
        print(f"Error starting server: {e}")
        sys.exit(1)

def main():
    """Main function"""
    print("PhantomNet C2 Server Startup")
    print("=" * 30)
    
    # Setup logging
    setup_logging()
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Create environment file if needed
    create_environment_file()
    
    # Start the server
    start_server()

if __name__ == "__main__":
    main()
