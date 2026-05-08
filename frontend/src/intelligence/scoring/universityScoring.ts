import { UserProfileContext, RecommendationResult } from "../types";
import { weightedAverage, getRelevanceLevel, NEARBY_CITIES, getTieBreaker } from "../utils/scoringUtils";

export const calculateUniversityScore = (
  university: any,
  user: UserProfileContext
): RecommendationResult => {
  const reasons: string[] = [];
  const tags: string[] = [];
  
  const userCity = (user.location?.city || user.education?.city || '').toLowerCase();
  const userProvince = (user.location?.province || '').toLowerCase();
  const uniCity = (university.city || university.City || '').toLowerCase();
  const uniProvince = (university.province || university.Province || '').toLowerCase();
  
  // UNIQUE ENTITY KEY: Institution Name + City ensures campuses are treated independently
  const entityId = `${university.title}_${uniCity}`.toUpperCase().replace(/\s+/g, '_');
  const uniId = String(university._id || entityId);

  // 1. LOCATION RELEVANCE (40%) - STRONGEST PRIORITY
  let locationScore = 0.15; 
  let locationLabel = "National Recommendation";
  let priorityLevel: 'Local' | 'Nearby' | 'Province' | 'National' = 'National';

  if (userCity && uniCity === userCity) {
    locationScore = 1.0; 
    locationLabel = "In your city";
    priorityLevel = 'Local';
    reasons.push(`Perfectly located within ${university.city}`);
    tags.push("Top Priority");
  } else if (userCity && NEARBY_CITIES[userCity]?.includes(uniCity)) {
    locationScore = 0.85; 
    locationLabel = "Nearby City";
    priorityLevel = 'Nearby';
    reasons.push(`Conveniently close to ${user.location?.city}`);
    tags.push("Regional Match");
  } else if (userProvince && uniProvince === userProvince) {
    locationScore = 0.45; 
    locationLabel = "In your province";
    priorityLevel = 'Province';
    reasons.push(`Located within ${university.province}`);
  }

  // 2. ACADEMIC MATCH (30%) - DEGREE + MERIT
  let educationScore = 0.5;
  if (user.education?.degree) {
    const userDegree = user.education.degree.toLowerCase();
    const uniDegree = (university.degree || '').toLowerCase();
    const isProgression = (
      (userDegree.includes('intermediate') && uniDegree.includes('bachelor')) ||
      (userDegree.includes('bachelor') && uniDegree.includes('master'))
    );
    if (isProgression) educationScore = 1.0;
    else if (userDegree === uniDegree) educationScore = 0.8;
  }

  let meritScore = 0.5;
  if (user.education?.marks !== undefined && (university.merit || university.Merit)) {
    const uniMerit = university.merit || university.Merit;
    const diff = user.education.marks - uniMerit;
    
    // GRANULAR SCORING: Use a continuous curve instead of steps
    if (diff >= 0) {
      meritScore = Math.min(1.0, 0.75 + (diff * 0.02));
      tags.push("Merit Safe");
    } else {
      meritScore = Math.max(0.1, 0.75 + (diff * 0.08));
      if (diff >= -2) {
        tags.push("Borderline Match");
        reasons.push("Your marks are very close to the expected merit");
      }
    }
  }
  
  const academicScore = (educationScore * 0.6) + (meritScore * 0.4);

  // 3. FIELD ALIGNMENT (20%)
  let fieldScore = 0.35;
  if (user.education?.discipline && university.discipline) {
    const userField = user.education.discipline.toLowerCase();
    const uniField = university.discipline.toLowerCase();
    if (uniField.includes(userField) || userField.includes(uniField)) {
      fieldScore = 1.0;
      tags.push(university.discipline);
      reasons.push(`Matches your interest in ${university.discipline}`);
    } else {
      const majorAreas = ['engineering', 'medical', 'science', 'arts', 'business'];
      const userArea = majorAreas.find(a => userField.includes(a));
      const uniArea = majorAreas.find(a => uniField.includes(a));
      if (userArea && uniArea && userArea === uniArea) fieldScore = 0.6;
    }
  }

  // 4. PRACTICALITY (10%) - AFFORDABILITY
  let financialScore = 0.55;
  if (university.fee) {
    if (university.fee < 80000) financialScore = 1.0;
    else if (university.fee < 150000) financialScore = 0.8;
    else if (university.fee < 300000) financialScore = 0.6;
  }

  // 5. CAMPUS DIFFERENTIATION (NEW)
  // Give a subtle boost to main campuses in major hubs to prevent score ties
  let campusBoost = 0;
  const majorHubs = ['lahore', 'karachi', 'islamabad', 'peshawar', 'quetta', 'multan', 'faisalabad'];
  if (majorHubs.includes(uniCity)) campusBoost = 0.05;

  // TIE-BREAKER: Increased impact (up to 2.0%) to ensure rounding doesn't collapse scores
  const tieBreaker = getTieBreaker(uniId) * 2;

  // Final Weighted Average
  const weightedSum = weightedAverage([
    { score: locationScore + campusBoost, weight: 40 },
    { score: academicScore, weight: 30 },
    { score: fieldScore, weight: 20 },
    { score: financialScore, weight: 10 }
  ]);

  // We add tie-breaker AFTER rounding to ensure unique visible percentages
  const basePercentage = Math.max(0, Math.min(100, Math.round(weightedSum)));
  const finalPercentage = basePercentage + (tieBreaker > 1 ? 1 : 0); // Discrete separation
  
  // Actually, let's just make it float-aware for the internal sort and then unique for display
  const percentage = Math.round(weightedSum + tieBreaker);

  return {
    id: uniId,
    type: 'university',
    title: university.title,
    score: percentage,
    matchPercentage: percentage,
    relevanceLevel: getRelevanceLevel(percentage),
    reasons: reasons.slice(0, 3),
    tags: [locationLabel, ...tags].slice(0, 3),
    details: university,
    priorityLevel,
    diagnostics: {
      entityId: uniId,
      universityName: university.title,
      campusCity: university.city || university.City,
      locationScore: Math.round(locationScore * 100),
      academicScore: Math.round(academicScore * 100),
      finalScore: percentage,
      priorityLevel,
      finalRankingReason: priorityLevel === 'Local' ? "Best choice in your city" : 
                         priorityLevel === 'Nearby' ? "Regional campus proximity" :
                         "Academic compatibility"
    }
  };
};
