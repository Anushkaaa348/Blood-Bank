const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide email'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Please provide password'],
    // REMOVED minlength constraint - it interferes with bcrypt hash storage
    // Validation should be done on the raw password before hashing
    select: false
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Add validation for raw password before hashing
UserSchema.pre('validate', function(next) {
  // Only validate raw password length if password is being modified and not already hashed
  if (this.isModified('password') && this.password && !this.password.startsWith('$2b$')) {
    if (this.password.length < 6) {
      this.invalidate('password', 'Password must be at least 6 characters long');
    }
  }
  next();
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  // Only hash if password is not already hashed
  if (!this.password.startsWith('$2b$')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);