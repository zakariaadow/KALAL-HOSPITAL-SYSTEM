import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Button from '../../components/Button';
import toast from 'react-hot-toast';

const AddPatient = () => {
  const navigate = useNavigate();
  const { api } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    phone: '',
    address: '',
    emergency_contact: '',
    emergency_phone: '',
    blood_type: '',
    allergies: '',
    medical_history: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await api.post('/patients', formData);
      toast.success('Patient created successfully!');
      navigate('/receptionist/patients');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <main className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Patient</h1>
          
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name *</label>
                <input
                  type="text"
                  name="first_name"
                  required
                  value={formData.first_name}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name *</label>
                <input
                  type="text"
                  name="last_name"
                  required
                  value={formData.last_name}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date of Birth *</label>
                <input
                  type="date"
                  name="date_of_birth"
                  required
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Gender *</label>
                <select
                  name="gender"
                  required
                  value={formData.gender}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Blood Type</label>
                <select
                  name="blood_type"
                  value={formData.blood_type}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select Blood Type</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Emergency Contact</label>
                <input
                  type="text"
                  name="emergency_contact"
                  value={formData.emergency_contact}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Emergency Phone</label>
                <input
                  type="tel"
                  name="emergency_phone"
                  value={formData.emergency_phone}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Allergies</label>
                <textarea
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  rows="2"
                  className="input-field"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Medical History</label>
                <textarea
                  name="medical_history"
                  value={formData.medical_history}
                  onChange={handleChange}
                  rows="3"
                  className="input-field"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <Button type="submit" variant="primary" loading={loading}>
                Save Patient
              </Button>
              <Button type="button" variant="secondary" onClick={() => navigate('/receptionist/patients')}>
                Cancel
              </Button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default AddPatient;