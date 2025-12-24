// controllers/candidateController.js
const Application = require("../models/Application");
const User = require("../models/User");
const Job = require("../models/Job");
const mongoose = require("mongoose");
const Admin = require("../models/Admin");

// ================= GET CANDIDATES BY ADMIN ID (MAIN FUNCTION) =================
exports.getCandidatesByAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;
    
    console.log(`📋 Fetching candidates for admin ID: ${adminId}`);
    
  if (!adminId || adminId === "undefined" || !mongoose.Types.ObjectId.isValid(adminId)) {
  return res.status(400).json({
    success: false,
    message: "Invalid or missing Admin ID"
  });
}
    
    // Find admin details
    const admin = await Admin.findById(adminId).select('email companyName fullName phone');
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }
    
    console.log(`🔍 Admin Details:`, {
      id: admin._id,
      name: admin.fullName,
      company: admin.companyName,
      email: admin.email
    });
    
    // DEBUG: Print all jobs to check structure
    const allJobs = await Job.find().limit(5).select('jobTitle postedBy postedByEmail postedById companyEmail').lean();
    console.log("📊 Sample jobs from database:", allJobs);
    
    // Find jobs posted by this admin - MULTIPLE WAYS
    const adminJobs = await Job.find({
      $or: [
        { postedById: adminId },  // by admin ID
        { postedByEmail: admin.email },  // by email in postedByEmail
        { companyEmail: admin.email },  // by email in companyEmail
        { contactEmail: admin.email },  // by email in contactEmail
        { postedBy: admin.fullName }  // by name in postedBy
      ]
    }).select('_id jobTitle companyName location postedBy postedByEmail companyEmail contactEmail postedById');
    
    console.log(`📊 Raw job query results:`, adminJobs.length);
    adminJobs.forEach(job => {
      console.log(`   Job: ${job.jobTitle}, PostedBy: ${job.postedBy}, Email: ${job.postedByEmail}, ID: ${job.postedById}`);
    });
    
    // If no jobs found with exact matches, try partial matches
    if (adminJobs.length === 0) {
      console.log("⚠️ No exact matches found, trying partial matches...");
      
      // Try finding by admin name (partial match)
      const jobsByCompanyName = await Job.find({
        companyName: { $regex: admin.companyName, $options: "i" }
      }).select('_id jobTitle companyName postedBy postedByEmail');
      
      console.log(`📊 Jobs by company name (${admin.companyName}):`, jobsByCompanyName.length);
      
      if (jobsByCompanyName.length > 0) {
        adminJobs.push(...jobsByCompanyName);
      }
      
      // Also try by postedBy field
      const jobsByPostedBy = await Job.find({
        postedBy: { $regex: admin.fullName, $options: "i" }
      }).select('_id jobTitle companyName postedBy postedByEmail');
      
      console.log(`📊 Jobs by postedBy (${admin.fullName}):`, jobsByPostedBy.length);
      
      if (jobsByPostedBy.length > 0) {
        adminJobs.push(...jobsByPostedBy);
      }
    }
    
    // Remove duplicates
    const uniqueJobs = [];
    const seenIds = new Set();
    
    adminJobs.forEach(job => {
      if (!seenIds.has(job._id.toString())) {
        seenIds.add(job._id.toString());
        uniqueJobs.push(job);
      }
    });
    
    const jobIds = uniqueJobs.map(job => job._id);
    
    console.log(`📊 Total unique jobs found for admin: ${jobIds.length}`);
    
    if (jobIds.length === 0) {
      // Create a sample job for testing if none exist
      console.log("⚠️ No jobs found. Creating a sample job for testing...");
      
      const sampleJob = await Job.create({
        jobTitle: "Sample Job for " + admin.companyName,
        companyName: admin.companyName,
        location: "Remote",
        jobType: "Full-time",
        jobDescription: "This is a sample job created automatically.",
        postedBy: admin.fullName,
        postedByEmail: admin.email,
        postedById: admin._id,
        companyEmail: admin.email,
        status: "Active",
        salaryRange: "Not specified"
      });
      
      jobIds.push(sampleJob._id);
      uniqueJobs.push({
        _id: sampleJob._id,
        jobTitle: sampleJob.jobTitle,
        companyName: sampleJob.companyName,
        postedBy: sampleJob.postedBy,
        postedByEmail: sampleJob.postedByEmail
      });
      
      console.log(`✅ Created sample job: ${sampleJob.jobTitle}`);
    }
    
    // Get applications for these jobs only
    const applications = await Application.find({
      jobId: { $in: jobIds }
    })
      .populate("userId", "firstName lastName email phone")
      .populate("jobId", "jobTitle companyName location jobType salaryRange postedBy postedByEmail")
      .sort({ appliedAt: -1 })
      .lean();
    
    console.log(`✅ Found ${applications.length} applications for admin's jobs`);
    
    // Format candidates
    const candidates = applications.map(app => ({
      _id: app._id,
      userId: app.userId?._id,
      userName: app.userName,
      userEmail: app.userEmail,
      userPhone: app.userPhone || (app.userId?.phone || ""),
      userDetails: app.userId ? {
        firstName: app.userId.firstName,
        lastName: app.userId.lastName,
        email: app.userId.email,
        phone: app.userId.phone
      } : null,
      jobId: app.jobId?._id,
      jobTitle: app.jobTitle || (app.jobId?.jobTitle || "N/A"),
      companyName: app.companyName || (app.jobId?.companyName || "N/A"),
      postedBy: app.jobId?.postedBy || "N/A",
      jobDetails: app.jobId ? {
        title: app.jobId.jobTitle,
        company: app.jobId.companyName,
        location: app.jobId.location,
        type: app.jobId.jobType,
        salary: app.jobId.salaryRange,
        postedBy: app.jobId.postedBy,
        postedByEmail: app.jobId.postedByEmail
      } : null,
      resume: app.resume,
      coverLetter: app.coverLetter || "",
      status: app.status,
      appliedAt: app.appliedAt,
      notes: app.notes || "",
      createdAt: app.createdAt,
      updatedAt: app.updatedAt
    }));
    
    res.status(200).json({
      success: true,
      count: candidates.length,
      admin: {
        _id: admin._id,
        fullName: admin.fullName,
        companyName: admin.companyName,
        email: admin.email,
        phone: admin.phone,
        totalJobs: jobIds.length
      },
      debug: {
        jobsFound: uniqueJobs.map(j => ({
          id: j._id,
          title: j.jobTitle,
          company: j.companyName,
          postedBy: j.postedBy,
          postedByEmail: j.postedByEmail
        }))
      },
      candidates: candidates
    });
    
  } catch (error) {
    console.error("❌ Error fetching candidates by admin:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching candidates",
      error: error.message,
      stack: error.stack
    });
  }
};

