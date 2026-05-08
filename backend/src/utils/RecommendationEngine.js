/**
 * AwamAssist Recommendation Engine v2
 * Hybrid Intelligence System — Multi-Factor Weighted Scoring
 *
 * Architecture:
 *   1. Education Match Score   (40%)
 *   2. Location Relevance       (20%)
 *   3. Financial Affordability  (25%)
 *   4. Institution Quality      (10%)
 *   5. Engagement/Personal       (5%)
 *
 * Outputs: Ranked results with whyMatched explanations + tags.
 */

// ─── CONSTANTS ─────────────────────────────────────────────────────────────────
const WEIGHTS = {
  education: 0.40,
  location:  0.20,
  financial: 0.25,
  quality:   0.10,
  engagement:0.05,
};

const FEE_RANGE_MAP = {
  "Under 50k":    { min: 0,      max: 50000  },
  "50k-100k":     { min: 50000,  max: 100000 },
  "100k-200k":    { min: 100000, max: 200000 },
  "Above 200k":   { min: 200000, max: Infinity },
};

// ─── HELPER: clamp 0–100 ──────────────────────────────────────────────────────
const clamp = (v, min = 0, max = 100) => Math.min(max, Math.max(min, v));

// ─── HELPER: derive effective fee from university document ────────────────────
const getEffectiveFee = (uni) => {
  if (uni.annualFee && uni.annualFee > 0) return uni.annualFee;
  if (uni.semesterFee && uni.semesterFee > 0) return uni.semesterFee * 2; // annualise
  if (uni.fee && uni.fee > 0) return uni.fee;
  return 0;
};

// ─── HELPER: safe string compare (case-insensitive, partial) ─────────────────
const strMatch = (a = "", b = "") =>
  a.toLowerCase().includes(b.toLowerCase()) ||
  b.toLowerCase().includes(a.toLowerCase());

// ─── HELPER: Discipline similarity ───────────────────────────────────────────
const disciplineMatch = (uniDisc = "", userDisc = "", userProgram = "") => {
  const u = uniDisc.toLowerCase();
  const d = userDisc.toLowerCase();
  const p = userProgram.toLowerCase();
  if (u === d) return 1.0;                        // exact
  if (u.includes(d) || d.includes(u)) return 0.8; // partial
  if (p && (u.includes(p) || p.includes(u))) return 0.6; // program hint
  return 0;
};

// ─── SCORE 1: EDUCATION MATCH (0–100) ─────────────────────────────────────────
const scoreEducation = (uni, edu) => {
  let score = 0;
  const reasons = [];

  // Marks vs merit (max 50pts)
  const userMarks = Number(edu.marks) || 0;
  const uniMerit  = Number(uni.merit || uni.minimumMeritScore) || 0;
  if (userMarks > 0 && uniMerit > 0) {
    const gap = userMarks - uniMerit;
    if (gap >= 10)       { score += 50; reasons.push(`Your marks (${userMarks}%) comfortably exceed the merit threshold (${uniMerit}%)`); }
    else if (gap >= 0)   { score += 35; reasons.push(`Your marks (${userMarks}%) meet the merit requirement of ${uniMerit}%`); }
    else if (gap >= -5)  { score += 15; reasons.push(`Slightly below merit threshold — worth applying`); }
    // else gap < -5: no marks score
  } else {
    score += 25; // no merit data — neutral pass
  }

  // Discipline match (max 30pts)
  const dm = disciplineMatch(
    uni.discipline || "",
    edu.discipline || edu.programInterest || edu.preferredProgram || "",
    edu.preferredProgram || ""
  );
  if (dm >= 0.8) { score += 30; reasons.push(`Matches your ${edu.preferredProgram || edu.discipline || "preferred"} program interest`); }
  else if (dm >= 0.6) { score += 18; reasons.push(`Partially aligns with your academic interest`); }
  else if (dm > 0)    { score += 8; }

  // Degree level (max 20pts)
  const userDeg = (edu.degree || "").toUpperCase();
  const uniDeg  = (uni.degree || uni.degreeLevel || "").toUpperCase();
  if (userDeg && uniDeg && (uniDeg.includes(userDeg) || userDeg.includes(uniDeg))) {
    score += 20;
    reasons.push(`Offers your desired degree level (${uni.degreeLevel || uni.degree})`);
  } else if (!userDeg) {
    score += 10; // neutral if user hasn't specified
  }

  return { score: clamp(score), reasons };
};

