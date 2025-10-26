"""
Data models and schemas for AI Concierge Agent
"""
from typing import List, Optional, Dict
from pydantic import BaseModel, Field
from datetime import date
from enum import Enum

class BudgetTier(str, Enum):
    """Budget tier enumeration"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    LUXURY = "luxury"

class PriceTier(str, Enum):
    """Price tier for activities"""
    FREE = "free"
    LOW = "$"
    MEDIUM = "$$"
    HIGH = "$$$"
    LUXURY = "$$$$"

class TimeBlock(str, Enum):
    """Time blocks for itinerary"""
    MORNING = "morning"
    AFTERNOON = "afternoon"
    EVENING = "evening"

class TravelerPreferences(BaseModel):
    """Traveler preferences and requirements"""
    budget: BudgetTier = Field(default=BudgetTier.MEDIUM, description="Budget level")
    interests: List[str] = Field(default=[], description="List of interests (e.g., 'hiking', 'museums', 'food')")
    dietary_restrictions: List[str] = Field(default=[], description="Dietary needs (e.g., 'vegan', 'gluten-free')")
    has_children: bool = Field(default=False, description="Traveling with children")
    wheelchair_accessible: bool = Field(default=False, description="Requires wheelchair accessibility")
    mobility_needs: Optional[str] = Field(default=None, description="Specific mobility requirements")
    avoid_long_hikes: bool = Field(default=False, description="Avoid activities requiring long walks/hikes")
    
class BookingContext(BaseModel):
    """Booking context information"""
    booking_id: int = Field(..., description="Booking ID")
    property_name: str = Field(..., description="Property name")
    location: str = Field(..., description="Location/city")
    start_date: date = Field(..., description="Check-in date")
    end_date: date = Field(..., description="Check-out date")
    guests: int = Field(..., description="Number of guests")

class AgentRequest(BaseModel):
    """Request to AI Concierge Agent"""
    booking_context: BookingContext = Field(..., description="Booking information")
    preferences: TravelerPreferences = Field(default_factory=TravelerPreferences, description="Traveler preferences")
    free_text_query: Optional[str] = Field(default=None, description="Natural language query")

class ActivityCard(BaseModel):
    """Activity recommendation card"""
    title: str = Field(..., description="Activity name")
    description: str = Field(..., description="Activity description")
    address: str = Field(..., description="Location address")
    price_tier: PriceTier = Field(..., description="Price range")
    duration: str = Field(..., description="Estimated duration (e.g., '2 hours')")
    tags: List[str] = Field(default=[], description="Activity tags (e.g., 'outdoor', 'family-friendly')")
    wheelchair_friendly: bool = Field(default=False, description="Wheelchair accessible")
    child_friendly: bool = Field(default=False, description="Suitable for children")
    url: Optional[str] = Field(default=None, description="External URL for more info")

class RestaurantCard(BaseModel):
    """Restaurant recommendation card"""
    name: str = Field(..., description="Restaurant name")
    cuisine: str = Field(..., description="Cuisine type")
    address: str = Field(..., description="Location address")
    price_tier: PriceTier = Field(..., description="Price range")
    dietary_options: List[str] = Field(default=[], description="Available dietary options")
    wheelchair_accessible: bool = Field(default=False, description="Wheelchair accessible")
    url: Optional[str] = Field(default=None, description="External URL")

class DayPlan(BaseModel):
    """Day-by-day itinerary plan"""
    date: str = Field(..., description="Date (YYYY-MM-DD)")
    day_number: int = Field(..., description="Day number in trip")
    morning: List[ActivityCard] = Field(default=[], description="Morning activities")
    afternoon: List[ActivityCard] = Field(default=[], description="Afternoon activities")
    evening: List[ActivityCard] = Field(default=[], description="Evening activities (restaurants/nightlife)")
    restaurants: List[RestaurantCard] = Field(default=[], description="Recommended restaurants for the day")

class PackingItem(BaseModel):
    """Packing list item"""
    item: str = Field(..., description="Item name")
    category: str = Field(..., description="Category (e.g., 'clothing', 'toiletries')")
    reason: Optional[str] = Field(default=None, description="Why this item is recommended")

class WeatherInfo(BaseModel):
    """Weather information"""
    date: str = Field(..., description="Date")
    temperature_high: float = Field(..., description="High temperature (°F)")
    temperature_low: float = Field(..., description="Low temperature (°F)")
    condition: str = Field(..., description="Weather condition")
    precipitation_chance: int = Field(..., description="Chance of rain (%)")

class AgentResponse(BaseModel):
    """Response from AI Concierge Agent"""
    success: bool = Field(..., description="Success status")
    message: Optional[str] = Field(default=None, description="Status message")
    itinerary: List[DayPlan] = Field(default=[], description="Day-by-day itinerary")
    packing_list: List[PackingItem] = Field(default=[], description="Weather-aware packing checklist")
    weather_forecast: List[WeatherInfo] = Field(default=[], description="Weather forecast for trip")
    tips: List[str] = Field(default=[], description="General tips and recommendations")

class ErrorResponse(BaseModel):
    """Error response"""
    success: bool = Field(default=False)
    error: str = Field(..., description="Error message")
    details: Optional[Dict] = Field(default=None, description="Additional error details")

