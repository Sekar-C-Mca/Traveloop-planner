#!/usr/bin/env bash
# =============================================================================
# Traveloop — Setup Script
# Run once before starting the project for the first time.
# Usage: bash setup.sh
# =============================================================================

set -e  # Exit immediately on any error

# ── Colours ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/Backend"
FRONTEND_DIR="$SCRIPT_DIR/Frontend"

# ── Banner ────────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}${BOLD}╔══════════════════════════════════════════════════╗${RESET}"
echo -e "${CYAN}${BOLD}║         🌍  TRAVELOOP  —  SETUP                 ║${RESET}"
echo -e "${CYAN}${BOLD}╚══════════════════════════════════════════════════╝${RESET}"
echo ""

# ── Step 1: Node version check ────────────────────────────────────────────────
echo -e "${YELLOW}[1/5] Checking Node.js version...${RESET}"
NODE_VER=$(node -v 2>/dev/null | sed 's/v//' | cut -d. -f1)
if [ -z "$NODE_VER" ] || [ "$NODE_VER" -lt 18 ]; then
  echo -e "${RED}✗ Node.js 18+ is required. Please install it from https://nodejs.org${RESET}"
  exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v) detected${RESET}"

# ── Step 2: Install Backend dependencies ─────────────────────────────────────
echo ""
echo -e "${YELLOW}[2/5] Installing Backend dependencies...${RESET}"
cd "$BACKEND_DIR"
npm install --silent
echo -e "${GREEN}✓ Backend node_modules installed${RESET}"

# ── Step 3: Backend .env check ───────────────────────────────────────────────
echo ""
echo -e "${YELLOW}[3/5] Verifying Backend .env file...${RESET}"
if [ ! -f "$BACKEND_DIR/.env" ]; then
  echo -e "${RED}✗ Backend/.env not found. Creating from template...${RESET}"
  cat > "$BACKEND_DIR/.env" <<'ENVEOF'
DATABASE_URL=postgresql://neondb_owner:npg_esnW7KtiQ0MI@ep-bitter-pond-aqa8ghdp-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=traveloop_secret_key_change_in_prod
JWT_EXPIRES_IN=7d
PORT=5000
CLIENT_URL=http://localhost:3000
ENVEOF
  echo -e "${GREEN}✓ .env created${RESET}"
else
  echo -e "${GREEN}✓ Backend/.env found${RESET}"
fi

# ── Step 4: Run DB migrations ─────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}[4/5] Running database migrations...${RESET}"
cd "$BACKEND_DIR"
npx ts-node-dev --transpile-only --no-notify src/db/migrate.ts
echo -e "${GREEN}✓ Migrations complete${RESET}"

# Run seed (idempotent — uses ON CONFLICT DO NOTHING)
echo ""
echo -e "${YELLOW}[4/5] Seeding database (cities, categories, activities)...${RESET}"
npx ts-node-dev --transpile-only --no-notify src/db/seed.ts
echo -e "${GREEN}✓ Database seeded${RESET}"

# ── Step 5: Install Frontend dependencies ────────────────────────────────────
echo ""
echo -e "${YELLOW}[5/5] Installing Frontend dependencies...${RESET}"
cd "$FRONTEND_DIR"

# Write .env.local if missing
if [ ! -f "$FRONTEND_DIR/.env.local" ]; then
  echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > "$FRONTEND_DIR/.env.local"
  echo -e "${GREEN}✓ Frontend/.env.local created${RESET}"
else
  echo -e "${GREEN}✓ Frontend/.env.local found${RESET}"
fi

npm install --silent
echo -e "${GREEN}✓ Frontend node_modules installed${RESET}"

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}${BOLD}╔══════════════════════════════════════════════════╗${RESET}"
echo -e "${CYAN}${BOLD}║   ✅  Setup complete! Run:  bash run.sh          ║${RESET}"
echo -e "${CYAN}${BOLD}╚══════════════════════════════════════════════════╝${RESET}"
echo ""