// ─── SCORE 2: LOCATION RELEVANCE (0–100) ──────────────────────────────────────
const scoreLocation = (uni, edu) => {
  let score = 0;
  const reasons = [];

  const userCity     = (edu.city || "").toLowerCase().trim();
  const uniCity      = (uni.city || "").toLowerCase().trim();
  const userProvince = (edu.province || "").toLowerCase().trim();
  const uniProvince  = (uni.province || "").toLowerCase().trim();

  if (userCity && uniCity === userCity) {
    score = 100;
    reasons.push(`Located in your preferred city (${uni.city})`);
  } else if (userProvince && uniProvince === userProvince) {
    score = 60;
    reasons.push(`Located in your province (${uni.province})`);
  } else if (userCity || userProvince) {
    score = 20;
  } else {
    score = 40; // no preference — neutral
  }

  return { score: clamp(score), reasons };
};

// ─── SCORE 3: FINANCIAL AFFORDABILITY (0–100) ─────────────────────────────────
const scoreFinancial = (uni, edu) => {
  let score = 0;
  const reasons = [];

  const fee       = getEffectiveFee(uni);
  const feeRange  = edu.feeRange || "";
  const rangeObj  = FEE_RANGE_MAP[feeRange];

  if (fee === 0) {
    // No fee data — neutral
    score = 50;
    reasons.push("Fee information not specified — assumed accessible");
    return { score, reasons };
  }

  if (rangeObj) {
    if (fee <= rangeObj.max) {
      // Within budget
      const comfort = (rangeObj.max - fee) / rangeObj.max;
      score = 60 + Math.round(comfort * 40);
      reasons.push(`Fee (PKR ${fee.toLocaleString()}) fits within your ${feeRange} budget range`);
    } else {
      // Over budget — penalty proportional to overshoot
      const overshoot = (fee - rangeObj.max) / rangeObj.max;
      score = Math.max(0, 40 - Math.round(overshoot * 60));
      reasons.push(`Fee (PKR ${fee.toLocaleString()}) exceeds your stated budget — may be affordable with aid`);
    }
  } else {
    // No feeRange preference — score based on absolute value
    if (fee < 80000)       { score = 85; reasons.push(`Very affordable fee structure (PKR ${fee.toLocaleString()} per year)`); }
    else if (fee < 200000) { score = 65; reasons.push(`Moderately priced institution (PKR ${fee.toLocaleString()} per year)`); }
    else if (fee < 500000) { score = 45; }
    else                   { score = 25; }
  }

  // feeType bonus — semester fees often feel more affordable
  const feeType = uni.feeType || "";
  if (feeType.toLowerCase().includes("semester")) {
    score = Math.min(100, score + 5);
    reasons.push("Semester-based billing makes it easier to manage payments");
  }

  return { score: clamp(score), reasons };
};

// ─── SCORE 4: INSTITUTION QUALITY (0–100) ─────────────────────────────────────
const scoreQuality = (uni) => {
  let score = 40; // baseline
  const reasons = [];

  const ranking = Number(uni.ranking);
  if (ranking > 0 && ranking <= 500) {
    // Normalize: rank 1 → 100, rank 500 → 10
    const normalized = clamp(100 - ((ranking - 1) / 499) * 90, 10, 100);
    score = Math.round(normalized);
    if (ranking <= 10)  reasons.push(`Top-10 nationally ranked institution (#${ranking})`);
    else if (ranking <= 50) reasons.push(`Highly ranked institution in Pakistan (#${ranking})`);
    else if (ranking <= 150) reasons.push(`Well-established, nationally recognized institution`);
  } else if (!ranking || isNaN(ranking)) {
    score = 30; // unknown ranking — conservative
  }

  return { score: clamp(score), reasons };
};

// ─── SCORE 5: ENGAGEMENT / PERSONALISATION (0–100) ────────────────────────────
// Placeholder for future behavioral signals — returns neutral score
const scoreEngagement = (uni, engagementData = {}) => {
  const { likedIds = [], hiddenIds = [] } = engagementData;
  const id = String(uni._id || uni.id || "");
  if (hiddenIds.includes(id)) return { score: 0, reasons: [] };
  if (likedIds.includes(id))  return { score: 100, reasons: ["You previously showed interest in this institution"] };
  return { score: 50, reasons: [] }; // neutral
};

// ─── DYNAMIC WEIGHT ADJUSTMENT ────────────────────────────────────────────────
const adjustWeights = (edu = {}, schemes = {}) => {
  const w = { ...WEIGHTS };
  const marks    = Number(edu.marks) || 0;
  const income   = Number(schemes.income) || 0;
  const feeRange = edu.feeRange || "";

  // High marks → boost quality, reduce financial weight slightly
  if (marks >= 85) {
    w.quality  += 0.05;
    w.financial -= 0.05;
  }
  // Low marks → boost location diversity, reduce quality weight
  if (marks > 0 && marks < 60) {
    w.education -= 0.05;
    w.location  += 0.05;
  }
  // No income data → reduce financial penalty strength
  if (income === 0 && !feeRange) {
    w.financial -= 0.05;
    w.engagement += 0.05;
  }

  // Re-normalize weights to sum to 1.0
  const total = Object.values(w).reduce((a, b) => a + b, 0);
  Object.keys(w).forEach(k => { w[k] = w[k] / total; });

  return w;
};

