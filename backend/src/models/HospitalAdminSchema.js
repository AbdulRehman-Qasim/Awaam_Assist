const mongoose = require('mongoose');

const hospitalAdminSchema = new mongoose.Schema(
  {
    admin_name: { type: String, required: true, trim: true },
    admin_email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    hospital_name: { type: String, required: true, trim: true },
    isApproved: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('HospitalAdmin', hospitalAdminSchema, 'hospital_admins');
