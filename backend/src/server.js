// server.js - Updated version
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ============================================
// 1. CORS Configuration (simplified for debugging)
// ============================================
app.use(cors({
  origin: '*', // Temporary - allow all for debugging
  credentials: true
}));

// ============================================
// 2. Enhanced Middleware
// ============================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// 3. Request Logger Middleware
// ============================================
app.use((req, res, next) => {
  console.log(`📥 ${new Date().toISOString()} ${req.method} ${req.url}`);
  console.log('   Origin:', req.headers.origin);
  console.log('   Content-Type:', req.headers['content-type']);
  next();
});

// ============================================
// 4. MongoDB Connection (Enhanced)
// ============================================
console.log('🔗 Attempting MongoDB Connection...');
console.log('   NODE_ENV:', process.env.NODE_ENV);
console.log('   MONGO_URI exists:', !!process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://job_database:jobportal23@cluster0.1r7jdaj.mongodb.net/jobportal?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('✅ MongoDB Connected Successfully!');
  console.log('   Database:', mongoose.connection.db?.databaseName);
  console.log('   Ready State:', mongoose.connection.readyState);
})
.catch(err => {
  console.error('❌ MongoDB Connection Failed!');
  console.error('   Error:', err.message);
  console.log('💡 Solutions:');
  console.log('   1. Check MONGO_URI in Vercel Environment Variables');
  console.log('   2. Whitelist IP 0.0.0.0/0 in MongoDB Atlas');
  console.log('   3. Verify database user credentials');
});

// ============================================
// 5. Import and Use Routes
// ============================================
// Add error handling for route imports
try {
  const userRoutes = require('./routes/userRoutes');
  const jobRoutes = require('./routes/jobsRoutes');
  const adminRoutes = require('./routes/adminRoutes');
  
  app.use('/api/users', userRoutes);
  app.use('/api/jobs', jobRoutes);
  app.use('/api/admin', adminRoutes);
  
  console.log('✅ Routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading routes:', error.message);
}

// ============================================
// 6. Test Routes
// ============================================
// Simple test endpoint
app.get('/test-db', (req, res) => {
  res.json({
    mongodb: {
      connected: mongoose.connection.readyState === 1,
      state: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name
    },
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Admin registration test endpoint
app.post('/test-register', (req, res) => {
  console.log('Test registration body:', req.body);
  res.json({
    success: true,
    message: 'Test endpoint working',
    receivedData: req.body,
    serverTime: new Date().toISOString()
  });
});

// Keep your existing routes...
app.get('/', (req, res) => {
  res.json({ 
    message: 'Job Portal API - Fixed Version',
    status: 'running',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development'
  });
});

// ... rest of your existing routes

// ============================================
// 7. Error Handling
// ============================================
app.use((err, req, res, next) => {
  console.error('💥 Server Error:', err.stack);
  res.status(500).json({
    error: 'Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Contact administrator' : err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// ============================================
// 8. Start Server
// ============================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('\n🚀 Server Started Successfully!');
  console.log(`   Port: ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   MongoDB: ${mongoose.connection.readyState === 1 ? '✅ Connected' : '❌ Disconnected'}`);
  console.log('\n📋 Test Endpoints:');
  console.log(`   http://localhost:${PORT}/test-db`);
  console.log(`   http://localhost:${PORT}/`);
  console.log(`   POST http://localhost:${PORT}/test-register`);
});