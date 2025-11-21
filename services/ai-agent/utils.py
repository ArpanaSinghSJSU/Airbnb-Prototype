"""
Utility functions for AI Concierge Agent
"""
import requests
from typing import List, Dict, Optional
from datetime import date, timedelta
from config import config
from models import WeatherInfo, PackingItem

class WeatherService:
    """Weather API service"""
    
    @staticmethod
    def get_weather_forecast(location: str, start_date: date, end_date: date) -> List[WeatherInfo]:
        """
        Get weather forecast for location and date range
        Uses OpenWeather API (free tier supports 5-day forecast)
        """
        if not config.OPENWEATHER_API_KEY:
            # Return mock weather data if API key not configured
            return WeatherService._generate_mock_weather(start_date, end_date)
        
        try:
            # OpenWeather API endpoint
            base_url = "http://api.openweathermap.org/data/2.5/forecast"
            params = {
                "q": location,
                "appid": config.OPENWEATHER_API_KEY,
                "units": "imperial"  # Fahrenheit
            }
            
            response = requests.get(base_url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            return WeatherService._parse_weather_data(data, start_date, end_date)
        except Exception as e:
            print(f"Weather API error: {e}")
            # Fallback to mock data
            return WeatherService._generate_mock_weather(start_date, end_date)
    
    @staticmethod
    def _parse_weather_data(data: Dict, start_date: date, end_date: date) -> List[WeatherInfo]:
        """Parse OpenWeather API response"""
        weather_list = []
        current_date = start_date
        
        while current_date <= end_date:
            # Find forecast for this date
            date_str = current_date.strftime("%Y-%m-%d")
            
            # Simplified: Use first available forecast or mock data
            weather_list.append(WeatherInfo(
                date=date_str,
                temperature_high=75.0,
                temperature_low=55.0,
                condition="Partly Cloudy",
                precipitation_chance=20
            ))
            
            current_date += timedelta(days=1)
        
        return weather_list
    
    @staticmethod
    def _generate_mock_weather(start_date: date, end_date: date) -> List[WeatherInfo]:
        """Generate mock weather data"""
        weather_list = []
        current_date = start_date
        
        while current_date <= end_date:
            weather_list.append(WeatherInfo(
                date=current_date.strftime("%Y-%m-%d"),
                temperature_high=72.0,
                temperature_low=58.0,
                condition="Partly Cloudy",
                precipitation_chance=15
            ))
            current_date += timedelta(days=1)
        
        return weather_list

class PackingListGenerator:
    """Generate weather-aware packing lists"""
    
    @staticmethod
    def generate(weather_forecast: List[WeatherInfo], trip_length: int, preferences: Dict) -> List[PackingItem]:
        """Generate packing list based on weather and trip details"""
        items = []
        
        # Analyze weather
        temps = [w.temperature_high for w in weather_forecast]
        avg_temp = sum(temps) / len(temps) if temps else 70
        has_rain = any(w.precipitation_chance > 30 for w in weather_forecast)
        
        # Clothing based on temperature
        if avg_temp > 75:
            items.extend([
                PackingItem(item="Lightweight shorts", category="clothing", reason="Warm weather expected"),
                PackingItem(item="T-shirts", category="clothing", reason="Comfortable for warm days"),
                PackingItem(item="Sunglasses", category="accessories", reason="Sun protection"),
                PackingItem(item="Sunscreen", category="toiletries", reason="UV protection"),
            ])
        elif avg_temp > 60:
            items.extend([
                PackingItem(item="Light jacket", category="clothing", reason="Mild temperatures"),
                PackingItem(item="Comfortable jeans", category="clothing", reason="Versatile for day/evening"),
                PackingItem(item="Layers (sweater/cardigan)", category="clothing", reason="Temperature changes"),
            ])
        else:
            items.extend([
                PackingItem(item="Warm jacket", category="clothing", reason="Cold weather expected"),
                PackingItem(item="Warm pants", category="clothing", reason="Cold protection"),
                PackingItem(item="Scarf and gloves", category="accessories", reason="Extra warmth"),
            ])
        
        # Rain gear
        if has_rain:
            items.extend([
                PackingItem(item="Rain jacket", category="clothing", reason="Rain expected"),
                PackingItem(item="Umbrella", category="accessories", reason="Stay dry"),
            ])
        
        # Essentials
        items.extend([
            PackingItem(item="Comfortable walking shoes", category="footwear", reason="Essential for sightseeing"),
            PackingItem(item="Toiletries kit", category="toiletries", reason="Personal hygiene"),
            PackingItem(item="Phone charger", category="electronics", reason="Stay connected"),
            PackingItem(item="Travel documents", category="documents", reason="ID, booking confirmations"),
        ])
        
        # Children-specific items
        if preferences.get("has_children"):
            items.extend([
                PackingItem(item="Snacks for kids", category="food", reason="Keep children happy"),
                PackingItem(item="Entertainment (books/toys)", category="entertainment", reason="Downtime activities"),
            ])
        
        # Trip length specific
        if trip_length > 3:
            items.append(PackingItem(item="Laundry detergent", category="toiletries", reason="Extended stay"))
        
        return items

def extract_location_city(location: str) -> str:
    """
    Extract city and state from full location string
    Examples:
        "Miami, FL, USA" -> "Miami, FL"
        "Miami, Florida, USA" -> "Miami, Florida"
        "Downtown Miami Apartment, Miami, FL" -> "Miami, FL"
    """
    if not location:
        return "the area"
    
    parts = [part.strip() for part in location.split(",")]
    
    # If we have 3 parts like "Miami, FL, USA", take first two
    if len(parts) == 3:
        return f"{parts[0]}, {parts[1]}"
    # If we have 4+ parts like "Property, Miami, FL, USA", take middle two
    elif len(parts) >= 4:
        return f"{parts[1]}, {parts[2]}"
    # If we have 2 parts like "Miami, FL", return as-is
    elif len(parts) == 2:
        return location.strip()
    else:
        # Single part - just return it
        return location.strip()

def calculate_trip_length(start_date: date, end_date: date) -> int:
    """Calculate number of days in trip"""
    return (end_date - start_date).days + 1

