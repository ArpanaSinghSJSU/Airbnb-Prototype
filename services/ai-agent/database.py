"""
Database utilities for AI Concierge Agent
Uses microservices APIs instead of direct database access
"""
import requests
from typing import Optional, Dict
from config import config
from datetime import datetime

class Database:
    """Database/API connection manager"""
    
    # Microservices URLs - use config values
    BOOKING_SERVICE_URL = config.BOOKING_SERVICE_URL
    PROPERTY_SERVICE_URL = config.PROPERTY_SERVICE_URL
    TRAVELER_SERVICE_URL = config.TRAVELER_SERVICE_URL
    
    @staticmethod
    def get_connection():
        """Check if services are reachable"""
        try:
            response = requests.get(f"{Database.BOOKING_SERVICE_URL}/health", timeout=2)
            return response.status_code == 200
        except:
            return False
    
    @staticmethod
    def get_booking_details(booking_id: str) -> Optional[Dict]:
        """Fetch booking details from booking service API"""
        try:
            # Use internal endpoint with API key for service-to-service communication
            internal_api_key = config.INTERNAL_API_KEY
            
            # Fetch booking from booking service internal endpoint
            response = requests.get(
                f"{Database.BOOKING_SERVICE_URL}/bookings/internal/{booking_id}",
                headers={
                    'x-internal-api-key': internal_api_key
                },
                timeout=10
            )
            
            if response.status_code == 401:
                print(f"❌ Unauthorized: Invalid API key for booking {booking_id}")
                return None
            
            if response.status_code != 200:
                print(f"❌ Booking not found: {booking_id} (status: {response.status_code})")
                return None
            
            booking_data = response.json()
            
            # Extract and format the data
            # The booking service returns populated property and traveler data
            property_data = booking_data.get('property', {})
            traveler_data = booking_data.get('traveler', {})
            
            # Format dates properly
            start_date = booking_data.get('checkInDate', '')
            end_date = booking_data.get('checkOutDate', '')
            
            # Parse dates if they're in ISO format
            if 'T' in start_date:
                start_date = datetime.fromisoformat(start_date.replace('Z', '+00:00')).date()
            if 'T' in end_date:
                end_date = datetime.fromisoformat(end_date.replace('Z', '+00:00')).date()
            
            # Extract structured location fields
            city = property_data.get('city', '')
            state = property_data.get('state', '')
            country = property_data.get('country', '')
            zipcode = property_data.get('zipcode', '')
            
            # Build location string from structured fields
            location_parts = [city, state, country]
            location = ', '.join([part for part in location_parts if part])
            
            if not location:
                location = 'Unknown Location'
            
            print(f"📍 Extracted location: {city}, {state} {zipcode}")
            
            result = {
                'booking_id': booking_data.get('_id') or booking_data.get('id') or booking_id,
                'start_date': start_date,
                'end_date': end_date,
                'guests': booking_data.get('guests', 1),
                'property_name': property_data.get('name', 'Property'),
                'location': location or property_data.get('address', 'Unknown Location'),
                'city': city,
                'state': state,
                'country': country,
                'zipcode': zipcode,
                'property_type': property_data.get('type', 'Property'),
                'amenities': property_data.get('amenities', []),
                'traveler_name': traveler_data.get('name', 'Traveler'),
                'traveler_email': traveler_data.get('email', '')
            }
            
            print(f"✅ Fetched booking details for booking {booking_id}: {result['property_name']} in {result['location']}")
            return result
            
        except requests.exceptions.Timeout:
            print(f"❌ Timeout fetching booking {booking_id}")
            return None
        except requests.exceptions.RequestException as e:
            print(f"❌ API error fetching booking {booking_id}: {e}")
            return None
        except Exception as e:
            print(f"❌ Error processing booking {booking_id}: {e}")
            return None
    
    @staticmethod
    def get_user_preferences(user_id: int) -> Optional[Dict]:
        """Fetch user preferences from traveler service"""
        try:
            response = requests.get(
                f"{Database.TRAVELER_SERVICE_URL}/traveler/profile/{user_id}",
                timeout=5
            )
            
            if response.status_code != 200:
                return None
            
            user_data = response.json()
            
            result = {
                'name': user_data.get('name', ''),
                'email': user_data.get('email', ''),
                'about_me': user_data.get('aboutMe', ''),
                'languages': user_data.get('languages', [])
            }
            
            return result
            
        except Exception as e:
            print(f"Error fetching user preferences: {e}")
            return None

