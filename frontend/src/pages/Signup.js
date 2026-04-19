import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Link,
  Grid
} from '@mui/material';

const Signup = () => {
  const { 
    register, 
    verifyOtp, 
    resendOtp, 
    authLoading, 
    error, 
    clearError 
  } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('register');
  const [successMessage, setSuccessMessage] = useState('');
  const [formError, setFormError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Please enter a valid email';
    if (formData.password.length < 6) return 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setFormError('');

    if (step === 'register') {
      const validationError = validateForm();
      if (validationError) {
        setFormError(validationError);
        return;
      }

      try {
        const result = await register(formData);
        if (result?.success) {
          setStep('verify');
          setSuccessMessage(`Verification code sent to ${formData.email}`);
        } else {
          setFormError(result?.error || 'Registration failed');
        }
      } catch (err) {
        setFormError('Registration failed. Please try again.');
        console.error('Registration error:', err);
      }
    } else {
      if (otp.length !== 6) {
        setFormError('Please enter a 6-digit verification code');
        return;
      }

      try {
        const result = await verifyOtp(formData.email, otp);
        if (result?.success) {
          navigate('/dashboard');
        } else {
          setFormError(result?.error || 'Verification failed');
        }
      } catch (err) {
        setFormError('Verification failed. Please try again.');
        console.error('Verification error:', err);
      }
    }
  };

  const handleResendOtp = async () => {
    clearError();
    setFormError('');
    try {
      const result = await resendOtp(formData.email);
      if (result?.success) {
        setSuccessMessage(`New verification code sent to ${formData.email}`);
      } else {
        setFormError(result?.error || 'Failed to resend code');
      }
    } catch (err) {
      setFormError('Failed to resend verification code');
      console.error('Resend error:', err);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
          {step === 'register' ? 'Create Your Account' : 'Verify Your Email'}
        </Typography>

        {(error || formError) && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }} 
            onClose={() => {
              clearError();
              setFormError('');
            }}
          >
            {error || formError}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {step === 'register' ? (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  autoFocus
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  margin="normal"
                  inputProps={{ minLength: 6 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  margin="normal"
                />
              </Grid>
            </Grid>
          ) : (
            <>
              <Typography variant="body1" gutterBottom sx={{ mb: 2 }}>
                We've sent a 6-digit verification code to <strong>{formData.email}</strong>
              </Typography>
              <TextField
                fullWidth
                label="Verification Code"
                value={otp}
                onChange={handleOtpChange}
                required
                autoFocus
                margin="normal"
                inputProps={{
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                  maxLength: 6
                }}
              />
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button 
                  variant="text" 
                  onClick={handleResendOtp}
                  disabled={authLoading}
                  sx={{ textTransform: 'none' }}
                >
                  Didn't receive a code? <strong>Resend</strong>
                </Button>
              </Box>
            </>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{ 
              mt: 3, 
              mb: 2,
              py: 1.5,
              fontWeight: 'bold',
              fontSize: '1rem'
            }}
            disabled={authLoading}
          >
            {authLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : step === 'register' ? (
              'Sign Up'
            ) : (
              'Verify Account'
            )}
          </Button>

          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Already have an account?{' '}
            <Link 
              component="button"
              type="button"
              onClick={() => navigate('/login')}
              underline="hover"
              sx={{ fontWeight: 'bold' }}
            >
              Log in
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Signup;