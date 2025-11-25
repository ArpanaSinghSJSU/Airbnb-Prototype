import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../../redux/slices/authSlice';
import { propertyAPI } from '../../services/api';
import AIAgent from '../../components/shared/AIAgent';

const PropertySearch = () => {
  const user = useSelector(selectUser);
  const [searchParams] = useSearchParams();
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
    // Read URL parameters and populate filters
    const urlLocation = searchParams.get('location');
    const urlStartDate = searchParams.get('start_date');
    const urlEndDate = searchParams.get('end_date');
    const urlGuests = searchParams.get('guests');

    if (urlLocation || urlStartDate || urlEndDate || urlGuests) {
      // URL has search parameters, populate filters and search
      const newFilters = {
        location: urlLocation || '',
        start_date: urlStartDate || '',
        end_date: urlEndDate || '',
        guests: urlGuests || '',
      };
      setFilters(newFilters);
      // Search with URL parameters
      searchPropertiesWithParams(newFilters);
    } else {
      // No URL parameters, just load all properties
    searchProperties();
    }
  }, []);

  const searchPropertiesWithParams = async (filterParams) => {
    setLoading(true);
    try {
      const params = {};
      if (filterParams.location) params.location = filterParams.location;
      if (filterParams.start_date) params.start_date = filterParams.start_date;
      if (filterParams.end_date) params.end_date = filterParams.end_date;
      if (filterParams.guests) params.guests = filterParams.guests;

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

  const searchProperties = async () => {
    searchPropertiesWithParams(filters);
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
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <span className="text-3xl font-bold text-airbnb-pink">GoTour</span>
            </Link>

            {/* Right side - Auth buttons */}
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-gray-700">Welcome, {user.firstName}!</span>
                  <Link
                    to={`/${user.role}/dashboard`}
                    className="px-4 py-2 text-airbnb-pink hover:bg-gray-50 rounded-full transition"
                  >
                    Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-full transition"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 bg-airbnb-pink text-white rounded-full hover:bg-red-600 transition"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      {/* Search Filters */}
      <div className="bg-white shadow-sm border-b z-30">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              {loading ? 'Searching...' : `${properties.length} properties found`}
            </h2>
            {filters.location && (
              <p className="text-gray-600 mt-1">in {filters.location}</p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-xl h-64 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {properties.map((property) => (
              <Link
                key={property.id}
                to={`/property/${property.id}`}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-xl mb-3">
                  <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    {property.photos && property.photos.length > 0 ? (
                      <img
                        src={`http://localhost:3003${property.photos[0]}`}
                        alt={property.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const icon = 
                            property.propertyType === 'apartment' ? '🏢' :
                            property.propertyType === 'house' ? '🏠' :
                            property.propertyType === 'villa' ? '🏰' :
                            property.propertyType === 'cabin' ? '🏡' :
                            property.propertyType === 'condo' ? '🏬' : '🏠';
                          e.target.parentElement.innerHTML = `<span class="text-4xl">${icon}</span>`;
                        }}
                      />
                    ) : (
                      <span className="text-4xl">
                        {property.propertyType === 'apartment' && '🏢'}
                        {property.propertyType === 'house' && '🏠'}
                        {property.propertyType === 'villa' && '🏰'}
                        {property.propertyType === 'cabin' && '🏡'}
                        {property.propertyType === 'condo' && '🏬'}
                        {!property.propertyType && '🏠'}
                      </span>
                    )}
                  </div>
                  <div className="absolute top-3 right-3">
                    <button className="bg-white bg-opacity-90 rounded-full p-2 hover:scale-110 transition">
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-gray-900 group-hover:text-airbnb-pink transition truncate flex-1">
                      {property.city}, {property.country}
                    </h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-1 truncate">{property.name}</p>
                  <p className="text-gray-500 text-sm mb-2">
                    {property.bedrooms} bed · {property.bathrooms} bath
                  </p>
                  <div className="flex items-baseline">
                    <span className="text-gray-900 font-semibold">${property.pricePerNight}</span>
                    <span className="text-gray-600 text-sm ml-1">/ night</span>
                  </div>
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
