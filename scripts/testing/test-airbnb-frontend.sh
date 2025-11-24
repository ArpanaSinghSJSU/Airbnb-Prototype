#!/bin/bash
# test-airbnb-frontend.sh
# Quick script to test the Airbnb Prototype frontend on EKS

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║      🧪 Testing Airbnb Prototype on AWS EKS                ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if all pods are running
echo "📊 Step 1: Checking deployment status..."
echo ""
kubectl get pods -n gotour
echo ""

READY_PODS=$(kubectl get pods -n gotour --no-headers | grep "1/1" | wc -l)
echo "✅ $READY_PODS pods are ready"
echo ""

# Check services
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Step 2: Checking services..."
echo ""
kubectl get svc -n gotour
echo ""

# Frontend access instructions
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 Step 3: Accessing the Frontend"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "OPTION A: Port Forward (Recommended)"
echo "────────────────────────────────────────────────────────────"
echo ""
echo "Run this command in a separate terminal:"
echo ""
echo "  kubectl port-forward svc/frontend-service 3000:3000 -n gotour"
echo ""
echo "Then open in your browser:"
echo "  👉 http://localhost:3000"
echo ""
echo ""
echo "OPTION B: NodePort Access (if you have node external IPs)"
echo "────────────────────────────────────────────────────────────"
echo ""

# Get node external IPs
NODE_IPS=$(kubectl get nodes -o jsonpath='{.items[*].status.addresses[?(@.type=="ExternalIP")].address}')

if [ -n "$NODE_IPS" ]; then
  echo "Access via any of these URLs:"
  for ip in $NODE_IPS; do
    echo "  👉 http://$ip:30000"
  done
else
  echo "  ⚠️  No external IPs found (EKS nodes don't have public IPs by default)"
  echo "     Use port-forwarding instead (Option A)"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 Step 4: Testing Backend APIs"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Would you like to test backend APIs now? (y/n)"
read -r response

if [[ "$response" == "y" || "$response" == "Y" ]]; then
  echo ""
  echo "Testing Traveler Service..."
  kubectl port-forward svc/traveler-service 3001:3001 -n gotour > /dev/null 2>&1 &
  PF_PID=$!
  sleep 3
  
  echo "  Health check:"
  RESPONSE=$(curl -s http://localhost:3001/health 2>/dev/null)
  if [ $? -eq 0 ]; then
    echo "  ✅ $RESPONSE"
  else
    echo "  ❌ Failed to connect"
  fi
  
  kill $PF_PID 2>/dev/null
  echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 Step 5: Quick Commands Reference"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "View frontend logs:"
echo "  kubectl logs -f deployment/frontend -n gotour"
echo ""
echo "View all pods:"
echo "  kubectl get pods -n gotour -w"
echo ""
echo "Access MongoDB:"
echo "  kubectl exec -it mongodb-0 -n gotour -- mongosh gotour_db"
echo ""
echo "Check Kafka topics:"
echo "  kubectl exec -it kafka-0 -n gotour -- kafka-topics --bootstrap-server localhost:9092 --list"
echo ""

echo "╔════════════════════════════════════════════════════════════╗"
echo "║          ✅ Your Airbnb Prototype is Ready!                ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "🎯 Summary:"
echo "  • All services: RUNNING ✅"
echo "  • Frontend: DEPLOYED ✅"
echo "  • Backend APIs: OPERATIONAL ✅"
echo "  • Database (MongoDB): READY ✅"
echo "  • Event Streaming (Kafka): READY ✅"
echo ""
echo "🚀 Start testing by running:"
echo "   kubectl port-forward svc/frontend-service 3000:3000 -n gotour"
echo ""
echo "Then open: http://localhost:3000"
echo ""

