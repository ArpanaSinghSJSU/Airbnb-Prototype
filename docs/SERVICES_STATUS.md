# GoTour Microservices - Service Status & Configuration

## Overview
This document provides a comprehensive overview of all microservices running in the GoTour Airbnb Prototype application, including their ports, health endpoints, and connectivity status.

---

## Service Status Table

| Service Name | Port | Container Name | Status | Health Endpoint | Description |
|--------------|------|----------------|--------|-----------------|-------------|
| **Traveler Service** | 3001 | `gotour-traveler-service` | ✅ Running | `http://localhost:3001/health` | Handles traveler authentication, profile management, and booking history |
| **Owner Service** | 3002 | `gotour-owner-service` | ✅ Running | `http://localhost:3002/health` | Manages owner profiles, dashboard, and property ownership |
| **Property Service** | 3003 | `gotour-property-service` | ✅ Running | `http://localhost:3003/health` | Handles property listings, search, favorites, and CRUD operations |
| **Booking Service** | 3004 | `gotour-booking-service` | ✅ Running | `http://localhost:3004/health` | Manages bookings, reservations, and booking status updates |
| **AI Agent** | 8000 | `gotour-ai-agent` | ⚠️ Optional | `http://localhost:8000/health` | AI-powered travel concierge (requires API keys) |
| **MongoDB** | 27017 | `gotour-mongodb` | ✅ Running | - | Primary database for all services |
| **Mongo Express** | 8081 | `gotour-mongo-express` | ✅ Running | `http://localhost:8081` | Web-based MongoDB admin interface |
| **Frontend** | 3000 | N/A (local) | ✅ Running | `http://localhost:3000` | React frontend application |

---

## Service Details

### 1. Traveler Service (Port 3001)
**Purpose:** Authentication and traveler-specific operations

**Endpoints:**
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/check` - Check authentication status
- `GET /traveler/profile` - Get traveler profile
- `PUT /traveler/profile` - Update traveler profile
- `POST /traveler/profile/picture` - Upload profile picture
- `GET /traveler/history` - Get booking history

**Environment Variables:**
```env
PORT=3001
MONGODB_URI=mongodb://admin:admin123@mongodb:27017/gotour_db?authSource=admin
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_min_32_chars
JWT_EXPIRE=7d
UPLOAD_PATH=./uploads
```

---

### 2. Owner Service (Port 3002)
**Purpose:** Owner-specific profile and dashboard management

**Endpoints:**
- `GET /owner/profile` - Get owner profile
- `PUT /owner/profile` - Update owner profile
- `POST /owner/profile/picture` - Upload profile picture
- `GET /owner/dashboard` - Get owner dashboard with statistics

**Environment Variables:**
```env
PORT=3002
MONGODB_URI=mongodb://admin:admin123@mongodb:27017/gotour_db?authSource=admin
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_min_32_chars
JWT_EXPIRE=7d
UPLOAD_PATH=./uploads
```

---

### 3. Property Service (Port 3003)
**Purpose:** Property listings, search, and management

**Endpoints:**
- `GET /properties/search` - Search properties with filters
- `GET /properties/:id` - Get property details by ID
- `POST /properties` - Create new property (owner only)
- `PUT /properties/:id` - Update property (owner only)
- `DELETE /properties/:id` - Delete property (owner only)
- `POST /properties/:id/photos` - Upload property photos
- `GET /properties/owner/properties` - Get owner's properties
- `POST /favorites` - Add property to favorites
- `GET /favorites` - Get user's favorite properties
- `DELETE /favorites/:propertyId` - Remove from favorites

**Environment Variables:**
```env
PORT=3003
MONGODB_URI=mongodb://admin:admin123@mongodb:27017/gotour_db?authSource=admin
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_min_32_chars
JWT_EXPIRE=7d
UPLOAD_PATH=./uploads
```

---

### 4. Booking Service (Port 3004)
**Purpose:** Booking creation and management

**Endpoints:**
- `POST /bookings` - Create new booking (traveler only)
- `GET /bookings/traveler` - Get traveler's bookings
- `GET /bookings/owner` - Get owner's property bookings
- `GET /bookings/:id` - Get booking details by ID
- `PUT /bookings/:id/accept` - Accept booking (owner only)
- `PUT /bookings/:id/cancel` - Cancel booking

**Environment Variables:**
```env
PORT=3004
MONGODB_URI=mongodb://admin:admin123@mongodb:27017/gotour_db?authSource=admin
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_min_32_chars
JWT_EXPIRE=7d
```

---

### 5. AI Agent Service (Port 8000)
**Purpose:** AI-powered travel planning and recommendations

**Status:** ⚠️ Optional (requires external API keys)

**Endpoints:**
- `POST /api/concierge/plan-from-booking` - Generate travel plan from booking
- `GET /health` - Health check endpoint

**Environment Variables:**
```env
PORT=8000
MONGODB_URI=mongodb://admin:admin123@mongodb:27017/gotour_db?authSource=admin
OPENAI_API_KEY=<your-openai-api-key>
TAVILY_API_KEY=<your-tavily-api-key>
```

**Note:** This service requires valid API keys from OpenAI and Tavily to function. Without these keys, the service will fail to start but won't affect other microservices.

---

### 6. MongoDB (Port 27017)
**Purpose:** Primary database for all services

**Configuration:**
- **Database Name:** `gotour_db`
- **Admin Username:** `admin`
- **Admin Password:** `admin123`
- **Connection String:** `mongodb://admin:admin123@mongodb:27017/gotour_db?authSource=admin`

**Collections:**
- `users` - User accounts (travelers and owners)
- `properties` - Property listings
- `bookings` - Booking records
- `favorites` - User favorites

