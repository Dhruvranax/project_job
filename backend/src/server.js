// server.js - COMPLETE WITH ALL ENDPOINTS
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Load environment variables
require('dotenv').config();

const app = express();

// ============================================
// 1. CORS Configuration
// ============================================
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const body = req.body ? JSON.stringify(req.body).substring(0, 200) : 'No body';
  
  console.log(`📥 ${timestamp} ${method} ${url}`);
  console.log(`   Body: ${body}`);
  next();
});

// ============================================
// 2. MONGODB CONNECTION
// ============================================
console.log('🔗 Connecting to MongoDB...');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://job_database:jobportal23@cluster0.1r7jdaj.mongodb.net/jobportal?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully!');
    console.log(`   Database: ${mongoose.connection.db?.databaseName}`);
    console.log(`   Host: ${mongoose.connection.host}`);
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.log('💡 Try: Wait a few seconds and refresh the page');
  });

// Connection events
mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB event - connected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB event - error:', err.message);
});

// ============================================
// 3. LOAD MODELS
// ============================================
console.log('📦 Loading models...');

const Admin = require('./models/Admin');
const User = require('./models/User');
const Job = require('./models/Job');
const Application = require('./models/Application');

console.log('✅ Models loaded successfully');

// ============================================
// 4. BASIC ROUTES
// ============================================

// Root endpoint
app.get('/', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const dbStatusText = dbStatus === 1 ? 'connected' : 'disconnected';
  
  res.json({
    message: '🚀 Job Portal API',
    status: 'running',
    database: dbStatusText,
    mongodb_state: dbStatus,
    timestamp: new Date().toISOString(),
    note: dbStatus !== 1 ? 'Database connecting... try refreshing in 10 seconds' : 'Ready'
  });
});

// Health check
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1;
  res.json({
    status: dbStatus ? 'healthy' : 'connecting',
    server: 'running',
    database: dbStatus ? 'connected' : 'connecting',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ============================================
// 5. USER ROUTES - CRITICAL FOR REGISTER/LOGIN
// ============================================

// User registration
app.post('/api/users/register', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    console.log(`👤 New registration attempt: ${email}`);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      role: 'user',
      status: 'active',
      profileViews: 0,
      applicationsCount: 0
    });

    await newUser.save();

    console.log(`✅ User registered: ${newUser._id}`);

    // Create JWT token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '7d' }
    );

    // Don't send password in response
    const userResponse = {
      _id: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      profileViews: newUser.profileViews,
      applicationsCount: newUser.applicationsCount,
      createdAt: newUser.createdAt
    };

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: userResponse,
      token: token
    });

  } catch (error) {
    console.error('❌ Registration error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

// User login
app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(`🔐 Login attempt: ${email}`);

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    console.log(`✅ User logged in: ${user._id}`);

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '7d' }
    );

    // Don't send password in response
    const userResponse = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      resume: user.resume,
      profileViews: user.profileViews || 0,
      applicationsCount: user.applicationsCount || 0,
      createdAt: user.createdAt
    };

    res.json({
      success: true,
      message: 'Login successful',
      user: userResponse,
      token: token
    });

  } catch (error) {
    console.error('❌ Login error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// Get user profile
app.get('/api/users/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: user
    });
  } catch (error) {
    console.error('Profile fetch error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
});

// ============================================
// 6. JOBS ENDPOINTS
// ============================================

// Get active jobs
app.get('/api/jobs/active', async (req, res) => {
  try {
    console.log('Fetching active jobs...');
    
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️ MongoDB not connected yet, returning empty data');
      return res.json({
        success: true,
        count: 0,
        jobs: [],
        message: 'Database connecting... try again in a few seconds'
      });
    }
    
    const jobs = await Job.find({ 
      status: { $in: ['Active', 'Published'] }
    })
    .sort({ postedDate: -1 })
    .limit(20)
    .lean();

    res.json({
      success: true,
      count: jobs.length,
      jobs: jobs || []
    });
  } catch (error) {
    console.error('Error fetching active jobs:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs',
      error: error.message
    });
  }
});

