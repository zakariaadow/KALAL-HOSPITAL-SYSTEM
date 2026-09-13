// src/pages/public/About.jsx
import React from 'react';
import PublicLayout from '../../components/PublicLayout';

const About = () => {
  return (
    <PublicLayout>
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4">About KALAL Hospital</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">Your Health, Our Priority since 2016</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-md p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
          <p className="text-lg text-gray-700 mb-6 leading-relaxed">
            KALAL Hospital is a leading healthcare institution dedicated to providing comprehensive medical services with compassion and excellence. Since our founding in 2016, we have been committed to improving the health and well-being of our community.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-blue-700 mb-2">🎯 Our Vision</h3>
              <p className="text-gray-700">To be the preferred healthcare provider in the region, known for excellence in patient care, medical education, and research.</p>
            </div>
            <div className="bg-green-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-green-700 mb-2">🌟 Our Mission</h3>
              <p className="text-gray-700">To deliver high-quality, patient-centered care through innovation, education, and research.</p>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Our Core Values</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
              <span className="text-2xl">❤️</span>
              <div><h4 className="font-bold text-gray-900">Patient-Centered</h4><p className="text-sm text-gray-600">We put patients first in everything we do</p></div>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
              <span className="text-2xl">🤝</span>
              <div><h4 className="font-bold text-gray-900">Compassion</h4><p className="text-sm text-gray-600">We treat every patient with kindness and respect</p></div>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
              <span className="text-2xl">⭐</span>
              <div><h4 className="font-bold text-gray-900">Excellence</h4><p className="text-sm text-gray-600">We strive for the highest quality in all services</p></div>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
              <span className="text-2xl">💡</span>
              <div><h4 className="font-bold text-gray-900">Innovation</h4><p className="text-sm text-gray-600">We embrace new technologies and medical advances</p></div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default About;