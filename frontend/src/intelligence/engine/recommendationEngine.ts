import { UserProfileContext, RecommendationResult, RecommendationEngineOutput, Diagnostics } from "../types";
import { calculateUniversityScore } from "../scoring/universityScoring";
import { calculateSchemeScore } from "../scoring/schemeScoring";
import { calculateHospitalScore } from "../scoring/hospitalScoring";
import { ContextGenerator } from "../context/contextGenerator";
import { EngagementManager } from "../engagement/engagementManager";

export interface RecommendationEngineInput {
  user: UserProfileContext;
  universities?: any[];
  schemes?: any[];
  hospitals?: any[];
  feedback?: any[];
  renderCount: number;
}

export class RecommendationEngine {
  /**
   * MASTER ORCHESTRATOR: Generates deterministic recommendations with context awareness.
   */
  static generateRecommendations(input: RecommendationEngineInput): RecommendationEngineOutput {
    const startTime = performance.now();
    const { 
      user, 
      universities: rawUniversities = [], 
      schemes: rawSchemes = [], 
      hospitals: rawHospitals = [], 
      feedback: userFeedback = [],
      renderCount 
    } = input;
    
    // --- ENGINE HEARTBEAT: VERIFYING CONTEXT (PHASE 5 REFINEMENT) ---
    console.info(`[Intelligence Engine] Heartbeat - Context: ${user.location.city || 'National'} | Degree: ${user.education.degree || 'Not Set'}`);
    console.info(`[Intelligence Engine] Processing Feed: ${rawUniversities.length} Unis, ${rawSchemes.length} Schemes`);

    let lowConfidenceDrops = 0;

    // --- STEP 1: DEEP INTENT DETECTION ---
    // We look at both selected interests AND data readiness.
    const activeModules = user.interests || [];
    
    const hasEducationData = !!(user.education?.degree || user.education?.marks);
    const hasFinancialData = !!(user.schemes?.income);
    const hasHealthData = !!(user.healthcare?.hospitalCategory || user.healthcare?.city);

    const hasEducationIntent = activeModules.includes('education') && hasEducationData;
    const hasFinancialIntent = activeModules.includes('schemes') && hasFinancialData;
    const hasHealthIntent = activeModules.includes('healthcare') && hasHealthData;

    // --- STEP 2: STRICT DATA FILTERING ---
    const priorityMap: Record<string, number> = { 'Local': 1, 'Nearby': 2, 'Province': 3, 'National': 4 };
    
    const sortRecommendations = (recs: RecommendationResult[]) => {
      const profile = EngagementManager.getProfile();
      
      // Map feedback for O(1) lookup
      const feedbackMap = new Map<string, string>();
      userFeedback.forEach(f => feedbackMap.set(f.recommendationId, f.reaction));

      return recs
        .filter(rec => feedbackMap.get(rec.id) !== 'not_relevant') // CRITICAL: Filter out not relevant
        .map(rec => {
          // Apply Engagement Influence Layer (Secondary)
          const category = rec.type; 
          const influence = EngagementManager.getEngagementInfluence(rec.id, category);
          let baseScore = typeof rec.score === 'number' ? rec.score : 0;
          
          // Apply Feedback Boost
          if (feedbackMap.get(rec.id) === 'helpful') {
            baseScore += 15; // Significant boost for previously helpful items
          }

          return {
            ...rec,
            score: Math.max(0, Math.min(100, baseScore + influence))
          };
        })
        .filter(rec => !profile.hiddenItems.includes(rec.id)) // Respect hidden items
        .sort((a, b) => {
          const pA = priorityMap[a.priorityLevel || 'National'] || 4;
          const pB = priorityMap[b.priorityLevel || 'National'] || 4;
          if (pA !== pB) return pA - pB;
          return b.score - a.score;
        });
    };

    // --- STEP 2: SCORING & RANKING ---
    const allScoredUnis = hasEducationIntent ? rawUniversities
        .filter(u => u && typeof u === 'object')
        .map(uni => {
          try { return calculateUniversityScore(uni, user); }
          catch (e) { console.error("Score Error (Uni):", e); return null; }
        })
        .filter((res): res is RecommendationResult => res !== null) : [];

    const allScoredSchemes = hasFinancialIntent ? rawSchemes
        .filter(s => s && typeof s === 'object')
        .map(scheme => {
          try { return calculateSchemeScore(scheme, user); }
          catch (e) { console.error("Score Error (Scheme):", e); return null; }
        })
        .filter((res): res is RecommendationResult => res !== null) : [];

    const allScoredHospitals = hasHealthIntent ? rawHospitals
        .filter(h => h && typeof h === 'object')
        .map(hosp => {
          try { return calculateHospitalScore(hosp, user); }
          catch (e) { console.error("Score Error (Hosp):", e); return null; }
        })
        .filter((res): res is RecommendationResult => res !== null) : [];

    // --- STEP 3: UNIQUE REASON GENERATION (Duplication Control) ---
    const attachExplanations = (recs: RecommendationResult[], type: 'university' | 'scheme' | 'hospital') => {
      const usedExplanations = new Set<string>();
      
      return recs.map(rec => {
        if (rec.explanation && !usedExplanations.has(rec.explanation)) {
          usedExplanations.add(rec.explanation);
          return rec;
        }

        let explanation = '';
        let offset = 0;
        
        // Find a unique explanation variant
        do {
          explanation = ContextGenerator.generateExplanation(type, rec, user, offset);
          offset++;
        } while (usedExplanations.has(explanation) && offset < 5); // Fallback after 5 tries
        
        usedExplanations.add(explanation);
        return { ...rec, explanation };
      });
    };

    const rankedUniversities = attachExplanations(sortRecommendations(allScoredUnis).slice(0, 3), 'university');
    const rankedSchemes = attachExplanations(sortRecommendations(allScoredSchemes).slice(0, 3), 'scheme');
    const rankedHospitals = attachExplanations(sortRecommendations(allScoredHospitals).slice(0, 3), 'hospital');

    // --- STEP 4: INTELLIGENCE METRICS (PURE MATHEMATICAL AVERAGING) ---
    const eduAvg = allScoredUnis.length > 0 ? allScoredUnis.reduce((acc, res) => acc + res.score, 0) / allScoredUnis.length : 0;
    const schemeAvg = allScoredSchemes.length > 0 ? allScoredSchemes.reduce((acc, res) => acc + res.score, 0) / allScoredSchemes.length : 0;
    const hospAvg = allScoredHospitals.length > 0 ? allScoredHospitals.reduce((acc, res) => acc + res.score, 0) / allScoredHospitals.length : 0;

    const activeModuleScores = [];
    if (hasEducationIntent && allScoredUnis.length > 0) activeModuleScores.push({ id: 'education', avg: eduAvg, weight: 0.5 });
    if (hasFinancialIntent && allScoredSchemes.length > 0) activeModuleScores.push({ id: 'schemes', avg: schemeAvg, weight: 0.3 });
    if (hasHealthIntent && allScoredHospitals.length > 0) activeModuleScores.push({ id: 'healthcare', avg: hospAvg, weight: 0.2 });

    let overallConfidence = 0;
    const moduleBreakdown: any = {};

    if (activeModuleScores.length > 0) {
      // RULE: Normalized weighted average based on 50/30/20 ratio for ACTIVE modules only
      const totalWeight = activeModuleScores.reduce((acc, m) => acc + m.weight, 0);
      overallConfidence = activeModuleScores.reduce((acc, m) => acc + (m.avg * (m.weight / totalWeight)), 0);

      // Populate accurate breakdown for UI
      if (hasEducationIntent && allScoredUnis.length > 0) moduleBreakdown.education = Math.round(eduAvg);
      if (hasFinancialIntent && allScoredSchemes.length > 0) moduleBreakdown.schemes = Math.round(schemeAvg);
      if (hasHealthIntent && allScoredHospitals.length > 0) moduleBreakdown.healthcare = Math.round(hospAvg);
    }

    // Explicit 1-decimal place rounding for final display, strictly bounded to 100%
    overallConfidence = Math.min(100, Number(overallConfidence.toFixed(1)));

    const allResults = [...rankedUniversities, ...rankedSchemes, ...rankedHospitals];
    const profileCompleteness = this.calculateProfileCompleteness(user);

    // 5. Generate Contextual Narratives & Insights (Intent-Aware)
    // We override the user's interests in the context to ensure the generator only sees ACTIVE intents.
    const intentAwareUser = {
      ...user,
      interests: [
        ...(hasEducationIntent ? ['education'] : []),
        ...(hasFinancialIntent ? ['schemes'] : []),
        ...(hasHealthIntent ? ['healthcare'] : [])
      ]
    };

    const profileNarrative = ContextGenerator.generateProfileNarrative(intentAwareUser);
    const insights = ContextGenerator.generateInsights(intentAwareUser, {
      universities: rankedUniversities.length,
      schemes: rankedSchemes.length,
      hospitals: rankedHospitals.length
    });

    const endTime = performance.now();
    
    const diagnostics: Diagnostics = {
      renderCount,
      rankingDuration: Math.round(endTime - startTime),
      universitiesProcessed: rankedUniversities.length,
      schemesProcessed: rankedSchemes.length,
      hospitalsProcessed: rankedHospitals.length,
      filteredOutCounts: {
        universities: rawUniversities.length - rankedUniversities.length,
        schemes: rawSchemes.length - rankedSchemes.length,
        hospitals: rawHospitals.length - rankedHospitals.length
      },
      scoringBreakdown: {
        avgUniScore: rankedUniversities.length > 0 ? Math.round(rankedUniversities.reduce((a, b) => a + b.score, 0) / rankedUniversities.length) : 0,
        avgSchemeScore: rankedSchemes.length > 0 ? Math.round(rankedSchemes.reduce((a, b) => a + b.score, 0) / rankedSchemes.length) : 0,
        avgHospScore: rankedHospitals.length > 0 ? Math.round(rankedHospitals.reduce((a, b) => a + b.score, 0) / rankedHospitals.length) : 0
      },
      profileCompleteness,
      recommendationCoverage: allResults.length,
      lowConfidenceDrops
    };

    return {
      universities: rankedUniversities,
      schemes: rankedSchemes,
      hospitals: rankedHospitals,
      overallConfidence,
      moduleBreakdown,
      profileNarrative,
      insights,
      diagnostics
    };
  }

