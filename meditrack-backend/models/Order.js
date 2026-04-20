const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true
    },
    medicineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medicine'
    },
    medicineName: { 
        type: String, 
        required: true 
    },
    quantity: { 
        type: Number, 
        default: 1 
    },
    price: {
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number,
        default: 0
    },
    status: { 
        type: String, 
        enum: ['Pending', 'Accepted', 'Ready for Pickup', 'Completed', 'Cancelled'], 
        default: 'Pending' 
    },
    paymentStatus: {
        type: String,
        enum: ['Unpaid', 'Paid'],
        default: 'Unpaid'
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'UPI', 'Card', 'Online'],
        default: 'Cash'
    },
    notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
