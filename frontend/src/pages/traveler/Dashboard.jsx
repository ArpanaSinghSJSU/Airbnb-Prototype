import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { bookingAPI } from '../../services/api';
import Navbar from '../../components/shared/Navbar';
import AIAgent from '../../components/shared/AIAgent';

const TravelerDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState({ pending: [], accepted: [], cancelled: [] });
  const [loading, setLoading] = useState(true);
  const [showAIAgent, setShowAIAgent] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await bookingAPI.getMyBookings();
      if (response.data.success) {
        const allBookings = response.data.bookings || [];
        setBookings({
          pending: allBookings.filter((b) => b.status === 'PENDING'),
          accepted: allBookings.filter((b) => b.status === 'ACCEPTED'),
          cancelled: allBookings.filter((b) => b.status === 'CANCELLED'),
        });
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-airbnb-dark">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-airbnb-gray mt-2">Ready to plan your next adventure?</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            to="/traveler/search"
            className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition group"
          >
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="font-semibold text-lg text-airbnb-dark group-hover:text-airbnb-pink transition">
              Search Properties
            </h3>
            <p className="text-sm text-airbnb-gray mt-2">
              Find your perfect stay
            </p>
          </Link>

          <Link
            to="/traveler/favorites"
            className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition group"
          >
            <div className="text-4xl mb-3">❤️</div>
            <h3 className="font-semibold text-lg text-airbnb-dark group-hover:text-airbnb-pink transition">
              My Favorites
            </h3>
            <p className="text-sm text-airbnb-gray mt-2">
              View saved properties
            </p>
          </Link>

          <Link
            to="/traveler/bookings"
            className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition group"
          >
            <div className="text-4xl mb-3">📅</div>
            <h3 className="font-semibold text-lg text-airbnb-dark group-hover:text-airbnb-pink transition">
              My Bookings
            </h3>
            <p className="text-sm text-airbnb-gray mt-2">
              Manage your trips
            </p>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl">
            <div className="text-3xl font-bold text-yellow-900">
              {bookings.pending.length}
            </div>
            <div className="text-yellow-700 font-medium">Pending Bookings</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
            <div className="text-3xl font-bold text-green-900">
              {bookings.accepted.length}
            </div>
            <div className="text-green-700 font-medium">Upcoming Trips</div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
            <div className="text-3xl font-bold text-blue-900">0</div>
            <div className="text-blue-700 font-medium">Saved Favorites</div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-4 text-airbnb-dark">
            Recent Bookings
          </h2>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : bookings.pending.length === 0 && bookings.accepted.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏖️</div>
              <p className="text-airbnb-gray mb-4">No bookings yet</p>
              <Link
                to="/traveler/search"
                className="inline-block bg-airbnb-pink hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition"
              >
                Start Exploring
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {[...bookings.pending, ...bookings.accepted].slice(0, 5).map((booking) => (
                <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:border-airbnb-pink transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-airbnb-dark">
                        {booking.property_name}
                      </h3>
                      <p className="text-sm text-airbnb-gray mt-1">
                        📍 {booking.location}
                      </p>
                      <p className="text-sm text-airbnb-gray mt-1">
                        📅 {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-airbnb-gray mt-1">
                        👥 {booking.guests} guests • ${booking.total_price}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        booking.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : booking.status === 'ACCEPTED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI Agent Button - Only show if there are ACCEPTED bookings */}
      {bookings.accepted.length > 0 && (
        <button
          onClick={() => {
            setShowAIAgent(true);
            setSelectedBookingId(bookings.accepted[0]?.id || null);
          }}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-airbnb-pink to-red-500 hover:from-red-600 hover:to-red-700 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 z-30 group"
          title="AI Travel Concierge"
        >
          <div className="flex items-center space-x-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span className="hidden group-hover:inline-block text-sm font-medium whitespace-nowrap">
              AI Trip Planner
            </span>
          </div>
        </button>
      )}

      {/* AI Agent Panel */}
      {showAIAgent && (
        <AIAgent 
          onClose={() => setShowAIAgent(false)} 
          bookingId={selectedBookingId}
          bookings={bookings.accepted}
          onBookingChange={setSelectedBookingId}
        />
      )}
    </div>
  );
};

export default TravelerDashboard;
