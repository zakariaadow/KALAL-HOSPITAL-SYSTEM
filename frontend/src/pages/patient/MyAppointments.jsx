// src/pages/patient/MyAppointments.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Table from '../../components/Table';
import Button from '../../components/Button';
import toast from 'react-hot-toast';

const MyAppointments = () => {
  const { api, user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching appointments...');
      console.log('👤 Current user:', user);
      console.log('👤 Patient profile:', user?.patient);
      
      // ✅ Get ALL appointments (backend filters by patient_id automatically)
      const response = await api.get('/appointments/');
      
      console.log('✅ Appointments received:', response.data);
      console.log(`   Count: ${response.data.length}`);
      
      setAppointments(response.data);
    } catch (error) {
      console.error('❌ Failed to fetch appointments:', error);
      setError(error.response?.data?.error || 'Failed to load appointments');
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    
    try {
      await api.delete(`/appointments/${appointmentId}`);
      toast.success('Appointment cancelled successfully');
      fetchAppointments();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to cancel appointment');
    }
  };

  // ✅ Stats helper
  const stats = {
    total: appointments.length,
    scheduled: appointments.filter(a => a.status === 'scheduled' || a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { 
      header: 'Doctor', 
      accessor: 'doctor_name',
      render: (row) => row.doctor_name || 'N/A'
    },
    { 
      header: 'Date & Time', 
      accessor: 'appointment_date',
      render: (row) => row.appointment_date 
        ? new Date(row.appointment_date).toLocaleString('en-GB', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
          })
        : 'N/A'
    },
    { header: 'Type', accessor: 'type' },
    { 
      header: 'Reason', 
      accessor: 'reason',
      render: (row) => row.reason || '—'
    },
    {
      header: 'Status',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
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
          {(row.status === 'scheduled' || row.status === 'confirmed') ? (
            <button
              onClick={() => handleCancel(row.id)}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Cancel
            </button>
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
              <p className="font-medium">Error loading appointments</p>
              <p>{error}</p>
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
              <p className="text-gray-600">View and manage all your appointments</p>
              <p className="text-sm text-gray-500">Total: {stats.total} appointments</p>
            </div>
            <Link to="/patient/book-appointment">
              <Button variant="primary">+ Book Appointment</Button>
            </Link>
          </div>

          {/* ✅ Stats cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-md p-4">
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4">
              <p className="text-sm text-gray-500">Upcoming</p>
              <p className="text-2xl font-bold text-green-600">{stats.scheduled}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4">
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4">
              <p className="text-sm text-gray-500">Cancelled</p>
              <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <Table columns={columns} data={appointments} />
            {appointments.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <div className="text-4xl mb-2">📅</div>
                <p className="font-medium">No appointments yet</p>
                <p className="text-sm mt-2">
                  Click <strong>"+ Book Appointment"</strong> to schedule your first appointment
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MyAppointments;