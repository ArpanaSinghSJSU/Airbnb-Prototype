# Airbnb Prototype

A full-stack Airbnb clone with Node.js/Express backend, React frontend, and Python AI Concierge Agent.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Status](#project-status)
- [Contributing](#contributing)

---

## ✨ Features

### Traveler Features
- ✅ User registration and authentication
- ✅ Profile management with photo upload
- ✅ Property search (location, dates, guests)
- ✅ Property details and booking
- ✅ Booking management (view, cancel)
- ✅ Favorites system
- ✅ Booking history

### Owner Features
- ✅ User registration and authentication
- ✅ Profile management with photo upload
- ✅ Property posting with photos
- ✅ Property management (CRUD operations)
- ✅ Booking request management (accept/cancel)
- ✅ Dashboard with statistics

### AI Concierge Agent ✅
- ✅ Personalized trip planning with day-by-day itineraries
- ✅ Activity recommendations filtered by interests and accessibility
- ✅ Restaurant suggestions with dietary restriction filtering
- ✅ Weather-aware packing checklist
- ✅ Natural language query support
- ✅ Integration with Tavily web search for real-time local data

---

## 🛠 Tech Stack

### Backend (Completed)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: Express-session + bcrypt.js
- **File Upload**: Multer
- **Validation**: Express-validator

### Frontend (Completed)
- **Framework**: React
- **Styling**: TailwindCSS
- **Routing**: React Router
- **HTTP Client**: Axios
- **State Management**: Context API

### AI Agent (Completed)
- **Framework**: Python FastAPI
- **LLM**: Langchain + OpenAI GPT
- **Web Search**: Tavily API
- **Database**: MySQL (shared with backend)
- **Weather**: OpenWeather API (optional)

---

## 📁 Project Structure

```
Airbnb-Prototype/
├── config/                 # Database configuration
│   └── db.js
├── controllers/            # Request handlers
│   ├── authController.js
│   ├── bookingController.js
│   ├── dataController.js
│   ├── favoriteController.js
│   ├── ownerController.js
│   ├── propertyController.js
│   └── travelerController.js
├── middleware/             # Custom middleware
│   ├── auth.js
│   ├── upload.js
│   └── validation.js
├── models/                 # Database models
│   ├── Booking.js
│   ├── Favorite.js
│   ├── Owner.js
│   ├── Property.js
│   ├── Traveler.js
│   └── User.js
├── routes/                 # API routes
│   ├── authRoutes.js
│   ├── bookingRoutes.js
│   ├── dataRoutes.js
│   ├── favoriteRoutes.js
│   ├── ownerRoutes.js
│   ├── propertyRoutes.js
│   └── travelerRoutes.js
├── utils/                  # Utility functions
│   ├── countries.js
│   └── helpers.js
├── uploads/                # User uploaded files
│   ├── profiles/
│   └── properties/
├── frontend/               # React frontend application
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   │   ├── traveler/   # Traveler pages
│   │   │   └── owner/      # Owner pages
│   │   ├── services/       # API services
│   │   └── App.js          # Main app component
│   └── package.json
├── ai-agent/               # Python AI Concierge Agent
│   ├── agent.py            # AI agent logic
│   ├── config.py           # Configuration
│   ├── database.py         # Database utilities
│   ├── main.py             # FastAPI application
│   ├── models.py           # Pydantic models
│   ├── utils.py            # Helper functions
│   ├── requirements.txt    # Python dependencies
│   ├── setup.sh            # Setup script
│   └── README.md           # AI agent documentation
├── .env.example            # Environment variables template
├── .gitignore             # Git ignore rules
├── init-db.sql            # Database initialization script
├── package.json           # Node.js dependencies
├── REQUIREMENTS.md        # Project requirements
├── swagger.yaml           # API documentation
└── server.js              # Backend server
```

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** (v6 or higher)
- **MySQL** (v5.7 or higher)
- **Git**

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Airbnb-Prototype
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Verify Installation

```bash
npm list --depth=0
```

You should see all dependencies from `package.json` installed.

---

## ⚙️ Configuration

### 1. Create Environment File

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

### 2. Edit `.env` File

Open `.env` and configure the following variables:

```env
# Server Configuration
PORT=5002
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=airbnb_db

# Session Configuration (Generate a strong random key)
SESSION_SECRET=your_very_strong_random_secret_key

# Frontend Configuration
FRONTEND_URL=http://localhost:3000
```

**⚠️ Important:** 
- Replace `your_mysql_password` with your actual MySQL password
- Generate a strong random string for `SESSION_SECRET`

---

## 🗄 Database Setup

### Method 1: Using Init Script (Recommended)

This method creates the database, tables, and populates sample data:

```bash
mysql -u root -p < init-db.sql
```

Enter your MySQL password when prompted.

### Method 2: Manual Setup

If you prefer to set up manually without sample data:

```bash
mysql -u root -p < schema.sql
```

### Verify Database Setup

```bash
mysql -u root -p
```

Then run:

```sql
USE airbnb_db;
SHOW TABLES;
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM properties;
```

You should see 4 tables: `users`, `properties`, `bookings`, `favorites`

---

## ▶️ Running the Application

### Development Mode (with auto-restart)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start on `http://localhost:5002`

### Verify Server is Running

Open your browser or use curl:

```bash
curl http://localhost:5002/api/health
```

You should see:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-10-24T..."
}
```

### Running the Frontend

In a separate terminal:

```bash
cd frontend
npm start
```

Frontend will open at `http://localhost:3000`

### Running the AI Agent

In a third terminal:

```bash
cd ai-agent
source venv/bin/activate  # Activate Python virtual environment
python main.py
```

AI Agent will start on `http://localhost:8000`

**📖 See `ai-agent/README.md` for detailed setup instructions**

---

## 📚 API Documentation

### Interactive Swagger UI Documentation

**🎉 View complete API documentation with interactive testing:**

```
http://localhost:5002/api-docs
```

The Swagger UI provides:
- ✅ Complete API reference for all 32 endpoints
- ✅ Request/response schemas
- ✅ Interactive "Try it out" feature
- ✅ Authentication requirements
- ✅ Example requests and responses

### Base URL

```
http://localhost:5002/api
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/signup` | Register new user | No |
| POST | `/auth/login` | Login user | No |
| POST | `/auth/logout` | Logout user | Yes |
| GET | `/auth/check` | Check auth status | Yes |

### Traveler Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/traveler/profile` | Get traveler profile | Yes (Traveler) |
| PUT | `/traveler/profile` | Update profile | Yes (Traveler) |
| POST | `/traveler/profile/picture` | Upload profile pic | Yes (Traveler) |
| GET | `/traveler/history` | Get booking history | Yes (Traveler) |

### Owner Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/owner/profile` | Get owner profile | Yes (Owner) |
| PUT | `/owner/profile` | Update profile | Yes (Owner) |
| POST | `/owner/profile/picture` | Upload profile pic | Yes (Owner) |
| GET | `/owner/dashboard` | Get dashboard stats | Yes (Owner) |

### Property Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/properties/search` | Search properties | No |
| GET | `/properties/:id` | Get property details | No |
| POST | `/properties` | Create property | Yes (Owner) |
| PUT | `/properties/:id` | Update property | Yes (Owner) |
| DELETE | `/properties/:id` | Delete property | Yes (Owner) |
| POST | `/properties/:id/photos` | Upload photos | Yes (Owner) |

### Booking Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/bookings` | Create booking | Yes (Traveler) |
| GET | `/bookings/traveler` | Get traveler bookings | Yes (Traveler) |
| GET | `/bookings/owner` | Get owner bookings | Yes (Owner) |
| PUT | `/bookings/:id/accept` | Accept booking | Yes (Owner) |
| PUT | `/bookings/:id/cancel` | Cancel booking | Yes |
| GET | `/bookings/:id` | Get booking details | Yes |

### Favorites Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/favorites` | Add to favorites | Yes (Traveler) |
| GET | `/favorites` | Get favorites | Yes (Traveler) |
| DELETE | `/favorites/:propertyId` | Remove from favorites | Yes (Traveler) |

### Data Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/data/countries` | Get countries list | No |
| GET | `/data/states?country=USA` | Get states by country | No |

---

## 🔍 Testing the API

### Using curl

**Sign up:**
```bash
curl -X POST http://localhost:5002/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "traveler"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5002/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Get Properties:**
```bash
curl -X GET "http://localhost:5002/api/properties/search?location=Miami" \
  -b cookies.txt
```

### Using Postman

1. Import the API endpoints
2. Set base URL: `http://localhost:5002/api`
3. Enable cookies for session management
4. Test each endpoint

---

## 📊 Project Status

### Completed ✅
- ✅ Backend API (85% complete)
- ✅ Database schema and models
- ✅ Authentication & authorization
- ✅ Property management
- ✅ Booking system with date blocking
- ✅ Favorites system
- ✅ File upload system
- ✅ Validation & error handling

### In Progress 🚧
- 🚧 Frontend React application
- 🚧 AI Concierge Agent (Python FastAPI)

### Pending 📝
- 📝 Unit tests
- 📝 Integration tests
- 📝 API rate limiting
- 📝 Production deployment setup

---

## 🐛 Troubleshooting

### MySQL Connection Error

**Error:** `Error connecting to database: ER_ACCESS_DENIED_ERROR`

**Solution:**
1. Verify MySQL credentials in `.env`
2. Ensure MySQL server is running: `mysql.server status`
3. Test connection: `mysql -u root -p`

### Port Already in Use

**Error:** `Port 5002 is already in use`

**Solution:**
1. Change PORT in `.env` to different value (e.g., 5003)
2. Or kill the process using port 5002:
```bash
lsof -ti:5002 | xargs kill -9
```

### Session Not Persisting

**Solution:**
- Ensure SESSION_SECRET is set in `.env`
- Check that cookies are enabled in your client
- Verify CORS credentials are set to true

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

## 👥 Authors

- Backend Development: ✅ Complete
- Frontend Development: 🚧 In Progress
- AI Agent Development: 📝 Pending

---

## 📞 Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review the [API Documentation](#api-documentation)
3. Check `PROJECT_ANALYSIS.md` for detailed implementation status

---

## 🎯 Next Steps

1. **For Development:**
   - Set up React frontend
   - Build UI components
   - Integrate with backend APIs
   - Implement AI Agent service

2. **For Testing:**
   - Use Postman to test all API endpoints
   - Test user registration and login flow
   - Test property creation and booking flow
   - Test favorites functionality

3. **For Deployment:**
   - Set up production database
   - Configure environment variables
   - Set up HTTPS
   - Deploy backend to cloud service
   - Deploy frontend separately

---

**Happy Coding! 🚀**
