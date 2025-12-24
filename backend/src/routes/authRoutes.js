const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ✅ Test Route - આ route છે જ નહીં તો create કરો
router.get('/test', (req, res) => {
  console.log("Test route accessed");
  res.json({ 
    success: true,
    message: 'Auth API is working!',
    timestamp: new Date().toISOString()
  });
});

// ✅ Admin Login Route
router.post('/admin-login', async (req, res) => {
  try {
    console.log("📥 Admin login request received");
    console.log("Email:", req.body.email);
    
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }
    
    // Check if admin exists
    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    
    if (!admin) {
      console.log("❌ Admin not found:", email);
      return res.status(404).json({
        success: false,
        message: 'Admin not found. Please register first.'
      });
    }
    
    console.log("✅ Admin found:", admin.fullName);
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    
    if (!isPasswordValid) {
      console.log("❌ Invalid password for:", email);
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { 
        id: admin._id,
        email: admin.email,
        role: 'admin' 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    console.log("✅ Login successful for:", admin.fullName);
    
    // Send response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        _id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        phone: admin.phone,
        companyName: admin.companyName,
        companyType: admin.companyType,
        companyWebsite: admin.companyWebsite,
        companySize: admin.companySize,
        industry: admin.industry,
        companyPan: admin.companyPan,
        gstNumber: admin.gstNumber,
        companyAddress: admin.companyAddress,
        city: admin.city,
        state: admin.state,
        pincode: admin.pincode,
        hiringFrequency: admin.hiringFrequency,
        teamSize: admin.teamSize,
        createdAt: admin.createdAt
      }
    });
    
  } catch (error) {
    console.error('🔥 Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      error: error.message
    });
  }
});

// ✅ All admins route (for testing)
router.get('/admins', async (req, res) => {
  try {
    const admins = await Admin.find({}, '-password');
    res.json({
      success: true,
      count: admins.length,
      admins
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;