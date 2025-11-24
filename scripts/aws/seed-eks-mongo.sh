#!/bin/bash
# seed-eks-mongo.sh
# Seeds MongoDB running in EKS cluster via port-forwarding

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════════╗"
echo "║          📊 Seeding MongoDB on AWS EKS                     ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Configuration
NAMESPACE="gotour"
MONGODB_POD="mongodb-0"
LOCAL_PORT="27017"
MONGODB_URI="mongodb://admin:admin123@localhost:${LOCAL_PORT}/gotour_db?authSource=admin"

# Function to clean up port-forward on exit
cleanup() {
    echo ""
    echo "🧹 Cleaning up..."
    if [ ! -z "$PORT_FORWARD_PID" ]; then
        kill $PORT_FORWARD_PID 2>/dev/null || true
        echo "✅ Port-forward stopped"
    fi
}

# Set trap to cleanup on script exit
trap cleanup EXIT INT TERM

# Step 1: Check if MongoDB pod is running
echo "1️⃣  Checking MongoDB pod..."
if ! kubectl get pod $MONGODB_POD -n $NAMESPACE &> /dev/null; then
    echo "❌ Error: MongoDB pod '$MONGODB_POD' not found in namespace '$NAMESPACE'"
    exit 1
fi

POD_STATUS=$(kubectl get pod $MONGODB_POD -n $NAMESPACE -o jsonpath='{.status.phase}')
if [ "$POD_STATUS" != "Running" ]; then
    echo "❌ Error: MongoDB pod is not running (status: $POD_STATUS)"
    exit 1
fi
echo "   ✅ MongoDB pod is running"
echo ""

# Step 2: Check if port is already in use
echo "2️⃣  Checking if port $LOCAL_PORT is available..."
if lsof -Pi :$LOCAL_PORT -sTCP:LISTEN -t &> /dev/null; then
    echo "   ⚠️  Port $LOCAL_PORT is already in use"
    echo "   Attempting to use it anyway (might be an existing port-forward)"
    SKIP_PORT_FORWARD=true
else
    echo "   ✅ Port $LOCAL_PORT is available"
    SKIP_PORT_FORWARD=false
fi
echo ""

# Step 3: Start port-forwarding if needed
if [ "$SKIP_PORT_FORWARD" = false ]; then
    echo "3️⃣  Starting port-forward to MongoDB..."
    kubectl port-forward $MONGODB_POD $LOCAL_PORT:27017 -n $NAMESPACE > /dev/null 2>&1 &
    PORT_FORWARD_PID=$!
    echo "   ✅ Port-forward started (PID: $PORT_FORWARD_PID)"
    echo "   ⏳ Waiting for port-forward to be ready..."
    
    # Wait for port to be ready (max 10 seconds)
    for i in {1..10}; do
        if lsof -Pi :$LOCAL_PORT -sTCP:LISTEN -t &> /dev/null; then
            echo "   ✅ Port-forward is ready!"
            break
        fi
        if [ $i -eq 10 ]; then
            echo "   ❌ Port-forward failed to start"
            exit 1
        fi
        sleep 1
    done
else
    echo "3️⃣  Using existing port-forward connection..."
fi
echo ""

# Step 4: Check MongoDB connection
echo "4️⃣  Testing MongoDB connection..."
if ! node -e "
const mongoose = require('mongoose');
mongoose.connect('$MONGODB_URI', { serverSelectionTimeoutMS: 5000 })
  .then(() => { console.log('   ✅ MongoDB connection successful'); mongoose.connection.close(); process.exit(0); })
  .catch((err) => { console.error('   ❌ MongoDB connection failed:', err.message); process.exit(1); });
" 2>&1; then
    echo "❌ Cannot connect to MongoDB. Please check the connection."
    exit 1
fi
echo ""

# Step 5: Check current data
echo "5️⃣  Checking current MongoDB data..."
CURRENT_USERS=$(kubectl exec $MONGODB_POD -n $NAMESPACE -- mongosh gotour_db -u admin -p admin123 --authenticationDatabase admin --eval "db.users.countDocuments()" --quiet 2>/dev/null | tail -1)
echo "   📊 Current users in database: $CURRENT_USERS"
echo ""

# Step 6: Run seed script
echo "6️⃣  Running seed script..."
echo "   📂 Executing: node seed-mongo.js"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

MONGODB_URI="$MONGODB_URI" node seed-mongo.js

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 7: Verify seeded data
echo "7️⃣  Verifying seeded data..."
NEW_USER_COUNT=$(kubectl exec $MONGODB_POD -n $NAMESPACE -- mongosh gotour_db -u admin -p admin123 --authenticationDatabase admin --eval "db.users.countDocuments()" --quiet 2>/dev/null | tail -1)
PROPERTY_COUNT=$(kubectl exec $MONGODB_POD -n $NAMESPACE -- mongosh gotour_db -u admin -p admin123 --authenticationDatabase admin --eval "db.properties.countDocuments()" --quiet 2>/dev/null | tail -1)
BOOKING_COUNT=$(kubectl exec $MONGODB_POD -n $NAMESPACE -- mongosh gotour_db -u admin -p admin123 --authenticationDatabase admin --eval "db.bookings.countDocuments()" --quiet 2>/dev/null | tail -1)

echo "   ✅ Users: $NEW_USER_COUNT"
echo "   ✅ Properties: $PROPERTY_COUNT"
echo "   ✅ Bookings: $BOOKING_COUNT"
echo ""

echo "╔════════════════════════════════════════════════════════════╗"
echo "║              ✅ MongoDB Seeding Complete!                  ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "🎉 Your AWS EKS MongoDB now has test data!"
echo ""
echo "📋 Test credentials available in: TEST_CREDENTIALS.md"
echo ""
echo "🌐 Login at: http://a5ccdc9e4f8d14f2e9c6206ce988e1b1-1032854876.us-east-1.elb.amazonaws.com:3000/login"
echo ""

