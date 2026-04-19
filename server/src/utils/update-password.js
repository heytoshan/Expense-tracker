require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const updatePassword = async (email, newPassword) => {
  try {
    if (!email || !newPassword) {
      console.log('Usage: node update-password.js <email> <newPassword>');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    
    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log(`❌ User with email ${email} not found.`);
    } else {
      // The User model has a pre-save hook that hashes the password
      user.password = newPassword;
      await user.save();
      console.log(`✅ Password updated successfully for ${email}.`);
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.connection.close();
  }
};

const email = process.argv[2];
const newPass = process.argv[3];

updatePassword(email, newPass);
