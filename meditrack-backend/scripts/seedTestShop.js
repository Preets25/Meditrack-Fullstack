const mongoose = require('mongoose');
const User = require('../models/User');
const Shop = require('../models/Shop');
require('dotenv').config();

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB...');

        // 1. Create a Shop Owner
        const email = 'shop_test@meditrack.com';
        await User.deleteOne({ email });
        
        const owner = await User.create({
            name: 'Test Shop Owner',
            email: email,
            password: 'password123',
            role: 'shop_owner'
        });
        console.log(`✅ User created: ${email}`);

        // 2. Create a Shop for this owner
        await Shop.deleteOne({ owner: owner._id });
        const shop = await Shop.create({
            owner: owner._id,
            name: 'Medicine Mart',
            address: '123 Pharmacy St, Mumbai',
            contact: '9876543210',
            description: 'Your neighborhood medical store',
            location: {
                type: 'Point',
                coordinates: [72.8777, 19.0760] // Mumbai
            }
        });
        console.log(`✅ Shop created: ${shop.name}`);

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seed();
