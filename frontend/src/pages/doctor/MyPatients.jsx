// src/pages/doctor/MyPatients.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Table from '../../components/Table';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const MyPatients = () => {
  const { api } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await api.get('/patients/');
      setPatients(response.data);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Full Name', accessor: 'full_name' },
    { header: 'Gender', accessor: 'gender' },
    { header: 'Phone', accessor: 'phone' },
    { header: 'Blood Type', accessor: 'blood_type' },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <Link to={`/doctor/medical-records?patient=${row.id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Records
          </Link>
          <Link to={`/doctor/prescriptions?patient=${row.id}`} className="text-green-600 hover:text-green-800 text-sm font-medium">
            Prescribe
          </Link>
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
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">My Patients</h1>
            <p className="text-gray-600">Manage your patient records</p>
            <p className="text-sm text-gray-500">Total: {patients.length} patients</p>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <Table columns={columns} data={patients} />
            {patients.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <div className="text-4xl mb-2">👤</div>
                <p>No patients found</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MyPatients;