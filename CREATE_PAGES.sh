#!/bin/bash

# This script creates all placeholder pages for the Airbnb frontend
# Run from the Airbnb-Prototype root directory

echo "Creating frontend pages..."

# Navigate to frontend src/pages
cd frontend/src/pages

# Create Traveler Dashboard
cat > traveler/Dashboard.jsx << 'EOF'
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

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await bookingAPI.getTravelerBookings();
      if (response.data.success) {
        setBookings(response.data.bookings);
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

      {/* AI Agent Button */}
      <button
        onClick={() => setShowAIAgent(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-airbnb-pink to-red-500 hover:from-red-600 hover:to-red-700 text-white p-4 rounded-full shadow-lg transition transform hover:scale-110 z-30"
        title="AI Travel Concierge"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>

      {/* AI Agent Panel */}
      {showAIAgent && <AIAgent onClose={() => setShowAIAgent(false)} />}
    </div>
  );
};

export default TravelerDashboard;
EOF

echo "✅ Created Traveler Dashboard"

# Create placeholder pages with a simple template function
create_placeholder_page() {
  local file=$1
  local title=$2
  local role=$3
  
  cat > "$file" << EOF
import React from 'react';
import Navbar from '../../components/shared/Navbar';

const ${title} = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-airbnb-dark mb-4">${title}</h1>
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <div className="text-6xl mb-4">🚧</div>
          <p className="text-airbnb-gray text-lg mb-4">This page is under construction</p>
          <p className="text-sm text-airbnb-gray">
            Refer to FRONTEND_GUIDE.md for implementation templates
          </p>
        </div>
      </div>
    </div>
  );
};

export default ${title};
EOF
}

# Create all traveler pages
create_placeholder_page "traveler/Profile.jsx" "Profile" "traveler"
create_placeholder_page "traveler/PropertySearch.jsx" "PropertySearch" "traveler"
create_placeholder_page "traveler/PropertyDetails.jsx" "PropertyDetails" "traveler"
create_placeholder_page "traveler/MyBookings.jsx" "MyBookings" "traveler"
create_placeholder_page "traveler/Favorites.jsx" "Favorites" "traveler"
create_placeholder_page "traveler/History.jsx" "History" "traveler"

echo "✅ Created Traveler pages"

# Create Owner Dashboard
cat > owner/Dashboard.jsx << 'EOF'
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ownerAPI, bookingAPI } from '../../services/api';
import Navbar from '../../components/shared/Navbar';

const OwnerDashboard = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [bookings, setBookings] = useState({ pending: [], accepted: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [dashResponse, bookingsResponse] = await Promise.all([
        ownerAPI.getDashboard(),
        bookingAPI.getOwnerBookings(),
      ]);

      if (dashResponse.data.success) {
        setDashboard(dashResponse.data.dashboard);
      }
      if (bookingsResponse.data.success) {
        setBookings(bookingsResponse.data.bookings);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-airbnb-dark">
            Welcome, {user?.name}! 🏠
          </h1>
          <p className="text-airbnb-gray mt-2">Manage your properties and bookings</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link
            to="/owner/properties/create"
            className="bg-gradient-to-r from-airbnb-pink to-red-500 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition group"
          >
            <div className="text-4xl mb-3">➕</div>
            <h3 className="font-semibold text-lg">Add New Property</h3>
            <p className="text-sm opacity-90 mt-2">
              List a new property for rent
            </p>
          </Link>

          <Link
            to="/owner/properties"
            className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition group"
          >
            <div className="text-4xl mb-3">🏘️</div>
            <h3 className="font-semibold text-lg text-airbnb-dark group-hover:text-airbnb-pink transition">
              My Properties
            </h3>
            <p className="text-sm text-airbnb-gray mt-2">
              View and manage listings
            </p>
          </Link>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                <div className="text-3xl font-bold text-blue-900">
                  {dashboard?.totalProperties || 0}
                </div>
                <div className="text-blue-700 font-medium">Total Properties</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl">
                <div className="text-3xl font-bold text-yellow-900">
                  {dashboard?.pendingBookings || 0}
                </div>
                <div className="text-yellow-700 font-medium">Pending Requests</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                <div className="text-3xl font-bold text-green-900">
                  {dashboard?.acceptedBookings || 0}
                </div>
                <div className="text-green-700 font-medium">Accepted Bookings</div>
              </div>
            </div>

            {/* Recent Booking Requests */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold mb-4 text-airbnb-dark">
                Recent Booking Requests
              </h2>
              {bookings.pending.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📭</div>
                  <p className="text-airbnb-gray">No pending requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.pending.slice(0, 5).map((booking) => (
                    <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:border-airbnb-pink transition">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-airbnb-dark">
                            {booking.property_name}
                          </h3>
                          <p className="text-sm text-airbnb-gray mt-1">
                            Guest: {booking.traveler_name}
                          </p>
                          <p className="text-sm text-airbnb-gray mt-1">
                            📅 {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-airbnb-gray mt-1">
                            👥 {booking.guests} guests • ${booking.total_price}
                          </p>
                        </div>
                        <Link
                          to="/owner/bookings"
                          className="bg-airbnb-pink hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                        >
                          Review
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;
EOF

echo "✅ Created Owner Dashboard"

# Create remaining owner pages
create_placeholder_page "owner/Profile.jsx" "OwnerProfile" "owner"
create_placeholder_page "owner/MyProperties.jsx" "MyProperties" "owner"
create_placeholder_page "owner/CreateProperty.jsx" "CreateProperty" "owner"
create_placeholder_page "owner/EditProperty.jsx" "EditProperty" "owner"
create_placeholder_page "owner/ManageBookings.jsx" "ManageBookings" "owner"

echo "✅ Created Owner pages"
echo ""
echo "✨ All frontend pages created successfully!"
echo "📖 Refer to FRONTEND_GUIDE.md for detailed implementation templates"
EOF

chmod +x CREATE_PAGES.sh
echo "Created page generation script"

