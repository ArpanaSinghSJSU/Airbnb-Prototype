# Testing Airbnb Prototype on AWS EKS

## 🎯 Overview

This guide shows you how to test your Airbnb microservices deployed on AWS EKS.

**Current Status:**
- ✅ 8/8 Backend Services: FULLY OPERATIONAL
- ❌ Frontend: Not deployed (optional for Lab 2)

---

## 📋 Quick Status Check

```bash
# Check all pods
kubectl get pods -n gotour

# Check services
kubectl get svc -n gotour

# Expected output: All pods should show 1/1 READY
```

---

## 🔧 Method 1: Port Forwarding (Easiest for Testing)

### Step 1: Forward a Service Port

```bash
# Forward traveler service to your local machine
kubectl port-forward svc/traveler-service 3001:3001 -n gotour

# Keep this terminal open, open a new terminal for testing
```

### Step 2: Test the API

In a **new terminal**:

```bash
# Health check
curl http://localhost:3001/health

# Example API calls
curl http://localhost:3001/api/travelers

# With authentication (if needed)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Test All Services

```bash
# Traveler Service (3001)
kubectl port-forward svc/traveler-service 3001:3001 -n gotour &
curl http://localhost:3001/health

# Owner Service (3002)
kubectl port-forward svc/owner-service 3002:3002 -n gotour &
curl http://localhost:3002/health

# Property Service (3003)
kubectl port-forward svc/property-service 3003:3003 -n gotour &
curl http://localhost:3003/health

# Booking Service (3004)
kubectl port-forward svc/booking-service 3004:3004 -n gotour &
curl http://localhost:3004/health

# AI Agent Service (8000)
kubectl port-forward svc/ai-agent-service 8000:8000 -n gotour &
curl http://localhost:8000/health
```

**To stop port-forwards:**
```bash
# Kill all port-forward processes
pkill -f "port-forward"
```

---

## 🌐 Method 2: LoadBalancer / Ingress (External Access)

### Check if LoadBalancer is Available

```bash
kubectl get svc -n gotour
# Look for EXTERNAL-IP on frontend-service or ingress
```

### Option A: Expose via LoadBalancer

```bash
# Expose traveler service via LoadBalancer
kubectl expose deployment traveler-service \
  --type=LoadBalancer \
  --name=traveler-lb \
  --port=80 \
  --target-port=3001 \
  -n gotour

# Wait for EXTERNAL-IP (takes 2-3 minutes)
kubectl get svc traveler-lb -n gotour -w

# Once you have EXTERNAL-IP:
EXTERNAL_IP=$(kubectl get svc traveler-lb -n gotour -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
echo "Service URL: http://$EXTERNAL_IP"
curl http://$EXTERNAL_IP/health
```

### Option B: Use Existing Ingress

```bash
# Check ingress status
kubectl get ingress -n gotour

# Get ingress URL
kubectl get ingress gotour-ingress -n gotour \
  -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'

# Test via ingress (if configured)
curl http://<INGRESS-URL>/api/travelers
```

---

## 🧪 Method 3: Exec into Pods (Internal Testing)

### Test MongoDB Connection

```bash
# Connect to MongoDB
kubectl exec -it mongodb-0 -n gotour -- mongosh gotour_db

# Inside mongosh:
show collections
db.users.find().limit(5)
db.properties.find().limit(5)
exit
```

### Test Kafka

```bash
# List Kafka topics
kubectl exec -it kafka-0 -n gotour -- \
  kafka-topics --bootstrap-server localhost:9092 --list

# Create a test topic
kubectl exec -it kafka-0 -n gotour -- \
  kafka-topics --bootstrap-server localhost:9092 \
  --create --topic booking-events --partitions 3 --replication-factor 1

# Produce a test message
kubectl exec -it kafka-0 -n gotour -- bash -c \
  "echo 'test message' | kafka-console-producer --bootstrap-server localhost:9092 --topic booking-events"

# Consume messages
kubectl exec -it kafka-0 -n gotour -- \
  kafka-console-consumer --bootstrap-server localhost:9092 \
  --topic booking-events --from-beginning --max-messages 1
```

### Test Service-to-Service Communication

```bash
# Exec into a service pod
kubectl exec -it deployment/traveler-service -n gotour -- sh

# Inside the pod, test other services:
curl http://property-service:3003/health
curl http://booking-service:3004/health
curl http://mongodb-service:27017  # Should connect
exit
```

---

## 📊 Method 4: Comprehensive API Testing

### 1. User Registration & Authentication

```bash
# Port forward traveler service
kubectl port-forward svc/traveler-service 3001:3001 -n gotour &

# Register a new user
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test123!",
    "role": "traveler"
  }'

# Login
TOKEN=$(curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }' | jq -r '.token')

echo "JWT Token: $TOKEN"
```

### 2. Property Management

```bash
# Port forward property service
kubectl port-forward svc/property-service 3003:3003 -n gotour &

# Get all properties
curl http://localhost:3003/api/properties

# Get specific property
curl http://localhost:3003/api/properties/<property-id>

