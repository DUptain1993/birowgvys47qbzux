#!/usr/bin/env python3
"""
Main entry point for PhantomNet C2 Server
"""

from .app import app

if __name__ == '__main__':
    print("Starting PhantomNet C2 Server...")
    print(f"Admin Dashboard: https://{app.config['HOST']}:{app.config['PORT']}/admin/login")
    print(f"Default credentials: wappafloppa / Stelz17@")
    print("-" * 50)

    app.run(
        host=app.config['HOST'],
        port=app.config['PORT'],
        ssl_context=app.config['SSL_CONTEXT'],
        threaded=True,
        debug=app.config['DEBUG']
    )
