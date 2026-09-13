import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Table from '../../components/Table';
import toast from 'react-hot-toast';

const MedicalHistory = () => {
  const { api, user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user has patient profile
    if (user && user.role === 'patient' && !user.patient) {
      setError('Patient profile not found. Please contact support.');
      setLoading(false);
      return;
    }
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching medical records...');
      console.log('User:', user);
      console.log('Patient ID:', user?.patient?.id);
      
      const response = await api.get('/medical-records/');
      console.log('Medical records response:', response.data);
      setRecords(response.data);
    } catch (error) {
      console.error('Failed to fetch records:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 401) {
        setError('Session expired. Please login again.');
        toast.error('Session expired. Please login again.');
      } else if (error.response?.status === 404) {
        setError('Medical records endpoint not found.');
      } else {
        setError('Failed to load medical records. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: 'Date', accessor: 'visit_date' },
    { header: 'Doctor', accessor: 'doctor_name' },
    { header: 'Diagnosis', accessor: 'diagnosis' },
    { header: 'Treatment', accessor: 'treatment' },
    {
      header: 'Emergency',
      render: (row) => row.is_emergency ? '🚨 Yes' : 'No'
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
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <p className="font-medium">Error loading medical records</p>
              <p>{error}</p>
              <button 
                onClick={fetchRecords}
                className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
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
            <h1 className="text-2xl font-bold text-gray-900">Medical History</h1>
            <p className="text-gray-600">View your complete medical history</p>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <Table columns={columns} data={records} />
            {records.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                No medical records found
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MedicalHistory;