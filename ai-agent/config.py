"""
Configuration management for AI Concierge Agent
"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    """Application configuration"""
    
    # OpenAI Configuration
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    
    # Tavily Configuration
    TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
    
    # Database Configuration
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = int(os.getenv("DB_PORT", 3306))
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    DB_NAME = os.getenv("DB_NAME", "airbnb_db")
    
    # Server Configuration
    AI_AGENT_PORT = int(os.getenv("AI_AGENT_PORT", 8000))
    AI_AGENT_HOST = os.getenv("AI_AGENT_HOST", "0.0.0.0")
    
    # CORS Configuration
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5002").split(",")
    
    # OpenWeather API
    OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")
    
    # Model Configuration
    MODEL_NAME = "gpt-3.5-turbo"
    MODEL_TEMPERATURE = 0.7
    
    @classmethod
    def validate(cls):
        """Validate required configuration"""
        if not cls.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY is required")
        if not cls.TAVILY_API_KEY:
            raise ValueError("TAVILY_API_KEY is required")
        return True

config = Config()

