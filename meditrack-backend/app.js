const express = require('express');
const cors = require('cors');

// Import Route Files
const authRoutes = require('./routes/auth');
const medicineRoutes = require('./routes/medicines');
const shopRoutes = require('./routes/shops');
const adminRoutes = require('./routes/admin');
const doseRoutes = require('./routes/doses');

const app = express();

// 1. Global Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'], // Allow React Frontend
    credentials: true
}));
app.use(express.json()); // Allow JSON body parsing

// 2. Route Mounting
app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/doses', doseRoutes);

// 3. Health Check Route
app.get('/', (req, res) => {
    res.status(200).json({ status: "success", message: "MediTrack API is active" });
});

// 4. Centralized Error Handler
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || "Server Error",
        stack: process.env.NODE_ENV === 'development' ? err.stack : null
    });
});

module.exports = app;