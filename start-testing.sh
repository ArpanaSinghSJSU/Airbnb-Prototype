#!/bin/bash

# Redux Integration Testing Script
# This script helps you start all necessary services for testing

set -e

echo "🚀 Starting Redux Integration Testing Environment"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is running
echo "📦 Checking Docker..."
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running!${NC}"
    echo ""
    echo "Please start Docker Desktop and wait for it to fully start."
    echo "Then run this script again."
    echo ""
    echo "On Mac: Open Docker Desktop from Applications"
    exit 1
fi
echo -e "${GREEN}✅ Docker is running${NC}"
echo ""

# Start MongoDB
echo "🗄️  Starting MongoDB..."
docker-compose up -d mongodb

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to be ready..."
sleep 3

# Check if MongoDB is running
if docker ps | grep -q gotour-mongodb; then
    echo -e "${GREEN}✅ MongoDB is running${NC}"
else
    echo -e "${RED}❌ MongoDB failed to start${NC}"
    exit 1
fi
echo ""

# Check if backend dependencies are installed
echo "📚 Checking backend dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi
echo -e "${GREEN}✅ Backend dependencies ready${NC}"
echo ""

# Check if frontend dependencies are installed
echo "📚 Checking frontend dependencies..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi
cd ..
echo -e "${GREEN}✅ Frontend dependencies ready${NC}"
echo ""

# Check .env file
echo "🔧 Checking environment configuration..."
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  No .env file found. Creating from template...${NC}"
    cp env.template .env
    echo -e "${GREEN}✅ .env file created${NC}"
else
    echo -e "${GREEN}✅ .env file exists${NC}"
fi
echo ""

# Display instructions
echo ""
echo "=================================================="
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo "=================================================="
echo ""
echo "Next steps:"
echo ""
echo -e "${YELLOW}1. Start the Backend Server:${NC}"
echo "   Open a new terminal and run:"
echo "   cd $(pwd)"
echo "   node server.js"
echo ""
echo -e "${YELLOW}2. Start the Frontend:${NC}"
echo "   Open another new terminal and run:"
echo "   cd $(pwd)/frontend"
echo "   npm start"
echo ""
echo -e "${YELLOW}3. Open Browser:${NC}"
echo "   Navigate to: http://localhost:3000"
echo ""
echo -e "${YELLOW}4. Test Login:${NC}"
echo "   Traveler: jane@example.com / password123"
echo "   Owner: john@example.com / password123"
echo ""
echo -e "${YELLOW}5. Open Redux DevTools:${NC}"
echo "   Press F12 → Click 'Redux' tab"
echo "   Watch actions and state changes in real-time!"
echo ""
echo "📖 For detailed testing instructions, see:"
echo "   TESTING_GUIDE.md"
echo ""
echo "🎉 Happy Testing!"
echo ""

