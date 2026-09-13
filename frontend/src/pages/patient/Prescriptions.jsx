import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Table from '../../components/Table';
import toast from 'react-hot-toast';

const Prescriptions = () => {
  const { api } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/prescriptions/');
      setPrescriptions(response.data);
    } catch (error) {
      console.error('Failed to fetch prescriptions:', error);
      setError('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: 'Medication', accessor: 'medication' },
    { header: 'Dosage', accessor: 'dosage' },
    { header: 'Frequency', accessor: 'frequency' },
    { header: 'Duration', accessor: 'duration' },
    { header: 'Refills', accessor: 'refills' },
    {
      header: 'Status',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          row.status === 'active' ? 'bg-green-100 text-green-700' :
          row.status === 'completed' ? 'bg-blue-100 text-blue-700' :
          'bg-red-100 text-red-700'
        }`}>
          {row.status}
        </span>
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
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
              <p>{error}</p>
              <button 
                onClick={fetchPrescriptions}
                className="mt-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
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
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">My Prescriptions</h1>
            <p className="text-gray-600">View all your prescriptions</p>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <Table columns={columns} data={prescriptions} />
            {prescriptions.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                No prescriptions found
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Prescriptions;