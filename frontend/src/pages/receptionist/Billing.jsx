// src/pages/receptionist/Billing.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';

const Billing = () => {
  const { api, user } = useAuth();
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: '',
    total_amount: '',
    description: '',
    items: [],
  });
  const [submitting, setSubmitting] = useState(false);

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchBills();
    fetchPatients();
  }, []);

  const fetchBills = async () => {
    try {
      const response = await api.get('/billing/');
      setBills(response.data);
    } catch (error) {
      console.error('Failed to fetch bills:', error);
      toast.error('Failed to load bills');
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
    
    // Validate form
    if (!formData.patient_id) {
      toast.error('Please select a patient');
      return;
    }
    if (!formData.total_amount || parseFloat(formData.total_amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setSubmitting(true);
    try {
      const billData = {
        patient_id: parseInt(formData.patient_id),
        total_amount: parseFloat(formData.total_amount),
        description: formData.description || '',
        items: formData.items || [],
      };
      
      console.log('Creating bill with data:', billData);
      const response = await api.post('/billing/', billData);
      
      toast.success('Bill created successfully!');
      setShowModal(false);
      fetchBills();
      setFormData({
        patient_id: '',
        total_amount: '',
        description: '',
        items: [],
      });
    } catch (error) {
      console.error('Failed to create bill:', error);
      toast.error(error.response?.data?.error || 'Failed to create bill');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayBill = async (billId) => {
    try {
      const response = await api.post(`/billing/${billId}/pay`, { 
        amount: 0,
        payment_method: 'cash',
        payment_date: new Date().toISOString()
      });
      toast.success('Payment processed successfully!');
      fetchBills();
    } catch (error) {
      console.error('Payment failed:', error);
      toast.error(error.response?.data?.error || 'Payment failed');
    }
  };

  const columns = [
    { 
      header: 'Bill #', 
      accessor: 'bill_number',
      render: (row) => row.bill_number || `BILL-${row.id}`
    },
    { 
      header: 'Patient', 
      accessor: 'patient_name',
      render: (row) => row.patient_name || 'N/A'
    },
    {
      header: 'Amount',
      render: (row) => `$${row.total_amount?.toFixed(2) || '0.00'}`
    },
    {
      header: 'Paid',
      render: (row) => `$${row.paid_amount?.toFixed(2) || '0.00'}`
    },
    {
      header: 'Balance',
      render: (row) => `$${row.balance?.toFixed(2) || '0.00'}`
    },
    {
      header: 'Status',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          row.status === 'paid' ? 'bg-green-100 text-green-700' :
          row.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
          row.status === 'partially_paid' ? 'bg-blue-100 text-blue-700' :
          'bg-red-100 text-red-700'
        }`}>
          {row.status?.replace('_', ' ')}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          {row.status !== 'paid' && (
            <Button
              variant="success"
              size="sm"
              onClick={() => handlePayBill(row.id)}
            >
              Pay
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              // View bill details (you can add a view modal)
              toast.info(`Bill #${row.bill_number}: $${row.total_amount?.toFixed(2)}`);
            }}
          >
            View
          </Button>
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

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <main className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
              <p className="text-gray-600">Manage billing and payments</p>
              <p className="text-sm text-gray-500">Total: {bills.length} bills</p>
            </div>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              Create Bill
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-md p-4">
              <p className="text-sm text-gray-500">Total Bills</p>
              <p className="text-2xl font-bold text-gray-900">{bills.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4">
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                ${bills.reduce((sum, bill) => sum + (bill.total_amount || 0), 0).toFixed(2)}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4">
              <p className="text-sm text-gray-500">Pending Bills</p>
              <p className="text-2xl font-bold text-yellow-600">
                {bills.filter(b => b.status === 'pending').length}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4">
              <p className="text-sm text-gray-500">Paid Bills</p>
              <p className="text-2xl font-bold text-green-600">
                {bills.filter(b => b.status === 'paid').length}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <Table columns={columns} data={bills} />
            {bills.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <div className="text-4xl mb-2">💰</div>
                <p>No bills found</p>
                <p className="text-sm">Click "Create Bill" to create one</p>
              </div>
            )}
          </div>

          {/* Create Bill Modal */}
          <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Bill">
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
                <label className="block text-sm font-medium text-gray-700">Total Amount *</label>
                <input
                  type="number"
                  name="total_amount"
                  required
                  step="0.01"
                  min="0"
                  value={formData.total_amount}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Bill description (e.g., Consultation fee, Lab tests, etc.)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Items (Optional)</label>
                <textarea
                  name="items"
                  value={formData.items}
                  onChange={handleChange}
                  rows="3"
                  className="input-field"
                  placeholder="Enter bill items (one per line)"
                />
              </div>
              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  variant="primary" 
                  loading={submitting}
                  disabled={submitting}
                >
                  {submitting ? 'Creating...' : 'Create Bill'}
                </Button>
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setShowModal(false)}
                >
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

export default Billing;