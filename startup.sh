#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND="$ROOT/backend"
FRONTEND="$ROOT/frontend"

start_backend() {
  cd "$BACKEND"
  if [ ! -f .env ]; then
    echo "backend/.env is missing. Create it with GROQ_API_KEY before starting."
    exit 1
  fi
  echo "Installing backend deps..."
  pip3 install -r requirements.txt
  echo "Starting backend on http://localhost:8000"
  python3 -m uvicorn main:app --reload &
  BACKEND_PID=$!
}

start_frontend() {
  cd "$FRONTEND"
  echo "Installing frontend deps..."
  npm install
  echo "Starting frontend on http://localhost:5173"
  npm run dev -- --host &
  FRONTEND_PID=$!
}

cleanup() {
  echo "Stopping services..."
  kill ${BACKEND_PID:-0} ${FRONTEND_PID:-0} 2>/dev/null || true
}

trap cleanup EXIT

start_backend
start_frontend

echo "Both services started. Press Ctrl+C to stop."
wait