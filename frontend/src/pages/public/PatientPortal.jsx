// src/pages/public/PatientPortal.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/PublicLayout';
import Button from '../../components/Button';

const PatientPortal = () => {
  return (
    <PublicLayout>
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4">Patient Portal</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">Access your health records, book appointments, and manage your healthcare.</p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-md p-8 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <div className="text-6xl mb-4">🔐</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Login to Portal</h2>
            <p className="text-gray-600 mb-6">Access your personal health records, book appointments, and manage your healthcare.</p>
            <Link to="/login"><Button variant="primary" className="w-full">Login</Button></Link>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-8 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">New Patient?</h2>
            <p className="text-gray-600 mb-6">Register for a new account and start managing your health from anywhere.</p>
            <Link to="/register"><Button variant="success" className="w-full">Register Now</Button></Link>
          </div>
        </div>

        <div className="mt-12 bg-white rounded-2xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Portal Features</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition cursor-pointer">
              <div className="text-3xl mb-2">📅</div>
              <p className="text-sm font-medium text-gray-700">Book Appointments</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition cursor-pointer">
              <div className="text-3xl mb-2">📋</div>
              <p className="text-sm font-medium text-gray-700">Medical Records</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition cursor-pointer">
              <div className="text-3xl mb-2">💊</div>
              <p className="text-sm font-medium text-gray-700">Prescriptions</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition cursor-pointer">
              <div className="text-3xl mb-2">💰</div>
              <p className="text-sm font-medium text-gray-700">Billing</p>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default PatientPortal;