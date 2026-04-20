/**
 * Run: node check-users.js
 * Shows all users in the database and lets you reset a password.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI;

const UserSchema = new mongoose.Schema({
  name: String,
  username: String,
  email: String,
  password: String,
  role: String,
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB\n');

  const users = await User.find({}, 'name username email role createdAt');
  
  if (users.length === 0) {
    console.log('⚠️  No users found in database. You need to Register first!\n');
  } else {
    console.log(`Found ${users.length} user(s):\n`);
    users.forEach((u, i) => {
      console.log(`  ${i+1}. Name:     ${u.name}`);
      console.log(`     Username: ${u.username}`);
      console.log(`     Email:    ${u.email}`);
      console.log(`     Role:     ${u.role}`);
      console.log(`     Created:  ${u.createdAt?.toLocaleDateString()}`);
      console.log('');
    });
  }

  // ── Reset password for darshnipriya67@gmail.com ──────────────────────
  const TARGET_EMAIL = 'darshnipriya67@gmail.com';
  const NEW_PASSWORD = 'Meditrack@123';

  const user = await User.findOne({ email: TARGET_EMAIL }).select('+password');
  if (user) {
    const hashed = await bcrypt.hash(NEW_PASSWORD, 10);
    await User.findByIdAndUpdate(user._id, { password: hashed });
    console.log(`✅ Password RESET for ${TARGET_EMAIL}`);
    console.log(`   New password: ${NEW_PASSWORD}`);
    console.log(`   Login with: ${TARGET_EMAIL} / ${NEW_PASSWORD}\n`);
  } else {
    // Create the user if they don't exist
    const hashed = await bcrypt.hash(NEW_PASSWORD, 10);
    await User.create({
      name: 'Darshni Priya',
      username: 'darshnipriya',
      email: TARGET_EMAIL,
      password: hashed,
      role: 'shop_owner',
    });
    console.log(`✅ Created new account for ${TARGET_EMAIL}`);
    console.log(`   Password: ${NEW_PASSWORD}`);
    console.log(`   Login with: ${TARGET_EMAIL} / ${NEW_PASSWORD}\n`);
  }

  await mongoose.disconnect();
  console.log('Done! You can now login with the credentials above.');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
