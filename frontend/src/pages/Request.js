import React, { useState, useEffect } from 'react';
import {
  Container, Paper, Typography, Alert, TextField,
  Button, Grid, InputAdornment, CircularProgress,
  Divider, Chip, Box, Card, CardContent
} from '@mui/material';
import {
  Person, Bloodtype, Phone, LocationOn,
  Notes, Send, AccessTime, Favorite
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { styled } from '@mui/material/styles';

/* ── STYLED COMPONENTS ───────────────────────────────────────────────── */
const PageWrapper = styled(Box)(() => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #fef6f6 0%, #fff9fb 100%)',
  paddingTop: '48px',
  paddingBottom: '64px',
}));

const SectionCard = styled(Paper)(() => ({
  borderRadius: '20px',
  padding: '40px',
  boxShadow: '0 4px 24px rgba(139,0,0,0.08)',
  border: '1px solid rgba(139,0,0,0.06)',
  marginBottom: '32px',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #8B0000, #e53935)',
  },
}));

const StyledTextField = styled(TextField)(() => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    background: '#fafafa',
    transition: 'all 0.2s ease',
    '& fieldset': { borderColor: 'rgba(139,0,0,0.15)' },
    '&:hover': {
      background: '#fff',
      '& fieldset': { borderColor: 'rgba(139,0,0,0.35)' },
    },
    '&.Mui-focused': {
      background: '#fff',
      boxShadow: '0 0 0 3px rgba(139,0,0,0.08)',
      '& fieldset': { borderColor: '#8B0000' },
    },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: '#8B0000' },
  '& .MuiInputAdornment-root svg': { color: 'rgba(139,0,0,0.4)', fontSize: 20 },
}));

const SubmitButton = styled(Button)(() => ({
  borderRadius: '12px',
  padding: '14px 32px',
  fontSize: '1rem',
  fontWeight: 700,
  textTransform: 'none',
  background: '#8B0000',
  boxShadow: '0 4px 16px rgba(139,0,0,0.25)',
  letterSpacing: '0.01em',
  '&:hover': {
    background: '#a30000',
    boxShadow: '0 8px 24px rgba(139,0,0,0.3)',
    transform: 'translateY(-1px)',
  },
  '&:active': { transform: 'translateY(0)' },
  '&.Mui-disabled': { background: '#e0e0e0', boxShadow: 'none' },
  transition: 'all 0.25s ease',
}));

const RequestCard = styled(Card)(() => ({
  borderRadius: '14px',
  border: '1px solid rgba(139,0,0,0.08)',
  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
  transition: 'all 0.25s ease',
  '&:hover': {
    boxShadow: '0 6px 20px rgba(139,0,0,0.12)',
    transform: 'translateY(-2px)',
    borderColor: 'rgba(139,0,0,0.2)',
  },
}));

const BloodBadge = styled(Box)(({ bg }) => ({
  width: 52,
  height: 52,
  borderRadius: '50%',
  background: bg || '#8B0000',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
  fontWeight: 800,
  fontSize: '0.85rem',
  flexShrink: 0,
  boxShadow: `0 4px 12px ${bg ? bg + '55' : 'rgba(139,0,0,0.3)'}`,
}));

const InfoRow = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  color: '#555',
  fontSize: '0.85rem',
}));

/* ── BLOOD GROUP CONFIG ──────────────────────────────────────────────── */
const BLOOD_COLORS = {
  'A+': '#c62828', 'A-': '#e53935',
  'B+': '#1565c0', 'B-': '#1976d2',
  'AB+': '#2e7d32', 'AB-': '#388e3c',
  'O+': '#e65100', 'O-': '#ef6c00',
};

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

