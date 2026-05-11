import { UserProfileContext, RecommendationResult } from "../types";
import { getRelevanceLevel, getTieBreaker } from "../utils/scoringUtils";

const SPECIALIZATION_MAP: Record<string, string[]> = {
  "iot": ["ai", "embedded", "computer", "data science", "robotics", "software", "mechatronics"],
  "ai": ["data science", "machine learning", "computer science", "software", "artificial intelligence"],
  "cybersecurity": ["information security", "computer science", "networks", "software", "security"],
  "data science": ["ai", "machine learning", "computer science", "statistics", "software", "data"],
  "robotics": ["mechatronics", "electrical", "mechanical", "computer", "ai", "robot"],
  "web development": ["software", "computer science", "it", "cs"],
  "app development": ["software", "computer science", "it", "cs"],
};

const CAREER_GOAL_MAP: Record<string, string[]> = {
  "financial analyst": ["finance", "accounting", "economics", "business analytics", "bba", "mba", "commerce"],
  "software engineer": ["software", "computer science", "it", "cs", "computing", "se"],
  "doctor": ["medicine", "mbbs", "bds", "surgery", "medical", "health"],
  "civil engineer": ["civil", "construction", "architecture"],
  "data scientist": ["data science", "ai", "computer science", "statistics"],
  "manager": ["bba", "mba", "management", "business", "administration"],
};

const FEE_RANGE_MAP: Record<string, {min: number, max: number}> = {
  "Under 50k":    { min: 0,      max: 50000  },
  "50k-100k":     { min: 50000,  max: 100000 },
  "100k-200k":    { min: 100000, max: 200000 },
  "Above 200k":   { min: 200000, max: Infinity },
};

const getEffectiveFee = (uni: any) => {
  if (uni.annualFee && uni.annualFee > 0) return uni.annualFee;
  if (uni.semesterFee && uni.semesterFee > 0) return uni.semesterFee * 2;
  if (uni.fee && uni.fee > 0) return uni.fee;
  return 0;
};

export const calculateUniversityScore = (
  university: any,
  user: UserProfileContext
): RecommendationResult | null => {
  if (!university.programs || !Array.isArray(university.programs) || university.programs.length === 0) {
    return null;
  }

  const rawUser = user as any;
  const userMarks = Number(user.education?.marks) || 0;
  const expectedMerit = Number(rawUser.education?.expectedMerit) || 0;
  const userEffectiveScore = Math.max(userMarks, expectedMerit);
  
  const userCity = (user.location?.city || user.education?.city || '').toLowerCase().trim();
  const feeRange = user.education?.feeRange || "";
  const rangeObj = FEE_RANGE_MAP[feeRange] || { min: 0, max: 1000000 }; // Default high if not set
  const relocationPref = String(rawUser.education?.relocation || "yes").toLowerCase();
  const prefProg = (user.education?.preferredProgram || rawUser.education?.disciplineGroup || "").toLowerCase();

  const scoredPrograms = [];
  let bestProgramData: any = null;
  let bestScore = -1;

  for (const prog of university.programs) {
    if (prog.status !== 'active') continue;

    // --- STEP 1: HARD FILTER LAYER ---
    
    // 1.1 Budget Filter
    const fee = getEffectiveFee(prog);
    if (rangeObj.max > 0 && fee > rangeObj.max) continue; // REJECT: Over budget

    // 1.2 Merit Filter (User marks must be within 15% of requirement)
    const progMerit = Number(prog.merit) || 0;
    if (progMerit > 0 && userEffectiveScore < (progMerit - 15)) continue; // REJECT: Merit too high

    // 1.3 Location Filter
    const uniCity = (university.city || "").toLowerCase().trim();
    if (relocationPref === 'no' && userCity && uniCity !== userCity) continue; // REJECT: Relocation not allowed

    // 1.4 Program Relevance Filter
    const progDisc = (prog.discipline || "").toLowerCase();
    const isRelevant = !prefProg || progDisc.includes(prefProg);
    if (prefProg && !isRelevant) continue; // REJECT: Mismatched discipline

    // --- STEP 2: SCORING LAYER ---

    // 2.1 Merit Score (Realistic Ratio)
    // Formula: (user_marks / program_merit_requirement) * 100
    let meritScore = 100;
    if (progMerit > 0) {
      meritScore = (userEffectiveScore / progMerit) * 100;
    } else {
      meritScore = 85; // Default for missing data but passed filters
    }
    meritScore = Math.min(100, Math.max(0, meritScore));

    // 2.2 Budget Score
    // Formula: 100 if under budget, with advanced ratio for better value
    let budgetScore = 100;
    if (fee > 0) {
        // If fee is much lower than budget max, it's a better score
        budgetScore = Math.min(100, (rangeObj.max / fee) * 100);
    }

    // 2.3 Location Score
    const locationScore = (uniCity === userCity) ? 100 : 60;

    // --- STEP 3: FINAL WEIGHTED SCORE ---
    // final_score = (merit_score * 0.45) + (budget_score * 0.35) + (location_score * 0.20)
    const finalScore = Math.round(
      (meritScore * 0.45) + 
      (budgetScore * 0.35) + 
      (locationScore * 0.20)
    );

    // --- STEP 4: DIAGNOSTICS & EXPLANATION ---
    const reasons = [];
    if (fee <= rangeObj.max) reasons.push("budget compatible");
    if (userEffectiveScore >= progMerit) reasons.push("merit alignment");
    else reasons.push("merit accessibility");
    if (uniCity === userCity) reasons.push("location match");
    if (isRelevant) reasons.push("program relevance");

    const smartExplanation = `Matched because ${reasons.slice(0, -1).join(', ')}, and ${reasons[reasons.length - 1]}.`;

    scoredPrograms.push({
      ...prog,
      programScore: finalScore,
      explanation: smartExplanation,
      meritScore,
      budgetScore,
      locationScore,
      isRelevant
    });

    if (finalScore > bestScore) {
      bestScore = finalScore;
      bestProgramData = scoredPrograms[scoredPrograms.length - 1];
    }
  }

  if (scoredPrograms.length === 0 || !bestProgramData) return null;

  // Sort and pick best
  scoredPrograms.sort((a, b) => b.programScore - a.programScore);
  
  const uniId = String(university._id || university.id);
  const tieBreaker = getTieBreaker(uniId);
  const finalMatchPercentage = Math.min(100, Math.round(bestScore + (tieBreaker > 0 ? 1 : 0)));

  return {
    id: uniId,
    type: 'university',
    title: university.title,
    score: finalMatchPercentage,
    matchPercentage: finalMatchPercentage,
    relevanceLevel: finalMatchPercentage >= 85 ? 'High' : finalMatchPercentage >= 70 ? 'Medium' : 'Low',
    reasons: [bestProgramData.explanation],
    explanation: bestProgramData.explanation,
    tags: [
        finalMatchPercentage >= 90 ? "Best Overall Match" : "Recommended",
        bestProgramData.budgetScore >= 95 ? "Budget Friendly" : null,
        bestProgramData.meritScore >= 95 ? "Academic Fit" : null
    ].filter(Boolean) as string[],
    details: { ...university, programs: scoredPrograms },
    priorityLevel: bestProgramData.locationScore === 100 ? 'Local' : 'National',
    diagnostics: {
      locationScore: Math.round(bestProgramData.locationScore),
      academicScore: Math.round(bestProgramData.meritScore),
      fieldScore: bestProgramData.isRelevant ? 100 : 50,
      priorityLevel: bestProgramData.locationScore === 100 ? 'Local' : 'National',
      finalRankingReason: bestProgramData.explanation
    }
  };
};
