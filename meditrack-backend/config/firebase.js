
const admin = require('firebase-admin');

try {
    const serviceAccount = require('./firebase-service-account.json'); // Double check this filename!
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log("🔥 Firebase Admin Initialized");
} catch (error) {
    console.error("❌ Firebase Init Error:", error.message);
    // Setting admin to null prevents the app from crashing if Firebase fails
    module.exports = null; 
}

module.exports = admin;