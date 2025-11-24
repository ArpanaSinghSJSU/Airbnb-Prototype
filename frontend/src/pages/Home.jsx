import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { propertyAPI } from '../services/api';
import { useSelector } from 'react-redux';
import { selectUser } from '../redux/slices/authSlice';

const Home = () => {
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    guests: 1
  });
  const user = useSelector(selectUser);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedProperties();
  }, []);

  const fetchFeaturedProperties = async () => {
    try {
      const response = await propertyAPI.search({ limit: 12 });
      if (response.data.success) {
        setFeaturedProperties(response.data.properties);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchParams.location) params.append('location', searchParams.location);
    if (searchParams.checkIn) params.append('checkIn', searchParams.checkIn);
    if (searchParams.checkOut) params.append('checkOut', searchParams.checkOut);
    if (searchParams.guests) params.append('guests', searchParams.guests);
    navigate(`/search?${params.toString()}`);
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

      {/* Hero Section with Search */}
      <div className="relative bg-gradient-to-r from-pink-50 to-red-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Find your next adventure
            </h1>
            <p className="text-xl text-gray-600">
              Discover amazing places to stay around the world
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSearch} className="bg-white rounded-full shadow-lg p-2 flex flex-col md:flex-row gap-2">
              {/* Location */}
              <div className="flex-1 px-6 py-3 border-r border-gray-200">
                <label className="block text-xs font-semibold text-gray-900 mb-1">Where</label>
                <input
                  type="text"
                  placeholder="Search destinations"
                  value={searchParams.location}
                  onChange={(e) => setSearchParams({...searchParams, location: e.target.value})}
                  className="w-full text-sm text-gray-700 placeholder-gray-400 outline-none"
                />
              </div>

              {/* Check-in */}
              <div className="flex-1 px-6 py-3 border-r border-gray-200">
                <label className="block text-xs font-semibold text-gray-900 mb-1">Check in</label>
                <input
                  type="date"
                  value={searchParams.checkIn}
                  onChange={(e) => setSearchParams({...searchParams, checkIn: e.target.value})}
                  className="w-full text-sm text-gray-700 outline-none"
                />
              </div>

              {/* Check-out */}
              <div className="flex-1 px-6 py-3 border-r border-gray-200">
                <label className="block text-xs font-semibold text-gray-900 mb-1">Check out</label>
                <input
                  type="date"
                  value={searchParams.checkOut}
                  onChange={(e) => setSearchParams({...searchParams, checkOut: e.target.value})}
                  className="w-full text-sm text-gray-700 outline-none"
                />
              </div>

              {/* Guests */}
              <div className="flex-1 px-6 py-3">
                <label className="block text-xs font-semibold text-gray-900 mb-1">Who</label>
                <input
                  type="number"
                  min="1"
                  placeholder="Add guests"
                  value={searchParams.guests}
                  onChange={(e) => setSearchParams({...searchParams, guests: e.target.value})}
                  className="w-full text-sm text-gray-700 placeholder-gray-400 outline-none"
                />
              </div>

              {/* Search Button */}
              <button
                type="submit"
                className="bg-airbnb-pink text-white px-8 py-4 rounded-full hover:bg-red-600 transition flex items-center justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Featured Properties Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Explore popular destinations
          </h2>
          <Link 
            to="/search" 
            className="text-airbnb-pink hover:underline font-semibold flex items-center"
          >
            View all
            <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(12)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 rounded-xl h-64 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProperties.map((property) => (
              <Link
                key={property._id}
                to={`/property/${property._id}`}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-xl mb-3">
                  <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <span className="text-4xl">
                      {property.propertyType === 'apartment' && '🏢'}
                      {property.propertyType === 'house' && '🏠'}
                      {property.propertyType === 'villa' && '🏰'}
                      {property.propertyType === 'cabin' && '🏡'}
                      {property.propertyType === 'condo' && '🏬'}
                    </span>
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

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-airbnb-pink to-red-500 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">
            Ready to explore?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Join thousands of travelers discovering amazing places
          </p>
          {!user && (
            <Link
              to="/signup"
              className="inline-block bg-white text-airbnb-pink px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition shadow-lg"
            >
              Get started
            </Link>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">About</h3>
              <ul className="space-y-2 text-gray-600">
                <li><Link to="/about" className="hover:underline">How GoTour works</Link></li>
                <li><Link to="/about" className="hover:underline">Newsroom</Link></li>
                <li><Link to="/about" className="hover:underline">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Community</h3>
              <ul className="space-y-2 text-gray-600">
                <li><Link to="/community" className="hover:underline">Community Standards</Link></li>
                <li><Link to="/community" className="hover:underline">Resource Center</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Host</h3>
              <ul className="space-y-2 text-gray-600">
                <li><Link to="/signup" className="hover:underline">Host your property</Link></li>
                <li><Link to="/signup" className="hover:underline">Hosting resources</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
              <ul className="space-y-2 text-gray-600">
                <li><Link to="/help" className="hover:underline">Help Center</Link></li>
                <li><Link to="/help" className="hover:underline">Safety information</Link></li>
                <li><Link to="/help" className="hover:underline">Cancellation options</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-300 mt-8 pt-8 text-center text-gray-600">
            <p>© 2025 GoTour, Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

