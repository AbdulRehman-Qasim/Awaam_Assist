const Admin = require("../models/AdminSchema");

exports.updateOnboarding = async (req, res) => {
    try {
        const { adminId } = req.params;
        const {
            entity_name,
            entity_type,
            entity_address,
            entity_contact,
            entity_description,
            established_year,
            official_website,
            scale,
            scheme_province,
            scheme_cities,
            scheme_department,
            scheme_scope
        } = req.body;

        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }

        // Update fields
        if (entity_name) admin.entity_name = entity_name;
        if (entity_type) admin.entity_type = entity_type;
        if (entity_address) admin.entity_address = entity_address;
        if (entity_contact) admin.entity_contact = entity_contact;
        if (entity_description) admin.entity_description = entity_description;
        if (established_year) admin.established_year = established_year;
        if (official_website) admin.official_website = official_website;
        if (scale) admin.scale = scale;
        if (scheme_province) admin.scheme_province = scheme_province;
        if (scheme_department) admin.scheme_department = scheme_department;
        if (scheme_scope) admin.scheme_scope = scheme_scope;
        if (scheme_cities) {
            const normalizedCities = String(scheme_cities)
                .split(',')
                .map((c) => c.trim())
                .filter(Boolean);
            admin.scheme_cities = normalizedCities;
        }

        // Handle file uploads if any
        if (req.files && req.files.length > 0) {
            const filePaths = req.files.map(file => `/uploads/${file.filename}`);
            admin.verification_docs = [...(admin.verification_docs || []), ...filePaths];
        }

        admin.onboarding_step = 2; // Move to next step or mark as pending
        admin.is_onboarded = true; // Set to true once they submit onboarding info

        await admin.save();

        return res.status(200).json({
            success: true,
            message: "Onboarding information updated successfully",
            data: admin
        });
    } catch (error) {
        console.error("Admin Onboarding Error:", error);
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

exports.getOnboardingStatus = async (req, res) => {
    try {
        const { adminId } = req.params;
        const admin = await Admin.findById(adminId);
        
        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }

        return res.status(200).json({
            success: true,
            data: {
                is_onboarded: admin.is_onboarded,
                onboarding_step: admin.onboarding_step,
                isApproved: admin.isApproved,
                verification_docs: admin.verification_docs || []
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};
