const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const Admin = require('../models/AdminSchema');
const HospitalAdmin = require('../models/HospitalAdminSchema');

async function listAdmins() {
  try {
    const mongoUri = process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const admins = await Admin.find({ role: 'hospital_admin' });
    console.log(`Found ${admins.length} hospital admins in standard 'admins' collection:`);
    
    admins.slice(0, 10).forEach(admin => {
      console.log(`- Email: "${admin.admin_email}" | Name: "${admin.admin_name}" | Approved: ${admin.isApproved} | Onboarded: ${admin.is_onboarded} | Status: "${admin.status}"`);
    });
    if (admins.length > 10) {
      console.log(`... and ${admins.length - 10} more.`);
    }

    const superAdmins = await Admin.find({ role: 'super_admin' });
    console.log(`\nFound ${superAdmins.length} super admins:`);
    superAdmins.forEach(admin => {
      console.log(`- Email: "${admin.admin_email}" | Name: "${admin.admin_name}" | Approved: ${admin.isApproved} | Status: "${admin.status}"`);
    });

    const hospitalAdmins = await HospitalAdmin.find({});
    console.log(`\nFound ${hospitalAdmins.length} hospital admins in custom 'hospital_admins' collection:`);
    hospitalAdmins.slice(0, 10).forEach(admin => {
      console.log(`- Email: "${admin.admin_email}" | Name: "${admin.admin_name}" | Approved: ${admin.isApproved} | Status: "${admin.status}"`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error running check script:', error);
    process.exit(1);
  }
}

listAdmins();
