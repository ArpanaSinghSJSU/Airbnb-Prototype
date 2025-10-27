import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingAPI } from '../../services/api';
import Navbar from '../../components/shared/Navbar';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await bookingAPI.getMyBookings();
      if (response.data.success) {
        // Filter for accepted bookings that have ended (past trips)
        const pastBookings = response.data.bookings.filter((booking) => {
          const endDate = new Date(booking.end_date);
          return booking.status === 'ACCEPTED' && endDate < new Date();
        });
        setHistory(pastBookings);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateNights = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-airbnb-dark mb-6">Trip History</h1>
        <p className="text-airbnb-gray mb-8">
          Your past trips and completed bookings
        </p>

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
        ) : history.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🗓️</div>
            <h3 className="text-xl font-semibold text-airbnb-dark mb-2">No trip history yet</h3>
            <p className="text-airbnb-gray mb-6">
              Your completed trips will appear here
            </p>
            <Link
              to="/traveler/search"
              className="inline-block bg-airbnb-pink hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition"
            >
              Explore Properties
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((trip) => (
              <div
                key={trip.id}
                className="bg-white rounded-xl shadow hover:shadow-lg transition p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center md:space-x-6">
                  {/* Property Image */}
                  <div className="mb-4 md:mb-0">
                    <Link to={`/traveler/property/${trip.property_id}`}>
                      <div className="h-32 w-48 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
                        {(() => {
                          // Parse photos if it's a string, or use as is if already an array
                          let photos = trip.photos;
                          if (typeof photos === 'string') {
                            try {
                              photos = JSON.parse(photos);
                            } catch (e) {
                              photos = [];
                            }
                          }
                          return photos && photos.length > 0 ? (
                            <img
                              src={`http://localhost:5002${photos[0]}`}
                              alt={trip.property_name}
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

                  {/* Trip Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <Link
                        to={`/traveler/property/${trip.property_id}`}
                        className="text-xl font-semibold text-airbnb-dark hover:text-airbnb-pink transition"
                      >
                        {trip.property_name}
                      </Link>
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                        ✓ COMPLETED
                      </span>
                    </div>

                    <p className="text-airbnb-gray mb-3">📍 {trip.location}</p>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-airbnb-gray">Check-in</p>
                        <p className="font-medium text-airbnb-dark">
                          {new Date(trip.start_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-airbnb-gray">Check-out</p>
                        <p className="font-medium text-airbnb-dark">
                          {new Date(trip.end_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-airbnb-gray">Duration</p>
                        <p className="font-medium text-airbnb-dark">
                          {calculateNights(trip.start_date, trip.end_date)} nights
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-airbnb-gray">Guests</p>
                        <p className="font-medium text-airbnb-dark">{trip.guests} guests</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <p className="text-sm text-airbnb-gray">Total Paid</p>
                        <p className="text-xl font-bold text-airbnb-dark">${trip.total_price}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-airbnb-gray">Booked on</p>
                        <p className="text-sm font-medium text-airbnb-dark">
                          {new Date(trip.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
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

export default History;
