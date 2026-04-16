let admin = require('firebase-admin');

try {
    let serviceAccount;
    
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        // Use environment variable if available (Production)
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } else {
        // Fallback to local file (Development)
        serviceAccount = require('./firebase-service-account.json');
    }

    if (admin.apps.length === 0) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }
    console.log("🔥 Firebase Admin Initialized");
} catch (error) {
    console.warn("⚠️ Firebase Init Warning:", error.message);
    // Setting admin to null prevents the app from crashing
    admin = null; 
}

module.exports = admin;