# Lab 2: GoTour Enhancement Requirements

## Overview
This lab extends the existing GoTour (formerly Airbnb Prototype) application with containerization, orchestration, asynchronous messaging, state management, and performance testing.

**Timeline**: 22 days (3 weeks)  
**Estimated Effort**: 54-72 hours  
**Primary Goal**: Transform monolithic application into microservices architecture deployed on AWS

---

## 🎯 Key Decisions Summary

| Decision Area | Choice | Rationale |
|--------------|--------|-----------|
| **Database** | MongoDB (full migration) | No-SQL flexibility, better for microservices |
| **Authentication** | JWT Tokens | Stateless, scalable across services |
| **Frontend** | Single React app | Simplify initially, split later if needed |
| **Kubernetes** | AWS EKS | Managed service, easier than self-hosted |
| **Kafka** | Self-hosted in K8s | Simpler setup, works locally and on AWS |
| **Testing** | Local + AWS | Develop on Minikube, validate on EKS |

### 💡 Clarifications on "Easier" Choices

**AWS EKS vs Self-Managed K8s**:
- ✅ **EKS is easier**: AWS manages the control plane, automatic updates, built-in HA
- ✅ **Setup**: One command (`eksctl create cluster`) vs hours of manual configuration
- ✅ **Maintenance**: Zero effort vs constant patching and monitoring
- 💰 **Cost**: $0.10/hour (~$72/month) for control plane + worker node costs

**Self-Hosted Kafka vs AWS MSK**:
- ✅ **Self-hosted is easier** for this project:
  - No additional AWS service configuration
  - Works identically on local Minikube and AWS EKS
  - Simple Helm chart installation: `helm install kafka bitnami/kafka`
  - No VPC peering or MSK-specific IAM policies
  - Free (uses K8s resources)
- ❌ **AWS MSK**: Adds $150+/month cost, VPC complexity, different local/cloud setup

**Local vs AWS Load Testing**:
- 🏠 **Local Cluster** = Minikube/Kind on your Mac (localhost Kubernetes)
- ☁️ **AWS Cluster** = EKS in the cloud (real production environment)
- 🎯 **Strategy**: 
  - Develop and test functionality locally (fast iteration)
  - Run performance tests on AWS (realistic metrics for submission)
  - JMeter can target either: `http://localhost:3001` or `http://<aws-lb-url>`

---

## 🏗️ Architecture Transformation

### Current Architecture (Lab 1)
```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│           React + Context API (Session-based)               │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Monolith)                         │
│                   Node.js + Express                          │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐              │
│  │ Auth │ │Trvlr │ │Owner │ │Props │ │Book  │              │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘              │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
            ┌─────────────────┐        ┌──────────────┐
            │      MySQL      │        │  AI Agent    │
            │   (airbnb_db)   │        │  (FastAPI)   │
            └─────────────────┘        └──────────────┘
```

### Target Architecture (Lab 2)
```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│               React + Redux (JWT-based)                      │
└─────────────────┬───────────────┬───────────────────────────┘
                  │               │
                  ▼               ▼
         ┌────────────────┐   ┌────────────────┐
         │   Ingress/LB   │   │   Ingress/LB   │
         │   (K8s/AWS)    │   │   (K8s/AWS)    │
         └────────┬───────┘   └────────┬───────┘
                  │                    │
    ┌─────────────┴──────────┬─────────┴──────────────┐
    │                        │                         │
    ▼                        ▼                         ▼
┌──────────┐          ┌──────────┐             ┌──────────┐
│ Traveler │          │  Owner   │             │ Property │
│ Service  │          │ Service  │             │ Service  │
│ (3001)   │          │ (3002)   │             │ (3003)   │
└────┬─────┘          └────┬─────┘             └────┬─────┘
     │                     │                        │
     │   ┌─────────────────┴──────────┬─────────────┘
     │   │                            │
     ▼   ▼                            ▼
┌─────────────────────────────────────────────┐
│              Kafka Cluster                   │
│  ┌──────────────┐  ┌──────────────┐         │
│  │   Topics:    │  │ - booking-   │         │
│  │  - requests  │  │   status-    │         │
│  │  - notify    │  │   updates    │         │
│  └──────────────┘  └──────────────┘         │
└───────────┬─────────────────────────────────┘
            │
            ▼
    ┌──────────────┐         ┌──────────────┐
    │   Booking    │         │  AI Agent    │
    │   Service    │         │   Service    │
    │   (3004)     │         │   (8000)     │
    └──────┬───────┘         └──────────────┘
           │
           ▼
    ┌─────────────────┐
    │    MongoDB      │
    │  - users        │
    │  - properties   │
    │  - bookings     │
    │  - favorites    │
    └─────────────────┘

All running in: AWS EKS Kubernetes Cluster
```

