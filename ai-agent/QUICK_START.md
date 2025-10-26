# AI Agent Quick Start ⚡

Get the AI Concierge Agent running in 5 minutes!

## Prerequisites

- Python 3.9+
- OpenAI API key
- Tavily API key

## Step 1: Setup

```bash
cd ai-agent
chmod +x setup.sh
./setup.sh
```

## Step 2: Configure Environment

```bash
cp env.example .env
```

Edit `.env` with your API keys:

```env
OPENAI_API_KEY=sk-your-openai-key-here
TAVILY_API_KEY=tvly-your-tavily-key-here
```

### Get API Keys

**OpenAI**: https://platform.openai.com/api-keys  
**Tavily**: https://app.tavily.com/home (free tier available)

## Step 3: Run Agent

```bash
source venv/bin/activate
python main.py
```

Agent runs on: **http://localhost:8000**

## Step 4: Test It

```bash
# In another terminal (keep agent running)
cd ai-agent
source venv/bin/activate
python test_agent.py
```

## Step 5: View API Docs

Open in browser:
- **Swagger UI**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## Quick Test with curl

```bash
curl -X POST http://localhost:8000/api/concierge/plan \
  -H "Content-Type: application/json" \
  -d '{
    "booking_context": {
      "booking_id": 1,
      "property_name": "Beach House",
      "location": "Miami, FL",
      "start_date": "2025-12-01",
      "end_date": "2025-12-05",
      "guests": 4
    },
    "preferences": {
      "budget": "medium",
      "interests": ["beach", "food"]
    }
  }'
```

## Troubleshooting

**"Module not found"**
```bash
pip install -r requirements.txt --force-reinstall
```

**"API key error"**
- Check `.env` file exists
- Verify API keys are valid
- No quotes around keys in .env

**"Database connection failed"**
- Ensure MySQL is running
- Check database credentials match main backend

## Integration with Frontend

The AI agent button should appear on the bottom right of the traveler dashboard. It sends requests to:

```javascript
POST http://localhost:8000/api/concierge/plan-from-booking
```

See `README.md` for full integration details.

---

**That's it! Your AI agent is ready! 🚀**

