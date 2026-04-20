const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Shop = require('../models/Shop');
const Medicine = require('../models/Medicine');
const { protect, authorize } = require('../Middleware/Auth');

// Superuser Dashboard Stats
router.get('/stats', protect, authorize('admin'), async (req, res) => {
    try {
        const patients = await User.countDocuments({ role: 'patient' });
        const shopOwners = await User.countDocuments({ role: 'shop_owner' });
        const shops = await Shop.countDocuments();
        const activeMeds = await Medicine.countDocuments({ isActive: true });
        
        // Fetch recently registered users for the activity feed
        const recentUsers = await User.find()
            .select('name email role createdAt')
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            success: true,
            stats: { patients, shopOwners, shops, activeMeds },
            recentUsers
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error retrieving stats' });
    }
});

module.exports = router;