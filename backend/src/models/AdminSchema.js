const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    admin_name: { type: String, required: true },
    admin_email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    is_super_admin: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    role: {
      type: String,
      enum: ['education_admin', 'scheme_admin', 'hospital_admin', 'super_admin'],
      required: true,
      default: 'education_admin'
    },
    // Onboarding fields
    entity_name: { type: String },
    entity_type: { type: String, enum: ['university', 'scheme', 'hospital'] },
    entity_address: { type: String },
    entity_contact: { type: String },
    entity_description: { type: String },
    established_year: { type: String },
    official_website: { type: String },
    scale: { type: String },
    scheme_province: { type: String },
    scheme_cities: [{ type: String }],
    scheme_department: { type: String },
    scheme_scope: { type: String },
    current_location: { type: String },
    current_location_lat: { type: Number },
    current_location_lng: { type: Number },
    verification_docs: [{ type: String }], // Array of file paths/URLs
    rejection_reason: { type: String },
    onboarding_step: { type: Number, default: 1 },
    is_onboarded: { type: Boolean, default: false },
    managed_entity_id: { type: mongoose.Schema.Types.ObjectId }, // ID of the created University/Scheme/Hospital
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admin", adminSchema, "admins");