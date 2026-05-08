const Student = require("../models/RegisterStudentSchema");
const Profile = require("../models/ProfileSchema");

exports.completeOnboarding = async (req, res) => {
  try {
    const { userId, selectedModules, educationProfile, schemesProfile, healthcareProfile } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    // 1. Update User Onboarding Status
    const user = await Student.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.onboardingCompleted = true;
    user.selectedModules = selectedModules;
    await user.save();

    // 2. Create or Update Profile
    let profile = await Profile.findOne({ userId });

    if (profile) {
      profile.educationProfile = educationProfile || profile.educationProfile;
      profile.schemesProfile = schemesProfile || profile.schemesProfile;
      profile.healthcareProfile = healthcareProfile || profile.healthcareProfile;
    } else {
      profile = new Profile({
        userId,
        educationProfile,
        schemesProfile,
        healthcareProfile,
      });
    }

    await profile.save();

    return res.status(200).json({
      success: true,
      message: "Onboarding completed successfully",
      data: {
        onboardingCompleted: user.onboardingCompleted,
        selectedModules: user.selectedModules,
      },
    });
  } catch (error) {
    console.error("Onboarding error:", error);
    return res.status(500).json({ success: false, message: "Server error during onboarding", error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const profile = await Profile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }
    return res.status(200).json({ success: true, data: profile });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error fetching profile", error: error.message });
  }
};
