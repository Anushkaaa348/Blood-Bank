const mongoose = require('mongoose');

const donationCenterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  hours: { type: String, required: true },
  phone: { type: String, required: true },
  services: { type: [String], required: true }
}, { 
  timestamps: true, // Adds createdAt and updatedAt automatically
  versionKey: false // Removes the __v field
});

// Create geospatial index
donationCenterSchema.index({ location: '2dsphere' });
donationCenterSchema.index({
  name: 'text',
  address: 'text',
  city: 'text',
  state: 'text',
  zipCode: 'text'
});
module.exports = mongoose.model('DonationCenter', donationCenterSchema);