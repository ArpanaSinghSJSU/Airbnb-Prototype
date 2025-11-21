import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector, useDispatch } from 'react-redux';
import store from './redux/store';
import { checkAuth } from './redux/slices/authSlice';
import { selectUser, selectAuthLoading } from './redux/slices/authSlice';

// Auth Pages
import Login from './pages/Login';
import Signup from './pages/Signup';

// Traveler Pages
import TravelerDashboard from './pages/traveler/Dashboard';
import TravelerProfile from './pages/traveler/Profile';
import PropertySearch from './pages/traveler/PropertySearch';
import PropertyDetails from './pages/traveler/PropertyDetails';
import MyBookings from './pages/traveler/MyBookings';
import Favorites from './pages/traveler/Favorites';
import History from './pages/traveler/History';

// Owner Pages
import OwnerDashboard from './pages/owner/Dashboard';
import OwnerProfile from './pages/owner/Profile';
import MyProperties from './pages/owner/MyProperties';
import CreateProperty from './pages/owner/CreateProperty';
import EditProperty from './pages/owner/EditProperty';
import ManageBookings from './pages/owner/ManageBookings';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const user = useSelector(selectUser);
  const loading = useSelector(selectAuthLoading);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={`/${user.role}/dashboard`} />;
  }

  return children;
};

function AppRoutes() {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  // Check authentication status on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(checkAuth());
    }
  }, [dispatch]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/" 
        element={
          user 
            ? <Navigate to={`/${user.role}/dashboard`} /> 
            : <Navigate to="/login" />
        } 
      />
      <Route path="/login" element={user ? <Navigate to={`/${user.role}/dashboard`} /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to={`/${user.role}/dashboard`} /> : <Signup />} />

      {/* Traveler Routes */}
      <Route path="/traveler/dashboard" element={<ProtectedRoute requiredRole="traveler"><TravelerDashboard /></ProtectedRoute>} />
      <Route path="/traveler/profile" element={<ProtectedRoute requiredRole="traveler"><TravelerProfile /></ProtectedRoute>} />
      <Route path="/traveler/search" element={<ProtectedRoute requiredRole="traveler"><PropertySearch /></ProtectedRoute>} />
      <Route path="/traveler/property/:id" element={<ProtectedRoute requiredRole="traveler"><PropertyDetails /></ProtectedRoute>} />
      <Route path="/traveler/bookings" element={<ProtectedRoute requiredRole="traveler"><MyBookings /></ProtectedRoute>} />
      <Route path="/traveler/favorites" element={<ProtectedRoute requiredRole="traveler"><Favorites /></ProtectedRoute>} />
      <Route path="/traveler/history" element={<ProtectedRoute requiredRole="traveler"><History /></ProtectedRoute>} />

      {/* Owner Routes */}
      <Route path="/owner/dashboard" element={<ProtectedRoute requiredRole="owner"><OwnerDashboard /></ProtectedRoute>} />
      <Route path="/owner/profile" element={<ProtectedRoute requiredRole="owner"><OwnerProfile /></ProtectedRoute>} />
      <Route path="/owner/properties" element={<ProtectedRoute requiredRole="owner"><MyProperties /></ProtectedRoute>} />
      <Route path="/owner/properties/create" element={<ProtectedRoute requiredRole="owner"><CreateProperty /></ProtectedRoute>} />
      <Route path="/owner/properties/edit/:id" element={<ProtectedRoute requiredRole="owner"><EditProperty /></ProtectedRoute>} />
      <Route path="/owner/bookings" element={<ProtectedRoute requiredRole="owner"><ManageBookings /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppRoutes />
      </Router>
    </Provider>
  );
}

export default App;
