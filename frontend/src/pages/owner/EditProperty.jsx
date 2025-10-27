import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ownerAPI, propertyAPI } from '../../services/api';
import Navbar from '../../components/shared/Navbar';

const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    type: 'Apartment',
    price_per_night: '',
    bedrooms: '',
    bathrooms: '',
    max_guests: '',
    description: '',
    amenities: [],
  });
  const [photos, setPhotos] = useState([]);
  const [existingPhotos, setExistingPhotos] = useState([]);

  const propertyTypes = ['Apartment', 'House', 'Villa', 'Condo', 'Cabin', 'Cottage', 'Other'];
  const amenitiesList = [
    'WiFi',
    'Kitchen',
    'Washer',
    'Dryer',
    'Air conditioning',
    'Heating',
    'TV',
    'Pool',
    'Hot tub',
    'Gym',
    'Parking',
    'Pets allowed',
  ];

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    try {
      const response = await propertyAPI.getById(id);
      if (response.data.success) {
        const property = response.data.property;
        setFormData({
          name: property.name || '',
          location: property.location || '',
          type: property.type || 'Apartment',
          price_per_night: property.price_per_night || '',
          bedrooms: property.bedrooms || '',
          bathrooms: property.bathrooms || '',
          max_guests: property.max_guests || '',
          description: property.description || '',
          amenities: property.amenities || [],
        });
        setExistingPhotos(property.photos || []);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load property' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAmenityToggle = (amenity) => {
    if (formData.amenities.includes(amenity)) {
      setFormData({
        ...formData,
        amenities: formData.amenities.filter((a) => a !== amenity),
      });
    } else {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, amenity],
      });
    }
  };

  const handlePhotoChange = (e) => {
    setPhotos(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const propertyData = new FormData();
      propertyData.append('name', formData.name);
      propertyData.append('location', formData.location);
      propertyData.append('type', formData.type);
      propertyData.append('price_per_night', formData.price_per_night);
      propertyData.append('bedrooms', formData.bedrooms);
      propertyData.append('bathrooms', formData.bathrooms);
      propertyData.append('max_guests', formData.max_guests);
      propertyData.append('description', formData.description);
      propertyData.append('amenities', JSON.stringify(formData.amenities));

      photos.forEach((photo) => {
        propertyData.append('photos', photo);
      });

      const response = await ownerAPI.updateProperty(id, propertyData);
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Property updated successfully!' });
        setTimeout(() => navigate('/owner/properties'), 2000);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update property',
      });
    } finally {
      setSaving(false);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => navigate('/owner/properties')}
            className="flex items-center text-airbnb-gray hover:text-airbnb-dark mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to properties
          </button>
          <h1 className="text-3xl font-bold text-airbnb-dark">Edit Property</h1>
          <p className="text-airbnb-gray mt-2">Update your property details</p>
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

        <div className="bg-white rounded-xl shadow p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold text-airbnb-dark mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-airbnb-dark mb-2">
                    Property Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-airbnb-dark mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-airbnb-dark mb-2">
                    Property Type *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink focus:border-transparent"
                  >
                    {propertyTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-airbnb-dark mb-2">
                    Price per Night ($) *
                  </label>
                  <input
                    type="number"
                    name="price_per_night"
                    value={formData.price_per_night}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-airbnb-dark mb-2">
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-airbnb-dark mb-2">
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-airbnb-dark mb-2">
                    Max Guests
                  </label>
                  <input
                    type="number"
                    name="max_guests"
                    value={formData.max_guests}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold text-airbnb-dark mb-4">Description</h2>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="6"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink focus:border-transparent"
              ></textarea>
            </div>

            {/* Amenities */}
            <div>
              <h2 className="text-xl font-semibold text-airbnb-dark mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {amenitiesList.map((amenity) => (
                  <label
                    key={amenity}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition ${
                      formData.amenities.includes(amenity)
                        ? 'border-airbnb-pink bg-pink-50'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => handleAmenityToggle(amenity)}
                      className="mr-2 text-airbnb-pink focus:ring-airbnb-pink"
                    />
                    <span className="text-sm text-airbnb-dark">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Existing Photos */}
            {existingPhotos.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-airbnb-dark mb-4">Current Photos</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {existingPhotos.map((photo, idx) => (
                    <div key={idx} className="relative h-32 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
                      <img
                        src={`http://localhost:5002${photo}`}
                        alt={`Property ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.parentElement.style.display = 'none';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add New Photos */}
            <div>
              <h2 className="text-xl font-semibold text-airbnb-dark mb-4">Add New Photos</h2>
              <label className="block">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-airbnb-pink transition cursor-pointer">
                  <div className="text-4xl mb-2">📷</div>
                  <p className="text-airbnb-gray">Click to upload additional photos</p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </div>
              </label>
              {photos.length > 0 && (
                <p className="mt-2 text-sm text-green-600">{photos.length} new photo(s) selected</p>
              )}
            </div>

            {/* Submit */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate('/owner/properties')}
                className="px-6 py-3 border border-gray-300 rounded-lg text-airbnb-gray hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-airbnb-pink hover:bg-red-600 text-white rounded-lg font-medium transition disabled:opacity-50"
              >
                {saving ? 'Updating...' : 'Update Property'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProperty;
