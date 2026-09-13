// src/pages/receptionist/Dashboard.jsx
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
      {/* Sidebar - This is what's missing */}
      <Sidebar />
      
      <div className="flex-1">
        <Navbar />
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.username}!</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard 
              title="Total Patients" 
              value={stats?.total_patients} 
              icon="👤" 
              color="blue" 
            />
            <StatCard 
              title="Total Doctors" 
              value={stats?.total_doctors} 
              icon="👨‍⚕️" 
              color="green" 
            />
            <StatCard 
              title="Today's Appointments" 
              value={stats?.today_appointments} 
              icon="📅" 
              color="purple" 
            />
            <StatCard 
              title="Total Revenue" 
              value={`$${stats?.total_revenue?.toFixed(2) || '0.00'}`} 
              icon="💰" 
              color="yellow" 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Recent Patients">
              <div className="space-y-3">
                {stats?.recent_patients?.map((patient, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{patient.full_name}</p>
                      <p className="text-sm text-gray-500">{patient.phone}</p>
                    </div>
                    <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                      {new Date(patient.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
                {(!stats?.recent_patients || stats.recent_patients.length === 0) && (
                  <p className="text-gray-500 text-center py-4">No recent patients</p>
                )}
              </div>
            </Card>

            <Card title="Recent Appointments">
              <div className="space-y-3">
                {stats?.recent_appointments?.map((appointment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{appointment.patient_name}</p>
                      <p className="text-sm text-gray-500">Dr. {appointment.doctor_name}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      appointment.status === 'scheduled' ? 'bg-green-100 text-green-700' :
                      appointment.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                      appointment.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                ))}
                {(!stats?.recent_appointments || stats.recent_appointments.length === 0) && (
                  <p className="text-gray-500 text-center py-4">No recent appointments</p>
                )}
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;