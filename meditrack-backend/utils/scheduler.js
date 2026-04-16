const cron = require('node-cron');
const Medicine = require('../models/Medicine');
const User = require('../models/User');
const { transporter } = require('./services');

/**
 * Sends consolidated reminders for a specific slot
 * @param {string} slot - 'Morning', 'Afternoon', 'Evening', or 'Night'
 */
const sendRemindersForSlot = async (slot) => {
    try {
        console.log(`[Scheduler] Checking for ${slot} reminders...`);
        
        // 1. Find all active medicines due for this slot
        // We look for medicines that haven't reached their endDate yet
        const today = new Date();
        const dueMeds = await Medicine.find({
            slots: slot,
            isActive: true,
            $or: [
                { endDate: { $exists: false } },
                { endDate: null },
                { endDate: { $gte: today } }
            ]
        }).populate('userId', 'name email');

        if (dueMeds.length === 0) return;

        // 2. Group by User
        const userMedsMap = {};
        dueMeds.forEach(med => {
            if (!med.userId || !med.userId.email) return;
            const email = med.userId.email;
            if (!userMedsMap[email]) {
                userMedsMap[email] = {
                    name: med.userId.name,
                    medicines: []
                };
            }
            userMedsMap[email].medicines.push(med);
        });

        // 3. Send Emails
        for (const [email, data] of Object.entries(userMedsMap)) {
            const medList = data.medicines.map(m => `<li><strong>${m.name}</strong> - ${m.dosage}</li>`).join('');
            
            const mailOptions = {
                from: `"Meditrack" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: `💊 Meditrack: Your ${slot} Medicine Reminder`,
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;">
                        <h2 style="color: #2563eb;">Good ${slot.toLowerCase() === 'morning' ? 'Morning' : slot.toLowerCase() === 'afternoon' ? 'Afternoon' : 'Evening'}, ${data.name}!</h2>
                        <p>It's time to take your <strong>${slot}</strong> medication:</p>
                        <ul style="background: #f8fafc; padding: 15px 40px; border-radius: 8px; color: #1e293b;">
                            ${medList}
                        </ul>
                        <p style="margin-top: 20px;">Once taken, please mark them in your Meditrack dashboard to maintain your adherence score.</p>
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" 
                               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                               Go to Dashboard
                            </a>
                        </div>
                        <hr style="margin-top: 40px; border: 0; border-top: 1px solid #e2e8f0;" />
                        <p style="font-size: 12px; color: #94a3b8; text-align: center;">You are receiving this because you set reminders on Meditrack.</p>
                    </div>
                `
            };

            await transporter.sendMail(mailOptions);
        }
        console.log(`[Scheduler] ${slot} reminders sent to ${Object.keys(userMedsMap).length} users.`);
    } catch (err) {
        console.error(`[Scheduler] Error sending ${slot} reminders:`, err.message);
    }
};

/**
 * Scans for low stock once a day
 */
const sendLowStockAlerts = async () => {
    try {
        console.log(`[Scheduler] Scanning for low stock...`);
        const lowStockMeds = await Medicine.find({
            isActive: true,
            currentStock: { $lt: 5 }
        }).populate('userId', 'name email');

        if (lowStockMeds.length === 0) return;

        const userMedsMap = {};
        lowStockMeds.forEach(med => {
            if (!med.userId || !med.userId.email) return;
            const email = med.userId.email;
            if (!userMedsMap[email]) {
                userMedsMap[email] = { name: med.userId.name, medicines: [] };
            }
            userMedsMap[email].medicines.push(med);
        });

        for (const [email, data] of Object.entries(userMedsMap)) {
            const medList = data.medicines.map(m => `<li>${m.name} (Stock: <strong>${m.currentStock}</strong>)</li>`).join('');
            
            const mailOptions = {
                from: `"Meditrack" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: `⚠️ Low Stock Alert: Meditrack`,
                html: `<h3>Hello ${data.name},</h3><p>The following medicines are running low. Please refill soon:</p><ul>${medList}</ul>`
            };
            await transporter.sendMail(mailOptions);
        }
    } catch (err) {
        console.error(`[Scheduler] Low stock error:`, err.message);
    }
};

const initScheduler = () => {
    console.log('✅ Medicine Scheduler Initialized');

    // 08:00 AM - Morning
    cron.schedule('0 8 * * *', () => sendRemindersForSlot('Morning'));

    // 02:00 PM - Afternoon
    cron.schedule('0 14 * * *', () => sendRemindersForSlot('Afternoon'));

    // 06:00 PM - Evening
    cron.schedule('0 18 * * *', () => sendRemindersForSlot('Evening'));

    // 09:00 PM - Night
    cron.schedule('0 21 * * *', () => sendRemindersForSlot('Night'));

    // 10:00 AM - Daily Low Stock Scan
    cron.schedule('0 10 * * *', sendLowStockAlerts);
    
    // For manual testing: Run every hour at minute 05 to see output if needed
    // cron.schedule('5 * * * *', () => console.log('[Scheduler] Alive and checking...'));
};

module.exports = { initScheduler, sendRemindersForSlot, sendLowStockAlerts };
