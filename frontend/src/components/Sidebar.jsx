// src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();

  const getMenuItems = () => {
    if (!user) return [];

    switch (user.role) {
      case 'admin':
        return [
          { path: '/receptionist/dashboard', icon: '📊', label: 'Dashboard' },
          { path: '/admin/approvals', icon: '✅', label: 'Approvals' },
          { path: '/receptionist/patients', icon: '👤', label: 'Patients' },
          { path: '/receptionist/doctors', icon: '👨‍⚕️', label: 'Doctors' },
          { path: '/receptionist/appointments', icon: '📅', label: 'Appointments' },
          { path: '/receptionist/billing', icon: '💰', label: 'Billing' },
          { path: '/receptionist/reports', icon: '📈', label: 'Reports' },
          { path: '/receptionist/profile', icon: '⚙️', label: 'Profile' },
        ];
      case 'receptionist':
        return [
          { path: '/receptionist/dashboard', icon: '📊', label: 'Dashboard' },
          { path: '/receptionist/patients', icon: '👤', label: 'Patients' },
          { path: '/receptionist/doctors', icon: '👨‍⚕️', label: 'Doctors' },
          { path: '/receptionist/appointments', icon: '📅', label: 'Appointments' },
          { path: '/receptionist/billing', icon: '💰', label: 'Billing' },
          { path: '/receptionist/reports', icon: '📈', label: 'Reports' },
          { path: '/receptionist/profile', icon: '⚙️', label: 'Profile' },
        ];
      case 'doctor':
        return [
          { path: '/doctor/dashboard', icon: '📊', label: 'Dashboard' },
          { path: '/doctor/my-patients', icon: '👤', label: 'My Patients' },
          { path: '/doctor/appointments', icon: '📅', label: 'Appointments' },
          { path: '/doctor/medical-records', icon: '📋', label: 'Medical Records' },
          { path: '/doctor/prescriptions', icon: '💊', label: 'Prescriptions' },
          { path: '/doctor/laboratory', icon: '🔬', label: 'Laboratory' },
          { path: '/doctor/diagnosis', icon: '🩺', label: 'Diagnosis' },
          { path: '/doctor/profile', icon: '⚙️', label: 'Profile' },
        ];
      case 'patient':
        return [
          { path: '/patient/dashboard', icon: '📊', label: 'Dashboard' },
          { path: '/patient/book-appointment', icon: '📅', label: 'Book Appointment' },
          { path: '/patient/my-appointments', icon: '📋', label: 'My Appointments' },
          { path: '/patient/medical-history', icon: '📋', label: 'Medical History' },
          { path: '/patient/prescriptions', icon: '💊', label: 'Prescriptions' },
          { path: '/patient/lab-results', icon: '🔬', label: 'Lab Results' },
          { path: '/patient/bills', icon: '💰', label: 'Bills' },
          { path: '/patient/profile', icon: '⚙️', label: 'Profile' },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <aside className="w-64 bg-white shadow-lg min-h-screen">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🏥</span>
          <div>
            <p className="font-bold text-gray-900">KALAL</p>
            <p className="text-xs text-gray-500">Hospital System</p>
          </div>
        </div>
      </div>
      <nav className="mt-5 px-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition duration-200 ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <span className="mr-3 text-xl">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;