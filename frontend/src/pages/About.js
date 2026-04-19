import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, 
  Typography, 
  Container, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  Avatar,
  Divider,
  Stack,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  Favorite,
  People,
  LocalHospital,
  History,
  ContactPhone,
  VolunteerActivism,
  ErrorOutline
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const About = () => {
  const navigate = useNavigate();
  const [teamMembers, setTeamMembers] = useState([]);
  const [stats, setStats] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all data in parallel
        const [teamRes, statsRes, partnersRes] = await Promise.all([
          axios.get("http://localhost:5000/api/about/team"),
          axios.get("http://localhost:5000/api/about/stats"),
          axios.get("http://localhost:5000/api/about/partners")
        ]);

        setTeamMembers(teamRes.data);
        setStats(statsRes.data);
        setPartners(partnersRes.data);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load page content. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <CircularProgress size={60} color="error" />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <ErrorOutline color="error" sx={{ fontSize: 80, mb: 3 }} />
        <Typography variant="h4" gutterBottom>
          Something went wrong
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          {error}
        </Typography>
        <Button 
          variant="contained" 
          color="error"
          onClick={() => window.location.reload()}
          size="large"
        >
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #ffeef8 100%)',
      py: 8
    }}>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box textAlign="center" mb={8}>
          <Favorite color="error" sx={{ fontSize: 60 }} />
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom
            sx={{
              fontWeight: 700,
              color: '#d32f2f',
              mt: 2,
              textShadow: '1px 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            About LifeSaver Connect
          </Typography>
          <Typography 
            variant="h5" 
            component="p"
            sx={{
              color: '#555',
              maxWidth: '800px',
              mx: 'auto',
              lineHeight: 1.6
            }}
          >
            Connecting compassionate donors with patients in need since 2018. Our mission is to ensure no one dies waiting for blood.
          </Typography>
        </Box>

        {/* Our Story */}
        <Card elevation={3} sx={{ mb: 8, borderRadius: 3 }}>
          <CardContent sx={{ p: 6 }}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f' }}>
                  <History sx={{ verticalAlign: 'middle', mr: 2 }} />
                  Our Story
                </Typography>
                <Typography paragraph>
                  Founded after a personal tragedy where a loved one couldn't get blood in time, LifeSaver Connect began as a small community initiative in 2018.
                </Typography>
                <Typography paragraph>
                  Today, we've grown into a national network serving over 200 hospitals and blood banks across the country.
                </Typography>
                <Typography paragraph>
                  Our technology platform has reduced blood request fulfillment time by 65% compared to traditional methods.
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{
                  height: '100%',
                  backgroundImage: 'url(https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderRadius: 2,
                  minHeight: 300
                }} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Impact Stats */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f', mb: 4 }}>
            Our Impact
          </Typography>
          {stats.length > 0 ? (
            <Grid container spacing={4}>
              {stats.map((stat, index) => (
                <Grid item xs={6} sm={3} key={index}>
                  <Card sx={{ 
                    height: '100%', 
                    textAlign: 'center', 
                    p: 3,
                    borderRadius: 3,
                    boxShadow: 3
                  }}>
                    <Typography variant="h3" color="error" sx={{ fontWeight: 700 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="h6">
                      {stat.label}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert severity="info">No statistics available at this time</Alert>
          )}
        </Box>

        {/* Team Section */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f', mb: 4 }}>
            <People sx={{ verticalAlign: 'middle', mr: 2 }} />
            Meet Our Team
          </Typography>
          {teamMembers.length > 0 ? (
            <Grid container spacing={4}>
              {teamMembers.map((member, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Card sx={{ 
                    height: '100%', 
                    p: 3,
                    borderRadius: 3,
                    textAlign: 'center'
                  }}>
                    <Avatar 
                      sx={{ 
                        width: 120, 
                        height: 120, 
                        mx: 'auto', 
                        mb: 3,
                        bgcolor: '#ffcdd2',
                        color: '#d32f2f',
                        fontSize: '3rem'
                      }}
                    >
                      {member.name.charAt(0)}
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {member.name}
                    </Typography>
                    <Typography color="error" sx={{ mb: 2 }}>
                      {member.role}
                    </Typography>
                    <Typography variant="body2">
                      {member.bio}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert severity="info">Our team information is currently unavailable</Alert>
          )}
        </Box>

        {/* Call to Action */}
        <Card elevation={3} sx={{ 
          background: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)',
          color: 'white',
          borderRadius: 3,
          mb: 8
        }}>
          <CardContent sx={{ p: 6, textAlign: 'center' }}>
            <VolunteerActivism sx={{ fontSize: 60, mb: 3 }} />
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
              Ready to Make a Difference?
            </Typography>
            <Typography variant="h5" sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
              Join thousands of lifesavers in our mission to ensure blood is always available when needed.
            </Typography>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={3} 
              justifyContent="center"
              sx={{ mt: 4 }}
            >
              <Button 
                variant="contained" 
                size="large" 
                color="secondary"
                onClick={() => navigate('/donate')}
                sx={{
                  px: 6,
                  py: 2,
                  borderRadius: 3,
                  fontWeight: 600,
                  fontSize: '1.1rem'
                }}
                startIcon={<Favorite />}
              >
                Donate Blood
              </Button>
              <Button 
                variant="outlined" 
                size="large" 
                color="inherit"
                onClick={() => navigate('/contact')}
                sx={{
                  px: 6,
                  py: 2,
                  borderRadius: 3,
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  borderWidth: 2,
                  '&:hover': { borderWidth: 2 }
                }}
                startIcon={<ContactPhone />}
              >
                Contact Us
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Partners */}
        <Box>
          <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 600, color: '#d32f2f', mb: 4 }}>
            <LocalHospital sx={{ verticalAlign: 'middle', mr: 2 }} />
            Our Trusted Partners
          </Typography>
          {partners.length > 0 ? (
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              justifyContent: 'center',
              gap: 4,
              '& img': {
                height: 60,
                filter: 'grayscale(100%)',
                opacity: 0.7,
                transition: 'all 0.3s',
                '&:hover': {
                  filter: 'grayscale(0%)',
                  opacity: 1
                }
              }
            }}>
              {partners.map((partner, index) => (
                <img 
                  key={index}
                  src={partner.logoUrl || `https://via.placeholder.com/150x60?text=${encodeURIComponent(partner.name)}`} 
                  alt={partner.name}
                  title={partner.name}
                />
              ))}
            </Box>
          ) : (
            <Alert severity="info">Partner information is currently unavailable</Alert>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default About;