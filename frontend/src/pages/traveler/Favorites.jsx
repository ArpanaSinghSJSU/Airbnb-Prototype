import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { favoritesAPI } from '../../services/api';
import Navbar from '../../components/shared/Navbar';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const response = await favoritesAPI.getAll();
      if (response.data.success) {
        setFavorites(response.data.favorites);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (propertyId) => {
    try {
      const response = await favoritesAPI.remove(propertyId);
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Removed from favorites' });
        fetchFavorites();
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to remove from favorites',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-airbnb-dark mb-6">My Favorites</h1>

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

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow animate-pulse">
                <div className="h-64 bg-gray-200 rounded-t-xl"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">❤️</div>
            <h3 className="text-xl font-semibold text-airbnb-dark mb-2">No favorites yet</h3>
            <p className="text-airbnb-gray mb-6">
              Start adding properties to your favorites to see them here!
            </p>
            <Link
              to="/traveler/search"
              className="inline-block bg-airbnb-pink hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition"
            >
              Explore Properties
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => (
              <div
                key={favorite.property_id}
                className="bg-white rounded-xl shadow hover:shadow-xl transition group relative"
              >
                {/* Remove Button */}
                <button
                  onClick={() => handleRemove(favorite.property_id)}
                  className="absolute top-3 right-3 z-10 bg-white hover:bg-red-50 p-2 rounded-full shadow-lg transition"
                  title="Remove from favorites"
                >
                  <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                <Link to={`/traveler/property/${favorite.property_id}`}>
                  <div className="relative h-64 bg-gray-200 rounded-t-xl overflow-hidden">
                    {(() => {
                      // Parse photos if it's a string, or use as is if already an array
                      let photos = favorite.photos;
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
                          alt={favorite.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          onError={(e) => {
                            e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-6xl">🏠</div>';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl">
                          🏠
                        </div>
                      );
                    })()}
                    <div className="absolute bottom-3 right-3 bg-white px-3 py-1 rounded-full shadow">
                      <span className="text-sm font-semibold text-airbnb-dark">
                        ${favorite.price_per_night}/night
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-airbnb-dark group-hover:text-airbnb-pink transition">
                      {favorite.name}
                    </h3>
                    <p className="text-sm text-airbnb-gray mt-1">📍 {favorite.location}</p>
                    <p className="text-sm text-airbnb-gray mt-2">
                      Added on{' '}
                      {new Date(favorite.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
