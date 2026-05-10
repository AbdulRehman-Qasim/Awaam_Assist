const Admin = require("../models/AdminSchema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.loginAdmin = async (req, res) => {
  try {
    const { admin_email, password, requiredRole } = req.body;

    if (!admin_email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const admin = await Admin.findOne({ admin_email: admin_email.toLowerCase() });
    if (!admin) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const adminRole = admin.role;
    if (!adminRole) {
      return res.status(403).json({
        success: false,
        message: 'Admin role is not configured for this account'
      });
    }

    // Portal Isolation Enforcement
    if (adminRole === 'super_admin' && (!requiredRole || requiredRole !== 'super_admin')) {
      return res.status(403).json({
        success: false,
        message: 'Super Admins are restricted from this portal. Please use the dedicated Super Admin login at /super-admin/login.'
      });
    }

    if (adminRole !== 'super_admin' && requiredRole === 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This portal is restricted to Super Administrators only.'
      });
    }

    if (admin.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Admin account is suspended',
        currentRole: adminRole
      });
    }

    if (!admin.isApproved && adminRole !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin account is pending approval',
        currentRole: adminRole
      });
    }

    // If a specific role is required, validate it.
    if (requiredRole && adminRole !== requiredRole && adminRole !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: `Access denied. This portal requires ${requiredRole} role.`,
        currentRole: adminRole
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: admin._id,
        role: adminRole
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        admin_name: admin.admin_name,
        email: admin.admin_email,
        role: adminRole,
        isApproved: admin.isApproved,
        status: admin.status,
        managed_entity_id: admin.managed_entity_id,
        entity_name: admin.entity_name,
        entity_type: admin.entity_type,
        entity_address: admin.entity_address,
        entity_contact: admin.entity_contact,
        official_website: admin.official_website,
        current_location: admin.current_location,
        scheme_province: admin.scheme_province,
        scheme_cities: admin.scheme_cities || [],
        scheme_department: admin.scheme_department,
        scheme_scope: admin.scheme_scope,
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};