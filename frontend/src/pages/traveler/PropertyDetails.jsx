import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { propertyAPI, bookingAPI, favoritesAPI } from '../../services/api';
import Navbar from '../../components/shared/Navbar';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState({
    start_date: '',
    end_date: '',
    guests: 1,
  });
  const [booking, setBooking] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    try {
      const response = await propertyAPI.getById(id);
      if (response.data.success) {
        setProperty(response.data.property);
      }
    } catch (error) {
      console.error('Error fetching property:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingChange = (e) => {
    setBookingData({
      ...bookingData,
      [e.target.name]: e.target.value,
    });
  };

  const calculateTotal = () => {
    if (!bookingData.start_date || !bookingData.end_date || !property) return 0;
    const start = new Date(bookingData.start_date);
    const end = new Date(bookingData.end_date);
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return nights * property.pricePerNight;
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setBooking(true);
    setMessage({ type: '', text: '' });

    try {
      const total = calculateTotal();
      const response = await bookingAPI.create({
        propertyId: property.id,
        checkInDate: bookingData.start_date,
        checkOutDate: bookingData.end_date,
        guests: parseInt(bookingData.guests),
        totalPrice: total,
      });

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Booking request sent! Waiting for owner approval.' });
        setTimeout(() => navigate('/traveler/bookings'), 2000);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to create booking',
      });
    } finally {
      setBooking(false);
    }
  };

  const handleAddToFavorites = async () => {
    try {
      await favoritesAPI.add(property.id);
      setMessage({ type: 'success', text: 'Added to favorites!' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to add to favorites',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-xl text-airbnb-gray">Loading...</div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-airbnb-dark">Property not found</h2>
          <button
            onClick={() => navigate('/traveler/search')}
            className="mt-4 text-airbnb-pink hover:underline"
          >
            Back to search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/traveler/search')}
          className="flex items-center text-airbnb-gray hover:text-airbnb-dark mb-6"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to search
        </button>

        {/* Property Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="h-96 bg-gray-200 rounded-xl overflow-hidden relative">
            {property.photos && property.photos.length > 0 ? (
              <>
                <img
                  src={`http://localhost:3003${property.photos[0]}`}
                  alt={property.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-8xl">🏠</div>';
                  }}
                />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl">
                🏠
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {property.photos && property.photos.slice(1, 5).map((photo, idx) => (
              <div key={idx} className="h-44 bg-gray-200 rounded-xl overflow-hidden relative">
                {photo ? (
                  <img
                    src={`http://localhost:3003${photo}`}
                    alt={`${property.name} ${idx + 2}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-4xl">🏠</div>';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">
                    🏠
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Property Details */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-airbnb-dark">{property.name}</h1>
              <p className="text-airbnb-gray mt-2">
                📍 {property.city && property.state 
                  ? `${property.city}, ${property.state}${property.zipcode ? ' ' + property.zipcode : ''}` 
                  : 'Location not available'}
              </p>
              <div className="flex items-center space-x-4 mt-2 text-airbnb-gray">
                <span>{property.type}</span>
                <span>•</span>
                <span>{property.bedrooms} bedrooms</span>
                <span>•</span>
                <span>{property.bathrooms} bathrooms</span>
                <span>•</span>
                <span>Up to {property.maxGuests} guests</span>
              </div>
            </div>

            <div className="border-t border-b py-6">
              <h2 className="text-xl font-semibold text-airbnb-dark mb-4">Description</h2>
              <p className="text-airbnb-gray leading-relaxed">
                {property.description || 'No description available.'}
              </p>
            </div>

            {property.amenities && Array.isArray(property.amenities) && property.amenities.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-airbnb-dark mb-4">Amenities</h2>
                <div className="grid grid-cols-2 gap-4">
                  {property.amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-airbnb-pink" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-airbnb-dark">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <div className="flex items-baseline justify-between mb-6">
                <div>
                  <span className="text-3xl font-bold text-airbnb-dark">
                    ${property.pricePerNight}
                  </span>
                  <span className="text-airbnb-gray ml-2">per night</span>
                </div>
              </div>

              {message.text && (
                <div
                  className={`mb-4 p-3 rounded-lg text-sm ${
                    message.type === 'success'
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {message.text}
                </div>
              )}

              <form onSubmit={handleBooking} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-airbnb-dark mb-2">
                    Check-in
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={bookingData.start_date}
                    onChange={handleBookingChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-airbnb-dark mb-2">
                    Check-out
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    value={bookingData.end_date}
                    onChange={handleBookingChange}
                    required
                    min={bookingData.start_date}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-airbnb-dark mb-2">
                    Guests
                  </label>
                  <input
                    type="number"
                    name="guests"
                    value={bookingData.guests}
                    onChange={handleBookingChange}
                    required
                    min="1"
                    max={property.maxGuests}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink focus:border-transparent"
                  />
                </div>

                {bookingData.start_date && bookingData.end_date && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between text-sm text-airbnb-gray mb-2">
                      <span>
                        ${property.pricePerNight} x{' '}
                        {Math.ceil(
                          (new Date(bookingData.end_date) - new Date(bookingData.start_date)) /
                            (1000 * 60 * 60 * 24)
                        )}{' '}
                        nights
                      </span>
                      <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-airbnb-dark pt-2 border-t">
                      <span>Total</span>
                      <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={booking}
                  className="w-full bg-airbnb-pink hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
                >
                  {booking ? 'Booking...' : 'Request to Book'}
                </button>

                <button
                  type="button"
                  onClick={handleAddToFavorites}
                  className="w-full border border-airbnb-pink text-airbnb-pink hover:bg-pink-50 py-3 rounded-lg font-semibold transition"
                >
                  ❤️ Add to Favorites
                </button>
              </form>

              <p className="text-xs text-airbnb-gray text-center mt-4">
                You won't be charged yet. Owner needs to accept your booking request.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
