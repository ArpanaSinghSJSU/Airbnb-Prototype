#!/bin/bash

# Cleanup Duplicate Code After Microservices Migration
# This script removes old monolithic code that has been migrated to microservices

echo "🧹 Cleaning Up Duplicate Code After Microservices Migration"
echo "============================================================"
echo ""

BASE_DIR="/Users/pankakumar/Desktop/MyWorkspace/personal/arpana/Airbnb-Prototype"
cd "$BASE_DIR"

# Create backup directory
BACKUP_DIR="${BASE_DIR}/backup_$(date +%Y%m%d_%H%M%S)"
echo "📦 Creating backup at: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# Function to safely move files to backup
backup_and_remove() {
    local item=$1
    if [ -e "$item" ]; then
        echo "  → Moving $item to backup"
        mv "$item" "$BACKUP_DIR/"
    fi
}

echo ""
echo "🗑️  Removing Old Monolithic Backend Files:"
echo "-------------------------------------------"

# Old controllers (now in microservices)
echo "Cleaning up controllers/"
backup_and_remove "controllers"

# Old routes (now in microservices)
echo "Cleaning up routes/"
backup_and_remove "routes"

# Old middleware (now in microservices)
echo "Cleaning up middleware/"
backup_and_remove "middleware"

# Old models (now in microservices)
echo "Cleaning up models/"
backup_and_remove "models"

# Old config (now in microservices as utils/db.js)
echo "Cleaning up config/"
backup_and_remove "config"

# Old monolithic server
echo "Cleaning up server.js"
backup_and_remove "server.js"

# Old monolithic package files
echo "Cleaning up root package.json and package-lock.json"
backup_and_remove "package.json"
backup_and_remove "package-lock.json"

# Old node_modules (microservices have their own)
echo "Cleaning up root node_modules/"
backup_and_remove "node_modules"

# Old utils (if not needed)
echo "Cleaning up utils/"
backup_and_remove "utils"

# Old session-based auth (replaced by JWT)
backup_and_remove "middleware/auth.js"

# Old MySQL files (now using MongoDB)
echo "Cleaning up MySQL-related files"
backup_and_remove "init-db.sql"

echo ""
echo "📋 Files/Directories Removed (backed up):"
echo "------------------------------------------"
ls -la "$BACKUP_DIR/"

echo ""
echo "✅ Cleanup Complete!"
echo ""
echo "📁 Current Structure:"
echo "--------------------"
echo "✅ services/          - All microservices (traveler, owner, property, booking, ai-agent)"
echo "✅ frontend/          - React frontend application"
echo "✅ uploads/           - Shared upload directory"
echo "✅ *.md               - Documentation files"
echo "✅ docker-compose.yml - Docker orchestration"
echo "✅ *.sh               - Setup and utility scripts"
echo "✅ mongo-init.js      - MongoDB initialization"
echo "✅ seed-mongo.js      - MongoDB seed data"
echo ""
echo "🔍 What Was Removed (and backed up):"
echo "------------------------------------"
echo "❌ controllers/       - Moved to services/*/src/controllers/"
echo "❌ routes/            - Moved to services/*/src/routes/"
echo "❌ middleware/        - Moved to services/*/src/middleware/"
echo "❌ models/            - Moved to services/*/src/models/"
echo "❌ config/            - Replaced by services/*/src/utils/db.js"
echo "❌ server.js          - Replaced by services/*/server.js"
echo "❌ package.json       - Each service has its own"
echo "❌ node_modules/      - Each service has its own"
echo "❌ init-db.sql        - Replaced by mongo-init.js"
echo ""
echo "💡 Backup Location:"
echo "   $BACKUP_DIR"
echo ""
echo "   If you need to restore any files, they are safely stored in this backup directory."
echo "   You can delete the backup after verifying everything works correctly."
echo ""

