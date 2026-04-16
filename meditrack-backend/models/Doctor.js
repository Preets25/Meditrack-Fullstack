const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    doctorName: { type: String, required: true },
    specialization: { type: String, required: true },
    days: [{ type: String }], // ["Monday", "Wednesday"]
    availableDates: { type: String }, // "Oct 20 - Oct 25"
    timings: { type: String, required: true } // "10:00 AM - 02:00 PM"
}, { timestamps: true });

module.exports = mongoose.model('Doctor', DoctorSchema);
