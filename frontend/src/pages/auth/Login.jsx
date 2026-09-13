import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PublicLayout from '../../components/PublicLayout';
import Button from '../../components/Button';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDemo, setShowDemo] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      redirectToDashboard(user);
    }
  }, [user]);

  const redirectToDashboard = (user) => {
    if (user.role === 'admin' || user.role === 'receptionist') {
      navigate('/receptionist/dashboard', { replace: true });
    } else if (user.role === 'doctor') {
      navigate('/doctor/dashboard', { replace: true });
    } else if (user.role === 'patient') {
      navigate('/patient/dashboard', { replace: true });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(username, password);
    setLoading(false);

    if (result.success) {
      redirectToDashboard(result.user);
    } else {
      setError(result.error || 'Invalid username or password');
    }
  };

  return (
    <PublicLayout>
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
          <div>
            <h1 className="text-center text-3xl font-bold text-hospital-blue">🏥 KALAL</h1>
            <h2 className="mt-2 text-center text-sm text-gray-600">Hospital Management System</h2>
            <h3 className="mt-6 text-center text-2xl font-semibold text-gray-900">
              Sign in to your account
            </h3>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field mt-1"
                  placeholder="Enter your username"
                  autoComplete="username"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field mt-1"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <div className="text-sm">
              <Link to="/register" className="text-primary-600 hover:text-primary-500">
                Don't have an account? Register
              </Link>
            </div>

            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
              Sign in
            </Button>

            {/* Demo credentials toggle */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowDemo(!showDemo)}
                className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
              >
                {showDemo ? 'Hide' : 'Show'} Demo Credentials
              </button>
              {showDemo && (
                <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <p className="font-medium text-gray-700">Demo Credentials:</p>
                  <p className="mt-1">👤 <span className="font-mono">admin</span> | <span className="font-mono">Admin@123</span></p>
                  <p>👤 <span className="font-mono">receptionist</span> | <span className="font-mono">Receptionist@123</span></p>
                  <p>👤 <span className="font-mono">doctor</span> | <span className="font-mono">Doctor@123</span></p>
                  <p>👤 <span className="font-mono">patient</span> | <span className="font-mono">Patient@123</span></p>
                </div>
              )}
            </div>

            <div className="text-center pt-4 border-t border-gray-200">
              <Link to="/" className="text-sm text-gray-500 hover:text-blue-600 transition">
                ← Back to Home
              </Link>
            </div>
          </form>
        </div>
      </div>
    </PublicLayout>
  );
};

export default Login;