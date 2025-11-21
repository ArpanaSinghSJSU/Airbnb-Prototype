# GoTour

A full-stack travel platform with Node.js/Express backend, React frontend, and Python AI Concierge Agent.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)

---

## Overview

This is **GoTour**, a travel booking and trip planning platform consisting of three main components:

### **1. Backend (Node.js/Express)** 
- **Port**: `5002`
- **Purpose**: RESTful API server handling authentication, property management, bookings, and favorites
- **Database**: MySQL for persistent data storage
- **Authentication**: Session-based with bcrypt password hashing
- **Features**: 
  - User authentication (travelers & owners)
  - Property CRUD operations with photo uploads
  - Booking system with date validation and status management
  - Favorites system
  - Profile management with photo uploads

### **2. Frontend (React)** 
- **Port**: `3000`
- **Purpose**: User interface for travelers and property owners
- **Styling**: TailwindCSS for modern, responsive design
- **Features**:
  - Separate dashboards for travelers and owners
  - Property search and booking interface
  - Interactive AI Travel Concierge (chat interface)
  - Profile and booking management
  - Favorites and history tracking

### **3. AI Agent (Python/FastAPI)** 
- **Port**: `8000`
- **Purpose**: AI-powered travel concierge for personalized trip planning
- **LLM**: OpenAI GPT via Langchain
- **Search**: Tavily API for real-time attraction and restaurant data
- **Features**:
  - Day-by-day itinerary generation
  - Activity recommendations based on interests
  - Restaurant suggestions with cuisine and dietary preferences
  - Weather-aware packing lists
  - Natural language query processing

---

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: Express-session + bcrypt.js
- **File Upload**: Multer
- **Validation**: Express-validator

### Frontend
- **Framework**: React
- **Styling**: TailwindCSS
- **Routing**: React Router
- **HTTP Client**: Axios
- **State Management**: Context API

### AI Agent
- **Framework**: Python FastAPI
- **LLM**: Langchain + OpenAI GPT
- **Web Search**: Tavily API
- **Database**: MySQL (shared with backend)

---

### **Verify Installation:**

```bash
# Check Node.js
node --version 

# Check npm
npm --version 

# Check MySQL
mysql --version

# Check Python (for AI agent)
python --version

# Check MySQL is running
mysql -u root -p  # Enter root password
```

---

## Installation & Setup

Follow these steps to set up all three components of the application.

### **Step 1: Clone the Repository**

```bash
git clone <repository-url>
cd Airbnb-Prototype
```

---

### **Step 2: Backend Setup (Node.js/Express)**

#### 2.1 Install Backend Dependencies

```bash
npm install
```

Verify installation:
```bash
npm list --depth=0
```

#### 2.2 Configure Backend Environment

Create environment file:
```bash
cp .env.example .env
```

Edit `.env` with your settings:
```env
# Server Configuration
PORT=5002
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=<your_mysql_password_here>
DB_NAME=airbnb_db

# Frontend Configuration
FRONTEND_URL=http://localhost:3000
```

#### 2.3 Setup MySQL Database

This creates the database, tables, and sample data:
```bash
mysql -u root -p < init-db.sql
```

**Verify Database:**
```bash
mysql -u root -p -e "USE airbnb_db; SHOW TABLES; SELECT COUNT(*) FROM users;"
```

You should see 4 tables and 7 sample users.

---

### **Step 3: Frontend Setup (React)**

#### 3.1 Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

**Note:** No additional configuration needed for frontend. It's already configured to connect to backend on port 5002.

---

### **Step 4: AI Agent Setup (Python/FastAPI)**

#### 4.1 Create Python Virtual Environment

**Using conda:**
```bash
cd ai-agent
conda create -n airbnb-ai python=3.9
conda activate airbnb-ai
```

#### 4.2 Install Python Dependencies

```bash
pip install -r requirements.txt
```

#### 4.3 Configure AI Agent Environment

Create environment file:
```bash
cp env.example .env
```

Edit `ai-agent/.env` with your API keys:
```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Tavily Search API
TAVILY_API_KEY=your_tavily_api_key_here

# OpenWeather API (Optional)
OPENWEATHER_API_KEY=your_openweather_key_here  # Optional

# Database Configuration (should match backend)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=airbnb_db

# FastAPI Configuration
HOST=0.0.0.0
PORT=8000
```

---

## ▶️ Running the Application

You need to run **all three components** in separate terminal windows/tabs for the full application to work.

### **Quick Start: Run All Components**

Open **3 separate terminals** and run:

#### **Terminal 1: Backend (Node.js)**
```bash
# From project root
npm start
```
- Backend will start on `http://localhost:5002`

#### **Terminal 2: Frontend (React)**
```bash
# From project root
cd frontend
npm start
```
- Frontend will open automatically at `http://localhost:3000`

#### **Terminal 3: AI Agent (Python)**
```bash
# From project root
cd ai-agent
conda activate airbnb-ai
python main.py
```
- AI Agent will start on `http://localhost:8000`

---

### **API Documentations**

#### **1. Backend API documentation (Swagger)**
Open browser: http://localhost:5002/api-docs

#### **2. AI Agent API documentation (Swagger)**
Open browser: http://localhost:8000/docs


### **Access the Application**

Once all three components are running:

1. **Open Frontend**: http://localhost:3000
2. **Login as Traveler**: Use test account `john.traveler@example.com`
3. **Go to "My Bookings"**: You'll see accepted bookings
4. **Click AI Button**: Bottom-right corner
5. **Ask AI**: "Plan trip with Mexican restaurants and kids"
6. **Get Itinerary**: AI generates personalized day-by-day plan

---

### **Stopping the Application**

To stop each component:
- Press `Ctrl + C` in each terminal

To deactivate Python conda environment:
```bash
conda deactivate 
```
