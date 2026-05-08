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

    // Validation Logic - Only strictly require core fields to maintain backward compatibility
    if (selectedModules.includes("education")) {
      const { degree, preferredProgram, city, marks, feeRange } = profileData.education || {};
      if (!degree || !preferredProgram || !city || marks === undefined || !feeRange) {
        return res.status(400).json({ success: false, message: "Missing required core fields for Education module (Preferred Program is required)" });
      }
    }

    if (selectedModules.includes("schemes")) {
      const { income, age, employmentStatus, province } = profileData.schemes || {};
      if (income === undefined || age === undefined || !employmentStatus || !province) {
        return res.status(400).json({ success: false, message: "Missing required core fields for Schemes module" });
      }
    }

    if (selectedModules.includes("healthcare")) {
      const { city, tehsil, hospitalCategory } = profileData.healthcare || {};
      if (!city || !tehsil || !hospitalCategory) {
        return res.status(400).json({ success: false, message: "Missing required core fields for Healthcare module" });
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

    return res.status(200).json({
      success: true,
      message: "Profile saved successfully",
      data: {
        userId: profile.userId,
        selectedModules: profile.selectedModules,
        onboardingCompleted: profile.onboardingCompleted,
      },
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
