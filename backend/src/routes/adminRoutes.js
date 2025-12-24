const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

// Import models
const Admin = require("../models/Admin");

// ✅ Test Route
router.get("/test", (req, res) => {
  console.log("✅ Admin test route accessed");
  res.json({ 
    success: true,
    message: 'Admin API is working!',
    timestamp: new Date().toISOString()
  });
});

// ✅ Admin Registration (FIXED - No duplicate key error)
router.post("/register", async (req, res) => {
  try {
    console.log("📝 Admin registration attempt:", req.body.email);
    
    const { 
      fullName, email, phone, password,
      companyName, companyType, companySize, industry,
      companyAddress, city, state, pincode,
      hiringFrequency, monthlyHiringBudget,
      agreeToTerms 
    } = req.body;

    // Basic validation
    if (!fullName || !email || !phone || !password || !companyName || !companyType || !companySize || !industry) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields"
      });
    }

    if (!agreeToTerms) {
      return res.status(400).json({
        success: false,
        message: "You must agree to the terms and conditions"
      });
    }

    // Check if admin already exists by email
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase().trim() });
    
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Admin already exists with this email"
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new admin
    const adminData = {
      fullName,
      email: email.toLowerCase().trim(),
      phone,
      password: hashedPassword,
      companyName,
      companyType,
      companySize,
      industry,
      // ✅ FIX: Set companyEmail to email value (not empty string)
      companyEmail: email.toLowerCase().trim(),
      companyAddress: companyAddress || "Not provided",
      city: city || "Not provided",
      state: state || "Not provided",
      pincode: pincode || "000000",
      hiringFrequency: hiringFrequency || "Not specified",
      monthlyHiringBudget: monthlyHiringBudget || "Not specified",
      agreeToTerms: true,
      role: "admin",
      isVerified: true,
      isActive: true
    };

    const admin = await Admin.create(adminData);
    
    console.log("✅ Admin registered successfully:", admin.email);

    // Prepare response (remove password)
    const adminResponse = {
      _id: admin._id,
      fullName: admin.fullName,
      email: admin.email,
      phone: admin.phone,
      companyName: admin.companyName,
      companyType: admin.companyType,
      companySize: admin.companySize,
      industry: admin.industry,
      role: admin.role,
      isVerified: admin.isVerified,
      isActive: admin.isActive,
      createdAt: admin.createdAt
    };

    res.status(201).json({
      success: true,
      message: "Admin registered successfully!",
      admin: adminResponse
    });

  } catch (error) {
    console.error("❌ Admin registration error:", error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      // Check which field caused duplicate
      if (error.keyValue && error.keyValue.email) {
        return res.status(400).json({
          success: false,
          message: "Email already exists"
        });
      }
      return res.status(400).json({
        success: false,
        message: "Duplicate entry error. Please try different details.",
        error: error.keyValue
      });
    }
    
    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error registering admin. Please try again.",
      error: error.message
    });
  }
});

// ✅ Admin Login 
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password"
      });
    }

    // Find admin
    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Check if account is active
    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated. Please contact support."
      });
    }

    // Prepare response
    const adminResponse = {
      _id: admin._id,
      fullName: admin.fullName,
      email: admin.email,
      phone: admin.phone,
      companyName: admin.companyName,
      companyType: admin.companyType,
      companySize: admin.companySize,
      industry: admin.industry,
      role: admin.role,
      isVerified: admin.isVerified,
      isActive: admin.isActive,
      createdAt: admin.createdAt
    };

    res.status(200).json({
      success: true,
      message: "Login successful!",
      admin: adminResponse
    });

  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({
      success: false,
      message: "Error logging in. Please try again.",
      error: error.message
    });
  }
});

// ✅ Admin Login (alternative endpoint)
router.post("/admin-login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }
    
    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found. Please register first.'
      });
    }
    
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }
    
    const adminResponse = {
      _id: admin._id,
      fullName: admin.fullName,
      email: admin.email,
      phone: admin.phone,
      companyName: admin.companyName,
      companyType: admin.companyType,
      companyWebsite: admin.companyWebsite,
      companySize: admin.companySize,
      industry: admin.industry,
      role: admin.role,
      isVerified: admin.isVerified,
      isActive: admin.isActive,
      createdAt: admin.createdAt
    };
    
    res.status(200).json({
      success: true,
      message: 'Admin login successful',
      admin: adminResponse
    });
    
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      error: error.message
    });
  }
});

// ✅ Get admin by ID
router.get("/:id", async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }

    // Prepare response
    const adminResponse = {
      _id: admin._id,
      fullName: admin.fullName,
      email: admin.email,
      phone: admin.phone,
      companyName: admin.companyName,
      companyType: admin.companyType,
      companyWebsite: admin.companyWebsite,
      companySize: admin.companySize,
      industry: admin.industry,
      role: admin.role,
      isVerified: admin.isVerified,
      isActive: admin.isActive,
      createdAt: admin.createdAt
    };

    res.json({
      success: true,
      admin: adminResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching admin",
      error: error.message
    });
  }
});

