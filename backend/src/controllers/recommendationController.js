/**
 * recommendationController.js
 *
 * Personalized recommendation endpoint — upgraded to use the enriched
 * hospital dataset (treatments[], tags, rating, affordability, etc.)
 *
 * GET /api/user/recommendations
 */

'use strict';

const University = require('../models/UniversitySchema');
const Scheme     = require('../models/SchemeSchema');
const Hospital   = require('../models/HospitalSchema');
const Profile    = require('../models/ProfileSchema');
const { scoreUniversities } = require('../utils/RecommendationEngine');

// ── Hospital scoring ──────────────────────────────────────────────────────────

/**
 * Score a hospital document against a user healthcare profile.
 * Returns a numeric score 0–100 and a list of reason labels.
 *
 * @param {Object} hospital   - lean Mongoose doc
 * @param {Object} hProfile   - user's profile.healthcare sub-doc
 * @returns {{ score: number, reasons: string[] }}
 */
const scoreHospital = (hospital, hProfile) => {
  let score = 50; // base
  const reasons = [];

  const userCity    = (hProfile.city || hProfile.treatmentCity || '').toLowerCase().trim();
  const userTehsil  = (hProfile.tehsil || '').toLowerCase().trim();
  const userCat     = (hProfile.hospitalCategory || '').toLowerCase().trim();
  const treatType   = (hProfile.treatmentType || '').toLowerCase().trim();
  const maxBudget   = Number(hProfile.budgetRange) || Number(hProfile.maxBudget) || 0;
  const isEmergency = hProfile.urgencyLevel === 'Emergency' || hProfile.emergencyRequirement === 'Yes';

  // ── City match (+20 / +10 fuzzy) ─────────────────────────────────────────
  const hospCity = (hospital.City || '').toLowerCase().trim();
  if (userCity && hospCity === userCity) {
    score += 20;
    reasons.push('In your city');
  } else if (userCity && hospCity.includes(userCity)) {
    score += 10;
    reasons.push('Near your city');
  }

  // ── Tehsil match (+10) ────────────────────────────────────────────────────
  const hospTehsil = (hospital.Tehsil || '').toLowerCase().trim();
  if (userTehsil && hospTehsil) {
    const isTehsilMatch = hospTehsil === userTehsil || 
                          hospTehsil.includes(userTehsil) || 
                          userTehsil.includes(hospTehsil) ||
                          (userTehsil.includes('cantt') && hospTehsil.includes('cantonment')) ||
                          (userTehsil.includes('cantonment') && hospTehsil.includes('cantt'));
    if (isTehsilMatch) {
      score += 10;
      reasons.push('Matched your tehsil');
    }
  }

  // ── Category match (+15) ──────────────────────────────────────────────────
  const hospCat = (hospital.Cateogry || '').toLowerCase().trim();
  if (userCat && userCat !== 'both') {
    const isGovMatch = (userCat === 'public' || userCat === 'government') && (hospCat === 'government' || hospCat === 'public');
    const isPrivMatch = userCat === 'private' && hospCat === 'private';
    if (isGovMatch || isPrivMatch) {
      score += 15;
      reasons.push('Preferred category');
    }
  }

  // ── Emergency services (+15 if user needs emergency) ─────────────────────
  const hospitalEmergency = hospital.emergencyServices || (hospital.treatments || []).some(t => t.isEmergency || t.severitySupport === 'Emergency' || t.severitySupport === 'Critical');
  if (isEmergency && hospitalEmergency) {
    score += 15;
    reasons.push('Emergency services available');
  } else if (isEmergency && !hospitalEmergency) {
    score -= 15; // penalize if user needs emergency but hospital doesn't offer it
  }

  // ── Treatment-type / specialization match ─────────────────────────────────
  if (treatType) {
    const tagMatch = (hospital.tags || []).some((t) =>
      t.toLowerCase().includes(treatType) || treatType.includes(t.toLowerCase())
    );
    const specMatch = (hospital.treatments || []).some((t) => {
      const spec = (t.specialization || '').toLowerCase();
      const name = (t.treatmentName  || '').toLowerCase();
      return spec.includes(treatType) || name.includes(treatType) ||
             treatType.includes(spec) || treatType.includes(name);
    });

    if (tagMatch || specMatch) {
      score += 20;
      reasons.push(`Offers ${treatType} services`);
    }
  }

  // ── Affordability match (+10 flat / +5 treatments) ───────────────────────
  if (maxBudget > 0) {
    const isGovt = hospCat === 'government' || hospCat === 'public';
    const flatAffordable = isGovt || (hospital.treatmentCost > 0 && hospital.treatmentCost <= maxBudget);
    const treatmentAffordable = isGovt || (hospital.treatments || []).some(
      (t) => t.treatmentCost > 0 && t.treatmentCost <= maxBudget
    );

    if (flatAffordable || treatmentAffordable) {
      score += 10;
      reasons.push('Within your budget');
    }
  }

  // ── Rating bonus (+0–10) ─────────────────────────────────────────────────
  if (hospital.rating > 0) {
    score += Math.round((hospital.rating / 5) * 10);
    if (hospital.rating >= 4) reasons.push('Highly rated');
  }

  // ── Verified bonus (+5) ───────────────────────────────────────────────────
  if (hospital.isVerified) {
    score += 5;
    reasons.push('Verified hospital');
  }

  // ── Availability penalty ──────────────────────────────────────────────────
  const availability = (hospital.availability || '').toLowerCase();
  if (availability === 'unavailable') score -= 15;

  return {
    score: Math.min(100, Math.max(0, Math.round(score))),
    reasons,
  };
};