// Get statistics
app.get('/api/jobs/stats/summary', async (req, res) => {
  try {
    console.log('Fetching job statistics...');
    
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️ MongoDB not connected, returning zero stats');
      return res.json({
        success: true,
        stats: {
          totalJobs: 0,
          activeJobs: 0,
          featuredJobs: 0,
          totalViews: 0,
          totalApplications: 0
        },
        message: 'Database connecting...'
      });
    }
    
    const totalJobs = await Job.countDocuments({});
    const activeJobs = await Job.countDocuments({ 
      status: { $in: ['Active', 'Published'] }
    });
    const featuredJobs = await Job.countDocuments({ isFeatured: true });
    
    const viewResult = await Job.aggregate([
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ]);
    
    const totalApplications = await Application.countDocuments({});
    
    res.json({
      success: true,
      stats: {
        totalJobs,
        activeJobs,
        featuredJobs,
        totalViews: viewResult[0]?.totalViews || 0,
        totalApplications
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
});

// ============================================
// 7. APPLICATION ENDPOINTS - ALL APPLICATION ROUTES
// ============================================

// Get all applications - THIS ENDPOINT WAS MISSING
app.get('/api/applications', async (req, res) => {
  try {
    console.log('📄 Fetching all applications...');
    
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️ MongoDB not connected yet');
      return res.json({
        success: true,
        count: 0,
        applications: [],
        message: 'Database connecting...'
      });
    }
    
    const applications = await Application.find()
      .sort({ appliedAt: -1 })
      .lean();
    
    console.log(`✅ Found ${applications.length} applications`);
    
    res.json({
      success: true,
      count: applications.length,
      applications: applications
    });
  } catch (error) {
    console.error('❌ Error fetching applications:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
});

// Get applications by job ID
app.get('/api/applications/job/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    console.log(`📄 Fetching applications for job: ${jobId}`);
    
    const applications = await Application.find({ jobId })
      .sort({ appliedAt: -1 })
      .lean();
    
    res.json({
      success: true,
      count: applications.length,
      applications: applications
    });
  } catch (error) {
    console.error('Error fetching job applications:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job applications',
      error: error.message
    });
  }
});

// Get single application by ID
app.get('/api/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🔍 Getting application: ${id}`);
    
    const application = await Application.findById(id);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    res.json({
      success: true,
      application: application
    });
  } catch (error) {
    console.error('Error getting application:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get application',
      error: error.message
    });
  }
});

// Update application status - FIXED ENDPOINT
app.put('/api/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    console.log(`🔄 Status update request: ${id} -> ${status}`);
    
    // Validate status
    const validStatuses = ['Pending', 'Reviewed', 'Shortlisted', 'Rejected', 'Accepted'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Valid statuses: Pending, Reviewed, Shortlisted, Rejected, Accepted'
      });
    }
    
    // Find and update application
    const updatedApplication = await Application.findByIdAndUpdate(
      id,
      { 
        status: status,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedApplication) {
      console.log(`❌ Application not found: ${id}`);
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    console.log(`✅ Status updated: ${updatedApplication._id} -> ${updatedApplication.status}`);
    
    res.json({
      success: true,
      message: 'Status updated successfully',
      application: updatedApplication
    });
  } catch (error) {
    console.error('❌ Error updating status:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update status',
      error: error.message
    });
  }
});

// Delete application
app.delete('/api/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🗑️ Deleting application: ${id}`);
    
    const deletedApplication = await Application.findByIdAndDelete(id);
    
    if (!deletedApplication) {
      console.log(`❌ Application not found: ${id}`);
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    console.log(`✅ Application deleted: ${id}`);
    
    res.json({
      success: true,
      message: 'Application deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting application:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete application',
      error: error.message
    });
  }
});

