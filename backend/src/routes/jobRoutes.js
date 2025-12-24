const express = require("express");
const router = express.Router();
const Job = require("../models/Job");
const User = require("../models/User");
const Application = require("../models/Application");

// ✅ GET ALL JOBS WITH FILTERS
router.get("/", async (req, res) => {
  try {
    console.log("📋 Fetching jobs with filters...");
    console.log("Query params:", req.query);
    
    const { search, jobType, location, experienceLevel } = req.query;
    
    // Build query
    let query = { status: { $in: ["Active", "Published"] } };
    
    if (search) {
      query.$or = [
        { jobTitle: { $regex: search, $options: "i" } },
        { companyName: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } }
      ];
    }
    
    if (jobType) query.jobType = jobType;
    if (location) query.location = { $regex: location, $options: "i" };
    if (experienceLevel) query.experienceLevel = experienceLevel;
    
    const jobs = await Job.find(query)
      .sort({ postedDate: -1 })
      .limit(100)
      .lean();
    
    console.log(`✅ Found ${jobs.length} jobs`);
    
    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs: jobs
    });
  } catch (error) {
    console.error("❌ Error fetching jobs:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching jobs",
      error: error.message
    });
  }
});

// ✅ GET ACTIVE JOBS
router.get("/active", async (req, res) => {
  try {
    console.log("📋 Fetching active jobs...");
    
    const jobs = await Job.find({ 
      status: { $in: ["Active", "Published"] }
    })
    .sort({ postedDate: -1 })
    .limit(20)
    .lean();
    
    console.log(`✅ Found ${jobs.length} active jobs`);
    
    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs: jobs
    });
  } catch (error) {
    console.error("❌ Error fetching active jobs:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching jobs",
      error: error.message
    });
  }
});

// ✅ GET SINGLE JOB BY ID
router.get("/:id", async (req, res) => {
  try {
    const jobId = req.params.id;
    console.log(`📋 Fetching job ID: ${jobId}`);
    
    // Increment views
    await Job.findByIdAndUpdate(
      jobId,
      { $inc: { views: 1 } }
    );
    
    const job = await Job.findById(jobId).lean();
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }
    
    console.log(`✅ Job found: ${job.jobTitle}`);
    
    res.status(200).json({
      success: true,
      job: job
    });
  } catch (error) {
    console.error("❌ Error fetching job:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching job",
      error: error.message
    });
  }
});