/**
 * Transform a hospital doc into a recommendation-shaped response object.
 */
const toRecommendationHospital = (hospital, scoreData) => ({
  _id:           hospital._id,
  hospitalName:  hospital['Hospital Name'],
  'Hospital Name': hospital['Hospital Name'],
  City:          hospital.City,
  Tehsil:        hospital.Tehsil,
  Cateogry:      hospital.Cateogry,
  category:      hospital.Cateogry,
  website:       hospital.website       || '',
  contactNumber: hospital.contactNumber || '',
  email:         hospital.email         || '',
  description:   hospital.description   || '',
  hospitalImage: hospital.hospitalImage || '',
  emergencyServices: hospital.emergencyServices || false,
  treatmentCost: hospital.treatmentCost || 0,
  availability:  hospital.availability  || 'Available',
  info:          hospital.info          || '',
  treatments:    hospital.treatments    || [],
  tags:          hospital.tags          || [],
  rating:        hospital.rating        || 0,
  totalReviews:  hospital.totalReviews  || 0,
  isVerified:    hospital.isVerified    || false,
  // Recommendation metadata
  matchScore:    scoreData?.score   || 0,
  reasons:       scoreData?.reasons || [],
});

// ── Main handler ──────────────────────────────────────────────────────────────

exports.getRecommendations = async (req, res) => {
  const startTime = Date.now();
  try {
    const userId     = req.userId;
    const userProfile = await Profile.findOne({ userId }).lean();

    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found. Please complete onboarding.',
      });
    }

    const { selectedModules, profile } = userProfile;

    const recommendations = {
      education:  [],
      schemes:    [],
      healthcare: [],
      permissions: {
        education:  selectedModules.includes('education'),
        schemes:    selectedModules.includes('schemes'),
        healthcare: selectedModules.includes('healthcare'),
      },
    };

    // ── 1. EDUCATION (unchanged v2 Hybrid Engine) ─────────────────────────
    if (selectedModules.includes('education')) {
      const edu = profile.education || {};
      let dbQuery = {};

      if (edu.marks) dbQuery.merit = { $lte: Number(edu.marks) };
      if (edu.discipline || edu.preferredProgram) {
        const disc = edu.discipline || edu.preferredProgram || '';
        dbQuery.discipline = new RegExp(disc.split(' ')[0], 'i');
      }

      const candidates = await University.find(dbQuery).limit(200).lean();
      const engagement = {
        likedIds:  req.query.liked  ? req.query.liked.split(',')  : [],
        hiddenIds: req.query.hidden ? req.query.hidden.split(',') : [],
      };

      recommendations.education = scoreUniversities(candidates, profile, engagement);

      if (recommendations.education.length === 0) {
        const fallback = await University.find({}).limit(100).lean();
        recommendations.education = scoreUniversities(fallback, profile, engagement);
      }
    }

    // ── 2. SCHEMES (unchanged) ────────────────────────────────────────────
    if (selectedModules.includes('schemes') && profile.schemes) {
      const { province, income, age } = profile.schemes;
      let schemeQuery = {};

      if (province) schemeQuery.province = new RegExp(province, 'i');
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

      recommendations.schemes = await Scheme.find(schemeQuery).limit(12).lean();
    }

    // ── 3. HEALTHCARE (upgraded with scoring engine) ──────────────────────
    if (selectedModules.includes('healthcare') && profile.healthcare) {
      const hProfile = profile.healthcare;
      const isEmergency = hProfile.emergencyRequirement === 'Yes';

      // Build DB pre-filter using static helper
      const preFilterQuery = Hospital.buildRecommendationQuery(hProfile);
      preFilterQuery.status = 'approved';

      // Fetch up to 60 candidates for scoring
      const limit = isEmergency ? 20 : 60;
      let candidates = await Hospital.find(preFilterQuery).limit(limit).lean();

      // Cold-start fallback: if pre-filter returns nothing, widen
      if (candidates.length === 0) {
        const city = hProfile.treatmentCity || hProfile.city;
        const fallbackQuery = city
          ? { status: 'approved', City: new RegExp(city, 'i') }
          : { status: 'approved' };
        candidates = await Hospital.find(fallbackQuery).limit(isEmergency ? 5 : 15).lean();
      }

      // Score and sort
      const scored = candidates
        .map((h) => {
          const scoreData = scoreHospital(h, hProfile);
          return { hospital: h, ...scoreData };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, isEmergency ? 5 : 12);

      recommendations.healthcare = scored.map(({ hospital, score, reasons }) =>
        toRecommendationHospital(hospital, { score, reasons })
      );
    }

    const elapsed = Date.now() - startTime;

    return res.status(200).json({
      success: true,
      data: recommendations,
      selectedModules,
      meta: {
        engineVersion:   'v3',
        processingMs:    elapsed,
        educationCount:  recommendations.education.length,
        healthcareCount: recommendations.healthcare.length,
      },
    });
  } catch (error) {
    console.error('Recommendations Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching recommendations',
      error:   error.message,
    });
  }
};
