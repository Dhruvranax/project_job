const User = require("../models/User");

// Admin authentication middleware
const adminAuth = async (req, res, next) => {
  try {
    // Get user ID from request body or query
    const userId = req.body.userId || req.query.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. User ID is missing."
      });
    }
    
    // Find user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }
    
    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required."
      });
    }
    
    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error("Admin auth error:", error);
    res.status(500).json({
      success: false,
      message: "Authentication error."
    });
  }
};

// User authentication middleware (for regular users)
const userAuth = async (req, res, next) => {
  try {
    const userId = req.body.userId || req.query.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required."
      });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }
    
    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated."
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error("User auth error:", error);
    res.status(500).json({
      success: false,
      message: "Authentication error."
    });
  }
};

module.exports = { adminAuth, userAuth };