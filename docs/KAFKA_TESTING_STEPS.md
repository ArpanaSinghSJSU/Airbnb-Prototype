# 🧪 Kafka Flow Testing - Step-by-Step Guide

## ⚡ Quick Start (3 Minutes)

### Prerequisites
- ✅ All services running (`make server`)
- ✅ Frontend running (`make frontend`)
- ✅ Database seeded (`make seed`)

---

## 📋 Step-by-Step Testing

### **STEP 1: Verify Kafka is Running** ✅

```bash
make kafka-status
```

**Expected Output:**
```
✅ Zookeeper is running
   Container: gotour-zookeeper
   Port: 2181

✅ Kafka is running
   Container: gotour-kafka
   Port: 9092

✅ Kafka broker is healthy

👥 Active Consumer Groups:
   booking-service-group
   traveler-service-group
   owner-service-group
```

**If Kafka is not running:**
```bash
make server  # Start all services
# Wait 30 seconds for Kafka to initialize
make kafka-status
```

---

### **STEP 2: Check Kafka Topics** 📋

```bash
make kafka-topics
```

**Expected Output:**
```
📝 Topics List:
───────────────────────────────────────────────────────────
booking-requests
booking-status-updates
owner-notifications
```

**If topics don't exist:**
```bash
docker-compose restart booking-service
# Wait 10 seconds
make kafka-topics
```

---

### **STEP 3: Open Kafka Logs (3 Terminals)** 📊

**Terminal 1: Booking Service Logs**
```bash
make kafka-logs-booking
```

**Terminal 2: Owner Service Logs**
```bash
make kafka-logs-owner
```

**Terminal 3: Traveler Service Logs**
```bash
make kafka-logs-traveler
```

**Expected Initial Output (in each terminal):**
```
✅ Kafka Producer connected (service-name)
✅ Kafka Consumer connected
📥 Subscribed to topic: [topic-name]
```

---

### **STEP 4: Test Booking Creation Flow** 📝

#### 4.1 Login as Traveler
1. Open http://localhost:3000
2. Click "Login"
3. Email: `john.traveler@example.com`
4. Password: `password123`
5. Click "Sign In"

#### 4.2 Create a Booking
1. Search for any property (e.g., "Miami")
2. Click on a property
3. Fill in booking details:
   - Check-in: Tomorrow's date
   - Check-out: Date 3 days later
   - Guests: 2
4. Click "Book Now"
5. Click "Confirm Booking"

#### 4.3 Watch the Logs! 👀

**Terminal 1 (Booking Service):**
```
✅ Booking 67890def12345 created successfully
📤 Published to owner-notifications: notification-67890def12345
✅ Kafka: Published BOOKING_CREATED event for 67890def12345
```

**Terminal 2 (Owner Service):**
```
📩 Received message from owner-notifications: notification-67890def12345
🔔 Processing owner notification: notification-67890def12345
📬 Notification for property property123:
   Type: BOOKING_CREATED
   Booking: 67890def12345
   Message: New booking request received
✅ Owner notification processed for booking 67890def12345
```

**✅ SUCCESS!** If you see both messages, Kafka is working for booking creation!

---

### **STEP 5: Test Booking Acceptance Flow** ✅

#### 5.1 Logout and Login as Owner
1. Click user menu → "Logout"
2. Login again:
   - Email: `robert.owner@example.com`
   - Password: `password123`

#### 5.2 Accept the Booking
1. Go to "Manage Bookings" from dashboard
2. You should see the booking you just created (Status: PENDING)
3. Click "Accept" button
4. Confirm acceptance

#### 5.3 Watch the Logs! 👀

**Terminal 1 (Booking Service):**
```
✅ Booking 67890def12345 accepted successfully
📤 Published BOOKING_ACCEPTED event for 67890def12345
✅ Kafka: Published BOOKING_ACCEPTED event for 67890def12345
```

**Terminal 3 (Traveler Service):**
```
📩 Received message from booking-status-updates: status-67890def12345-1732187700000
🔄 Processing booking status update: 67890def12345
✅ Booking 67890def12345 status updated to ACCEPTED
```

**✅ SUCCESS!** If you see both messages, the complete Kafka flow is working!

---

### **STEP 6: Test Cancellation Flow (Optional)** ❌

#### 6.1 Cancel a Booking
1. As owner or traveler, go to bookings
2. Click "Cancel" on a booking
3. Enter reason: "Testing Kafka"
4. Confirm cancellation

#### 6.2 Watch the Logs! 👀

**Terminal 1 (Booking Service):**
```
✅ Booking 67890def12345 cancelled by owner
📤 Published BOOKING_CANCELLED event for 67890def12345
```

