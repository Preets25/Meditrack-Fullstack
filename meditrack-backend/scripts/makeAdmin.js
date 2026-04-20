const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars from backend root
dotenv.config({ path: path.join(__dirname, '../.env') });

const makeAdmin = async () => {
  try {
    const email = process.argv[2];
    if (!email) {
      console.error('Please provide an email. Example: node scripts/makeAdmin.js user@example.com');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    const user = await User.findOneAndUpdate(
      { email: email },
      { role: 'admin' },
      { new: true }
    );

    if (!user) {
      console.error('User not found!');
    } else {
      console.log(`SUCCESS: ${user.name} (${user.email}) is now an ADMIN.`);
    }

    await mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
};

makeAdmin();
