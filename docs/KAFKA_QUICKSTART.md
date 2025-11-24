# ⚡ Kafka Quick Start Guide

## 🚀 Start in 3 Steps

### Step 1: Start All Services (with Kafka)
```bash
make restart
```

**Wait ~30 seconds** for all services to initialize (Kafka needs time to start)

### Step 2: Verify Kafka is Running
```bash
# Check all services
docker ps | grep gotour

# Should show:
# gotour-kafka
# gotour-zookeeper
# gotour-booking-service
# gotour-traveler-service
# gotour-owner-service
# gotour-mongodb
```

### Step 3: Watch Kafka in Action
Open 3 terminals and run:

**Terminal 1: Booking Service Logs**
```bash
docker logs -f gotour-booking-service
```

**Terminal 2: Owner Service Logs**
```bash
docker logs -f gotour-owner-service
```

**Terminal 3: Traveler Service Logs**
```bash
docker logs -f gotour-traveler-service
```

---

## 🧪 Quick Test

### Test 1: See Kafka Initialization
In your log terminals, you should see:
```
✅ Kafka Producer connected (booking-service)
✅ Created Kafka topics: booking-requests, booking-status-updates, owner-notifications
✅ Booking Request Consumer is running
```

### Test 2: Create a Booking
1. Open frontend: http://localhost:3000
2. Login as traveler: `john.traveler@example.com` / `password123`
3. Search for a property and create a booking

**Watch the logs:**
```
Booking Service:
  ✅ Booking created successfully
  📤 Published to owner-notifications: notification-BOOKING_ID

Owner Service:
  📩 Received message from owner-notifications: notification-BOOKING_ID
  ✅ Owner notification processed
```

✅ **Success!** Kafka is working if you see these messages.

### Test 3: Accept a Booking
1. Login as owner: `robert.owner@example.com` / `password123`
2. Go to "Manage Bookings"
3. Accept a pending booking

**Watch the logs:**
```
Booking Service:
  📤 Published BOOKING_ACCEPTED event for BOOKING_ID

Traveler Service:
  📩 Received message from booking-status-updates: BOOKING_ID
  ✅ Booking BOOKING_ID status updated to ACCEPTED
```

---

## 🔍 Debug Commands

### Check Kafka Topics
```bash
docker exec -it gotour-kafka kafka-topics --bootstrap-server localhost:9092 --list
```

**Expected Output:**
```
booking-requests
booking-status-updates
owner-notifications
```

### Monitor a Topic in Real-Time
```bash
docker exec -it gotour-kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic owner-notifications \
  --from-beginning
```

### Check Service Health
```bash
curl http://localhost:3004/health  # Booking Service
curl http://localhost:3001/health  # Traveler Service
curl http://localhost:3002/health  # Owner Service
```

---

## 🐛 Troubleshooting

### Issue: No Kafka logs appearing
**Solution:** Kafka takes ~30 seconds to start. Wait and restart services:
```bash
docker-compose restart booking-service traveler-service owner-service
```

### Issue: "Broker not available" error
**Solution:** Kafka isn't ready yet. Wait 30 seconds and try again.

### Issue: Topics don't exist
**Solution:** Restart booking-service to trigger topic creation:
```bash
docker-compose restart booking-service
```

---

## ✅ Success Criteria

Your Kafka setup is working if:

1. ✅ All 3 topics exist (`kafka-topics --list` shows them)
2. ✅ Creating a booking shows "📤 Published to owner-notifications"
3. ✅ Owner service shows "📩 Received message from owner-notifications"
4. ✅ Accepting booking shows "📤 Published BOOKING_ACCEPTED event"
5. ✅ Traveler service shows "📩 Received message from booking-status-updates"

---

## 📚 Full Documentation

For comprehensive testing and architecture details, see:
- **[KAFKA_TESTING_GUIDE.md](./KAFKA_TESTING_GUIDE.md)** - Detailed testing scenarios
- **[KAFKA_INTEGRATION.md](./KAFKA_INTEGRATION.md)** - Architecture overview
- **[PHASE4_KAFKA_COMPLETE.md](./PHASE4_KAFKA_COMPLETE.md)** - Implementation summary

---

## 🎯 Next Steps

Once you see Kafka messages flowing:
1. ✅ Phase 4 is complete
2. 🚀 Ready for Phase 5: Kubernetes deployment

**Happy Testing!** 🎉

