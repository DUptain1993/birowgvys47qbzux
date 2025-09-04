#!/usr/bin/env python3
"""
Run script for PhantomNet C2 Server
"""

import os
import sys

# Add the phantomnet package to the Python path
sys.path.insert(0, os.path.dirname(__file__))

from phantomnet.app import app

if __name__ == '__main__':
    print("Starting PhantomNet C2 Server...")
    print(f"Admin Dashboard: https://{app.config['HOST']}:{app.config['PORT']}/admin/login")
    print(f"Default credentials: admin / phantom_admin_2024")
    print("-" * 50)

    app.run(
        host=app.config['HOST'],
        port=app.config['PORT'],
        ssl_context=app.config['SSL_CONTEXT'],
        threaded=True,
        debug=app.config['DEBUG']
    )
