const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Shop = require('../models/Shop');
const { protect } = require('../Middleware/Auth');
const mongoose = require('mongoose');

// ── Shared: Get all orders (Admin or debugging only) ────────────────
router.get('/', protect, async (req, res) => {
    try {
        const filter = req.user.role === 'admin' ? {} : { patientId: req.user.id };
        const orders = await Order.find(filter).populate('shopId', 'name').sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: err.message });
        }
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── Patient: Create order ─────────────────────────────────────────
router.post('/', protect, async (req, res) => {
    try {
        if (req.user.role !== 'patient') return res.status(403).json({ message: 'Only patients can create orders' });
        
        const { shopId, medicineId, medicineName, quantity = 1, notes, price = 0, paymentMethod = 'Cash' } = req.body;
        const totalAmount = price * quantity;

        const order = new Order({
            patientId: req.user.id,
            shopId,
            medicineId,
            medicineName,
            quantity,
            notes,
            price,
            totalAmount,
            paymentMethod
        });
        
        await order.save();
        const populated = await order.populate('shopId', 'name address phone');
        res.status(201).json({ success: true, order: populated });
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: err.message });
        }
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── Patient: Get my orders ────────────────────────────────────────
router.get('/my', protect, async (req, res) => {
    try {
        if (req.user.role !== 'patient') return res.status(403).json({ message: 'Access denied' });
        const orders = await Order.find({ patientId: req.user.id })
            .populate('shopId', 'name address phone city')
            .sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: err.message });
        }
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── Patient: Cancel own order ─────────────────────────────────────
router.put('/:id/cancel', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (order.patientId.toString() !== req.user.id) return res.status(403).json({ message: 'Not your order' });
        if (['Completed', 'Cancelled'].includes(order.status)) {
            return res.status(400).json({ message: 'Cannot cancel a completed or already cancelled order' });
        }
        order.status = 'Cancelled';
        await order.save();
        res.json({ success: true, order });
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: err.message });
        }
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── Shop Owner: Get incoming orders ──────────────────────────────
router.get('/shop', protect, async (req, res) => {
    try {
        if (req.user.role !== 'shop_owner') return res.status(403).json({ message: 'Only shop owners can view incoming orders' });
        
        const shop = await Shop.findOne({ owner: req.user.id });
        if (!shop) return res.status(404).json({ message: 'No shop found. Please register your shop first.' });
        
        const orders = await Order.find({ shopId: shop._id })
            .populate('patientId', 'name email phone username')
            .sort({ createdAt: -1 });
            
        res.json({ success: true, orders });
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: err.message });
        }
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── Shop Owner: Update order status ──────────────────────────────
router.put('/:id', protect, async (req, res) => {
    try {
        if (req.user.role !== 'shop_owner') return res.status(403).json({ message: 'Access denied' });
        
        const { status, paymentStatus, price } = req.body;
        const validStatuses = ['Pending', 'Accepted', 'Ready for Pickup', 'Completed', 'Cancelled'];
        
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        
        const shop = await Shop.findOne({ owner: req.user.id });
        if (!shop || order.shopId.toString() !== shop._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this order' });
        }
        
        if (status) order.status = status;
        if (paymentStatus) order.paymentStatus = paymentStatus;
        if (price !== undefined) {
            order.price = price;
            order.totalAmount = price * order.quantity;
        }
        
        // Auto-mark payment as paid when completing
        if (status === 'Completed') order.paymentStatus = 'Paid';
        
        await order.save();
        res.json({ success: true, order });
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: err.message });
        }
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── Patient: Delete a cancelled order ────────────────────────────
router.delete('/:id', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (order.patientId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not your order' });
        }
        if (order.status !== 'Cancelled') {
            return res.status(400).json({ message: 'Only cancelled orders can be deleted' });
        }
        await order.deleteOne();
        res.json({ success: true, message: 'Order deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
