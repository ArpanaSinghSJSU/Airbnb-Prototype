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
    title="GoTour AI Concierge",
    description="Personalized trip planning AI agent for GoTour",
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
        "service": "GoTour AI Concierge",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    services_status = Database.get_connection()
    return {
        "success": True,
        "message": "AI Concierge Agent is healthy",
        "services_reachable": services_status
    }

@app.post("/api/concierge/plan-from-booking", response_model=AgentResponse)
async def generate_plan_from_booking_id(
    request: dict
):
    """
    Generate trip plan from booking ID
    
    Fetches booking details from database and generates itinerary
    """
    try:
        # Extract parameters from request
        booking_id = request.get('booking_id')
        preferences = request.get('preferences', {})
        
        if not booking_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="booking_id is required"
            )
        
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
            city=booking_data['city'],
            state=booking_data['state'],
            country=booking_data['country'],
            zipcode=booking_data.get('zipcode'),  # Optional field
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

@app.post("/api/concierge/query")
async def answer_query(request: dict):
    """
    Answer specific travel questions without generating full itinerary
    
    Handles conversational queries like "Find Indian restaurants", "What's the weather?", etc.
    """
    try:
        booking_id = request.get('booking_id')
        query = request.get('query')
        preferences = request.get('preferences', {})
        
        if not query:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="query is required"
            )
        
        # Fetch booking context if booking_id provided
        booking_context = None
        if booking_id:
            booking_data = Database.get_booking_details(booking_id)
            if booking_data:
                booking_context = BookingContext(
                    booking_id=booking_data['booking_id'],
                    property_name=booking_data['property_name'],
                    city=booking_data['city'],
                    state=booking_data['state'],
                    country=booking_data['country'],
                    zipcode=booking_data.get('zipcode'),  # Optional field
                    start_date=booking_data['start_date'],
                    end_date=booking_data['end_date'],
                    guests=booking_data['guests']
                )
        
        # Answer the specific query
        answer = agent.answer_query(query, booking_context, preferences)
        
        return {
            "success": True,
            "answer": answer
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error answering query: {str(e)}"
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

