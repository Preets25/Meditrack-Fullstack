const mongoose = require('mongoose');

const DoseLogSchema = new mongoose.Schema({
    medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, default: 'taken' }, // 'taken' or 'skipped'
    takenAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DoseLog', DoseLogSchema);