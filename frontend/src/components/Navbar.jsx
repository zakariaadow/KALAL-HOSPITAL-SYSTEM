// src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');   // ← Redirects to Home page
  };

  // Role-specific dashboard link when clicking the logo
  const getDashboardLink = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'admin':
      case 'receptionist':
        return '/receptionist/dashboard';
      case 'doctor':
        return '/doctor/dashboard';
      case 'patient':
        return '/patient/dashboard';
      default:
        return '/';
    }
  };

  return (
    <nav className="bg-hospital-blue text-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to={getDashboardLink()} className="flex items-center space-x-2">
              <span className="text-2xl font-bold">🏥 KALAL</span>
              <span className="text-sm font-light hidden md:inline">Hospital System</span>
            </Link>
          </div>

          {/* Desktop User Info */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm">
                  Welcome, <span className="font-semibold">{user.username}</span>
                </span>
                <span className="text-xs bg-white/20 px-3 py-1 rounded-full">
                  {user.role}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm transition duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-sm transition duration-200"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-gray-200 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {isOpen && (
        <div className="md:hidden bg-hospital-blue/95 border-t border-white/10">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {user ? (
              <>
                <div className="px-3 py-2 text-sm">
                  <span className="text-blue-200">Welcome,</span>
                  <span className="font-semibold block">{user.username}</span>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full inline-block mt-1">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-red-600 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-blue-600 transition"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;