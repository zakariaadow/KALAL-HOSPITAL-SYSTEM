import React, { useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, loading, isAuthenticated, api } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          await api.get('/auth/me');
        } catch (error) {
          console.error('Token validation failed:', error);
          if (error.response?.status === 401) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            toast.error('Session expired. Please login again.');
            navigate('/login');
          }
        }
      }
    };
    
    if (isAuthenticated) {
      validateToken();
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    console.log('❌ Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Check if user has allowed role
  const userRole = user?.role;
  console.log('🔍 Checking role:', userRole, 'Allowed:', allowedRoles);
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    console.log(`❌ Role not allowed: ${userRole}`);
    
    // Redirect based on role
    if (userRole === 'patient') {
      return <Navigate to="/patient/dashboard" replace />;
    } else if (userRole === 'doctor') {
      return <Navigate to="/doctor/dashboard" replace />;
    } else if (userRole === 'receptionist' || userRole === 'admin') {
      return <Navigate to="/receptionist/dashboard" replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  }

  console.log('✅ Authenticated, rendering outlet');
  return <Outlet />;
};

export default ProtectedRoute;