import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { refreshUser, selectUser } from '../../redux/slices/authSlice';
import { travelerAPI, dataAPI } from '../../services/api';
import Navbar from '../../components/shared/Navbar';

const Profile = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [profile, setProfile] = useState(null);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    about_me: '',
    city: '',
    state: '',
    country: '',
    languages: '',
    gender: '',
  });

  useEffect(() => {
    fetchProfile();
    fetchCountries();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await travelerAPI.getProfile();
      if (response.data.success) {
        const userData = response.data.user;
        setProfile(userData);
        setFormData({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          about_me: userData.about_me || '',
          city: userData.city || '',
          state: userData.state || '',
          country: userData.country || '',
          languages: userData.languages || '',
          gender: userData.gender || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCountries = async () => {
    // Simple list of countries - can be expanded
    const commonCountries = [
      'United States', 'Canada', 'United Kingdom', 'Australia', 
      'Germany', 'France', 'Spain', 'Italy', 'Japan', 'China',
      'India', 'Brazil', 'Mexico', 'Netherlands', 'Switzerland'
    ];
    setCountries(commonCountries);
  };

  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'firstName':
      case 'lastName':
        if (value && value.length < 2) {
          error = 'Must be at least 2 characters';
        } else if (value && !/^[a-zA-Z\s-']+$/.test(value)) {
          error = 'Only letters, spaces, hyphens, and apostrophes allowed';
        }
        break;

      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Invalid email format';
        }
        break;

      case 'phone':
        if (value && !/^[\d\s\-\(\)\+]+$/.test(value)) {
          error = 'Only numbers, spaces, dashes, parentheses, and + allowed';
        } else if (value && value.replace(/[\s\-\(\)\+]/g, '').length < 10) {
          error = 'Phone number must have at least 10 digits';
      }
        break;

      case 'state':
        if (value && (value.length !== 2 || !/^[A-Z]{2}$/.test(value))) {
          error = 'Must be 2 uppercase letters (e.g., CA)';
        }
        break;

      case 'city':
        if (value && !/^[a-zA-Z\s-']+$/.test(value)) {
          error = 'Only letters, spaces, hyphens, and apostrophes allowed';
        }
        break;

      case 'languages':
        if (value && !/^[a-zA-Z\s,]+$/.test(value)) {
          error = 'Only letters, spaces, and commas allowed';
    }
        break;

      default:
        break;
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Update form data
    setFormData({
      ...formData,
      [name]: value,
    });

    // Validate field and update errors
    const error = validateField(name, value);
    setErrors({
      ...errors,
      [name]: error,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setMessage({ type: 'error', text: 'Please fix the errors before saving' });
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await travelerAPI.updateProfile(formData);
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        fetchProfile();
        // Refresh Redux auth state to update navbar
        await dispatch(refreshUser());
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleCameraClick = () => {
    console.log('📸 Camera icon clicked');
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handlePhotoUpload = async (e) => {
    console.log('📁 File input changed');
    const file = e.target.files[0];
    if (!file) {
      console.log('⚠️ No file selected');
      return;
    }

    console.log('✅ File selected:', file.name, file.type, file.size);
    const formData = new FormData();
    formData.append('profile_picture', file);

    try {
      console.log('📤 Uploading to /traveler/profile/picture...');
      const response = await travelerAPI.uploadProfilePicture(formData);
      console.log('📥 Upload response:', response.data);
      if (response.data.success) {
        console.log('✅ Profile picture uploaded successfully');
        setMessage({ type: 'success', text: 'Profile picture updated!' });
        setImageError(false); // Reset error state
        fetchProfile();
        // Refresh auth state to update navbar
        console.log('🔄 Calling refreshUser to update navbar...');
        await dispatch(refreshUser());
        console.log('✨ Navbar should now be updated!');
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      console.error('❌ Error details:', error.response?.data);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to upload photo' });
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
        <h1 className="text-3xl font-bold text-airbnb-dark mb-8">My Profile</h1>

        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-xl shadow p-8">
          {/* Profile Picture */}
          <div className="flex items-center space-x-6 mb-8 pb-8 border-b">
            <div className="relative">
              {profile?.profilePicture && !imageError ? (
                <img
                  src={profile.profilePicture}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover"
                  onError={() => {
                    console.log('❌ Image failed to load:', profile.profilePicture);
                    setImageError(true);
                  }}
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-airbnb-pink text-white flex items-center justify-center text-3xl font-bold">
                  {profile?.firstName?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <button
                type="button"
                onClick={handleCameraClick}
                className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50 transition"
              >
                <svg className="w-5 h-5 text-airbnb-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
                <input
                ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-airbnb-dark">
                {profile?.firstName} {profile?.lastName}
              </h2>
              <p className="text-airbnb-gray">{profile?.email}</p>
              <p className="text-sm text-airbnb-gray mt-1">Member since {new Date(profile?.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-airbnb-dark mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-airbnb-pink focus:border-transparent ${
                        errors.firstName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-airbnb-dark mb-2">
                      Last Name *
                </label>
                <input
                  type="text"
                      name="lastName"
                      value={formData.lastName}
                  onChange={handleChange}
                  required
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-airbnb-pink focus:border-transparent ${
                        errors.lastName ? 'border-red-500' : 'border-gray-300'
                      }`}
                />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                    )}
              </div>

              <div>
                <label className="block text-sm font-medium text-airbnb-dark mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-airbnb-pink focus:border-transparent ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
              </div>

              <div>
                <label className="block text-sm font-medium text-airbnb-dark mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1-555-0123"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-airbnb-pink focus:border-transparent ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                    )}
              </div>

              <div>
                <label className="block text-sm font-medium text-airbnb-dark mb-2">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink focus:border-transparent"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-airbnb-dark mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Los Angeles"
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
                  State (2-letter code)
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="CA"
                  maxLength={2}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-airbnb-pink focus:border-transparent uppercase ${
                        errors.state ? 'border-red-500' : 'border-gray-300'
                      }`}
                />
                    {errors.state && (
                      <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                    )}
              </div>

              <div>
                <label className="block text-sm font-medium text-airbnb-dark mb-2">
                  Country
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink focus:border-transparent"
                >
                  <option value="">Select country</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-airbnb-dark mb-2">
                  Languages
                </label>
                <input
                  type="text"
                  name="languages"
                  value={formData.languages}
                  onChange={handleChange}
                  placeholder="English, Spanish"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-airbnb-pink focus:border-transparent ${
                        errors.languages ? 'border-red-500' : 'border-gray-300'
                      }`}
                />
                    {errors.languages && (
                      <p className="mt-1 text-sm text-red-600">{errors.languages}</p>
                    )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-airbnb-dark mb-2">
                About Me
              </label>
              <textarea
                name="about_me"
                value={formData.about_me}
                onChange={handleChange}
                rows="4"
                placeholder="Tell us about yourself..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-airbnb-pink focus:border-transparent"
              ></textarea>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => fetchProfile()}
                className="px-6 py-3 border border-gray-300 rounded-lg text-airbnb-gray hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-airbnb-pink hover:bg-red-600 text-white rounded-lg font-medium transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
