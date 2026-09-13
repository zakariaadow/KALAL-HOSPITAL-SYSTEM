// src/pages/receptionist/AddDoctor.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Button from '../../components/Button';
import toast from 'react-hot-toast';

const AddDoctor = () => {
  const navigate = useNavigate();
  const { api, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    specialization: '',
    license_number: '',
    department_id: '',
    phone: '',
    email: '',
    consultation_fee: '',
    years_of_experience: '',
    qualifications: '',
    is_available: true,
  });

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    // Redirect if not admin
    if (!isAdmin) {
      toast.error('Admin privileges required to add doctors');
      navigate('/receptionist/doctors');
      return;
    }
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments/');
      setDepartments(response.data);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Double-check admin status
    if (!isAdmin) {
      toast.error('Admin privileges required');
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare data - if license_number is empty, backend will auto-generate
      const submitData = {
        ...formData,
        consultation_fee: formData.consultation_fee ? parseFloat(formData.consultation_fee) : 0,
        years_of_experience: formData.years_of_experience ? parseInt(formData.years_of_experience) : 0,
        // Only send license_number if it has a value
        ...(formData.license_number && { license_number: formData.license_number }),
      };
      
      await api.post('/doctors/', submitData);
      toast.success('Doctor added successfully!');
      navigate('/receptionist/doctors');
    } catch (error) {
      console.error('Error adding doctor:', error);
      const errorMessage = error.response?.data?.error || 'Failed to add doctor';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // If not admin, show access denied
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex bg-gray-50">
        <Sidebar />
        <div className="flex-1">
          <Navbar />
          <main className="p-6">
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-8 rounded-2xl text-center max-w-md mx-auto">
              <div className="text-5xl mb-4">⛔</div>
              <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
              <p className="mb-4">Admin privileges required to add doctors.</p>
              <button
                onClick={() => navigate('/receptionist/doctors')}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition"
              >
                Back to Doctors
              </button>
            </div>
          </main>
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
              <h1 className="text-2xl font-bold text-gray-900">Add New Doctor</h1>
              <p className="text-gray-600">Admin only - Create a new doctor profile</p>
              <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                🔒 Admin Access Only
              </span>
            </div>
          </div>
          
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
                  placeholder="Enter first name"
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
                  placeholder="Enter last name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Specialization *</label>
                <input
                  type="text"
                  name="specialization"
                  required
                  value={formData.specialization}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter specialization"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">License Number</label>
                <input
                  type="text"
                  name="license_number"
                  value={formData.license_number}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter license number (optional)"
                />
                <p className="text-xs text-gray-400 mt-1">If left empty, one will be auto-generated</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Department</label>
                <select
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
                <input
                  type="number"
                  name="years_of_experience"
                  value={formData.years_of_experience}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="0"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Consultation Fee</label>
                <input
                  type="number"
                  name="consultation_fee"
                  value={formData.consultation_fee}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
              <div className="flex items-center mt-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_available"
                    checked={formData.is_available}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Available</span>
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Qualifications</label>
                <textarea
                  name="qualifications"
                  value={formData.qualifications}
                  onChange={handleChange}
                  rows="3"
                  className="input-field"
                  placeholder="Enter qualifications"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <Button type="submit" variant="primary" loading={loading}>
                Add Doctor
              </Button>
              <Button type="button" variant="secondary" onClick={() => navigate('/receptionist/doctors')}>
                Cancel
              </Button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default AddDoctor;