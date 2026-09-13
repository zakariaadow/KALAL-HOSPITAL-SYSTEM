import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';

const Billing = () => {
  const { api } = useAuth();
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: '',
    total_amount: '',
    description: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [billsRes, patientsRes] = await Promise.all([
        api.get('/billing/'),
        api.get('/patients/'),
      ]);
      setBills(billsRes.data);
      setPatients(patientsRes.data);
    } catch (error) {
      toast.error('Failed to load billing data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/billing/', {
        ...formData,
        total_amount: parseFloat(formData.total_amount),
      });
      toast.success('Bill created successfully!');
      setShowModal(false);
      fetchData();
      setFormData({ patient_id: '', total_amount: '', description: '' });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create bill');
    }
  };

  const handlePayBill = async (id) => {
    try {
      await api.post(`/billing/${id}/pay`, { amount: 0, payment_method: 'cash' });
      toast.success('Payment processed!');
      fetchData();
    } catch (error) {
      toast.error('Payment failed');
    }
  };

  const handleDeleteBill = async (id) => {
    if (!window.confirm('Delete this bill permanently?')) return;
    try {
      await api.delete(`/billing/${id}`);
      toast.success('Bill deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete bill');
    }
  };

  const columns = [
    { header: 'Bill #', accessor: 'bill_number' },
    { header: 'Patient', accessor: 'patient_name' },
    { header: 'Amount', render: (row) => `$${row.total_amount?.toFixed(2)}` },
    { header: 'Paid', render: (row) => `$${row.paid_amount?.toFixed(2)}` },
    { header: 'Balance', render: (row) => `$${row.balance?.toFixed(2)}` },
    {
      header: 'Status',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          row.status === 'paid' ? 'bg-green-100 text-green-700' :
          row.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
          row.status === 'partially_paid' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
        }`}>{row.status?.replace('_', ' ')}</span>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          {row.status !== 'paid' && (
            <button onClick={() => handlePayBill(row.id)} className="text-green-600 text-sm">Pay</button>
          )}
          <button onClick={() => handleDeleteBill(row.id)} className="text-red-600 text-sm">Delete</button>
        </div>
      ),
    },
  ];

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
              <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
              <p className="text-gray-600">Manage all bills and payments</p>
              <p className="text-sm text-gray-500">Total: {bills.length} bills</p>
            </div>
            <Button variant="primary" onClick={() => setShowModal(true)}>Create Bill</Button>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <Table columns={columns} data={bills} />
            {bills.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <div className="text-4xl mb-2">💰</div>
                <p>No bills found</p>
              </div>
            )}
          </div>

          <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Bill">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Patient *</label>
                <select name="patient_id" required value={formData.patient_id} onChange={handleChange} className="input-field">
                  <option value="">Select Patient</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Total Amount *</label>
                <input type="number" name="total_amount" step="0.01" required value={formData.total_amount} onChange={handleChange} className="input-field" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <input type="text" name="description" value={formData.description} onChange={handleChange} className="input-field" />
              </div>
              <div className="flex gap-4">
                <Button type="submit" variant="primary">Create Bill</Button>
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
              </div>
            </form>
          </Modal>
        </main>
      </div>
    </div>
  );
};

export default Billing;