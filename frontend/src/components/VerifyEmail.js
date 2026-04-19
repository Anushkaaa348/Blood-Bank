import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Alert, 
  CircularProgress,
  Box
} from '@mui/material';

const VerifyEmail = () => {
  const { verifyOtp, resendOtp, authLoading, error, clearError } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { email, from } = location.state || {};

  if (!email) {
    navigate(from === 'login' ? '/login' : '/signup');
    return null;
  }

  const handleVerify = async (e) => {
    e.preventDefault();
    clearError();
    try {
      const result = await verifyOtp(email, otp);
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Verification error:', err);
    }
  };

  const handleResend = async () => {
    clearError();
    try {
      const result = await resendOtp(email);
      if (result.success) {
        setSuccessMessage('New verification code sent');
      }
    } catch (err) {
      console.error('Resend error:', err);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Verify Your Email
        </Typography>
        <Typography sx={{ mb: 2 }}>
          We've sent a 6-digit code to {email}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

        <Box component="form" onSubmit={handleVerify}>
          <TextField
            fullWidth
            label="Verification Code"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            margin="normal"
            required
            autoFocus
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
            disabled={authLoading || otp.length !== 6}
          >
            {authLoading ? <CircularProgress size={24} /> : 'Verify Email'}
          </Button>
        </Box>

        <Button
          fullWidth
          variant="text"
          sx={{ mt: 2 }}
          onClick={handleResend}
          disabled={authLoading}
        >
          Resend Code
        </Button>
      </Paper>
    </Container>
  );
};

export default VerifyEmail;