#!/usr/bin/env bash
# AdmitBridge — stop the services started by start.sh
pkill -f "uvicorn app:app" 2>/dev/null || true
pkill -f "node server.js" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
echo "Stopped AdmitBridge services (ml, server, client)."