// Apply for a job
app.post('/api/jobs/:jobId/apply', async (req, res) => {
  try {
    const { jobId } = req.params;
    const { 
      userId, 
      userName, 
      userEmail, 
      userPhone, 
      resume, 
      coverLetter,
      jobTitle,
      companyName
    } = req.body;

    console.log(`📝 Job application for ${jobId} from ${userEmail}`);

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      userId: userId,
      jobId: jobId
    });

    if (existingApplication) {
      return res.status(409).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    // Create application
    const application = new Application({
      userId: userId,
      jobId: jobId,
      userName: userName,
      userEmail: userEmail,
      userPhone: userPhone || '',
      resume: resume,
      coverLetter: coverLetter || '',
      jobTitle: jobTitle || job.jobTitle || 'Untitled Job',
      companyName: companyName || job.companyName || 'Unknown Company',
      jobType: job.jobType,
      location: job.location,
      salary: job.salary || job.salaryRange,
      status: 'Pending',
      appliedAt: new Date()
    });

    await application.save();

    // Update job's applications count
    job.applications = (job.applications || 0) + 1;
    await job.save();

    // Update user's applications count
    user.applicationsCount = (user.applicationsCount || 0) + 1;
    await user.save();

    console.log(`✅ Application created: ${application._id}`);

    res.json({
      success: true,
      message: 'Application submitted successfully',
      application: application
    });

  } catch (error) {
    console.error('❌ Application error:', error.message);
    
    if (error.name === 'ValidationError') {
      const missingFields = Object.keys(error.errors).join(', ');
      return res.status(400).json({
        success: false,
        message: `Validation failed: Missing ${missingFields}`,
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to submit application',  
      error: error.message
    });
  }
});

// Get user applications
app.get('/api/jobs/user/applications/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`Fetching applications for user: ${userId}`);
    
    if (!userId || userId === 'undefined') {
      return res.json({
        success: true,
        count: 0,
        applications: []
      });
    }
    
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️ MongoDB not connected');
      return res.json({
        success: true,
        count: 0,
        applications: []
      });
    }
    
    const applications = await Application.find({ userId: userId })
      .sort({ appliedAt: -1 })
      .lean();

    res.json({
      success: true,
      count: applications.length,
      applications: applications
    });
  } catch (error) {
    console.error('Error fetching user applications:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
});

// Get all jobs (for JobList page)
app.get('/api/jobs', async (req, res) => {
  try {
    const { search, jobType, location, experienceLevel } = req.query;
    
    console.log('Fetching all jobs with filters:', {
      search, jobType, location, experienceLevel
    });
    
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️ MongoDB not connected yet');
      return res.json({
        success: true,
        count: 0,
        jobs: [],
        message: 'Database connecting...'
      });
    }
    
    // Build query
    let query = { 
      status: { $in: ['Active', 'Published'] }
    };
    
    if (search) {
      query.$or = [
        { jobTitle: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (jobType) {
      query.jobType = jobType;
    }
    
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    
    if (experienceLevel) {
      query.experienceLevel = experienceLevel;
    }
    
    const jobs = await Job.find(query)
      .sort({ postedDate: -1, isFeatured: -1 })
      .lean();
    
    res.json({
      success: true,
      count: jobs.length,
      jobs: jobs
    });
  } catch (error) {
    console.error('Error fetching jobs:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs',
      error: error.message
    });
  }
});

// Create a new job
app.post('/api/jobs/create', async (req, res) => {
  try {
    const jobData = req.body;
    
    console.log('📝 Creating new job:', {
      jobTitle: jobData.jobTitle,
      companyName: jobData.companyName,
      postedBy: jobData.postedBy
    });
    
    // Check if required fields are present
    if (!jobData.jobTitle || !jobData.companyName || !jobData.location) {
      return res.status(400).json({
        success: false,
        message: 'Job title, company name, and location are required'
      });
    }
    
    // Create new job
    const newJob = new Job({
      ...jobData,
      postedDate: new Date(),
      status: jobData.status || 'Draft',
      views: 0,
      applications: 0,
      isFeatured: false,
      isUrgent: false
    });
    
    await newJob.save();
    
    console.log('✅ Job created:', newJob._id);
    
    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      job: newJob
    });
    
  } catch (error) {
    console.error('❌ Job creation error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create job',
      error: error.message
    });
  }
});

