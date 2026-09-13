import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';

const Reports = () => {
  const { api } = useAuth();
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
      console.error('Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white rounded-xl shadow-md p-6">
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
              <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
              <p className="text-gray-600">System statistics and insights</p>
            </div>
            <button onClick={fetchStats} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
              🔄 Refresh
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard title="Total Patients" value={stats?.total_patients} icon="👤" color="blue" />
            <StatCard title="Total Doctors" value={stats?.total_doctors} icon="👨‍⚕️" color="green" />
            <StatCard title="Today's Appointments" value={stats?.today_appointments} icon="📅" color="purple" />
            <StatCard title="Total Revenue" value={`$${stats?.total_revenue?.toFixed(2) || '0.00'}`} icon="💰" color="yellow" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Patient Statistics">
              <div className="space-y-3">
                <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                  <span>Total Patients</span><span className="font-bold">{stats?.total_patients || 0}</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                  <span>Active Patients</span><span className="font-bold">{stats?.total_patients || 0}</span>
                </div>
              </div>
            </Card>

            <Card title="Appointment Statistics">
              <div className="space-y-3">
                <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                  <span>Today's Appointments</span><span className="font-bold">{stats?.today_appointments || 0}</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                  <span>Pending Appointments</span><span className="font-bold">{stats?.pending_appointments || 0}</span>
                </div>
              </div>
            </Card>

            <Card title="Revenue Statistics">
              <div className="space-y-3">
                <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                  <span>Total Revenue</span>
                  <span className="font-bold text-green-600">${stats?.total_revenue?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                  <span>Pending Payments</span>
                  <span className="font-bold text-yellow-600">${stats?.pending_payments?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </Card>

            <Card title="Department Statistics">
              <div className="space-y-3">
                <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                  <span>Total Departments</span><span className="font-bold">{stats?.total_departments || 0}</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                  <span>Active Departments</span><span className="font-bold">{stats?.total_departments || 0}</span>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Reports;