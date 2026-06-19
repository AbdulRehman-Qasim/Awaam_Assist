const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '../backend/.env') });

async function listAdmins() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/fyp';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const Admin = mongoose.model('Admin', new mongoose.Schema({}, { strict: false }), 'admins');
    
    const admins = await Admin.find({ role: 'hospital_admin' });
    console.log(`Found ${admins.length} hospital admins in standard 'admins' collection:`);
    
    admins.slice(0, 10).forEach(admin => {
      console.log(`- Email: "${admin.admin_email}" | Name: "${admin.admin_name}" | Approved: ${admin.isApproved} | Onboarded: ${admin.is_onboarded} | Status: "${admin.status}"`);
    });
    if (admins.length > 10) {
      console.log(`... and ${admins.length - 10} more.`);
    }

    // Also check 'hospital_admins' collection just in case
    const HospitalAdmin = mongoose.model('HospitalAdmin', new mongoose.Schema({}, { strict: false }), 'hospital_admins');
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
