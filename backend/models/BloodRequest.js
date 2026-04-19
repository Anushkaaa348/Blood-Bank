const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  bloodGroup: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  contact: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  reason: { type: String, trim: true },
  status: {
    type: String,
    enum: ['pending', 'fulfilled', 'cancelled'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

bloodRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const BloodRequest = mongoose.model('BloodRequest', bloodRequestSchema);

module.exports = BloodRequest;
