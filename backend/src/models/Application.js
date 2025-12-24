const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  // User Information
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
  
  // Job Information
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true
  },
  jobTitle: {
    type: String,
    required: true
  },
  companyName: {
    type: String,
    required: true
  },
  
  // Application Details
  resume: {
    type: String,
    required: true
  },
  coverLetter: {
    type: String,
    default: ""
  },
  
  // Status
  status: {
    type: String,
    enum: ["Pending", "Reviewed", "Shortlisted", "Rejected", "Accepted"],
    default: "Pending"
  },
  
  // Timestamps
  appliedAt: {
    type: Date,
    default: Date.now
  },
  
  // Additional
  notes: {
    type: String,
    default: ""
  }
}, {
  timestamps: true
});

// Indexes
applicationSchema.index({ userId: 1, jobId: 1 }, { unique: true });
applicationSchema.index({ jobId: 1, status: 1 });
applicationSchema.index({ userId: 1, appliedAt: -1 });

const Application = mongoose.model("Application", applicationSchema);
module.exports = Application;