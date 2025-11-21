import React, { useState, useEffect } from 'react';
import { bookingAPI } from '../../services/api';
import Navbar from '../../components/shared/Navbar';

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, accepted, cancelled
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await bookingAPI.getPropertyBookings();
      if (response.data.success) {
        setBookings(response.data.bookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (bookingId) => {
    try {
      const response = await bookingAPI.accept(bookingId);
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Booking accepted successfully!' });
        fetchBookings();
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to accept booking',
      });
    }
  };

  const handleReject = async (bookingId) => {
    if (!window.confirm('Are you sure you want to reject this booking request?')) return;

    try {
      const response = await bookingAPI.reject(bookingId);
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Booking rejected' });
        fetchBookings();
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to reject booking',
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
        <h1 className="text-3xl font-bold text-airbnb-dark mb-6">Manage Bookings</h1>

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
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-airbnb-dark mb-2">
              {filter === 'all' ? 'No bookings yet' : `No ${filter} bookings`}
            </h3>
            <p className="text-airbnb-gray">
              {filter === 'all' && 'Bookings for your properties will appear here'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-xl shadow hover:shadow-lg transition p-6">
                <div className="flex flex-col md:flex-row md:items-center md:space-x-6">
                  {/* Property Image */}
                  <div className="mb-4 md:mb-0">
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
                  </div>

                  {/* Booking Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-semibold text-airbnb-dark">
                          {booking.property?.name || 'Property'}
                        </h3>
                        <p className="text-airbnb-gray mt-1">Guest: {booking.traveler?.fullName || 'Guest'}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </div>

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

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <p className="text-sm text-airbnb-gray">Total Price</p>
                        <p className="text-xl font-bold text-airbnb-dark">${booking.totalPrice}</p>
                      </div>

                      {booking.status === 'PENDING' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleReject(booking.id)}
                            className="px-4 py-2 border border-red-500 text-red-500 hover:bg-red-50 rounded-lg font-medium transition"
                          >
                            ✕ Reject
                          </button>
                          <button
                            onClick={() => handleAccept(booking.id)}
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition"
                          >
                            ✓ Accept
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageBookings;