  /**
   * Helper to map raw profile data to UserProfileContext with sanitization.
   */
  static mapRawProfile(raw: any, userBasics: any): UserProfileContext {
    const profile = raw?.profile || {};
    return {
      name: userBasics?.data?.student_name || "Guest",
      location: {
        city: profile.education?.city || profile.healthcare?.city,
        province: profile.schemes?.province,
        tehsil: profile.healthcare?.tehsil
      },
      education: {
        degree: profile.education?.degree,
        preferredProgram: profile.education?.preferredProgram || profile.education?.disciplineGroup || profile.education?.discipline,
        marks: profile.education?.marks,
        city: profile.education?.city
      },
      schemes: {
        income: profile.schemes?.income,
        age: profile.schemes?.age,
        employmentStatus: profile.schemes?.employmentStatus,
        province: profile.schemes?.province,
        educationLevel: profile.education?.degree
      },
      healthcare: {
        city: profile.healthcare?.city,
        tehsil: profile.healthcare?.tehsil,
        hospitalCategory: profile.healthcare?.hospitalCategory,
        treatmentType: profile.healthcare?.treatmentType,
        budgetRange: profile.healthcare?.budgetRange,
        urgencyLevel: profile.healthcare?.urgencyLevel,
        travelPreference: profile.healthcare?.travelPreference,
        medicalSupport: profile.healthcare?.medicalSupport,
        medicalInsurance: profile.healthcare?.medicalInsurance,
        financialAssistance: profile.healthcare?.financialAssistance
      },
      interests: raw?.selectedModules || []
    };
  }

  private static calculateProfileCompleteness(user: UserProfileContext): number {
    let score = 0;
    let total = 0;

    const check = (val: any) => {
      total++;
      if (val !== undefined && val !== null && val !== "") score++;
    };

    check(user.location?.city);
    check(user.education?.degree);
    check(user.education?.preferredProgram);
    check(user.education?.marks);
    check(user.schemes?.income);
    check(user.schemes?.age);
    check(user.healthcare?.hospitalCategory);

    return total > 0 ? Math.round((score / total) * 100) : 0;
  }
}
