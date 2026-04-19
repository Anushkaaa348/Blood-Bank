import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
   Box,
   TextField,
   Button,
   CircularProgress,
   Alert,
   Typography,
   Link
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: 'user@yopmail.com',
    password: 'hello1'
  });
  const [localError, setLocalError] = useState('');
  const { login, authLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (localError) setLocalError('');
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!formData.email || !formData.password) {
      setLocalError('Please fill in all fields');
      return;
    }

    try {
      const result = await login({
        email: formData.email,
        password: formData.password
      });

      console.log('Login result:', result);

      if (result.success) {
        if (result.requiresVerification) {
          navigate('/verify-email', {
            state: { email: result.email }
          });
        } else {
          navigate('/dashboard');
        }
      } else {
        setLocalError(result.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setLocalError('An unexpected error occurred. Please try again.');
    }
  };

  const displayError = error || localError;

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        maxWidth: 400,
        mx: 'auto',
        p: 3,
        mt: 8,
        boxShadow: 3,
        borderRadius: 2
      }}
    >
      <Typography variant="h5" gutterBottom align="center">
        Sign In
      </Typography>

      {displayError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {displayError}
        </Alert>
      )}

      <TextField
        name="email"
        label="Email Address"
        type="email"
        value={formData.email}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
        autoComplete="email"
        disabled={authLoading}
      />

      <TextField
        name="password"
        label="Password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
        autoComplete="current-password"
        disabled={authLoading}
      />

      <Box textAlign="right" mb={2}>
        <Link href="/forgot-password" variant="body2" underline="hover">
          Forgot password?
        </Link>
      </Box>

      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={authLoading}
        sx={{ mt: 1, py: 1.5 }}
      >
        {authLoading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          'Sign In'
        )}
      </Button>

      <Typography variant="body2" align="center" mt={2}>
        Don't have an account?{' '}
        <Link href="/signup" underline="hover">
          Sign up
        </Link>
      </Typography>
    </Box>
  );
};

export default Login;