// ─── TAG GENERATOR ────────────────────────────────────────────────────────────
const generateTags = (uni, edu = {}, scores = {}) => {
  const tags = [];
  const fee  = getEffectiveFee(uni);
  const disc = (uni.discipline || uni.disciplineName || "").toLowerCase();

  if (scores.financial >= 75) tags.push("💰 Budget Friendly");
  if (scores.quality >= 70)   tags.push("🏆 Top Ranked");
  if (scores.location >= 90)  tags.push("📍 In Your City");
  if (scores.education >= 80) tags.push("🎓 Strong Match");
  if ((uni.feeType || "").toLowerCase().includes("semester")) tags.push("🗓 Semester Billing");
  if (fee === 0 || fee < 30000) tags.push("🆓 Minimal Fees");
  if (disc.includes("medicine") || disc.includes("health")) tags.push("🏥 Healthcare Focus");
  if (disc.includes("engineering") || disc.includes("technology")) tags.push("⚙️ Engineering");
  if (disc.includes("computer") || disc.includes("software")) tags.push("💻 Tech & CS");
  if (disc.includes("business")) tags.push("📊 Business");

  return tags.slice(0, 4); // max 4 tags per card
};

// ─── DIVERSITY FILTER ──────────────────────────────────────────────────────────
const applyDiversityFilter = (ranked, topN = 10) => {
  const cityCount = {};
  const result    = [];

  for (const item of ranked) {
    const city = (item.location || "").split(",")[0].trim();
    cityCount[city] = (cityCount[city] || 0) + 1;

    if (result.length >= topN) break;

    // Max 2 from same city in top-5, relax after
    if (result.length < 5 && cityCount[city] > 2) continue;

    result.push(item);
  }

  return result;
};

// ─── MAIN ENGINE: SCORE UNIVERSITIES ──────────────────────────────────────────
/**
 * @param {Array}  universities  — MongoDB university docs
 * @param {Object} profile       — userProfile.profile
 * @param {Object} engagement    — { likedIds, hiddenIds } (optional)
 * @returns {Array} scored + ranked recommendations
 */
const scoreUniversities = (universities, profile = {}, engagement = {}) => {
  const edu     = profile.education || {};
  const schemes = profile.schemes   || {};
  const weights = adjustWeights(edu, schemes);

  const coldStart = !edu.marks && !edu.discipline && !edu.preferredProgram && !edu.city;

  const scored = universities.map(u => {
    const uni = u.toObject ? u.toObject() : u;

    const edScore  = scoreEducation(uni, edu);
    const locScore = scoreLocation(uni, edu);
    const finScore = scoreFinancial(uni, edu);
    const qualScore= scoreQuality(uni);
    const engScore = scoreEngagement(uni, engagement);

    // Cold start: use only location + discipline
    const finalScore = coldStart
      ? clamp((locScore.score * 0.5) + (edScore.score * 0.5))
      : clamp(
          edScore.score   * weights.education  +
          locScore.score  * weights.location   +
          finScore.score  * weights.financial  +
          qualScore.score * weights.quality    +
          engScore.score  * weights.engagement
        );

    // Collect whyMatched reasons (max 4)
    const whyMatched = [
      ...edScore.reasons,
      ...locScore.reasons,
      ...finScore.reasons,
      ...qualScore.reasons,
      ...engScore.reasons,
    ].slice(0, 4);

    const scoreMap = {
      education: edScore.score,
      location:  locScore.score,
      financial: finScore.score,
      quality:   qualScore.score,
    };

    const tags = generateTags(uni, edu, scoreMap);

    return {
      id:       String(uni._id || uni.id || ""),
      name:     uni.title || uni.universityName || "Unknown University",
      type:     "university",
      score:    Math.round(finalScore),
      feeType:  uni.feeType || (uni.semesterFee ? "Semester Fee" : "Annual Fee"),
      location: `${uni.city}, ${uni.province}`,
      rank:     uni.ranking ? `#${uni.ranking}` : "Unranked",
      reason:   whyMatched,
      tags:     tags,
      // Raw subscores for frontend display
      _subscores: scoreMap,
    };
  });

  // Sort descending by score, break ties with quality
  const sorted = scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return (b._subscores.quality || 0) - (a._subscores.quality || 0);
  });

  // Apply diversity filter on top results
  return applyDiversityFilter(sorted, 12);
};

// ─── EXPORT ────────────────────────────────────────────────────────────────────
module.exports = { scoreUniversities };
