# 🧪 Kafka Integration Testing Guide

## Prerequisites
- Docker and Docker Compose installed
- All services configured with Kafka
- Test user accounts (from seed-mongo.js)

## Test Credentials
```
Traveler: john.traveler@example.com / password123
Owner: robert.owner@example.com / password123
```

## 🚀 Starting the System

### Step 1: Start All Services
```bash
make restart
# OR
docker-compose down && docker-compose up -d --build
```

### Step 2: Verify Services are Running
```bash
make health
# OR check individually:
curl http://localhost:3001/health  # Traveler Service
curl http://localhost:3002/health  # Owner Service
curl http://localhost:3003/health  # Property Service
curl http://localhost:3004/health  # Booking Service
curl http://localhost:8000/health  # AI Agent
```

### Step 3: Check Kafka is Healthy
```bash
docker logs gotour-kafka | tail -20
# Should see: "Kafka Server started"

docker logs gotour-zookeeper | tail -20
# Should see: "binding to port"
```

## 📊 Monitoring Kafka Messages

### Watch Kafka Logs in Real-Time
```bash
# Terminal 1: Booking Service (Producer + Consumer)
docker logs -f gotour-booking-service

# Terminal 2: Traveler Service (Consumer)
docker logs -f gotour-traveler-service

# Terminal 3: Owner Service (Consumer)
docker logs -f gotour-owner-service

# Terminal 4: Kafka Broker
docker logs -f gotour-kafka
```

### Expected Kafka Log Messages
When Kafka initializes, you should see:
```
✅ Kafka Producer connected (booking-service)
✅ Created Kafka topics: booking-requests, booking-status-updates, owner-notifications
✅ Booking Request Consumer is running
```

## 🧪 Test Scenarios

### Test 1: Create Booking (Kafka Notification)

**Flow:**
```
Traveler → POST /bookings → Booking Service
  ↓
Booking Created in DB
  ↓
📤 Publish to owner-notifications topic
  ↓
📥 Owner Service consumes notification
```

**Steps:**
1. Login as traveler:
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.traveler@example.com",
    "password": "password123"
  }'
```

2. Save the JWT token from response

3. Create a booking:
```bash
curl -X POST http://localhost:3004/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "propertyId": "PROPERTY_ID_FROM_DB",
    "checkInDate": "2025-12-15",
    "checkOutDate": "2025-12-20",
    "guests": 2,
    "totalPrice": 500
  }'
```

**Expected Kafka Logs:**
```
Booking Service:
  ✅ Booking created successfully
  📤 Published to owner-notifications: notification-BOOKING_ID

Owner Service:
  📩 Received message from owner-notifications: notification-BOOKING_ID
  📬 Notification for property PROPERTY_ID
  ✅ Owner notification processed for booking BOOKING_ID
```

### Test 2: Accept Booking (Status Update via Kafka)

**Flow:**
```
Owner → PUT /bookings/:id/accept → Booking Service
  ↓
Booking Status Updated to ACCEPTED
  ↓
📤 Publish to booking-status-updates topic
  ↓
📥 Traveler Service consumes status update
  ↓
Traveler's Booking Status Updated
```

**Steps:**
1. Login as owner:
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "robert.owner@example.com",
    "password": "password123"
  }'
```

2. Accept the booking:
```bash
curl -X PUT http://localhost:3004/bookings/BOOKING_ID/accept \
  -H "Authorization: Bearer OWNER_JWT_TOKEN"
```

**Expected Kafka Logs:**
```
Booking Service:
  ✅ Booking accepted successfully
  📤 Published BOOKING_ACCEPTED event for BOOKING_ID

Traveler Service:
  📩 Received message from booking-status-updates: BOOKING_ID
  ✅ Booking BOOKING_ID status updated to ACCEPTED
```

### Test 3: Cancel Booking (Status Update via Kafka)

