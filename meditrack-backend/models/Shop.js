const mongoose = require('mongoose');

const ShopSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    phone: { type: String },
    description: { type: String },
    licenseNumber: { type: String },
    gstNumber: { type: String },
    operatingHours: { type: String, default: '09:00 - 21:00' },
    openOn: { type: String, default: 'Mon–Sat' },
    /** WGS84 coordinates for map pin */
    latitude: { type: Number },
    longitude: { type: Number },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    doctorSchedule: [{
        doctorName: String,
        specialization: String,
        days: [String],
        availableDates: String,
        timings: String
    }],
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Shop', ShopSchema);