import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Avatar,
  Container,
  Divider
} from '@mui/material';
import {
  AdminPanelSettings,
  Visibility,
  VisibilityOff,
  Lock,
  ArrowBack,
  Email
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const ADMIN_EMAIL    = 'nirmalch1004@gmail.com';
const ADMIN_PASSWORD = 'Nirmalch1004ch';

const Card = styled(Box)(() => ({
  background: '#fff',
  borderRadius: '16px',
  padding: '40px 36px',
  maxWidth: 420,
  width: '100%',
  boxShadow: '0 4px 24px rgba(139,0,0,0.1)',
  border: '1px solid rgba(139,0,0,0.08)',
}));

const StyledTextField = styled(TextField)(() => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    '& fieldset': { borderColor: 'rgba(139,0,0,0.2)' },
    '&:hover fieldset': { borderColor: 'rgba(139,0,0,0.4)' },
    '&.Mui-focused fieldset': { borderColor: '#8B0000' },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: '#8B0000' },
}));

const AdminLogin = () => {
  const [formData, setFormData]         = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.email !== ADMIN_EMAIL) {
      setError('Invalid email address.');
      setLoading(false);
      return;
    }
    if (formData.password !== ADMIN_PASSWORD) {
      setError('Invalid password.');
      setLoading(false);
      return;
    }

    localStorage.setItem('adminToken', 'mock-admin-token');
    localStorage.setItem('adminUser', JSON.stringify({
      email: formData.email,
      role: 'admin',
      loginTime: new Date().toISOString()
    }));

    navigate('/admin/dashboard');
    setLoading(false);
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: '#fdf5f5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      px: 2,
    }}>
      <Box sx={{ width: '100%', maxWidth: 420 }}>

        {/* Back link */}
        <Button
          component={Link}
          to="/"
          startIcon={<ArrowBack sx={{ fontSize: 16 }} />}
          sx={{
            mb: 3, color: '#8B0000', textTransform: 'none',
            fontWeight: 500, fontSize: '0.88rem',
            '&:hover': { background: 'rgba(139,0,0,0.06)' }
          }}
        >
          Back to Home
        </Button>

        <Card>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Avatar sx={{
              width: 64, height: 64,
              background: '#8B0000',
              margin: '0 auto 16px',
            }}>
              <AdminPanelSettings sx={{ fontSize: 32 }} />
            </Avatar>

            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a0000', mb: 0.5 }}>
              Admin Login
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Rakt Blood Donation Platform
            </Typography>
          </Box>

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit}>
            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>
                {error}
              </Alert>
            )}

            <StyledTextField
              fullWidth label="Email" name="email"
              type="email" value={formData.email}
              onChange={handleChange} required
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ fontSize: 18, color: 'rgba(139,0,0,0.4)' }} />
                  </InputAdornment>
                ),
              }}
            />

            <StyledTextField
              fullWidth label="Password" name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange} required
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ fontSize: 18, color: 'rgba(139,0,0,0.4)' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(o => !o)} edge="end" size="small">
                      {showPassword
                        ? <VisibilityOff sx={{ fontSize: 18 }} />
                        : <Visibility   sx={{ fontSize: 18 }} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit" fullWidth variant="contained"
              disabled={loading}
              sx={{
                mt: 2.5, py: 1.4,
                borderRadius: '10px',
                background: '#8B0000',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                boxShadow: 'none',
                '&:hover': { background: '#a30000', boxShadow: 'none' },
              }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', textAlign: 'center' }}>
            Authorized personnel only
          </Typography>
        </Card>
      </Box>
    </Box>
  );
};

export default AdminLogin;