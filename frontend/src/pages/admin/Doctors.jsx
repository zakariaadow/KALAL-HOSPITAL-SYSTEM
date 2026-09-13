import React, { useState, useEffect } from 'react';
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
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [submitting, setSubmitting] = useState(false);
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

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchDoctors();
    fetchDepartments();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/doctors/');
      setDoctors(response.data);
    } catch (error) {
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments/');
      setDepartments(response.data);
    } catch (error) {
      console.error('Failed to fetch departments');
    }
  };

  const resetForm = () => {
    setFormData({
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
  };

  // ✅ Clean form data before sending to backend
  const prepareData = () => ({
    first_name: formData.first_name.trim(),
    last_name: formData.last_name.trim(),
    specialization: formData.specialization.trim(),
    license_number: formData.license_number?.trim() || undefined,
    department_id: formData.department_id || null,          // ✅ '' → null
    phone: formData.phone || null,
    email: formData.email || null,
    consultation_fee: formData.consultation_fee ? parseFloat(formData.consultation_fee) : 0,
    years_of_experience: formData.years_of_experience ? parseInt(formData.years_of_experience) : 0,
    qualifications: formData.qualifications || null,
    is_available: formData.is_available,
  });

  const handleAdd = () => {
    resetForm();
    setShowAddModal(true);
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

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = prepareData();
      console.log('📤 Creating doctor:', data);
      await api.post('/doctors/', data);
      toast.success('Doctor added successfully!');
      setShowAddModal(false);
      resetForm();
      fetchDoctors();
    } catch (error) {
      console.error('❌ Add doctor error:', error);
      toast.error(error.response?.data?.error || 'Failed to add doctor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = prepareData();
      await api.put(`/doctors/${selectedDoctor.id}`, data);
      toast.success('Doctor updated successfully!');
      setShowEditModal(false);
      resetForm();
      fetchDoctors();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update doctor');
    } finally {
      setSubmitting(false);
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
    { header: 'Full Name', accessor: 'full_name' },
    { header: 'Specialization', accessor: 'specialization' },
    { header: 'Phone', accessor: 'phone' },
    { header: 'Fee', render: (row) => `$${row.consultation_fee?.toFixed(2) || '0.00'}` },
    {
      header: 'Status',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs ${row.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {row.is_available ? 'Available' : 'Unavailable'}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button onClick={() => handleEdit(row)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
          {isAdmin && (
            <button onClick={() => handleDelete(row)} className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
          )}
        </div>
      ),
    },
  ];

  const DoctorForm = ({ onSubmit, submitLabel }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">First Name *</label>
          <input type="text" name="first_name" required value={formData.first_name} onChange={handleChange} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Last Name *</label>
          <input type="text" name="last_name" required value={formData.last_name} onChange={handleChange} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Specialization *</label>
          <input type="text" name="specialization" required value={formData.specialization} onChange={handleChange} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">License Number</label>
          <input type="text" name="license_number" value={formData.license_number} onChange={handleChange} className="input-field" placeholder="Optional" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Department</label>
          <select name="department_id" value={formData.department_id} onChange={handleChange} className="input-field">
            <option value="">Select Department</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Consultation Fee</label>
          <input type="number" name="consultation_fee" step="0.01" value={formData.consultation_fee} onChange={handleChange} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
          <input type="number" name="years_of_experience" value={formData.years_of_experience} onChange={handleChange} className="input-field" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Qualifications</label>
          <textarea name="qualifications" value={formData.qualifications} onChange={handleChange} rows="2" className="input-field" />
        </div>
        <div className="md:col-span-2">
          <label className="flex items-center">
            <input type="checkbox" name="is_available" checked={formData.is_available} onChange={handleChange} className="mr-2" />
            <span className="text-sm font-medium text-gray-700">Available</span>
          </label>
        </div>
      </div>
      <div className="flex gap-4">
        <Button type="submit" variant="primary" loading={submitting}>{submitLabel}</Button>
        <Button type="button" variant="secondary" onClick={() => { setShowAddModal(false); setShowEditModal(false); resetForm(); }}>Cancel</Button>
      </div>
    </form>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex bg-gray-50">
        <Sidebar />
        <div className="flex-1"><Navbar />
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
              <h1 className="text-2xl font-bold text-gray-900">Doctors</h1>
              <p className="text-gray-600">Manage doctor records</p>
              <p className="text-sm text-gray-500">Total: {doctors.length} doctors</p>
            </div>
            {isAdmin && (
              <Button variant="primary" onClick={handleAdd}>+ Add Doctor</Button>
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

          <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Doctor">
            <DoctorForm onSubmit={handleAddSubmit} submitLabel="Add Doctor" />
          </Modal>

          <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Doctor">
            <DoctorForm onSubmit={handleEditSubmit} submitLabel="Update Doctor" />
          </Modal>

          <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Doctor">
            <div className="space-y-4">
              <p>Are you sure you want to delete <strong>{selectedDoctor?.full_name}</strong>?</p>
              <div className="flex gap-4">
                <Button variant="danger" onClick={handleDeleteConfirm}>Delete</Button>
                <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
              </div>
            </div>
          </Modal>
        </main>
      </div>
    </div>
  );
};

export default Doctors;