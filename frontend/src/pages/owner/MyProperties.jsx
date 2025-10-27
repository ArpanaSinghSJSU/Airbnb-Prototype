import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ownerAPI } from '../../services/api';
import Navbar from '../../components/shared/Navbar';

const MyProperties = () => {
  const location = useLocation();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchProperties();
  }, [location]); // Refetch when location changes (e.g., navigating back to this page)

  const fetchProperties = async () => {
    try {
      const response = await ownerAPI.getMyProperties();
      if (response.data.success) {
        setProperties(response.data.properties);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (propertyId) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;

    try {
      const response = await ownerAPI.deleteProperty(propertyId);
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Property deleted successfully' });
        fetchProperties();
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to delete property',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-airbnb-dark">My Properties</h1>
            <p className="text-airbnb-gray mt-2">Manage your property listings</p>
          </div>
          <Link
            to="/owner/properties/create"
            className="bg-airbnb-pink hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition flex items-center space-x-2"
          >
            <span>➕</span>
            <span>Add New Property</span>
          </Link>
        </div>

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
        ) : properties.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-xl font-semibold text-airbnb-dark mb-2">No properties yet</h3>
            <p className="text-airbnb-gray mb-6">
              Start listing your first property and earn extra income!
            </p>
            <Link
              to="/owner/properties/new"
              className="inline-block bg-airbnb-pink hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition"
            >
              Add Your First Property
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div
                key={property.id}
                className="bg-white rounded-xl shadow hover:shadow-xl transition"
              >
                <div className="relative h-64 bg-gray-200 rounded-t-xl overflow-hidden">
                  {property.photos && property.photos.length > 0 ? (
                    <img
                      src={`http://localhost:5002${property.photos[0]}`}
                      alt={property.name}
                      className="w-full h-full object-cover"
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
                      ${property.price_per_night}/night
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-lg text-airbnb-dark">{property.name}</h3>
                  <p className="text-sm text-airbnb-gray mt-1">📍 {property.location}</p>
                  <p className="text-sm text-airbnb-gray mt-1">
                    {property.type && `${property.type} • `}
                    {property.bedrooms} bed • {property.bathrooms} bath
                  </p>
                  <p className="text-sm text-airbnb-gray mt-1">
                    👥 Up to {property.max_guests} guests
                  </p>

                  <div className="mt-4 pt-4 border-t flex space-x-2">
                    <Link
                      to={`/owner/properties/edit/${property.id}`}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-airbnb-dark py-2 px-4 rounded-lg text-center font-medium transition"
                    >
                      ✏️ Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(property.id)}
                      className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 px-4 rounded-lg font-medium transition"
                    >
                      🗑️ Delete
                    </button>
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

export default MyProperties;
