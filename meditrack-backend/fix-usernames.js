require('dotenv').config();
const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({ name: String, username: String, email: String, password: String, role: String }, { timestamps: true });
const User = mongoose.model('User', UserSchema);

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const users = await User.find({ $or: [{ username: null }, { username: '' }, { username: { $exists: false } }] });
  let fixed = 0;
  for (const u of users) {
    const base = u.email.split('@')[0].replace(/[^a-z0-9]/gi, '_').toLowerCase();
    // Make unique by appending part of Mongo ID if needed
    const candidate = base + '_' + u._id.toString().slice(-4);
    try {
      await User.updateOne({ _id: u._id }, { $set: { username: candidate } });
      console.log('Fixed:', u.email, '->', candidate);
      fixed++;
    } catch (e) {
      console.log('Skip (error):', u.email, e.message);
    }
  }
  console.log('\nDone -', fixed, 'usernames populated.');
  await mongoose.disconnect();
}).catch(e => { console.error(e.message); process.exit(1); });