# Search properties (authenticated)
curl http://localhost:3003/api/properties/search?city=Boston \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Booking Flow

```bash
# Port forward booking service
kubectl port-forward svc/booking-service 3004:3004 -n gotour &

# Create a booking
curl -X POST http://localhost:3004/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "propertyId": "<property-id>",
    "checkIn": "2025-12-01",
    "checkOut": "2025-12-05",
    "guests": 2
  }'

# Get user bookings
curl http://localhost:3004/api/bookings/user \
  -H "Authorization: Bearer $TOKEN"
```

### 4. AI Agent Integration

```bash
# Port forward AI agent
kubectl port-forward svc/ai-agent-service 8000:8000 -n gotour &

# Get recommendations
curl -X POST http://localhost:8000/api/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "<user-id>",
    "preferences": {
      "location": "Boston",
      "priceRange": [100, 300],
      "amenities": ["wifi", "parking"]
    }
  }'
```

---

## 🔍 Method 5: Logs & Monitoring

### View Service Logs

```bash
# Real-time logs from a service
kubectl logs -f deployment/traveler-service -n gotour

# Last 100 lines
kubectl logs --tail=100 deployment/booking-service -n gotour

# Logs from all pods of a deployment
kubectl logs -l app=property-service -n gotour --all-containers=true

# Logs with timestamps
kubectl logs deployment/owner-service -n gotour --timestamps=true
```

### Monitor Resource Usage

```bash
# Node resource usage
kubectl top nodes

# Pod resource usage
kubectl top pods -n gotour

# Detailed pod info
kubectl describe pod <pod-name> -n gotour
```

### Check Events

```bash
# Recent events in namespace
kubectl get events -n gotour --sort-by='.lastTimestamp'

# Watch for new events
kubectl get events -n gotour --watch
```

---

## 🧪 Method 6: End-to-End Testing Script

Create a test script `test-eks-deployment.sh`:

```bash
#!/bin/bash
# test-eks-deployment.sh

NAMESPACE="gotour"

echo "╔════════════════════════════════════════════════════════════╗"
echo "║         Testing Airbnb Prototype on AWS EKS                ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Test 1: Check all pods are running
echo "Test 1: Checking pod status..."
READY_PODS=$(kubectl get pods -n $NAMESPACE --no-headers | grep "1/1" | wc -l)
TOTAL_PODS=$(kubectl get pods -n $NAMESPACE --no-headers | wc -l)
echo "  Ready: $READY_PODS/$TOTAL_PODS"
if [ $READY_PODS -ge 8 ]; then
  echo "  ✅ PASS: All core services are running"
else
  echo "  ❌ FAIL: Some services are not ready"
fi
echo ""

# Test 2: Check MongoDB
echo "Test 2: Testing MongoDB connection..."
kubectl exec mongodb-0 -n $NAMESPACE -- mongosh --eval "db.version()" > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "  ✅ PASS: MongoDB is operational"
else
  echo "  ❌ FAIL: MongoDB connection failed"
fi
echo ""

# Test 3: Check Kafka
echo "Test 3: Testing Kafka..."
kubectl exec kafka-0 -n $NAMESPACE -- kafka-topics --bootstrap-server localhost:9092 --list > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "  ✅ PASS: Kafka is operational"
else
  echo "  ❌ FAIL: Kafka is not responding"
fi
echo ""

# Test 4: Test service endpoints (via port-forward)
echo "Test 4: Testing service endpoints..."
for service in traveler-service:3001 property-service:3003 booking-service:3004; do
  SERVICE_NAME=$(echo $service | cut -d: -f1)
  PORT=$(echo $service | cut -d: -f2)
  
  # Start port-forward in background
  kubectl port-forward svc/$SERVICE_NAME $PORT:$PORT -n $NAMESPACE > /dev/null 2>&1 &
  PF_PID=$!
  sleep 2
  
  # Test endpoint
  RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT/health 2>/dev/null)
  if [ "$RESPONSE" = "200" ]; then
    echo "  ✅ PASS: $SERVICE_NAME responding (HTTP $RESPONSE)"
  else
    echo "  ⚠️  WARN: $SERVICE_NAME returned HTTP $RESPONSE"
  fi
  
  # Kill port-forward
  kill $PF_PID 2>/dev/null
done
echo ""

echo "╔════════════════════════════════════════════════════════════╗"
echo "║              Testing Complete!                             ║"
echo "╚════════════════════════════════════════════════════════════╝"
```

Run it:
```bash
chmod +x test-eks-deployment.sh
./test-eks-deployment.sh
```

---

## 📈 Method 7: Performance Testing with JMeter/K6

### Using kubectl run for quick load testing

```bash
# Run a temporary pod for load testing
kubectl run load-test --image=curlimages/curl:latest -n gotour -it --rm -- sh

# Inside the pod:
for i in {1..100}; do
  curl -s http://traveler-service:3001/health > /dev/null
  echo "Request $i completed"
done
exit
```

### Monitor during load test

