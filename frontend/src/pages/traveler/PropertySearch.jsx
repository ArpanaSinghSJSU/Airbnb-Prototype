import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { propertyAPI } from '../../services/api';
import Navbar from '../../components/shared/Navbar';
import AIAgent from '../../components/shared/AIAgent';

const PropertySearch = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAIAgent, setShowAIAgent] = useState(false);
  const [filters, setFilters] = useState({
    location: '',
    start_date: '',
    end_date: '',
    guests: '',
  });

  useEffect(() => {
    searchProperties();
  }, []);

  const searchProperties = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.location) params.location = filters.location;
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;
      if (filters.guests) params.guests = filters.guests;

      const response = await propertyAPI.search(params);
      if (response.data.success) {
        setProperties(response.data.properties);
      }
    } catch (error) {
      console.error('Error searching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchProperties();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Search Filters */}
      <div className="bg-white shadow-sm border-b sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-airbnb-dark mb-2">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                placeholder="Where to?"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-airbnb-dark mb-2">
                Check-in
              </label>
              <input
                type="date"
                name="start_date"
                value={filters.start_date}
                onChange={handleFilterChange}
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
                value={filters.end_date}
                onChange={handleFilterChange}
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
                value={filters.guests}
                onChange={handleFilterChange}
                min="1"
                placeholder="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink focus:border-transparent"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-airbnb-pink hover:bg-red-600 text-white py-2 px-6 rounded-lg font-medium transition"
              >
                🔍 Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-airbnb-dark">
            {loading ? 'Searching...' : `${properties.length} properties found`}
          </h1>
          {filters.location && (
            <p className="text-airbnb-gray mt-1">in {filters.location}</p>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow animate-pulse">
                <div className="h-64 bg-gray-200 rounded-t-xl"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-xl font-semibold text-airbnb-dark mb-2">No properties found</h3>
            <p className="text-airbnb-gray">Try adjusting your search filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Link
                key={property.id}
                to={`/traveler/property/${property.id}`}
                className="bg-white rounded-xl shadow hover:shadow-xl transition group"
              >
                <div className="relative h-64 bg-gray-200 rounded-t-xl overflow-hidden">
                  {property.photos && property.photos.length > 0 ? (
                    <img
                      src={`http://localhost:3003${property.photos[0]}`}
                      alt={property.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      onError={(e) => {
                        e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-6xl">🏠</div>';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                      🏠
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full shadow">
                    <span className="text-sm font-semibold text-airbnb-dark">
                      ${property.pricePerNight}/night
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-lg text-airbnb-dark group-hover:text-airbnb-pink transition">
                    {property.name}
                  </h3>
                  <p className="text-sm text-airbnb-gray mt-1">
                    📍 {property.city && property.state 
                      ? `${property.city}, ${property.state}` 
                      : 'Location'}
                  </p>
                  <p className="text-sm text-airbnb-gray mt-1">
                    {property.type && `${property.type} • `}
                    {property.bedrooms} bed • {property.bathrooms} bath
                  </p>
                  <p className="text-sm text-airbnb-gray mt-1">
                    👥 Up to {property.maxGuests} guests
                  </p>
                  
                  {property.amenities && Array.isArray(property.amenities) && property.amenities.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {property.amenities.slice(0, 3).map((amenity, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-gray-100 text-airbnb-gray px-2 py-1 rounded-full"
                        >
                          {amenity}
                        </span>
                      ))}
                      {property.amenities.length > 3 && (
                        <span className="text-xs text-airbnb-gray px-2 py-1">
                          +{property.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* AI Agent Button */}
      <button
        onClick={() => setShowAIAgent(true)}
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

      {/* AI Agent Panel */}
      {showAIAgent && <AIAgent onClose={() => setShowAIAgent(false)} />}
    </div>
  );
};

export default PropertySearch;
