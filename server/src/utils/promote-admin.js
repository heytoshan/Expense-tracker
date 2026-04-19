require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const promoteToAdmin = async (email) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { role: 'ADMIN' },
      { new: true }
    );

    if (!user) {
      console.log(`❌ User with email ${email} not found.`);
    } else {
      console.log(`✅ User ${email} has been promoted to ADMIN.`);
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.connection.close();
  }
};

const email = process.argv[2];
if (!email) {
  console.log('Usage: node promote-admin.js <email>');
  process.exit(1);
}

promoteToAdmin(email);