```bash
# Watch pod metrics
watch kubectl top pods -n gotour

# Watch HPA scaling
watch kubectl get hpa -n gotour
```

---

## 🔐 Security Testing

### Check Network Policies

```bash
# List network policies
kubectl get networkpolicies -n gotour

# Test pod-to-pod communication
kubectl exec -it deployment/booking-service -n gotour -- \
  curl http://mongodb-service:27017
```

### Check RBAC

```bash
# Check service accounts
kubectl get serviceaccounts -n gotour

# Check roles
kubectl get roles,rolebindings -n gotour
```

---

## 🎯 Common Test Scenarios

### Scenario 1: Complete User Journey

```bash
# 1. Register user
# 2. Login and get token
# 3. Browse properties
# 4. Create booking
# 5. View booking history
# 6. Get AI recommendations

# Run the complete flow:
./test-complete-flow.sh  # Create this based on your API specs
```

### Scenario 2: Service Resilience

```bash
# Kill a pod and watch it restart
kubectl delete pod <pod-name> -n gotour
kubectl get pods -n gotour -w

# Test if services handle restarts gracefully
```

### Scenario 3: Database Persistence

```bash
# Create data
# Restart MongoDB pod
kubectl delete pod mongodb-0 -n gotour
# Wait for restart
kubectl wait --for=condition=ready pod/mongodb-0 -n gotour --timeout=300s
# Verify data still exists
```

---

## 📊 Monitoring Dashboard

### Quick Status Command

```bash
# Create an alias for quick status
alias gotour-status='kubectl get pods,svc,pvc,ingress -n gotour'

# Use it
gotour-status
```

### Continuous Monitoring

```bash
# Watch all resources
watch -n 2 'kubectl get pods,svc -n gotour'
```

---

## 🚨 Troubleshooting

### Pod not starting?

```bash
kubectl describe pod <pod-name> -n gotour
kubectl logs <pod-name> -n gotour --previous  # Previous container logs
```

### Service not responding?

```bash
# Check if pod is ready
kubectl get pod <pod-name> -n gotour

# Check service endpoints
kubectl get endpoints -n gotour

# Test from within cluster
kubectl run test --image=curlimages/curl -it --rm -n gotour -- \
  curl http://traveler-service:3001/health
```

### Database issues?

```bash
# Check MongoDB logs
kubectl logs mongodb-0 -n gotour

# Exec into MongoDB
kubectl exec -it mongodb-0 -n gotour -- mongosh
```

---

## 📝 Testing Checklist for Lab 2

- [ ] All pods are running (1/1 READY)
- [ ] MongoDB is accessible and storing data
- [ ] Kafka is running and accepting connections
- [ ] Traveler service APIs work
- [ ] Owner service APIs work
- [ ] Property service APIs work
- [ ] Booking service APIs work
- [ ] AI Agent service is responding
- [ ] Services can communicate with each other
- [ ] Data persists across pod restarts
- [ ] Logs are accessible
- [ ] Resource usage is within limits
- [ ] Take screenshots of working services
- [ ] Document API endpoints tested

---

## 🎓 Lab 2 Submission Evidence

### Capture These for Your Report

```bash
# 1. Pod status
kubectl get pods -n gotour -o wide > evidence/pods-status.txt

# 2. Service endpoints
kubectl get svc -n gotour > evidence/services.txt

# 3. Persistent volumes
kubectl get pvc -n gotour > evidence/storage.txt

# 4. Resource usage
kubectl top nodes > evidence/node-resources.txt
kubectl top pods -n gotour > evidence/pod-resources.txt

# 5. Describe a pod
kubectl describe pod <pod-name> -n gotour > evidence/pod-details.txt

# 6. Sample logs
kubectl logs deployment/booking-service -n gotour --tail=100 > evidence/booking-logs.txt

# 7. Test API response
curl http://localhost:3001/health | jq . > evidence/api-response.json
```

---

## ✅ Success Criteria

Your deployment is working correctly if:

✅ All 8 core pods show 1/1 READY
✅ All services have ClusterIP assigned  
✅ MongoDB accepts connections and queries
✅ Kafka lists topics without errors
✅ API endpoints return 200 status codes
✅ Services can reach each other internally
✅ Logs show successful requests
✅ Data persists after pod restart
✅ Resource usage is stable

---

## 🔗 Quick Reference

| Service | Internal Port | Test Command |
|---------|--------------|--------------|
| MongoDB | 27017 | `kubectl exec mongodb-0 -n gotour -- mongosh` |
| Kafka | 9092 | `kubectl exec kafka-0 -n gotour -- kafka-topics --list` |
| Traveler | 3001 | `curl http://localhost:3001/health` |
| Owner | 3002 | `curl http://localhost:3002/health` |
| Property | 3003 | `curl http://localhost:3003/health` |
| Booking | 3004 | `curl http://localhost:3004/health` |
| AI Agent | 8000 | `curl http://localhost:8000/health` |

---

**Last Updated:** November 2024  
**Cluster:** gotour-cluster (us-east-1)  
**Status:** All backend services operational ✅

