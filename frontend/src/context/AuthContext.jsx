import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

const API_URL = '/api';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      const storedToken = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        try {
          const api = axios.create({
            baseURL: API_URL,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${storedToken}`
            },
          });
          
          const response = await api.get('/auth/me');
          const userData = response.data;
          
          console.log('✅ User loaded from backend:', userData);
          console.log('✅ Patient profile:', userData.patient);
          console.log('✅ Doctor profile:', userData.doctor);
          
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
          console.error('Failed to load user:', error);
          // Only clear storage if token is explicitly invalid (401)
          if (error.response?.status === 401) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            setUser(null);
          }
        }
      }
      setLoading(false);
    };
    
    loadUser();
  }, []);

  const api = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add token to every request
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn('⚠️ No token found in localStorage');
      }
      console.log('📤 Request:', config.method.toUpperCase(), config.url);
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Handle responses - NO AUTO LOGOUT
  api.interceptors.response.use(
    (response) => {
      console.log('📥 Response:', response.status, response.config.url);
      return response;
    },
    (error) => {
      console.error('❌ Error:', error.response?.status, error.response?.data);
      
      const url = error.config?.url || '';
      const isAuthRequest = url.includes('/auth/login') || url.includes('/auth/register');
      const hasToken = !!localStorage.getItem('access_token');
      
      // ONLY show a toast — DO NOT auto-logout
      if (error.response?.status === 401 && !isAuthRequest && hasToken) {
        console.warn('⚠️ 401 Unauthorized — staying logged in for debugging');
        // Auto-logout is DISABLED. Uncomment below to re-enable:
        // localStorage.removeItem('access_token');
        // localStorage.removeItem('refresh_token');
        // localStorage.removeItem('user');
        // setUser(null);
        // window.location.href = '/login';
      }
      
      if (error.response?.status === 403) {
        console.warn('⚠️ 403 Forbidden:', error.response?.data?.error);
      }
      
      return Promise.reject(error);
    }
  );

  const login = async (username, password) => {
    try {
      console.log('🔐 Login attempt for:', username);
      const response = await api.post('/auth/login', { username, password });
      console.log('✅ Login response:', response.data);
      
      const { access_token, refresh_token } = response.data.tokens;
      const userData = response.data.user;
      
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Fetch full user profile
      try {
        const profileResponse = await api.get('/auth/me', {
          headers: { 'Authorization': `Bearer ${access_token}` }
        });
        const fullUserData = profileResponse.data;
        console.log('✅ Full user profile loaded:', fullUserData);
        
        setUser(fullUserData);
        localStorage.setItem('user', JSON.stringify(fullUserData));
      } catch (profileError) {
        console.error('Failed to load full profile:', profileError);
        setUser(userData);
      }
      
      toast.success(`Welcome back, ${userData.username}!`);
      return { success: true, user: userData };
    } catch (error) {
      console.error('❌ Login error:', error);
      const message = error.response?.data?.error || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      toast.success('Registration successful! Please login.');
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.error || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    api,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;