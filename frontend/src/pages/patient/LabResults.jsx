import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Table from '../../components/Table';
import toast from 'react-hot-toast';

const LabResults = () => {
  const { api } = useAuth();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/laboratory/');
      setTests(response.data);
    } catch (error) {
      console.error('Failed to fetch tests:', error);
      setError('Failed to load lab results');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: 'Test Name', accessor: 'test_name' },
    { header: 'Type', accessor: 'test_type' },
    { header: 'Date', accessor: 'request_date' },
    { header: 'Results', accessor: 'results' },
    {
      header: 'Status',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          row.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
          row.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
          row.status === 'completed' ? 'bg-green-100 text-green-700' :
          'bg-gray-100 text-gray-700'
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
                onClick={fetchTests}
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
            <h1 className="text-2xl font-bold text-gray-900">Lab Results</h1>
            <p className="text-gray-600">View your laboratory test results</p>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <Table columns={columns} data={tests} />
            {tests.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                No lab results found
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default LabResults;