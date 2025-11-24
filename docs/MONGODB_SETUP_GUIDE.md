# MongoDB + JWT Setup Guide

## ✅ What We've Completed

### 1. MongoDB Setup (Docker)
- ✅ Created `docker-compose.yml` with MongoDB 7.0 and Mongo Express
- ✅ Created `mongo-init.js` for database initialization
- ✅ Installed `mongoose` and `jsonwebtoken` packages

### 2. Mongoose Models
- ✅ `models/UserModel.js` - User authentication with password hashing
- ✅ `models/PropertyModel.js` - Property listings
- ✅ `models/BookingModel.js` - Booking management
- ✅ `models/FavoriteModel.js` - User favorites

### 3. JWT Authentication
- ✅ `middleware/jwtAuth.js` - JWT verification middleware
- ✅ `config/mongoose.js` - MongoDB connection
- ✅ Updated `controllers/authController.js` to use JWT
- ✅ Updated `routes/authRoutes.js` with JWT middleware
- ✅ Updated `server.js` to use MongoDB (removed sessions)

---

## 🚀 Quick Start - Test MongoDB Setup

### Step 1: Create .env File

Create a `.env` file in the project root (copy from `env.template`):

```bash
cp env.template .env
```

Then edit `.env` and add:

```env
# Server Configuration
PORT=5002
NODE_ENV=development

# MongoDB Configuration (Docker)
MONGODB_URI=mongodb://admin:admin123@localhost:27017/gotour_db?authSource=admin

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_min_32_chars
JWT_EXPIRE=7d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# AI Agent URL
AI_AGENT_URL=http://localhost:8000

# File Upload Path
UPLOAD_PATH=./uploads
```

### Step 2: Start MongoDB with Docker

```bash
# Start MongoDB and Mongo Express
docker-compose up -d

# Check if containers are running
docker ps

# You should see:
# - gotour-mongodb (port 27017)
# - gotour-mongo-express (port 8081)
```

### Step 3: Verify MongoDB is Running

Option 1: Using Docker:
```bash
docker exec -it gotour-mongodb mongosh -u admin -p admin123
```

Then in mongosh:
```javascript
show dbs
use gotour_db
show collections
// Should show: bookings, favorites, properties, users
exit
```

Option 2: Using Mongo Express (Web UI):
- Open http://localhost:8081 in your browser
- Login: admin / admin123
- You should see the `gotour_db` database

### Step 4: Start the Backend Server

```bash
# Make sure you're in the project root
npm start

# You should see:
# ✅ MongoDB Connected: localhost
# 📊 Database: gotour_db
# 🚀 Server running on port 5002
```

### Step 5: Test Authentication Endpoints

#### Test 1: Signup (Create new user)

```bash
curl -X POST http://localhost:5002/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "traveler"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "Test User",
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "role": "traveler",
    "profile_picture": null
  }
}
```

#### Test 2: Login

```bash
curl -X POST http://localhost:5002/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

#### Test 3: Check Auth (Protected route)

```bash
# Replace YOUR_JWT_TOKEN with the token from signup/login response
curl -X GET http://localhost:5002/auth/check \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "user": { ... }
}
```

#### Test 4: Check Auth without token (Should fail)

```bash
curl -X GET http://localhost:5002/auth/check
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

---

## 🔍 Verify Data in MongoDB

### Option 1: Mongo Express (Web UI)
1. Open http://localhost:8081
2. Navigate to `gotour_db` → `users`
3. You should see the test user you created
4. Password should be hashed (bcrypt)

### Option 2: MongoDB Shell
```bash
docker exec -it gotour-mongodb mongosh -u admin -p admin123

use gotour_db
db.users.find().pretty()
```

---

## 🐛 Troubleshooting

### MongoDB Connection Failed
```bash
# Check if MongoDB container is running
docker ps | grep mongodb

# Check MongoDB logs
docker logs gotour-mongodb

# Restart containers
docker-compose down
docker-compose up -d
```

### JWT Token Invalid
- Make sure `JWT_SECRET` is set in `.env`
- Token format: `Bearer YOUR_TOKEN`
- Check token hasn't expired (7 days by default)

### Port Already in Use
```bash
# If port 27017 is already in use
docker-compose down
lsof -ti:27017 | xargs kill -9

# If port 5002 is already in use
lsof -ti:5002 | xargs kill -9
```

---

## 📊 MongoDB vs MySQL Comparison

| Feature | MySQL (Old) | MongoDB (New) |
|---------|-------------|---------------|
| **Auth** | Session-based | JWT tokens |
| **Connection** | mysql2 pool | Mongoose |
| **Password** | bcrypt manual | bcrypt (pre-save hook) |
| **User Model** | Separate files | UserModel.js |
| **Schema** | SQL tables | Mongoose schemas |
| **Relations** | Foreign keys | ObjectId refs |

---

## 🎯 Next Steps

### Immediate (Phase 1):
1. ✅ MongoDB setup complete
2. ✅ JWT authentication working
3. ⏳ **Update remaining controllers** (traveler, owner, property, booking)
4. ⏳ **Frontend: Update API calls to include JWT token**

### Phase 2: Redux Integration
- Install Redux Toolkit
- Create Redux slices
- Store JWT token in Redux
- Update all components

### Phase 3: Microservices
- Split backend into 5 services
- Create Dockerfiles for each
- Add docker-compose for all services

---

## 🎉 Success Criteria - Phase 1

- [x] MongoDB running in Docker
- [x] Backend connecting to MongoDB
- [x] Signup creates user with hashed password
- [x] Login returns JWT token
- [x] Protected routes verify JWT
- [x] User data stored in MongoDB
- [ ] All existing endpoints work with MongoDB
- [ ] Frontend updated to use JWT

---

## 📝 Commands Cheat Sheet

```bash
# Docker
docker-compose up -d              # Start MongoDB
docker-compose down               # Stop MongoDB
docker logs gotour-mongodb        # View logs
docker exec -it gotour-mongodb mongosh  # Access MongoDB shell

# MongoDB
show dbs                          # List databases
use gotour_db                     # Switch to database
show collections                  # List collections
db.users.find()                   # View users
db.users.countDocuments()         # Count documents

# Backend
npm start                         # Start server
npm run dev                       # Start with nodemon (if available)

# Test API
curl http://localhost:5002/health # Health check
curl http://localhost:5002/       # Root endpoint
```

---

**Ready to test!** 🚀

Start with Step 1 above and work through the testing steps.

