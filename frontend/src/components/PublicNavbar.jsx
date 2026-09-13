// src/components/PublicNavbar.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const PublicNavbar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/services', label: 'Services' },
    { path: '/doctors', label: 'Doctors' },
    { path: '/departments', label: 'Departments' },
    { path: '/blog', label: 'Blog' },
    { path: '/contact', label: 'Contact' },
  ];

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <span className="text-2xl font-bold text-blue-700">🏥 KALAL</span>
              <span className="text-sm font-light text-gray-500 hidden md:inline group-hover:text-blue-600 transition">Hospital</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === link.path 
                    ? 'text-blue-700 bg-blue-50' 
                    : 'text-gray-600 hover:text-blue-700 hover:bg-blue-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-3">
            <Link
              to="/login"
              className="px-5 py-2 text-blue-700 border-2 border-blue-700 rounded-lg hover:bg-blue-700 hover:text-white transition-all duration-200 font-medium text-sm"
            >
              Login
            </Link>
            <Link
              to="/patient-portal"
              className="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium text-sm shadow-md hover:shadow-lg"
            >
              Patient Portal
            </Link>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none p-2 rounded-lg hover:bg-gray-100 transition"
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

      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 pt-2 pb-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-4 py-2 rounded-lg text-sm font-medium ${
                  location.pathname === link.path 
                    ? 'text-blue-700 bg-blue-50' 
                    : 'text-gray-600 hover:text-blue-700 hover:bg-blue-50'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-gray-100 space-y-2">
              <Link
                to="/login"
                className="block px-4 py-2 rounded-lg text-sm font-medium text-blue-700 border-2 border-blue-700 text-center hover:bg-blue-700 hover:text-white transition"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/patient-portal"
                className="block px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 text-center hover:from-blue-700 hover:to-blue-800 transition"
                onClick={() => setIsOpen(false)}
              >
                Patient Portal
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default PublicNavbar;