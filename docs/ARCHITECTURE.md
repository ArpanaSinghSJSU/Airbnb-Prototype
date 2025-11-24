# GoTour Airbnb Prototype - Microservices Architecture

## 📊 Architecture Overview

```
GoTour Application
├── Frontend (React + Redux)         → Port 3000 (run locally)
└── Backend (Microservices)
    ├── services/
    │   ├── traveler-service/        → Port 3001 (Node.js)
    │   ├── owner-service/           → Port 3002 (Node.js)
    │   ├── property-service/        → Port 3003 (Node.js)
    │   ├── booking-service/         → Port 3004 (Node.js)
    │   └── ai-agent/                → Port 8000 (Python/FastAPI)
    └── Database
        └── MongoDB                  → Port 27017
```

---

## 🏗️ Services Directory Structure

All microservices are organized under the `services/` directory:

```
services/
├── traveler-service/          # Authentication & Traveler Management
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js
│   └── src/
│       ├── controllers/
│       │   ├── authController.js
│       │   └── travelerController.js
│       ├── routes/
│       │   ├── authRoutes.js
│       │   └── travelerRoutes.js
│       ├── middleware/
│       │   ├── jwtAuth.js
│       │   └── upload.js
│       ├── models/
│       └── utils/
│           └── db.js
│
├── owner-service/             # Owner Profile & Management
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js
│   └── src/
│       ├── controllers/
│       │   └── ownerController.js
│       ├── routes/
│       │   └── ownerRoutes.js
│       ├── middleware/
│       ├── models/
│       └── utils/
│
├── property-service/          # Property Search, Details, Favorites
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js
│   └── src/
│       ├── controllers/
│       │   ├── propertyController.js
│       │   └── favoriteController.js
│       ├── routes/
│       │   ├── propertyRoutes.js
│       │   └── favoriteRoutes.js
│       ├── middleware/
│       ├── models/
│       └── utils/
│
├── booking-service/           # Booking Management
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js
│   └── src/
│       ├── controllers/
│       │   └── bookingController.js
│       ├── routes/
│       │   └── bookingRoutes.js
│       ├── middleware/
│       ├── models/
│       └── utils/
│
└── ai-agent/                  # AI Trip Planning (Python)
    ├── Dockerfile
    ├── requirements.txt
    ├── main.py
    ├── agent.py
    ├── config.py
    ├── database.py
    ├── models.py
    └── utils.py
```

---

## 🔀 Service Responsibilities

### 1. Traveler Service (Port 3001)
**Technology**: Node.js + Express + MongoDB

**Responsibilities**:
- User authentication (signup, login, logout)
- JWT token generation and validation
- Traveler profile management (CRUD)
- View booking history
- Upload profile pictures

**Endpoints**:
```
POST   /auth/signup
POST   /auth/login
POST   /auth/logout
GET    /auth/check
GET    /traveler/profile
PUT    /traveler/profile
POST   /traveler/profile/picture
GET    /traveler/history
GET    /traveler/bookings
```

---

### 2. Owner Service (Port 3002)
**Technology**: Node.js + Express + MongoDB

**Responsibilities**:
- Owner profile management
- Dashboard statistics and analytics
- Property booking management
- Upload profile pictures

**Endpoints**:
```
GET    /owner/profile
PUT    /owner/profile
POST   /owner/profile/picture
GET    /owner/dashboard
```

---

### 3. Property Service (Port 3003)
**Technology**: Node.js + Express + MongoDB

**Responsibilities**:
- Property search with filters
- Property details
- Property CRUD operations (create, read, update, delete)
- Favorites management
- Property photo uploads

**Endpoints**:
```
GET    /properties/search
GET    /properties/:id
POST   /properties
PUT    /properties/:id
DELETE /properties/:id
GET    /properties/owner/properties
POST   /properties/:id/photos
GET    /favorites
POST   /favorites
DELETE /favorites/:propertyId
```

---

### 4. Booking Service (Port 3004)
**Technology**: Node.js + Express + MongoDB

**Responsibilities**:
- Create booking requests
- Update booking status
- Get traveler bookings
- Get owner bookings
- Accept/reject/cancel bookings

**Endpoints**:
```
POST   /bookings
GET    /bookings/traveler
GET    /bookings/owner
GET    /bookings/:id
PUT    /bookings/:id/accept
PUT    /bookings/:id/cancel
```

---

### 5. AI Agent Service (Port 8000)
**Technology**: Python + FastAPI + OpenAI + MongoDB

**Responsibilities**:
- AI-powered trip planning
- Natural language processing
- Generate day-by-day itineraries
- Restaurant and activity recommendations
- Weather-aware packing suggestions

**Endpoints**:
```
POST   /api/concierge/plan-from-booking
GET    /health
GET    /docs (Swagger UI)
```

