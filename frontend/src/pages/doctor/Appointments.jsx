// src/pages/doctor/Appointments.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Table from '../../components/Table';
import Button from '../../components/Button';
import toast from 'react-hot-toast';

const Appointments = () => {
  const { api } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    scheduled: 0,
    completed: 0,
    cancelled: 0,
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/appointments/');
      setAppointments(response.data);
      
      // Calculate stats
      const total = response.data.length;
      const scheduled = response.data.filter(a => a.status === 'scheduled' || a.status === 'confirmed').length;
      const completed = response.data.filter(a => a.status === 'completed').length;
      const cancelled = response.data.filter(a => a.status === 'cancelled').length;
      
      setStats({ total, scheduled, completed, cancelled });
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      setError('Failed to load appointments');
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appointmentId, status) => {
    try {
      await api.put(`/appointments/${appointmentId}`, { status });
      toast.success(`Appointment ${status}`);
      fetchAppointments();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update appointment');
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Patient', accessor: 'patient_name' },
    { 
      header: 'Date & Time', 
      accessor: 'appointment_date',
      render: (row) => row.appointment_date ? new Date(row.appointment_date).toLocaleString() : 'N/A'
    },
    { header: 'Type', accessor: 'type' },
    { header: 'Reason', accessor: 'reason' },
    {
      header: 'Status',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          row.status === 'scheduled' ? 'bg-green-100 text-green-700' :
          row.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
          row.status === 'completed' ? 'bg-gray-100 text-gray-700' :
          row.status === 'cancelled' ? 'bg-red-100 text-red-700' :
          'bg-yellow-100 text-yellow-700'
        }`}>
          {row.status}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          {row.status === 'scheduled' || row.status === 'confirmed' ? (
            <>
              <button
                onClick={() => handleStatusUpdate(row.id, 'confirmed')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Confirm
              </button>
              <button
                onClick={() => handleStatusUpdate(row.id, 'completed')}
                className="text-green-600 hover:text-green-800 text-sm font-medium"
              >
                Complete
              </button>
              <button
                onClick={() => handleStatusUpdate(row.id, 'cancelled')}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Cancel
              </button>
            </>
          ) : row.status === 'completed' ? (
            <span className="text-gray-400 text-sm">Completed</span>
          ) : row.status === 'cancelled' ? (
            <span className="text-gray-400 text-sm">Cancelled</span>
          ) : (
            <span className="text-gray-400 text-sm">No action</span>
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

  if (error) {
    return (
      <div className="min-h-screen flex bg-gray-50">
        <Sidebar />
        <div className="flex-1">
          <Navbar />
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
              <p className="font-medium">{error}</p>
              <button 
                onClick={fetchAppointments}
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
              <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
              <p className="text-gray-600">Manage your appointments</p>
              <p className="text-sm text-gray-500">Total: {stats.total} appointments</p>
            </div>
            <div className="flex gap-3">
              <div className="bg-white rounded-lg shadow-md px-4 py-2 text-center">
                <p className="text-xs text-gray-500">Scheduled</p>
                <p className="text-lg font-bold text-green-600">{stats.scheduled}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md px-4 py-2 text-center">
                <p className="text-xs text-gray-500">Completed</p>
                <p className="text-lg font-bold text-blue-600">{stats.completed}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md px-4 py-2 text-center">
                <p className="text-xs text-gray-500">Cancelled</p>
                <p className="text-lg font-bold text-red-600">{stats.cancelled}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <Table columns={columns} data={appointments} />
            {appointments.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <div className="text-4xl mb-2">📅</div>
                <p>No appointments found</p>
                <p className="text-sm">New appointments will appear here</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Appointments;