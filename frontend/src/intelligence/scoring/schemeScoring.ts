import { UserProfileContext, RecommendationResult } from "../types";
import { weightedAverage, getRelevanceLevel, getTieBreaker } from "../utils/scoringUtils";

export const calculateSchemeScore = (
  scheme: any,
  user: UserProfileContext
): RecommendationResult => {
  const reasons: string[] = [];
  const tags: string[] = [];
  const userProvince = (user.schemes?.province || user.location?.province || '').toLowerCase();
  const schemeProvince = (scheme.province || '').toLowerCase();
  
  // UNIQUE ENTITY KEY: Scheme Name + Province
  const entityId = `${scheme.schemeName}_${schemeProvince || 'federal'}`.toUpperCase().replace(/\s+/g, '_');
  const schemeId = String(scheme._id || entityId);

  // 1. ELIGIBILITY HARD FILTERS
  if (scheme.status === 'Inactive' || scheme.status === 'Closed') {
    return { id: schemeId, type: 'scheme', title: scheme.schemeName, score: 0, matchPercentage: 0, relevanceLevel: 'Low', reasons: [], tags: [], details: scheme };
  }

  // 2. LOCATION RELEVANCE & PRIORITY (25%)
  let locationScore = 0.2; 
  let locationLabel = "National Scheme";
  let priorityLevel: 'Local' | 'Nearby' | 'Province' | 'National' = 'National';

  if (schemeProvince === 'federal') {
    locationScore = 0.7;
    locationLabel = "Federal Initiative";
    priorityLevel = 'National';
    reasons.push("Available to all eligible citizens (Federal)");
  } else if (userProvince && schemeProvince === userProvince) {
    locationScore = 1.0;
    locationLabel = "Provincial Match";
    priorityLevel = 'Province';
    reasons.push(`Tailored for residents of ${scheme.province}`);
    tags.push("Local Benefit");
  }

  // 3. ELIGIBILITY ALIGNMENT (35%) - CONTINUOUS & GRANULAR
  let eligibilityScore = 0.4;
  let ageScore = 1.0;
  let incomeScore = 1.0;

  if (scheme.eligibility) {
    if (user.schemes?.age !== undefined) {
      const minAge = scheme.eligibility.age?.min || 0;
      const maxAge = scheme.eligibility.age?.max || 100;
      // Continuous penalty instead of binary cut-off
      if (user.schemes.age < minAge) ageScore = Math.max(0.1, 1 - (minAge - user.schemes.age) / 3);
      else if (user.schemes.age > maxAge) ageScore = Math.max(0.1, 1 - (user.schemes.age - maxAge) / 3);
      else ageScore = 1.0;
    }
    
    if (user.schemes?.income !== undefined) {
      const maxIncome = scheme.eligibility.income?.max || 100000;
      if (user.schemes.income <= maxIncome) {
        // Higher score for lower income relative to max
        incomeScore = 0.8 + (1 - (user.schemes.income / maxIncome)) * 0.2;
      } else {
        // Continuous degradation for over-income
        incomeScore = Math.max(0.05, 0.7 - (user.schemes.income - maxIncome) / (maxIncome * 0.3));
        if (user.schemes.income <= maxIncome * 1.15) {
          tags.push("Borderline Income");
          reasons.push("Income is slightly above standard threshold");
        }
      }
    }
    eligibilityScore = (ageScore * 0.4) + (incomeScore * 0.6);
  }

  // 4. CATEGORY & INTENT MATCH (25%)
  let categoryScore = 0.3;
  const schemeName = scheme.schemeName.toLowerCase();
  const userInterests = user.interests || [];
  
  if (userInterests.includes('education') && (schemeName.includes('scholarship') || schemeName.includes('student') || schemeName.includes('laptop'))) {
    categoryScore = 1.0;
    reasons.push("Perfectly matches your educational goals");
  } else if (userInterests.includes('schemes') && (schemeName.includes('loan') || schemeName.includes('subsidy'))) {
    categoryScore = 0.9;
  }

  // 5. NEED & IMPACT (15%)
  let needScore = 0.5;
  if (user.schemes?.income !== undefined) {
    // Dynamic need curve: exponentially higher for very low incomes
    needScore = Math.max(0.1, Math.pow(1 - (user.schemes.income / 200000), 2));
    if (needScore > 0.85) tags.push("High Impact");
  }

  // TIE-BREAKER
  const tieBreaker = getTieBreaker(schemeId) / 100;

  const weightedSum = weightedAverage([
    { score: eligibilityScore, weight: 35 },
    { score: locationScore, weight: 25 },
    { score: categoryScore, weight: 25 },
    { score: needScore, weight: 15 }
  ]);

  const percentage = Math.max(5, Math.min(100, Math.round(weightedSum + tieBreaker)));

  return {
    id: schemeId,
    type: 'scheme',
    title: scheme.schemeName,
    score: percentage,
    matchPercentage: percentage,
    relevanceLevel: getRelevanceLevel(percentage),
    reasons: reasons.slice(0, 3),
    tags: [locationLabel, ...tags].slice(0, 3),
    details: scheme,
    priorityLevel,
    diagnostics: {
      entityId: schemeId,
      locationScore: Math.round(locationScore * 100),
      eligibilityScore: Math.round(eligibilityScore * 100),
      incomeFitScore: Math.round(incomeScore * 100),
      categoryScore: Math.round(categoryScore * 100),
      needScore: Math.round(needScore * 100),
      finalScore: percentage,
      priorityLevel,
      finalRankingReason: categoryScore > 0.8 ? "Strong category alignment" : "General eligibility match"
    }
  };
};
