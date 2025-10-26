import React, { useState } from 'react';

const AIAgent = ({ onClose }) => {
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: "👋 Hi! I'm your AI Travel Concierge. I can help you plan your trip with personalized recommendations!",
    },
    {
      type: 'bot',
      text: 'Try asking me: "Plan a 3-day trip to Miami" or "Recommend family-friendly activities"',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message
    setMessages((prev) => [...prev, { type: 'user', text: userMessage }]);
    setLoading(true);

    // TODO: Replace with actual AI Agent API call
    // For now, simulate response
    setTimeout(() => {
      let response = '';
      
      if (userMessage.toLowerCase().includes('trip') || userMessage.toLowerCase().includes('plan')) {
        response = `🗺️ I'd love to help plan your trip! Based on your booking, I can create:

• Day-by-day itinerary (morning/afternoon/evening)
• Activity recommendations with pricing
• Restaurant suggestions 
• Weather-aware packing list
• Family-friendly options

Note: Full AI Agent integration coming soon with Python FastAPI + Langchain!`;
      } else if (userMessage.toLowerCase().includes('restaurant')) {
        response = `🍽️ I can recommend restaurants based on:
• Your dietary preferences
• Budget range
• Cuisine type
• Distance from your property

Full restaurant recommendations will be available once the AI Agent service is connected!`;
      } else {
        response = `I'm here to help! I can assist with:

🗺️ Trip planning & itineraries
🎯 Activity recommendations  
🍽️ Restaurant suggestions
🎒 Packing lists
👨‍👩‍👧 Family-friendly options

Ask me about planning your trip, and I'll provide personalized recommendations!`;
      }

      setMessages((prev) => [...prev, { type: 'bot', text: response }]);
      setLoading(false);
    }, 1500);
  };

  const suggestedQuestions = [
    "Plan a 3-day trip",
    "Family activities",
    "Vegan restaurants",
    "What to pack?",
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
        <div className="bg-gradient-to-r from-airbnb-pink to-red-500 text-white p-4 flex justify-between items-center">
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
                <p className="text-sm whitespace-pre-line">{msg.text}</p>
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
            🚧 Full AI integration coming with Python FastAPI + Langchain
          </p>
        </form>
      </div>
    </>
  );
};

export default AIAgent;

