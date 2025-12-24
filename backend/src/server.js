const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();


const allowedOrigins = [
  'https://project-job-ashy.vercel.app', // Your live site
  'http://localhost:3000' // For local development
];

// Basic middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  // credentials: true // If you are using cookies or authorization headers
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
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('\n📋 Available Endpoints:');
  console.log(`   Users:  POST http://localhost:${PORT}/api/users/login`);
  console.log(`   Jobs:   GET http://localhost:${PORT}/api/jobs`);
  console.log(`   Admin:  POST http://localhost:${PORT}/api/admin/login`);
  console.log(`   Test:   GET http://localhost:${PORT}/test`);
});