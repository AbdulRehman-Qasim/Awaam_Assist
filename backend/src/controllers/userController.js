const Student = require("../models/RegisterStudentSchema");
const Profile = require("../models/ProfileSchema");

/**
 * Complete user onboarding and save profile
 * POST /api/user/complete-profile
 */
exports.completeProfile = async (req, res) => {
  try {
    const userId = req.userId; // From userAuth middleware
    const { selectedModules, profile: profileData } = req.body;

    if (!selectedModules || !Array.isArray(selectedModules)) {
      return res.status(400).json({ success: false, message: "selectedModules is required" });
    }

    // Validation Logic - Must match exactly what the frontend form collects
    if (selectedModules.includes("education")) {
      const { degree, city } = profileData.education || {};
      if (!degree || !city) {
        return res.status(400).json({ success: false, message: "Missing required core fields for Education module" });
      }
    }

    if (selectedModules.includes("schemes")) {
      const { income, age, employmentStatus, province, educationLevel, familySize, bispStatus } = profileData.schemes || {};
      const missingFields = [];
      if (income === undefined || income === null || income === "") missingFields.push("income");
      if (age === undefined || age === null || age === "") missingFields.push("age");
      if (!employmentStatus) missingFields.push("employmentStatus");
      if (!province) missingFields.push("province");
      if (!educationLevel) missingFields.push("educationLevel");
      if (familySize === undefined || familySize === null || familySize === "") missingFields.push("familySize");
      if (!bispStatus) missingFields.push("bispStatus");

      if (missingFields.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: `Missing required core fields for Schemes module: ${missingFields.join(", ")}` 
        });
      }
    }

    if (selectedModules.includes("healthcare")) {
      const { city, hospitalCategory, treatmentType } = profileData.healthcare || {};
      if (!city || !hospitalCategory || !treatmentType) {
        return res.status(400).json({ success: false, message: "Missing required core fields for Healthcare module (city, hospital type, treatment type required)" });
      }
    }

    // 1. Update User Record
    const user = await Student.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.onboardingCompleted = true;
    user.selectedModules = selectedModules;
    await user.save();

    // 2. Create or Update Profile Document
    let profile = await Profile.findOne({ userId });

    const formattedProfile = {
      education: selectedModules.includes("education") ? profileData.education : null,
      schemes: selectedModules.includes("schemes") ? profileData.schemes : null,
      healthcare: selectedModules.includes("healthcare") ? profileData.healthcare : null,
    };

    if (profile) {
      profile.selectedModules = selectedModules;
      profile.profile = formattedProfile;
      profile.onboardingCompleted = true;
    } else {
      profile = new Profile({
        userId,
        selectedModules,
        profile: formattedProfile,
        onboardingCompleted: true,
      });
    }

    await profile.save();

    // Re-fetch to get the populated profile for the response
    const savedProfile = await Profile.findOne({ userId }).populate("userId", "student_name student_email");

    return res.status(200).json({
      success: true,
      message: "Profile saved successfully",
      data: savedProfile,
    });
  } catch (error) {
    console.error("Complete Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during profile completion",
      error: error.message,
    });
  }
};

/**
 * Get user profile
 * GET /api/user/profile
 */
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const profile = await Profile.findOne({ userId });
    
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    return res.status(200).json({ success: true, data: profile });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
