import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';
import Button from '../../components/Button';

const Dashboard = () => {
  const { user, api } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/appointments');
      setAppointments(response.data);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
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

  const upcomingAppointments = appointments.filter(a => a.status === 'scheduled').length;
  const completedAppointments = appointments.filter(a => a.status === 'completed').length;

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Patient Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.username}!</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard title="Total Appointments" value={appointments.length} icon="📅" color="blue" />
            <StatCard title="Upcoming" value={upcomingAppointments} icon="⏳" color="green" />
            <StatCard title="Completed" value={completedAppointments} icon="✅" color="purple" />
            <div className="bg-primary-600 rounded-xl shadow-md p-6 flex items-center justify-center hover:shadow-lg transition duration-200">
              <Link to="/patient/book-appointment" className="text-white text-center">
                <div className="text-3xl mb-1">➕</div>
                <span className="font-medium">Book Appointment</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <Card title="Recent Appointments">
              <div className="space-y-3">
                {appointments.slice(0, 5).map((appointment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Dr. {appointment.doctor_name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(appointment.appointment_date).toLocaleString()}
                      </p>
                      {appointment.reason && (
                        <p className="text-sm text-gray-500">Reason: {appointment.reason}</p>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      appointment.status === 'scheduled' ? 'bg-green-100 text-green-700' :
                      appointment.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                      appointment.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                ))}
                {appointments.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No appointments found</p>
                    <Link to="/patient/book-appointment">
                      <Button variant="primary">Book Your First Appointment</Button>
                    </Link>
                  </div>
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