import { UserProfileContext, RecommendationResult } from "../types";
import { weightedAverage, getRelevanceLevel, getTieBreaker } from "../utils/scoringUtils";

export const calculateSchemeScore = (
  scheme: any,
  user: UserProfileContext
): RecommendationResult | null => {
  if (!scheme || typeof scheme !== 'object') return null;
  const reasons: string[] = [];
  const tags: string[] = [];
  
  const sc = user.schemes || {};
  const userProvince = (sc.province || user.location?.province || '').toLowerCase().trim();
  const userCity = (sc.city || user.location?.city || '').toLowerCase().trim();
  
  const schemeProvince = (scheme.province || '').toLowerCase().trim();
  
  // UNIQUE ENTITY KEY
  const entityId = `${scheme.schemeName}_${schemeProvince || 'federal'}`.toUpperCase().replace(/\s+/g, '_');
  const schemeId = String(scheme._id || entityId);

  // 1. ELIGIBILITY HARD FILTERS
  if (scheme.status === 'Inactive' || scheme.status === 'Closed') {
    return { id: schemeId, type: 'scheme', title: scheme.schemeName, score: 0, matchPercentage: 0, relevanceLevel: 'Low', reasons: [], tags: [], details: scheme, priorityLevel: 'National' };
  }

  // 2. LOCATION INTELLIGENCE (20%)
  let locationScore = 0.2; 
  let priorityLevel: 'Local' | 'Nearby' | 'Province' | 'National' = 'National';

  if (schemeProvince === 'federal' || schemeProvince === 'all pakistan') {
    locationScore = 0.8;
    priorityLevel = 'National';
  } else if (userProvince && schemeProvince === userProvince) {
    locationScore = 1.0;
    priorityLevel = 'Province';
    
    // Check specific cities if scheme has them
    if (scheme.cities && scheme.cities.length > 0 && userCity) {
      if (scheme.cities.some((c: string) => c.toLowerCase().trim() === userCity)) {
        locationScore = 1.0;
        priorityLevel = 'Local';
        tags.push("City Match");
      } else {
        locationScore = 0.5; // Wrong city but right province
      }
    } else {
      tags.push("Provincial Match");
    }
  }

  // 3. INCOME & AGE ELIGIBILITY SCORING (30%)
  let ageScore = 0.5;
  let incomeScore = 0.5;

  if (scheme.eligibility) {
    // Age Matching
    if (sc.age !== undefined && sc.age !== null) {
      const minAge = scheme.eligibility.age?.min || 0;
      const maxAge = scheme.eligibility.age?.max || 100;
      
      if (sc.age >= minAge && sc.age <= maxAge) {
        ageScore = 1.0;
      } else {
        // Penalty for age mismatch
        const diff = sc.age < minAge ? minAge - sc.age : sc.age - maxAge;
        ageScore = Math.max(0.1, 0.8 - (diff / 10));
        if (diff > 5) ageScore = 0.1; // Strict cutoff if > 5 years out
      }
    } else {
      ageScore = 0.6; // Neutral
    }
    
    // Income Matching
    if (sc.income !== undefined && sc.income !== null) {
      const minIncome = scheme.eligibility.income?.min || 0;
      const maxIncome = scheme.eligibility.income?.max || 1000000;
      
      if (sc.income >= minIncome && sc.income <= maxIncome) {
        // Perfect fit. Boost lower incomes if max is generous
        const comfort = (maxIncome - sc.income) / maxIncome;
        incomeScore = 0.7 + (comfort * 0.3);
      } else if (sc.income > maxIncome) {
        // Penalty for exceeding max income
        const excess = (sc.income - maxIncome) / maxIncome;
        incomeScore = Math.max(0.05, 0.6 - (excess * 2));
        if (excess <= 0.15) {
          tags.push("Borderline Income");
        }
      } else if (sc.income < minIncome) {
        incomeScore = 0.1; // Too low for min-income schemes (e.g. loans)
      }
    } else {
      incomeScore = 0.5; // Neutral
    }
  }

  // Combined Eligibility
  const eligibilityScore = (ageScore * 0.4) + (incomeScore * 0.6);

  // 4. ASSISTANCE TYPE & EDUCATION MATCHING (25%)
  let categoryScore = 0.3;
  const schemeName = (scheme.schemeName || '').toLowerCase();
  const schemeCategory = (scheme.category || '').toLowerCase();
  const subCategory = (scheme.subCategory || '').toLowerCase();
  
  const financialNeeds = Array.isArray(sc.financialNeedType) ? sc.financialNeedType.map((t: string) => t.toLowerCase()) : [];
  
  // Map standard needs to scheme hints
  if (financialNeeds.includes('education') || sc.studentStatus === 'Yes' || sc.employmentStatus === 'Student') {
    if (schemeCategory.includes('education') || schemeName.includes('scholarship') || schemeName.includes('laptop') || schemeName.includes('student')) {
      categoryScore = 1.0;
    }
  }
  
  if (financialNeeds.includes('healthcare')) {
    if (schemeCategory.includes('health') || schemeName.includes('treatment') || schemeName.includes('hospital')) {
      categoryScore = 1.0;
    }
  }

  if (financialNeeds.includes('business') || financialNeeds.includes('loans')) {
    if (schemeCategory.includes('loan') || schemeCategory.includes('business') || schemeName.includes('rozgar')) {
      categoryScore = 1.0;
    }
  }

  if (financialNeeds.includes('agriculture')) {
    if (schemeCategory.includes('agriculture') || schemeName.includes('kissan') || schemeName.includes('farmer')) {
      categoryScore = 1.0;
    }
  }

  // Exact category alignment check
  if (scheme.eligibility?.categories?.length > 0) {
    if (scheme.eligibility.categories.some((c: string) => c.toLowerCase() === sc.employmentStatus?.toLowerCase() || c.toLowerCase() === schemeCategory)) {
      categoryScore = Math.max(categoryScore, 0.9);
    }
  }

  // 5. HOUSEHOLD & SUPPORT INTELLIGENCE (15%)
  let householdScore = 0.5;
  const isLargeFamily = sc.familySize >= 5;
  const isLowIncome = sc.income !== undefined && sc.income < 50000;
  
  if (isLargeFamily && isLowIncome) {
    if (schemeCategory.includes('welfare') || schemeName.includes('ehsaas') || schemeName.includes('bisp') || schemeName.includes('rashan')) {
      householdScore = 1.0;
    }
  }

  if (sc.disabilityStatus && sc.disabilityStatus !== 'No' && sc.disabilityStatus !== 'No Disability') {
    if (schemeCategory.includes('disability') || schemeName.includes('mazdoor') || schemeName.includes('special')) {
      householdScore = 1.0;
    }
  }
  
  if (sc.bispStatus === 'Beneficiary') {
    if (schemeName.includes('ehsaas') || schemeName.includes('bisp')) {
      householdScore = 1.0;
    }
  } else if (sc.bispStatus === 'Ineligible') {
    if (schemeName.includes('ehsaas') || schemeName.includes('bisp')) {
      householdScore = 0.1; // Don't recommend BISP to ineligible users
    }
  }

  // 6. DIGITAL ACCESS INTELLIGENCE (10%)
  let accessScore = 1.0;
  const isOffline = sc.internetAccess === 'No' || sc.deviceAccess === 'No';
  const method = (scheme.application?.method || '').toLowerCase();
  
  if (isOffline) {
    if (method.includes('online') || method.includes('app') || method.includes('portal')) {
      accessScore = 0.3; // Hard to apply
    } else if (method.includes('office') || method.includes('walk-in') || method.includes('form')) {
      accessScore = 1.0; // Easy to apply
    }
  }

  // TIE-BREAKER
  const tieBreaker = getTieBreaker(schemeId) / 100;

  // Real weighted sum calculation
  const weightedSum = weightedAverage([
    { score: eligibilityScore, weight: 30 },
    { score: categoryScore, weight: 25 },
    { score: locationScore, weight: 20 },
    { score: householdScore, weight: 15 },
    { score: accessScore, weight: 10 }
  ]);

  const percentage = Math.min(100, Math.round(weightedSum + (tieBreaker * 100)));

  // SMART EXPLANATIONS
  const expReasons = [];
  if (ageScore >= 0.9 && incomeScore >= 0.9) {
    expReasons.push("income and age match the exact eligibility criteria");
  } else if (incomeScore >= 0.8) {
    expReasons.push("income profile aligns with this program");
  } else if (incomeScore < 0.5) {
    reasons.push("Limited eligibility due to income criteria.");
  }
  
  if (categoryScore >= 0.9) {
    if (financialNeeds.length > 0) {
      expReasons.push(`it supports your goal for ${financialNeeds[0]} assistance`);
    } else if (sc.studentStatus === 'Yes') {
      expReasons.push("it is highly beneficial for students");
    } else {
      expReasons.push(`strong alignment with your ${schemeCategory} needs`);
    }
  }
  
  if (householdScore >= 0.9 && isLargeFamily) {
    expReasons.push("it is designed to assist large households");
  } else if (householdScore >= 0.9 && sc.disabilityStatus && sc.disabilityStatus !== 'No') {
    expReasons.push("it provides targeted disability support");
  }
  
  if (locationScore >= 0.9) {
    expReasons.push(`it is active in your region`);
  }
  
  let smartExplanation = "A suitable welfare option based on your overall profile.";
  if (expReasons.length >= 2) {
    smartExplanation = `Matched because your ${expReasons[0]}, and ${expReasons[1]}.`;
  } else if (expReasons.length === 1) {
    smartExplanation = `Matched because your ${expReasons[0]}.`;
  }

  if (reasons.length === 0) reasons.push(smartExplanation);

  // SMART PRIORITY LABELS
  let primaryLabel = "Recommended Scheme";
  if (eligibilityScore >= 0.9 && percentage >= 85) {
    primaryLabel = "Highly Eligible";
    if (categoryScore >= 0.9 && financialNeeds.includes('education')) primaryLabel = "Student Support Match";
    else if (categoryScore >= 0.9 && financialNeeds.includes('healthcare')) primaryLabel = "Healthcare Assistance Match";
  } else if (incomeScore >= 0.9 && percentage >= 80) {
    primaryLabel = "Best Financial Match";
    if (householdScore >= 0.9 && isLargeFamily) primaryLabel = "Family Support Eligible";
  } else if (householdScore >= 0.9 && sc.disabilityStatus && sc.disabilityStatus !== 'No') {
    primaryLabel = "Welfare Priority";
  } else if (locationScore >= 0.95 && percentage >= 75) {
    primaryLabel = "Regional Match";
  }
  
  if (percentage < 60) primaryLabel = "Partial Eligibility";

  tags.unshift(primaryLabel);
  const uniqueTags = Array.from(new Set(tags)).slice(0, 3);

  return {
    id: schemeId,
    type: 'scheme',
    title: scheme.schemeName || scheme.shortName,
    score: percentage,
    matchPercentage: percentage,
    relevanceLevel: getRelevanceLevel(percentage),
    reasons,
    explanation: smartExplanation,
    tags: uniqueTags,
    details: scheme,
    priorityLevel,
    diagnostics: {
      entityId: schemeId,
      locationScore: Math.round(locationScore * 100),
      eligibilityScore: Math.round(eligibilityScore * 100),
      categoryScore: Math.round(categoryScore * 100),
      householdScore: Math.round(householdScore * 100),
      accessScore: Math.round(accessScore * 100),
      finalScore: percentage,
      priorityLevel,
      finalRankingReason: primaryLabel
    }
  };
};
