"""
AI Concierge Agent using Langchain and Tavily
"""
from typing import List, Dict
from datetime import datetime, timedelta
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.schema import SystemMessage, HumanMessage
from tavily import TavilyClient

from config import config
from models import (
    AgentRequest, AgentResponse, DayPlan, ActivityCard, 
    RestaurantCard, PriceTier, TravelerPreferences
)
from utils import WeatherService, PackingListGenerator, extract_location_city, calculate_trip_length

class AIConciergeAgent:
    """
    AI Concierge Agent that generates personalized trip itineraries
    Uses Langchain for orchestration and Tavily for web search
    """
    
    def __init__(self):
        """Initialize AI agent with Langchain and Tavily"""
        self.llm = ChatOpenAI(
            model=config.MODEL_NAME,
            temperature=config.MODEL_TEMPERATURE,
            api_key=config.OPENAI_API_KEY
        )
        self.tavily_client = TavilyClient(api_key=config.TAVILY_API_KEY)
    
    def generate_itinerary(self, request: AgentRequest) -> AgentResponse:
        """
        Generate complete trip itinerary with activities, restaurants, and packing list
        """
        try:
            booking = request.booking_context
            preferences = request.preferences
            
            # Calculate trip details
            trip_length = calculate_trip_length(booking.start_date, booking.end_date)
            location_city = extract_location_city(booking.location)
            
            # Get weather forecast
            weather_forecast = WeatherService.get_weather_forecast(
                location_city, 
                booking.start_date, 
                booking.end_date
            )
            
            # Search for local attractions and POIs
            attractions = self._search_attractions(location_city, preferences)
            restaurants = self._search_restaurants(location_city, preferences)
            
            # Generate day-by-day itinerary using LLM
            itinerary = self._generate_daily_plans(
                booking, preferences, attractions, restaurants, weather_forecast
            )
            
            # Generate packing list
            packing_list = PackingListGenerator.generate(
                weather_forecast,
                trip_length,
                preferences.dict()
            )
            
            # Generate general tips
            tips = self._generate_tips(booking, preferences, weather_forecast)
            
            return AgentResponse(
                success=True,
                message="Itinerary generated successfully",
                itinerary=itinerary,
                packing_list=packing_list,
                weather_forecast=weather_forecast,
                tips=tips
            )
        
        except Exception as e:
            print(f"Agent error: {e}")
            return AgentResponse(
                success=False,
                message=f"Error generating itinerary: {str(e)}",
                itinerary=[],
                packing_list=[],
                weather_forecast=[],
                tips=[]
            )
    
    def _search_attractions(self, location: str, preferences: TravelerPreferences) -> List[Dict]:
        """Search for attractions using Tavily"""
        try:
            # Build search query based on preferences
            interests_str = ", ".join(preferences.interests) if preferences.interests else "popular attractions"
            query = f"best {interests_str} things to do in {location}"
            
            if preferences.has_children:
                query += " family-friendly"
            if preferences.wheelchair_accessible:
                query += " wheelchair accessible"
            
            # Search with Tavily
            results = self.tavily_client.search(
                query=query,
                max_results=10,
                search_depth="advanced"
            )
            
            return results.get('results', [])
        except Exception as e:
            print(f"Tavily search error: {e}")
            return []
    
    def _search_restaurants(self, location: str, preferences: TravelerPreferences) -> List[Dict]:
        """Search for restaurants using Tavily"""
        try:
            # Build restaurant search query
            dietary_str = " ".join(preferences.dietary_restrictions) if preferences.dietary_restrictions else ""
            query = f"best restaurants in {location} {dietary_str}"
            
            # Search with Tavily
            results = self.tavily_client.search(
                query=query,
                max_results=10,
                search_depth="advanced"
            )
            
            return results.get('results', [])
        except Exception as e:
            print(f"Tavily restaurant search error: {e}")
            return []
    
    def _generate_daily_plans(
        self, 
        booking, 
        preferences: TravelerPreferences,
        attractions: List[Dict],
        restaurants: List[Dict],
        weather_forecast
    ) -> List[DayPlan]:
        """Generate day-by-day itinerary using LLM"""
        
        # Prepare context for LLM
        trip_length = calculate_trip_length(booking.start_date, booking.end_date)
        location = extract_location_city(booking.location)
        
        # Build prompt with all context
        system_prompt = f"""You are an expert travel concierge creating a {trip_length}-day itinerary for {location}.

Booking Details:
- Location: {booking.location}
- Dates: {booking.start_date} to {booking.end_date}
- Guests: {booking.guests}

Traveler Preferences:
- Budget: {preferences.budget}
- Interests: {', '.join(preferences.interests) if preferences.interests else 'General sightseeing'}
- Dietary Restrictions: {', '.join(preferences.dietary_restrictions) if preferences.dietary_restrictions else 'None'}
- Has Children: {'Yes' if preferences.has_children else 'No'}
- Wheelchair Accessible: {'Yes' if preferences.wheelchair_accessible else 'No'}
- Avoid Long Hikes: {'Yes' if preferences.avoid_long_hikes else 'No'}

Available Attractions:
{self._format_search_results(attractions[:8])}

Available Restaurants:
{self._format_search_results(restaurants[:8])}

Create a detailed day-by-day itinerary with morning, afternoon, and evening activities.
Include specific activity names, addresses, estimated durations, and why they match the traveler's preferences.
Format your response as a structured JSON-like output that I can parse."""

        try:
            response = self.llm.invoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content="Please create the itinerary.")
            ])
            
            # Parse LLM response and create day plans
            itinerary = self._parse_llm_itinerary(
                response.content, 
                booking, 
                preferences,
                attractions,
                restaurants
            )
            
            return itinerary
        
        except Exception as e:
            print(f"LLM generation error: {e}")
            # Return fallback itinerary
            return self._generate_fallback_itinerary(booking, preferences, attractions, restaurants)
    
    def _format_search_results(self, results: List[Dict]) -> str:
        """Format Tavily search results for LLM prompt"""
        formatted = []
        for i, result in enumerate(results[:8], 1):
            title = result.get('title', 'Unknown')
            content = result.get('content', '')[:200]  # Truncate long content
            url = result.get('url', '')
            formatted.append(f"{i}. {title}\n   {content}\n   {url}")
        return "\n".join(formatted)
    
    def _parse_llm_itinerary(
        self, 
        llm_response: str, 
        booking,
        preferences: TravelerPreferences,
        attractions: List[Dict],
        restaurants: List[Dict]
    ) -> List[DayPlan]:
        """Parse LLM response into structured DayPlan objects"""
        # This is a simplified parser - in production, you'd want more robust parsing
        # For now, generate structured itinerary from available data
        
        itinerary = []
        current_date = booking.start_date
        day_number = 1
        
        # Distribute attractions across days
        attractions_per_day = max(3, len(attractions) // calculate_trip_length(booking.start_date, booking.end_date))
        
        while current_date <= booking.end_date:
            # Select activities for this day
            start_idx = (day_number - 1) * attractions_per_day
            day_attractions = attractions[start_idx:start_idx + attractions_per_day]
            
            morning_activities = self._create_activity_cards(
                day_attractions[:1], 
                preferences
            )
            afternoon_activities = self._create_activity_cards(
                day_attractions[1:2], 
                preferences
            )
            evening_activities = self._create_activity_cards(
                day_attractions[2:3], 
                preferences
            )
            
            # Select restaurants for this day
            day_restaurants = self._create_restaurant_cards(
                restaurants[(day_number-1)*2:(day_number-1)*2+2],
                preferences
            )
            
            day_plan = DayPlan(
                date=current_date.strftime("%Y-%m-%d"),
                day_number=day_number,
                morning=morning_activities,
                afternoon=afternoon_activities,
                evening=evening_activities,
                restaurants=day_restaurants
            )
            
            itinerary.append(day_plan)
            current_date += timedelta(days=1)
            day_number += 1
        
        return itinerary
    
    def _create_activity_cards(self, search_results: List[Dict], preferences: TravelerPreferences) -> List[ActivityCard]:
        """Convert search results to ActivityCard objects"""
        activities = []
        
        for result in search_results:
            activity = ActivityCard(
                title=result.get('title', 'Activity'),
                description=result.get('content', '')[:200],
                address=result.get('url', 'Address not available'),  # Ideally extract from content
                price_tier=self._estimate_price_tier(preferences.budget),
                duration="2-3 hours",  # Default estimate
                tags=self._extract_tags(result.get('content', '')),
                wheelchair_friendly=preferences.wheelchair_accessible,
                child_friendly=preferences.has_children,
                url=result.get('url')
            )
            activities.append(activity)
        
        return activities
    
    def _create_restaurant_cards(self, search_results: List[Dict], preferences: TravelerPreferences) -> List[RestaurantCard]:
        """Convert search results to RestaurantCard objects"""
        restaurants = []
        
        for result in search_results:
            restaurant = RestaurantCard(
                name=result.get('title', 'Restaurant'),
                cuisine="Local cuisine",  # Could be extracted from content
                address=result.get('url', 'Address not available'),
                price_tier=self._estimate_price_tier(preferences.budget),
                dietary_options=preferences.dietary_restrictions,
                wheelchair_accessible=preferences.wheelchair_accessible,
                url=result.get('url')
            )
            restaurants.append(restaurant)
        
        return restaurants
    
    def _estimate_price_tier(self, budget: str) -> PriceTier:
        """Estimate price tier based on budget"""
        budget_map = {
            "low": PriceTier.LOW,
            "medium": PriceTier.MEDIUM,
            "high": PriceTier.HIGH,
            "luxury": PriceTier.LUXURY
        }
        return budget_map.get(budget.lower(), PriceTier.MEDIUM)
    
    def _extract_tags(self, content: str) -> List[str]:
        """Extract relevant tags from content"""
        tags = []
        keywords = {
            "outdoor": ["park", "hiking", "beach", "nature"],
            "museum": ["museum", "gallery", "art"],
            "food": ["restaurant", "food", "dining"],
            "family": ["family", "kids", "children"],
            "culture": ["culture", "history", "heritage"]
        }
        
        content_lower = content.lower()
        for tag, keywords_list in keywords.items():
            if any(kw in content_lower for kw in keywords_list):
                tags.append(tag)
        
        return tags[:3]  # Limit to 3 tags
    
    def _generate_fallback_itinerary(
        self, 
        booking, 
        preferences: TravelerPreferences,
        attractions: List[Dict],
        restaurants: List[Dict]
    ) -> List[DayPlan]:
        """Generate basic itinerary when LLM fails"""
        return self._parse_llm_itinerary("", booking, preferences, attractions, restaurants)
    
    def _generate_tips(self, booking, preferences: TravelerPreferences, weather_forecast) -> List[str]:
        """Generate helpful tips for the trip"""
        tips = []
        
        # Weather tips
        avg_temp = sum(w.temperature_high for w in weather_forecast) / len(weather_forecast)
        if any(w.precipitation_chance > 30 for w in weather_forecast):
            tips.append("Rain is expected during your trip - don't forget an umbrella!")
        
        if avg_temp > 80:
            tips.append("It will be warm - stay hydrated and use sunscreen.")
        elif avg_temp < 50:
            tips.append("Cool temperatures expected - layer up for warmth.")
        
        # Preference-based tips
        if preferences.has_children:
            tips.append("Many activities are family-friendly with facilities for children.")
        
        if preferences.wheelchair_accessible:
            tips.append("All recommended venues have been checked for accessibility.")
        
        if preferences.dietary_restrictions:
            dietary_str = ", ".join(preferences.dietary_restrictions)
            tips.append(f"Restaurant recommendations include {dietary_str} options.")
        
        # General tips
        tips.append(f"Book activities in advance during peak season in {booking.location}.")
        tips.append("Download offline maps in case of limited connectivity.")
        
        return tips

# Global agent instance
agent = AIConciergeAgent()

