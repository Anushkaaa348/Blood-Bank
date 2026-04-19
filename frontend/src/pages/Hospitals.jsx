import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  Stack,
} from '@mui/material';
import {
  LocalHospital,
  LocationOn,
  Phone,
  Schedule,
  Bloodtype,
} from '@mui/icons-material';
import { styled } from '@mui/system';

const GradientBox = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #fef6f6 0%, #fff9fb 100%)',
  padding: theme.spacing(8, 0),
}));

const HospitalCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 12,
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  '&:hover': {
    transform: 'translateY(-6px)',
    boxShadow: '0 12px 28px rgba(211, 47, 47, 0.18)',
  },
}));

const apiBase =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '');

const Hospitals = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${apiBase}/api/donations/centers`);
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error || 'Failed to load hospitals');
        }
        const list = json.data ?? json;
        if (!cancelled) {
          setItems(Array.isArray(list) ? list : []);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.message || 'Could not load hospitals');
          setItems([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <GradientBox>
      <Container maxWidth="lg">
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Bloodtype sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" fontWeight={700}>
              Hospitals & blood centres
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Partner facilities where you can donate or request support ({items.length}{' '}
              listed)
            </Typography>
          </Box>
        </Stack>

        {loading && (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error} — ensure the backend is running and MongoDB is connected.
          </Alert>
        )}

        {!loading && !error && items.length === 0 && (
          <Alert severity="info">No centres found. Run the Python seed script to add data.</Alert>
        )}

        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
          }}
        >
          {items.map((h) => (
            <HospitalCard key={h._id} elevation={2}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mb: 2 }}>
                  <LocalHospital color="primary" />
                  <Typography variant="h6" component="h2" fontWeight={600}>
                    {h.name}
                  </Typography>
                </Stack>

                <Stack spacing={1.2}>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <LocationOn fontSize="small" color="action" sx={{ mt: 0.2 }} />
                    <Typography variant="body2" color="text.secondary">
                      {h.address}, {h.city}, {h.state} {h.zipCode}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Phone fontSize="small" color="action" />
                    <Typography variant="body2">{h.phone}</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <Schedule fontSize="small" color="action" sx={{ mt: 0.2 }} />
                    <Typography variant="body2" color="text.secondary">
                      {h.hours}
                    </Typography>
                  </Stack>
                </Stack>

                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(h.services || []).map((s) => (
                    <Chip key={s} label={s} size="small" variant="outlined" color="primary" />
                  ))}
                </Box>
              </CardContent>
            </HospitalCard>
          ))}
        </Box>
      </Container>
    </GradientBox>
  );
};

export default Hospitals;
