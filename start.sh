#!/bin/sh

# Start the backend Node.js server in background
echo "[start.sh] Starting backend..."
cd /app/backend
node dist/server.js &

# Give backend a moment to start
sleep 2

# Start Nginx in foreground (this keeps the container alive)
echo "[start.sh] Starting Nginx..."
exec nginx -g "daemon off;"
