require('dotenv').config();

// Fix querySrv ECONNREFUSED on some Windows/network setups when using mongodb+srv://
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
if (
  process.env.MONGO_URI?.startsWith('mongodb+srv://') &&
  process.env.MONGO_DNS_SYSTEM !== '1'
) {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI is not set. Copy backend/.env.example to backend/.env and configure it.');
  process.exit(1);
}

const connectPromise = process.env.DB_NAME
  ? mongoose.connect(process.env.MONGO_URI, { dbName: process.env.DB_NAME })
  : mongoose.connect(process.env.MONGO_URI);

connectPromise
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});
// Routes
const authRoutes = require('./routes/authRoutes');
const aboutRoutes = require('./routes/about');
const contactRoutes = require('./routes/contactRoutes');
const donateRoutes = require('./routes/donate');
const donationRoutes = require('./routes/donationRoutes');
const bloodRequestRoutes = require('./routes/bloodRequestRoutes');
const otpRoutes = require('./routes/otpRoutes');
const userRoutes = require('./routes/user');
app.use('/api/auth', authRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/donate', donateRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/blood-requests', bloodRequestRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/user', userRoutes);
// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: "Backend is working!" });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));