// Alternative job creation route
app.post('/api/jobs', async (req, res) => {
  try {
    const jobData = req.body;
    
    // Same logic as above
    const newJob = new Job({
      ...jobData,
      postedDate: new Date(),
      status: jobData.status || 'Draft'
    });
    
    await newJob.save();
    
    res.status(201).json({
      success: true,
      message: 'Job posted successfully',
      job: newJob
    });
    
  } catch (error) {
    console.error('Job posting error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to post job',
      error: error.message
    });
  }
});

// ============================================
// 8. ADMIN ROUTES
// ============================================

// Admin registration
app.post('/api/admin/register', async (req, res) => {
  try {
    const adminData = req.body;
    console.log('👔 Admin registration attempt:', adminData.email);

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: adminData.email });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin with this email already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminData.password, salt);

    // Create new admin
    const newAdmin = new Admin({
      ...adminData,
      password: hashedPassword,
      role: 'admin',
      status: 'active',
      isVerified: false,
      createdAt: new Date()
    });

    await newAdmin.save();

    // Don't send password in response
    const adminResponse = newAdmin.toObject();
    delete adminResponse.password;

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      admin: adminResponse
    });

  } catch (error) {
    console.error('Admin registration error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Admin registration failed',
      error: error.message
    });
  }
});

// Admin login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔐 Admin login attempt:', email);

    // Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { adminId: admin._id, email: admin.email },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '7d' }
    );

    // Don't send password in response
    const adminResponse = admin.toObject();
    delete adminResponse.password;

    res.json({
      success: true,
      message: 'Admin login successful',
      admin: adminResponse,
      token: token
    });

  } catch (error) {
    console.error('Admin login error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Admin login failed',
      error: error.message
    });
  }
});

// Get all admins (for testing)
app.get('/api/admin', async (req, res) => {
  try {
    const admins = await Admin.find().select('-password').lean();
    res.json({
      success: true,
      count: admins.length,
      admins: admins
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admins'
    });
  }
});

// Get applications by admin (admin's jobs)
app.get('/api/admin/applications', async (req, res) => {
  try {
    const { adminEmail } = req.query;
    
    if (!adminEmail) {
      return res.status(400).json({
        success: false,
        message: 'Admin email is required'
      });
    }
    
    console.log(`👔 Fetching applications for admin: ${adminEmail}`);
    
    // Find jobs posted by this admin
    const adminJobs = await Job.find({ postedBy: adminEmail });
    const adminJobIds = adminJobs.map(job => job._id);
    
    // Find applications for these jobs
    const applications = await Application.find({ 
      jobId: { $in: adminJobIds } 
    }).sort({ appliedAt: -1 });
    
    console.log(`✅ Found ${applications.length} applications for admin`);
    
    res.json({
      success: true,
      count: applications.length,
      applications: applications
    });
  } catch (error) {
    console.error('Error fetching admin applications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin applications',
      error: error.message
    });
  }
});

// ============================================
// 9. TEST ENDPOINTS
// ============================================

// User test endpoint
app.get('/api/users/test', (req, res) => {
  res.json({
    success: true,
    message: 'User API is working',
    endpoints: {
      register: 'POST /api/users/register',
      login: 'POST /api/users/login',
      profile: 'GET /api/users/profile/:userId'
    },
    timestamp: new Date().toISOString()
  });
});

// Apply test endpoint
app.get('/api/jobs/test/apply', (req, res) => {
  res.json({
    success: true,
    message: 'Apply endpoint is ready',
    note: 'Send POST request to /api/jobs/:jobId/apply with user data'
  });
});

