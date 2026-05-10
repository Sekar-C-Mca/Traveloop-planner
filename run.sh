#!/usr/bin/env bash
# =============================================================================
# Traveloop — Run Script
# Starts both Backend (port 5000) and Frontend (port 3000) together.
# Usage: bash run.sh
# Press Ctrl+C to stop both servers.
# =============================================================================

# ── Colours ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
BOLD='\033[1m'
RESET='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/Backend"
FRONTEND_DIR="$SCRIPT_DIR/Frontend"

# ── Banner ────────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}${BOLD}╔══════════════════════════════════════════════════╗${RESET}"
echo -e "${CYAN}${BOLD}║         🌍  TRAVELOOP  —  DEV SERVER            ║${RESET}"
echo -e "${CYAN}${BOLD}╚══════════════════════════════════════════════════╝${RESET}"
echo ""

# ── Pre-flight checks ─────────────────────────────────────────────────────────
if [ ! -d "$BACKEND_DIR/node_modules" ]; then
  echo -e "${RED}✗ Backend dependencies missing. Run:  bash setup.sh${RESET}"
  exit 1
fi

if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
  echo -e "${RED}✗ Frontend dependencies missing. Run:  bash setup.sh${RESET}"
  exit 1
fi

if [ ! -f "$BACKEND_DIR/.env" ]; then
  echo -e "${RED}✗ Backend/.env missing. Run:  bash setup.sh${RESET}"
  exit 1
fi

# ── Port conflict check ───────────────────────────────────────────────────────
check_port() {
  local port=$1
  local name=$2
  if lsof -Pi ":$port" -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠  Port $port ($name) is already in use. Attempting to free it...${RESET}"
    fuser -k "$port/tcp" >/dev/null 2>&1 || true
    sleep 1
  fi
}

check_port 5000 "Backend"
check_port 3000 "Frontend"

# ── PID tracking ──────────────────────────────────────────────────────────────
BACKEND_PID=""
FRONTEND_PID=""

# ── Cleanup on Ctrl+C or exit ─────────────────────────────────────────────────
cleanup() {
  echo ""
  echo -e "${YELLOW}${BOLD}Shutting down Traveloop...${RESET}"
  if [ -n "$BACKEND_PID" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    kill "$BACKEND_PID" 2>/dev/null
    echo -e "${GREEN}✓ Backend stopped${RESET}"
  fi
  if [ -n "$FRONTEND_PID" ] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
    kill "$FRONTEND_PID" 2>/dev/null
    echo -e "${GREEN}✓ Frontend stopped${RESET}"
  fi
  echo -e "${CYAN}Goodbye! 👋${RESET}"
  echo ""
  exit 0
}

trap cleanup SIGINT SIGTERM

# ── Log prefixing helper ───────────────────────────────────────────────────────
# Streams output from a process, prefixing every line with a coloured tag.
stream_with_prefix() {
  local prefix="$1"
  local color="$2"
  while IFS= read -r line; do
    echo -e "${color}${BOLD}${prefix}${RESET} ${line}"
  done
}

# ── Start Backend ─────────────────────────────────────────────────────────────
echo -e "${MAGENTA}${BOLD}▶  Starting Backend  →  http://localhost:5000${RESET}"
(
  cd "$BACKEND_DIR"
  npx ts-node-dev \
    --respawn \
    --transpile-only \
    --no-notify \
    --quiet \
    src/app.ts 2>&1
) | stream_with_prefix "[API]" "$MAGENTA" &
BACKEND_PID=$!

# ── Wait for Backend to be ready ──────────────────────────────────────────────
echo -e "${YELLOW}   Waiting for Backend to come online...${RESET}"
WAITED=0
MAX_WAIT=30
until node -e "
  const http = require('http');
  const req = http.get('http://localhost:5000/health', (r) => {
    process.exit(r.statusCode === 200 ? 0 : 1);
  });
  req.on('error', () => process.exit(1));
  req.setTimeout(1000, () => { req.destroy(); process.exit(1); });
" 2>/dev/null; do
  WAITED=$((WAITED + 1))
  if [ "$WAITED" -ge "$MAX_WAIT" ]; then
    echo -e "${RED}✗ Backend did not start within ${MAX_WAIT}s. Check logs above.${RESET}"
    cleanup
    exit 1
  fi
  sleep 1
done

echo -e "${GREEN}${BOLD}✓ Backend ready  →  http://localhost:5000${RESET}"
echo ""

# ── Start Frontend ────────────────────────────────────────────────────────────
echo -e "${CYAN}${BOLD}▶  Starting Frontend →  http://localhost:3000${RESET}"
(
  cd "$FRONTEND_DIR"
  npm run dev 2>&1
) | stream_with_prefix "[WEB]" "$CYAN" &
FRONTEND_PID=$!

# ── Summary banner ────────────────────────────────────────────────────────────
sleep 3
echo ""
echo -e "${GREEN}${BOLD}╔══════════════════════════════════════════════════════╗${RESET}"
echo -e "${GREEN}${BOLD}║   🚀  Traveloop is running!                         ║${RESET}"
echo -e "${GREEN}${BOLD}║                                                      ║${RESET}"
echo -e "${GREEN}${BOLD}║   Frontend  →  http://localhost:3000                 ║${RESET}"
echo -e "${GREEN}${BOLD}║   Backend   →  http://localhost:5000                 ║${RESET}"
echo -e "${GREEN}${BOLD}║   API Docs  →  http://localhost:5000/health          ║${RESET}"
echo -e "${GREEN}${BOLD}║                                                      ║${RESET}"
echo -e "${GREEN}${BOLD}║   Press Ctrl+C to stop both servers                  ║${RESET}"
echo -e "${GREEN}${BOLD}╚══════════════════════════════════════════════════════╝${RESET}"
echo ""

# ── Keep alive — wait for either process to die ───────────────────────────────
while true; do
  # If backend dies unexpectedly, alert and stop
  if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
    echo -e "${RED}${BOLD}✗ Backend process exited unexpectedly.${RESET}"
    cleanup
  fi
  # If frontend dies unexpectedly, alert and stop
  if ! kill -0 "$FRONTEND_PID" 2>/dev/null; then
    echo -e "${RED}${BOLD}✗ Frontend process exited unexpectedly.${RESET}"
    cleanup
  fi
  sleep 2
done
