const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const Admin = require('../models/AdminSchema');

async function resetSuperAdmins() {
  try {
    const mongoUri = process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const hashedPassword = await bcrypt.hash('superadmin123', 10);

    const emails = ['superadmin@awaamassist.com', 'superadmin@awamassist.com'];

    for (const email of emails) {
      await Admin.findOneAndUpdate(
        { admin_email: email.toLowerCase().trim() },
        {
          $set: {
            admin_name: 'Super Admin',
            password: hashedPassword,
            role: 'super_admin',
            is_super_admin: true,
            isApproved: true,
            status: 'active',
          },
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );
      console.log(`Ensured super admin: ${email}`);
    }

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

resetSuperAdmins();
