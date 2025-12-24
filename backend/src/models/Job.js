const mongoose = require("mongoose");

// Application Schema
const applicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userPhone: {
    type: String,
    default: ""
  },
  resume: {
    type: String,
    required: true
  },
  coverLetter: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    enum: ["Pending", "Reviewed", "Shortlisted", "Rejected", "Accepted"],
    default: "Pending"
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    default: ""
  }
}, { _id: true });

// Job Schema
const jobSchema = new mongoose.Schema({
  // Job Basic Information
  jobTitle: {
    type: String,
    required: true,
    trim: true
  },
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  companyLogo: {
    type: String,
    default: ""
  },
  
  // Job Details - IMPORTANT: 'Fresher' ઉમેરો
  jobType: {
    type: String,
    enum: ["Full-time", "Part-time", "Contract", "Temporary", "Internship", "Remote"],
    default: "Full-time"
  },
  experienceLevel: {
    type: String,
    enum: ["Fresher", "Entry Level", "Mid Level", "Senior Level", "Executive", "Internship"],
    default: "Mid Level"
  },
  salaryRange: {
    type: String,
    default: ""
  },
  currency: {
    type: String,
    default: "₹"
  },
  
  // Location & Work Setup
  location: {
    type: String,
    required: true,
    trim: true
  },
  workLocation: {
    type: String,
    enum: ["On-site", "Hybrid", "Remote"],
    default: "On-site"
  },
  
  // Job Description
  jobDescription: {
    type: String,
    required: true
  },
  responsibilities: {
    type: [String],
    default: []
  },
  requirements: {
    type: String,
    default: ""
  },
  qualifications: {
    type: String,
    default: ""
  },
  
  // Benefits
  benefits: {
    type: [String],
    default: []
  },
  
  // Application Details
  applicationDeadline: {
    type: Date
  },
  applicationLink: {
    type: String,
    default: ""
  },
  applicationEmail: {
    type: String,
    default: ""
  },
  
  // Job Category
  department: {
    type: String,
    default: ""
  },
  category: {
    type: String,
    default: ""
  },
  tags: {
    type: [String],
    default: []
  },
  
  // Contact Information
  contactPerson: {
    type: String,
    default: ""
  },
  contactEmail: {
    type: String,
    default: ""
  },
  contactPhone: {
    type: String,
    default: ""
  },
  
  // Posted By (Admin)
  postedBy: {
    type: String,
    required: true
  },
  postedByEmail: {
    type: String,
    default: ""
  },
  postedById: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin"
  },
  
  // Additional Settings
  isUrgent: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ["Draft", "Active", "Published", "Closed", "Expired"],
    default: "Active"
  },
  
  // Statistics
  views: {
    type: Number,
    default: 0
  },
 
  
  // Timestamps
  postedDate: {
    type: Date,
    default: Date.now
  },
  updatedDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better performance
jobSchema.index({ status: 1, postedDate: -1 });
jobSchema.index({ jobType: 1, location: 1 });
jobSchema.index({ 'jobApplications.userId': 1 });
jobSchema.index({ jobTitle: 'text', companyName: 'text', location: 'text' });

 
// Create the model
const Job = mongoose.model("Job", jobSchema);

module.exports = Job;