**Access:**
- Direct connection: `mongodb://localhost:27017`
- Via Mongo Express: `http://localhost:8081`

---

### 7. Mongo Express (Port 8081)
**Purpose:** Web-based MongoDB administration interface

**Access:**
- **URL:** `http://localhost:8081`
- **Username:** `admin`
- **Password:** `admin123`

**Features:**
- View and edit database collections
- Execute queries
- Import/export data
- Database statistics

---

### 8. Frontend (Port 3000)
**Purpose:** User-facing React application

**Access:** `http://localhost:3000`

**API Configuration:**
```javascript
TRAVELER_SERVICE_URL = 'http://localhost:3001'
OWNER_SERVICE_URL = 'http://localhost:3002'
PROPERTY_SERVICE_URL = 'http://localhost:3003'
BOOKING_SERVICE_URL = 'http://localhost:3004'
AI_AGENT_URL = 'http://localhost:8000'
```

**Technology Stack:**
- React 18
- Redux Toolkit (State Management)
- React Router (Routing)
- Axios (HTTP Client)
- Tailwind CSS (Styling)

---

## Health Check Commands

### Check All Services at Once
```bash
./test-microservices-integration.sh
```

### Individual Health Checks
```bash
# Traveler Service
curl http://localhost:3001/health

# Owner Service
curl http://localhost:3002/health

# Property Service
curl http://localhost:3003/health

# Booking Service
curl http://localhost:3004/health

# AI Agent (if running)
curl http://localhost:8000/health
```

---

## Docker Container Management

### View Running Containers
```bash
docker ps
```

### View Container Logs
```bash
# Traveler Service
docker logs gotour-traveler-service

# Owner Service
docker logs gotour-owner-service

# Property Service
docker logs gotour-property-service

# Booking Service
docker logs gotour-booking-service

# AI Agent
docker logs gotour-ai-agent

# MongoDB
docker logs gotour-mongodb
```

### Restart a Service
```bash
docker restart gotour-<service-name>
```

### Stop All Services
```bash
docker-compose down
```

### Start All Services
```bash
docker-compose up -d
# or use the provided script
./start-microservices.sh
```

---

## Network Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (localhost:3000)                │
│                    React + Redux + JWT                      │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
        ┌───────▼──────┐ ┌───▼──────┐ ┌───▼──────┐
        │  Traveler    │ │  Owner   │ │ Property │
        │  Service     │ │ Service  │ │ Service  │
        │  :3001       │ │  :3002   │ │  :3003   │
        └──────┬───────┘ └────┬─────┘ └────┬─────┘
               │              │            │
               │         ┌────▼─────┐      │
               │         │ Booking  │      │
               │         │ Service  │      │
               │         │  :3004   │      │
               │         └────┬─────┘      │
               │              │            │
               └──────────────┼────────────┘
                              │
                    ┌─────────▼─────────┐
                    │   MongoDB :27017  │
                    │   gotour_db       │
                    └───────────────────┘
```

---

## Service Communication

### Authentication Flow
1. Frontend sends credentials to **Traveler Service** (3001)
2. Traveler Service validates and returns JWT token
3. Frontend stores token in Redux + localStorage
4. All subsequent requests include JWT in Authorization header

### Property Search Flow
1. Frontend → **Property Service** (3003) `/properties/search`
2. Property Service queries MongoDB
3. Returns filtered property results

### Booking Creation Flow
1. Frontend → **Booking Service** (3004) `/bookings`
2. Booking Service validates property availability
3. Creates booking record in MongoDB
4. Returns booking confirmation

### Owner Property Management Flow
1. Frontend → **Property Service** (3003) with owner JWT
2. Property Service validates owner permissions
3. Performs CRUD operations on properties
4. Returns updated property data

---

## Environment Variables Summary

### Shared Variables (All Services)
```env
MONGODB_URI=mongodb://admin:admin123@mongodb:27017/gotour_db?authSource=admin
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_min_32_chars
JWT_EXPIRE=7d
```

### Service-Specific Variables
```env
# Traveler Service
PORT=3001
UPLOAD_PATH=./uploads

# Owner Service
PORT=3002
UPLOAD_PATH=./uploads

# Property Service
PORT=3003
UPLOAD_PATH=./uploads

# Booking Service
PORT=3004

# AI Agent
PORT=8000
OPENAI_API_KEY=<required>
TAVILY_API_KEY=<required>
```

---

## Troubleshooting

### Service Not Responding
```bash
# Check if container is running
docker ps | grep gotour-<service-name>

# View logs for errors
docker logs gotour-<service-name>

# Restart the service
docker restart gotour-<service-name>
```

### Database Connection Issues
```bash
# Verify MongoDB is running
docker ps | grep mongodb

# Check MongoDB logs
docker logs gotour-mongodb

# Test MongoDB connection
mongosh mongodb://admin:admin123@localhost:27017/gotour_db?authSource=admin
```

### Frontend Can't Connect to Services
1. Verify all services are running: `docker ps`
2. Check health endpoints: `curl http://localhost:3001/health`
3. Verify CORS settings in service configurations
4. Check browser console for error messages

---

## Quick Reference

| Action | Command |
|--------|---------|
| Start all services | `./start-microservices.sh` or `docker-compose up -d` |
| Stop all services | `docker-compose down` |
| View logs | `docker logs <container-name>` |
| Test integration | `./test-microservices-integration.sh` |
| Access frontend | `http://localhost:3000` |
| Access Mongo Express | `http://localhost:8081` (admin/admin123) |
| Rebuild services | `docker-compose up -d --build` |

---

## Last Updated
**Date:** November 20, 2025  
**Status:** All core services operational ✅  
**Version:** 1.0.0