---

## Current Architecture (Lab 1)

### Backend
- **Technology**: Node.js + Express
- **Database**: MySQL (airbnb_db)
- **Authentication**: Session-based with express-session
- **Structure**: Monolithic with routes for:
  - Auth (login/signup)
  - Travelers (profile, bookings)
  - Owners (properties, booking management)
  - Properties (search, details, favorites)
  - Bookings (create, update status)

### Frontend
- **Technology**: React
- **State Management**: Context API (AuthContext)
- **Key Features**: Property search, booking, favorites, profile management

### AI Agent
- **Technology**: Python + FastAPI
- **Features**: Trip planning, itinerary generation with OpenAI/Langchain/Tavily

---

## Lab 2 Enhancements

### Part 1: Docker & Kubernetes Setup (15 points)

#### 1.1 Dockerization Requirements
Need to create **5 separate Docker containers**:

1. **Traveler Service**
   - User authentication (Traveler role)
   - Profile management
   - View bookings and history
   - Favorite properties
   - Search properties

2. **Owner Service**
   - User authentication (Owner role)
   - Property management (CRUD)
   - Manage booking requests (Accept/Cancel)
   - View revenue/analytics

3. **Property Service**
   - Property listings
   - Search and filter
   - Property details
   - Photo management

4. **Booking Service**
   - Create booking requests
   - Update booking status
   - Booking history
   - Integration with Kafka

5. **Agentic AI Service**
   - Already separate (Python FastAPI)
   - Trip planning
   - Itinerary generation

**Deliverables**:
- `Dockerfile` for each service
- `.dockerignore` files
- Multi-stage builds for optimization
- Environment variable management

#### 1.2 Kubernetes Orchestration
Deploy all services to Kubernetes cluster with:

**Required K8s Resources**:
- **Deployments**: One per service (5 total)
- **Services**: ClusterIP for inter-service communication, LoadBalancer/NodePort for external access
- **ConfigMaps**: Environment configurations
- **Secrets**: API keys, database credentials
- **Persistent Volumes**: For MongoDB, Kafka, file uploads
- **Ingress**: Route external traffic to services

**Key Requirements**:
- Services must communicate with each other
- Horizontal Pod Autoscaler (HPA) for scaling
- Health checks (liveness/readiness probes)
- Resource limits and requests

**Deliverables**:
- K8s manifests in `k8s/` directory:
  - `traveler-deployment.yaml`
  - `owner-deployment.yaml`
  - `property-deployment.yaml`
  - `booking-deployment.yaml`
  - `ai-agent-deployment.yaml`
  - `mongodb-deployment.yaml`
  - `kafka-deployment.yaml`
  - `configmap.yaml`
  - `secrets.yaml`
  - `ingress.yaml`

---

### Part 2: Kafka for Asynchronous Messaging (10 points)

#### 2.1 Kafka Setup
- Deploy Kafka and Zookeeper in Kubernetes
- Create topics for booking events

#### 2.2 Booking Flow with Kafka
**Event-Driven Architecture**:

```
1. Traveler creates booking request
   ↓
2. Traveler Service (Producer) → Publishes to "booking-requests" topic
   ↓
3. Booking Service (Consumer) → Processes and stores in DB
   ↓
4. Booking Service (Producer) → Publishes to "owner-notifications" topic
   ↓
5. Owner Service (Consumer) → Receives notification
   ↓
6. Owner accepts/cancels booking
   ↓
7. Owner Service (Producer) → Publishes to "booking-status-updates" topic
   ↓
8. Traveler Service (Consumer) → Updates UI with new status
```

**Kafka Topics**:
- `booking-requests`: New booking creation
- `owner-notifications`: Notify owners of new bookings
- `booking-status-updates`: Status changes (Accepted/Cancelled)
- `booking-confirmations`: Final confirmation to traveler

#### 2.3 Microservices Architecture Split
**Backend Services (Consumers)**:
- Process business logic
- Database operations
- Consume Kafka events

**Frontend Services (Producers)**:
- Handle HTTP requests from React frontend
- Validate input
- Produce Kafka events

**Deliverables**:
- Kafka producer code in Traveler/Owner services
- Kafka consumer code in Booking service
- Event schemas/models
- Error handling and retry logic

---

