const mongoose = require('mongoose');
require('dotenv').config();

const testURI = "mongodb+srv://darshnipillai25_db_user:Pt0LsZEk8LdZ6vR8@cluster0.szyxd66.mongodb.net/meditrack?retryWrites=true&w=majority";

async function test() {
    console.log('Connecting to Atlas...');
    try {
        await mongoose.connect(testURI, { serverSelectionTimeoutMS: 5000 });
        console.log('✅ Success! Connected to MongoDB Atlas.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Failed to connect to Atlas:', err.message);
        if (err.message.includes('IP address') || err.message.includes('not whitelisted')) {
            console.error('Hint: Your IP address is not whitelisted on MongoDB Atlas.');
        } else if (err.message.includes('Authentication failed')) {
            console.error('Hint: The database password might be wrong.');
        }
        process.exit(1);
    }
}

test();