// ✅ Get all admins (for admin management)
router.get("/", async (req, res) => {
  try {
    const admins = await Admin.find().sort({ createdAt: -1 });
    
    // Remove passwords from all admins
    const adminsResponse = admins.map(admin => ({
      _id: admin._id,
      fullName: admin.fullName,
      email: admin.email,
      phone: admin.phone,
      companyName: admin.companyName,
      companyType: admin.companyType,
      companyWebsite: admin.companyWebsite,
      companySize: admin.companySize,
      industry: admin.industry,
      role: admin.role,
      isVerified: admin.isVerified,
      isActive: admin.isActive,
      createdAt: admin.createdAt
    }));

    res.json({
      success: true,
      count: admins.length,
      admins: adminsResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching admins",
      error: error.message
    });
  }
});

// ✅ Get admin dashboard stats
router.get("/dashboard/stats", async (req, res) => {
  try {
    // Get admin count
    const adminCount = await Admin.countDocuments();
    
    // Get active admins
    const activeAdmins = await Admin.countDocuments({ isActive: true });
    
    // Get recent admins (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentAdmins = await Admin.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    res.json({
      success: true,
      stats: {
        totalAdmins: adminCount,
        activeAdmins: activeAdmins,
        recentAdmins: recentAdmins
      }
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard stats"
    });
  }
});

// ✅ Update admin profile
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    console.log(`📝 Updating admin ID: ${id}`);
    
    // Remove password from update data if present
    if (updateData.password) {
      delete updateData.password;
    }
    
    // Don't allow email change through this endpoint
    if (updateData.email) {
      delete updateData.email;
    }
    
    const admin = await Admin.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }
    
    // Prepare response
    const adminResponse = {
      _id: admin._id,
      fullName: admin.fullName,
      email: admin.email,
      phone: admin.phone,
      companyName: admin.companyName,
      companyType: admin.companyType,
      companyWebsite: admin.companyWebsite,
      companySize: admin.companySize,
      industry: admin.industry,
      role: admin.role,
      isVerified: admin.isVerified,
      isActive: admin.isActive,
      createdAt: admin.createdAt
    };
    
    console.log(`✅ Admin updated successfully: ${id}`);
    
    res.status(200).json({
      success: true,
      message: "Admin profile updated successfully",
      admin: adminResponse
    });
  } catch (error) {
    console.error("❌ Admin update error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating admin profile",
      error: error.message
    });
  }
});

// ✅ Change admin password
router.put("/:id/change-password", async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required"
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters"
      });
    }
    
    const admin = await Admin.findById(id);
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }
    
    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, admin.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect"
      });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password
    admin.password = hashedPassword;
    await admin.save();
    
    console.log(`✅ Password changed for admin: ${admin.email}`);
    
    res.status(200).json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (error) {
    console.error("❌ Password change error:", error);
    res.status(500).json({
      success: false,
      message: "Error changing password",
      error: error.message
    });
  }
});

// ✅ Delete admin (soft delete - set isActive to false)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🗑️ Deactivating admin ID: ${id}`);
    
    const admin = await Admin.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }
    
    console.log(`✅ Admin deactivated: ${admin.email}`);
    
    res.status(200).json({
      success: true,
      message: "Admin deactivated successfully"
    });
  } catch (error) {
    console.error("❌ Admin deactivation error:", error);
    res.status(500).json({
      success: false,
      message: "Error deactivating admin",
      error: error.message
    });
  }
});

// ✅ Reactivate admin
router.put("/:id/reactivate", async (req, res) => {
  try {
    const { id } = req.params;
    
    const admin = await Admin.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true }
    );
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }
    
    console.log(`✅ Admin reactivated: ${admin.email}`);
    
    res.status(200).json({
      success: true,
      message: "Admin reactivated successfully",
      admin: {
        _id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        isActive: admin.isActive
      }
    });
  } catch (error) {
    console.error("❌ Admin reactivation error:", error);
    res.status(500).json({
      success: false,
      message: "Error reactivating admin",
      error: error.message
    });
  }
});

// ✅ Check admin email availability
router.get("/check-email/:email", async (req, res) => {
  try {
    const { email } = req.params;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }
    
    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    
    res.status(200).json({
      success: true,
      available: !admin,
      email: email
    });
  } catch (error) {
    console.error("❌ Email check error:", error);
    res.status(500).json({
      success: false,
      message: "Error checking email availability",
      error: error.message
    });
  }
});

// ✅ Admin logout (client-side only, just returns success)
router.post("/logout", async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Logout successful"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error during logout",
      error: error.message
    });
  }
});




// routes/adminRoutes.js (Add this endpoint)
router.get("/dashboard/candidates", async (req, res) => {
  try {
    const totalApplications = await Application.countDocuments();
    
    const statusStats = await Application.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    
    const recentApplications = await Application.find()
      .sort({ appliedAt: -1 })
      .limit(10)
      .populate("jobId", "jobTitle")
      .populate("userId", "firstName lastName")
      .lean();
    
    res.json({
      success: true,
      stats: {
        totalApplications,
        byStatus: statusStats,
        recentApplications: recentApplications.map(app => ({
          id: app._id,
          userName: app.userName,
          jobTitle: app.jobId?.jobTitle || app.jobTitle,
          status: app.status,
          appliedAt: app.appliedAt
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;