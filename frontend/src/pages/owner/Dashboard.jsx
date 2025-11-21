import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../../redux/slices/authSlice';
import { ownerAPI, bookingAPI } from '../../services/api';
import Navbar from '../../components/shared/Navbar';

const OwnerDashboard = () => {
  const user = useSelector(selectUser);
  const [dashboard, setDashboard] = useState(null);
  const [bookings, setBookings] = useState({ pending: [], accepted: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch properties
      const propsResponse = await ownerAPI.getMyProperties();
      const properties = propsResponse.data.properties || [];

      // Fetch bookings
      const bookingsResponse = await bookingAPI.getPropertyBookings();
      const bookings = bookingsResponse.data.bookings || [];

      // Calculate stats
      const pendingCount = bookings.filter((b) => b.status === 'PENDING').length;
      const acceptedBookings = bookings.filter((b) => b.status === 'ACCEPTED');
      const totalRevenue = acceptedBookings.reduce((sum, b) => sum + parseFloat(b.totalPrice || 0), 0);

      // Create dashboard data
      setDashboard({
        totalProperties: properties.length,
        totalBookings: bookings.length,
        acceptedBookings: acceptedBookings.length,
        pendingBookings: pendingCount,
        totalRevenue: totalRevenue.toFixed(2),
      });

      // Set bookings for display
      setBookings({
        pending: bookings.filter((b) => b.status === 'PENDING'),
        accepted: acceptedBookings,
      });
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
                      <div className="flex items-start space-x-4">
                        {/* Property Image */}
                        <div className="h-20 w-32 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
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
                                className="h-20 w-32 object-cover"
                                onError={(e) => {
                                  e.target.parentElement.innerHTML = '<div class="text-2xl">🏠</div>';
                                }}
                              />
                            ) : (
                              <div className="text-2xl">🏠</div>
                            );
                          })()}
                        </div>

                        {/* Booking Details */}
                        <div className="flex-1 flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-airbnb-dark">
                              {booking.property?.name || 'Property'}
                            </h3>
                            <p className="text-sm text-airbnb-gray mt-1">
                              Guest: {booking.traveler?.fullName || 'Guest'}
                            </p>
                            <p className="text-sm text-airbnb-gray mt-1">
                              📅 {new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-airbnb-gray mt-1">
                              👥 {booking.guests} guests • ${booking.totalPrice}
                            </p>
                          </div>
                          <Link
                            to="/owner/bookings"
                            className="bg-airbnb-pink hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap"
                          >
                            Review
                          </Link>
                        </div>
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
