const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { redisClient, transporter, isRedisReady } = require('../utils/services');

// 1. ADD THIS LINE: Import the protect middleware
const { protect } = require('../Middleware/Auth'); 
const { body, validationResult } = require('express-validator');


// @desc    Register a user
// @route   POST /api/auth/register
router.post('/register', [
    body('name').notEmpty().withMessage('Name is required'),
    body('username').notEmpty().withMessage('Username is required').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['patient', 'shop_owner']).withMessage('Invalid role')
], async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    try {
        const { name, username, email, password, role: bodyRole } = req.body;
        const role = bodyRole || 'patient';
        const user = await User.create({
            name,
            username: username?.trim().toLowerCase(),
            email: email.trim().toLowerCase(),
            password,
            role
        });
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );
        res.status(201).json({ 
            success: true, 
            token,
            user: { _id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (err) {
        if (err.code === 11000) {
            const field = Object.keys(err.keyValue)[0];
            return res.status(400).json({ success: false, message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists` });
        }
        next(err);
    }
});

// @desc    Login user
// @route   POST /api/auth/login
router.post('/login', [
    body('identifier').notEmpty().withMessage('Email or Username is required'),
    body('password').exists().withMessage('Password is required')
], async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    try {
        const { identifier, password } = req.body;
        const identifierLower = identifier.trim().toLowerCase();
        const isEmail = identifierLower.includes('@');

        // Build query: always try email match; also try username if not obviously an email
        const query = isEmail
            ? { email: identifierLower }
            : { $or: [{ email: identifierLower }, { username: identifierLower }] };

        const user = await User.findOne(query).select('+password');

        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );
        res.status(200).json({ 
            success: true, 
            token, 
            user: { _id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (err) {
        next(err);
    }
});

// 2. ADD THIS ROUTE: This is your test-protected route
//GET: /api/auth/test-protected
router.get('/test-protected', protect, (req, res) => {
    res.json({
        success: true,
        message: "You have accessed a protected route!",
        user: req.user 
    });
});

// @desc    Forgot Password - Send OTP
// @route   POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save OTP to user document (Expires in 10 minutes)
        user.resetOtp = otp;
        user.resetOtpExpire = Date.now() + 10 * 60 * 1000;
        await user.save();

        // Send Email
        await transporter.sendMail({
            to: email,
            subject: "MediTrack Password Reset OTP",
            text: `Your 6-digit OTP is: ${otp}. It expires in 10 minutes.`
        });

        res.json({ success: true, message: "OTP sent to email" });
    } catch (err) {
        next(err);
    }
});

// @desc    Reset Password with OTP
// @route   POST /api/auth/reset-password
router.post('/reset-password', async (req, res, next) => {
    try {
        const { email, otp, newPassword } = req.body;
        
        const user = await User.findOne({ email });
        
        if (!user || user.resetOtp !== otp || user.resetOtpExpire < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        // Update password and clear OTP
        user.password = newPassword;
        user.resetOtp = undefined;
        user.resetOtpExpire = undefined;
        await user.save();

        res.json({ success: true, message: "Password updated successfully" });
    } catch (err) {
        next(err);
    }
});

// Update FCM Token for push notifications
router.post('/fcm-token', protect, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user._id, { fcmToken: req.body.token });
        res.json({ success: true, message: "FCM Token updated" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;