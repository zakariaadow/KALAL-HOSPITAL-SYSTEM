// src/pages/public/Doctors.jsx
import React, { useState, useEffect } from 'react';
import PublicLayout from '../../components/PublicLayout';
import axios from 'axios';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await axios.get('/api/doctors/');
      setDoctors(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch doctors:', err);
      setError('Unable to load doctors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const specialties = {
    'Cardiology': '❤️',
    'Orthopedics': '🦴',
    'Neurology': '🧠',
    'Pediatrics': '👶',
    'Obstetrics & Gynecology': '🤰',
    'Ophthalmology': '👁️',
    'General Medicine': '🩺',
    'Emergency Medicine': '🚨',
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading doctors...</p>
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
            <button onClick={fetchDoctors} className="mt-4 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition">
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
      <section className="bg-gradient-to-r from-green-600 to-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4">Our Doctors</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">Meet our team of highly qualified and experienced medical professionals.</p>
          <div className="flex justify-center gap-4 mt-6">
            <span className="bg-white/20 px-4 py-2 rounded-full text-sm">👨‍⚕️ {doctors.length} Doctors</span>
            <span className="bg-white/20 px-4 py-2 rounded-full text-sm">🏥 20+ Specialties</span>
          </div>
        </div>
      </section>

      {/* Doctors Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden border border-gray-100">
              <div className={`h-2 ${doctor.is_available ? 'bg-green-600' : 'bg-red-600'}`}></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl">{doctor.gender === 'Female' ? '👩‍⚕️' : '👨‍⚕️'}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${doctor.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {doctor.is_available ? '🟢 Available' : '🔴 Unavailable'}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition">{doctor.full_name}</h3>
                <p className="text-blue-600 font-medium flex items-center">
                  <span className="mr-1">{specialties[doctor.specialization] || '🩺'}</span>
                  {doctor.specialization}
                </p>
                <div className="mt-4 space-y-2 text-sm border-t border-gray-100 pt-4">
                  {doctor.qualifications && (
                    <p className="flex items-start text-gray-700"><span className="mr-2">📜</span> {doctor.qualifications}</p>
                  )}
                  {doctor.years_of_experience && (
                    <p className="flex items-center text-gray-700"><span className="mr-2">📅</span> {doctor.years_of_experience} years experience</p>
                  )}
                  {doctor.consultation_fee && (
                    <p className="flex items-center text-gray-700"><span className="mr-2">💰</span> <span className="text-green-600 font-semibold">${doctor.consultation_fee}</span></p>
                  )}
                  {doctor.phone && (
                    <p className="flex items-center text-gray-700"><span className="mr-2">📞</span> {doctor.phone}</p>
                  )}
                </div>
                <button className={`mt-4 w-full font-medium py-2 px-4 rounded-lg transition ${doctor.is_available ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
                  {doctor.is_available ? 'Book Appointment →' : 'Not Available'}
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
            <div><div className="text-4xl font-bold text-green-400">{doctors.length}+</div><div className="text-gray-400 text-sm">Expert Doctors</div></div>
            <div><div className="text-4xl font-bold text-green-400">20+</div><div className="text-gray-400 text-sm">Specialties</div></div>
            <div><div className="text-4xl font-bold text-green-400">500+</div><div className="text-gray-400 text-sm">Happy Patients</div></div>
            <div><div className="text-4xl font-bold text-green-400">10+</div><div className="text-gray-400 text-sm">Years Experience</div></div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Doctors;