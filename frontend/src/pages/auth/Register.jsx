// src/pages/auth/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    phone: '',
    address: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.first_name) newErrors.first_name = 'First name is required';
    if (!formData.last_name) newErrors.last_name = 'Last name is required';
    if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    
    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password && !/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    }
    
    if (formData.password && !/[a-z]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one lowercase letter';
    }
    
    if (formData.password && !/[0-9]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    const userData = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      first_name: formData.first_name,
      last_name: formData.last_name,
      date_of_birth: formData.date_of_birth,
      gender: formData.gender,
      phone: formData.phone || '',
      address: formData.address || '',
    };
    
    console.log('Sending registration data:', userData);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/auth/register-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        if (formData.role === 'patient') {
          toast.success('Registration successful! You can now login.');
          setTimeout(() => navigate('/login'), 1500);
        } else {
          toast.success('Registration request submitted! Waiting for admin approval.');
          setTimeout(() => navigate('/login'), 3000);
        }
        // Clear form
        setFormData({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: 'patient',
          first_name: '',
          last_name: '',
          date_of_birth: '',
          gender: '',
          phone: '',
          address: '',
        });
      } else {
        toast.error(data.error || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-bold text-hospital-blue">Register</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Create your account</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Username *</label>
              <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                className={`input-field ${errors.username ? 'border-red-500' : ''}`}
                placeholder="Enter username (no spaces)"
              />
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email *</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                placeholder="Enter email"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name *</label>
              <input
                type="text"
                name="first_name"
                required
                value={formData.first_name}
                onChange={handleChange}
                className={`input-field ${errors.first_name ? 'border-red-500' : ''}`}
                placeholder="Enter first name"
              />
              {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name *</label>
              <input
                type="text"
                name="last_name"
                required
                value={formData.last_name}
                onChange={handleChange}
                className={`input-field ${errors.last_name ? 'border-red-500' : ''}`}
                placeholder="Enter last name"
              />
              {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth *</label>
              <input
                type="date"
                name="date_of_birth"
                required
                value={formData.date_of_birth}
                onChange={handleChange}
                className={`input-field ${errors.date_of_birth ? 'border-red-500' : ''}`}
              />
              {errors.date_of_birth && <p className="text-red-500 text-xs mt-1">{errors.date_of_birth}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Gender *</label>
              <select
                name="gender"
                required
                value={formData.gender}
                onChange={handleChange}
                className={`input-field ${errors.gender ? 'border-red-500' : ''}`}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="input-field"
              >
                <option value="patient">Patient (Auto-approved)</option>
                <option value="doctor">Doctor (Needs admin approval)</option>
                <option value="receptionist">Receptionist (Needs admin approval)</option>
              </select>
              <p className="text-xs text-gray-400 mt-1">
                {formData.role === 'patient' 
                  ? '✅ Patients can login immediately' 
                  : '⏳ Doctors and Receptionists need admin approval'}
              </p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password *</label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className={`input-field ${errors.password ? 'border-red-500' : ''}`}
                placeholder="Min 8 chars with uppercase & number"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              <p className="text-xs text-gray-400 mt-1">Must contain uppercase, lowercase, and number</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`input-field ${errors.confirmPassword ? 'border-red-500' : ''}`}
                placeholder="Confirm password"
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full"
          >
            Register
          </Button>

          <div className="text-center text-sm">
            <Link to="/login" className="text-primary-600 hover:text-primary-500">
              Already have an account? Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;