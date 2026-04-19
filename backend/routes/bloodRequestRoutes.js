const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const BloodRequest = require('../models/BloodRequest');
const { auth } = require('../middleware/auth');

// Supported blood groups
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const STATUS_OPTIONS = ['pending', 'fulfilled', 'cancelled'];
const isAdmin = (req) => {
  const adminKey = req.header('x-admin-secret');
  return adminKey === process.env.ADMIN_SECRET;
};
// @route   GET /api/blood-requests
// @desc    Get all blood requests
// @access  Public
router.get('/', [
  check('bloodGroup').optional().isIn(BLOOD_GROUPS).withMessage('Invalid blood group'),
  check('status').optional().isIn(STATUS_OPTIONS).withMessage('Invalid status'),
  check('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1-100')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }

  try {
    const { bloodGroup, status } = req.query;
    const limit = parseInt(req.query.limit) || 20;

    const query = {};
    if (bloodGroup) query.bloodGroup = bloodGroup;
    if (status) query.status = status;

    const requests = await BloodRequest.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (err) {
    console.error('Error fetching requests:', err);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @route   GET /api/blood-requests/:id
// @desc    Get single blood request by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id).lean();
    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Blood request not found'
      });
    }
    res.json({
      success: true,
      data: request
    });
  } catch (err) {
    console.error('Error fetching request:', err);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @route   POST /api/blood-requests
// @desc    Create new blood request
// @access  Public
router.post('/', [
  check('name').notEmpty().trim().withMessage('Name is required'),
  check('bloodGroup').isIn(BLOOD_GROUPS).withMessage('Invalid blood group'),
  check('contact').notEmpty().trim().withMessage('Contact is required'),
  check('location').notEmpty().trim().withMessage('Location is required'),
  check('reason').optional().trim()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }

  try {
    const { name, bloodGroup, contact, location, reason } = req.body;

    const newRequest = new BloodRequest({
      name,
      bloodGroup,
      contact,
      location,
      reason: reason || '',
      status: 'pending'
    });

    const savedRequest = await newRequest.save();
    
    res.status(201).json({
      success: true,
      data: savedRequest
    });
  } catch (err) {
    console.error('Error creating request:', err);
    res.status(500).json({
      success: false,
      error: err.name === 'ValidationError' ? err.message : 'Server error'
    });
  }
});

// @route   PUT /api/blood-requests/:id
// @desc    Update blood request
// @access  Private (Admin)
// @route   PUT /api/blood-requests/:id
// @desc    Update blood request
// @access  Admin only (via x-admin-secret header)
router.put('/:id', [
  check('status').optional().isIn(STATUS_OPTIONS).withMessage('Invalid status'),
  check('name').optional().notEmpty().trim().withMessage('Name cannot be empty'),
  check('contact').optional().notEmpty().trim().withMessage('Contact cannot be empty'),
  check('location').optional().notEmpty().trim().withMessage('Location cannot be empty'),
  check('reason').optional().trim()
], async (req, res) => {
  if (!isAdmin(req)) {
    return res.status(403).json({ success: false, error: 'Access denied: Admin only' });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }

  try {
    const updates = {};
    const fields = ['name', 'bloodGroup', 'contact', 'location', 'reason', 'status'];
    
    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedRequest = await BloodRequest.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({
        success: false,
        error: 'Blood request not found'
      });
    }

    res.json({
      success: true,
      data: updatedRequest
    });
  } catch (err) {
    console.error('Error updating request:', err);
    res.status(500).json({
      success: false,
      error: err.name === 'ValidationError' ? err.message : 'Server error'
    });
  }
});


// @route   DELETE /api/blood-requests/:id
// @desc    Delete blood request
// @access  Private (Admin)
// Remove auth middleware from DELETE route
// @route   DELETE /api/blood-requests/:id
// @desc    Delete blood request
// @access  Admin only (via x-admin-secret header)
router.delete('/:id', async (req, res) => {
  if (!isAdmin(req)) {
    return res.status(403).json({ success: false, error: 'Access denied: Admin only' });
  }

  try {
    const deletedRequest = await BloodRequest.findByIdAndDelete(req.params.id);

    if (!deletedRequest) {
      return res.status(404).json({
        success: false,
        error: 'Blood request not found'
      });
    }

    res.json({
      success: true,
      data: { id: req.params.id }
    });
  } catch (err) {
    console.error('Error deleting request:', err);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});


module.exports = router;