#!/bin/bash
set -e

echo "Running database initialization..."
python /app/init_db.py

echo "Starting Gunicorn server with SSL..."
exec gunicorn --certfile "$SSL_CERT_PATH" --keyfile "$SSL_KEY_PATH" \
    --bind 0.0.0.0:8443 --workers 4 --threads 4 --timeout 120 \
    phantomnet.app:app