**Terminal 3 (Traveler Service):**
```
📩 Received message from booking-status-updates
🔄 Processing booking status update: 67890def12345
✅ Booking 67890def12345 status updated to CANCELLED
```

**✅ SUCCESS!** Cancellation flow is working via Kafka!

---

## 🔍 Advanced Testing

### Monitor Kafka Topics in Real-Time

**Watch Booking Creation Events:**
```bash
make kafka-monitor
```

**Watch Status Update Events:**
```bash
make kafka-monitor-status
```

**Watch All Kafka Logs:**
```bash
make kafka-logs
```

---

## ✅ Success Criteria Checklist

- [ ] `make kafka-status` shows Kafka and Zookeeper running
- [ ] `make kafka-topics` shows 3 topics
- [ ] Creating booking shows "📤 Published to owner-notifications" in booking service logs
- [ ] Owner service shows "📩 Received message from owner-notifications"
- [ ] Accepting booking shows "📤 Published BOOKING_ACCEPTED event"
- [ ] Traveler service shows "📩 Received message from booking-status-updates"
- [ ] Status updated to ACCEPTED in traveler service logs
- [ ] Frontend shows booking status change (PENDING → ACCEPTED)

---

## 🐛 Troubleshooting

### Issue 1: "Kafka is not running"
```bash
# Check Docker containers
docker ps | grep kafka

# If not running, restart services
make restart
sleep 30  # Wait for Kafka to start
make kafka-status
```

### Issue 2: "No topics found"
```bash
# Restart booking service to trigger topic creation
docker-compose restart booking-service
sleep 10
make kafka-topics
```

### Issue 3: "No Kafka logs appearing"
```bash
# Check if services are starting Kafka consumers
docker logs gotour-booking-service | grep -i kafka
docker logs gotour-traveler-service | grep -i kafka
docker logs gotour-owner-service | grep -i kafka

# Should see: "✅ Kafka Producer connected"
```

### Issue 4: Messages not flowing
```bash
# Check Kafka broker health
docker exec gotour-kafka kafka-broker-api-versions --bootstrap-server localhost:9092

# Check consumer groups
docker exec gotour-kafka kafka-consumer-groups --bootstrap-server localhost:9092 --list

# Reset Kafka (WARNING: deletes all messages)
make kafka-reset
```

### Issue 5: Old/stale messages
```bash
# Kafka keeps messages for 7 days by default
# To clear everything and start fresh:
make kafka-reset
```

---

## 📊 Visual Flow Verification

### Expected Message Flow:

```
1. Create Booking:
   Frontend → Booking Service → MongoDB → Kafka (owner-notifications) → Owner Service

2. Accept Booking:
   Frontend → Booking Service → MongoDB → Kafka (booking-status-updates) → Traveler Service

3. Cancel Booking:
   Frontend → Booking Service → MongoDB → Kafka (booking-status-updates) → Traveler Service
```

---

## 🎯 Quick Commands Reference

| Command | Purpose |
|---------|---------|
| `make kafka-status` | Check Kafka & Zookeeper status |
| `make kafka-topics` | List all Kafka topics |
| `make kafka-logs` | View all Kafka-related logs |
| `make kafka-logs-booking` | View booking service Kafka logs |
| `make kafka-logs-owner` | View owner service Kafka logs |
| `make kafka-logs-traveler` | View traveler service Kafka logs |
| `make kafka-monitor` | Monitor owner-notifications topic |
| `make kafka-monitor-status` | Monitor booking-status-updates topic |
| `make kafka-test` | Show complete testing guide |
| `make kafka-reset` | Reset Kafka (delete all messages) |

---

## 📚 Related Documentation

- **[KAFKA_BOOKING_FLOW.md](./KAFKA_BOOKING_FLOW.md)** - Complete flow explanation with code
- **[KAFKA_TESTING_GUIDE.md](./KAFKA_TESTING_GUIDE.md)** - Comprehensive testing scenarios
- **[KAFKA_QUICKSTART.md](./KAFKA_QUICKSTART.md)** - 3-step quick start
- **[KAFKA_INTEGRATION.md](./KAFKA_INTEGRATION.md)** - Architecture overview

---

## 🎉 You're Done!

If you've completed all steps and see the expected Kafka messages, congratulations! 🎊

**Your Kafka integration is working perfectly!**

**Phase 4 is complete** ✅ - You're ready for Phase 5 (Kubernetes deployment)!

---

## 💡 Pro Tips

1. **Keep logs open** while testing to see real-time message flow
2. **Wait 30 seconds** after starting services for Kafka to initialize
3. **Use `make kafka-test`** to see this guide in the terminal
4. **Check `make kafka-status`** first if anything doesn't work
5. **All Kafka errors are non-blocking** - API still works even if Kafka fails

---

**Happy Testing!** 🚀

