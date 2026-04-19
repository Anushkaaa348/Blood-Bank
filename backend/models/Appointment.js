// models/Appointment.js
const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  // User reference (if authenticated)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow anonymous bookings
  },
  
  // Donor details
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: [true, 'Phone is required'],
    trim: true
  },
  
  // Appointment details
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  timeSlot: {
    type: String,
    required: false // Optional time slot
  },
  
  // Center reference
  centerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DonationCenter',
    required: [true, 'Center ID is required']
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  
  // Additional notes
  notes: {
    type: String,
    trim: true
  },
  
  // Confirmation details
  confirmationCode: {
    type: String,
    unique: true
  }
}, {
  timestamps: true
});

// Generate confirmation code before saving
AppointmentSchema.pre('save', function(next) {
  if (!this.confirmationCode) {
    this.confirmationCode = 'BD' + Date.now() + Math.floor(Math.random() * 1000);
  }
  next();
});

module.exports = mongoose.model('Appointment', AppointmentSchema);