### Part 3: MongoDB Migration (5 points)

#### 3.1 Database Migration
**Replace MySQL with MongoDB**:

**Current MySQL Schema**:
- Users (travelers/owners)
- Properties
- Bookings
- Favorites

**New MongoDB Collections**:
- `users`: Combined traveler/owner documents
- `properties`: Property listings with embedded photos
- `bookings`: Booking documents with references
- `favorites`: User favorite properties
- `sessions`: Express-session storage

#### 3.2 Security Requirements
- **Password Encryption**: Use bcrypt (minimum 10 salt rounds)
- **Session Storage**: Store in MongoDB using `connect-mongodb-session`
- **JWT Tokens**: For stateless authentication (optional enhancement)

**Deliverables**:
- MongoDB schemas/models
- Migration scripts (MySQL → MongoDB)
- Password hashing implementation
- Session store configuration

---

### Part 4: Redux State Management (5 points)

#### 4.1 Redux Setup
**Install Dependencies**:
```bash
npm install @reduxjs/toolkit react-redux
```

**Redux Store Structure**:
```
src/redux/
├── store.js              # Configure store
├── slices/
│   ├── authSlice.js      # User authentication
│   ├── propertySlice.js  # Property data
│   └── bookingSlice.js   # Booking data
└── middleware/
    └── api.js            # API middleware
```

#### 4.2 State Management Requirements

**1. Authentication State (authSlice.js)**:
```javascript
{
  user: { id, name, email, role, profile_picture },
  token: "JWT token",
  isAuthenticated: boolean,
  loading: boolean,
  error: string | null
}
```

**Actions**:
- `loginUser`: Dispatch on login → Store JWT
- `signupUser`: Register new user
- `logoutUser`: Clear auth state
- `refreshUser`: Update user profile
- `checkAuth`: Verify token validity

**2. Property State (propertySlice.js)**:
```javascript
{
  properties: [],           // Search results
  currentProperty: {},      // Selected property details
  favorites: [],            // User favorites
  filters: {},              // Search filters
  loading: boolean,
  error: string | null
}
```

**Actions**:
- `fetchProperties`: Search properties
- `fetchPropertyDetails`: Get single property
- `fetchFavorites`: Load user favorites
- `addFavorite`: Add to favorites
- `removeFavorite`: Remove from favorites
- `updateFilters`: Update search criteria

**3. Booking State (bookingSlice.js)**:
```javascript
{
  bookings: [],             // All user bookings
  currentBooking: {},       // Booking in progress
  bookingHistory: [],       // Past bookings
  pendingRequests: [],      // Pending owner approval
  loading: boolean,
  error: string | null
}
```

**Actions**:
- `createBooking`: Initiate booking request
- `fetchBookings`: Load user bookings
- `fetchBookingHistory`: Load past bookings
- `updateBookingStatus`: Update status (Accept/Cancel)
- `cancelBooking`: Traveler cancels booking

#### 4.3 Redux Flow Examples

**Example 1: User Login**:
```
1. User submits login form
2. Dispatch loginUser(credentials)
3. Redux Thunk makes API call
4. On success: Store user + JWT in Redux
5. Update isAuthenticated = true
6. Redirect to dashboard
```

**Example 2: Property Search**:
```
1. User enters search criteria
2. Dispatch updateFilters(filters)
3. Dispatch fetchProperties(filters)
4. Redux stores results in properties[]
5. Components re-render with new data
```

**Example 3: Create Booking**:
```
1. User clicks "Book Now"
2. Dispatch createBooking(bookingData)
3. API sends to Kafka (via Traveler Service)
4. Redux updates bookings[] with pending status
5. WebSocket/polling updates status when owner responds
```

**Deliverables**:
- Redux store configuration
- Slice files with actions/reducers
- Redux DevTools integration
- Selectors for computed state
- Screenshots of Redux DevTools showing state changes

---

### Part 5: JMeter Performance Testing (5 points)

#### 5.1 Test Scenarios
**Critical APIs to Test**:

1. **User Authentication**
   - POST `/auth/login`
   - POST `/auth/signup`
   - GET `/auth/check`

2. **Property Data Fetching**
   - GET `/properties?location=...`
   - GET `/properties/:id`
   - POST `/favorites`

3. **Booking Processing**
   - POST `/bookings` (Traveler creates booking)
   - PATCH `/bookings/:id/status` (Owner accepts/cancels)
   - GET `/bookings` (Fetch user bookings)

4. **AI Agent**
   - POST `/concierge/plan-from-booking`

