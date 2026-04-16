const mongoose = require('mongoose');
const Medicine = require('../models/Medicine');
const DoseLog = require('../models/DoseLog');
require('dotenv').config();

const userId = '69d96f86596d7439acae9e1f'; // Priya's ID

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB...');

        // Clear existing for this user
        await Medicine.deleteMany({ userId });
        await DoseLog.deleteMany({ userId });

        const meds = [
            {
                userId,
                name: 'Amoxicillin',
                dosage: '500mg',
                frequency: ['08:00', '20:00'],
                currentStock: 100,
                isActive: true
            },
            {
                userId,
                name: 'Metformin',
                dosage: '500mg',
                frequency: ['13:00'],
                currentStock: 100,
                isActive: true
            },
            {
                userId,
                name: 'Lisinopril',
                dosage: '10mg',
                frequency: ['09:00'],
                currentStock: 100,
                isActive: true
            }
        ];

        const createdMeds = await Medicine.insertMany(meds);
        console.log(`✅ Seeded ${createdMeds.length} medicines.`);

        // Seed some history logs for the chart
        const logs = [];
        const days = 7;
        for (let i = 0; i < days; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            // Randomly add 2-3 taken doses and 0-1 skipped per day
            const takenCount = Math.floor(Math.random() * 2) + 2;
            const skippedCount = Math.floor(Math.random() * 2);

            for (let j = 0; j < takenCount; j++) {
                logs.push({
                    medicineId: createdMeds[0]._id,
                    userId,
                    status: 'taken',
                    takenAt: date
                });
            }
            for (let j = 0; j < skippedCount; j++) {
                logs.push({
                    medicineId: createdMeds[1]._id,
                    userId,
                    status: 'skipped',
                    takenAt: date
                });
            }
        }

        await DoseLog.insertMany(logs);
        console.log(`✅ Seeded ${logs.length} dose logs.`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seed();
