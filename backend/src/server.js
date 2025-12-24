const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Basic middleware
const allowedOrigins = [
  'https://project-job-ashy.vercel.app', // તમારું frontend
  'http://localhost:3000', // Local development
  'https://project-job-i2vd.vercel.app' // તમારું backend (self)
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin
    if (!origin) return callback(null, true);
    
    // Check allowed origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Allow all vercel.app subdomains
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    
    console.log('❌ CORS Blocked Origin:', origin);
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/admin/candidates', require('./routes/candidateRoutes'));

// Import ONLY the routes you have
const userRoutes = require('./routes/userRoutes');
const jobRoutes = require('./routes/jobRoutes');
const adminRoutes = require('./routes/adminRoutes'); // ✅ This is your adminRoutes.js file

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/admin', adminRoutes); // ✅ Only these three routes

// Home route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Job Portal API', 
    status: 'running',
    availableEndpoints: {
      users: '/api/users',
      jobs: '/api/jobs',
      admin: '/api/admin'
    }
  });
});

// Test route
app.get('/test', (req, res) => {
  res.json({ 
    success: true,
    message: 'Server is running'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.originalUrl 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ 
    error: 'Server error',
    message: err.message 
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
  })
  .catch(err => {
    console.error('❌ MongoDB Error:', err.message);
  });

// Start server
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on PORT: ${PORT}`);
  console.log('\n📋 Available Endpoints:');
  
  // Dynamic URLs based on environment
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? `https://project-job-i2vd.vercel.app`
    : `http://localhost:${PORT}`;
  
  console.log(`   Base URL: ${baseUrl}`);
  console.log(`   Users:    POST ${baseUrl}/api/users/login`);
  console.log(`   Jobs:     GET ${baseUrl}/api/jobs`);
  console.log(`   Admin:    POST ${baseUrl}/api/admin/login`);
  console.log(`   Test:     GET ${baseUrl}/test`);
  console.log(`   Health:   GET ${baseUrl}/health`);
  
  // Add production info
  if (process.env.NODE_ENV === 'production') {
    console.log('\n🌐 Production Deployment:');
    console.log(`   Frontend: https://project-job-ashy.vercel.app`);
    console.log(`   Backend:  ${baseUrl}`);
    console.log(`   MongoDB:  ${mongoose.connection.readyState === 1 ? '✅ Connected' : '❌ Disconnected'}`);
  }
});