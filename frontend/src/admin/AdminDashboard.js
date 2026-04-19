import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Button,
  Box,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Snackbar,
  Grid
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import axios from 'axios';

const ADMIN_SECRET = 'myadmin123';

const AdminDashboard = () => {
  const [data, setData] = useState({
    contacts: [],
    centers: [],
    bloodRequests: []
  });
  const [loading, setLoading] = useState({
    contacts: true,
    centers: true,
    bloodRequests: true
  });
  const [error, setError] = useState({
    contacts: null,
    centers: null,
    bloodRequests: null
  });

  const [openModal, setOpenModal] = useState({
    contacts: false,
    centers: false,
    bloodRequests: false,
    type: null,
    mode: 'add'
  });
  const [currentItem, setCurrentItem] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const defaultFormData = {
    contacts: { name: '', email: '', message: '' },
    centers: {
      name: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      hours: '',
      phone: '',
      lng: '',
      lat: '',
      services: ''
    },
    bloodRequests: {
      name: '',
      bloodGroup: '',
      contact: '',
      location: '',
      reason: '',
      status: 'pending'
    }
  };

  const [formData, setFormData] = useState(defaultFormData);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const statusOptions = ['pending', 'in progress', 'fulfilled', 'cancelled'];

  const fetchAllData = async () => {
    setLoading({ contacts: true, centers: true, bloodRequests: true });
    setError({ contacts: null, centers: null, bloodRequests: null });

    try {
      const [contactsRes, centersRes, bloodRequestsRes] = await Promise.all([
        fetch('http://localhost:5000/api/contacts'),
        fetch('http://localhost:5000/api/donations/centers'),
        fetch('http://localhost:5000/api/blood-requests')
      ]);

      const contactsData   = await processResponse(contactsRes,      'contacts');
      const centersData    = await processResponse(centersRes,        'centers');
      const bloodRequestsData = await processResponse(bloodRequestsRes, 'bloodRequests');

      setData({
        contacts:      contactsData.data      || contactsData,
        centers:       centersData.data       || centersData,
        bloodRequests: bloodRequestsData.data || bloodRequestsData
      });
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  const processResponse = async (response, endpoint) => {
    try {
      if (!response.ok) throw new Error(`${endpoint}: ${response.statusText}`);
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        const text = await response.text();
        throw new Error(`${endpoint}: Expected JSON but got ${text.substring(0, 50)}`);
      }
      const jsonData = await response.json();
      setLoading(prev => ({ ...prev, [endpoint]: false }));
      return jsonData;
    } catch (err) {
      setError(prev => ({ ...prev, [endpoint]: err.message }));
      setLoading(prev => ({ ...prev, [endpoint]: false }));
      return { data: [] };
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [openModal.type]: {
        ...prev[openModal.type],
        [name]: value
      }
    }));
  };

  const handleOpenModal = (type, mode = 'add', item = null) => {
    setOpenModal({ ...openModal, [type]: true, type, mode });
    if (mode === 'edit' && item) {
      setCurrentItem(item);
      // Flatten location coordinates for edit mode
      setFormData(prev => ({
        ...prev,
        [type]: {
          ...item,
          lng: item.location?.coordinates?.[0] ?? '',
          lat: item.location?.coordinates?.[1] ?? '',
          services: Array.isArray(item.services) ? item.services.join(', ') : (item.services || '')
        }
      }));
    } else {
      setCurrentItem(null);
      setFormData(prev => ({ ...prev, [type]: defaultFormData[type] }));
    }
  };

  const handleCloseModal = () => {
    setOpenModal(prev => ({ ...prev, [prev.type]: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { type, mode } = openModal;

    const endpointMap = {
      contacts:      'contacts',
      centers:       'donations/centers',
      bloodRequests: 'blood-requests'
    };

    try {
      let body = { ...formData[type] };

      // For centers, build the proper location object and clean up temp fields
      if (type === 'centers') {
        const lng = parseFloat(body.lng);
        const lat = parseFloat(body.lat);

        if (isNaN(lng) || isNaN(lat)) {
          showSnackbar('Please enter valid longitude and latitude values', 'error');
          return;
        }

        body.location = {
          type: 'Point',
          coordinates: [lng, lat]
        };

        // Convert services string to array
        body.services = body.services
          ? body.services.split(',').map(s => s.trim()).filter(Boolean)
          : [];

        // Remove temp fields
        delete body.lng;
        delete body.lat;
      }

      const url = `http://localhost:5000/api/${endpointMap[type]}${mode === 'edit' ? `/${currentItem._id}` : ''}`;
      const method = mode === 'add' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': ADMIN_SECRET
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.errors?.[0]?.msg || 'Failed to save data');
      }

      handleCloseModal();
      fetchAllData();
      showSnackbar(`${type.slice(0, -1)} ${mode === 'add' ? 'added' : 'updated'} successfully`);
    } catch (err) {
      console.error('Save error:', err);
      showSnackbar(err.message, 'error');
    }
  };

  const handleDelete = async (type, id) => {
    const endpointMap = {
      contacts:      'contacts',
      centers:       'donations/centers',
      bloodRequests: 'blood-requests'
    };

    if (!window.confirm(`Are you sure you want to delete this ${type.slice(0, -1)}?`)) return;

    try {
      const response = await fetch(`http://localhost:5000/api/${endpointMap[type]}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': ADMIN_SECRET
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete');
      }

      fetchAllData();
      showSnackbar(`${type.slice(0, -1)} deleted successfully`);
    } catch (err) {
      console.error('Delete error:', err);
      showSnackbar(err.message || 'Failed to delete', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const getBloodTypeColor = (type) => {
    const colors = {
      'A+': '#D32F2F', 'A-': '#E53935',
      'B+': '#7B1FA2', 'B-': '#8E24AA',
      'AB+': '#3949AB', 'AB-': '#5C6BC0',
      'O+': '#0288D1', 'O-': '#039BE5',
    };
    return colors[type] || '#757575';
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'fulfilled':   return 'success';
      case 'in progress': return 'info';
      case 'pending':     return 'warning';
      case 'cancelled':   return 'error';
      default:            return 'default';
    }
  };

  const renderFormFields = () => {
    const type = openModal.type;
    if (!type) return null;
    const fields = formData[type];

    switch (type) {
      case 'contacts':
        return (
          <>
            <TextField name="name" label="Name" value={fields.name}
              onChange={handleInputChange} fullWidth margin="normal" required />
            <TextField name="email" label="Email" value={fields.email}
              onChange={handleInputChange} fullWidth margin="normal" required type="email" />
            <TextField name="message" label="Message" value={fields.message}
              onChange={handleInputChange} fullWidth margin="normal" required multiline rows={4} />
          </>
        );

      case 'centers':
        return (
          <>
            <TextField name="name" label="Center Name *" value={fields.name}
              onChange={handleInputChange} fullWidth margin="normal" required />

            <TextField name="address" label="Street Address *" value={fields.address}
              onChange={handleInputChange} fullWidth margin="normal" required multiline rows={2} />

            {/* City / State / Zip on one row */}
            <Grid container spacing={2} sx={{ mt: 0 }}>
              <Grid item xs={12} sm={5}>
                <TextField name="city" label="City *" value={fields.city}
                  onChange={handleInputChange} fullWidth margin="normal" required />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField name="state" label="State *" value={fields.state}
                  onChange={handleInputChange} fullWidth margin="normal" required />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField name="zipCode" label="ZIP Code *" value={fields.zipCode}
                  onChange={handleInputChange} fullWidth margin="normal" required />
              </Grid>
            </Grid>

            <TextField name="hours" label="Operating Hours *" value={fields.hours}
              onChange={handleInputChange} fullWidth margin="normal" required
              placeholder="e.g. Mon–Sun 9:00 AM – 5:00 PM" />

            <TextField name="phone" label="Phone Number *" value={fields.phone}
              onChange={handleInputChange} fullWidth margin="normal" required />

            {/* Coordinates on one row */}
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField name="lng" label="Longitude *" value={fields.lng}
                  onChange={handleInputChange} fullWidth margin="normal" required
                  type="number" placeholder="e.g. 73.8567"
                  helperText="Decimal degrees (East = positive)" />
              </Grid>
              <Grid item xs={6}>
                <TextField name="lat" label="Latitude *" value={fields.lat}
                  onChange={handleInputChange} fullWidth margin="normal" required
                  type="number" placeholder="e.g. 18.5204"
                  helperText="Decimal degrees (North = positive)" />
              </Grid>
            </Grid>

            <TextField name="services" label="Services (optional)" value={fields.services}
              onChange={handleInputChange} fullWidth margin="normal"
              placeholder="e.g. Whole Blood, Platelets, Plasma"
              helperText="Comma-separated list of services offered" />
          </>
        );

      case 'bloodRequests':
        return (
          <>
            <TextField name="name" label="Patient Name" value={fields.name}
              onChange={handleInputChange} fullWidth margin="normal" required />
            <TextField name="bloodGroup" label="Blood Group" value={fields.bloodGroup}
              onChange={handleInputChange} fullWidth margin="normal" required select>
              {bloodGroups.map(group => (
                <MenuItem key={group} value={group}>{group}</MenuItem>
              ))}
            </TextField>
            <TextField name="contact" label="Contact Number" value={fields.contact}
              onChange={handleInputChange} fullWidth margin="normal" required />
            <TextField name="location" label="Hospital/Location" value={fields.location}
              onChange={handleInputChange} fullWidth margin="normal" required />
            <TextField name="reason" label="Reason for Request" value={fields.reason}
              onChange={handleInputChange} fullWidth margin="normal" required multiline rows={3} />
            <TextField name="status" label="Status" value={fields.status}
              onChange={handleInputChange} fullWidth margin="normal" required select>
              {statusOptions.map(status => (
                <MenuItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </MenuItem>
              ))}
            </TextField>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>

      {Object.values(error).some(Boolean) && (
        <Box sx={{ mb: 4 }}>
          {Object.entries(error).map(([key, err]) =>
            err && <Alert key={key} severity="error" sx={{ mb: 2 }}>{err}</Alert>
          )}
          <Button variant="contained" onClick={fetchAllData}>Retry All Data</Button>
        </Box>
      )}

      {/* Contacts Section */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Contact Submissions</Typography>
          <Button variant="contained" startIcon={<Add />}
            onClick={() => handleOpenModal('contacts', 'add')}>
            Add Contact
          </Button>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Message</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.contacts.map(contact => (
                <TableRow key={contact._id}>
                  <TableCell>{contact.name}</TableCell>
                  <TableCell>{contact.email}</TableCell>
                  <TableCell sx={{ maxWidth: 300 }}>
                    {contact.message?.length > 100
                      ? `${contact.message.substring(0, 100)}...`
                      : contact.message}
                  </TableCell>
                  <TableCell>{new Date(contact.createdAt).toLocaleString()}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenModal('contacts', 'edit', contact)}>
                      <Edit color="primary" />
                    </IconButton>
                    <IconButton onClick={() => handleDelete('contacts', contact._id)}>
                      <Delete color="error" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Donation Centers Section */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Donation Centers</Typography>
          <Button variant="contained" startIcon={<Add />}
            onClick={() => handleOpenModal('centers', 'add')}>
            Add Center
          </Button>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Hours</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.centers.map(center => (
                <TableRow key={center._id}>
                  <TableCell>{center.name}</TableCell>
                  <TableCell>
                    {`${center.address || ''}, ${center.city || ''}, ${center.state || ''} ${center.zipCode || ''}`.trim()}
                  </TableCell>
                  <TableCell>{center.hours || 'N/A'}</TableCell>
                  <TableCell>{center.phone || 'N/A'}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenModal('centers', 'edit', center)}>
                      <Edit color="primary" />
                    </IconButton>
                    <IconButton onClick={() => handleDelete('centers', center._id)}>
                      <Delete color="error" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Blood Requests Section */}
      <Paper sx={{ p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Blood Requests</Typography>
          <Button variant="contained" startIcon={<Add />}
            onClick={() => handleOpenModal('bloodRequests', 'add')}>
            Add Request
          </Button>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Blood Group</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.bloodRequests.map(request => (
                <TableRow key={request._id}>
                  <TableCell>{request.name}</TableCell>
                  <TableCell>
                    <Chip label={request.bloodGroup} size="small"
                      sx={{ backgroundColor: getBloodTypeColor(request.bloodGroup), color: 'white' }} />
                  </TableCell>
                  <TableCell>{request.contact}</TableCell>
                  <TableCell>{request.location}</TableCell>
                  <TableCell>
                    <Chip label={request.status || 'Pending'} size="small"
                      color={getStatusColor(request.status)} />
                  </TableCell>
                  <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenModal('bloodRequests', 'edit', request)}>
                      <Edit color="primary" />
                    </IconButton>
                    <IconButton onClick={() => handleDelete('bloodRequests', request._id)}>
                      <Delete color="error" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Modal */}
      <Dialog
        open={!!(openModal.type && openModal[openModal.type])}
        onClose={handleCloseModal}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {openModal.mode === 'add' ? 'Add New' : 'Edit'}{' '}
          {openModal.type === 'bloodRequests' ? 'Blood Request'
            : openModal.type === 'centers' ? 'Center'
            : 'Contact'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>{renderFormFields()}</DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {openModal.mode === 'add' ? 'Add' : 'Update'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={6000}
        onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminDashboard;