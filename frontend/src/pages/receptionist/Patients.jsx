import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';

const Patients = () => {
  const { api } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
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

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Fetching patients...');
      const response = await api.get('/patients/');
      console.log('✅ Patients data:', response.data);
      setPatients(response.data);
    } catch (error) {
      console.error('❌ Failed to fetch patients:', error);
      console.error('Error response:', error.response?.data);
      setError(error.response?.data?.error || 'Failed to load patients');
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (patient) => {
    setSelectedPatient(patient);
    setFormData({
      first_name: patient.first_name || '',
      last_name: patient.last_name || '',
      date_of_birth: patient.date_of_birth || '',
      gender: patient.gender || '',
      phone: patient.phone || '',
      address: patient.address || '',
      emergency_contact: patient.emergency_contact || '',
      emergency_phone: patient.emergency_phone || '',
      blood_type: patient.blood_type || '',
      allergies: patient.allergies || '',
      medical_history: patient.medical_history || '',
    });
    setShowEditModal(true);
  };

  const handleDelete = (patient) => {
    setSelectedPatient(patient);
    setShowDeleteModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/patients/${selectedPatient.id}`, formData);
      toast.success('Patient updated successfully!');
      setShowEditModal(false);
      fetchPatients();
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.error || 'Failed to update patient');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/patients/${selectedPatient.id}`);
      toast.success('Patient deleted successfully!');
      setShowDeleteModal(false);
      fetchPatients();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.error || 'Failed to delete patient');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Full Name', accessor: 'full_name' },
    { header: 'Gender', accessor: 'gender' },
    { header: 'Phone', accessor: 'phone' },
    { header: 'Blood Type', accessor: 'blood_type' },
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
          <Link to={`/receptionist/patients/${row.id}`} className="text-green-600 hover:text-green-800 text-sm font-medium">
            View
          </Link>
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
              <p className="font-medium">Error loading patients</p>
              <p>{error}</p>
              <button 
                onClick={fetchPatients}
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
              <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
              <p className="text-gray-600">Manage patient records</p>
              <p className="text-sm text-gray-500">Total: {patients.length} patients</p>
            </div>
            <Link to="/receptionist/patients/add">
              <Button variant="primary">Add Patient</Button>
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <Table columns={columns} data={patients} />
            {patients.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <div className="text-4xl mb-2">👤</div>
                <p>No patients found</p>
                <p className="text-sm">Click "Add Patient" to create one</p>
              </div>
            )}
          </div>

          {/* Edit Modal */}
          <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Patient">
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
              <div className="flex gap-4">
                <Button type="submit" variant="primary">Update Patient</Button>
                <Button type="button" variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
              </div>
            </form>
          </Modal>

          {/* Delete Confirmation Modal */}
          <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Patient">
            <div className="space-y-4">
              <p className="text-gray-700">
                Are you sure you want to delete <span className="font-semibold">{selectedPatient?.full_name}</span>?
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

export default Patients;