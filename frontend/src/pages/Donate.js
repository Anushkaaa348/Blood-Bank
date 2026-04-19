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
  TextField,
  InputAdornment,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
  Chip,
  Paper
} from '@mui/material';
import { 
  Favorite,
  LocationOn,
  Search,
  Schedule,
  LocalHospital,
  Phone,
  GpsFixed,
  Bloodtype,
  Public,
  MyLocation
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/system';

const GradientBox = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #fef6f6 0%, #fff9fb 100%)',
  padding: theme.spacing(8, 0),
}));

const SearchCard = styled(Paper)(({ theme }) => ({
  maxWidth: 600,
  margin: '0 auto',
  marginBottom: theme.spacing(8),
  padding: theme.spacing(4),
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(211, 47, 47, 0.1)',
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
}));

const CenterCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 12,
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 28px rgba(211, 47, 47, 0.2)',
  },
}));

const Donate = () => {
  const [zipCode, setZipCode] = useState('');
  const [donationCenters, setDonationCenters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const navigate = useNavigate();

  // Helper function to make requests to both endpoints
  const fetchFromBothEndpoints = async (endpoint1, endpoint2, params = {}) => {
    const baseURL = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5000' 
      : '';
    
    const config = {
      params,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      // Make requests to both endpoints simultaneously
      const [response1, response2] = await Promise.allSettled([
        axios.get(`${baseURL}${endpoint1}`, config),
        axios.get(`${baseURL}${endpoint2}`, config)
      ]);

      // Check if at least one request succeeded
      let successResponse = null;
      let errors = [];

      if (response1.status === 'fulfilled' && response1.value.data.success) {
        successResponse = response1.value;
      } else if (response1.status === 'rejected') {
        errors.push(`Primary endpoint error: ${response1.reason.message}`);
      }

      if (response2.status === 'fulfilled' && response2.value.data.success) {
        if (!successResponse) {
          successResponse = response2.value;
        }
      } else if (response2.status === 'rejected') {
        errors.push(`Secondary endpoint error: ${response2.reason.message}`);
      }

      if (successResponse && successResponse.data.success && successResponse.data.data) {
        return successResponse.data.data;
      } else {
        throw new Error(errors.length > 0 ? errors.join('; ') : "No centers found from either endpoint");
      }
    } catch (err) {
      throw err;
    }
  };

  // Helper function to store data to both endpoints
  const storeDataToBothEndpoints = async (endpoint1, endpoint2, data) => {
    const baseURL = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5000' 
      : '';
    
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      // Store data to both endpoints simultaneously
      const [response1, response2] = await Promise.allSettled([
        axios.post(`${baseURL}${endpoint1}`, data, config),
        axios.post(`${baseURL}${endpoint2}`, data, config)
      ]);

      let successCount = 0;
      let errors = [];

      if (response1.status === 'fulfilled' && response1.value.data.success) {
        successCount++;
        console.log('Successfully stored to primary endpoint');
      } else if (response1.status === 'rejected') {
        errors.push(`Primary endpoint error: ${response1.reason.message}`);
      }

      if (response2.status === 'fulfilled' && response2.value.data.success) {
        successCount++;
        console.log('Successfully stored to secondary endpoint');
      } else if (response2.status === 'rejected') {
        errors.push(`Secondary endpoint error: ${response2.reason.message}`);
      }

      if (successCount === 0) {
        throw new Error(`Failed to store data to any endpoint: ${errors.join('; ')}`);
      }

      return {
        success: true,
        storedTo: successCount,
        errors: errors.length > 0 ? errors : null
      };
    } catch (err) {
      throw err;
    }
  };

  const fetchDonationCenters = async (zip) => {
    try {
      setLoading(true);
      setError(null);
      
      const centers = await fetchFromBothEndpoints(
        '/api/donate/centers',
        '/api/donations/centers',
        { zip }
      );
      
      setDonationCenters(centers);
    } catch (err) {
      console.error("Full Error:", err);
      setError(err.message);
      setSnackbarOpen(true);
      setDonationCenters([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllCenters = async () => {
    try {
      setLoading(true);
      setError(null);
      setZipCode(''); // Clear zip code when showing all centers
      
      const centers = await fetchFromBothEndpoints(
        '/api/donate/centers',
        '/api/donations/centers'
      );
      
      setDonationCenters(centers);
    } catch (err) {
      console.error("Error fetching all centers:", err);
      setError(err.message);
      setSnackbarOpen(true);
      setDonationCenters([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCenters();
  }, []);

  const handleSearch = () => {
    if (!zipCode.trim()) {
      setError("Please enter a valid ZIP code");
      setSnackbarOpen(true);
      return;
    }
    fetchDonationCenters(zipCode);
  };

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      setLocationLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await axios.get(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const zip = response.data.address.postcode;
            if (zip) {
              setZipCode(zip);
              fetchDonationCenters(zip);
            } else {
              setError("Couldn't determine ZIP code from your location");
              setSnackbarOpen(true);
            }
          } catch (err) {
            console.error("Geocoding error:", err);
            setError("Couldn't determine your location. Please enter ZIP manually.");
            setSnackbarOpen(true);
          } finally {
            setLocationLoading(false);
          }
        },
        (err) => {
          console.error("Geolocation error:", err);
          setError("Location access denied. Please enter ZIP code manually.");
          setSnackbarOpen(true);
          setLocationLoading(false);
        }
      );
    } else {
      setError("Geolocation not supported by your browser");
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleScheduleDonation = async (center) => {
    try {
      // Store center data to both endpoints before navigation
      const centerData = {
        _id: center._id,
        name: center.name,
        address: `${center.address}, ${center.city}, ${center.state} ${center.zipCode}`,
        hours: center.hours,
        phone: center.phone,
        services: center.services,
        timestamp: new Date().toISOString(),
        userId: 'nirmalch1004@gmail.com', // You might want to get this from auth context
        status: 'scheduled'
      };

      // Store to both endpoints
      const storeResult = await storeDataToBothEndpoints(
        '/api/donate/appointments',
        '/api/donations/appointments',
        centerData
      );

      if (storeResult.success) {
        console.log(`Data stored to ${storeResult.storedTo} endpoint(s)`);
        
        // Navigate to schedule page
        navigate('/schedule-donation', {
          state: {
            centerData,
            stored: true,
            endpoints: storeResult.storedTo
          }
        });
      }
    } catch (error) {
      console.error('Error storing appointment data:', error);
      // Still navigate but show error
      setError(`Failed to save appointment data: ${error.message}`);
      setSnackbarOpen(true);
      
      navigate('/schedule-donation', {
        state: {
          centerData: {
            _id: center._id,
            name: center.name,
            address: `${center.address}, ${center.city}, ${center.state} ${center.zipCode}`,
            hours: center.hours,
            phone: center.phone,
            services: center.services
          },
          stored: false,
          error: error.message
        }
      });
    }
  };

  return (
    <GradientBox>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box textAlign="center" mb={8}>
          <Box sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(211, 47, 47, 0.1)',
            width: 100,
            height: 100,
            borderRadius: '50%',
            mb: 3
          }}>
            <Favorite color="error" sx={{ fontSize: 48 }} />
          </Box>
          <Typography variant="h3" gutterBottom sx={{
            fontWeight: 800,
            color: '#d32f2f',
            mt: 2,
            letterSpacing: '-0.5px'
          }}>
            Find Blood Donation Centers
          </Typography>
          <Typography variant="h6" sx={{ 
            color: 'text.secondary', 
            maxWidth: '800px', 
            mx: 'auto',
            fontWeight: 400
          }}>
            Discover nearby blood donation centers and schedule your life-saving appointment
          </Typography>
        </Box>

        {/* Search Section */}
        <SearchCard elevation={0}>
          <Typography variant="h5" gutterBottom sx={{ 
            fontWeight: 600,
            color: '#d32f2f',
            mb: 3
          }}>
            Find a Donation Center
          </Typography>
          
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Enter 6-digit ZIP code"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            inputProps={{ maxLength: 6 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOn color="error" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Button 
                    variant="contained" 
                    color="error"
                    onClick={handleSearch}
                    startIcon={loading ? <CircularProgress size={20} /> : <Search />}
                    disabled={loading || zipCode.length !== 6}
                    sx={{
                      borderRadius: 2,
                      px: 3,
                      py: 1,
                      textTransform: 'none',
                      fontWeight: 600
                    }}
                  >
                    Search
                  </Button>
                </InputAdornment>
              ),
              sx: {
                borderRadius: 2,
                fieldset: {
                  borderColor: 'rgba(211, 47, 47, 0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(211, 47, 47, 0.5)',
                },
              }
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          
          <Divider sx={{ my: 3, color: 'text.secondary' }}>OR</Divider>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              variant="outlined"
              color="error"
              fullWidth
              startIcon={locationLoading ? <CircularProgress size={20} /> : <MyLocation />}
              onClick={handleLocationClick}
              disabled={locationLoading}
              sx={{
                borderRadius: 2,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              {locationLoading ? 'Detecting Location...' : 'Use My Current Location'}
            </Button>
            
            <Button
              variant="text"
              color="primary"
              fullWidth
              onClick={fetchAllCenters}
              disabled={loading}
              sx={{
                borderRadius: 2,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              View All Centers Nationwide
            </Button>
          </Box>
        </SearchCard>

        {/* Results Section */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
            <CircularProgress color="error" size={60} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ 
            mb: 4, 
            maxWidth: 600, 
            mx: 'auto',
            borderRadius: 2
          }}>
            {error}
          </Alert>
        ) : donationCenters.length > 0 ? (
          <>
            <Typography variant="h4" sx={{ 
              fontWeight: 700, 
              mb: 6,
              color: '#d32f2f',
              textAlign: 'center'
            }}>
              {zipCode ? (
                <>
                  <Public sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Available Centers in {zipCode}
                </>
              ) : (
                <>
                  <Bloodtype sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Nationwide Donation Centers
                </>
              )}
            </Typography>
            <Grid container spacing={4}>
              {donationCenters.map((center) => (
                <Grid item xs={12} sm={6} lg={4} key={center._id}>
                  <CenterCard>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mb: 3 
                      }}>
                        <LocalHospital color="error" sx={{ 
                          mr: 2,
                          fontSize: 32
                        }} />
                        <Typography variant="h6" sx={{ 
                          fontWeight: 600,
                          color: '#d32f2f'
                        }}>
                          {center.name}
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ 
                          display: 'flex',
                          alignItems: 'flex-start',
                          mb: 1.5
                        }}>
                          <LocationOn color="error" sx={{ 
                            verticalAlign: 'middle', 
                            mr: 1,
                            mt: 0.2
                          }} />
                          {`${center.address}, ${center.city}, ${center.state} ${center.zipCode}`}
                        </Typography>

                        <Typography variant="body2" color="text.secondary" sx={{ 
                          display: 'flex',
                          alignItems: 'flex-start',
                          mb: 1.5
                        }}>
                          <Schedule color="error" sx={{ 
                            verticalAlign: 'middle', 
                            mr: 1,
                            mt: 0.2
                          }} />
                          {center.hours || 'Call for hours'}
                        </Typography>

                        {center.phone && (
                          <Typography variant="body2" color="text.secondary" sx={{ 
                            display: 'flex',
                            alignItems: 'flex-start',
                            mb: 2
                          }}>
                            <Phone color="error" sx={{ 
                              verticalAlign: 'middle', 
                              mr: 1,
                              mt: 0.2
                            }} />
                            {center.phone}
                          </Typography>
                        )}

                        {center.services && center.services.length > 0 && (
                          <Box sx={{ mb: 3 }}>
                            {center.services.map((service, index) => (
                              <Chip
                                key={index}
                                label={service}
                                size="small"
                                sx={{ 
                                  mr: 1, 
                                  mb: 1,
                                  bgcolor: 'rgba(211, 47, 47, 0.1)',
                                  color: '#d32f2f'
                                }}
                              />
                            ))}
                          </Box>
                        )}
                      </Box>

                      <Button
                        variant="contained"
                        color="error"
                        fullWidth
                        startIcon={<Favorite />}
                        onClick={() => handleScheduleDonation(center)}
                        sx={{
                          borderRadius: 2,
                          py: 1.5,
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: '1rem'
                        }}
                      >
                        Schedule Donation
                      </Button>
                    </CardContent>
                  </CenterCard>
                </Grid>
              ))}
            </Grid>
          </>
        ) : (
          <Alert severity="info" sx={{ 
            mb: 4, 
            maxWidth: 600, 
            mx: 'auto',
            borderRadius: 2
          }}>
            No donation centers found. Try a different ZIP code or view all centers.
          </Alert>
        )}

        {/* CTA Section */}
        <Box sx={{ 
          mt: 10, 
          p: 4, 
          bgcolor: 'rgba(255, 235, 238, 0.6)', 
          borderRadius: 4,
          textAlign: 'center',
          border: '1px dashed rgba(211, 47, 47, 0.3)'
        }}>
          <Typography variant="h5" sx={{ 
            fontWeight: 700, 
            mb: 2,
            color: '#d32f2f'
          }}>
            Can't Find a Center Near You?
          </Typography>
          <Typography sx={{ 
            mb: 3,
            color: 'text.secondary',
            maxWidth: 600,
            mx: 'auto'
          }}>
            We're constantly expanding our network. Let us know where we should add new centers.
          </Typography>
          <Button 
            variant="outlined" 
            color="error"
            onClick={() => navigate('/contact')}
            sx={{
              borderRadius: 2,
              px: 4,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Suggest a Location
          </Button>
        </Box>

        {/* Error Snackbar */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            severity="error" 
            onClose={handleSnackbarClose}
            sx={{ 
              width: '100%',
              borderRadius: 2,
              boxShadow: 3
            }}
          >
            {error}
          </Alert>
        </Snackbar>
      </Container>
    </GradientBox>
  );
};

export default Donate;