#### 5.2 Test Configuration
**Concurrent Users**: Test with 100, 200, 300, 400, 500 users

**Test Plan Structure**:
```
Thread Groups:
├── Authentication Load Test
├── Property Search Load Test
├── Booking Creation Load Test
├── Owner Booking Management Test
└── AI Agent Load Test
```

**Metrics to Capture**:
- Average Response Time (ms)
- 90th/95th/99th Percentile
- Throughput (requests/sec)
- Error Rate (%)
- CPU/Memory usage

#### 5.3 Performance Analysis
**Expected Graph**:
- X-axis: Number of concurrent users
- Y-axis: Average response time (ms)
- Multiple lines for different endpoints

**Analysis Points**:
- Identify bottlenecks (DB queries, Kafka, AI agent)
- Optimal concurrent user threshold
- Recommendations for scaling

**Deliverables**:
- JMeter test plan file (`.jmx`)
- Test results screenshots
- Performance graphs (response time vs. concurrent users)
- Written analysis (2-3 pages):
  - Performance bottlenecks
  - Why certain endpoints are slower
  - Scaling recommendations
  - Kubernetes HPA suggestions

---

## Submission Checklist

### Code & Configuration
- [ ] Dockerfiles for all 5 services
- [ ] Kubernetes manifests (deployments, services, ingress)
- [ ] Kafka integration code (producers/consumers)
- [ ] MongoDB schemas and migration scripts
- [ ] Redux implementation (store, slices, actions)
- [ ] Updated `docker-compose.yml` for local development
- [ ] Environment variable templates (`.env.example`)

### Documentation
- [ ] Updated `README.md` with:
  - Docker build/run instructions
  - Kubernetes deployment steps
  - Kafka setup and usage
  - MongoDB migration guide
  - Redux architecture overview
- [ ] Architecture diagram (Lab 2 microservices)
- [ ] API documentation (if changed)

### Screenshots & Evidence
- [ ] AWS deployment screenshots:
  - EC2/EKS cluster running
  - Kubernetes pods status (`kubectl get pods`)
  - Services and endpoints
- [ ] Kafka event flow:
  - Booking request published
  - Owner service consuming event
  - Status update published back
- [ ] Redux DevTools screenshots:
  - Login action dispatched
  - Property search state update
  - Booking creation flow
- [ ] JMeter results:
  - Summary Report
  - Response Time Graph
  - Throughput over time
  - Error Rate

### Test Results
- [ ] JMeter `.jmx` test plan file
- [ ] Performance test results (CSV/HTML)
- [ ] Performance analysis report with:
  - Graphs for all 5 concurrent user levels
  - Bottleneck analysis
  - Optimization recommendations

---

## 📅 Implementation Roadmap (Updated with Decisions)

### Phase 1: Foundation Setup (Days 1-3)
**Goal**: Switch to MongoDB and JWT authentication

**Tasks**:
1. ✅ Install MongoDB locally: `brew install mongodb-community`
2. ✅ Install Mongoose: `npm install mongoose jsonwebtoken bcrypt`
3. ✅ Create Mongoose schemas for:
   - User (combined Traveler/Owner)
   - Property
   - Booking
   - Favorite
4. ✅ Implement JWT authentication:
   - Create `middleware/auth.js` for JWT verification
   - Update login/signup to return JWT tokens
   - Remove session-based auth
5. ✅ Migrate all controllers to use Mongoose
6. ✅ Test all API endpoints with MongoDB

**Deliverable**: Backend running with MongoDB + JWT (no MySQL, no sessions)

---

### Phase 2: Redux Frontend Integration (Days 4-5)
**Goal**: Replace Context API with Redux

**Tasks**:
1. ✅ Install Redux: `npm install @reduxjs/toolkit react-redux`
2. ✅ Create Redux store structure:
   ```
   frontend/src/redux/
   ├── store.js
   ├── slices/
   │   ├── authSlice.js      # JWT, user info
   │   ├── propertySlice.js  # Properties, favorites
   │   └── bookingSlice.js   # Bookings
   ```
3. ✅ Implement JWT storage in Redux
4. ✅ Update all components to use Redux hooks:
   - Replace `useAuth()` with `useSelector(state => state.auth)`
   - Replace `useContext()` with `useDispatch()` for actions
5. ✅ Add Redux DevTools integration
6. ✅ Test all flows (login, search, booking)

**Deliverable**: Frontend using Redux with JWT stored in state

---

### Phase 3: Microservices Architecture (Days 6-9)
**Goal**: Split monolith into 5 independent services

