const bcrypt = require("bcryptjs");
const Admin = require("../models/AdminSchema");
const University = require("../models/UniversitySchema");

const parseCityProvinceFromAddress = (address = "") => {
  const [cityRaw, provinceRaw] = String(address).split(",");
  return {
    city: cityRaw?.trim() || undefined,
    province: provinceRaw?.trim() || undefined,
  };
};

const getAdminSettingsProfile = async (req, res) => {
  try {
    const admin = req.admin;
    return res.status(200).json({
      success: true,
      profile: {
        admin_name: admin.admin_name || "",
        admin_email: admin.admin_email || "",
        role: admin.role,
        entity_name: admin.entity_name || "",
        entity_type: admin.entity_type || "",
        entity_address: admin.entity_address || "",
        entity_contact: admin.entity_contact || "",
        official_website: admin.official_website || "",
        current_location: admin.current_location || "",
        scheme_province: admin.scheme_province || "",
        scheme_cities: admin.scheme_cities || [],
        scheme_department: admin.scheme_department || "",
        scheme_scope: admin.scheme_scope || "",
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load admin settings profile",
      error: error.message,
    });
  }
};

const updateAdminSettingsProfile = async (req, res) => {
  try {
    const admin = req.admin;
    const {
      admin_name,
      admin_email,
      entity_name,
      entity_address,
      entity_contact,
      official_website,
      current_location,
      scheme_province,
      scheme_cities,
      scheme_department,
      scheme_scope,
    } = req.body || {};

    if (admin_name !== undefined) admin.admin_name = String(admin_name).trim();
    if (admin_email !== undefined) admin.admin_email = String(admin_email).trim();
    if (entity_name !== undefined) admin.entity_name = String(entity_name).trim();
    if (entity_address !== undefined) admin.entity_address = String(entity_address).trim();
    if (entity_contact !== undefined) admin.entity_contact = String(entity_contact).trim();
    if (official_website !== undefined) admin.official_website = String(official_website).trim();
    if (current_location !== undefined) admin.current_location = String(current_location).trim();
    if (scheme_province !== undefined) admin.scheme_province = String(scheme_province).trim();
    if (scheme_department !== undefined) admin.scheme_department = String(scheme_department).trim();
    if (scheme_scope !== undefined) admin.scheme_scope = String(scheme_scope).trim();
    if (scheme_cities !== undefined) {
      const normalizedCities = Array.isArray(scheme_cities)
        ? scheme_cities.map((city) => String(city).trim()).filter(Boolean)
        : String(scheme_cities).split(",").map((city) => city.trim()).filter(Boolean);
      admin.scheme_cities = normalizedCities;
    }

    await admin.save();

    // Keep linked university basic profile in sync for education admins
    if (admin.entity_type === "university" && admin.managed_entity_id) {
      const parsed = parseCityProvinceFromAddress(admin.entity_address);
      await University.findByIdAndUpdate(
        admin.managed_entity_id,
        {
          ...(admin.entity_name ? { title: admin.entity_name } : {}),
          ...(admin.entity_contact ? { contact: admin.entity_contact } : {}),
          ...(admin.official_website ? { web: admin.official_website } : {}),
          ...(parsed.city ? { city: parsed.city } : {}),
          ...(parsed.province ? { province: parsed.province } : {}),
          ...(admin.entity_address ? { "map.address": admin.entity_address, "map.location": admin.entity_address } : {}),
        },
        { new: true }
      );
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      admin: {
        id: admin._id,
        admin_name: admin.admin_name,
        email: admin.admin_email,
        role: admin.role,
        isApproved: admin.isApproved,
        status: admin.status,
        managed_entity_id: admin.managed_entity_id,
        entity_name: admin.entity_name || "",
        entity_type: admin.entity_type || "",
        entity_address: admin.entity_address || "",
        entity_contact: admin.entity_contact || "",
        official_website: admin.official_website || "",
        current_location: admin.current_location || "",
        scheme_province: admin.scheme_province || "",
        scheme_cities: admin.scheme_cities || [],
        scheme_department: admin.scheme_department || "",
        scheme_scope: admin.scheme_scope || "",
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update admin profile",
      error: error.message,
    });
  }
};

const changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    const admin = await Admin.findById(req.admin._id);
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(newPassword, salt);
    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to change password",
      error: error.message,
    });
  }
};

module.exports = {
  getAdminSettingsProfile,
  updateAdminSettingsProfile,
  changeAdminPassword,
};
