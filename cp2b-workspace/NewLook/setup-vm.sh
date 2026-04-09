#!/bin/bash
# One-time VM setup script for pilar2b.cp2b.unicamp.br
# Run ONCE after cloning the repo on the VM (as user lucas, with sudo available).
# After this, use deploy-vm.sh for all future updates.
#
# Usage: bash setup-vm.sh
set -e

REPO_ROOT="/var/www/cp2b/repo/cp2b-workspace/NewLook"
BACKEND_DIR="$REPO_ROOT/backend"
FRONTEND_DIR="$REPO_ROOT/frontend"
DOMAIN="pilar2b.cp2b.unicamp.br"

echo "=== [1/6] Checking system dependencies ==="

check_cmd() {
    if ! command -v "$1" &>/dev/null; then
        echo "ERROR: $1 not found. Install with:"
        echo "  $2"
        exit 1
    fi
    echo "  OK: $1"
}

check_cmd python3   "sudo apt-get install python3 python3-venv python3-dev"
check_cmd pip3      "sudo apt-get install python3-pip"
check_cmd gdal-config "sudo apt-get install gdal-bin libgdal-dev"
check_cmd node      "# already installed (v20)"
check_cmd pm2       "npm install -g pm2"

GDAL_VERSION=$(gdal-config --version)
echo "  GDAL version: $GDAL_VERSION  (pip will use this exact version)"

echo ""
echo "=== [2/6] Setting up Python virtual environment ==="
cd "$BACKEND_DIR"
python3 -m venv .venv
source .venv/bin/activate
pip install --quiet --upgrade pip

# GDAL pip package must match system GDAL exactly or geopandas/fiona fail to import
pip install --quiet "GDAL==$GDAL_VERSION"
pip install --quiet -r requirements.txt
echo "  Backend Python deps installed."

echo ""
echo "=== [3/6] Backend .env ==="
if [ ! -f "$BACKEND_DIR/.env" ]; then
    cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"
    sed -i 's/APP_ENV=development/APP_ENV=production/' "$BACKEND_DIR/.env"
    sed -i 's/DEBUG=true/DEBUG=false/' "$BACKEND_DIR/.env"
    SECRET=$(openssl rand -hex 32)
    sed -i "s/SECRET_KEY=generate-with-openssl-rand-hex-32/SECRET_KEY=$SECRET/" "$BACKEND_DIR/.env"
    sed -i "s|PRODUCTION_ORIGINS=.*|PRODUCTION_ORIGINS=https://$DOMAIN|" "$BACKEND_DIR/.env"
    echo "  Created $BACKEND_DIR/.env"
    echo "  ACTION REQUIRED: Edit $BACKEND_DIR/.env and fill in:"
    echo "    - DATABASE_URL"
    echo "    - SUPABASE_URL"
    echo "    - SUPABASE_ANON_KEY"
    echo "    - SUPABASE_SERVICE_ROLE_KEY"
else
    echo "  .env already exists, skipping."
fi

echo ""
echo "=== [4/6] Frontend .env.local ==="
if [ ! -f "$FRONTEND_DIR/.env.local" ]; then
    cp "$FRONTEND_DIR/.env.example" "$FRONTEND_DIR/.env.local"
    sed -i "s|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=https://$DOMAIN/api|" "$FRONTEND_DIR/.env.local"
    echo "  Created $FRONTEND_DIR/.env.local"
    echo "  ACTION REQUIRED: Edit $FRONTEND_DIR/.env.local and fill in:"
    echo "    - NEXT_PUBLIC_SUPABASE_URL"
    echo "    - NEXT_PUBLIC_SUPABASE_ANON_KEY"
else
    echo "  .env.local already exists, skipping."
fi

echo ""
echo "=== [5/6] Building frontend ==="
cd "$FRONTEND_DIR"
npm install --silent
npm run build
# Copy static assets into standalone dir (required for Next.js standalone output)
cp -r .next/static   .next/standalone/.next/static
cp -r public         .next/standalone/public
echo "  Frontend built."

echo ""
echo "=== [6/6] Starting PM2 processes ==="
cd "$REPO_ROOT"
pm2 start ecosystem.config.js
pm2 save

echo ""
echo "  Run the following command as root to enable PM2 on boot:"
pm2 startup systemd -u lucas --hp /home/lucas 2>/dev/null | grep "sudo" || \
    echo "  (run 'pm2 startup' manually to get the exact command)"

echo ""
echo "=== Setup complete ==="
echo ""
echo "Remaining steps:"
echo ""
echo "  1. Fill in the .env files:"
echo "       nano $BACKEND_DIR/.env"
echo "       nano $FRONTEND_DIR/.env.local"
echo ""
echo "  2. Install the Apache VirtualHost (already done if you ran the manual step):"
echo "       sudo cp $REPO_ROOT/apache/pilar2b.conf /etc/apache2/sites-available/"
echo "       sudo a2enmod headers"
echo "       sudo a2ensite pilar2b.conf"
echo "       sudo apache2ctl configtest && sudo systemctl reload apache2"
echo ""
echo "  3. Ask Unicamp IT to create the subdomain and proxy to this VM:"
echo "       Subdomain: $DOMAIN"
echo "       Target:    10.100.0.104:80  (same as cp2b.unicamp.br)"
echo "       SSL:       managed at Unicamp edge (no cert needed on this VM)"
echo ""
echo "Verify once DNS is live:"
echo "  curl -s -o /dev/null -w '%{http_code}' http://localhost:8001/health  # expect 200"
echo "  curl -s -o /dev/null -w '%{http_code}' http://localhost:3002          # expect 200"
