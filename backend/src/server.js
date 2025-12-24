// server.js - Full Code with Mobile CORS Fix
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ============================================
// CORS Configuration - FIX FOR MOBILE DEVICES
// ============================================
const allowedOrigins = [
  // Production Frontend
  'https://project-job-ashy.vercel.app',
  
  // Local Development
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  
  // Mobile/Android/iOS
  'capacitor://localhost',
  'ionic://localhost',
  'http://localhost',
  
  // Vercel Preview Deployments (All subdomains)
  /\.vercel\.app$/,  // Regex for *.vercel.app
  
  // Network URLs (for testing on same network)
  /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/,
  /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/
];

// Enable CORS with detailed configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, postman)
    if (!origin) {
      console.log('✅ No origin - Allowing request (Mobile/App)');
      return callback(null, true);
    }
    
    // Check exact matches
    if (allowedOrigins.includes(origin)) {
      console.log(`✅ CORS Allowed (Exact match): ${origin}`);
      return callback(null, true);
    }
    
    // Check regex patterns
    let isAllowed = false;
    for (const pattern of allowedOrigins) {
      if (pattern instanceof RegExp && pattern.test(origin)) {
        console.log(`✅ CORS Allowed (Regex match): ${origin}`);
        isAllowed = true;
        break;
      }
    }
    
    if (isAllowed) {
      return callback(null, true);
    }
    
    // Log blocked origins for debugging
    console.log(`❌ CORS Blocked Origin: ${origin}`);
    console.log('📋 Allowed Origins:', allowedOrigins);
    
    // For development, you can allow all (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️  Development mode - Allowing all origins');
      return callback(null, true);
    }
    
    return callback(new Error(`CORS policy does not allow access from ${origin}`), false);
  },
  credentials: true, // Important for cookies/auth headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Authorization', 'Content-Length', 'X-Request-ID'],
  maxAge: 86400 // 24 hours
}));

// ============================================
// Basic Middleware
// ============================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// Request Logging Middleware (for debugging)
// ============================================
app.use((req, res, next) => {
  console.log('\n📥 Incoming Request:');
  console.log(`   Method: ${req.method}`);
  console.log(`   URL: ${req.originalUrl}`);
  console.log(`   Origin: ${req.headers.origin || 'No origin'}`);
  console.log(`   User-Agent: ${req.headers['user-agent']?.substring(0, 50)}...`);
  next();
});

// ============================================
// Import Routes
// ============================================
const userRoutes = require('./routes/userRoutes');
const jobRoutes = require('./routes/jobRoutes');
const adminRoutes = require('./routes/adminRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const authRoutes = require('./routes/authRoutes');

// ============================================
// Use Routes
// ============================================
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/auth', authRoutes);

// ============================================
// Test & Health Check Routes
// ============================================

// Home route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Job Portal API', 
    status: 'running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    availableEndpoints: {
      users: '/api/users',
      jobs: '/api/jobs',
      admin: '/api/admin',
      auth: '/api/auth',
      candidates: '/api/candidates',
      test: '/api/test',
      health: '/api/health'
    }
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true,
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    cors: {
      origin: req.headers.origin || 'No origin header',
      allowed: true
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    service: 'job-portal-api',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// CORS preflight handling
app.options('*', cors()); // Handle all OPTIONS requests

// ============================================
// 404 Handler
// ============================================
app.use((req, res) => {
  console.log(`❌ 404: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
    suggestion: 'Check / endpoint for available endpoints'
  });
});

// ============================================
// Error Handler
// ============================================
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err.message);
  console.error('Stack:', err.stack);
  
  // Handle CORS errors specifically
  if (err.message.includes('CORS')) {
    return res.status(403).json({ 
      error: 'CORS Error',
      message: err.message,
      yourOrigin: req.headers.origin,
      fix: 'Contact admin to add your origin to allowed list'
    });
  }
  
  res.status(500).json({ 
    error: 'Server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// MongoDB Connection
// ============================================
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected Successfully');
    console.log(`   Database: ${mongoose.connection.db.databaseName}`);
    console.log(`   Host: ${mongoose.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.log('⚠️  Trying to reconnect in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

// MongoDB connection events
mongoose.connection.on('error', err => {
  console.error('❌ MongoDB Error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB Disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB Reconnected');
});

// ============================================
// Start Server
// ============================================
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to database first
    await connectDB();
    
    // Start server
    app.listen(PORT, () => {
      console.log('\n🚀 ============================================');
      console.log(`   Server running on PORT: ${PORT}`);
      console.log('   Environment:', process.env.NODE_ENV || 'development');
      console.log('   ============================================\n');
      console.log('📋 Available Endpoints:');
      console.log(`   Main:     http://localhost:${PORT}/`);
      console.log(`   Test:     http://localhost:${PORT}/api/test`);
      console.log(`   Health:   http://localhost:${PORT}/api/health`);
      console.log(`   Users:    http://localhost:${PORT}/api/users/login`);
      console.log(`   Jobs:     http://localhost:${PORT}/api/jobs`);
      console.log(`   Admin:    http://localhost:${PORT}/api/admin/login`);
      console.log(`   Auth:     http://localhost:${PORT}/api/auth`);
      console.log('\n📱 Mobile Testing:');
      console.log('   Your site: https://project-job-ashy.vercel.app');
      console.log('   API: ' + (process.env.BACKEND_URL || `http://localhost:${PORT}`));
      console.log('============================================\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed');
  process.exit(0);
});

// Start the server
startServer();

module.exports = app; // For testing