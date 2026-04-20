const mongoose = require('mongoose');

const MedicineSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: { type: String, required: true },
    dosage: { type: String, required: true }, // e.g., "500mg"
    frequency: [{ type: String }], // Array of times like ["08:00", "20:00"]
    slots: [{ type: String }], // Array of labels like ["Morning", "Night"]
    instructions: { type: String }, // e.g., "Take after food"
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    isMonthly: { type: Boolean, default: false },
    currentStock: { type: Number, default: 0 },
    prescriptionImage: { type: String }, // URL to image
    reminderEmail: { type: String },
    stockAlertLevel: { type: Number, default: 10 },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Medicine', MedicineSchema);