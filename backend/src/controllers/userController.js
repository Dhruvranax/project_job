// controllers/userController.js
const User = require("../models/User");

// REGISTER
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, number, city } = req.body;

    // Validation
    if (!name || !email || !password || !number || !city) {
      return res.status(400).json({ 
        message: "All fields are required" 
      });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ 
        message: "User already exists with this email" 
      });
    }

    const user = await User.create({
      name,
      email,
      password, // In production, hash the password
      number,
      city
    });

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({ 
      message: "Registered successfully", 
      user: userResponse 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: "Server error" 
    });
  }
};

// LOGIN
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        message: "Email and password are required" 
      });
    }

    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(401).json({ 
        message: "Invalid email or password" 
      });
    }

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ 
      message: "Login successful", 
      user: userResponse 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: "Server error" 
    });
  }
};