const express = require('express');
const router = express.Router();
const OTP = require('../models/otpModel'); // Ensure correct path
const { sendEmail } = require('../utils/emailSender');
const crypto = require('crypto');
router.post('/verify', async (req, res) => {
  try {
    const { email, otp } = req.body;

    // 1. Find the OTP record
    const otpRecord = await OTP.findOne({ email });
    
    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "OTP expired or not found"
      });
    }

    // 2. Compare OTPs
    if (otpRecord.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    // 3. Delete OTP after successful verification
    await OTP.deleteOne({ _id: otpRecord._id });

    res.json({
      success: true,
      message: "OTP verified successfully"
    });

  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during verification"
    });
  }
});
router.post('/send', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Verify OTP model is working
    console.log('OTP model:', OTP); // Should show Mongoose model function
    console.log('deleteMany exists:', typeof OTP.deleteMany); // Should be 'function'
    
    const otp = crypto.randomInt(100000, 999999).toString();
    
    // Clear existing OTPs
    await OTP.deleteMany({ email }).exec(); // Add .exec()
    
    // Create new OTP
    await OTP.create({ email, otp });
    
    // Send email
    await sendEmail(email, 'Your OTP Code', `Your OTP is: ${otp}`);
    
    res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("OTP error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;