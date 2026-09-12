#!/bin/sh
# IZY Technologies — development/preview launcher
# Starts BOTH services exactly as documented in README.md / replit.md:
#   1. Backend API  (Express)  on port 3000
#   2. Frontend     (Vite)     on $PORT (default 5000)
# The frontend proxies /api/* to the backend (see frontend/vite.config.ts).

cd "$(dirname "$0")/.."

# Backend must stay on 3000 (the Vite proxy target), even when the platform
# injects PORT for the frontend.
PORT=3000 node backend/server.js &

# Frontend: bind 0.0.0.0 so the workspace preview can reach it.
cd frontend
exec pnpm run dev --host 0.0.0.0 --port "${PORT:-5000}"
