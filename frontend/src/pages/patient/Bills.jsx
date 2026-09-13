// src/pages/patient/Bills.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';

const Bills = () => {
  const { api } = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    payment_method: 'cash',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/billing/');
      setBills(response.data);
    } catch (error) {
      console.error('Failed to fetch bills:', error);
      setError('Failed to load bills');
      toast.error('Failed to load bills');
    } finally {
      setLoading(false);
    }
  };

  const handlePayClick = (bill) => {
    setSelectedBill(bill);
    const remaining = bill.total_amount - bill.paid_amount;
    setPaymentData({
      amount: remaining.toFixed(2),
      payment_method: 'cash',
    });
    setShowPayModal(true);
  };

  const handlePaymentChange = (e) => {
    setPaymentData({ ...paymentData, [e.target.name]: e.target.value });
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    const amount = parseFloat(paymentData.amount);
    const maxAmount = selectedBill.total_amount - selectedBill.paid_amount;
    
    // Validate amount
    if (!paymentData.amount || isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }
    
    if (amount > maxAmount) {
      toast.error(`Amount cannot exceed $${maxAmount.toFixed(2)}`);
      return;
    }

    setSubmitting(true);
    try {
      console.log('Sending payment:', {
        bill_id: selectedBill.id,
        amount: amount,
        payment_method: paymentData.payment_method
      });
      
      const response = await api.post(`/billing/${selectedBill.id}/pay`, {
        amount: amount,
        payment_method: paymentData.payment_method,
      });
      
      console.log('Payment response:', response.data);
      toast.success('Payment processed successfully!');
      setShowPayModal(false);
      fetchBills();
    } catch (error) {
      console.error('Payment failed:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.error || 'Payment failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { 
      header: 'Bill #', 
      accessor: 'bill_number',
      render: (row) => row.bill_number || `BILL-${row.id}`
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
      header: 'Date', 
      accessor: 'issue_date',
      render: (row) => row.issue_date ? new Date(row.issue_date).toLocaleDateString() : 'N/A'
    },
    {
      header: 'Status',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          row.status === 'paid' ? 'bg-green-100 text-green-700' :
          row.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
          row.status === 'partially_paid' ? 'bg-blue-100 text-blue-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {row.status?.replace('_', ' ')}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (row) => {
        const balance = row.total_amount - row.paid_amount;
        if (balance > 0 && row.status !== 'paid') {
          return (
            <Button
              variant="success"
              size="sm"
              onClick={() => handlePayClick(row)}
            >
              Pay ${balance.toFixed(2)}
            </Button>
          );
        }
        return (
          <span className="text-green-600 text-sm font-medium">✅ Paid</span>
        );
      },
    },
  ];

  // Calculate statistics
  const totalBills = bills.length;
  const totalAmount = bills.reduce((sum, bill) => sum + (bill.total_amount || 0), 0);
  const totalPaid = bills.reduce((sum, bill) => sum + (bill.paid_amount || 0), 0);
  const totalBalance = bills.reduce((sum, bill) => sum + (bill.balance || 0), 0);
  const pendingBills = bills.filter(b => b.status === 'pending' || b.status === 'partially_paid').length;

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
                onClick={fetchBills}
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
              <h1 className="text-2xl font-bold text-gray-900">My Bills</h1>
              <p className="text-gray-600">View your billing history</p>
              <p className="text-sm text-gray-500">Total: {totalBills} bills</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <div className="bg-white rounded-lg shadow-md px-4 py-2 text-center">
                <p className="text-xs text-gray-500">Total Amount</p>
                <p className="text-lg font-bold text-gray-900">${totalAmount.toFixed(2)}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md px-4 py-2 text-center">
                <p className="text-xs text-gray-500">Total Paid</p>
                <p className="text-lg font-bold text-green-600">${totalPaid.toFixed(2)}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md px-4 py-2 text-center">
                <p className="text-xs text-gray-500">Balance Due</p>
                <p className="text-lg font-bold text-red-600">${totalBalance.toFixed(2)}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md px-4 py-2 text-center">
                <p className="text-xs text-gray-500">Pending Bills</p>
                <p className="text-lg font-bold text-yellow-600">{pendingBills}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <Table columns={columns} data={bills} />
            {bills.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <div className="text-4xl mb-2">💰</div>
                <p>No bills found</p>
                <p className="text-sm">You have no bills to pay</p>
              </div>
            )}
          </div>

          {/* Pay Modal */}
          <Modal isOpen={showPayModal} onClose={() => setShowPayModal(false)} title="Make Payment">
            {selectedBill && (
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bill #:</span>
                    <span className="font-semibold">{selectedBill.bill_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-semibold">${selectedBill.total_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Already Paid:</span>
                    <span className="font-semibold text-green-600">${selectedBill.paid_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-600 font-medium">Remaining Balance:</span>
                    <span className="font-bold text-red-600">${(selectedBill.total_amount - selectedBill.paid_amount).toFixed(2)}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Amount *</label>
                  <input
                    type="number"
                    name="amount"
                    required
                    step="0.01"
                    min="0.01"
                    max={selectedBill.total_amount - selectedBill.paid_amount}
                    value={paymentData.amount}
                    onChange={handlePaymentChange}
                    className="input-field"
                    placeholder="Enter amount"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Max: ${(selectedBill.total_amount - selectedBill.paid_amount).toFixed(2)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                  <select
                    name="payment_method"
                    value={paymentData.payment_method}
                    onChange={handlePaymentChange}
                    className="input-field"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Credit/Debit Card</option>
                    <option value="mobile">Mobile Money</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="insurance">Insurance</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>

                <div className="flex gap-4">
                  <Button 
                    type="submit" 
                    variant="success" 
                    loading={submitting}
                    disabled={submitting || !paymentData.amount || parseFloat(paymentData.amount) <= 0}
                    className="flex-1"
                  >
                    {submitting ? 'Processing...' : 'Pay Now'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={() => setShowPayModal(false)}
                  >
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

export default Bills;