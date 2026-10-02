#!/bin/bash
# ─────────────────────────────────────────────────────────────
#  EcoLoop — One-click deploy to ecoloop.social
#  Usage: ./deploy.sh
# ─────────────────────────────────────────────────────────────

set -e

SERVER="root@31.97.226.6"
PASS="HzCFA@6nO+VB0;Xq"
APP_DIR="/opt/ecoloop"
SSH="sshpass -p '$PASS' ssh -o StrictHostKeyChecking=no $SERVER"
RSYNC="sshpass -p '$PASS' rsync -avz --progress"

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

step() { echo -e "\n${CYAN}▶ $1${NC}"; }
ok()   { echo -e "${GREEN}✓ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠ $1${NC}"; }

echo -e "${GREEN}"
echo "  ███████╗ ██████╗ ██████╗ ██╗      ██████╗  ██████╗ ██████╗ "
echo "  ██╔════╝██╔════╝██╔═══██╗██║     ██╔═══██╗██╔═══██╗██╔══██╗"
echo "  █████╗  ██║     ██║   ██║██║     ██║   ██║██║   ██║██████╔╝"
echo "  ██╔══╝  ██║     ██║   ██║██║     ██║   ██║██║   ██║██╔═══╝ "
echo "  ███████╗╚██████╗╚██████╔╝███████╗╚██████╔╝╚██████╔╝██║     "
echo "  ╚══════╝ ╚═════╝ ╚═════╝ ╚══════╝ ╚═════╝  ╚═════╝ ╚═╝     "
echo -e "  Deploying to https://ecoloop.social${NC}"
echo ""

# ── Step 1: Sync all files to server ───────────────────────────
step "Syncing files to server..."
eval "$RSYNC" \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'dist' \
  --exclude 'dist-ssr' \
  --exclude '*.log' \
  --exclude '.DS_Store' \
  -e '"ssh -o StrictHostKeyChecking=no"' \
  /Users/chetankumar/ecoloop/ \
  $SERVER:$APP_DIR/ | tail -5
ok "Files synced"

# ── Step 2: Build new images ────────────────────────────────────
step "Building Docker images (frontend + backend)..."
eval "$SSH" "cd $APP_DIR && docker compose build --no-cache frontend backend 2>&1 | grep -E '(Built|Error|error|DONE|Step)'" 
ok "Images built"

# ── Step 3: Restart app containers (DB & Redis stay running) ───
step "Restarting frontend + backend containers..."
eval "$SSH" "cd $APP_DIR && docker compose up -d --no-deps frontend backend"
ok "Containers restarted"

# ── Step 4: Wait and show status ───────────────────────────────
step "Waiting for health checks..."
sleep 15
eval "$SSH" "cd $APP_DIR && docker compose ps"

# ── Step 5: Verify live site ────────────────────────────────────
step "Verifying live site..."
sleep 3
FE=$(curl -sk -o /dev/null -w "%{http_code}" https://ecoloop.social/)
API=$(curl -sk -o /dev/null -w "%{http_code}" https://ecoloop.social/api/health)

echo ""
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅  Deploy Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo -e "  🌐 Frontend : https://ecoloop.social     [HTTP $FE]"
echo -e "  🔌 API      : https://ecoloop.social/api  [HTTP $API]"
echo -e "${GREEN}═══════════════════════════════════════════${NC}"

if [ "$FE" != "200" ] || [ "$API" != "200" ]; then
  warn "Something looks off. Check logs:"
  echo "  ssh root@31.97.226.6 'cd /opt/ecoloop && docker compose logs -f'"
fi
