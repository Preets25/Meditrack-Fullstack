const cron = require('node-cron');
const Medicine = require('../models/Medicine');
const DoseLog = require('../models/DoseLog');
const { transporter } = require('./services');
const admin = require('../config/firebase');

const startReminderJob = () => {
    cron.schedule('* * * * *', async () => {
        try {
            const now = new Date();
            const currentTime = now.getHours().toString().padStart(2, '0') + ":" + 
                                now.getMinutes().toString().padStart(2, '0');

            const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
            const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

            console.log(`\n--- ⏰ Cron Tick: ${currentTime} ---`);

            // Find medicines for this minute
            const medsToRemind = await Medicine.find({
                frequency: currentTime,
                isActive: true,
                startDate: { $lte: now },
                $or: [
                    { endDate: { $gte: now } },
                    { endDate: null },
                    { endDate: { $exists: false } }
                ]
            }).populate('userId');

            console.log(`🔍 Medicines scheduled for ${currentTime}: ${medsToRemind.length}`);

            for (const med of medsToRemind) {
                console.log(`Checking DoseLog for: ${med.name} (ID: ${med._id})`);

                // 2. CHECK DOSELOG
                const alreadyTaken = await DoseLog.findOne({
                    medicineId: med._id,
                    takenAt: { $gte: startOfToday, $lte: endOfToday }
                });

                if (alreadyTaken) {
                    // THIS IS THE MESSAGE YOU ARE LOOKING FOR
                    console.log(`✅ SKIP: ${med.name} was already taken today at ${alreadyTaken.takenAt}. No email sent.`);
                    continue;
                }

                console.log(`🚀 SENDING: No log found for ${med.name} today. Triggering alerts...`);

                // 3. Send Email
                transporter.sendMail({
                    to: med.userId.email,
                    subject: `💊 Reminder: ${med.name}`,
                    text: `It's ${currentTime}. Please take your ${med.name}.`
                }).then(() => console.log(`📧 Email sent to ${med.userId.email}`))
                  .catch(err => console.log("❌ Email Error:", err.message));

                // 4. Send Push
                if (med.userId.fcmToken && admin) {
                    admin.messaging().send({
                        notification: { title: 'Reminder', body: `Take ${med.name}` },
                        token: med.userId.fcmToken
                    }).then(() => console.log(`📱 Push sent to ${med.userId.name}`))
                      .catch(err => console.log("❌ Push Error:", err.message));
                }
            }
        } catch (error) {
            console.error("❌ Cron Error:", error);
        }
    });
};

module.exports = startReminderJob;