const express = require('express');
const router = express.Router();
const DoseLog = require('../models/DoseLog');
const { protect } = require('../Middleware/Auth');

// @desc    Get dose history for the last 7 days
// @route   GET /api/doses/history
router.get('/history', protect, async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Map for days of the week
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const historyMap = {};

        // Initialize last 7 days with zeros
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dayName = days[d.getDay()];
            historyMap[dayName] = { day: dayName, taken: 0, skipped: 0 };
        }

        const logs = await DoseLog.find({
            userId: req.user._id,
            takenAt: { $gte: sevenDaysAgo }
        });

        logs.forEach(log => {
            const dayName = days[new Date(log.takenAt).getDay()];
            if (historyMap[dayName]) {
                if (log.status === 'taken') historyMap[dayName].taken++;
                else historyMap[dayName].skipped++;
            }
        });

        // Convert back to sorted array (reverse of creation order to get chronological)
        const result = Object.values(historyMap).reverse();
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
