#!/bin/bash

# Fresh Start Script - Clear all caches and restart
set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   🧹 FRESH START - Clearing All Caches                    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Get the project root directory (2 levels up from this script)
PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$PROJECT_ROOT"

echo "📂 Project root: $PROJECT_ROOT"
echo ""

# Step 1: Create frontend/.env
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 Step 1: Creating frontend/.env file..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cat > frontend/.env << 'ENDOFENV'
REACT_APP_TRAVELER_SERVICE_URL=http://localhost:3001
REACT_APP_OWNER_SERVICE_URL=http://localhost:3002
REACT_APP_PROPERTY_SERVICE_URL=http://localhost:3003
REACT_APP_BOOKING_SERVICE_URL=http://localhost:3004
REACT_APP_AI_AGENT_URL=http://localhost:8000
ENDOFENV

if [ -f "frontend/.env" ]; then
  echo "✅ Created frontend/.env"
  echo ""
  echo "Contents:"
  cat frontend/.env
  echo ""
else
  echo "❌ Failed to create frontend/.env"
  exit 1
fi

# Step 2: Clear React build cache
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧹 Step 2: Clearing React build cache..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -d "frontend/node_modules/.cache" ]; then
  rm -rf frontend/node_modules/.cache
  echo "✅ Cleared frontend/node_modules/.cache"
else
  echo "ℹ️  No cache directory found (already clean)"
fi

if [ -d "frontend/build" ]; then
  rm -rf frontend/build
  echo "✅ Cleared frontend/build"
else
  echo "ℹ️  No build directory found (already clean)"
fi

echo ""

# Step 3: Instructions for user
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 3: Manual Browser Steps Required!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  BEFORE starting services, clear your browser:"
echo ""
echo "1. Open DevTools (F12)"
echo "2. Right-click refresh button → 'Empty Cache and Hard Reload'"
echo "3. Go to Application tab → Local Storage → Clear All"
echo "4. Also clear Session Storage"
echo ""
echo "OR"
echo ""
echo "1. Press Cmd+Shift+Delete (Mac) or Ctrl+Shift+Delete (Windows)"
echo "2. Select 'All time'"
echo "3. Check: Cookies, Cache, Site data"
echo "4. Click 'Clear data'"
echo ""

read -p "Press ENTER when you've cleared browser cache and storage..."

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Cleanup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🚀 Next Steps:"
echo ""
echo "1. Start backend (in one terminal):"
echo "   make server"
echo ""
echo "2. Start frontend (in another terminal):"
echo "   npm start --prefix frontend"
echo ""
echo "3. Visit: http://localhost:3000"
echo ""
echo "4. You should see 12 properties on the home page! 🎉"
echo ""
echo "5. Test login with:"
echo "   📧 john.traveler@example.com"
echo "   🔑 password123"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