// ================= GET CANDIDATES FOR ADMIN (SIMPLE METHOD) =================
exports.getCandidatesForAdminSimple = async (req, res) => {
  try {
    const { adminId } = req.params;
    
    console.log(`🔧 SIMPLE METHOD: Getting candidates for admin: ${adminId}`);
    
    // First get admin
    const admin = await Admin.findById(adminId).select('email companyName fullName');
    
    if (!admin) {
      return res.status(404).json({ 
        success: false, 
        message: "Admin not found" 
      });
    }
    
    console.log(`🔍 Admin: ${admin.fullName} (${admin.email}) - Company: ${admin.companyName}`);
    
    // Get ALL jobs
    const allJobs = await Job.find().select('_id jobTitle companyName postedBy postedByEmail companyEmail contactEmail');
    
    console.log(`📊 Total jobs in system: ${allJobs.length}`);
    
    // Filter jobs that belong to this admin
    const adminJobs = allJobs.filter(job => {
      const adminEmailLower = admin.email.toLowerCase();
      const companyNameLower = admin.companyName ? admin.companyName.toLowerCase() : '';
      const adminNameLower = admin.fullName ? admin.fullName.toLowerCase() : '';
      
      // Check multiple fields for matches
      const emailMatch = (
        (job.postedByEmail && job.postedByEmail.toLowerCase() === adminEmailLower) ||
        (job.companyEmail && job.companyEmail.toLowerCase() === adminEmailLower) ||
        (job.contactEmail && job.contactEmail.toLowerCase() === adminEmailLower)
      );
      
      const nameMatch = (
        (job.postedBy && job.postedBy.toLowerCase().includes(adminNameLower)) ||
        (job.companyName && job.companyName.toLowerCase().includes(companyNameLower))
      );
      
      return emailMatch || nameMatch;
    });
    
    console.log(`📊 Jobs filtered for admin: ${adminJobs.length}`);
    
    // Debug: Show why jobs were selected
    adminJobs.forEach((job, i) => {
      console.log(`${i+1}. ${job.jobTitle} - ${job.companyName}`);
      console.log(`   postedBy: ${job.postedBy}, postedByEmail: ${job.postedByEmail}`);
      console.log(`   companyEmail: ${job.companyEmail}, contactEmail: ${job.contactEmail}`);
    });
    
    const jobIds = adminJobs.map(job => job._id);
    
    // If no jobs found, show all jobs for debugging
    if (adminJobs.length === 0) {
      console.log("⚠️ No jobs found for this admin. Showing all jobs for debugging:");
      allJobs.slice(0, 10).forEach((job, i) => {
        console.log(`${i+1}. ${job.jobTitle} - ${job.companyName}`);
        console.log(`   postedBy: ${job.postedBy}, postedByEmail: ${job.postedByEmail}`);
        console.log(`   companyEmail: ${job.companyEmail}, contactEmail: ${job.contactEmail}`);
      });
      
      return res.status(200).json({
        success: true,
        count: 0,
        admin: {
          _id: admin._id,
          companyName: admin.companyName,
          email: admin.email,
          fullName: admin.fullName,
          totalJobs: 0
        },
        debug: {
          message: "No jobs found for this admin",
          adminEmail: admin.email,
          adminCompany: admin.companyName,
          totalJobsInSystem: allJobs.length,
          sampleJobs: allJobs.slice(0, 3).map(j => ({
            title: j.jobTitle,
            company: j.companyName,
            postedBy: j.postedBy,
            postedByEmail: j.postedByEmail
          }))
        },
        candidates: []
      });
    }
    
    // Get applications for these jobs
    const applications = await Application.find({
      jobId: { $in: jobIds }
    })
      .populate("userId", "firstName lastName email phone")
      .populate("jobId", "jobTitle companyName location")
      .sort({ appliedAt: -1 })
      .lean();
    
    const candidates = applications.map(app => ({
      _id: app._id,
      userName: app.userName,
      userEmail: app.userEmail,
      userPhone: app.userPhone || (app.userId?.phone || ""),
      jobTitle: app.jobTitle || (app.jobId?.jobTitle || "N/A"),
      companyName: app.companyName || (app.jobId?.companyName || "N/A"),
      resume: app.resume,
      coverLetter: app.coverLetter || "",
      status: app.status,
      appliedAt: app.appliedAt,
      notes: app.notes || ""
    }));
    
    res.status(200).json({
      success: true,
      count: candidates.length,
      admin: {
        _id: admin._id,
        companyName: admin.companyName,
        email: admin.email,
        fullName: admin.fullName,
        totalJobs: adminJobs.length
      },
      candidates: candidates
    });
    
  } catch (error) {
    console.error("❌ Error in simple method:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// ================= GET CANDIDATES BY ADMIN EMAIL =================
exports.getCandidatesByAdminEmail = async (req, res) => {
  try {
    const { email } = req.params;
    
    console.log(`📋 Fetching candidates for admin email: ${email}`);
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Admin email is required"
      });
    }
    
    // Find admin
    const admin = await Admin.findOne({ email }).select('_id companyName fullName');
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }
    
    // Find jobs where this admin is the poster
    const adminJobs = await Job.find({
      $or: [
        { postedByEmail: email },
        { contactEmail: email },
        { companyEmail: email },
        { postedById: admin._id }
      ]
    }).select('_id jobTitle companyName');
    
    const jobIds = adminJobs.map(job => job._id);
    
    console.log(`📊 Found ${jobIds.length} jobs for admin`);
    
    if (jobIds.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No jobs found for this admin",
        count: 0,
        candidates: []
      });
    }
    
    // Get applications
    const applications = await Application.find({
      jobId: { $in: jobIds }
    })
      .populate("userId", "firstName lastName email")
      .populate("jobId", "jobTitle companyName")
      .sort({ appliedAt: -1 })
      .lean();
    
    const candidates = applications.map(app => ({
      _id: app._id,
      userName: app.userName,
      userEmail: app.userEmail,
      userPhone: app.userPhone,
      jobTitle: app.jobTitle || (app.jobId?.jobTitle || "N/A"),
      companyName: app.companyName || (app.jobId?.companyName || "N/A"),
      resume: app.resume,
      status: app.status,
      appliedAt: app.appliedAt
    }));
    
    res.status(200).json({
      success: true,
      count: candidates.length,
      admin: {
        _id: admin._id,
        companyName: admin.companyName,
        email: email
      },
      candidates: candidates
    });
    
  } catch (error) {
    console.error("❌ Error fetching by email:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// ================= GET SINGLE CANDIDATE DETAILS =================
exports.getCandidateById = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`📋 Fetching candidate details: ${id}`);
    
    const application = await Application.findById(id)
      .populate("userId", "firstName lastName email phone createdAt")
      .populate("jobId", "jobTitle companyName location jobType salaryRange requirements qualifications postedById postedByEmail")
      .lean();
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Candidate application not found"
      });
    }
    
    console.log(`✅ Found candidate: ${application.userName}`);
    
    const candidate = {
      _id: application._id,
      userId: application.userId?._id,
      userName: application.userName,
      userEmail: application.userEmail,
      userPhone: application.userPhone || (application.userId?.phone || ""),
      userDetails: application.userId ? {
        firstName: application.userId.firstName,
        lastName: application.userId.lastName,
        fullName: `${application.userId.firstName} ${application.userId.lastName}`,
        email: application.userId.email,
        phone: application.userId.phone,
        memberSince: application.userId.createdAt
      } : null,
      jobId: application.jobId?._id,
      jobTitle: application.jobTitle || (application.jobId?.jobTitle || "N/A"),
      companyName: application.companyName || (application.jobId?.companyName || "N/A"),
      jobDetails: application.jobId ? {
        title: application.jobId.jobTitle,
        company: application.jobId.companyName,
        location: application.jobId.location,
        type: application.jobId.jobType,
        salary: application.jobId.salaryRange,
        postedBy: application.jobId.postedBy,
        postedByEmail: application.jobId.postedByEmail
      } : null,
      resume: application.resume,
      coverLetter: application.coverLetter || "",
      status: application.status,
      appliedAt: application.appliedAt,
      notes: application.notes || "",
      createdAt: application.createdAt,
      updatedAt: application.updatedAt
    };
    
    res.status(200).json({
      success: true,
      candidate: candidate
    });
    
  } catch (error) {
    console.error("❌ Error fetching candidate details:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching candidate details",
      error: error.message
    });
  }
};

