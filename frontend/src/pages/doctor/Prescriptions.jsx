// src/pages/doctor/Prescriptions.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';

const Prescriptions = () => {
  const { api } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: '',
    medication: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
    quantity: '',
    refills: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPrescriptions();
    fetchPatients();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const response = await api.get('/prescriptions/');
      setPrescriptions(response.data);
    } catch (error) {
      console.error('Failed to fetch prescriptions:', error);
      toast.error('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await api.get('/patients/');
      setPatients(response.data);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
      toast.error('Failed to load patients');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.patient_id) {
      toast.error('Please select a patient');
      return;
    }
    if (!formData.medication) {
      toast.error('Please enter medication');
      return;
    }
    if (!formData.dosage) {
      toast.error('Please enter dosage');
      return;
    }
    if (!formData.frequency) {
      toast.error('Please enter frequency');
      return;
    }

    setSubmitting(true);
    try {
      const submitData = {
        ...formData,
        quantity: formData.quantity ? parseInt(formData.quantity) : 0,
        refills: formData.refills ? parseInt(formData.refills) : 0,
      };
      
      await api.post('/prescriptions/', submitData);
      toast.success('Prescription created successfully!');
      setShowModal(false);
      fetchPrescriptions();
      setFormData({
        patient_id: '',
        medication: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: '',
        quantity: '',
        refills: 0,
      });
    } catch (error) {
      console.error('Failed to create prescription:', error);
      toast.error(error.response?.data?.error || 'Failed to create prescription');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (prescriptionId, status) => {
    try {
      await api.put(`/prescriptions/${prescriptionId}`, { status });
      toast.success(`Prescription ${status}`);
      fetchPrescriptions();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update prescription');
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Patient', accessor: 'patient_name' },
    { header: 'Medication', accessor: 'medication' },
    { header: 'Dosage', accessor: 'dosage' },
    { header: 'Frequency', accessor: 'frequency' },
    { header: 'Quantity', accessor: 'quantity' },
    { header: 'Refills', accessor: 'refills' },
    {
      header: 'Status',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          row.status === 'active' ? 'bg-green-100 text-green-700' :
          row.status === 'completed' ? 'bg-blue-100 text-blue-700' :
          row.status === 'cancelled' ? 'bg-red-100 text-red-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {row.status}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          {row.status === 'active' && (
            <>
              <button
                onClick={() => handleUpdateStatus(row.id, 'completed')}
                className="text-green-600 hover:text-green-800 text-sm font-medium"
              >
                Complete
              </button>
              <button
                onClick={() => handleUpdateStatus(row.id, 'cancelled')}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Cancel
              </button>
            </>
          )}
          {row.status === 'completed' && (
            <span className="text-gray-400 text-sm">Completed</span>
          )}
          {row.status === 'cancelled' && (
            <span className="text-gray-400 text-sm">Cancelled</span>
          )}
        </div>
      ),
    },
  ];

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
              <h1 className="text-2xl font-bold text-gray-900">Prescriptions</h1>
              <p className="text-gray-600">Manage patient prescriptions</p>
              <p className="text-sm text-gray-500">Total: {prescriptions.length} prescriptions</p>
            </div>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              New Prescription
            </Button>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <Table columns={columns} data={prescriptions} />
            {prescriptions.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <div className="text-4xl mb-2">💊</div>
                <p>No prescriptions found</p>
                <p className="text-sm">Click "New Prescription" to create one</p>
              </div>
            )}
          </div>

          {/* Add Prescription Modal */}
          <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Prescription">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Patient *</label>
                <select
                  name="patient_id"
                  required
                  value={formData.patient_id}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select Patient</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.full_name} {patient.phone ? `(${patient.phone})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Medication *</label>
                <input
                  type="text"
                  name="medication"
                  required
                  value={formData.medication}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter medication name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Dosage *</label>
                <input
                  type="text"
                  name="dosage"
                  required
                  value={formData.dosage}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., 500mg, 1 tablet"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Frequency *</label>
                <input
                  type="text"
                  name="frequency"
                  required
                  value={formData.frequency}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., Twice daily, Every 6 hours"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Duration</label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., 7 days, 1 month"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Number of pills/units"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Refills</label>
                <input
                  type="number"
                  name="refills"
                  value={formData.refills}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Number of refills"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Instructions</label>
                <textarea
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleChange}
                  rows="3"
                  className="input-field"
                  placeholder="Special instructions for the patient..."
                />
              </div>
              <div className="flex gap-4">
                <Button type="submit" variant="primary" loading={submitting}>
                  Create Prescription
                </Button>
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Modal>
        </main>
      </div>
    </div>
  );
};

export default Prescriptions;