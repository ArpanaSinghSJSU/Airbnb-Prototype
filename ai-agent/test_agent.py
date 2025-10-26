"""
Test script for AI Concierge Agent
"""
import requests
import json
from datetime import date, timedelta

# Agent URL
BASE_URL = "http://localhost:8000"

def test_health_check():
    """Test health check endpoint"""
    print("\n🔍 Testing Health Check...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code == 200

def test_generate_plan():
    """Test trip plan generation with full request"""
    print("\n🔍 Testing Trip Plan Generation...")
    
    # Sample request
    start_date = date.today() + timedelta(days=30)
    end_date = start_date + timedelta(days=3)
    
    request_data = {
        "booking_context": {
            "booking_id": 1,
            "property_name": "Beach House Paradise",
            "location": "Miami, FL",
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "guests": 4
        },
        "preferences": {
            "budget": "medium",
            "interests": ["beach", "food", "museums"],
            "dietary_restrictions": ["vegan"],
            "has_children": True,
            "wheelchair_accessible": False,
            "avoid_long_hikes": True
        },
        "free_text_query": "We're traveling with two kids, vegan, no long hikes"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/concierge/plan",
            json=request_data,
            timeout=30
        )
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"\n✅ Success! Generated {len(data.get('itinerary', []))} days of itinerary")
            print(f"📦 Packing list items: {len(data.get('packing_list', []))}")
            print(f"💡 Tips: {len(data.get('tips', []))}")
            
            # Print first day details
            if data.get('itinerary'):
                first_day = data['itinerary'][0]
                print(f"\n📅 Day 1 ({first_day['date']}):")
                print(f"  Morning activities: {len(first_day.get('morning', []))}")
                print(f"  Afternoon activities: {len(first_day.get('afternoon', []))}")
                print(f"  Evening activities: {len(first_day.get('evening', []))}")
                print(f"  Restaurants: {len(first_day.get('restaurants', []))}")
            
            return True
        else:
            print(f"❌ Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Exception: {e}")
        return False

def test_plan_from_booking():
    """Test plan generation from booking ID"""
    print("\n🔍 Testing Plan from Booking ID...")
    
    request_data = {
        "booking_id": 1,
        "preferences": {
            "budget": "medium",
            "interests": ["food", "culture"],
            "dietary_restrictions": []
        }
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/concierge/plan-from-booking",
            json=request_data,
            timeout=30
        )
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success! Generated itinerary")
            return True
        elif response.status_code == 404:
            print(f"⚠️  Booking not found (expected if no bookings in DB)")
            return True
        else:
            print(f"❌ Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Exception: {e}")
        return False

def test_chat():
    """Test chat endpoint"""
    print("\n🔍 Testing Chat Interface...")
    
    request_data = {
        "booking_id": 1,
        "message": "We love seafood, have two kids, and prefer indoor activities in case it rains"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/concierge/chat",
            json=request_data,
            timeout=30
        )
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Chat response received")
            return True
        elif response.status_code == 404:
            print(f"⚠️  Booking not found (expected if no bookings in DB)")
            return True
        else:
            print(f"❌ Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Exception: {e}")
        return False

def main():
    """Run all tests"""
    print("=" * 60)
    print("🤖 AI Concierge Agent Test Suite")
    print("=" * 60)
    
    results = {
        "Health Check": test_health_check(),
        "Generate Plan": test_generate_plan(),
        "Plan from Booking": test_plan_from_booking(),
        "Chat Interface": test_chat()
    }
    
    print("\n" + "=" * 60)
    print("📊 Test Results")
    print("=" * 60)
    
    for test_name, passed in results.items():
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{test_name}: {status}")
    
    total = len(results)
    passed = sum(results.values())
    print(f"\nTotal: {passed}/{total} tests passed")
    
    print("\n" + "=" * 60)
    
    if passed == total:
        print("🎉 All tests passed!")
    else:
        print("⚠️  Some tests failed. Check the output above for details.")
    
    print("=" * 60)

if __name__ == "__main__":
    main()

