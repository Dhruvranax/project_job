const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ================= REGISTER ADMIN =================
exports.registerAdmin = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      confirmPassword,
      companyName,
      companyType,
      companyWebsite,
      companySize,
      industry,
      companyPan,
      gstNumber,
      companyAddress,
      city,
      state,
      pincode,
      hiringFrequency,
      teamSize,
      monthlyHiringBudget,
      agreeToTerms,
      receiveUpdates
    } = req.body;

    // Basic validation
    if (!fullName || !email || !phone || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing"
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match"
      });
    }

    // Check existing admin
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Admin already exists with this email"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const admin = await Admin.create({
      fullName,
      email,
      phone,
      password: hashedPassword,
      companyName,
      companyType,
      companyWebsite: companyWebsite || "",
      companySize,
      industry,
      companyPan: companyPan || "",
      gstNumber: gstNumber || "",
      companyAddress,
      city,
      state,
      pincode,
      hiringFrequency,
      teamSize: teamSize || "",
      monthlyHiringBudget,
      agreeToTerms: agreeToTerms || false,
      receiveUpdates: receiveUpdates !== undefined ? receiveUpdates : true,
      isVerified: true
    });

    // Response without password
    res.status(201).json({
      success: true,
      message: "Admin registration successful",
      admin: {
        id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        phone: admin.phone,
        companyName: admin.companyName,
        createdAt: admin.createdAt
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: error.message
    });
  }
};

// ================= LOGIN ADMIN =================
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    // Find admin
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        companyName: admin.companyName
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during login",
      error: error.message
    });
  }
};