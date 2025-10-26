"""
FastAPI application for AI Concierge Agent
"""
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

from config import config
from models import AgentRequest, AgentResponse, ErrorResponse, BookingContext
from agent import agent
from database import Database

# Initialize FastAPI app
app = FastAPI(
    title="AI Concierge Agent",
    description="Personalized trip planning AI agent for Airbnb Prototype",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Validate configuration on startup"""
    try:
        config.validate()
        print("✅ Configuration validated")
        print(f"🚀 AI Concierge Agent starting on {config.AI_AGENT_HOST}:{config.AI_AGENT_PORT}")
    except Exception as e:
        print(f"❌ Configuration error: {e}")
        raise

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "AI Concierge Agent",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "success": True,
        "message": "AI Concierge Agent is healthy",
        "timestamp": str(Database.get_connection().is_connected() if Database else False)
    }

@app.post("/api/concierge/plan", response_model=AgentResponse)
async def generate_trip_plan(request: AgentRequest):
    """
    Generate personalized trip itinerary
    
    This endpoint accepts booking context and traveler preferences,
    then generates a comprehensive trip plan including:
    - Day-by-day itinerary with activities
    - Restaurant recommendations
    - Weather-aware packing list
    - Helpful travel tips
    """
    try:
        # Validate booking context
        if not request.booking_context:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Booking context is required"
            )
        
        # Generate itinerary using AI agent
        response = agent.generate_itinerary(request)
        
        return response
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating itinerary: {str(e)}"
        )

@app.post("/api/concierge/plan-from-booking", response_model=AgentResponse)
async def generate_plan_from_booking_id(
    booking_id: int,
    preferences: dict = None
):
    """
    Generate trip plan from booking ID
    
    Fetches booking details from database and generates itinerary
    """
    try:
        # Fetch booking from database
        booking_data = Database.get_booking_details(booking_id)
        
        if not booking_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Booking {booking_id} not found"
            )
        
        # Create booking context
        booking_context = BookingContext(
            booking_id=booking_data['booking_id'],
            property_name=booking_data['property_name'],
            location=booking_data['location'],
            start_date=booking_data['start_date'],
            end_date=booking_data['end_date'],
            guests=booking_data['guests']
        )
        
        # Create agent request
        agent_request = AgentRequest(
            booking_context=booking_context,
            preferences=preferences or {}
        )
        
        # Generate itinerary
        response = agent.generate_itinerary(agent_request)
        
        return response
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating itinerary: {str(e)}"
        )

@app.post("/api/concierge/chat")
async def chat_with_agent(
    booking_id: int,
    message: str
):
    """
    Chat with AI agent using natural language
    
    Accepts free-text queries like:
    "We're traveling with two kids, vegan, no long hikes"
    """
    try:
        # Fetch booking from database
        booking_data = Database.get_booking_details(booking_id)
        
        if not booking_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Booking {booking_id} not found"
            )
        
        # Create booking context
        booking_context = BookingContext(
            booking_id=booking_data['booking_id'],
            property_name=booking_data['property_name'],
            location=booking_data['location'],
            start_date=booking_data['start_date'],
            end_date=booking_data['end_date'],
            guests=booking_data['guests']
        )
        
        # Create agent request with free text query
        agent_request = AgentRequest(
            booking_context=booking_context,
            free_text_query=message
        )
        
        # Generate response
        response = agent.generate_itinerary(agent_request)
        
        return response
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing chat: {str(e)}"
        )

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": str(exc),
            "details": None
        }
    )

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=config.AI_AGENT_HOST,
        port=config.AI_AGENT_PORT,
        reload=True,
        log_level="info"
    )

