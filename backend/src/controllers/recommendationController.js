const University = require("../models/UniversitySchema");
const Scheme = require("../models/SchemeSchema");
const Hospital = require("../models/HospitalSchema");
const Profile = require("../models/ProfileSchema");

/**
 * Get personalized recommendations for the logged-in user
 * GET /api/user/recommendations
 */
exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.userId;
    const userProfile = await Profile.findOne({ userId });

    if (!userProfile) {
      return res.status(404).json({ success: false, message: "Profile not found. Please complete onboarding." });
    }

    const { selectedModules, profile } = userProfile;
    const recommendations = {
      education: [],
      schemes: [],
      healthcare: [],
      permissions: {
        education: selectedModules.includes("education"),
        schemes: selectedModules.includes("schemes"),
        healthcare: selectedModules.includes("healthcare"),
      },
    };

    // 1. Education Recommendations
    if (selectedModules.includes("education") && profile.education) {
      const { marks, city, discipline, feeRange } = profile.education;
      
      let query = {
        merit: { $lte: Number(marks) || 100 },
      };

      if (city) query.city = new RegExp(city, "i");
      if (discipline) query.discipline = new RegExp(discipline, "i");
      
      if (feeRange === "Under 50k") query.fee = { $lte: 50000 };
      else if (feeRange === "50k-100k") query.fee = { $gte: 50000, $lte: 100000 };
      else if (feeRange === "100k-200k") query.fee = { $gte: 100000, $lte: 200000 };
      else if (feeRange === "Above 200k") query.fee = { $gte: 200000 };

      recommendations.education = await University.find(query).limit(12).sort({ merit: -1 });
    }

    // 2. Schemes Recommendations
    if (selectedModules.includes("schemes") && profile.schemes) {
      const { province } = profile.schemes;

      let query = {
        // Based on SchemeSchema fields
      };
      if (province) query.province = new RegExp(province, "i");
      
      recommendations.schemes = await Scheme.find(query).limit(10);
    }

    // 3. Healthcare Recommendations
    if (selectedModules.includes("healthcare") && profile.healthcare) {
      const { city, tehsil, hospitalCategory } = profile.healthcare;

      let query = {};
      // Match exactly with HospitalSchema case-sensitive/space keys
      if (city) query.City = new RegExp(city, "i");
      if (tehsil) query.Tehsil = new RegExp(tehsil, "i");
      if (hospitalCategory) query.Cateogry = hospitalCategory; // Note the typo in Schema 'Cateogry'

      recommendations.healthcare = await Hospital.find(query).limit(12);
    }

    return res.status(200).json({
      success: true,
      data: recommendations,
      selectedModules,
    });
  } catch (error) {
    console.error("Recommendations Error:", error);
    return res.status(500).json({ success: false, message: "Server error fetching recommendations", error: error.message });
  }
};
