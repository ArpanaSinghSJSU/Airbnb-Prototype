"""
Database utilities for AI Concierge Agent
"""
import mysql.connector
from typing import Optional, Dict
from config import config

class Database:
    """Database connection manager"""
    
    @staticmethod
    def get_connection():
        """Get database connection"""
        return mysql.connector.connect(
            host=config.DB_HOST,
            port=config.DB_PORT,
            user=config.DB_USER,
            password=config.DB_PASSWORD,
            database=config.DB_NAME
        )
    
    @staticmethod
    def get_booking_details(booking_id: int) -> Optional[Dict]:
        """Fetch booking details from database"""
        try:
            conn = Database.get_connection()
            cursor = conn.cursor(dictionary=True)
            
            query = """
                SELECT 
                    b.id as booking_id,
                    b.start_date,
                    b.end_date,
                    b.guests,
                    p.name as property_name,
                    p.location,
                    p.type as property_type,
                    p.amenities,
                    u.name as traveler_name,
                    u.email as traveler_email
                FROM bookings b
                JOIN properties p ON b.property_id = p.id
                JOIN users u ON b.traveler_id = u.id
                WHERE b.id = %s
            """
            
            cursor.execute(query, (booking_id,))
            result = cursor.fetchone()
            
            cursor.close()
            conn.close()
            
            return result
        except Exception as e:
            print(f"Database error: {e}")
            return None
    
    @staticmethod
    def get_user_preferences(user_id: int) -> Optional[Dict]:
        """Fetch user preferences (could be extended)"""
        try:
            conn = Database.get_connection()
            cursor = conn.cursor(dictionary=True)
            
            query = """
                SELECT 
                    name,
                    email,
                    about_me,
                    languages
                FROM users
                WHERE id = %s
            """
            
            cursor.execute(query, (user_id,))
            result = cursor.fetchone()
            
            cursor.close()
            conn.close()
            
            return result
        except Exception as e:
            print(f"Database error: {e}")
            return None

