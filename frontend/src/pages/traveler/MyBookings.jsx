import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingAPI } from '../../services/api';
import Navbar from '../../components/shared/Navbar';
import AIAgent from '../../components/shared/AIAgent';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, accepted, cancelled
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showAIAgent, setShowAIAgent] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await bookingAPI.getMyBookings();
      if (response.data.success) {
        setBookings(response.data.bookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const response = await bookingAPI.cancel(bookingId);
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Booking cancelled successfully' });
        fetchBookings();
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to cancel booking',
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filter === 'all') return true;
    return booking.status.toLowerCase() === filter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-airbnb-dark mb-6">My Bookings</h1>

        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Filter Tabs */}
        <div className="mb-8 flex space-x-4 border-b">
          <button
            onClick={() => setFilter('all')}
            className={`pb-3 px-4 font-medium transition ${
              filter === 'all'
                ? 'text-airbnb-pink border-b-2 border-airbnb-pink'
                : 'text-airbnb-gray hover:text-airbnb-dark'
            }`}
          >
            All ({bookings.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`pb-3 px-4 font-medium transition ${
              filter === 'pending'
                ? 'text-airbnb-pink border-b-2 border-airbnb-pink'
                : 'text-airbnb-gray hover:text-airbnb-dark'
            }`}
          >
            Pending ({bookings.filter((b) => b.status === 'PENDING').length})
          </button>
          <button
            onClick={() => setFilter('accepted')}
            className={`pb-3 px-4 font-medium transition ${
              filter === 'accepted'
                ? 'text-airbnb-pink border-b-2 border-airbnb-pink'
                : 'text-airbnb-gray hover:text-airbnb-dark'
            }`}
          >
            Accepted ({bookings.filter((b) => b.status === 'ACCEPTED').length})
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`pb-3 px-4 font-medium transition ${
              filter === 'cancelled'
                ? 'text-airbnb-pink border-b-2 border-airbnb-pink'
                : 'text-airbnb-gray hover:text-airbnb-dark'
            }`}
          >
            Cancelled ({bookings.filter((b) => b.status === 'CANCELLED').length})
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow p-6 animate-pulse">
                <div className="flex space-x-4">
                  <div className="h-24 w-32 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-airbnb-dark mb-2">
              {filter === 'all' ? 'No bookings yet' : `No ${filter} bookings`}
            </h3>
            <p className="text-airbnb-gray mb-6">
              {filter === 'all' && 'Start exploring properties and make your first booking!'}
            </p>
            {filter === 'all' && (
              <Link
                to="/traveler/search"
                className="inline-block bg-airbnb-pink hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition"
              >
                Search Properties
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-xl shadow hover:shadow-lg transition p-6">
                <div className="flex flex-col md:flex-row md:items-center md:space-x-6">
                  {/* Property Image */}
                  <div className="mb-4 md:mb-0">
                    <Link to={`/traveler/property/${booking.propertyId}`}>
                      <div className="h-32 w-48 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
                        {(() => {
                          // Get photos from populated property object
                          let photos = booking.property?.photos;
                          if (typeof photos === 'string') {
                            try {
                              photos = JSON.parse(photos);
                            } catch (e) {
                              photos = [];
                            }
                          }
                          return photos && photos.length > 0 ? (
                            <img
                              src={`http://localhost:3003${photos[0]}`}
                              alt={booking.property?.name || 'Property'}
                              className="h-32 w-48 object-cover rounded-lg"
                              onError={(e) => {
                                e.target.parentElement.innerHTML = '<div class="text-4xl">🏠</div>';
                              }}
                            />
                          ) : (
                            <div className="text-4xl">🏠</div>
                          );
                        })()}
                      </div>
                    </Link>
                  </div>

                  {/* Booking Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <Link
                        to={`/traveler/property/${booking.propertyId}`}
                        className="text-xl font-semibold text-airbnb-dark hover:text-airbnb-pink transition"
                      >
                        {booking.property?.name || 'Property'}
                      </Link>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    <p className="text-airbnb-gray mb-3">
                      📍 {booking.property?.city && booking.property?.state 
                        ? `${booking.property.city}, ${booking.property.state}` 
                        : 'Location not available'}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-airbnb-gray">Check-in</p>
                        <p className="font-medium text-airbnb-dark">
                          {new Date(booking.checkInDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-airbnb-gray">Check-out</p>
                        <p className="font-medium text-airbnb-dark">
                          {new Date(booking.checkOutDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-airbnb-gray">Guests</p>
                        <p className="font-medium text-airbnb-dark">{booking.guests} guests</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-airbnb-gray">Total Price</p>
                        <p className="text-xl font-bold text-airbnb-dark">${booking.totalPrice}</p>
                      </div>

                      {booking.status === 'PENDING' && (
                        <button
                          onClick={() => handleCancel(booking.id)}
                          className="px-4 py-2 border border-red-500 text-red-500 hover:bg-red-50 rounded-lg font-medium transition"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating AI Agent Button - Only show for ACCEPTED future bookings */}
      {(() => {
        const futureBookings = bookings.filter(b => 
          b.status === 'ACCEPTED' && new Date(b.checkInDate) > new Date()
        );
        return futureBookings.length > 0 && (
          <button
            onClick={() => {
              setShowAIAgent(true);
              setSelectedBookingId(futureBookings[0]?.id || null);
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
        );
      })()}

      {/* AI Agent Panel */}
      {showAIAgent && (
        <AIAgent 
          onClose={() => setShowAIAgent(false)} 
          bookingId={selectedBookingId}
          bookings={bookings.filter(b => 
            b.status === 'ACCEPTED' && new Date(b.checkInDate) > new Date()
          )}
          onBookingChange={setSelectedBookingId}
        />
      )}
    </div>
  );
};

export default MyBookings;
