// src/pages/public/Departments.jsx
import React, { useState, useEffect } from 'react';
import PublicLayout from '../../components/PublicLayout';
import axios from 'axios';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL || '/api'}/departments/`);
      setDepartments(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch departments:', err);
      setError('Unable to load departments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const departmentIcons = ['❤️', '🦴', '🧠', '👶', '🤰', '👁️', '🩺', '🚨'];
  const colors = ['blue', 'green', 'purple', 'pink', 'red', 'yellow', 'indigo', 'orange'];

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading departments...</p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (error) {
    return (
      <PublicLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <p className="text-lg font-medium text-red-700">{error}</p>
            <button onClick={fetchDepartments} className="mt-4 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition">
              Try Again
            </button>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4">Our Departments</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">Explore our specialized departments and the services they offer.</p>
          <div className="flex justify-center gap-4 mt-6">
            <span className="bg-white/20 px-4 py-2 rounded-full text-sm">🏥 {departments.length} Departments</span>
            <span className="bg-white/20 px-4 py-2 rounded-full text-sm">👨‍⚕️ 50+ Doctors</span>
          </div>
        </div>
      </section>

      {/* Departments Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept, index) => (
            <div key={dept.id} className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden border border-gray-100">
              <div className={`h-2 bg-${colors[index % colors.length]}-600`}></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{departmentIcons[index % departmentIcons.length]}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">#{index + 1}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition">{dept.name}</h3>
                {dept.description && (
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">{dept.description}</p>
                )}
                <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
                  {dept.head_of_department && (
                    <p className="flex items-center text-gray-700"><span className="mr-2">👨‍⚕️</span> Head: {dept.head_of_department}</p>
                  )}
                  {dept.location && (
                    <p className="flex items-center text-gray-700"><span className="mr-2">📍</span> {dept.location}</p>
                  )}
                  {dept.phone && (
                    <p className="flex items-center text-gray-700"><span className="mr-2">📞</span> {dept.phone}</p>
                  )}
                  {dept.email && (
                    <p className="flex items-center text-blue-600"><span className="mr-2">✉️</span> {dept.email}</p>
                  )}
                </div>
                <button className="mt-4 w-full bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 font-medium py-2 px-4 rounded-lg transition border border-gray-200 hover:border-blue-300">
                  Learn More →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div><div className="text-4xl font-bold text-blue-400">{departments.length}+</div><div className="text-gray-400 text-sm">Departments</div></div>
            <div><div className="text-4xl font-bold text-blue-400">50+</div><div className="text-gray-400 text-sm">Expert Doctors</div></div>
            <div><div className="text-4xl font-bold text-blue-400">500+</div><div className="text-gray-400 text-sm">Happy Patients</div></div>
            <div><div className="text-4xl font-bold text-blue-400">24/7</div><div className="text-gray-400 text-sm">Emergency Care</div></div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Departments;