// Admin test
app.get('/api/admin/test', (req, res) => {
  res.json({
    success: true,
    message: 'Admin API is working',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Database status
app.get('/api/db/status', (req, res) => {
  const status = mongoose.connection.readyState;
  const statusText = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  res.json({
    success: true,
    status: statusText[status] || 'unknown',
    code: status,
    timestamp: new Date().toISOString()
  });
});

// Applications test endpoint
app.get('/api/applications/test', (req, res) => {
  res.json({
    success: true,
    message: 'Applications API is working',
    endpoints: {
      getAll: 'GET /api/applications',
      getById: 'GET /api/applications/:id',
      updateStatus: 'PUT /api/applications/:id',
      delete: 'DELETE /api/applications/:id',
      getByJob: 'GET /api/applications/job/:jobId'
    },
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// server.js માં આ endpoint ઉમેરો:

// Get jobs by admin email
app.get('/api/jobs/admin/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    console.log(`👔 Fetching jobs for admin: ${email}`);
    
    const jobs = await Job.find({ 
      postedBy: email 
    }).sort({ postedDate: -1 });
    
    res.json({
      success: true,
      count: jobs.length,
      jobs: jobs,
      admin: {
        email: email,
        totalJobs: jobs.length
      }
    });
  } catch (error) {
    console.error('Error fetching admin jobs:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin jobs',
      error: error.message
    });
  }
});

// Get jobs by admin ID
app.get('/api/jobs/admin/id/:adminId', async (req, res) => {
  try {
    const { adminId } = req.params;
    
    console.log(`👔 Fetching jobs for admin ID: ${adminId}`);
    
    // First get admin details to get email
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }
    
    const jobs = await Job.find({ 
      postedBy: admin.email 
    }).sort({ postedDate: -1 });
    
    res.json({
      success: true,
      count: jobs.length,
      jobs: jobs,
      admin: {
        _id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        companyName: admin.companyName,
        totalJobs: jobs.length
      }
    });
  } catch (error) {
    console.error('Error fetching admin jobs by ID:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin jobs',
      error: error.message
    });
  }
});

// ============================================
// 10. ERROR HANDLING
// ============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    requested: `${req.method} ${req.originalUrl}`,
    available_endpoints: [
      'GET /api/applications',
      'PUT /api/applications/:id',
      'POST /api/users/register',
      'POST /api/users/login',
      'GET /api/jobs/active',
      'POST /api/jobs/:jobId/apply'
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('💥 Global Error:', err.message);
  
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Contact administrator' : err.message,
    timestamp: new Date().toISOString()
  });
});

// ============================================
// 11. START SERVER
// ============================================
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 JOB PORTAL API SERVER STARTED');
  console.log('='.repeat(60));
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  MongoDB: ${mongoose.connection.readyState === 1 ? '✅ Connected' : '🔄 Connecting...'}`);
  
  console.log('\n🔗 IMPORTANT ENDPOINTS:');
  console.log(`   1. http://localhost:${PORT}/api/users/register`);
  console.log(`   2. http://localhost:${PORT}/api/users/login`);
  console.log(`   3. http://localhost:${PORT}/api/jobs/active`);
  console.log(`   4. http://localhost:${PORT}/api/jobs/:jobId/apply`);
  console.log(`   5. http://localhost:${PORT}/api/applications`);
  console.log(`   6. http://localhost:${PORT}/api/applications/test`);
  console.log('='.repeat(60) + '\n');
  
  console.log('💡 User registration and login are now available!');
});

// Auto-check connection after 5 seconds
setTimeout(() => {
  const state = mongoose.connection.readyState;
  console.log(`🔄 Connection check after 5s: ${state === 1 ? '✅ Connected' : '❌ Still disconnected'}`);
}, 5000);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Server shutting down...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

module.exports = app;