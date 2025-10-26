import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { user, logout, isTraveler } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const travelerLinks = [
    { to: '/traveler/dashboard', label: 'Dashboard', icon: '🏠' },
    { to: '/traveler/search', label: 'Search', icon: '🔍' },
    { to: '/traveler/bookings', label: 'Bookings', icon: '📅' },
    { to: '/traveler/favorites', label: 'Favorites', icon: '❤️' },
    { to: '/traveler/history', label: 'History', icon: '📜' },
  ];

  const ownerLinks = [
    { to: '/owner/dashboard', label: 'Dashboard', icon: '🏠' },
    { to: '/owner/properties', label: 'Properties', icon: '🏘️' },
    { to: '/owner/bookings', label: 'Requests', icon: '📋' },
  ];

  const links = isTraveler ? travelerLinks : ownerLinks;
  const profileLink = isTraveler ? '/traveler/profile' : '/owner/profile';

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to={`/${user?.role}/dashboard`} className="flex items-center space-x-2">
              <span className="text-3xl font-bold text-airbnb-pink">airbnb</span>
              <span className="hidden sm:block text-xs text-airbnb-gray bg-gray-100 px-2 py-1 rounded">
                {isTraveler ? 'Traveler' : 'Owner'}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  isActive(link.to)
                    ? 'bg-airbnb-pink text-white'
                    : 'text-airbnb-gray hover:bg-gray-100 hover:text-airbnb-dark'
                }`}
              >
                <span className="mr-1">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Profile Dropdown */}
            <div className="relative group">
              <Link
                to={profileLink}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="w-8 h-8 bg-airbnb-pink text-white rounded-full flex items-center justify-center font-semibold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block text-sm font-medium text-airbnb-dark">
                  {user?.name}
                </span>
              </Link>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="hidden sm:block px-4 py-2 text-sm font-medium text-airbnb-gray hover:text-red-600 transition"
            >
              Logout
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-2 rounded-lg text-sm font-medium ${
                  isActive(link.to)
                    ? 'bg-airbnb-pink text-white'
                    : 'text-airbnb-gray hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">{link.icon}</span>
                {link.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

