import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Alert,
  TextField,
  Button,
  Grid,
  InputAdornment,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Box
} from '@mui/material';
import {
  Person,
  Bloodtype,
  Phone,
  LocationOn,
  Notes,
  Send,
  AccessTime
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

const RequestBlood = () => {
  const [form, setForm] = useState({
    name: '',
    bloodGroup: '',
    contact: '',
    location: '',
    reason: ''
  });
  const [requests, setRequests] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');

  const fetchRequests = async () => {
  setIsLoadingRequests(true);
  setError('');

  try {
    // Use full URL in development, relative in production
    const apiUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5000/api/blood-requests'
      : '/api/blood-requests';

    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json'
      }
    });

    // Check for HTML response
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('text/html')) {
      const html = await response.text();
      throw new Error('Server returned an HTML error page');
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Request failed');
    }

    const data = await response.json();
    setRequests(data.data || []);
  } catch (err) {
    console.error('Fetch error:', err);
    setError(err.message);
  } finally {
    setIsLoadingRequests(false);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/blood-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(form)
      });

      // Check for HTML response
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('text/html')) {
        const html = await response.text();
        throw new Error('Server returned an error page');
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Submission failed');
      }

      setSubmitSuccess(true);
      setForm({
        name: '',
        bloodGroup: '',
        contact: '',
        location: '',
        reason: ''
      });
      fetchRequests();
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleChange = (e) => {
  const { name, value } = e.target;
  setForm(prev => ({
    ...prev,
    [name]: value
  }));
};
  useEffect(() => {
    fetchRequests();
  }, []);

  const bloodGroupColors = {
    'A+': '#d32f2f',
    'A-': '#f44336',
    'B+': '#1976d2',
    'B-': '#2196f3',
    'AB+': '#388e3c',
    'AB-': '#4caf50',
    'O+': '#ffa000',
    'O-': '#ffc107'
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={4} sx={{ p: 4, borderRadius: 3, mb: 4 }}>
  <Typography variant="h3" component="h1" gutterBottom sx={{ 
    fontWeight: 700,
    color: '#d62828',
    textAlign: 'center',
    mb: 4
  }}>
    Request Blood Donation
  </Typography>
  
  {submitSuccess && (
    <Alert severity="success" sx={{ mb: 4 }}>
      Your blood request has been submitted successfully! We'll contact you shortly.
    </Alert>
  )}

  {error && (
    <Alert severity="error" sx={{ mb: 4 }}>
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
          value={form.name}
          onChange={handleChange}
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Person color="action" />
              </InputAdornment>
            ),
          }}
          variant="outlined"
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Blood Group"
          name="bloodGroup"
          value={form.bloodGroup}
          onChange={handleChange}
          required
          select
          SelectProps={{
            native: true,
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Bloodtype color="action" />
              </InputAdornment>
            ),
          }}
        >
          <option value=""></option>
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
        </TextField>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Contact Number"
          name="contact"
          value={form.contact}
          onChange={handleChange}
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Phone color="action" />
              </InputAdornment>
            ),
          }}
          variant="outlined"
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Location/Hospital"
          name="location"
          value={form.location}
          onChange={handleChange}
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LocationOn color="action" />
              </InputAdornment>
            ),
          }}
          variant="outlined"
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Reason/Additional Information"
          name="reason"
          value={form.reason}
          onChange={handleChange}
          multiline
          rows={4}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Notes color="action" />
              </InputAdornment>
            ),
          }}
          variant="outlined"
        />
      </Grid>
      
      <Grid item xs={12}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : <Send />}
          sx={{
            py: 2,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #d62828 0%, #f77f00 100%)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 20px rgba(214, 40, 40, 0.3)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </Button>
      </Grid>
    </Grid>
  </Box>
</Paper>

      <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ 
          fontWeight: 600,
          color: '#d62828',
          mb: 3
        }}>
          Recent Community Requests
        </Typography>

        {isLoadingRequests ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
            <Button onClick={fetchRequests} sx={{ ml: 2 }}>Retry</Button>
          </Alert>
        ) : requests.length === 0 ? (
          <Typography variant="body1" color="textSecondary" align="center" py={4}>
            No blood requests found
          </Typography>
        ) : (
          <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {requests.map((request, index) => (
              <React.Fragment key={request._id}>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" mb={1}>
                        <Chip 
                          label={request.bloodGroup}
                          size="medium"
                          sx={{ 
                            mr: 2,
                            backgroundColor: bloodGroupColors[request.bloodGroup] || '#9e9e9e',
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                        <Typography variant="h6" component="span">
                          {request.name}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                          display="block"
                          mb={1}
                        >
                          <Box component="span" mr={2}>
                            <Phone fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                            {request.contact}
                          </Box>
                          <Box component="span">
                            <LocationOn fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                            {request.location}
                          </Box>
                        </Typography>
                        {request.reason && (
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {request.reason}
                          </Typography>
                        )}
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="flex"
                          alignItems="center"
                        >
                          <AccessTime fontSize="small" sx={{ mr: 0.5 }} />
                          {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                {index < requests.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
};

export default RequestBlood;