const University = require("../models/UniversitySchema");
const Scheme = require("../models/SchemeSchema");
const Hospital = require("../models/HospitalSchema");
const Profile = require("../models/ProfileSchema");
const { scoreUniversities } = require("../utils/RecommendationEngine");

/**
 * Get personalized recommendations for the logged-in user.
 * GET /api/user/recommendations
 *
 * Returns:
 *   education:  [ { id, name, type, score, feeType, location, rank, reason[], tags[] } ]
 *   schemes:    [ ...scheme docs ]
 *   healthcare: [ ...hospital docs ]
 *   permissions: { education, schemes, healthcare }
 */
exports.getRecommendations = async (req, res) => {
  const startTime = Date.now();
  try {
    const userId = req.userId;
    const userProfile = await Profile.findOne({ userId }).lean();

    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found. Please complete onboarding.",
      });
    }

    const { selectedModules, profile } = userProfile;

    const recommendations = {
      education: [],
      schemes: [],
      healthcare: [],
      permissions: {
        education:  selectedModules.includes("education"),
        schemes:    selectedModules.includes("schemes"),
        healthcare: selectedModules.includes("healthcare"),
      },
    };

    // ── 1. EDUCATION RECOMMENDATIONS (v2 Hybrid Engine) ───────────────────────
    if (selectedModules.includes("education")) {
      const edu = profile.education || {};

      // Broad fetch: pull up to 200 universities for scoring
      // Use indexed fields for a coarse pre-filter to stay under 50ms
      let dbQuery = {};

      // Pre-filter: merit (strict — user cannot apply below their marks)
      if (edu.marks) {
        dbQuery.merit = { $lte: Number(edu.marks) };
      }

      // Pre-filter: discipline (loose regex so engine can refine further)
      if (edu.discipline || edu.preferredProgram) {
        const disc = edu.discipline || edu.preferredProgram || "";
        dbQuery.discipline = new RegExp(disc.split(" ")[0], "i");
      }

      const candidates = await University.find(dbQuery)
        .limit(200)
        .lean();

      // Run v2 hybrid engine — always returns diverse, scored results
      const engagement = {
        likedIds:  req.query.liked  ? req.query.liked.split(",")  : [],
        hiddenIds: req.query.hidden ? req.query.hidden.split(",") : [],
      };

      recommendations.education = scoreUniversities(candidates, profile, engagement);

      // Cold-start fallback: if no results (e.g. very high merit), widen fetch
      if (recommendations.education.length === 0) {
        const fallback = await University.find({}).limit(100).lean();
        recommendations.education = scoreUniversities(fallback, profile, engagement);
      }
    }

    // ── 2. SCHEMES RECOMMENDATIONS ────────────────────────────────────────────
    if (selectedModules.includes("schemes") && profile.schemes) {
      const {
        province,
        income,
        age,
        employmentStatus,
        educationLevel,
      } = profile.schemes;

      let schemeQuery = {};

      if (province) schemeQuery.province = new RegExp(province, "i");

      // Eligibility pre-filters (only apply if field exists in DB)
      if (income) {
        schemeQuery.$or = [
          { maxIncome: { $gte: Number(income) } },
          { maxIncome: { $exists: false } },
          { maxIncome: null },
        ];
      }

      if (age) {
        schemeQuery.$and = [
          { $or: [{ minAge: { $lte: Number(age) } }, { minAge: { $exists: false } }] },
          { $or: [{ maxAge: { $gte: Number(age) } }, { maxAge: { $exists: false } }] },
        ];
      }

      recommendations.schemes = await Scheme.find(schemeQuery).limit(12);
    }

    // ── 3. HEALTHCARE RECOMMENDATIONS ─────────────────────────────────────────
    if (selectedModules.includes("healthcare") && profile.healthcare) {
      const {
        city,
        tehsil,
        hospitalCategory,
        nearbyPreference,
        treatmentCity,
        emergencyRequirement,
      } = profile.healthcare;

      let healthQuery = {};

      const resolvedCity = treatmentCity || city;
      if (resolvedCity) healthQuery.City = new RegExp(resolvedCity, "i");
      if (tehsil) healthQuery.Tehsil = new RegExp(tehsil, "i");
      // Note: DB has typo 'Cateogry' — preserved for compatibility
      if (hospitalCategory) healthQuery.Cateogry = hospitalCategory;

      // Emergency: prioritize nearest results
      const limit = emergencyRequirement === "Yes" ? 5 : 12;

      recommendations.healthcare = await Hospital.find(healthQuery).limit(limit);

      // Fallback: if no hospitals match, return nearby city hospitals
      if (recommendations.healthcare.length === 0 && resolvedCity) {
        recommendations.healthcare = await Hospital.find({}).limit(8);
      }
    }

    const elapsed = Date.now() - startTime;

    return res.status(200).json({
      success: true,
      data: recommendations,
      selectedModules,
      meta: {
        engineVersion: "v2",
        processingMs: elapsed,
        educationCount: recommendations.education.length,
      },
    });
  } catch (error) {
    console.error("Recommendations Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching recommendations",
      error: error.message,
    });
  }
};
