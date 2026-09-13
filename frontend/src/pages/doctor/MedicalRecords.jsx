// src/pages/doctor/MedicalRecords.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';

const MedicalRecords = () => {
  const { api, user } = useAuth();
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: '',
    diagnosis: '',
    symptoms: '',
    treatment: '',
    notes: '',
    is_emergency: false,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRecords();
    fetchPatients();
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await api.get('/medical-records/');
      setRecords(response.data);
    } catch (error) {
      console.error('Failed to fetch records:', error);
      toast.error('Failed to load medical records');
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
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.patient_id) {
      toast.error('Please select a patient');
      return;
    }
    if (!formData.diagnosis) {
      toast.error('Please enter a diagnosis');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/medical-records/', formData);
      toast.success('Medical record added successfully!');
      setShowModal(false);
      fetchRecords();
      setFormData({
        patient_id: '',
        diagnosis: '',
        symptoms: '',
        treatment: '',
        notes: '',
        is_emergency: false,
      });
    } catch (error) {
      console.error('Failed to add record:', error);
      toast.error(error.response?.data?.error || 'Failed to add medical record');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Patient', accessor: 'patient_name' },
    { header: 'Doctor', accessor: 'doctor_name' },
    { 
      header: 'Date', 
      accessor: 'visit_date',
      render: (row) => row.visit_date ? new Date(row.visit_date).toLocaleString() : 'N/A'
    },
    { header: 'Diagnosis', accessor: 'diagnosis' },
    { header: 'Treatment', accessor: 'treatment' },
    {
      header: 'Emergency',
      render: (row) => row.is_emergency ? '🚨 Yes' : 'No'
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
              <h1 className="text-2xl font-bold text-gray-900">Medical Records</h1>
              <p className="text-gray-600">Manage patient medical records</p>
              <p className="text-sm text-gray-500">Total: {records.length} records</p>
            </div>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              Add Medical Record
            </Button>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <Table columns={columns} data={records} />
            {records.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <div className="text-4xl mb-2">📋</div>
                <p>No medical records found</p>
                <p className="text-sm">Click "Add Medical Record" to create one</p>
              </div>
            )}
          </div>

          {/* Add Medical Record Modal */}
          <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Medical Record">
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
                <label className="block text-sm font-medium text-gray-700">Diagnosis *</label>
                <input
                  type="text"
                  name="diagnosis"
                  required
                  value={formData.diagnosis}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter diagnosis"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Symptoms</label>
                <textarea
                  name="symptoms"
                  value={formData.symptoms}
                  onChange={handleChange}
                  rows="2"
                  className="input-field"
                  placeholder="Enter symptoms"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Treatment</label>
                <textarea
                  name="treatment"
                  value={formData.treatment}
                  onChange={handleChange}
                  rows="2"
                  className="input-field"
                  placeholder="Enter treatment plan"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="2"
                  className="input-field"
                  placeholder="Additional notes"
                />
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_emergency"
                    checked={formData.is_emergency}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Emergency Case</span>
                </label>
              </div>
              <div className="flex gap-4">
                <Button type="submit" variant="primary" loading={submitting}>
                  Save Record
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

export default MedicalRecords;