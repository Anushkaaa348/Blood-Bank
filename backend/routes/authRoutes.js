const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const nodemailer = require('nodemailer');
router.get('/verify', authController.verifyToken);
// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Validation middleware
const validateRegister = [
  check('name').notEmpty().withMessage('Name is required'),
  check('email').isEmail().withMessage('Valid email is required'),
  check('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
];

const validateLogin = [
  check('email').isEmail().withMessage('Valid email is required'),
  check('password').notEmpty().withMessage('Password is required')
];

// Routes
router.post('/register', validateRegister, (req, res, next) => {
  req.transporter = transporter;
  authController.register(req, res, next);
});

router.post('/login', validateLogin, (req, res, next) => {
  req.transporter = transporter;
  authController.login(req, res, next);
});

router.post('/send-otp', [
  check('email').isEmail().withMessage('Valid email is required')
], (req, res, next) => {
  req.transporter = transporter;
  authController.sendOtp(req, res, next);
});

router.post('/verify-otp', [
  check('email').isEmail().withMessage('Valid email is required'),
  check('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], (req, res, next) => {
  authController.verifyOtp(req, res, next);
});

module.exports = router;