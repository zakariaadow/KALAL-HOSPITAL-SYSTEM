import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/PublicLayout';
import Button from '../../components/Button';
import axios from 'axios';

const AppointmentBooking = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL || '/api'}/doctors/`);
      setDoctors(response.data.filter(d => d.is_available));
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-4">Book an Appointment</h1>
        <p className="text-center text-gray-600 mb-8">Already have an account? <Link to="/login" className="text-primary-600 hover:text-primary-700">Login here</Link> to book faster.</p>
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Available Doctors</h2>
          {doctors.length === 0 ? (
            <div className="text-center py-8"><p className="text-gray-500">No doctors available at the moment.</p></div>
          ) : (
            <div className="space-y-4">
              {doctors.map((doctor) => (
                <div key={doctor.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                  <div>
                    <h4 className="font-semibold text-gray-900">{doctor.full_name}</h4>
                    <p className="text-gray-600 text-sm">{doctor.specialization}</p>
                    {doctor.consultation_fee && <p className="text-gray-500 text-sm">💰 Consultation: ${doctor.consultation_fee}</p>}
                  </div>
                  <Link to="/login"><Button variant="primary" size="sm">Book Now</Button></Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
};

export default AppointmentBooking;