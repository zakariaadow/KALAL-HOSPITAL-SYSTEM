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
  const { api, user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async (search = '') => {
    try {
      setLoading(true);
      setError(null);
      // ✅ Use trailing slash to avoid 308 redirect
      const url = search ? `/patients/?search=${encodeURIComponent(search)}` : '/patients/';
      const response = await api.get(url);
      setPatients(response.data);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
      setError('Failed to load patients');
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPatients(searchTerm);
  };

  const clearSearch = () => {
    setSearchTerm('');
    fetchPatients();
  };

  const resetForm = () => {
    setFormData({
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
  };

  const handleAdd = () => {
    resetForm();
    setShowAddModal(true);
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

  // ✅ Create patient - uses trailing slash
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.first_name || !formData.first_name.trim()) {
      toast.error('First name is required');
      return;
    }
    if (!formData.last_name || !formData.last_name.trim()) {
      toast.error('Last name is required');
      return;
    }
    if (!formData.date_of_birth) {
      toast.error('Date of birth is required');
      return;
    }
    if (!formData.gender) {
      toast.error('Gender is required');
      return;
    }

    setSubmitting(true);
    try {
      const patientData = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        phone: formData.phone || null,
        address: formData.address || null,
        emergency_contact: formData.emergency_contact || null,
        emergency_phone: formData.emergency_phone || null,
        blood_type: formData.blood_type || null,
        allergies: formData.allergies || null,
        medical_history: formData.medical_history || null,
      };

      console.log('📤 Creating patient:', patientData);
      // ✅ TRAILING SLASH - prevents 308 redirect
      const response = await api.post('/patients/', patientData);
      console.log('✅ Patient created:', response.data);
      
      toast.success('Patient added successfully!');
      setShowAddModal(false);
      resetForm();
      fetchPatients();
    } catch (error) {
      console.error('❌ Add patient error:', error);
      toast.error(error.response?.data?.error || 'Failed to add patient');
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Update patient
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const patientData = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        phone: formData.phone || null,
        address: formData.address || null,
        emergency_contact: formData.emergency_contact || null,
        emergency_phone: formData.emergency_phone || null,
        blood_type: formData.blood_type || null,
        allergies: formData.allergies || null,
        medical_history: formData.medical_history || null,
      };
      
      await api.put(`/patients/${selectedPatient.id}`, patientData);
      toast.success('Patient updated successfully!');
      setShowEditModal(false);
      resetForm();
      fetchPatients();
    } catch (error) {
      console.error('❌ Update error:', error);
      toast.error(error.response?.data?.error || 'Failed to update patient');
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Delete patient
  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/patients/${selectedPatient.id}`);
      toast.success('Patient deleted successfully!');
      setShowDeleteModal(false);
      fetchPatients();
    } catch (error) {
      console.error('❌ Delete error:', error);
      toast.error(error.response?.data?.error || 'Failed to delete patient');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { 
      header: 'Full Name', 
      accessor: 'full_name',
      render: (row) => row.full_name || `${row.first_name} ${row.last_name}`
    },
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
          {isAdmin && (
            <button 
              onClick={() => handleDelete(row)} 
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Delete
            </button>
          )}
          <Link 
            to={`/admin/patients/${row.id}`} 
            className="text-green-600 hover:text-green-800 text-sm font-medium"
          >
            View
          </Link>
        </div>
      ),
    },
  ];

  const PatientForm = ({ onSubmit, submitLabel }) => (
    <form onSubmit={onSubmit} className="space-y-4">
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
          <label className="block text-sm font-medium text-gray-700">Date of Birth *</label>
          <input
            type="date"
            name="date_of_birth"
            required
            value={formData.date_of_birth}
            onChange={handleChange}
            className="input-field"
            max={new Date().toISOString().split('T')[0]}
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
            placeholder="+254..."
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
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
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
            placeholder="Enter address"
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
            placeholder="Emergency contact name"
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
            placeholder="Emergency phone number"
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
            placeholder="List any known allergies"
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
            placeholder="Previous medical conditions"
          />
        </div>
      </div>
      <div className="flex gap-4">
        <Button type="submit" variant="primary" loading={submitting}>
          {submitLabel}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            setShowAddModal(false);
            setShowEditModal(false);
            resetForm();
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex bg-gray-50">
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
            {isAdmin && (
              <Button variant="primary" onClick={handleAdd}>
                + Add Patient
              </Button>
            )}
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-xl shadow-md p-4 mb-6">
            <form onSubmit={handleSearch} className="flex gap-3">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or phone..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Button type="submit" variant="primary">Search</Button>
              {searchTerm && (
                <Button type="button" variant="secondary" onClick={clearSearch}>
                  Clear
                </Button>
              )}
            </form>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6">
              <p>{error}</p>
              <button 
                onClick={() => fetchPatients()} 
                className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
              >
                Retry
              </button>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <Table columns={columns} data={patients} />
            {patients.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <div className="text-4xl mb-2">👤</div>
                <p>No patients found</p>
                {isAdmin && (
                  <p className="text-sm mt-2">Click "Add Patient" to create one</p>
                )}
              </div>
            )}
          </div>

          <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Patient">
            <PatientForm onSubmit={handleAddSubmit} submitLabel="Add Patient" />
          </Modal>

          <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Patient">
            <PatientForm onSubmit={handleEditSubmit} submitLabel="Update Patient" />
          </Modal>

          <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Patient">
            <div className="space-y-4">
              <p className="text-gray-700">
                Are you sure you want to delete <strong>{selectedPatient?.full_name}</strong>?
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