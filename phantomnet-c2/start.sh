#!/bin/bash
cd /home/ubuntu/phantomnet-c2
docker compose up -d
# Wait indefinitely to keep systemd service alive
tail -f /dev/null
