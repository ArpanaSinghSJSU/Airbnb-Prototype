import axios from 'axios';

// Microservices URLs
const TRAVELER_SERVICE_URL = process.env.REACT_APP_TRAVELER_SERVICE_URL || 'http://localhost:3001';
const OWNER_SERVICE_URL = process.env.REACT_APP_OWNER_SERVICE_URL || 'http://localhost:3002';
const PROPERTY_SERVICE_URL = process.env.REACT_APP_PROPERTY_SERVICE_URL || 'http://localhost:3003';
const BOOKING_SERVICE_URL = process.env.REACT_APP_BOOKING_SERVICE_URL || 'http://localhost:3004';
const AI_AGENT_URL = process.env.REACT_APP_AI_AGENT_URL || 'http://localhost:8000';

// Create axios instances for each service
const createServiceInstance = (baseURL) => {
  const instance = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor to add JWT token
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle auth errors
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

// Service instances
const travelerService = createServiceInstance(TRAVELER_SERVICE_URL);
const ownerService = createServiceInstance(OWNER_SERVICE_URL);
const propertyService = createServiceInstance(PROPERTY_SERVICE_URL);
const bookingService = createServiceInstance(BOOKING_SERVICE_URL);

// Auth APIs (Traveler Service)
export const authAPI = {
  signup: (data) => travelerService.post('/auth/signup', data),
  login: (data) => travelerService.post('/auth/login', data),
  logout: () => travelerService.post('/auth/logout'),
  checkAuth: () => travelerService.get('/auth/check'),
};

// Data APIs (can remain in any service, using traveler for now)
export const dataAPI = {
  getCountries: () => travelerService.get('/data/countries'),
  getStates: (country) => travelerService.get(`/data/states?country=${country}`),
};

// Traveler APIs (Traveler Service)
export const travelerAPI = {
  getProfile: () => travelerService.get('/traveler/profile'),
  updateProfile: (data) => travelerService.put('/traveler/profile', data),
  uploadProfilePicture: (formData) => travelerService.post('/traveler/profile/picture', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getHistory: () => travelerService.get('/traveler/history'),
};

// Owner APIs (Owner Service)
export const ownerAPI = {
  getProfile: () => ownerService.get('/owner/profile'),
  updateProfile: (data) => ownerService.put('/owner/profile', data),
  uploadProfilePicture: (formData) => ownerService.post('/owner/profile/picture', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getDashboard: () => ownerService.get('/owner/dashboard'),
  getMyProperties: () => propertyService.get('/properties/owner/properties'),
  createProperty: (formData) => propertyService.post('/properties', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateProperty: (id, formData) => propertyService.put(`/properties/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteProperty: (id) => propertyService.delete(`/properties/${id}`),
};

// Property APIs (Property Service)
export const propertyAPI = {
  search: (params) => propertyService.get('/properties/search', { params }),
  getById: (id) => propertyService.get(`/properties/${id}`),
  create: (data) => propertyService.post('/properties', data),
  update: (id, data) => propertyService.put(`/properties/${id}`, data),
  delete: (id) => propertyService.delete(`/properties/${id}`),
  uploadPhotos: (id, formData) => propertyService.post(`/properties/${id}/photos`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getOwnerProperties: () => propertyService.get('/properties/owner/properties'),
};

// Booking APIs (Booking Service)
export const bookingAPI = {
  create: (data) => bookingService.post('/bookings', data),
  getMyBookings: () => bookingService.get('/bookings/traveler'),
  getPropertyBookings: () => bookingService.get('/bookings/owner'),
  getById: (id) => bookingService.get(`/bookings/${id}`),
  accept: (id) => bookingService.put(`/bookings/${id}/accept`),
  reject: (id) => bookingService.put(`/bookings/${id}/cancel`),
  cancel: (id) => bookingService.put(`/bookings/${id}/cancel`),
};

// Favorites APIs (Property Service)
export const favoritesAPI = {
  add: (propertyId) => propertyService.post('/favorites', { property_id: propertyId }),
  getAll: () => propertyService.get('/favorites'),
  remove: (propertyId) => propertyService.delete(`/favorites/${propertyId}`),
};

// AI Agent APIs (Direct to AI service)
export const aiAgentAPI = {
  generatePlan: (bookingId, preferences) =>
    axios.post(`${AI_AGENT_URL}/api/concierge/plan-from-booking`, {
      booking_id: bookingId,
      preferences: preferences || {}
    }),
  answerQuery: (query, bookingId, preferences) =>
    axios.post(`${AI_AGENT_URL}/api/concierge/query`, {
      query: query,
      booking_id: bookingId,
      preferences: preferences || {}
    }),
  healthCheck: () => axios.get(`${AI_AGENT_URL}/health`)
};

// Export service instances for advanced usage
export const services = {
  traveler: travelerService,
  owner: ownerService,
  property: propertyService,
  booking: bookingService,
};

export default travelerService; // Default export for backward compatibility
