
const mongoose = require('mongoose');
const Admin = require('../src/models/AdminSchema');
const HospitalAdmin = require('../src/models/HospitalAdminSchema');
require('dotenv').config();

async function check() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://muhammadowais87:12344321@cluster0.weif8lt.mongodb.net/test?appName=Cluster0');
    
    const adminsCount = await Admin.countDocuments();
    const adminRoles = await Admin.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]);
    const hospitalAdminsCount = await HospitalAdmin.countDocuments();
    
    console.log('Admins count (collection admins):', adminsCount);
    console.log('Admin roles in collection admins:', adminRoles);
    console.log('HospitalAdmins count (collection hospital_admins):', hospitalAdminsCount);
    
    process.exit();
}

check();
