import React, { useState } from 'react';
import { aiAgentAPI } from '../../services/api';

const AIAgent = ({ onClose, bookingId = null, bookings = [], onBookingChange = null }) => {
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: "👋 Hi! I'm your AI Travel Concierge. I create personalized trip plans based on your booking!",
    },
    {
      type: 'bot',
      text: '💬 **You can ask me anything!**\n\n📅 **For a complete itinerary:**\n• "Plan my trip"\n• "Plan my trip with Indian restaurants"\n\n💭 **Or ask specific questions:**\n• "Find Indian restaurants"\n• "What beach activities are available?"\n• "Tell me about the weather"\n• "What should I pack?"\n\nI can answer questions OR create full day-by-day plans! 🚀',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Helper: Render text with clickable links
  const renderMessageWithLinks = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline break-all"
          >
            View Details
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message
    setMessages((prev) => [...prev, { type: 'user', text: userMessage }]);
    setLoading(true);

    try {
      let response = '';

      if (!bookingId) {
        response = `❌ I need an **ACCEPTED** booking to help you with your trip.\n\n📝 **To use this feature:**\n1. Go to "My Bookings" page\n2. Wait for your booking to be accepted by the property owner\n3. Once accepted, come back here!\n\n💡 **Note:** Only confirmed (ACCEPTED) bookings can be used.`;
      } else {
        // Check if user wants full itinerary or has a specific question
        const wantsFullItinerary = shouldGenerateFullItinerary(userMessage);
        
        if (wantsFullItinerary) {
          // Generate full itinerary
          const interests = extractInterests(userMessage);
          const cuisinePrefs = extractCuisinePreferences(userMessage);
          
          const result = await aiAgentAPI.generatePlan(bookingId, {
            budget: 'medium',
            interests: [...interests, ...cuisinePrefs],
            dietary_restrictions: extractDietaryRestrictions(userMessage),
            has_children: userMessage.toLowerCase().includes('kid') || userMessage.toLowerCase().includes('child') || userMessage.toLowerCase().includes('family'),
            avoid_long_hikes: userMessage.toLowerCase().includes('no hike') || userMessage.toLowerCase().includes('avoid hike')
          });

          if (result.data.success) {
            response = formatItineraryText(result.data);
          } else {
            response = `❌ Sorry, I couldn't generate your itinerary. ${result.data.message || 'Please try again later.'}`;
          }
        } else {
          // Answer specific question without full itinerary
          response = await answerSpecificQuestion(userMessage, bookingId);
        }
      }

      setMessages((prev) => [...prev, { type: 'bot', text: response }]);
    } catch (error) {
      console.error('AI Agent error:', error);
      let errorMessage = '❌ Sorry, I encountered an error. ';
      
      if (error.message?.includes('Network Error') || error.code === 'ECONNREFUSED') {
        errorMessage += 'The AI Agent service is not running. Please make sure it\'s started on port 8000.';
      } else {
        errorMessage += error.response?.data?.error || error.message || 'Please try again later.';
      }
      
      setMessages((prev) => [...prev, { type: 'bot', text: errorMessage }]);
    } finally {
      setLoading(false);
    }
  };

  // Helper: Determine if user wants full itinerary or specific answer
  const shouldGenerateFullItinerary = (message) => {
    const lowerMessage = message.toLowerCase();
    
    // Keywords that indicate they want a full itinerary
    const itineraryKeywords = [
      'plan my trip',
      'plan trip',
      'create itinerary',
      'full itinerary',
      'trip plan',
      'plan everything',
      'plan the trip',
      'create trip plan',
      'make itinerary',
      'generate itinerary',
      'day by day',
      'complete plan'
    ];
    
    return itineraryKeywords.some(keyword => lowerMessage.includes(keyword));
  };

  // Helper: Answer specific questions without full itinerary
  const answerSpecificQuestion = async (message, bookingId) => {
    try {
      // Extract preferences from the message
      const cuisinePrefs = extractCuisinePreferences(message);
      const interests = extractInterests(message);
      const dietaryRestrictions = extractDietaryRestrictions(message);
      
      const preferences = {
        interests: [...interests, ...cuisinePrefs],
        dietary_restrictions: dietaryRestrictions,
        has_children: message.toLowerCase().includes('kid') || message.toLowerCase().includes('child') || message.toLowerCase().includes('family')
      };
      
      // Call the AI agent API to answer the specific question
      const result = await aiAgentAPI.answerQuery(message, bookingId, preferences);
      
      if (result.data.success) {
        return result.data.answer;
      } else {
        return `❌ Sorry, I couldn't answer that question. ${result.data.message || 'Please try asking in a different way!'}`;
      }
      
    } catch (error) {
      console.error('Error answering question:', error);
      
      let errorMessage = '❌ Sorry, I encountered an error. ';
      if (error.message?.includes('Network Error') || error.code === 'ECONNREFUSED') {
        errorMessage += 'The AI Agent service is not running. Please make sure it\'s started on port 8000.';
      } else {
        errorMessage += error.response?.data?.error || error.message || 'Please try again later.';
      }
      
      return errorMessage;
    }
  };

  // Helper: Extract interests from user message
  const extractInterests = (message) => {
    const interests = [];
    const interestKeywords = {
      'beach': ['beach', 'ocean', 'sea', 'coast'],
      'food': ['food', 'restaurant', 'eat', 'dining', 'cuisine'],
      'museum': ['museum', 'art', 'gallery', 'culture'],
      'outdoor': ['outdoor', 'nature', 'park', 'hiking'],
      'shopping': ['shop', 'shopping', 'mall', 'boutique'],
      'nightlife': ['night', 'bar', 'club', 'entertainment']
    };

    Object.entries(interestKeywords).forEach(([interest, keywords]) => {
      if (keywords.some(kw => message.toLowerCase().includes(kw))) {
        interests.push(interest);
      }
    });

    return interests.length > 0 ? interests : ['general'];
  };

  // Helper: Extract dietary restrictions
  const extractDietaryRestrictions = (message) => {
    const restrictions = [];
    const dietKeywords = ['vegan', 'vegetarian', 'gluten-free', 'halal', 'kosher', 'dairy-free'];
    
    dietKeywords.forEach(diet => {
      if (message.toLowerCase().includes(diet)) {
        restrictions.push(diet);
      }
    });

    return restrictions;
  };

  // Helper: Extract cuisine preferences
  const extractCuisinePreferences = (message) => {
    const cuisines = [];
    const cuisineKeywords = [
      'indian', 'italian', 'chinese', 'japanese', 'thai', 'mexican', 
      'french', 'greek', 'mediterranean', 'american', 'korean', 'vietnamese',
      'spanish', 'lebanese', 'turkish', 'brazilian', 'caribbean', 'seafood',
      'steakhouse', 'pizza', 'sushi', 'bbq', 'barbecue'
    ];
    
    const messageLower = message.toLowerCase();
    cuisineKeywords.forEach(cuisine => {
      if (messageLower.includes(cuisine)) {
        cuisines.push(cuisine);
      }
    });

    return cuisines;
  };

  // Helper: Format itinerary response for display
  const formatItinerary = (data) => {
    // Return the raw data for rich rendering instead of plain text
    return {
      type: 'itinerary',
      data: data
    };
  };

  // Helper: Format itinerary as plain text (fallback)
  const formatItineraryText = (data) => {
    let formatted = '✨ **Your Personalized Trip Plan**\n\n';

    // Add itinerary days
    if (data.itinerary && data.itinerary.length > 0) {
      const startDate = data.itinerary[0]?.date;
      const endDate = data.itinerary[data.itinerary.length - 1]?.date;
      formatted += `📅 **${data.itinerary.length}-Day Itinerary** (${startDate} to ${endDate})\n\n`;
      
      data.itinerary.forEach((day, idx) => {
        formatted += `**Day ${day.day_number}** (${day.date}):\n\n`;
        
        if (day.morning && day.morning.length > 0) {
          const activity = day.morning[0];
          formatted += `🌅 **Morning:** ${activity.title}\n`;
          if (activity.url) formatted += `   ${activity.url}\n`;
          if (activity.tags && activity.tags.length > 0) formatted += `   🏷️ ${activity.tags.join(', ')}\n`;
          formatted += '\n';
        }
        if (day.afternoon && day.afternoon.length > 0) {
          const activity = day.afternoon[0];
          formatted += `☀️ **Afternoon:** ${activity.title}\n`;
          if (activity.url) formatted += `   ${activity.url}\n`;
          if (activity.tags && activity.tags.length > 0) formatted += `   🏷️ ${activity.tags.join(', ')}\n`;
          formatted += '\n';
        }
        if (day.evening && day.evening.length > 0) {
          const activity = day.evening[0];
          formatted += `🌆 **Evening:** ${activity.title}\n`;
          if (activity.url) formatted += `   ${activity.url}\n`;
          if (activity.tags && activity.tags.length > 0) formatted += `   🏷️ ${activity.tags.join(', ')}\n`;
          formatted += '\n';
        }
        if (day.restaurants && day.restaurants.length > 0) {
          const restaurant = day.restaurants[0];
          formatted += `🍽️ **Dining:** ${restaurant.name}\n`;
          if (restaurant.url) formatted += `   ${restaurant.url}\n`;
          if (restaurant.dietary_options && restaurant.dietary_options.length > 0) {
            formatted += `   🥗 ${restaurant.dietary_options.join(', ')}\n`;
          }
          formatted += '\n';
        }
        formatted += '---\n\n';
      });
    }

    // Add packing list
    if (data.packing_list && data.packing_list.length > 0) {
      formatted += `🎒 **Packing Essentials:**\n`;
      data.packing_list.slice(0, 5).forEach(item => {
        formatted += `• ${item.item}\n`;
      });
      if (data.packing_list.length > 5) {
        formatted += `...and ${data.packing_list.length - 5} more items\n`;
      }
      formatted += '\n';
    }

    // Add tips
    if (data.tips && data.tips.length > 0) {
      formatted += `💡 **Travel Tips:**\n`;
      data.tips.forEach(tip => {
        formatted += `• ${tip}\n`;
      });
    }

    formatted += '\n📝 Full details available on your booking page!';

    return formatted;
  };

  const suggestedQuestions = [
    "Plan my trip",
    "Find Indian restaurants",
    "What beach activities are available?",
    "Tell me about the weather",
  ];

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Agent Panel */}
      <div className="fixed top-0 right-0 h-full w-full md:w-96 bg-white shadow-2xl z-50 flex flex-col slide-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-airbnb-pink to-red-500 text-white p-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h3 className="text-lg font-bold">AI Travel Concierge</h3>
              <p className="text-xs opacity-90">Powered by AI</p>
            </div>
            <button
              onClick={onClose}
              className="hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Booking Info/Selector */}
          {bookings && bookings.length > 0 && (
            <div className="mt-2">
              {bookings.length === 1 ? (
                // Single booking - show as text
                <div>
                  <label className="text-xs opacity-90 mb-1 block">Planning for:</label>
                  <div className="bg-white bg-opacity-20 text-white text-sm px-3 py-2 rounded-lg border border-white border-opacity-30">
                    {bookings[0].property?.name || 'Property'} ({new Date(bookings[0].checkInDate).toLocaleDateString()} - {new Date(bookings[0].checkOutDate).toLocaleDateString()})
                  </div>
                </div>
              ) : (
                // Multiple bookings - show dropdown
                <div>
                  <label className="text-xs opacity-90 mb-1 block">Select Booking:</label>
                  <select
                    value={bookingId || ''}
                    onChange={(e) => {
                      onBookingChange(parseInt(e.target.value));
                      // Clear messages when switching bookings
                      setMessages([
                        {
                          type: 'bot',
                          text: "👋 Hi! I'm your AI Travel Concierge. I create personalized trip plans based on your booking!",
                        },
                        {
                          type: 'bot',
                          text: '💬 **You can ask me anything!**\n\n📅 **For a complete itinerary:**\n• "Plan my trip"\n• "Plan my trip with Indian restaurants"\n\n💭 **Or ask specific questions:**\n• "Find Indian restaurants"\n• "What beach activities are available?"\n• "Tell me about the weather"\n• "What should I pack?"\n\nI can answer questions OR create full day-by-day plans! 🚀',
                        },
                      ]);
                    }}
                    className="w-full bg-white bg-opacity-20 text-white text-sm px-3 py-2 rounded-lg border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                  >
                    {bookings.map((booking) => (
                      <option key={booking.id} value={booking.id} className="text-gray-900">
                        {booking.property?.name || 'Property'} ({new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-2xl shadow-sm ${
                  msg.type === 'user'
                    ? 'bg-airbnb-pink text-white rounded-br-none'
                    : 'bg-white text-airbnb-dark rounded-bl-none border border-gray-200'
                }`}
              >
                <div className="text-sm whitespace-pre-line">
                  {renderMessageWithLinks(msg.text)}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white p-4 rounded-2xl rounded-bl-none border border-gray-200 shadow-sm">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-airbnb-pink rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-airbnb-pink rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-airbnb-pink rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Suggested Questions (shown when no messages from user yet) */}
        {messages.filter(m => m.type === 'user').length === 0 && (
          <div className="px-4 py-2 bg-white border-t">
            <p className="text-xs text-airbnb-gray mb-2">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(q)}
                  className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 text-airbnb-dark rounded-full transition"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="border-t bg-white p-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about your trip..."
              className="flex-1 border border-gray-300 rounded-full px-4 py-3 focus:ring-2 focus:ring-airbnb-pink focus:border-transparent text-sm"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-airbnb-pink hover:bg-red-600 text-white p-3 rounded-full font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-airbnb-gray mt-2 text-center">
            ✨ Powered by OpenAI GPT + Tavily Search + Langchain
          </p>
        </form>
      </div>
    </>
  );
};

export default AIAgent;

