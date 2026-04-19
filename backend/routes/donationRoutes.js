// routes/donationRoutes.js
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const DonationCenter = require('../models/DonationCenter');
const Appointment = require('../models/Appointment');
const { auth } = require('../middleware/auth');

const isAdmin = (req) => req.header('x-admin-secret') === process.env.ADMIN_SECRET;

router.post('/centers', [
  check('name').notEmpty().withMessage('Name is required'),
  check('address').notEmpty().withMessage('Address is required'),
  check('phone').notEmpty().withMessage('Phone is required'),
  check('hours').notEmpty().withMessage('Hours is required'),
  check('city').optional().trim(),
  check('state').optional().trim(),
  check('zipCode').optional().trim(),
  check('location').optional().custom(value => {
    if (value && (!Array.isArray(value.coordinates) || value.coordinates.length !== 2)) {
      throw new Error('Location must be an object with coordinates [lng, lat]');
    }
    return true;
  }),
  check('services').optional().isArray()
], async (req, res) => {
  if (!isAdmin(req)) {
    return res.status(403).json({ success: false, error: 'Unauthorized' });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const newCenter = new DonationCenter(req.body);
    await newCenter.save();

    res.status(201).json({ success: true, data: newCenter });
  } catch (err) {
    console.error('Create error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// UPDATE a donation center
router.put('/centers/:id', [
  check('name').optional().notEmpty().withMessage('Name is required'),
  check('address').optional().notEmpty(),
  check('phone').optional().notEmpty(),
  check('hours').optional().notEmpty()
], async (req, res) => {
  if (!isAdmin(req)) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const updates = req.body;
    const updated = await DonationCenter.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Donation center not found' });
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Error updating donation center:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.delete('/centers/:id', (req, res, next) => {
  const isAdmin = req.header('x-admin-secret') === process.env.ADMIN_SECRET;
  if (!isAdmin) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  next();
}, async (req, res) => {
  try {
    const deleted = await DonationCenter.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Center not found' });
    }

    res.json({ success: true, message: 'Center deleted', id: req.params.id });
  } catch (err) {
    console.error('Error deleting center:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/centers', async (req, res) => {
  try {
    const { zip } = req.query;
    let query = {};
    
    if (zip) {
      query = { zipCode: zip };
    }

    const centers = await DonationCenter.find(query);
    res.json({ 
      success: true, 
      count: centers.length,
      data: centers 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/centers/:id', async (req, res) => {
  try {
    const center = await DonationCenter.findById(req.params.id);
    if (!center) {
      return res.status(404).json({ success: false, error: 'Center not found' });
    }
    res.json({ success: true, data: center });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/schedule', auth, [
  check('name').notEmpty().withMessage('Name is required'),
  check('email').isEmail().withMessage('Valid email is required'),
  check('phone').isLength({ min: 10, max: 15 }).withMessage('Valid phone number is required'),
  check('date').isISO8601().toDate().withMessage('Valid date is required'),
  check('centerId').isMongoId().withMessage('Valid center ID is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }

  try {
    const center = await DonationCenter.findById(req.body.centerId);
    if (!center) {
      return res.status(404).json({ 
        success: false, 
        error: 'Donation center not found' 
      });
    }

    const appointmentData = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      date: req.body.date,
      centerId: req.body.centerId,
      timeSlot: req.body.timeSlot,
      notes: req.body.notes
    };

    if (req.user) {
      appointmentData.userId = req.user._id;
      console.log('Auth middleware set userId:', req.user._id);
    }

    const appointment = await Appointment.create(appointmentData);
    await appointment.populate('centerId');

    console.log('Created appointment:', appointment._id, 'for user:', req.user?.email);

    res.json({ 
      success: true,
      message: 'Donation scheduled successfully',
      data: {
        id: appointment._id,
        confirmationCode: appointment.confirmationCode,
        centerDetails: center
      }
    });
  } catch (error) {
    console.error('Schedule error:', error);
    res.status(500).json({ success: false, error: 'Failed to schedule' });
  }
});

router.get('/appointments', auth, async (req, res) => {
  try {
    console.log('Fetching appointments for:', req.user.email, req.user._id);
    
    const appointments = await Appointment.find({
      $or: [
        { userId: req.user._id },
        { email: req.user.email.toLowerCase() }
      ]
    }).populate('centerId', 'name address city state zipCode phone hours').sort({ date: -1 });

    const data = appointments.map(apt => ({
      _id: apt._id,
      name: apt.name,
      email: apt.email,
      phone: apt.phone,
      date: apt.date,
      timeSlot: apt.timeSlot,
      status: apt.status || 'scheduled',
      notes: apt.notes,
      confirmationCode: apt.confirmationCode,
      centerId: apt.centerId
    }));

    res.json({ success: true, data });
  } catch (error) {
    console.error('Appointments fetch error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch appointments' });
  }
});

router.delete('/appointments', auth, async (req, res) => {
  try {
    const { confirmationCode, email, date } = req.body;
    
    const appointment = await Appointment.findOneAndUpdate(
      {
        confirmationCode,
        email: email.toLowerCase(),
        date: new Date(date),
        status: 'scheduled'
      },
      { status: 'cancelled' },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    res.json({ success: true, message: 'Appointment cancelled' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Cancellation failed' });
  }
});
      

// FIXED: Get single appointment by ID
router.get('/appointments/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      $or: [
        { userId: req.user._id },
        { email: req.user.email }
      ]
    }).populate('centerId');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Fetch single appointment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch appointment'
    });
  }
});

// FIXED: Cancel appointment - Use DELETE method
router.delete('/appointments', auth, async (req, res) => {
  try {
    // Ensure JSON content type
    res.setHeader('Content-Type', 'application/json');

    const { email, date, confirmationCode } = req.body;

    if (!email || !date || !confirmationCode) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: email, date, and confirmationCode'
      });
    }

    const appointment = await Appointment.findOneAndUpdate(
      {
        email: email.toLowerCase(),
        date: new Date(date),
        confirmationCode,
        status: 'scheduled'
      },
      { status: 'cancelled' },
      { new: true }
    ).populate('centerId');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'No matching scheduled appointment found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: appointment._id,
        status: appointment.status,
        center: appointment.centerId?.name
      }
    });

  } catch (error) {
    console.error('Cancellation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
router.put('/appointments/reschedule', auth, async (req, res) => {
  try {
    const { originalConfirmationCode, originalDate, newDate, email } = req.body;

    // Validate inputs
    if (!originalConfirmationCode || !originalDate || !newDate || !email) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Find and validate original appointment
    const originalAppointment = await Appointment.findOne({
      confirmationCode: originalConfirmationCode,
      date: new Date(originalDate),
      email: email.toLowerCase(),
      status: { $in: ['scheduled', 'confirmed'] }
    }).populate('centerId');

    if (!originalAppointment) {
      return res.status(404).json({
        success: false,
        error: 'Original appointment not found or cannot be rescheduled'
      });
    }

    // Check new date availability (implement your own logic)
    const isAvailable = await checkDateAvailability(newDate, originalAppointment.centerId._id);
    if (!isAvailable) {
      return res.status(409).json({
        success: false,
        error: 'Selected time slot is not available'
      });
    }

    // Update appointment
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      originalAppointment._id,
      {
        date: new Date(newDate),
        status: 'rescheduled',
        previousDate: originalAppointment.date // Keep history
      },
      { new: true }
    ).populate('centerId');

    // Send confirmation email (implement your email service)
    await sendRescheduleConfirmation(email, {
      originalDate,
      newDate,
      confirmationCode: originalConfirmationCode,
      center: originalAppointment.centerId.name
    });

    res.status(200).json({
      success: true,
      data: updatedAppointment
    });

  } catch (error) {
    console.error('Rescheduling error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Helper function to check availability
async function checkDateAvailability(date, centerId) {
  // Implement your availability logic
  // Example: Check if appointment count for this timeslot is below capacity
  const existingCount = await Appointment.countDocuments({
    centerId,
    date: new Date(date),
    status: { $in: ['scheduled', 'confirmed'] }
  });
  
  const center = await Center.findById(centerId);
  return existingCount < center.dailyCapacity;
}
// DEBUG ROUTE - Add this temporarily to test
router.get('/debug/user-appointments', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get all appointments to see what's in the database
    const allAppointments = await Appointment.find({});
    
    // Get user's appointments
    const userAppointments = await Appointment.find({
      $or: [
        { userId: userId },
        { email: req.user.email }
      ]
    });
    
    res.json({
      success: true,
      debug: {
        currentUser: {
          id: req.user.id,
          _id: req.user._id,
          email: req.user.email,
          name: req.user.name
        },
        totalAppointments: allAppointments.length,
        userAppointments: userAppointments.length,
        allAppointmentsData: allAppointments.map(apt => ({
          id: apt._id,
          name: apt.name,
          email: apt.email,
          userId: apt.userId,
          userIdType: typeof apt.userId,
          status: apt.status,
          date: apt.date
        })),
        userAppointmentsData: userAppointments.map(apt => ({
          id: apt._id,
          name: apt.name,
          email: apt.email,
          userId: apt.userId,
          status: apt.status,
          date: apt.date
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;