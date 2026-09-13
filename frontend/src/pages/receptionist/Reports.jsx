import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';
import Button from '../../components/Button';

const Reports = () => {
  const { api } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

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
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
              <p className="text-gray-600">View hospital statistics and reports</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm">
                <span className="mr-1">📊</span> Export PDF
              </Button>
              <Button variant="secondary" size="sm">
                <span className="mr-1">📋</span> Export CSV
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard title="Total Patients" value={stats?.total_patients} icon="👤" color="blue" />
            <StatCard title="Total Doctors" value={stats?.total_doctors} icon="👨‍⚕️" color="green" />
            <StatCard title="Total Appointments" value={stats?.today_appointments + stats?.pending_appointments} icon="📅" color="purple" />
            <StatCard title="Revenue" value={`$${stats?.total_revenue?.toFixed(2) || '0.00'}`} icon="💰" color="yellow" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Patient Statistics">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Total Patients</span>
                  <span className="font-bold text-lg">{stats?.total_patients || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">New Patients (This Month)</span>
                  <span className="font-bold text-lg">0</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Active Patients</span>
                  <span className="font-bold text-lg">{stats?.total_patients || 0}</span>
                </div>
              </div>
            </Card>

            <Card title="Appointment Statistics">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Today's Appointments</span>
                  <span className="font-bold text-lg">{stats?.today_appointments || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Pending Appointments</span>
                  <span className="font-bold text-lg">{stats?.pending_appointments || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Completed Appointments</span>
                  <span className="font-bold text-lg">
                    {(stats?.today_appointments || 0) - (stats?.pending_appointments || 0)}
                  </span>
                </div>
              </div>
            </Card>

            <Card title="Revenue Statistics">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Total Revenue</span>
                  <span className="font-bold text-lg text-green-600">
                    ${stats?.total_revenue?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Pending Payments</span>
                  <span className="font-bold text-lg text-yellow-600">
                    ${stats?.pending_payments?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Collection Rate</span>
                  <span className="font-bold text-lg">
                    {stats?.total_revenue > 0 ? 
                      `${((stats.total_revenue / (stats.total_revenue + stats.pending_payments)) * 100).toFixed(1)}%` : 
                      '0%'}
                  </span>
                </div>
              </div>
            </Card>

            <Card title="Department Statistics">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Total Departments</span>
                  <span className="font-bold text-lg">{stats?.total_departments || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Active Departments</span>
                  <span className="font-bold text-lg">{stats?.total_departments || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Doctors per Department</span>
                  <span className="font-bold text-lg">
                    {stats?.total_departments > 0 ? 
                      ((stats?.total_doctors || 0) / stats.total_departments).toFixed(1) : 
                      '0'}
                  </span>
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