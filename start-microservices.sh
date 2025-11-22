#!/bin/bash

# Start all microservices using Docker Compose
# Phase 3: Microservices Architecture

set -e

echo "🚀 Starting Microservices Architecture"
echo "========================================"
echo ""

BASE_DIR="/Users/pankakumar/Desktop/MyWorkspace/personal/arpana/Airbnb-Prototype"
cd "$BASE_DIR"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Docker is running
echo "📦 Checking Docker..."
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running!${NC}"
    echo ""
    echo "Please start Docker Desktop and try again."
    exit 1
fi
echo -e "${GREEN}✅ Docker is running${NC}"
echo ""

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down 2>/dev/null || true
echo ""

# Build and start all services
echo "🏗️  Building and starting all microservices..."
echo ""
docker-compose up --build -d

# Wait for services to be healthy
echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 5

# Check health of each service
echo ""
echo "🏥 Health Check Status:"
echo "======================="

services=("traveler-service:3001" "owner-service:3002" "property-service:3003" "booking-service:3004" "ai-agent:8000")

for service in "${services[@]}"; do
    name="${service%%:*}"
    port="${service##*:}"
    
    if curl -s "http://localhost:$port/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $name${NC} - http://localhost:$port"
    else
        echo -e "${YELLOW}⏳ $name${NC} - Starting..."
    fi
done

# Show MongoDB status
if docker ps | grep -q gotour-mongodb; then
    echo -e "${GREEN}✅ MongoDB${NC} - mongodb://localhost:27017"
    echo -e "${GREEN}✅ Mongo Express${NC} - http://localhost:8081 (admin/admin123)"
else
    echo -e "${RED}❌ MongoDB${NC} - Not running"
fi

echo ""
echo "========================================"
echo -e "${GREEN}✅ Microservices Started!${NC}"
echo "========================================"
echo ""
echo "📊 Service URLs:"
echo "  Traveler Service:  http://localhost:3001"
echo "  Owner Service:     http://localhost:3002"
echo "  Property Service:  http://localhost:3003"
echo "  Booking Service:   http://localhost:3004"
echo "  AI Agent:          http://localhost:8000"
echo ""
echo "💾 Database:"
echo "  MongoDB:          mongodb://localhost:27017"
echo "  Mongo Express:    http://localhost:8081 (admin/admin123)"
echo ""
echo "🧪 Test Commands:"
echo "  # Health checks"
echo "  curl http://localhost:3001/health  # Traveler"
echo "  curl http://localhost:3002/health  # Owner"
echo "  curl http://localhost:3003/health  # Property"
echo "  curl http://localhost:3004/health  # Booking"
echo ""
echo "  # View logs"
echo "  docker-compose logs -f traveler-service"
echo "  docker-compose logs -f"
echo ""
echo "  # Stop all services"
echo "  docker-compose down"
echo ""
echo "📚 Documentation: See PHASE3_COMPLETE.md"
echo ""
echo "🎉 Ready to test microservices architecture!"

