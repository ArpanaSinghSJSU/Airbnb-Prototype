#!/bin/bash

echo "🚀 Airbnb Backend Setup Script"
echo "================================"
echo ""

# Check if MySQL is running
echo "1. Checking MySQL connection..."
if mysql -u root -proot -e "SELECT 1" > /dev/null 2>&1; then
    echo "   ✅ MySQL is running"
else
    echo "   ❌ MySQL is not running or password is incorrect"
    echo "   Please start MySQL and update DB_PASSWORD in .env file"
    echo ""
    echo "   To start MySQL:"
    echo "   - brew services start mysql"
    echo "   - or: mysql.server start"
    exit 1
fi

# Initialize database
echo ""
echo "2. Initializing database..."
mysql -u root -proot < init-db.sql 2>/dev/null
if [ $? -eq 0 ]; then
    echo "   ✅ Database initialized with sample data"
else
    echo "   ⚠️  Database initialization had warnings (may already exist)"
fi

# Check if node_modules exists
echo ""
echo "3. Checking Node.js dependencies..."
if [ -d "node_modules" ]; then
    echo "   ✅ Dependencies installed"
else
    echo "   📦 Installing dependencies..."
    npm install
fi

echo ""
echo "================================"
echo "✅ Setup Complete!"
echo ""
echo "To start the server:"
echo "  npm run dev    (development with auto-restart)"
echo "  npm start      (production mode)"
echo ""
echo "Server will run on: http://localhost:5002"
echo "API Base URL: http://localhost:5002/api"
echo ""