---

## 🔐 Authentication Flow

```
1. User logs in → Traveler Service
2. Traveler Service generates JWT token
3. Token stored in localStorage (Redux)
4. All subsequent requests include token in Authorization header
5. Each service validates JWT independently
```

**JWT Structure**:
```json
{
  "userId": "user_id_here",
  "role": "traveler|owner",
  "exp": 1234567890
}
```

---

## 💾 Database Architecture

**Shared MongoDB Database**: All services connect to the same MongoDB instance

**Collections**:
- `users` - User accounts (travelers and owners)
- `properties` - Property listings
- `bookings` - Booking records
- `favorites` - User favorites

**Why Shared Database?**
- ✅ Simplicity for Lab 2
- ✅ Data consistency
- ✅ No need for complex sync mechanisms
- ⚠️ Trade-off: Services are coupled through database

**Future: Service-Specific Databases (Optional)**
- Each service could have its own database
- Use event-driven architecture to sync data
- Better isolation and independence

---

## 🐳 Docker Configuration

### Docker Compose Services

```yaml
services:
  mongodb:          # Database
  mongo-express:    # DB Admin UI
  traveler-service: # Port 3001
  owner-service:    # Port 3002
  property-service: # Port 3003
  booking-service:  # Port 3004
  ai-agent:         # Port 8000
```

### Service Dependencies

```
All Services → mongodb (healthy)
Frontend → All Services (run separately)
```

### Health Checks

Each service provides a `/health` endpoint:
```bash
curl http://localhost:3001/health  # Traveler
curl http://localhost:3002/health  # Owner
curl http://localhost:3003/health  # Property
curl http://localhost:3004/health  # Booking
curl http://localhost:8000/health  # AI Agent
```

---

## 🚀 Running the Application

### Start All Microservices

```bash
# One command to start everything
./start-microservices.sh
```

This starts:
- MongoDB + Mongo Express
- All 5 microservices (containerized)

### Start Frontend (Separate Terminal)

```bash
cd frontend
npm install
npm start
```

Frontend runs on: http://localhost:3000

---

## 📡 Inter-Service Communication

### Current: Frontend → Services

```
Frontend (Port 3000)
  ↓ HTTP Requests
  ├─→ Traveler Service  (3001)
  ├─→ Owner Service     (3002)
  ├─→ Property Service  (3003)
  ├─→ Booking Service   (3004)
  └─→ AI Agent         (8000)
```

### Future: Service-to-Service (Phase 4 with Kafka)

```
Traveler creates booking
  ↓ Event
Kafka (Message Queue)
  ↓ Event
Booking Service processes
  ↓ Event
Owner Service notified
```

---

## 🔧 Environment Variables

Each service requires:

```bash
# Service-specific
<SERVICE>_PORT=<port>      # e.g., TRAVELER_PORT=3001
NODE_ENV=development

# Shared (all services)
MONGODB_URI=mongodb://admin:admin123@mongodb:27017/gotour_db?authSource=admin
JWT_SECRET=your_super_secret_jwt_key...
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000

# AI Agent specific
OPENAI_API_KEY=sk-...
TAVILY_API_KEY=tvly-...
```

---

## 📊 Benefits of This Architecture

### ✅ Service Isolation
- Each service can fail independently
- Bugs in one service don't affect others
- Clear separation of concerns

### ✅ Independent Scaling
- Scale only the services that need it
- Property search getting hammered? Scale just that service
- Cost-effective resource usage

### ✅ Technology Flexibility
- Each service can use different tech stack
- Node.js for most services
- Python for AI Agent
- Future: Go, Rust, etc.

### ✅ Development Velocity
- Teams can work on services independently
- Smaller codebases = faster development
- Easier to understand and modify

### ✅ Deployment Independence
- Deploy services individually
- No need to redeploy entire application
- Faster rollbacks if issues occur

---

## 🎯 Next Steps (Phase 4)

### Kafka Integration
- Add message queue for async communication
- Event-driven booking workflow
- Real-time notifications

### API Gateway (Optional)
- Centralized routing
- Load balancing
- Rate limiting

### Service Mesh (Advanced)
- Service discovery
- Traffic management
- Observability

---

## 📚 Documentation

- **PHASE2_COMPLETE.md** - Redux implementation
- **PHASE3_COMPLETE.md** - Microservices setup
- **TESTING_GUIDE.md** - Testing instructions
- **services/ai-agent/README.md** - AI Agent docs

---

## 🎉 Current Status

✅ **Monolith → Microservices**: Complete  
✅ **5 Independent Services**: All running  
✅ **Docker Containerization**: Fully containerized  
✅ **JWT Authentication**: Shared across services  
✅ **Frontend Integration**: Connected to all services  

**Ready for Phase 4: Kafka Integration!** 🚀

