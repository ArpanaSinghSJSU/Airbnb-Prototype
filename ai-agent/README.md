# AI Concierge Agent 🤖

Intelligent trip planning agent powered by Python FastAPI, Langchain, and Tavily web search.

## 📋 Overview

The AI Concierge Agent provides personalized trip planning for Airbnb travelers, generating:

- **Day-by-day itineraries** with morning, afternoon, and evening activities
- **Activity recommendations** filtered by interests, budget, and accessibility needs
- **Restaurant suggestions** with dietary restriction filtering
- **Weather-aware packing lists**
- **Local tips and insights**

## 🛠 Technology Stack

- **FastAPI** - High-performance Python web framework
- **Langchain** - LLM orchestration framework
- **OpenAI GPT** - Language model for intelligent planning
- **Tavily** - Web search API for real-time local information
- **MySQL** - Database connection to fetch booking details
- **OpenWeather API** - Weather forecasting (optional)

## 📁 Project Structure

```
ai-agent/
├── main.py              # FastAPI application entry point
├── agent.py             # AI agent logic with Langchain
├── models.py            # Pydantic data models
├── config.py            # Configuration management
├── database.py          # Database utilities
├── utils.py             # Helper functions (weather, packing)
├── requirements.txt     # Python dependencies
├── env.example          # Environment variables template
├── .gitignore           # Git ignore rules
└── README.md           # This file
```

## 🚀 Getting Started

### Prerequisites

- Python 3.9 or higher
- pip (Python package manager)
- OpenAI API key
- Tavily API key
- MySQL database (shared with main backend)

### Installation

1. **Navigate to ai-agent directory:**

```bash
cd ai-agent
```

2. **Create Python virtual environment:**

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies:**

```bash
pip install -r requirements.txt
```

4. **Configure environment variables:**

```bash
cp env.example .env
```

Edit `.env` and add your API keys:

```env
# Required
OPENAI_API_KEY=sk-your-openai-key
TAVILY_API_KEY=tvly-your-tavily-key

# Database (same as main backend)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=pw@root
DB_NAME=airbnb_db

# Optional
OPENWEATHER_API_KEY=your-openweather-key
```

### Getting API Keys

#### OpenAI API Key
1. Visit https://platform.openai.com/
2. Sign up or log in
3. Go to API Keys section
4. Create new secret key

#### Tavily API Key
1. Visit https://www.tavily.com/
2. Sign up for free account
3. Get your API key from dashboard

#### OpenWeather API (Optional)
1. Visit https://openweathermap.org/api
2. Sign up for free tier
3. Get API key from account settings

## ▶️ Running the Agent

### Development Mode

```bash
# Make sure virtual environment is activated
source venv/bin/activate

# Run with auto-reload
python main.py
```

Or use uvicorn directly:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The AI agent will start on `http://localhost:8000`

### Production Mode

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

## 📚 API Endpoints

### 1. Health Check

```http
GET /health
```

Check if service is running and database is connected.

### 2. Generate Trip Plan (Full Request)

```http
POST /api/concierge/plan
Content-Type: application/json

{
  "booking_context": {
    "booking_id": 1,
    "property_name": "Beach House Paradise",
    "location": "Miami, FL",
    "start_date": "2025-11-01",
    "end_date": "2025-11-05",
    "guests": 4
  },
  "preferences": {
    "budget": "medium",
    "interests": ["beach", "food", "nightlife"],
    "dietary_restrictions": ["vegan"],
    "has_children": true,
    "wheelchair_accessible": false,
    "avoid_long_hikes": true
  },
  "free_text_query": "We're traveling with two kids, vegan, no long hikes"
}
```

### 3. Generate Plan from Booking ID

```http
POST /api/concierge/plan-from-booking
Content-Type: application/json

{
  "booking_id": 1,
  "preferences": {
    "budget": "medium",
    "interests": ["museums", "food"],
    "dietary_restrictions": ["gluten-free"]
  }
}
```

This endpoint fetches booking details from the database automatically.

### 4. Chat with Agent

```http
POST /api/concierge/chat
Content-Type: application/json

{
  "booking_id": 1,
  "message": "We're vegan, have two kids, and prefer indoor activities"
}
```

Natural language interface for trip planning.

## 📖 API Documentation

Interactive API documentation available at:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🧪 Testing the Agent

### Using curl

```bash
# Health check
curl http://localhost:8000/health

# Generate plan from booking
curl -X POST http://localhost:8000/api/concierge/plan-from-booking \
  -H "Content-Type: application/json" \
  -d '{
    "booking_id": 1,
    "preferences": {
      "budget": "medium",
      "interests": ["beach", "food"]
    }
  }'
```

### Using Python

```python
import requests

response = requests.post(
    "http://localhost:8000/api/concierge/plan-from-booking",
    json={
        "booking_id": 1,
        "preferences": {
            "budget": "medium",
            "interests": ["museums", "food"],
            "dietary_restrictions": ["vegan"]
        }
    }
)

print(response.json())
```

## 🔌 Integration with Main Backend

The AI agent should be called from the main Node.js backend or directly from the frontend.

### Frontend Integration Example

```javascript
// In React frontend
const getPlanFromAgent = async (bookingId, preferences) => {
  const response = await fetch('http://localhost:8000/api/concierge/plan-from-booking', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ booking_id: bookingId, preferences })
  });
  return await response.json();
};
```

### Backend Proxy (Optional)

You can create a proxy endpoint in your Node.js backend:

```javascript
// In Node.js backend
app.post('/api/ai/plan', async (req, res) => {
  const response = await fetch('http://localhost:8000/api/concierge/plan-from-booking', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req.body)
  });
  const data = await response.json();
  res.json(data);
});
```

## 🎯 Features

### ✅ Implemented

- FastAPI server with CORS support
- Langchain integration for LLM orchestration
- Tavily web search for real-time local data
- Day-by-day itinerary generation
- Activity recommendations with filters
- Restaurant suggestions
- Weather-aware packing lists
- Database integration for booking data
- Natural language query support
- Interactive API documentation

### 🚧 Future Enhancements

- Enhanced LLM parsing for more structured output
- Caching for repeated queries
- User feedback loop for improvement
- Integration with more data sources
- Real-time event calendar integration
- Multi-language support
- Image generation for activities

## 🐛 Troubleshooting

### Import Errors

```bash
# Make sure virtual environment is activated
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

### Database Connection Issues

- Verify MySQL is running
- Check database credentials in `.env`
- Ensure `airbnb_db` database exists

### API Key Errors

- Verify OpenAI API key is valid
- Check Tavily API key is active
- Ensure keys are properly set in `.env`

### Module Not Found

```bash
# Update pip and reinstall
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

## 📝 Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key for GPT models |
| `TAVILY_API_KEY` | Yes | Tavily API key for web search |
| `DB_HOST` | Yes | MySQL host address |
| `DB_PORT` | Yes | MySQL port (default: 3306) |
| `DB_USER` | Yes | MySQL username |
| `DB_PASSWORD` | Yes | MySQL password |
| `DB_NAME` | Yes | Database name |
| `AI_AGENT_PORT` | No | Server port (default: 8000) |
| `AI_AGENT_HOST` | No | Server host (default: 0.0.0.0) |
| `CORS_ORIGINS` | No | Allowed origins (comma-separated) |
| `OPENWEATHER_API_KEY` | No | OpenWeather API key |

## 📄 License

Part of Airbnb Prototype project.

## 🤝 Support

For issues or questions, refer to the main project README or create an issue in the repository.

---

**Happy Trip Planning! 🌍✈️**

