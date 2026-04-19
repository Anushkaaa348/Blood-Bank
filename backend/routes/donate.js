const nodemailer = require('nodemailer');
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const DonationCenter = require('../models/DonationCenter');

const isAdmin = (req) => req.header('x-admin-secret') === process.env.ADMIN_SECRET;

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'nirmal.chaturvedi@mitaoe.ac.in',
    pass: 'zcau uxom rhuo vlwj'
  }
});

// ── CREATE CENTER ─────────────────────────────────────────────────────────────
router.post('/centers', [
  check('name').notEmpty().withMessage('Name is required'),
  check('address').notEmpty().withMessage('Address is required'),
  check('phone').notEmpty().withMessage('Phone is required'),
  check('hours').notEmpty().withMessage('Hours is required'),
  check('city').notEmpty().withMessage('City is required'),
  check('state').notEmpty().withMessage('State is required'),
  check('zipCode').notEmpty().withMessage('Zip code is required'),
  check('location.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Location coordinates [lng, lat] are required'),
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
    const centerData = {
      name: req.body.name,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      zipCode: req.body.zipCode,
      phone: req.body.phone,
      hours: req.body.hours,
      location: {
        type: 'Point',
        coordinates: [
          parseFloat(req.body.location.coordinates[0]),
          parseFloat(req.body.location.coordinates[1])
        ]
      },
      services: req.body.services || []
    };

    const newCenter = new DonationCenter(centerData);
    await newCenter.save();

    res.status(201).json({ success: true, data: newCenter });
  } catch (err) {
    console.error('Create error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ── GET ALL CENTERS (with optional zip / geo search) ─────────────────────────
router.get('/centers', [
  check('zip').optional().isLength({ min: 6, max: 6 }).isNumeric().withMessage('Invalid ZIP code'),
  check('lat').optional().isFloat({ min: -90,  max: 90  }).withMessage('Invalid latitude'),
  check('lng').optional().isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  check('radius').optional().isInt({ min: 1, max: 100 }).withMessage('Radius must be 1-100 km')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    let centers;

    if (req.query.zip) {
      centers = await DonationCenter.find({ zipCode: req.query.zip }).limit(50).lean();
    } else if (req.query.lat && req.query.lng) {
      const radius = req.query.radius || 10;
      centers = await DonationCenter.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(req.query.lng), parseFloat(req.query.lat)]
            },
            $maxDistance: radius * 1000
          }
        }
      }).limit(50).lean();
    } else {
      centers = await DonationCenter.find().limit(20).lean();
    }

    res.json({
      success: true,
      count: centers.length,
      data: centers.map(center => ({
        id: center._id,
        name: center.name,
        address: `${center.address}, ${center.city}, ${center.state} ${center.zipCode}`,
        location: center.location?.coordinates,
        hours: center.hours,
        phone: center.phone,
        services: center.services
      }))
    });
  } catch (error) {
    console.error('Database Error:', error);
    res.status(500).json({ success: false, error: 'Server Error', message: error.message });
  }
});

// ── GET SINGLE CENTER ─────────────────────────────────────────────────────────
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

// ── UPDATE CENTER ─────────────────────────────────────────────────────────────
router.put('/centers/:id', [
  check('name').optional().notEmpty(),
  check('address').optional().notEmpty(),
  check('phone').optional().notEmpty(),
  check('hours').optional().notEmpty()
], async (req, res) => {
  if (!isAdmin(req)) {
    return res.status(403).json({ success: false, error: 'Unauthorized' });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { name, address, city, state, zipCode, location, hours, phone, services } = req.body;

    if (location) {
      if (!location.coordinates || !Array.isArray(location.coordinates) || location.coordinates.length !== 2) {
        return res.status(400).json({ success: false, error: 'Location must have coordinates array [lng, lat]' });
      }
    }

    const updateData = {
      ...(name     && { name }),
      ...(address  && { address }),
      ...(city     && { city }),
      ...(state    && { state }),
      ...(zipCode  && { zipCode }),
      ...(hours    && { hours }),
      ...(phone    && { phone }),
      ...(services && { services: Array.isArray(services) ? services : [services] }),
      ...(location && {
        location: {
          type: 'Point',
          coordinates: [
            parseFloat(location.coordinates[0]),
            parseFloat(location.coordinates[1])
          ]
        }
      })
    };

    const center = await DonationCenter.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!center) {
      return res.status(404).json({ success: false, error: 'Center not found' });
    }

    res.json({ success: true, data: center });
  } catch (error) {
    console.error('Error updating center:', error);
    res.status(500).json({
      success: false,
      error: error.name === 'ValidationError' ? error.message : 'Server error'
    });
  }
});

// ── DELETE CENTER ─────────────────────────────────────────────────────────────
router.delete('/centers/:id', async (req, res) => {
  if (!isAdmin(req)) {
    return res.status(403).json({ success: false, error: 'Unauthorized' });
  }

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

// ── SCHEDULE DONATION ─────────────────────────────────────────────────────────
router.post('/schedule', [
  check('name').notEmpty().withMessage('Name is required'),
  check('email').isEmail().withMessage('Valid email is required'),
  check('phone').isLength({ min: 10, max: 15 }).withMessage('Valid phone number is required'),
  check('date').isISO8601().toDate().withMessage('Valid date is required'),
  check('centerId').isMongoId().withMessage('Valid center ID is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const center = await DonationCenter.findById(req.body.centerId);
    if (!center) {
      return res.status(404).json({ success: false, error: 'Donation center not found' });
    }

    const mailOptions = {
      from: 'nirmal.chaturvedi@mitaoe.ac.in',
      to: req.body.email,
      subject: 'Blood Donation Appointment Confirmation',
      html: `
        <h2>Thank You for Scheduling Your Blood Donation!</h2>
        <p>Here are your appointment details:</p>
        <h3>Donor Information</h3>
        <ul>
          <li><strong>Name:</strong> ${req.body.name}</li>
          <li><strong>Email:</strong> ${req.body.email}</li>
          <li><strong>Phone:</strong> ${req.body.phone}</li>
          <li><strong>Scheduled Date:</strong> ${new Date(req.body.date).toLocaleDateString()}</li>
        </ul>
        <h3>Donation Center Details</h3>
        <ul>
          <li><strong>Center Name:</strong> ${center.name}</li>
          <li><strong>Address:</strong> ${center.address}, ${center.city}, ${center.state} ${center.zipCode}</li>
          <li><strong>Phone:</strong> ${center.phone}</li>
          <li><strong>Hours:</strong> ${center.hours}</li>
        </ul>
        <p>Please arrive 15 minutes before your scheduled time and bring a valid ID.</p>
        <p>Thank you for saving lives!</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Donation scheduled successfully. Confirmation sent to your email.',
      data: {
        ...req.body,
        centerDetails: {
          name: center.name,
          address: `${center.address}, ${center.city}, ${center.state} ${center.zipCode}`,
          phone: center.phone
        }
      }
    });
  } catch (error) {
    console.error('Schedule error:', error);
    res.status(500).json({ success: false, error: 'Failed to schedule donation. Please try again.' });
  }
});

module.exports = router;