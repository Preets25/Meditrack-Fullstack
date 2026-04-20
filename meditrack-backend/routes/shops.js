const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Shop = require('../models/Shop');
const Review = require('../models/Review');
const Inventory = require('../models/Inventory');
const { protect, authorize } = require('../Middleware/Auth');

// ── Shared validation rules ───────────────────────────────────────────────────
const shopValidationRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Shop name is required.')
    .isLength({ min: 3, max: 100 }).withMessage('Shop name must be between 3 and 100 characters.'),

  body('address')
    .trim()
    .notEmpty().withMessage('Shop address is required.')
    .isLength({ min: 5 }).withMessage('Please enter a full valid address (min 5 characters).'),

  body('phone')
    .optional({ checkFalsy: true })
    .matches(/^[+\d][\d\s\-().]{6,19}$/).withMessage('Phone number format is invalid (e.g. +91 98765 43210).'),
];

// ── Helper: run validation and return errors ──────────────────────────────────
const validateRequest = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Return the first readable message for each field
    const messages = errors.array().map(e => e.msg);
    res.status(422).json({
      success: false,
      message: messages[0],          // primary message for toast / alert
      errors: messages               // full list for displaying per-field if needed
    });
    return false;
  }
  return true;
};


// ─────────────────────────────────────────────────────────────────
// 1. GET ALL SHOPS (Public)
// ─────────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        const shops = await Shop.find();
        res.json({ success: true, data: shops });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ─────────────────────────────────────────────────────────────────
// 1.5 GLOBAL INVENTORY SEARCH
// ─────────────────────────────────────────────────────────────────
router.get('/search', protect, async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json({ success: true, results: [] });

        // Find available inventory items matching the query
        const items = await Inventory.find({
            name: { $regex: q, $options: 'i' },
            isAvailable: true
        }).populate('shopId', 'name address city phone rating type');

        // Filter out any items where the shop was deleted or missing
        const results = items.filter(item => item.shopId);

        res.json({ success: true, results });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ─────────────────────────────────────────────────────────────────
// 2. GET MY SHOP (for logged-in shop owner)
// ─────────────────────────────────────────────────────────────────
router.get('/my', protect, authorize('shop_owner', 'admin'), async (req, res) => {
    try {
        const shop = await Shop.findOne({ owner: req.user._id });
        if (!shop) return res.status(404).json({ success: false, message: 'No shop found for this owner' });
        res.json({ success: true, data: shop });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 3. REGISTER A SHOP (Any logged in user can register)
// ─────────────────────────────────────────────────────────────────
router.post('/', protect, shopValidationRules, async (req, res) => {
    if (!validateRequest(req, res)) return;   // ← stops here if validation failed

    try {
        const User = require('../models/User');

        // Check if user already has a shop
        const existing = await Shop.findOne({ owner: req.user._id });
        if (existing) {
            return res.status(400).json({ success: false, message: 'You already have a registered shop.' });
        }

        const shop = await Shop.create({
            ...req.body,
            owner: req.user._id
        });

        // Upgrade user to shop_owner if they are a patient
        if (req.user.role === 'patient') {
            await User.findByIdAndUpdate(req.user._id, { role: 'shop_owner' });
        }

        res.status(201).json({ success: true, data: shop });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


// ─────────────────────────────────────────────────────────────────
// 4. UPDATE SHOP (owner or admin)
// ─────────────────────────────────────────────────────────────────
router.put('/:id', protect, authorize('shop_owner', 'admin'), shopValidationRules, async (req, res) => {
    if (!validateRequest(req, res)) return;   // ← stops here if validation failed

    try {
        const shop = await Shop.findById(req.params.id);
        if (!shop) return res.status(404).json({ message: 'Shop not found' });

        // Only the owner or admin can update
        if (req.user.role !== 'admin' && shop.owner?.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorised to update this shop' });
        }

        const updatedShop = await Shop.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.json({ success: true, data: updatedShop });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


// ─────────────────────────────────────────────────────────────────
// 5. ADD A REVIEW TO A SHOP
// ─────────────────────────────────────────────────────────────────
router.post('/:id/reviews', protect, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const shop = await Shop.findById(req.params.id);
        if (!shop) return res.status(404).json({ message: 'Shop not found' });

        const review = await Review.create({
            shopId: req.params.id,
            userId: req.user._id,
            userName: req.user.name,
            rating: Number(rating),
            comment
        });

        const reviews = await Review.find({ shopId: req.params.id });
        shop.numReviews = reviews.length;
        shop.rating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
        await shop.save();

        res.status(201).json({ success: true, message: 'Review added' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// ─────────────────────────────────────────────────────────────────
// 6. GET SINGLE SHOP DETAILS
// ─────────────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id);
        if (!shop) return res.status(404).json({ message: 'Shop not found' });

        const reviews = await Review.find({ shopId: req.params.id }).populate('userId', 'name');
        const Doctor = require('../models/Doctor');
        const standaloneDoctors = await Doctor.find({ shopId: req.params.id });
        
        // Merge standalone doctors with embedded schedule for full compatibility
        const doctors = standaloneDoctors.length > 0 ? standaloneDoctors : (shop.doctorSchedule || []);
        
        // Public inventory (available items only)
        const inventory = await Inventory.find({ shopId: req.params.id, isAvailable: true }).select('name category price quantity unit requiresPrescription');

        res.json({ success: true, data: { shop, reviews, doctors, inventory } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ─────────────────────────────────────────────────────────────────
// 7. ADD DOCTOR SCHEDULE TO SHOP
// ─────────────────────────────────────────────────────────────────
router.post('/:id/doctors', protect, authorize('shop_owner', 'admin'), async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id);
        if (!shop) return res.status(404).json({ message: 'Shop not found' });

        const Doctor = require('../models/Doctor');
        const doctor = await Doctor.create({ shopId: req.params.id, ...req.body });
        res.status(201).json({ success: true, data: doctor });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// ─────────────────────────────────────────────────────────────────
// 8. INVENTORY ROUTES  (nested under /shops/:id/inventory)
// ─────────────────────────────────────────────────────────────────

// GET all inventory for a shop (owner only)
router.get('/:id/inventory', protect, authorize('shop_owner', 'admin'), async (req, res) => {
    try {
        const items = await Inventory.find({ shopId: req.params.id });
        res.json({ success: true, data: items });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST add inventory item
router.post('/:id/inventory', protect, authorize('shop_owner', 'admin'), async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id);
        if (!shop) return res.status(404).json({ message: 'Shop not found' });

        const item = await Inventory.create({ ...req.body, shopId: req.params.id });
        res.status(201).json({ success: true, data: item });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT update inventory item
router.put('/:id/inventory/:itemId', protect, authorize('shop_owner', 'admin'), async (req, res) => {
    try {
        const item = await Inventory.findOneAndUpdate(
            { _id: req.params.itemId, shopId: req.params.id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!item) return res.status(404).json({ message: 'Inventory item not found' });
        res.json({ success: true, data: item });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE inventory item
router.delete('/:id/inventory/:itemId', protect, authorize('shop_owner', 'admin'), async (req, res) => {
    try {
        const item = await Inventory.findOneAndDelete({ _id: req.params.itemId, shopId: req.params.id });
        if (!item) return res.status(404).json({ message: 'Inventory item not found' });
        res.json({ success: true, message: 'Item removed' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;