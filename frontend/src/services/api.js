import axios from 'axios';

const API_BASE_URL = 'http://localhost:5002/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for session cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth APIs
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  checkAuth: () => api.get('/auth/check'),
};

// Data APIs
export const dataAPI = {
  getCountries: () => api.get('/data/countries'),
  getStates: (country) => api.get(`/data/states?country=${country}`),
};

// Traveler APIs
export const travelerAPI = {
  getProfile: () => api.get('/traveler/profile'),
  updateProfile: (data) => api.put('/traveler/profile', data),
  uploadProfilePicture: (formData) => api.post('/traveler/profile/picture', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getHistory: () => api.get('/traveler/history'),
};

// Owner APIs
export const ownerAPI = {
  getProfile: () => api.get('/owner/profile'),
  updateProfile: (data) => api.put('/owner/profile', data),
  uploadProfilePicture: (formData) => api.post('/owner/profile/picture', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getDashboard: () => api.get('/owner/dashboard'),
  getMyProperties: () => api.get('/properties/owner/properties'),
  createProperty: (formData) => api.post('/properties', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateProperty: (id, formData) => api.put(`/properties/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteProperty: (id) => api.delete(`/properties/${id}`),
};

// Property APIs
export const propertyAPI = {
  search: (params) => api.get('/properties/search', { params }),
  getById: (id) => api.get(`/properties/${id}`),
  create: (data) => api.post('/properties', data),
  update: (id, data) => api.put(`/properties/${id}`, data),
  delete: (id) => api.delete(`/properties/${id}`),
  uploadPhotos: (id, formData) => api.post(`/properties/${id}/photos`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getOwnerProperties: () => api.get('/properties/owner/properties'),
};

// Booking APIs
export const bookingAPI = {
  create: (data) => api.post('/bookings', data),
  getMyBookings: () => api.get('/bookings/traveler'), // For travelers
  getPropertyBookings: () => api.get('/bookings/owner'), // For owners
  getById: (id) => api.get(`/bookings/${id}`),
  accept: (id) => api.put(`/bookings/${id}/accept`),
  reject: (id) => api.put(`/bookings/${id}/cancel`), // Using cancel endpoint for reject
  cancel: (id) => api.put(`/bookings/${id}/cancel`),
};

// Favorites APIs
export const favoritesAPI = {
  add: (propertyId) => api.post('/favorites', { property_id: propertyId }),
  getAll: () => api.get('/favorites'),
  remove: (propertyId) => api.delete(`/favorites/${propertyId}`),
};

export default api;

