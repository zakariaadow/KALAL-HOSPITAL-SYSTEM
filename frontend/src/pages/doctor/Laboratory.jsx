// src/pages/doctor/Laboratory.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';

const Laboratory = () => {
  const { api } = useAuth();
  const [tests, setTests] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [formData, setFormData] = useState({
    patient_id: '',
    test_name: '',
    test_type: '',
    notes: '',
  });
  const [resultsData, setResultsData] = useState({
    results: '',
    normal_range: '',
    performed_by: '',
    status: 'completed',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTests();
    fetchPatients();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await api.get('/laboratory/');
      setTests(response.data);
    } catch (error) {
      console.error('Failed to fetch tests:', error);
      toast.error('Failed to load lab tests');
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

  const handleResultsChange = (e) => {
    setResultsData({ ...resultsData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.patient_id) {
      toast.error('Please select a patient');
      return;
    }
    if (!formData.test_name) {
      toast.error('Please enter test name');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/laboratory/', formData);
      toast.success('Lab test ordered successfully!');
      setShowModal(false);
      fetchTests();
      setFormData({
        patient_id: '',
        test_name: '',
        test_type: '',
        notes: '',
      });
    } catch (error) {
      console.error('Failed to order test:', error);
      toast.error(error.response?.data?.error || 'Failed to order test');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddResults = (test) => {
    setSelectedTest(test);
    setResultsData({
      results: test.results || '',
      normal_range: test.normal_range || '',
      performed_by: test.performed_by || '',
      status: 'completed',
    });
    setShowResultsModal(true);
  };

  const handleResultsSubmit = async (e) => {
    e.preventDefault();
    
    setSubmitting(true);
    try {
      await api.put(`/laboratory/${selectedTest.id}`, {
        ...resultsData,
        result_date: new Date().toISOString(),
      });
      toast.success('Results added successfully!');
      setShowResultsModal(false);
      fetchTests();
    } catch (error) {
      console.error('Failed to add results:', error);
      toast.error(error.response?.data?.error || 'Failed to add results');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (testId, status) => {
    try {
      await api.put(`/laboratory/${testId}`, { status });
      toast.success(`Test ${status}`);
      fetchTests();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update status');
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Patient', accessor: 'patient_name' },
    { header: 'Test Name', accessor: 'test_name' },
    { header: 'Type', accessor: 'test_type' },
    { 
      header: 'Requested', 
      accessor: 'request_date',
      render: (row) => row.request_date ? new Date(row.request_date).toLocaleString() : 'N/A'
    },
    { 
      header: 'Results', 
      accessor: 'results',
      render: (row) => row.results ? '✅ Available' : '⏳ Pending'
    },
    {
      header: 'Status',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          row.status === 'completed' ? 'bg-green-100 text-green-700' :
          row.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
          row.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
          row.status === 'cancelled' ? 'bg-red-100 text-red-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {row.status?.replace('-', ' ')}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          {row.status === 'pending' && (
            <>
              <button
                onClick={() => handleUpdateStatus(row.id, 'in-progress')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Start
              </button>
              <button
                onClick={() => handleAddResults(row)}
                className="text-green-600 hover:text-green-800 text-sm font-medium"
              >
                Add Results
              </button>
            </>
          )}
          {row.status === 'in-progress' && (
            <button
              onClick={() => handleAddResults(row)}
              className="text-green-600 hover:text-green-800 text-sm font-medium"
            >
              Add Results
            </button>
          )}
          {row.status === 'completed' && (
            <button
              onClick={() => handleAddResults(row)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View Results
            </button>
          )}
          {row.status !== 'cancelled' && row.status !== 'completed' && (
            <button
              onClick={() => handleUpdateStatus(row.id, 'cancelled')}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Cancel
            </button>
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
              <h1 className="text-2xl font-bold text-gray-900">Laboratory</h1>
              <p className="text-gray-600">Manage lab tests and results</p>
              <p className="text-sm text-gray-500">Total: {tests.length} tests</p>
            </div>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              Order Test
            </Button>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <Table columns={columns} data={tests} />
            {tests.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <div className="text-4xl mb-2">🔬</div>
                <p>No lab tests found</p>
                <p className="text-sm">Click "Order Test" to request one</p>
              </div>
            )}
          </div>

          {/* Order Test Modal */}
          <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Order Lab Test">
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
                <label className="block text-sm font-medium text-gray-700">Test Name *</label>
                <input
                  type="text"
                  name="test_name"
                  required
                  value={formData.test_name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., Blood Test, X-Ray, MRI"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Test Type</label>
                <input
                  type="text"
                  name="test_type"
                  value={formData.test_type}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., Radiology, Pathology, Cardiology"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  className="input-field"
                  placeholder="Additional instructions or notes for the lab..."
                />
              </div>
              <div className="flex gap-4">
                <Button type="submit" variant="primary" loading={submitting}>
                  Order Test
                </Button>
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Modal>

          {/* Add/View Results Modal */}
          <Modal isOpen={showResultsModal} onClose={() => setShowResultsModal(false)} title="Test Results">
            {selectedTest && (
              <form onSubmit={handleResultsSubmit} className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Patient:</span>
                    <span className="font-semibold">{selectedTest.patient_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Test:</span>
                    <span className="font-semibold">{selectedTest.test_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-semibold">{selectedTest.test_type || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      selectedTest.status === 'completed' ? 'bg-green-100 text-green-700' :
                      selectedTest.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {selectedTest.status}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Results</label>
                  <textarea
                    name="results"
                    value={resultsData.results}
                    onChange={handleResultsChange}
                    rows="4"
                    className="input-field"
                    placeholder="Enter test results..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Normal Range</label>
                  <input
                    type="text"
                    name="normal_range"
                    value={resultsData.normal_range}
                    onChange={handleResultsChange}
                    className="input-field"
                    placeholder="e.g., 4.5-5.5 million cells/mcL"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Performed By</label>
                  <input
                    type="text"
                    name="performed_by"
                    value={resultsData.performed_by}
                    onChange={handleResultsChange}
                    className="input-field"
                    placeholder="Name of person performing the test"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    name="status"
                    value={resultsData.status}
                    onChange={handleResultsChange}
                    className="input-field"
                  >
                    <option value="completed">Completed</option>
                    <option value="in-progress">In Progress</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div className="flex gap-4">
                  <Button type="submit" variant="primary" loading={submitting}>
                    Save Results
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => setShowResultsModal(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </Modal>
        </main>
      </div>
    </div>
  );
};

export default Laboratory;