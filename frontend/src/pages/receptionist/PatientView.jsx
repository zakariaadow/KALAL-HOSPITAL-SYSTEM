// src/pages/receptionist/PatientView.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Button from '../../components/Button';
import toast from 'react-hot-toast';

const PatientView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { api } = useAuth();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPatient();
  }, [id]);

  const fetchPatient = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/patients/${id}`);
      setPatient(response.data);
    } catch (error) {
      console.error('Failed to fetch patient:', error);
      setError('Failed to load patient details');
      toast.error('Failed to load patient');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex">
        <Sidebar />
        <div className="flex-1">
          <Navbar />
          <div className="p-6 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="min-h-screen flex">
        <Sidebar />
        <div className="flex-1">
          <Navbar />
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
              <p className="font-medium">{error || 'Patient not found'}</p>
              <Link to="/receptionist/patients">
                <button className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition">
                  Back to Patients
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <main className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Patient Details</h1>
              <p className="text-gray-600">View patient information</p>
            </div>
            <div className="flex gap-2">
              <Link to="/receptionist/patients">
                <Button variant="secondary">Back</Button>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                  <p className="text-lg font-semibold text-gray-900">{patient.full_name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Gender</h3>
                  <p className="text-lg text-gray-900">{patient.gender}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date of Birth</h3>
                  <p className="text-lg text-gray-900">
                    {patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Blood Type</h3>
                  <p className="text-lg text-gray-900">{patient.blood_type || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                  <p className="text-lg text-gray-900">{patient.phone || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Address</h3>
                  <p className="text-lg text-gray-900">{patient.address || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Emergency Contact</h3>
                  <p className="text-lg text-gray-900">{patient.emergency_contact || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Emergency Phone</h3>
                  <p className="text-lg text-gray-900">{patient.emergency_phone || 'N/A'}</p>
                </div>
                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium text-gray-500">Allergies</h3>
                  <p className="text-lg text-gray-900">{patient.allergies || 'None'}</p>
                </div>
                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium text-gray-500">Medical History</h3>
                  <p className="text-lg text-gray-900">{patient.medical_history || 'None'}</p>
                </div>
                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium text-gray-500">Patient Since</h3>
                  <p className="text-lg text-gray-900">
                    {patient.created_at ? new Date(patient.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PatientView;