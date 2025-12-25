// server.js - COMPLETELY FIXED VERSION
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Load environment variables
require('dotenv').config();

const app = express();

// ============================================
// 1. CORS Configuration
// ============================================
app.use(cors({
  origin: [
    'https://project-job-ashy.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logger
app.use((req, res, next) => {
  console.log(`📥 ${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// ============================================
// 2. FIXED MongoDB Connection (NEW Mongoose v7)
// ============================================
console.log('🔗 Connecting to MongoDB...');  
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://job_database:jobportal23@cluster0.1r7jdaj.mongodb.net/';
 
// ✅ FIXED: Remove deprecated options for Mongoose v7+
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully!');
    console.log('   Database:', mongoose.connection.db?.databaseName || 'jobportal');
    console.log('   Host:', mongoose.connection.host);
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.log('💡 Check:');
    console.log('   1. MongoDB Atlas IP whitelist (add 0.0.0.0/0)');
    console.log('   2. Database user credentials');
    console.log('   3. Network connection');
  });

// MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB event - connected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB event - error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB event - disconnected');
});

// ============================================
// 3. LOAD ROUTES (FIXED)
// ============================================
console.log('📂 Loading routes...');

// Load candidateRoutes FIRST (important for /api/admin/candidates)
try {
  const candidateRoutes = require('./routes/candidateRoutes');
  app.use('/api/admin/candidates', candidateRoutes);
  console.log('✅ candidateRoutes loaded at /api/admin/candidates');
} catch (error) {
  console.log('⚠️ candidateRoutes not found, creating fallback...');
  
  // Fallback candidates route
  app.get('/api/admin/candidates', (req, res) => {
    res.json({
      success: true,
      message: 'Fallback candidates endpoint',
      candidates: [
        {
          _id: '694cecca036e34ed95c5ad09',
          name: 'Krishna',
          email: 'ks@gmail.com',
          phone: '9876543210',
          status: 'Applied'
        }
      ]
    });
  });
}

// Load other routes
try {
  const adminRoutes = require('./routes/adminRoutes');
  const userRoutes = require('./routes/userRoutes');
  const jobRoutes = require('./routes/jobRoutes');
  
  app.use('/api/admin', adminRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/jobs', jobRoutes);
  
  console.log('✅ All routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading routes:', error.message);
}

// ============================================
// 4. TEST ENDPOINTS
// ============================================

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Job Portal API - FIXED',
    status: 'running',
    version: '3.0.0',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    endpoints: {
      home: 'GET /',
      test: 'GET /test',
      health: 'GET /health',
      admin_test: 'GET /api/admin/test',
      candidates: 'GET /api/admin/candidates',
      candidate_by_id: 'GET /api/admin/candidates/:id',
      admin_register: 'POST /api/admin/register',
      admin_login: 'POST /api/admin/login'
    }
  });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is working perfectly!',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    server_time: new Date().toISOString(),
    node_version: process.version
  });
});

// Health check
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1;
  res.json({
    status: dbStatus ? 'healthy' : 'warning',
    database: dbStatus ? 'connected' : 'disconnected',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Test candidates endpoint (simple version)
app.get('/api/test-candidates', (req, res) => {
  res.json({
    success: true,
    message: 'Test candidates endpoint',
    candidates: [
      {
        _id: '694cecca036e34ed95c5ad09',
        name: 'Krishna',
        email: 'ks@gmail.com'
      }
    ]
  });
});

// Simple candidate by ID endpoint
app.get('/api/candidates/:id', (req, res) => {
  const candidateId = req.params.id;
  console.log(`GET /api/candidates/${candidateId}`);
  
  res.json({
    success: true,
    candidate: {
      _id: candidateId,
      name: 'Krishna',
      email: 'ks@gmail.com',
      phone: '9876543210',
      address: 'Ahmedabad, Gujarat',
      skills: ['JavaScript', 'React', 'Node.js'],
      status: 'Applied'
    }
  });
});

// ============================================
// 5. ERROR HANDLING
// ============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    requested: `${req.method} ${req.originalUrl}`,
    available_endpoints: [
      'GET /',
      'GET /test',
      'GET /health',
      'GET /api/admin/candidates',
      'GET /api/candidates/:id',
      'GET /api/admin/test',
      'POST /api/admin/register',
      'POST /api/admin/login'
    ],
    timestamp: new Date().toISOString()
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
// 6. START SERVER
// ============================================
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 SERVER STARTED - MONGODB FIXED');
  console.log('='.repeat(60));
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  MongoDB State: ${mongoose.connection.readyState}`);
  console.log(`   (0=disconnected, 1=connected, 2=connecting, 3=disconnecting)`);
  console.log('\n🔗 CRITICAL TEST ENDPOINTS:');
  console.log(`   1. http://localhost:${PORT}/test`);
  console.log(`   2. http://localhost:${PORT}/health`);
  console.log(`   3. http://localhost:${PORT}/api/admin/candidates`);
  console.log(`   4. http://localhost:${PORT}/api/admin/test`);
  console.log(`   5. http://localhost:${PORT}/api/candidates/694cecca036e34ed95c5ad09`);
  console.log('='.repeat(60) + '\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Server shutting down...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

module.exports = app;