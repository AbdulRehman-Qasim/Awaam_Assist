const Admin = require("../models/AdminSchema");
const bcrypt = require("bcryptjs");

exports.registerAdmin = async (req, res) => {
  try {
    const {
      admin_name,
      admin_email,
      password,
      role,
      current_location,
      current_location_lat,
      current_location_lng
    } = req.body;
    const allowedRoles = ['education_admin', 'scheme_admin', 'hospital_admin', 'super_admin'];

    if (!admin_name || !admin_email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid admin role" });
    }

    const existingEmail = await Admin.findOne({ admin_email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already taken" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = await Admin.create({
      admin_name,
      admin_email,
      password: hashedPassword,
      role: role || 'education_admin',
      isApproved: role === 'super_admin',
      status: 'active',
      current_location: current_location || '',
      current_location_lat: current_location_lat !== undefined ? Number(current_location_lat) : undefined,
      current_location_lng: current_location_lng !== undefined ? Number(current_location_lng) : undefined,
    });

    return res.status(201).json({
      message: "Admin registration successful!",
      data: admin,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};