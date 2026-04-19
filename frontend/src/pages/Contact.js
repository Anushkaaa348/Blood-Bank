import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Container,
  Grid,
  Divider,
  Chip,
  Stack,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Email,
  Phone,
  LocationOn,
  Schedule,
  Send,
  CheckCircle
} from '@mui/icons-material';

const Contact = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Basic validation
      if (!form.name.trim()) throw new Error('Name is required');
      if (!form.email.trim()) throw new Error('Email is required');
      if (!form.message.trim()) throw new Error('Message is required');
      if (!/^\S+@\S+\.\S+$/.test(form.email)) throw new Error('Please enter a valid email');

      const apiUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:5000/api/contacts'
        : '/api/contacts';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          message: form.message.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit form');
      }

      setIsSubmitted(true);
      setForm({ name: '', email: '', message: '' });
      
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);

    } catch (err) {
      console.error('Submission error:', err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactMethods = [
    {
      icon: <Email color="primary" sx={{ fontSize: 40 }} />,
      title: "Email Us",
      detail: "support@lifedrop.com",
      action: "mailto:support@lifedrop.com"
    },
    {
      icon: <Phone color="primary" sx={{ fontSize: 40 }} />,
      title: "Call Us",
      detail: "+1 (555) 123-4567",
      action: "tel:+15551234567"
    },
    {
      icon: <LocationOn color="primary" sx={{ fontSize: 40 }} />,
      title: "Visit Us",
      detail: "123 Life Street, Bloodville",
      action: "https://maps.google.com"
    },
    {
      icon: <Schedule color="primary" sx={{ fontSize: 40 }} />,
      title: "Working Hours",
      detail: "Mon-Fri: 9AM-5PM",
      action: null
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ 
      py: 6,
      background: 'linear-gradient(to bottom, #f9f9f9, #fff)'
    }}>
      <Typography variant="h2" component="h1" gutterBottom sx={{ 
        fontWeight: 800,
        color: '#d62828',
        textAlign: 'center',
        mb: 2,
        textShadow: '1px 1px 3px rgba(0,0,0,0.1)',
        fontSize: { xs: '2rem', md: '3rem' }
      }}>
        Contact Us
      </Typography>

      <Typography variant="h5" component="p" sx={{ 
        textAlign: 'center',
        color: 'text.secondary',
        mb: 6,
        maxWidth: 700,
        mx: 'auto',
        fontSize: { xs: '1rem', md: '1.25rem' },
        lineHeight: 1.6
      }}>
        Have questions or need assistance? Our team is here to help you 24/7 with any inquiries about blood donation.
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ 
            p: 4, 
            borderRadius: 3, 
            height: '100%',
            background: 'white',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
            transition: 'transform 0.3s, box-shadow 0.3s',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 15px 35px rgba(0,0,0,0.1)'
            }
          }}>
            <Typography variant="h4" component="h2" gutterBottom sx={{ 
              mb: 4,
              fontWeight: 700,
              color: '#333',
              position: 'relative',
              '&:after': {
                content: '""',
                display: 'block',
                width: '60px',
                height: '4px',
                background: '#d62828',
                mt: 2
              }
            }}>
              Get In Touch
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {isSubmitted && (
              <Alert 
                icon={<CheckCircle fontSize="inherit" />}
                severity="success"
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                  boxShadow: '0 2px 10px rgba(76, 175, 80, 0.2)'
                }}
              >
                Thank you! Your message has been sent. We'll respond within 24 hours.
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Your Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                margin="normal"
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#ddd',
                    },
                    '&:hover fieldset': {
                      borderColor: '#d62828',
                    },
                  }
                }}
              />
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                margin="normal"
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#ddd',
                    },
                    '&:hover fieldset': {
                      borderColor: '#d62828',
                    },
                  }
                }}
              />
              <TextField
                fullWidth
                label="Your Message"
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                margin="normal"
                variant="outlined"
                multiline
                rows={5}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#ddd',
                    },
                    '&:hover fieldset': {
                      borderColor: '#d62828',
                    },
                  }
                }}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                endIcon={isSubmitting ? <CircularProgress size={24} /> : <Send />}
                disabled={isSubmitting}
                sx={{
                  mt: 3,
                  py: 1.5,
                  px: 4,
                  fontWeight: 600,
                  fontSize: '1rem',
                  textTransform: 'none',
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #d62828 0%, #f77f00 100%)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 20px rgba(214, 40, 40, 0.3)',
                    background: 'linear-gradient(135deg, #c22525 0%, #e67300 100%)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Paper elevation={3} sx={{ 
              p: 4, 
              borderRadius: 3, 
              flex: 1,
              background: 'white',
              boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 15px 35px rgba(0,0,0,0.1)'
              }
            }}>
              <Typography variant="h4" component="h2" gutterBottom sx={{ 
                mb: 4,
                fontWeight: 700,
                color: '#333',
                position: 'relative',
                '&:after': {
                  content: '""',
                  display: 'block',
                  width: '60px',
                  height: '4px',
                  background: '#d62828',
                  mt: 2
                }
              }}>
                Contact Information
              </Typography>

              <Stack spacing={3}>
                {contactMethods.map((method, index) => (
                  <Box key={index} sx={{ 
                    display: 'flex', 
                    gap: 3,
                    alignItems: 'center',
                    p: 2,
                    borderRadius: 2,
                    transition: 'all 0.3s',
                    '&:hover': {
                      background: 'rgba(214, 40, 40, 0.05)',
                      transform: 'translateX(5px)'
                    }
                  }}>
                    <Box sx={{ 
                      width: 60,
                      height: 60,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(214, 40, 40, 0.1)',
                      borderRadius: '50%'
                    }}>
                      {method.icon}
                    </Box>
                    <Box>
                      <Typography variant="h6" component="h3" gutterBottom sx={{
                        fontWeight: 600,
                        color: '#333'
                      }}>
                        {method.title}
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        mb: 1,
                        color: '#555'
                      }}>
                        {method.detail}
                      </Typography>
                      {method.action && (
                        <Button 
                          variant="outlined" 
                          href={method.action}
                          size="small"
                          sx={{
                            borderColor: '#d62828',
                            color: '#d62828',
                            '&:hover': {
                              background: '#d62828',
                              color: 'white',
                              borderColor: '#d62828'
                            }
                          }}
                        >
                          Contact
                        </Button>
                      )}
                    </Box>
                  </Box>
                ))}
              </Stack>

              <Divider sx={{ my: 4 }}>
                <Chip label="OR" sx={{
                  background: 'linear-gradient(135deg, #d62828 0%, #f77f00 100%)',
                  color: 'white',
                  px: 2,
                  py: 1
                }} />
              </Divider>

              <Typography variant="h6" component="h3" gutterBottom sx={{
                fontWeight: 700,
                color: '#333'
              }}>
                Emergency Blood Request
              </Typography>
              <Typography variant="body1" sx={{ 
                mb: 2,
                color: '#555'
              }}>
                For urgent blood needs, please call our emergency hotline:
              </Typography>
              <Button 
                variant="contained" 
                color="error" 
                href="tel:+15551234567"
                size="large"
                sx={{
                  fontWeight: 700,
                  fontSize: '1rem',
                  py: 1.5,
                  px: 3,
                  borderRadius: 2,
                  textTransform: 'none',
                  boxShadow: '0 4px 15px rgba(214, 40, 40, 0.3)',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: '0 6px 20px rgba(214, 40, 40, 0.4)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Emergency Hotline: +1 (555) 987-6543
              </Button>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Contact;