**Tasks**:
1. ✅ Create service directories:
   ```
   services/
   ├── traveler-service/     # Auth, profile, view bookings
   ├── owner-service/        # Properties, manage bookings
   ├── property-service/     # Search, details, favorites
   ├── booking-service/      # Create/update bookings
   └── ai-agent/             # Already separate
   ```
2. ✅ Move routes and controllers to respective services
3. ✅ Create shared utilities:
   - JWT verification middleware (duplicate in each service)
   - Database connection (shared MongoDB connection string)
4. ✅ Create `Dockerfile` for each service:
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   EXPOSE 3001
   CMD ["node", "server.js"]
   ```
5. ✅ Create `docker-compose.yml` for local development:
   ```yaml
   services:
     mongodb:
       image: mongo:7
     traveler-service:
       build: ./services/traveler-service
       ports: ["3001:3001"]
     owner-service:
       build: ./services/owner-service
       ports: ["3002:3002"]
     # ... etc
   ```
6. ✅ Test inter-service communication

**Deliverable**: 5 containerized services running locally via Docker Compose

---

### Phase 4: Kafka Integration (Days 10-12)
**Goal**: Add async messaging for booking workflow

**Tasks**:
1. ✅ Add Kafka to `docker-compose.yml`:
   ```yaml
   zookeeper:
     image: confluentinc/cp-zookeeper:7.4.0
   kafka:
     image: confluentinc/cp-kafka:7.4.0
   ```
2. ✅ Install Kafka client: `npm install kafkajs`
3. ✅ Create Kafka topics:
   - `booking-requests`
   - `owner-notifications`
   - `booking-status-updates`
4. ✅ Implement Producers:
   - `traveler-service`: Publish booking creation
   - `owner-service`: Publish status updates
5. ✅ Implement Consumers:
   - `booking-service`: Listen to `booking-requests`
   - `traveler-service`: Listen to `booking-status-updates`
6. ✅ Test async booking flow:
   ```
   Traveler creates → Kafka → Booking service processes
   Owner updates → Kafka → Traveler notified
   ```
7. ✅ Add error handling and retry logic

**Deliverable**: Booking flow working asynchronously via Kafka

---

### Phase 5: Kubernetes Local Deployment (Days 13-15)
**Goal**: Deploy on Minikube (local K8s cluster)

**Tasks**:
1. ✅ Install tools:
   ```bash
   brew install minikube kubectl helm
   minikube start --cpus=4 --memory=8192
   ```
2. ✅ Create K8s manifests:
   ```
   k8s/
   ├── mongodb-deployment.yaml
   ├── kafka-deployment.yaml
   ├── traveler-deployment.yaml
   ├── owner-deployment.yaml
   ├── property-deployment.yaml
   ├── booking-deployment.yaml
   ├── ai-agent-deployment.yaml
   ├── configmap.yaml
   ├── secrets.yaml
   └── ingress.yaml
   ```
3. ✅ Deploy MongoDB:
   ```bash
   helm install mongodb bitnami/mongodb
   ```
4. ✅ Deploy Kafka:
   ```bash
   helm install kafka bitnami/kafka
   ```
5. ✅ Deploy application services:
   ```bash
   kubectl apply -f k8s/
   ```
6. ✅ Test on Minikube:
   ```bash
   minikube service traveler-service --url
   ```
7. ✅ Configure Horizontal Pod Autoscaler

**Deliverable**: All services running on local Kubernetes (Minikube)

---

### Phase 6: AWS EKS Deployment (Days 16-18)
**Goal**: Deploy to AWS cloud

**Tasks**:
1. ✅ Install AWS tools:
   ```bash
   brew install awscli eksctl
   aws configure
   ```
2. ✅ Create EKS cluster:
   ```bash
   eksctl create cluster \
     --name gotour-cluster \
     --region us-west-2 \
     --nodegroup-name standard-workers \
     --node-type t3.medium \
     --nodes 3
   ```
3. ✅ Deploy MongoDB on EKS:
   ```bash
   kubectl apply -f k8s/mongodb-deployment.yaml
   ```
4. ✅ Deploy Kafka on EKS:
   ```bash
   helm install kafka bitnami/kafka
   ```
5. ✅ Build and push Docker images to AWS ECR:
   ```bash
   aws ecr create-repository --repository-name traveler-service
   docker build -t traveler-service .
   docker tag traveler-service:latest <ECR-URL>/traveler-service:latest
   docker push <ECR-URL>/traveler-service:latest
   ```
6. ✅ Deploy all services to EKS:
   ```bash
   kubectl apply -f k8s/
   ```
7. ✅ Set up LoadBalancer for external access
8. ✅ Test application on AWS

**Deliverable**: Application running on AWS EKS with public URL

---

### Phase 7: JMeter Performance Testing (Days 19-20)
**Goal**: Load test and analyze performance

**Tasks**:
1. ✅ Install JMeter:
   ```bash
   brew install jmeter
   ```
2. ✅ Create test plans:
   - User authentication (login/signup)
   - Property search
   - Booking creation
   - Owner booking management
   - AI agent planning
3. ✅ Run tests on AWS EKS:
   - 100 concurrent users
   - 200 concurrent users
   - 300 concurrent users
   - 400 concurrent users
   - 500 concurrent users
4. ✅ Collect metrics:
   - Average response time
   - 90th/95th/99th percentile
   - Throughput (req/sec)
   - Error rate
5. ✅ Generate graphs and screenshots
6. ✅ Write performance analysis report

**Deliverable**: JMeter test plans, results, graphs, and analysis

---

### Phase 8: Documentation & Submission (Days 21-22)
**Goal**: Prepare final submission

**Tasks**:
1. ✅ Update README.md with:
   - Architecture diagram
   - Docker build instructions
   - Kubernetes deployment steps
   - AWS deployment guide
   - Environment variables
2. ✅ Take screenshots:
   - AWS EKS cluster
   - kubectl get pods
   - Application running on AWS
   - Kafka event flow (logs)
   - Redux DevTools state
   - JMeter results
3. ✅ Write reports:
   - Architecture overview
   - Kafka event flow explanation
   - Performance analysis
4. ✅ Final testing:
   - Complete user journey (signup → search → book → accept)
   - Verify all APIs work
   - Check logs for errors
5. ✅ Commit and push to GitHub
6. ✅ Verify all deliverables

**Deliverable**: Complete submission package

---

## Key Challenges & Considerations

### 1. Microservices Communication
- **Challenge**: Services need to communicate without direct coupling
- **Solution**: Use Kubernetes Services (ClusterIP) and service discovery
- **Authentication**: Share JWT secret across services or use API Gateway

### 2. Session Management
- **Challenge**: Session stickiness with multiple pods
- **Solution**: Use MongoDB for centralized session storage or JWT tokens

### 3. File Uploads
- **Challenge**: Property photos and profile pictures across services
- **Solution**: Use shared PersistentVolume or cloud storage (S3)

### 4. Kafka Event Ordering
- **Challenge**: Ensure booking status updates are processed in order
- **Solution**: Use partition keys (booking_id) and single consumer per partition

### 5. Database Transactions
- **Challenge**: MongoDB doesn't have traditional transactions like MySQL
- **Solution**: Use MongoDB multi-document transactions or implement saga pattern

### 6. Development Workflow
- **Challenge**: Running 5+ services locally
- **Solution**: Docker Compose for local development, Skaffold for K8s development

---

## Technology Stack Summary

### Current (Lab 1)
- **Backend**: Node.js + Express (Monolith)
- **Frontend**: React + Context API
- **Database**: MySQL
- **AI Agent**: Python + FastAPI
- **Auth**: Session-based

### Enhanced (Lab 2)
- **Backend**: Node.js Microservices (5 services)
- **Frontend**: React + Redux
- **Database**: MongoDB
- **Message Queue**: Apache Kafka
- **Orchestration**: Kubernetes
- **Cloud**: AWS (EKS)
- **Containerization**: Docker
- **Testing**: Apache JMeter
- **AI Agent**: Python + FastAPI (containerized)
- **Auth**: JWT + Session (MongoDB)

---

## Estimated Effort

| Component | Estimated Hours | Priority |
|-----------|----------------|----------|
| MongoDB Migration | 8-10 hours | High |
| Redux Integration | 6-8 hours | High |
| Dockerization | 4-6 hours | Medium |
| Microservices Split | 10-12 hours | High |
| Kafka Integration | 8-10 hours | High |
| Kubernetes Setup | 6-8 hours | Medium |
| AWS Deployment | 4-6 hours | Medium |
| JMeter Testing | 4-6 hours | Low |
| Documentation | 4-6 hours | Medium |
| **Total** | **54-72 hours** | |

---

## ✅ Decisions Made

1. **Database**: ✅ **Fully migrate to MongoDB** (remove MySQL completely)
2. **Authentication**: ✅ **JWT tokens** (stateless authentication)
3. **Frontend**: ✅ **Keep single React app** (revisit role-based split later)
4. **AI Agent**: ✅ **Separate service** (5th microservice)
5. **AWS**: ✅ **Use AWS EKS** (easier - managed Kubernetes service)
6. **Kafka**: ✅ **Self-hosted in K8s** (easier - no additional AWS service setup)
7. **Testing**: ✅ **Both local (Minikube) and AWS EKS** (develop locally, validate on AWS)

---

## 🎯 Implementation Strategy Based on Decisions

### Database Migration: MySQL → MongoDB
**What Changes**:
- Remove all MySQL dependencies (`mysql2` package)
- Install MongoDB driver: `npm install mongoose`
- Rewrite all models using Mongoose schemas
- Remove `db.js` (MySQL connection pool)
- Create `mongoose.js` (MongoDB connection)
- Update all controllers to use Mongoose methods

**Authentication Change**:
- Remove `express-session` and `connect-mysql-session`
- Install JWT: `npm install jsonwebtoken`
- Create JWT middleware for route protection
- Store JWT in Redux (frontend)
- Include JWT in `Authorization: Bearer <token>` headers

### Kubernetes Setup: Local → AWS

**Development Environment (Local)**:
- **Tool**: Minikube (easiest for Mac/Linux) or Docker Desktop Kubernetes
- **Why**: Free, runs on laptop, perfect for development
- **Setup**: `brew install minikube` → `minikube start`

**Production Environment (AWS)**:
- **Tool**: AWS EKS (Elastic Kubernetes Service)
- **Why Easier Than Self-Managed**:
  - ✅ AWS manages control plane (master nodes)
  - ✅ Automatic updates and patching
  - ✅ Integrated with AWS IAM, VPC, Load Balancers
  - ✅ No need to manage etcd, API server, scheduler
  - ✅ One command: `eksctl create cluster`
- **Cost**: ~$0.10/hour for control plane + EC2 worker nodes

**Comparison**:
| Feature | Self-Managed K8s on EC2 | AWS EKS |
|---------|------------------------|---------|
| Setup Time | 2-4 hours (complex) | 15-30 min (simple) |
| Master Node Mgmt | Manual | AWS managed ✅ |
| Updates | Manual | Automatic ✅ |
| High Availability | Configure yourself | Built-in ✅ |
| Cost | Cheaper (no control plane fee) | +$72/month control plane |
| **Recommendation** | ❌ Complex | ✅ **Use This** |

### Kafka Setup: AWS MSK vs Self-Hosted

**Option A: Self-Hosted Kafka in K8s (RECOMMENDED)**:
- **Why Easier**:
  - ✅ No additional AWS service to configure
  - ✅ Works same locally and on AWS
  - ✅ Simple Helm chart: `helm install kafka bitnami/kafka`
  - ✅ No extra AWS account permissions needed
  - ✅ Free (uses existing K8s resources)
- **Cons**: 
  - Need to manage Kafka pods (but K8s handles this)
  - Requires persistent volumes

**Option B: AWS MSK (Managed Streaming for Kafka)**:
- **Why More Complex**:
  - ❌ Requires VPC peering/configuration
  - ❌ Additional service to learn
  - ❌ Costs ~$150/month minimum
  - ❌ Different setup for local vs. AWS
  - ❌ More AWS IAM permissions needed
- **Pros**: 
  - AWS manages Kafka brokers
  - Highly available out of the box

**Decision**: ✅ **Use self-hosted Kafka in K8s** (simpler, works locally and on AWS)

### Load Testing: Local vs AWS

**"Local Cluster" Clarification**:
- **Local Cluster** = Minikube/Kind running on your laptop (localhost)
- **AWS Cluster** = EKS running on AWS infrastructure (cloud)

**Recommended Approach**:
1. **Phase 1 - Local Testing (Minikube)**:
   - Test with 10-50 concurrent users
   - Validate functionality
   - Quick iteration and debugging
   - **Limitation**: Limited by laptop resources (CPU/RAM)

2. **Phase 2 - AWS Testing (EKS)**:
   - Test with 100-500 concurrent users
   - Realistic production environment
   - True scalability testing
   - Submit these results for grading

**Why Both**:
- Local: Fast development cycle
- AWS: Real performance metrics for submission

---

## Success Criteria

✅ All 5 services running in Docker containers  
✅ Kubernetes cluster deployed and accessible  
✅ Kafka handling async booking flow successfully  
✅ MongoDB storing all data with encrypted passwords  
✅ Redux managing frontend state (visible in DevTools)  
✅ JMeter tests completed for 100-500 concurrent users  
✅ Application deployed on AWS with screenshots  
✅ All documentation and analysis submitted  

---

## 🚀 Quick Start - What's Next?

### Immediate Next Steps (Choose One)

**Option 1: Start Implementation Now** ⚡
```bash
# I can help you start with Phase 1 immediately:
# - Install MongoDB
# - Create Mongoose schemas
# - Implement JWT authentication
# - Migrate first controller (Auth)
```

**Option 2: Create Detailed Task Plan** 📋
```bash
# I can create a detailed task breakdown with:
# - GitHub issues for tracking
# - Estimated hours per task
# - Dependencies between tasks
# - Checklist for each phase
```

**Option 3: Review and Adjust** 🔍
```bash
# We can:
# - Discuss any concerns about the approach
# - Adjust the timeline
# - Clarify any technical details
# - Review the roadmap again
```

---

### Recommended: Start with Phase 1 (MongoDB + JWT)

**Why start here?**
- ✅ Most foundational change
- ✅ Can be done independently
- ✅ Doesn't require Docker/K8s yet
- ✅ Tests your current setup
- ✅ Provides immediate value

**First command to run:**
```bash
# Install MongoDB on Mac
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community