/* ── COMPONENT ───────────────────────────────────────────────────────── */
const RequestBlood = () => {
  const [form, setForm] = useState({
    name: '', bloodGroup: '', contact: '', location: '', reason: ''
  });
  const [requests, setRequests]             = useState([]);
  const [isSubmitting, setIsSubmitting]     = useState(false);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [submitSuccess, setSubmitSuccess]   = useState(false);
  const [error, setError]                   = useState('');

  const apiUrl = process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000/api/blood-requests'
    : '/api/blood-requests';

  const fetchRequests = async () => {
    setIsLoadingRequests(true);
    setError('');
    try {
      const res = await fetch(apiUrl, { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error('Failed to load requests');
      const data = await res.json();
      setRequests(data.data || []);
    } catch (err) {
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
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Submission failed');
      }
      setSubmitSuccess(true);
      setForm({ name: '', bloodGroup: '', contact: '', location: '', reason: '' });
      fetchRequests();
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err) {
      setError(err.message || 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => { fetchRequests(); }, []);

  return (
    <PageWrapper>
      <Container maxWidth="md">

        {/* ── PAGE HEADER ── */}
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Box sx={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'rgba(139,0,0,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <Favorite sx={{ fontSize: 36, color: '#8B0000' }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#8B0000', mb: 1 }}>
            Request Blood
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 480, mx: 'auto' }}>
            Submit your blood requirement and connect with willing donors in your area.
          </Typography>
        </Box>

        {/* ── FORM SECTION ── */}
        <SectionCard elevation={0}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a0000', mb: 3 }}>
            Fill Request Details
          </Typography>

          {submitSuccess && (
            <Alert
              severity="success"
              sx={{ mb: 3, borderRadius: '10px', fontSize: '0.9rem' }}
              onClose={() => setSubmitSuccess(false)}
            >
              Request submitted! We'll connect you with donors shortly.
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2.5}>

              <Grid item xs={12} sm={6}>
                <StyledTextField
                  fullWidth label="Full Name" name="name"
                  value={form.name} onChange={handleChange} required
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Person /></InputAdornment>
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <StyledTextField
                  fullWidth label="Blood Group" name="bloodGroup"
                  value={form.bloodGroup} onChange={handleChange} required
                  select SelectProps={{ native: true }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Bloodtype /></InputAdornment>
                  }}
                >
                  <option value="" />
                  {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                </StyledTextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <StyledTextField
                  fullWidth label="Contact Number" name="contact"
                  value={form.contact} onChange={handleChange} required
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Phone /></InputAdornment>
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <StyledTextField
                  fullWidth label="Hospital / Location" name="location"
                  value={form.location} onChange={handleChange} required
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><LocationOn /></InputAdornment>
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <StyledTextField
                  fullWidth label="Additional Information" name="reason"
                  value={form.reason} onChange={handleChange}
                  multiline rows={3}
                  placeholder="Describe the urgency or any other details..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                        <Notes />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <SubmitButton
                  type="submit" fullWidth variant="contained"
                  disabled={isSubmitting}
                  startIcon={isSubmitting
                    ? <CircularProgress size={18} color="inherit" />
                    : <Send sx={{ fontSize: 18 }} />}
                >
                  {isSubmitting ? 'Submitting…' : 'Submit Blood Request'}
                </SubmitButton>
              </Grid>

            </Grid>
          </Box>
        </SectionCard>

        {/* ── REQUESTS LIST ── */}
        <SectionCard elevation={0}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a0000' }}>
              Community Requests
            </Typography>
            <Chip
              label={`${requests.length} active`}
              size="small"
              sx={{
                background: 'rgba(139,0,0,0.08)',
                color: '#8B0000',
                fontWeight: 600,
                fontSize: '0.78rem',
              }}
            />
          </Box>

          {isLoadingRequests ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress sx={{ color: '#8B0000' }} />
            </Box>
          ) : requests.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Bloodtype sx={{ fontSize: 48, color: 'rgba(139,0,0,0.15)', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                No blood requests yet. Be the first to post one.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {requests.map((req) => (
                <Grid item xs={12} sm={6} key={req._id}>
                  <RequestCard elevation={0}>
                    <CardContent sx={{ p: 2.5 }}>

                      {/* Top row: avatar + name */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                        <BloodBadge bg={BLOOD_COLORS[req.bloodGroup]}>
                          {req.bloodGroup}
                        </BloodBadge>
                        <Box>
                          <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#1a0000' }}>
                            {req.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Blood needed urgently
                          </Typography>
                        </Box>
                      </Box>

                      <Divider sx={{ mb: 1.5, borderColor: 'rgba(139,0,0,0.06)' }} />

                      {/* Info rows */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                        <InfoRow>
                          <Phone sx={{ fontSize: 15, color: '#8B0000' }} />
                          {req.contact}
                        </InfoRow>
                        <InfoRow>
                          <LocationOn sx={{ fontSize: 15, color: '#8B0000' }} />
                          {req.location}
                        </InfoRow>
                        {req.reason && (
                          <Typography variant="caption" sx={{
                            color: 'text.secondary', mt: 0.5,
                            background: 'rgba(139,0,0,0.04)',
                            borderRadius: '8px', px: 1.5, py: 0.8,
                            display: 'block', lineHeight: 1.5,
                          }}>
                            {req.reason}
                          </Typography>
                        )}
                        <InfoRow sx={{ mt: 0.5 }}>
                          <AccessTime sx={{ fontSize: 13, color: '#aaa' }} />
                          <Typography variant="caption" sx={{ color: '#aaa' }}>
                            {formatDistanceToNow(new Date(req.createdAt), { addSuffix: true })}
                          </Typography>
                        </InfoRow>
                      </Box>

                    </CardContent>
                  </RequestCard>
                </Grid>
              ))}
            </Grid>
          )}
        </SectionCard>

      </Container>
    </PageWrapper>
  );
};

export default RequestBlood;