// src/pages/receptionist/Doctors.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';

const Doctors = () => {
  const { api, user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
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
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/doctors/');
      setDoctors(response.data);
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
      setError('Failed to load doctors');
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (doctor) => {
    setSelectedDoctor(doctor);
    setFormData({
      first_name: doctor.first_name || '',
      last_name: doctor.last_name || '',
      specialization: doctor.specialization || '',
      license_number: doctor.license_number || '',
      department_id: doctor.department_id || '',
      phone: doctor.phone || '',
      email: doctor.email || '',
      consultation_fee: doctor.consultation_fee || '',
      years_of_experience: doctor.years_of_experience || '',
      qualifications: doctor.qualifications || '',
      is_available: doctor.is_available ?? true,
    });
    setShowEditModal(true);
  };

  const handleDelete = (doctor) => {
    setSelectedDoctor(doctor);
    setShowDeleteModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/doctors/${selectedDoctor.id}`, formData);
      toast.success('Doctor updated successfully!');
      setShowEditModal(false);
      fetchDoctors();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update doctor');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/doctors/${selectedDoctor.id}`);
      toast.success('Doctor deleted successfully!');
      setShowDeleteModal(false);
      fetchDoctors();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete doctor');
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { 
      header: 'Full Name', 
      accessor: 'full_name',
      render: (row) => row.full_name || `${row.first_name} ${row.last_name}`
    },
    { header: 'Specialization', accessor: 'specialization' },
    { header: 'Phone', accessor: 'phone' },
    { 
      header: 'Fee', 
      accessor: 'consultation_fee',
      render: (row) => `$${row.consultation_fee?.toFixed(2) || '0.00'}`
    },
    {
      header: 'Status',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          row.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {row.is_available ? 'Available' : 'Unavailable'}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

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

  if (error) {
    return (
      <div className="min-h-screen flex">
        <Sidebar />
        <div className="flex-1">
          <Navbar />
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
              <p className="font-medium">{error}</p>
              <button 
                onClick={fetchDoctors}
                className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition"
              >
                Retry
              </button>
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
              <h1 className="text-2xl font-bold text-gray-900">Doctors</h1>
              <p className="text-gray-600">Manage doctor records</p>
              <p className="text-sm text-gray-500">Total: {doctors.length} doctors</p>
            </div>
            {/* Only show Add Doctor button for Admin */}
            {isAdmin && (
              <Link to="/receptionist/doctors/add">
                <Button variant="primary">Add Doctor</Button>
              </Link>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <Table columns={columns} data={doctors} />
            {doctors.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <div className="text-4xl mb-2">👨‍⚕️</div>
                <p>No doctors found</p>
              </div>
            )}
          </div>

          {/* Edit Modal */}
          <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Doctor">
            <form onSubmit={handleEditSubmit} className="space-y-4">
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
                  <label className="block text-sm font-medium text-gray-700">Specialization *</label>
                  <input
                    type="text"
                    name="specialization"
                    required
                    value={formData.specialization}
                    onChange={handleChange}
                    className="input-field"
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
                    placeholder="License number (optional)"
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
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Consultation Fee</label>
                  <input
                    type="number"
                    name="consultation_fee"
                    step="0.01"
                    value={formData.consultation_fee}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
                  <input
                    type="number"
                    name="years_of_experience"
                    value={formData.years_of_experience}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Qualifications</label>
                  <textarea
                    name="qualifications"
                    value={formData.qualifications}
                    onChange={handleChange}
                    rows="3"
                    className="input-field"
                  />
                </div>
                <div className="md:col-span-2">
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
              </div>
              <div className="flex gap-4">
                <Button type="submit" variant="primary">Update Doctor</Button>
                <Button type="button" variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
              </div>
            </form>
          </Modal>

          {/* Delete Confirmation Modal */}
          <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Doctor">
            <div className="space-y-4">
              <p className="text-gray-700">
                Are you sure you want to delete <span className="font-semibold">{selectedDoctor?.full_name || selectedDoctor?.first_name + ' ' + selectedDoctor?.last_name}</span>?
              </p>
              <p className="text-sm text-red-600">This action cannot be undone!</p>
              <div className="flex gap-4">
                <Button variant="danger" onClick={handleDeleteConfirm}>
                  Delete
                </Button>
                <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </Modal>
        </main>
      </div>
    </div>
  );
};

export default Doctors;