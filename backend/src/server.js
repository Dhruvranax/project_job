// server.js - Fixed version with CORS error resolved
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Load environment variables - ONLY for local development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app = express();

// ============================================
// 1. CORS Configuration (FIXED)
// ============================================
const allowedOrigins = [
  'https://project-job-ashy.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'https://project-job-ashy-git-main-dhruvranaxe-projects.vercel.app'
];

// CORS middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`⚠️ CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle preflight requests - FIXED: Use app.use instead of app.options
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    return res.status(200).end();
  }
  next();
});

// ============================================
// 2. Middleware
// ============================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logger
app.use((req, res, next) => {
  console.log(`📥 [${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log(`   Origin: ${req.headers.origin || 'No origin'}`);
  next();
});

// ============================================
// 3. MongoDB Connection
// ============================================
console.log('🔗 MongoDB Connection Initializing...');
console.log('   NODE_ENV:', process.env.NODE_ENV);
console.log('   MONGO_URI exists:', !!process.env.MONGO_URI);

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://job_database:jobportal23@cluster0.1r7jdaj.mongodb.net/jobportal?retryWrites=true&w=majority';

const connectWithRetry = () => {
  mongoose.connect(MONGO_URI)
    .then(() => {
      console.log('✅ MongoDB Connected Successfully!');
      console.log('   Database:', mongoose.connection.db?.databaseName || 'jobportal');
      console.log('   Host:', mongoose.connection.host);
    })
    .catch(err => {
      console.error('❌ MongoDB Connection Failed:', err.message);
      console.log('🔄 Retrying connection in 5 seconds...');
      setTimeout(connectWithRetry, 5000);
    });
};

connectWithRetry();

// MongoDB event listeners
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
// 4. Import Routes
// ============================================
console.log('📂 Loading routes...');

// Load routes with error handling
try {
  // Try to load user routes
  try {
    const userRoutes = require('./routes/userRoutes');
    app.use('/api/users', userRoutes);
    console.log('   ✅ userRoutes loaded');
  } catch (err) {
    console.log('   ⚠️ userRoutes not found or error:', err.message);
  }
  
  // Try to load job routes
  try {
    const jobRoutes = require('./routes/jobRoutes');
    app.use('/api/jobs', jobRoutes);
    console.log('   ✅ jobRoutes loaded');
  } catch (err) {
    console.log('   ⚠️ jobRoutes not found or error:', err.message);
  }
  
  // Try to load admin routes
  try {
    const adminRoutes = require('./routes/adminRoutes');
    app.use('/api/admin', adminRoutes);
    console.log('   ✅ adminRoutes loaded');
  } catch (err) {
    console.log('   ⚠️ adminRoutes not found or error:', err.message);
  }
  
  console.log('✅ Routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading routes:', error.message);
}

// ============================================
// 5. Basic Routes
// ============================================

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Job Portal API',
    status: 'running',
    version: '2.0.1',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    endpoints: {
      users: '/api/users',
      jobs: '/api/jobs',
      admin: '/api/admin',
      health: '/health',
      test: '/test-db'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.json({
    status: dbStatus === 'connected' ? 'healthy' : 'warning',
    database: dbStatus,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Database test endpoint
app.get('/test-db', async (req, res) => {
  try {
    res.json({
      success: true,
      mongodb: {
        connected: mongoose.connection.readyState === 1,
        state: mongoose.connection.readyState,
        host: mongoose.connection.host,
        name: mongoose.connection.name
      },
      environment: process.env.NODE_ENV,
      server_time: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database test failed',
      error: error.message
    });
  }
});

// Test POST endpoint
app.post('/test-register', (req, res) => {
  console.log('📝 Test register request:', req.body);
  
  res.json({
    success: true,
    message: 'Test endpoint working',
    received_data: req.body,
    server_time: new Date().toISOString()
  });
});

// Simple echo endpoint
app.post('/echo', (req, res) => {
  res.json({
    received: req.body,
    timestamp: new Date().toISOString()
  });
});

// ============================================
// 6. Fallback Sample Routes
// ============================================

// Sample jobs endpoint (if main routes fail)
app.get('/api/sample-jobs', (req, res) => {
  res.json({
    success: true,
    count: 3,
    jobs: [
      { id: 1, title: 'Software Developer', company: 'Tech Corp', location: 'Ahmedabad' },
      { id: 2, title: 'Web Designer', company: 'Design Studio', location: 'Remote' },
      { id: 3, title: 'Project Manager', company: 'Management Inc', location: 'Mumbai' }
    ],
    note: 'This is sample data. Check if /api/jobs route is working.'
  });
});

// ============================================
// 7. Error Handling
// ============================================

// 404 handler - FIXED: Use regex instead of '*'
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    requested_url: req.originalUrl,
    method: req.method,
    available_endpoints: [
      'GET /',
      'GET /health',
      'GET /test-db',
      'POST /test-register',
      'POST /echo',
      'GET /api/jobs',
      'GET /api/users',
      'GET /api/admin',
      'GET /api/sample-jobs'
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('💥 Global Error Handler:', err.message);
  
  // CORS error
  if (err.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      message: 'CORS Error: Origin not allowed',
      allowed_origins: allowedOrigins,
      your_origin: req.headers.origin
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? 'Contact administrator' : err.message
  });
});

// ============================================
// 8. Start Server
// ============================================
const PORT = process.env.PORT || 5000;

// Check if running locally (not on Vercel)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log('\n' + '='.repeat(50));
    console.log('🚀 Server Started Successfully!');
    console.log('='.repeat(50));
    console.log(`   Port: ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   MongoDB: ${mongoose.connection.readyState === 1 ? '✅ Connected' : '🔄 Connecting...'}`);
    console.log(`   Local URL: http://localhost:${PORT}`);
    console.log('\n📋 Test Endpoints:');
    console.log(`   🔗 http://localhost:${PORT}/`);
    console.log(`   🔗 http://localhost:${PORT}/health`);
    console.log(`   🔗 http://localhost:${PORT}/test-db`);
    console.log('='.repeat(50) + '\n');
  });
}

// Export for Vercel serverless
module.exports = app;