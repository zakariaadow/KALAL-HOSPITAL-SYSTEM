// src/pages/public/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/PublicLayout';
import Button from '../../components/Button';

const Home = () => {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section 
        className="relative bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 text-white bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/kalal.jpeg')" }}
      >
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/50"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
          <div className="text-center max-w-4xl mx-auto">
            <span className="inline-block px-4 py-1 bg-white/20 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
              🏥 Welcome to KALAL Hospital
            </span>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Your Health, <br />
              <span className="text-blue-200">Our Priority</span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Providing world-class healthcare services with compassion, innovation, and excellence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/book-appointment">
                <Button variant="primary" size="lg" className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all">
                  📅 Book Appointment
                </Button>
              </Link>
              <Link to="/patient-portal">
                <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white/10 px-8 py-3 text-lg">
                  🔐 Patient Portal
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L1440 60L1440 0L0 60Z" fill="#f3f4f6"/>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Why Choose Us</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2">World-Class Healthcare Services</h2>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">We are committed to providing the highest quality medical care with compassion and excellence.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-3xl mb-4">🏥</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">24/7 Emergency Care</h3>
              <p className="text-gray-600">Round-the-clock emergency services with experienced medical staff and state-of-the-art equipment.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-3xl mb-4">👨‍⚕️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Expert Doctors</h3>
              <p className="text-gray-600">Highly qualified specialists across all medical disciplines with years of experience.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center text-3xl mb-4">💊</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Modern Facilities</h3>
              <p className="text-gray-600">State-of-the-art equipment and modern healthcare facilities for accurate diagnosis and treatment.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-4">
              <div className="text-5xl font-bold mb-2">500+</div>
              <div className="text-blue-200 text-sm uppercase tracking-wider">Happy Patients</div>
            </div>
            <div className="p-4">
              <div className="text-5xl font-bold mb-2">50+</div>
              <div className="text-blue-200 text-sm uppercase tracking-wider">Expert Doctors</div>
            </div>
            <div className="p-4">
              <div className="text-5xl font-bold mb-2">20+</div>
              <div className="text-blue-200 text-sm uppercase tracking-wider">Departments</div>
            </div>
            <div className="p-4">
              <div className="text-5xl font-bold mb-2">10+</div>
              <div className="text-blue-200 text-sm uppercase tracking-wider">Years Excellence</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Need Medical Assistance?</h2>
          <p className="text-xl text-gray-600 mb-8">Our team is ready to help you with any medical concerns.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button variant="primary" size="lg" className="px-8 py-3 text-lg">Contact Us</Button>
            </Link>
            <Link to="/about">
              <Button variant="secondary" size="lg" className="px-8 py-3 text-lg">Learn More</Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Home;