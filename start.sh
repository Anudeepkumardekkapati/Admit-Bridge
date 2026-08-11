#!/usr/bin/env bash
# AdmitBridge — start all three services (client, server, ML) with logs.
# Usage: ./start.sh [--no-ml]   (--no-ml skips the Python ML service)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
LOG_DIR="$ROOT/.logs"
mkdir -p "$LOG_DIR"

PORT="${PORT:-5001}"   # override the sandbox/shell PORT if set

echo "▶ Starting AdmitBridge services (logs in $LOG_DIR) ..."

# 1) ML service (Python / FastAPI)
if [[ "${1:-}" != "--no-ml" ]]; then
  if [[ ! -x "$ROOT/ml/venv/bin/uvicorn" ]]; then
    echo "  ml: no venv found — creating it and installing dependencies ..."
    (cd "$ROOT/ml" && python3 -m venv venv && ./venv/bin/pip install -q -r requirements.txt)
  fi
  (cd "$ROOT/ml" && nohup ./venv/bin/uvicorn app:app --port 8000 > "$LOG_DIR/ml.log" 2>&1 &)
  echo "  ml       → http://localhost:8000  (log: $LOG_DIR/ml.log)"
else
  echo "  ml       → skipped"
fi

# 2) Express server
(cd "$ROOT/server" && nohup env PORT="$PORT" npm start > "$LOG_DIR/server.log" 2>&1 &)
echo "  server   → http://localhost:$PORT  (log: $LOG_DIR/server.log)"

# 3) React client (Vite)
(cd "$ROOT/client" && nohup npm run dev > "$LOG_DIR/client.log" 2>&1 &)
echo "  client   → http://localhost:5173  (log: $LOG_DIR/client.log)"

# Wait for readiness
sleep 3
echo
echo "Health checks:"
curl -s -m 5 http://localhost:8000/health  && echo "  ✓ ML service" || echo "  ✗ ML service (start it manually if needed)"
curl -s -m 5 "http://localhost:$PORT/api/health" && echo "  ✓ API server" || echo "  ✗ API server"
curl -s -m 5 -o /dev/null -w "  ✓ client (HTTP %{http_code})\n" http://localhost:5173/ || echo "  ✗ client"

echo
echo "Open http://localhost:5173 — seed login (run 'cd server && npm run seed' first if needed):"
echo "  student@admitbridge.com / password123"
echo "  admin@admitbridge.com   / password123"
echo "  consultant@admitbridge.com / password123"
echo
echo "Stop everything with: ./stop.sh"