// ✅ CREATE NEW JOB (For Admin)
router.post("/", async (req, res) => {
  try {
    const jobData = req.body;
    
    console.log(`📝 Creating new job: ${jobData.jobTitle}`);
    console.log('Job data:', jobData);
    
    // Validate experienceLevel
    const validExperienceLevels = ["Fresher", "Entry Level", "Mid Level", "Senior Level", "Executive", "Internship"];
    if (jobData.experienceLevel && !validExperienceLevels.includes(jobData.experienceLevel)) {
      return res.status(400).json({
        success: false,
        message: `Invalid experience level. Must be one of: ${validExperienceLevels.join(', ')}`
      });
    }
    
    // Validate jobType
    const validJobTypes = ["Full-time", "Part-time", "Contract", "Temporary", "Internship", "Remote"];
    if (jobData.jobType && !validJobTypes.includes(jobData.jobType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid job type. Must be one of: ${validJobTypes.join(', ')}`
      });
    }
    
    // Create job
    const job = await Job.create({
      ...jobData,
      status: jobData.status || "Active",
      views: 0,
      postedDate: new Date(),
      updatedDate: new Date()
    });
    
    console.log(`✅ Job created successfully: ${job._id}`);
    
    res.status(201).json({
      success: true,
      message: "Job posted successfully",
      job: job
    });
  } catch (error) {
    console.error("❌ Error creating job:", error);
    res.status(500).json({
      success: false,
      message: "Error creating job",
      error: error.message
    });
  }
});

// ✅ APPLY FOR JOB (Fixed for Applications Collection)
router.post("/:id/apply", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, userName, userEmail, userPhone, resume, coverLetter } = req.body;
    
    console.log("======= JOB APPLICATION START =======");
    console.log(`📝 User ${userId} applying for job ${id}`);
    console.log("Application data:", { userId, userName, userEmail });
    
    // Validate required fields
    if (!userId || !userName || !userEmail || !resume) {
      console.log("❌ Missing required fields");
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userId, userName, userEmail, and resume are required"
      });
    }
    
    // 1. Check if job exists
    const job = await Job.findById(id);
    
    if (!job) {
      console.log("❌ Job not found");
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }
    
    console.log(`✅ Job found: ${job.jobTitle} at ${job.companyName}`);
    
    // 2. Check if job is active
    if (!["Active", "Published"].includes(job.status)) {
      console.log("❌ Job not active");
      return res.status(400).json({
        success: false,
        message: "This job is no longer accepting applications"
      });
    }
    
    // 3. Check if user has already applied
    const existingApplication = await Application.findOne({
      userId: userId,
      jobId: id
    });
    
    if (existingApplication) {
      console.log("❌ User already applied");
      return res.status(400).json({
        success: false,
        message: "You have already applied for this job"
      });
    }
    
    // 4. Get user details from database (optional)
    let user = null;
    try {
      user = await User.findById(userId);
      if (user) {
        console.log(`✅ User found: ${user.email}`);
      }
    } catch (err) {
      console.log("⚠️ User not found in database, using provided data");
    }
    
    // 5. Create application in applications collection
    const application = await Application.create({
      userId: userId,
      jobId: id,
      jobTitle: job.jobTitle,
      companyName: job.companyName,
      userEmail: userEmail || (user ? user.email : ""),
      userName: userName || (user ? `${user.firstName} ${user.lastName}` : "Applicant"),
      userPhone: userPhone || (user ? user.phone : ""),
      resume: resume,
      coverLetter: coverLetter || "",
      status: "Pending",
      appliedAt: new Date()
    });
    
    console.log(`✅ Application saved successfully: ${application._id}`);
    console.log(`Saved in applications collection`);
    
    // 6. Update applications count in job
    await Job.findByIdAndUpdate(id, {
      $inc: { applications: 1 },
      updatedDate: new Date()
    });
    
    console.log(`✅ Job applications count updated`);
    console.log("======= JOB APPLICATION END =======");
    
    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      application: application
    });
    
  } catch (error) {
    console.error("❌ Error applying for job:", error);
    console.error("Error details:", error.message);
    
    // Check if it's a duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You have already applied for this job"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error submitting application",
      error: error.message
    });
  }
});

// ✅ GET USER'S APPLICATIONS
router.get("/user/applications/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log(`📋 Fetching applications for user ${userId}`);
    
    // Find all applications for this user
    const applications = await Application.find({ userId: userId })
      .sort({ appliedAt: -1 })
      .populate("jobId", "jobTitle companyName location jobType salaryRange")
      .lean();
    
    console.log(`✅ Found ${applications.length} applications for user ${userId}`);
    
    // Format response
    const formattedApplications = applications.map(app => ({
      applicationId: app._id,
      jobId: app.jobId?._id || app.jobId,
      jobTitle: app.jobTitle || (app.jobId?.jobTitle || "N/A"),
      companyName: app.companyName || (app.jobId?.companyName || "N/A"),
      location: app.jobId?.location || "N/A",
      jobType: app.jobId?.jobType || "N/A",
      salaryRange: app.jobId?.salaryRange || "N/A",
      status: app.status,
      appliedAt: app.appliedAt,
      resume: app.resume,
      coverLetter: app.coverLetter
    }));
    
    res.status(200).json({
      success: true,
      count: formattedApplications.length,
      applications: formattedApplications
    });
  } catch (error) {
    console.error("❌ Error fetching applications:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching applications",
      error: error.message
    });
  }
});

// ✅ GET JOB APPLICATIONS (For Admin)
router.get("/:id/applications", async (req, res) => {
  try {
    const jobId = req.params.id;
    
    console.log(`📋 Fetching applications for job ${jobId}`);
    
    // Get job details
    const job = await Job.findById(jobId).select("jobTitle companyName").lean();
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }
    
    // Get applications for this job
    const applications = await Application.find({ jobId: jobId })
      .sort({ appliedAt: -1 })
      .lean();
    
    console.log(`✅ Found ${applications.length} applications for job ${job.jobTitle}`);
    
    res.status(200).json({
      success: true,
      jobTitle: job.jobTitle,
      companyName: job.companyName,
      count: applications.length,
      applications: applications
    });
  } catch (error) {
    console.error("❌ Error fetching job applications:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching applications",
      error: error.message
    });
  }
});

// ✅ UPDATE APPLICATION STATUS
router.put("/applications/:applicationId", async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;
    
    console.log(`📝 Updating application ${applicationId} to status: ${status}`);
    
    const validStatuses = ["Pending", "Reviewed", "Shortlisted", "Rejected", "Accepted"];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }
    
    const application = await Application.findByIdAndUpdate(
      applicationId,
      { status: status },
      { new: true }
    );
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }
    
    console.log(`✅ Application status updated to ${status}`);
    
    res.status(200).json({
      success: true,
      message: "Application status updated successfully",
      application: application
    });
  } catch (error) {
    console.error("❌ Error updating application:", error);
    res.status(500).json({
      success: false,
      message: "Error updating application",
      error: error.message
    });
  }
});

// ✅ CHECK IF USER HAS APPLIED FOR A JOB
router.get("/:jobId/check-application/:userId", async (req, res) => {
  try {
    const { jobId, userId } = req.params;
    
    console.log(`🔍 Checking if user ${userId} applied for job ${jobId}`);
    
    const application = await Application.findOne({
      userId: userId,
      jobId: jobId
    });
    
    const hasApplied = !!application;
    
    console.log(`✅ Check complete: ${hasApplied ? 'Applied' : 'Not applied'}`);
    
    res.status(200).json({
      success: true,
      hasApplied: hasApplied,
      application: application
    });
  } catch (error) {
    console.error("❌ Error checking application:", error);
    res.status(500).json({
      success: false,
      message: "Error checking application status",
      error: error.message
    });
  }
});

// ✅ DELETE JOB (Admin only)
router.delete("/:id", async (req, res) => {
  try {
    const jobId = req.params.id;
    
    console.log(`🗑️ Deleting job ${jobId}`);
    
    // First, delete all applications for this job
    await Application.deleteMany({ jobId: jobId });
    console.log(`✅ Deleted all applications for job ${jobId}`);
    
    // Then delete the job
    const job = await Job.findByIdAndDelete(jobId);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }
    
    console.log(`✅ Job deleted successfully: ${job.jobTitle}`);
    
    res.status(200).json({
      success: true,
      message: "Job deleted successfully",
      job: job
    });
  } catch (error) {
    console.error("❌ Error deleting job:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting job",
      error: error.message
    });
  }
});

// ✅ UPDATE JOB
router.put("/:id", async (req, res) => {
  try {
    const jobId = req.params.id;
    const updateData = req.body;
    
    console.log(`📝 Updating job ${jobId}`);
    
    // Add updated date
    updateData.updatedDate = new Date();
    
    const job = await Job.findByIdAndUpdate(
      jobId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }
    
    console.log(`✅ Job updated successfully: ${job.jobTitle}`);
    
    res.status(200).json({
      success: true,
      message: "Job updated successfully",
      job: job
    });
  } catch (error) {
    console.error("❌ Error updating job:", error);
    res.status(500).json({
      success: false,
      message: "Error updating job",
      error: error.message
    });
  }
});

module.exports = router;