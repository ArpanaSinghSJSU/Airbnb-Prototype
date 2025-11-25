import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ownerAPI } from '../../services/api';
import Navbar from '../../components/shared/Navbar';

const CreateProperty = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    state: '',
    country: 'USA',
    zipcode: '',
    address: '',
    type: 'apartment',
    price_per_night: '',
    bedrooms: '',
    bathrooms: '',
    max_guests: '',
    description: '',
    amenities: [],
  });
  const [photos, setPhotos] = useState([]);

  const propertyTypes = [
    { value: 'apartment', label: 'Apartment' },
    { value: 'house', label: 'House' },
    { value: 'villa', label: 'Villa' },
    { value: 'condo', label: 'Condo' },
    { value: 'cabin', label: 'Cabin' },
    { value: 'other', label: 'Other' }
  ];
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

  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'name':
        if (!value || value.trim() === '') {
          error = 'Property name is required';
        } else if (value.length < 3) {
          error = 'Property name must be at least 3 characters';
        }
        break;
      case 'city':
        if (!value || value.trim() === '') {
          error = 'City is required';
        }
        break;
      case 'state':
        if (!value || value.trim() === '') {
          error = 'State is required';
        }
        break;
      case 'description':
        if (!value || value.trim() === '') {
          error = 'Description is required';
        } else if (value.length < 20) {
          error = 'Description must be at least 20 characters';
        }
        break;
      case 'price_per_night':
        if (!value || value === '') {
          error = 'Price is required';
        } else if (parseFloat(value) <= 0) {
          error = 'Price must be greater than 0';
        }
        break;
      default:
        break;
    }
    
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Validate field in real-time
    const error = validateField(name, value);
    setErrors({
      ...errors,
      [name]: error,
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
    
    // Validate all fields before submission
    const newErrors = {};
    ['name', 'city', 'state', 'description', 'price_per_night'].forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setMessage({
        type: 'error',
        text: 'Please fix the errors below before submitting',
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Log form data for debugging
      console.log('📋 Form Data:', formData);
      console.log('📋 Property Type being sent:', formData.type);
      
      const propertyData = new FormData();
      propertyData.append('name', formData.name);
      propertyData.append('city', formData.city);
      propertyData.append('state', formData.state);
      propertyData.append('country', formData.country);
      propertyData.append('zipcode', formData.zipcode);
      propertyData.append('address', formData.address);
      propertyData.append('propertyType', formData.type); // Should be lowercase like 'apartment'
      propertyData.append('pricePerNight', formData.price_per_night);
      propertyData.append('bedrooms', formData.bedrooms || '0');
      propertyData.append('bathrooms', formData.bathrooms || '0');
      propertyData.append('maxGuests', formData.max_guests || '1');
      propertyData.append('description', formData.description);
      propertyData.append('amenities', JSON.stringify(formData.amenities));

      photos.forEach((photo) => {
        propertyData.append('photos', photo);
      });
      
      console.log('🚀 Sending property data to backend...');

      const response = await ownerAPI.createProperty(propertyData);
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Property added successfully!' });
        setTimeout(() => navigate('/owner/properties'), 2000);
      }
    } catch (error) {
      console.error('❌ Create property error:', error);
      console.error('❌ Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add property';
      setMessage({
        type: 'error',
        text: `Error: ${errorMessage}`,
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold text-airbnb-dark">Add New Property</h1>
          <p className="text-airbnb-gray mt-2">List your property and start earning</p>
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
                    placeholder="Beautiful Downtown Apartment"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-airbnb-pink focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-airbnb-dark mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Miami"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-airbnb-pink focus:border-transparent ${
                      errors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-airbnb-dark mb-2">
                    State/Province *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    placeholder="e.g., FL"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-airbnb-pink focus:border-transparent ${
                      errors.state ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.state && (
                    <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-airbnb-dark mb-2">
                    Country *
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    placeholder="e.g., USA"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-airbnb-dark mb-2">
                    Zip Code
                  </label>
                  <input
                    type="text"
                    name="zipcode"
                    value={formData.zipcode}
                    onChange={handleChange}
                    placeholder="e.g., 33131"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-airbnb-dark mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="e.g., 100 Biscayne Blvd"
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
                      <option key={type.value} value={type.value}>
                        {type.label}
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
                    placeholder="100.00"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-airbnb-pink focus:border-transparent ${
                      errors.price_per_night ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.price_per_night && (
                    <p className="mt-1 text-sm text-red-600">{errors.price_per_night}</p>
                  )}
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
                    placeholder="2"
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
                    placeholder="1"
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
                    placeholder="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold text-airbnb-dark mb-4">Description *</h2>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="6"
                placeholder="Describe your property, its unique features, nearby attractions, and what makes it special..."
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-airbnb-pink focus:border-transparent ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
              ></textarea>
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
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

            {/* Photos */}
            <div>
              <h2 className="text-xl font-semibold text-airbnb-dark mb-4">Photos</h2>
              <label className="block">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-airbnb-pink transition cursor-pointer">
                  <div className="text-4xl mb-2">📷</div>
                  <p className="text-airbnb-gray">Click to upload photos</p>
                  <p className="text-sm text-airbnb-gray mt-2">Upload up to 10 photos</p>
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
                <p className="mt-2 text-sm text-green-600">{photos.length} photo(s) selected</p>
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
                disabled={loading}
                className="px-6 py-3 bg-airbnb-pink hover:bg-red-600 text-white rounded-lg font-medium transition disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Property'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProperty;

