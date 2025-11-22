#!/bin/bash

# Script to create all microservices structure
# This automates the creation of owner, property, and booking services

set -e

echo "🚀 Creating Microservices Architecture..."
echo "=========================================="

BASE_DIR="/Users/pankakumar/Desktop/MyWorkspace/personal/arpana/Airbnb-Prototype"
cd "$BASE_DIR"

# Copy shared utilities to all services
echo "📦 Copying shared utilities..."

for service in owner-service property-service booking-service; do
    echo "  → $service"
    mkdir -p "services/$service/src"/{routes,controllers,middleware,models,utils}
    
    # Copy models
    cp -r models/* "services/$service/src/models/" 2>/dev/null || true
    
    # Copy upload middleware
    cp middleware/upload.js "services/$service/src/middleware/" 2>/dev/null || true
    
    # Copy db utility
    cp "services/traveler-service/src/utils/db.js" "services/$service/src/utils/"
done

echo "✅ Shared utilities copied to all services"
echo ""

# Copy controllers to respective services
echo "📋 Copying controllers..."
cp controllers/ownerController.js services/owner-service/src/controllers/
cp controllers/propertyController.js services/property-service/src/controllers/
cp controllers/favoriteController.js services/property-service/src/controllers/
cp controllers/bookingController.js services/booking-service/src/controllers/

echo "✅ Controllers copied"
echo ""

# Copy routes
echo "🛣️  Copying routes..."
cp routes/ownerRoutes.js services/owner-service/src/routes/
cp routes/propertyRoutes.js services/property-service/src/routes/
cp routes/favoriteRoutes.js services/property-service/src/routes/
cp routes/bookingRoutes.js services/booking-service/src/routes/

echo "✅ Routes copied"
echo ""

echo "🎉 Microservices structure created!"
echo "Next steps:"
echo "1. Create server.js for each service"
echo "2. Create package.json for each service"
echo "3. Create Dockerfiles"
echo "4. Update docker-compose.yml"

