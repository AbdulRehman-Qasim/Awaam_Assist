const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const Admin = require('../models/AdminSchema');

async function testPassword() {
  try {
    const mongoUri = process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const admin = await Admin.findOne({ admin_email: 'admin.services.hospital.lahore@gmail.com' });
    if (!admin) {
      console.log('Admin not found');
      process.exit(1);
    }

    const testPass = 'dummy123';
    const isMatch = await bcrypt.compare(testPass, admin.password);
    console.log(`Password "${testPass}" matches hashed password in DB? ${isMatch}`);

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

testPassword();
