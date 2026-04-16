
const dotenv = require('dotenv');
dotenv.config(); // Must be Line 1

const app = require('./app');
const connectDB = require('./config/db');
const { initScheduler } = require('./utils/scheduler');

// 1. Connect to Database
connectDB();

// 2. Start the Automated Medicine Scheduler
try {
    initScheduler();
} catch (err) {
    console.error('❌ Scheduler failed to start:', err.message);
}

// 3. Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
});