// ================= UPDATE CANDIDATE STATUS =================
exports.updateCandidateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    console.log(`📝 Updating candidate ${id} status to: ${status}`);
    
    // Validate status
    const validStatuses = ["Pending", "Reviewed", "Shortlisted", "Rejected", "Accepted"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }
    
    const updateData = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    
    const application = await Application.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Candidate application not found"
      });
    }
    
    console.log(`✅ Candidate status updated: ${application.userName} -> ${application.status}`);
    
    res.status(200).json({
      success: true,
      message: "Candidate status updated successfully",
      candidate: {
        _id: application._id,
        userName: application.userName,
        userEmail: application.userEmail,
        jobTitle: application.jobTitle,
        status: application.status,
        notes: application.notes,
        updatedAt: application.updatedAt
      }
    });
    
  } catch (error) {
    console.error("❌ Error updating candidate:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating candidate",
      error: error.message
    });
  }
};

// ================= DELETE CANDIDATE APPLICATION =================
exports.deleteCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🗑️ Deleting candidate application: ${id}`);
    
    const application = await Application.findByIdAndDelete(id);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Candidate application not found"
      });
    }
    
    console.log(`✅ Candidate application deleted: ${application.userName}`);
    
    // Update applications count in job
    if (application.jobId) {
      await Job.findByIdAndUpdate(application.jobId, {
        $inc: { applications: -1 }
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Candidate application deleted successfully",
      deletedCandidate: {
        userName: application.userName,
        userEmail: application.userEmail,
        jobTitle: application.jobTitle
      }
    });
    
  } catch (error) {
    console.error("❌ Error deleting candidate:", error);
    res.status(500).json({
      success: false,
      message: "Server error deleting candidate",
      error: error.message
    });
  }
};

// ================= GET ALL CANDIDATES (For Super Admin) =================
exports.getAllCandidates = async (req, res) => {
  try {
    console.log("📋 Fetching all candidates (for super admin)...");
    
    const { adminId, adminEmail } = req.query;
    
    // If adminId is provided, filter by admin
    let query = {};
    
    if (adminId || adminEmail) {
      // Find admin
      const admin = adminId 
        ? await Admin.findById(adminId).select('email')
        : await Admin.findOne({ email: adminEmail }).select('_id email');
      
      if (admin) {
        // Find jobs by this admin
        const adminJobs = await Job.find({
          $or: [
            { postedById: admin._id },
            { postedByEmail: admin.email }
          ]
        }).select('_id');
        
        const jobIds = adminJobs.map(job => job._id);
        
        if (jobIds.length > 0) {
          query.jobId = { $in: jobIds };
        } else {
          // No jobs found for this admin
          return res.status(200).json({
            success: true,
            count: 0,
            message: "No candidates found for this admin",
            candidates: []
          });
        }
      }
    }
    
    const applications = await Application.find(query)
      .populate("userId", "firstName lastName email phone")
      .populate("jobId", "jobTitle companyName location postedBy postedByEmail")
      .sort({ appliedAt: -1 })
      .lean();
    
    console.log(`✅ Found ${applications.length} applications`);
    
    const candidates = applications.map(app => ({
      _id: app._id,
      userId: app.userId?._id,
      userName: app.userName,
      userEmail: app.userEmail,
      userPhone: app.userPhone || (app.userId?.phone || ""),
      jobId: app.jobId?._id,
      jobTitle: app.jobTitle || (app.jobId?.jobTitle || "N/A"),
      companyName: app.companyName || (app.jobId?.companyName || "N/A"),
      postedBy: app.jobId?.postedBy || "N/A",
      resume: app.resume,
      coverLetter: app.coverLetter || "",
      status: app.status,
      appliedAt: app.appliedAt,
      notes: app.notes || ""
    }));
    
    res.status(200).json({
      success: true,
      count: candidates.length,
      candidates: candidates
    });
    
  } catch (error) {
    console.error("❌ Error fetching all candidates:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching candidates",
      error: error.message
    });
  }
};

// ================= SEARCH CANDIDATES =================
exports.searchCandidates = async (req, res) => {
  try {
    const { search, status, jobTitle, adminId } = req.query;
    
    console.log("🔍 Searching candidates with filters:", req.query);
    
    // Build base query
    let query = {};
    
    // Filter by admin if adminId is provided
    if (adminId) {
      const admin = await Admin.findById(adminId).select('email');
      if (admin) {
        const adminJobs = await Job.find({
          $or: [
            { postedById: adminId },
            { postedByEmail: admin.email }
          ]
        }).select('_id');
        
        const jobIds = adminJobs.map(job => job._id);
        
        if (jobIds.length > 0) {
          query.jobId = { $in: jobIds };
        } else {
          return res.status(200).json({
            success: true,
            count: 0,
            candidates: []
          });
        }
      }
    }
    
    // Add search filters
    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: "i" } },
        { userEmail: { $regex: search, $options: "i" } },
        { userPhone: { $regex: search, $options: "i" } }
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    if (jobTitle) {
      // Find jobs with this title
      const jobs = await Job.find({ 
        jobTitle: { $regex: jobTitle, $options: "i" } 
      }).select('_id');
      
      const jobIds = jobs.map(job => job._id);
      query.jobId = { $in: jobIds };
    }
    
    const applications = await Application.find(query)
      .populate("userId", "firstName lastName email phone")
      .populate("jobId", "jobTitle companyName location")
      .sort({ appliedAt: -1 })
      .limit(100)
      .lean();
    
    console.log(`✅ Found ${applications.length} candidates matching search`);
    
    const candidates = applications.map(app => ({
      _id: app._id,
      userName: app.userName,
      userEmail: app.userEmail,
      userPhone: app.userPhone || (app.userId?.phone || ""),
      jobTitle: app.jobTitle || (app.jobId?.jobTitle || "N/A"),
      companyName: app.companyName || (app.jobId?.companyName || "N/A"),
      resume: app.resume,
      status: app.status,
      appliedAt: app.appliedAt
    }));
    
    res.status(200).json({
      success: true,
      count: candidates.length,
      candidates: candidates
    });
    
  } catch (error) {
    console.error("❌ Error searching candidates:", error);
    res.status(500).json({
      success: false,
      message: "Server error searching candidates",
      error: error.message
    });
  }
};

// ================= GET CANDIDATE STATISTICS =================
exports.getCandidateStats = async (req, res) => {
  try {
    const { adminId } = req.params;
    
    console.log(`📊 Getting statistics for admin: ${adminId}`);
    
    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: "Admin ID is required"
      });
    }
    
    // Find admin jobs
    const admin = await Admin.findById(adminId).select('email');
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }
    
    const adminJobs = await Job.find({
      $or: [
        { postedById: adminId },
        { postedByEmail: admin.email }
      ]
    }).select('_id');
    
    const jobIds = adminJobs.map(job => job._id);
    
    if (jobIds.length === 0) {
      return res.status(200).json({
        success: true,
        stats: {
          totalCandidates: 0,
          byStatus: [],
          recentCandidates: [],
          totalJobs: 0
        }
      });
    }
    
    // Get total candidates
    const totalCandidates = await Application.countDocuments({ 
      jobId: { $in: jobIds } 
    });
    
    // Get status statistics
    const statusStats = await Application.aggregate([
      { $match: { jobId: { $in: jobIds } } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          status: "$_id",
          count: 1,
          _id: 0
        }
      }
    ]);
    
    // Get recent candidates (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentCandidates = await Application.find({
      jobId: { $in: jobIds },
      appliedAt: { $gte: sevenDaysAgo }
    })
      .populate("jobId", "jobTitle")
      .sort({ appliedAt: -1 })
      .limit(10)
      .lean();
    
    const formattedRecentCandidates = recentCandidates.map(app => ({
      id: app._id,
      userName: app.userName,
      jobTitle: app.jobId?.jobTitle || app.jobTitle,
      status: app.status,
      appliedAt: app.appliedAt
    }));
    
    res.status(200).json({
      success: true,
      stats: {
        totalCandidates,
        byStatus: statusStats,
        recentCandidates: formattedRecentCandidates,
        totalJobs: jobIds.length
      }
    });
    
  } catch (error) {
    console.error("❌ Error getting candidate stats:", error);
    res.status(500).json({
      success: false,
      message: "Server error getting statistics",
      error: error.message
    });
  }
};

// ================= BULK UPDATE STATUS =================
exports.bulkUpdateStatus = async (req, res) => {
  try {
    const { candidateIds, status, adminId } = req.body;
    
    if (!candidateIds || !Array.isArray(candidateIds) || candidateIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of candidate IDs"
      });
    }
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required"
      });
    }
    
    const validStatuses = ["Pending", "Reviewed", "Shortlisted", "Rejected", "Accepted"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }
    
    // If adminId is provided, verify candidates belong to this admin
    if (adminId) {
      const admin = await Admin.findById(adminId).select('email');
      if (admin) {
        const adminJobs = await Job.find({
          $or: [
            { postedById: adminId },
            { postedByEmail: admin.email }
          ]
        }).select('_id');
        
        const jobIds = adminJobs.map(job => job._id);
        
        // Verify all candidates belong to these jobs
        const candidates = await Application.find({
          _id: { $in: candidateIds },
          jobId: { $in: jobIds }
        }).select('_id');
        
        if (candidates.length !== candidateIds.length) {
          return res.status(403).json({
            success: false,
            message: "Some candidates do not belong to your jobs"
          });
        }
      }
    }
    
    console.log(`🔄 Bulk updating ${candidateIds.length} candidates to status: ${status}`);
    
    const result = await Application.updateMany(
      { _id: { $in: candidateIds } },
      { status: status }
    );
    
    console.log(`✅ Bulk update completed: ${result.modifiedCount} candidates updated`);
    
    res.status(200).json({
      success: true,
      message: `Updated ${result.modifiedCount} candidates to ${status}`,
      updatedCount: result.modifiedCount
    });
    
  } catch (error) {
    console.error("❌ Error in bulk update:", error);
    res.status(500).json({
      success: false,
      message: "Server error in bulk update",
      error: error.message
    });
  }
};

// ================= GET CANDIDATES WITH JOB DETAILS (FOR TESTING) =================
exports.getCandidatesWithJobDetails = async (req, res) => {
  try {
    console.log("🔍 Getting candidates with full job details for debugging...");
    
    const allApplications = await Application.find()
      .populate("userId", "firstName lastName email")
      .populate("jobId", "jobTitle companyName postedBy postedByEmail postedById companyEmail contactEmail")
      .sort({ appliedAt: -1 })
      .limit(20)
      .lean();
    
    const candidates = allApplications.map(app => ({
      _id: app._id,
      userName: app.userName,
      userEmail: app.userEmail,
      jobTitle: app.jobTitle || (app.jobId?.jobTitle || "N/A"),
      companyName: app.companyName || (app.jobId?.companyName || "N/A"),
      jobDetails: app.jobId ? {
        postedBy: app.jobId.postedBy,
        postedByEmail: app.jobId.postedByEmail,
        postedById: app.jobId.postedById,
        companyEmail: app.jobId.companyEmail,
        contactEmail: app.jobId.contactEmail
      } : null,
      status: app.status,
      appliedAt: app.appliedAt
    }));
    
    res.status(200).json({
      success: true,
      count: candidates.length,
      message: "All candidates with job details (for debugging)",
      candidates: candidates
    });
    
  } catch (error) {
    console.error("❌ Error in debug function:", error);
    res.status(500).json({
      success: false,
      message: "Debug error",
      error: error.message
    });
  }
};