import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';

const Dashboard = () => {
  const { user, api } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value || 0}</p>
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <span className={`text-${color}-600 text-2xl`}>{icon}</span>
        </div>
      </div>
    </div>
  );

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
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
            <p className="text-gray-600">Welcome back, Dr. {user?.username}!</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard title="My Patients" value={stats?.total_patients || 0} icon="👤" color="blue" />
            <StatCard title="Today's Appointments" value={stats?.today_appointments || 0} icon="📅" color="purple" />
            <StatCard title="Pending Appointments" value={stats?.pending_appointments || 0} icon="⏳" color="yellow" />
            <StatCard title="Total Revenue" value={`$${stats?.total_revenue?.toFixed(2) || '0.00'}`} icon="💰" color="green" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Today's Schedule">
              <div className="space-y-3">
                {stats?.recent_appointments?.map((appointment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{appointment.patient_name}</p>
                      <p className="text-sm text-gray-500">{appointment.reason || 'General checkup'}</p>
                    </div>
                    <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                      {new Date(appointment.appointment_date).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
                {(!stats?.recent_appointments || stats.recent_appointments.length === 0) && (
                  <p className="text-gray-500 text-center py-4">No appointments today</p>
                )}
              </div>
            </Card>

            <Card title="Quick Actions">
              <div className="grid grid-cols-2 gap-4">
                <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition duration-200">
                  <div className="text-2xl mb-1">📋</div>
                  <span className="text-sm font-medium text-gray-700">Add Medical Record</span>
                </button>
                <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-center transition duration-200">
                  <div className="text-2xl mb-1">💊</div>
                  <span className="text-sm font-medium text-gray-700">Write Prescription</span>
                </button>
                <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition duration-200">
                  <div className="text-2xl mb-1">🔬</div>
                  <span className="text-sm font-medium text-gray-700">Order Lab Test</span>
                </button>
                <button className="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg text-center transition duration-200">
                  <div className="text-2xl mb-1">📅</div>
                  <span className="text-sm font-medium text-gray-700">Schedule Follow-up</span>
                </button>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;