# Verify it's running
mongosh
```

**Then I'll help you with:**
1. Creating Mongoose schemas (`models/User.js`, `models/Property.js`, etc.)
2. Implementing JWT middleware (`middleware/auth.js`)
3. Updating `authController.js` to use JWT
4. Testing login/signup with JWT

**Time estimate**: 2-3 hours for basic setup, 6-8 hours for complete migration

---

### Questions Before We Start?

1. Do you have MongoDB installed already?
2. Do you have an AWS account set up?
3. Are you familiar with JWT authentication?
4. Do you want to start now or need time to review?
5. Any concerns about the 3-week timeline?

---

### Tools You'll Need

**Already Have (Assuming)**:
- ✅ Node.js
- ✅ npm
- ✅ Git
- ✅ VS Code / IDE
- ✅ Terminal

**Need to Install**:
- [ ] MongoDB: `brew install mongodb-community`
- [ ] Docker Desktop: Download from docker.com
- [ ] Minikube: `brew install minikube`
- [ ] kubectl: `brew install kubectl`
- [ ] Helm: `brew install helm`
- [ ] AWS CLI: `brew install awscli`
- [ ] eksctl: `brew install eksctl`
- [ ] JMeter: `brew install jmeter`

**Install all at once:**
```bash
brew install mongodb-community minikube kubectl helm awscli eksctl jmeter
```

---

## 📚 Additional Resources

### Learning Materials
- **Mongoose**: https://mongoosejs.com/docs/guide.html
- **JWT**: https://jwt.io/introduction
- **Redux Toolkit**: https://redux-toolkit.js.org/tutorials/quick-start
- **Docker**: https://docs.docker.com/get-started/
- **Kubernetes**: https://kubernetes.io/docs/tutorials/kubernetes-basics/
- **Kafka**: https://kafka.js.org/docs/getting-started
- **AWS EKS**: https://docs.aws.amazon.com/eks/latest/userguide/getting-started.html
- **JMeter**: https://jmeter.apache.org/usermanual/get-started.html

### Commands Cheat Sheet
```bash
# MongoDB
mongosh                          # Connect to MongoDB
show dbs                         # List databases
use airbnb_db                    # Switch to database

# Docker
docker build -t service-name .   # Build image
docker ps                        # List containers
docker logs <container-id>       # View logs

# Kubernetes
kubectl get pods                 # List pods
kubectl logs <pod-name>          # View logs
kubectl describe pod <pod-name>  # Detailed info

# Minikube
minikube start                   # Start local cluster
minikube dashboard               # Open dashboard
minikube service <name> --url    # Get service URL

# AWS EKS
eksctl create cluster            # Create cluster
kubectl config current-context   # Check context
aws eks update-kubeconfig        # Configure kubectl
```

---

## 💬 Let's Begin!

**I'm ready to help you with any of the following:**
1. ✅ Start Phase 1 implementation (MongoDB + JWT)
2. ✅ Create a detailed GitHub project board
3. ✅ Set up development environment
4. ✅ Answer technical questions
5. ✅ Review architecture decisions
6. ✅ Create initial Docker/K8s files

**Just let me know what you'd like to do first!** 🚀

---

*End of Requirements Document - Ready to implement!*

