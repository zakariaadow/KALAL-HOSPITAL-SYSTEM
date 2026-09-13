// src/pages/doctor/Diagnosis.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Table from '../../components/Table';
import toast from 'react-hot-toast';

const Diagnosis = () => {
  const { api } = useAuth();
  const [patients, setPatients] = useState([]);
  const [diagnoses, setDiagnoses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [formData, setFormData] = useState({
    patient_id: '',
    diagnosis: '',
    symptoms: '',
    treatment: '',
    notes: '',
    follow_up_date: '',
    is_emergency: false,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchPatients(),
        fetchDiagnoses()
      ]);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load data');
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
    }
  };

  const fetchDiagnoses = async () => {
    try {
      const response = await api.get('/medical-records/');
      setDiagnoses(response.data);
    } catch (error) {
      console.error('Failed to fetch diagnoses:', error);
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
      toast.error('Please enter diagnosis');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/medical-records/', formData);
      toast.success('Diagnosis added successfully!');
      setShowModal(false);
      fetchDiagnoses();
      setFormData({
        patient_id: '',
        diagnosis: '',
        symptoms: '',
        treatment: '',
        notes: '',
        follow_up_date: '',
        is_emergency: false,
      });
    } catch (error) {
      console.error('Failed to add diagnosis:', error);
      toast.error(error.response?.data?.error || 'Failed to add diagnosis');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewPatient = async (patientId) => {
    try {
      const response = await api.get(`/patients/${patientId}`);
      setSelectedPatient(response.data);
      // You can add a modal to show patient details
      toast.info(`Patient: ${response.data.full_name}`);
    } catch (error) {
      toast.error('Failed to load patient details');
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Patient', accessor: 'patient_name' },
    { header: 'Diagnosis', accessor: 'diagnosis' },
    { header: 'Treatment', accessor: 'treatment' },
    { 
      header: 'Date', 
      accessor: 'visit_date',
      render: (row) => row.visit_date ? new Date(row.visit_date).toLocaleDateString() : 'N/A'
    },
    {
      header: 'Emergency',
      render: (row) => row.is_emergency ? '🚨 Yes' : 'No'
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleViewPatient(row.patient_id)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View Patient
          </button>
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
              <h1 className="text-2xl font-bold text-gray-900">Diagnosis</h1>
              <p className="text-gray-600">Patient diagnosis management</p>
              <p className="text-sm text-gray-500">Total: {diagnoses.length} diagnoses</p>
            </div>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              + Add Diagnosis
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-md p-4">
              <p className="text-sm text-gray-500">Total Diagnoses</p>
              <p className="text-2xl font-bold text-gray-900">{diagnoses.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4">
              <p className="text-sm text-gray-500">Emergency Cases</p>
              <p className="text-2xl font-bold text-red-600">
                {diagnoses.filter(d => d.is_emergency).length}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4">
              <p className="text-sm text-gray-500">Total Patients</p>
              <p className="text-2xl font-bold text-blue-600">{patients.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4">
              <p className="text-sm text-gray-500">Follow-ups Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {diagnoses.filter(d => d.follow_up_date && new Date(d.follow_up_date) > new Date()).length}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <Table columns={columns} data={diagnoses} />
            {diagnoses.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <div className="text-4xl mb-2">🩺</div>
                <p>No diagnoses found</p>
                <p className="text-sm">Click "Add Diagnosis" to create one</p>
              </div>
            )}
          </div>

          {/* Add Diagnosis Modal */}
          <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Diagnosis">
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
                <label className="block text-sm font-medium text-gray-700">Treatment Plan</label>
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
                <label className="block text-sm font-medium text-gray-700">Follow-up Date</label>
                <input
                  type="date"
                  name="follow_up_date"
                  value={formData.follow_up_date}
                  onChange={handleChange}
                  className="input-field"
                  min={new Date().toISOString().split('T')[0]}
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
                  Save Diagnosis
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

export default Diagnosis;