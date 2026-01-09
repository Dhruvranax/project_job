const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// 1. MIDDLEWARE
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173', 'https://project-job-ashy.vercel.app'],
    credentials: true
}));
app.use(express.json());

// 2. MONGODB CONNECTION
// .env માં MONGO_URI ચેક કરજો, નહીંતર નીચેની લિંક વપરાશે
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://job_database:jobportal23@cluster0.1r7jdaj.mongodb.net/jobportal';

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// 3. DATABASE MODELS (ભૂલ ન આવે તે માટે અહીં જ ડિફાઇન કર્યા છે)
const Job = mongoose.models.Job || mongoose.model('Job', new mongoose.Schema({
    title: String,
    company: String,
    status: { type: String, default: 'Open' }
}));

// 4. API ROUTES (ક્રમ મહત્વનો છે)

// Home Route
app.get('/', (req, res) => res.json({ message: "API is Running" }));

// Stats Route (Home.jsx ની 404 એરર સોલ્વ કરવા માટે)
app.get('/api/stats', async (req, res) => {
    try {
        const totalJobs = await Job.countDocuments();
        res.json({ success: true, totalJobs, totalCandidates: 10 });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Jobs Route (Home.jsx ની 500 એરર સોલ્વ કરવા માટે)
app.get('/api/jobs', async (req, res) => {
    try {
        const jobs = await Job.find();
        res.json({ success: true, jobs });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Login Route
app.post('/api/admin/login', (req, res) => {
    const { email, password } = req.body;
    if (email === 'admin@jobportal.com' && password === 'admin123') {
        res.json({ success: true, token: 'fake-token', admin: { email } });
    } else {
        res.status(401).json({ success: false, message: "Invalid credentials" });
    }
});

// 5. 404 HANDLER (આ સૌથી છેલ્લે જ હોવો જોઈએ)
app.use((req, res) => {
    res.status(404).json({ success: false, error: "Route not found", path: req.originalUrl });
});

// 6. SERVER START
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server: http://localhost:${PORT}`);
});