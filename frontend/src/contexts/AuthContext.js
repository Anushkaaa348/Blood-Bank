// src/contexts/AuthContext.js
import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Configure axios instance with hardcoded API URL
  const api = axios.create({
    baseURL: 'http://localhost:5000/api', // Hardcoded backend API URL
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  // Add request interceptor for auth token
  api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Verify authentication on initial load
  const verifyAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await api.get('/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setUser(response.data.user);
      }
    } catch (err) {
      console.error('Verification error:', err);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    verifyAuth();
  }, [verifyAuth]);

  // Register new user
  const register = async (userData) => {
    setAuthLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/register', {
        name: userData.name.trim(),
        email: userData.email.toLowerCase().trim(),
        password: userData.password
      });

      if (response.data.success) {
        return {
          success: true,
          email: response.data.email,
          message: response.data.message || 'Registration successful'
        };
      }
      throw new Error(response.data.error || 'Registration failed');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 
                      err.message || 
                      'Registration failed. Please try again.';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setAuthLoading(false);
    }
  };

  // Verify OTP
  const verifyOtp = async (email, otp) => {
    setAuthLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/verify-otp', {
        email: email.toLowerCase().trim(),
        otp: otp.trim()
      });

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        navigate('/dashboard', { replace: true });
        return { success: true };
      }
      
      throw new Error(response.data.error || 'OTP verification failed');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 
                      err.message ||
                      'OTP verification failed. Please try again.';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setAuthLoading(false);
    }
  };

  // User login - FIXED VERSION
  const login = async (credentials) => {
    setAuthLoading(true); // Set loading state
    setError(null);
    
    try {
      // Basic validation
      if (!credentials.email || !credentials.password) {
        throw new Error('Email and password are required');
      }

      console.log('Attempting login with:', {
        email: credentials.email,
        password: credentials.password.length + ' characters'
      });

      const response = await api.post('/auth/login', {
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password // Don't trim password
      });

      console.log('Login response:', response.data);

      // Check if login was successful
      if (response.data.success) {
        if (!response.data.token) {
          throw new Error('Authentication failed: No token received');
        }

        // Store token and user data
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        
        // Check if user needs verification
        if (response.data.user && !response.data.user.isVerified) {
          return { 
            success: true, 
            requiresVerification: true,
            email: response.data.user.email 
          };
        }
        
        // Successful login - redirect will be handled by the component
        return { success: true };
      } else {
        // Backend returned success: false
        throw new Error(response.data.error || 'Login failed');
      }

    } catch (err) {
      console.error('Login error:', err);
      
      const errorMsg = err.response?.data?.error || 
                     err.message || 
                     'Login failed. Please try again.';
      setError(errorMsg);
      
      return { 
        success: false, 
        error: errorMsg,
        code: err.response?.data?.code
      };
    } finally {
      setAuthLoading(false); // Always clear loading state
    }
  };

  // User logout
  const logout = async () => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('token');
      setUser(null);
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Logout error:', err);
      // Force logout even if API fails
      localStorage.removeItem('token');
      setUser(null);
      navigate('/login', { replace: true });
    }
  };

  // Resend OTP
  const resendOtp = async (email) => {
    setAuthLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/resend-otp', {
        email: email.toLowerCase().trim()
      });
      
      if (response.data.success) {
        return { success: true };
      }
      
      throw new Error(response.data.error || 'Failed to resend OTP');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 
                      err.message ||
                      'Failed to resend OTP. Please try again.';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setAuthLoading(false);
    }
  };

  // Clear errors
  const clearError = () => setError(null);

  // Context value
  const value = {
    user,
    loading,
    authLoading,
    error,
    isAuthenticated: !!user,
    register,
    verifyOtp,
    login,
    logout,
    resendOtp,
    clearError,
    refreshAuth: verifyAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};