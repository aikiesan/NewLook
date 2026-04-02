#!/bin/bash
# One-time VM setup script for pilar.cp2b.unicamp.br
# Run ONCE after cloning the repo on the VM.
# After this, use deploy-vm.sh for all future updates.
#
# Usage: bash setup-vm.sh
set -e

REPO_ROOT="/var/www/cp2b/repo/cp2b-workspace/NewLook"
BACKEND_DIR="$REPO_ROOT/backend"
FRONTEND_DIR="$REPO_ROOT/frontend"

echo "=== [1/6] Checking system dependencies ==="

check_cmd() {
    if ! command -v "$1" &>/dev/null; then
        echo "ERROR: $1 not found. Install with:"
        echo "  $2"
        exit 1
    fi
    echo "  OK: $1"
}

check_cmd python3.11 "sudo apt-get install python3.11 python3.11-venv python3.11-dev"
check_cmd gdal-config "sudo apt-get install gdal-bin libgdal-dev libpq-dev"
check_cmd node "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs"
check_cmd pm2 "npm install -g pm2"

GDAL_VERSION=$(gdal-config --version)
echo "  GDAL version: $GDAL_VERSION"

echo ""
echo "=== [2/6] Setting up Python virtual environment ==="
cd "$BACKEND_DIR"
python3.11 -m venv .venv
source .venv/bin/activate
pip install --quiet --upgrade pip
# GDAL pip version must match system GDAL
pip install --quiet "GDAL==$GDAL_VERSION"
pip install --quiet -r requirements.txt
echo "  Backend Python deps installed."

echo ""
echo "=== [3/6] Backend .env ==="
if [ ! -f "$BACKEND_DIR/.env" ]; then
    cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"
    # Set production defaults
    sed -i 's/APP_ENV=development/APP_ENV=production/' "$BACKEND_DIR/.env"
    sed -i 's/DEBUG=true/DEBUG=false/' "$BACKEND_DIR/.env"
    # Generate a random SECRET_KEY
    SECRET=$(openssl rand -hex 32)
    sed -i "s/SECRET_KEY=generate-with-openssl-rand-hex-32/SECRET_KEY=$SECRET/" "$BACKEND_DIR/.env"
    # Set PRODUCTION_ORIGINS
    sed -i 's|PRODUCTION_ORIGINS=.*|PRODUCTION_ORIGINS=https://pilar.cp2b.unicamp.br|' "$BACKEND_DIR/.env"
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
    sed -i 's|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=https://pilar.cp2b.unicamp.br/api|' "$FRONTEND_DIR/.env.local"
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
# Copy static assets for nginx direct serving
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public
echo "  Frontend built."

echo ""
echo "=== [6/6] Starting PM2 processes ==="
cd "$REPO_ROOT"
pm2 start ecosystem.config.js
pm2 save
pm2 startup | tail -1  # prints the command to run as root for boot persistence

echo ""
echo "=== Setup complete ==="
echo ""
echo "Next steps:"
echo "  1. If you see a 'pm2 startup' command above, run it as root."
echo "  2. Install nginx config:"
echo "     sudo cp $REPO_ROOT/nginx/pilar.cp2b.unicamp.br.conf /etc/nginx/sites-available/"
echo "     sudo ln -s /etc/nginx/sites-available/pilar.cp2b.unicamp.br.conf /etc/nginx/sites-enabled/"
echo "  3. Add DNS A record: pilar.cp2b.unicamp.br → $(curl -s ifconfig.me)"
echo "  4. Expand SSL cert (after DNS propagates):"
echo "     sudo certbot --expand -d cp2b.unicamp.br -d pilar.cp2b.unicamp.br"
echo "  5. Reload nginx:"
echo "     sudo nginx -t && sudo systemctl reload nginx"
echo ""
echo "Verify:"
echo "  curl -s -o /dev/null -w '%{http_code}' http://localhost:8001/health  # expect 200"
echo "  curl -s -o /dev/null -w '%{http_code}' http://localhost:3002          # expect 200"