**Flow:**
```
Traveler/Owner → DELETE /bookings/:id → Booking Service
  ↓
Booking Status Updated to CANCELLED
  ↓
📤 Publish to booking-status-updates topic
  ↓
📥 Traveler Service consumes status update
```

**Steps:**
```bash
curl -X DELETE http://localhost:3004/bookings/BOOKING_ID \
  -H "Authorization: Bearer TRAVELER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Plans changed"}'
```

**Expected Kafka Logs:**
```
Booking Service:
  ✅ Booking cancelled successfully
  📤 Published BOOKING_CANCELLED event for BOOKING_ID

Traveler Service:
  📩 Received message from booking-status-updates: BOOKING_ID
  ✅ Booking BOOKING_ID status updated to CANCELLED
```

## 🔍 Debugging Kafka Issues

### Check Kafka Topics
```bash
# List all topics
docker exec -it gotour-kafka kafka-topics --bootstrap-server localhost:9092 --list

# Should show:
# booking-requests
# booking-status-updates
# owner-notifications
```

### Check Topic Details
```bash
docker exec -it gotour-kafka kafka-topics --bootstrap-server localhost:9092 --describe --topic booking-requests
```

### Consume Messages from a Topic (Manual)
```bash
# Listen to owner-notifications
docker exec -it gotour-kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic owner-notifications \
  --from-beginning
```

### Check Consumer Groups
```bash
docker exec -it gotour-kafka kafka-consumer-groups --bootstrap-server localhost:9092 --list

# Should show:
# booking-service-group
# traveler-service-group
# owner-service-group
```

### Reset Consumer Group (if needed)
```bash
docker exec -it gotour-kafka kafka-consumer-groups \
  --bootstrap-server localhost:9092 \
  --group booking-service-group \
  --reset-offsets \
  --to-earliest \
  --all-topics \
  --execute
```

## 🐛 Common Issues

### Issue 1: "Kafka Producer not connected"
**Cause:** Kafka hasn't started yet
**Solution:** Wait 10 seconds after `docker-compose up` for Kafka to fully initialize

### Issue 2: "Topic does not exist"
**Cause:** Topics weren't created automatically
**Solution:**
```bash
docker-compose restart booking-service
# Topics will be created on service restart
```

### Issue 3: No messages in consumer logs
**Cause:** Consumer started before producer sent messages
**Solution:** Try creating a new booking - the consumer should pick it up

### Issue 4: Multiple duplicate messages
**Cause:** Consumer group offset issues
**Solution:** Restart the service or reset consumer group offsets

## ✅ Success Criteria

Your Kafka integration is working correctly if:

1. ✅ All three Kafka topics exist:
   - `booking-requests`
   - `booking-status-updates`
   - `owner-notifications`

2. ✅ Creating a booking shows:
   - "📤 Published to owner-notifications" in booking-service logs
   - "📩 Received message from owner-notifications" in owner-service logs

3. ✅ Accepting a booking shows:
   - "📤 Published BOOKING_ACCEPTED event" in booking-service logs
   - "📩 Received message from booking-status-updates" in traveler-service logs

4. ✅ Cancelling a booking shows:
   - "📤 Published BOOKING_CANCELLED event" in booking-service logs
   - "📩 Received message from booking-status-updates" in traveler-service logs

5. ✅ No Kafka connection errors in service logs

## 📝 Notes

- Kafka messages are **asynchronous** - there may be a 1-2 second delay
- If Kafka fails, the API still works (Kafka errors are non-blocking)
- Messages are **idempotent** - duplicate processing is handled
- Consumer groups ensure **load balancing** in production

## 🎯 Next Steps

Once all tests pass:
1. ✅ Kafka integration is complete
2. 📦 Ready for Kubernetes deployment (Phase 5)
3. 🚀 Can add more event-driven features:
   - Email notifications
   - Real-time dashboard updates
   - Analytics/metrics tracking
   - Audit logging

