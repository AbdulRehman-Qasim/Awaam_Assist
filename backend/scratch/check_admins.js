const mongoose = require('mongoose');
require('dotenv').config();

async function checkAdmins() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fyp');
    console.log('Connected to MongoDB');

    const HospitalAdmin = mongoose.model('HospitalAdmin', new mongoose.Schema({}, { strict: false }), 'hospital_admins');
    
    const admins = await HospitalAdmin.find({});
    console.log(`Found ${admins.length} hospital admins:`);
    
    admins.forEach(admin => {
      console.log(`- Name: ${admin.admin_name}, Email: ${admin.admin_email}, Approved: ${admin.isApproved}, Status: ${admin.status}`);
    });

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

checkAdmins();
