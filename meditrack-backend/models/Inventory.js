const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true
    },
    name: { type: String, required: true },
    genericName: { type: String },
    category: {
        type: String,
        enum: ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Topical', 'Drops', 'Inhaler', 'Supplement', 'Device', 'Other'],
        default: 'Tablet'
    },
    manufacturer: { type: String },
    price: { type: Number, required: true, min: 0 },
    mrp: { type: Number },
    quantity: { type: Number, required: true, default: 0, min: 0 },
    unit: { type: String, default: 'units' }, // units, strips, bottles, vials
    reorderLevel: { type: Number, default: 10 }, // warn when stock <= this
    expiryDate: { type: Date },
    batchNumber: { type: String },
    requiresPrescription: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    description: { type: String }
}, { timestamps: true });

// Virtual: is low stock
InventorySchema.virtual('isLowStock').get(function () {
    return this.quantity > 0 && this.quantity <= this.reorderLevel;
});

// Virtual: is out of stock
InventorySchema.virtual('isOutOfStock').get(function () {
    return this.quantity === 0;
});

module.exports = mongoose.model('Inventory', InventorySchema);
