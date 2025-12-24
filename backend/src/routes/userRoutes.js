const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

// Import models
const User = require("../models/User");

// ✅ User Registration
router.post("/register", async (req, res) => {
  try {
    console.log("📝 User registration attempt for:", req.body.email);
    console.log("Received data:", req.body);
    
    const { 
      firstName, lastName, email, phone, password
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields: firstName, lastName, email, phone, password"
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email"
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const userData = {
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      role: 'user', // Default role
      createdAt: new Date()
    };

    const user = await User.create(userData);
    
    console.log("✅ User registered successfully:", user.email);

    // Prepare response (remove password)
    const userResponse = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive || true,
      createdAt: user.createdAt
    };

    res.status(201).json({
      success: true,
      message: "User registered successfully!",
      user: userResponse
    });

  } catch (error) {
    console.error("❌ User registration error:", error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already exists. Please use a different email."
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error registering user. Please try again.",
      error: error.message
    });
  }
});

// ✅ User Login
router.post("/login", async (req, res) => {
  try {
    console.log("📝 User login attempt for:", req.body.email);
    
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password"
      });
    }

    // Find user
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Prepare response
    const userResponse = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive || true,
      createdAt: user.createdAt
    };

    res.status(200).json({
      success: true,
      message: "Login successful!",
      user: userResponse
    });

  } catch (error) {
    console.error("User login error:", error);
    res.status(500).json({
      success: false,
      message: "Error logging in. Please try again.",
      error: error.message
    });
  }
});

// Test endpoint
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "User API is working",
    timestamp: new Date().toISOString()
  });
});

module.exports = router;