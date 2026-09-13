// src/components/PublicFooter.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const PublicFooter = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">🏥 KALAL Hospital</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your Health, Our Priority. Providing world-class healthcare services with compassion and excellence.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-gray-400 hover:text-white transition"><span className="text-xl">📘</span></a>
              <a href="#" className="text-gray-400 hover:text-white transition"><span className="text-xl">🐦</span></a>
              <a href="#" className="text-gray-400 hover:text-white transition"><span className="text-xl">📸</span></a>
              <a href="#" className="text-gray-400 hover:text-white transition"><span className="text-xl">💼</span></a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-lg">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-gray-400 hover:text-white transition">Home</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-white transition">About</Link></li>
              <li><Link to="/services" className="text-gray-400 hover:text-white transition">Services</Link></li>
              <li><Link to="/doctors" className="text-gray-400 hover:text-white transition">Doctors</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white transition">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-lg">Departments</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/departments" className="text-gray-400 hover:text-white transition">Cardiology</Link></li>
              <li><Link to="/departments" className="text-gray-400 hover:text-white transition">Neurology</Link></li>
              <li><Link to="/departments" className="text-gray-400 hover:text-white transition">Orthopedics</Link></li>
              <li><Link to="/departments" className="text-gray-400 hover:text-white transition">Pediatrics</Link></li>
              <li><Link to="/departments" className="text-gray-400 hover:text-white transition">Emergency</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-lg">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-3">
                <span>📍</span>
                <span className="text-gray-400">123 Hospital Road, Nairobi</span>
              </li>
              <li className="flex items-start space-x-3">
                <span>📞</span>
                <span className="text-gray-400">+254 712 345 678</span>
              </li>
              <li className="flex items-start space-x-3">
                <span>✉️</span>
                <span className="text-gray-400">info@kalalhospital.com</span>
              </li>
              <li className="pt-2">
                <Link to="/contact" className="text-blue-400 hover:text-blue-300 transition font-medium">
                  Get in Touch →
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} KALAL Hospital. All rights reserved. | Made with ❤️
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;