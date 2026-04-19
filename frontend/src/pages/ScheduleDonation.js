import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import { 
  Box, 
  Typography, 
  Container, 
  Button, 
  TextField,
  Divider,
  CircularProgress,
  Alert,
  Paper,
  Chip
} from '@mui/material';
import { 
  Favorite,
  LocationOn,
  Schedule as ScheduleIcon,
  LocalHospital,
  Phone,
  ArrowBack
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { format } from 'date-fns';

const ScheduleDonation = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    timeSlot: '10:00 AM - 11:00 AM',
    centerId: state?.centerData?._id || '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!state?.centerData) {
      navigate('/donate');
    }
  }, [state, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const baseURL = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:5000' 
        : '';

      const response = await axios.post(
        `${baseURL}/api/donations/schedule`, 
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          date: new Date(formData.date).toISOString(),
          timeSlot: formData.timeSlot,
          centerId: formData.centerId,
          notes: formData.notes
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        setSuccess(true);
      } else {
        throw new Error(response.data.error || 'Failed to schedule donation');
      }
    } catch (err) {
      console.error('Scheduling error:', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!state?.centerData) {
    return null;
  }

  if (success) {
    navigate('/profile');
    return null;
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button 
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3 }}
      >
        Back
      </Button>

      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          <LocalHospital color="error" sx={{ verticalAlign: 'middle', mr: 1 }} />
          {state.centerData.name}
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 1 }}>
          <LocationOn color="error" sx={{ verticalAlign: 'middle', mr: 1 }} />
          {state.centerData.address}
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 2 }}>
          <Phone color="error" sx={{ verticalAlign: 'middle', mr: 1 }} />
          {state.centerData.phone}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {state.centerData.services?.map((service, index) => (
            <Chip 
              key={index} 
              label={service} 
              size="small" 
              sx={{ bgcolor: 'rgba(211, 47, 47, 0.1)', color: '#d32f2f' }} 
            />
          ))}
        </Box>
      </Paper>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          Schedule Your Donation
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                inputProps={{ maxLength: 15 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Donation Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: format(new Date(), 'yyyy-MM-dd') }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Preferred Time Slot"
                name="timeSlot"
                select
                value={formData.timeSlot}
                onChange={handleChange}
                required
                SelectProps={{
                  native: true,
                }}
              >
                <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                <option value="12:00 PM - 1:00 PM">12:00 PM - 1:00 PM</option>
                <option value="1:00 PM - 2:00 PM">1:00 PM - 2:00 PM</option>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Notes (Optional)"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="error"
                size="large"
                fullWidth
                startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <Favorite />}
                disabled={loading}
                sx={{ py: 2 }}
              >
                {loading ? 'Scheduling...' : 'Confirm Donation Appointment'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default ScheduleDonation;
