#!/bin/bash
# Deploy script for pilar2b.cp2b.unicamp.br
# Run this after every merge to main to update and restart both services.
# Mirrors the existing cp2b deploy workflow.
#
# Usage: bash deploy-vm.sh
set -e

REPO_ROOT="/var/www/pilar2b/repo/cp2b-workspace/NewLook"
BACKEND_DIR="$REPO_ROOT/backend"
FRONTEND_DIR="$REPO_ROOT/frontend"

echo "=== [1/4] Pulling latest code ==="
cd /var/www/pilar2b/repo
git pull origin main

echo ""
echo "=== [2/4] Backend update ==="
cd "$BACKEND_DIR"
source .venv/bin/activate
pip install --quiet -r requirements.txt
pm2 restart pilar-backend
pm2 save
echo "  Backend restarted."

echo ""
echo "=== [3/4] Frontend rebuild ==="
cd "$FRONTEND_DIR"
npm install --silent
npm run build
# Refresh static assets in standalone dir
cp -r .next/static   .next/standalone/.next/static
cp -r public         .next/standalone/public
pm2 restart pilar-frontend
pm2 save
echo "  Frontend rebuilt and restarted."

echo ""
echo "=== [4/4] Verify ==="
sleep 3
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8001/health)
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3002)

echo "  Backend  (localhost:8001/health): $BACKEND_STATUS"
echo "  Frontend (localhost:3002):        $FRONTEND_STATUS"

if [ "$BACKEND_STATUS" = "200" ] && [ "$FRONTEND_STATUS" = "200" ]; then
    echo ""
    echo "Deploy successful. https://pilar2b.cp2b.unicamp.br is live."
else
    echo ""
    echo "WARNING: One or more services may not be healthy. Check with:"
    echo "  pm2 logs pilar-backend --lines 30"
    echo "  pm2 logs pilar-frontend --lines 30"
    exit 1
fi
