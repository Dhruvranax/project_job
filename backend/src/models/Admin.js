const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  // Personal Information
  fullName: {
    type: String,
    required: [true, "Full name is required"],
    trim: true
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, "Phone number is required"],
    trim: true
  },
  password: {
    type: String,
    required: [true, "Password is required"]
  },
  
  // Company Information
  companyName: {
    type: String,
    required: [true, "Company name is required"],
    trim: true
  },
  companyType: {
    type: String,
    required: [true, "Company type is required"]
  },
  companyWebsite: {
    type: String,
    default: ""
  },
  companySize: {
    type: String,
    required: [true, "Company size is required"]
  },
  industry: {
    type: String,
    required: [true, "Industry is required"]
  },
  
  // Company Email 
  companyEmail: {
    type: String,
    default: "",
    trim: true
  },
  
  // Verification Information
  companyPan: {
    type: String,
    default: ""
  },
  gstNumber: {
    type: String,
    default: ""
  },
  companyAddress: {
    type: String,
    required: [true, "Company address is required"]
  },
  city: {
    type: String,
    required: [true, "City is required"]
  },
  state: {
    type: String,
    required: [true, "State is required"]
  },
  pincode: {
    type: String,
    required: [true, "Pincode is required"]
  },
  
  // Hiring Needs
  hiringFrequency: {
    type: String,
    required: [true, "Hiring frequency is required"]
  },
  teamSize: {
    type: String,
    default: ""
  },
  monthlyHiringBudget: {
    type: String,
    required: [true, "Monthly hiring budget is required"]
  },
  
  // Terms
  agreeToTerms: {
    type: Boolean,
    required: [true, "You must agree to terms"],
    default: false
  },
  receiveUpdates: {
    type: Boolean,
    default: true
  },
  
  // Account status
  isVerified: {
    type: Boolean,
    default: true // Auto verify admins
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Role
  role: {
    type: String,
    default: "admin",
    enum: ["admin"]
  }
}, {
  timestamps: true // This will auto-create createdAt and updatedAt
});

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;