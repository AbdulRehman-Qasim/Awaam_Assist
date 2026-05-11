import { UserProfileContext, RecommendationResult } from "../types";
import { weightedAverage, getRelevanceLevel, NEARBY_CITIES, getTieBreaker } from "../utils/scoringUtils";

export const calculateHospitalScore = (
  hospital: any,
  user: UserProfileContext
): RecommendationResult | null => {
  if (!hospital || typeof hospital !== 'object') return null;

  const reasons: string[] = [];
  const tags: string[] = [];

  const hc = user.healthcare || {};
  const userCity = (hc.city || user.location?.city || '').toLowerCase().trim();
  const hospitalCity = (hospital.City || hospital.city || '').toLowerCase().trim();
  const userTehsil = (hc.tehsil || '').toLowerCase().trim();
  const hospitalTehsil = (hospital.Tehsil || hospital.tehsil || '').toLowerCase().trim();

  const entityId = `${hospital["Hospital Name"] || 'Hospital'}_${hospitalCity}`.toUpperCase().replace(/\s+/g, '_');
  const hospitalId = String(hospital._id || entityId);

  // --- 1. EXTRACT BEST TREATMENT DATA ---
  const userTreatment = (hc.treatmentType || '').toLowerCase().trim();
  let bestTreatment: any = null;
  let bestTreatmentScore = 0;

  // Flatten treatments to check both root and array
  const treatmentsToEval = [];
  
  if (hospital.treatments && Array.isArray(hospital.treatments) && hospital.treatments.length > 0) {
    treatmentsToEval.push(...hospital.treatments);
  } else {
    // Treat root fields as a single treatment if no array
    treatmentsToEval.push({
      treatmentName: hospital.treatmentName || '',
      specialization: hospital.treatmentSpecialty || '',
      treatmentCost: hospital.treatmentCost || 0,
      availability: hospital.availability || 'Available',
      waitingTime: hospital.waitingTime || 'Immediate',
      severitySupport: hospital.severitySupport || 'Basic',
      supportFeatures: hospital.supportFeatures || []
    });
  }

  // Find the best matching treatment
  for (const t of treatmentsToEval) {
    const tName = (t.treatmentName || '').toLowerCase();
    const tSpec = (t.specialization || '').toLowerCase();
    let matchScore = 0;
    
    if (userTreatment) {
      if (tName === userTreatment || tSpec === userTreatment) matchScore = 1.0;
      else if (tName.includes(userTreatment) || tSpec.includes(userTreatment) || userTreatment.includes(tName) || userTreatment.includes(tSpec)) matchScore = 0.8;
      else if (tName.includes('general') || tSpec.includes('general')) matchScore = 0.4;
    } else {
      matchScore = 0.5; // No specific treatment requested
    }
    
    if (matchScore > bestTreatmentScore || (matchScore === bestTreatmentScore && t.treatmentCost < (bestTreatment?.treatmentCost || Infinity))) {
      bestTreatmentScore = matchScore;
      bestTreatment = t;
    }
  }

  if (!bestTreatment) bestTreatment = treatmentsToEval[0] || {};

  // --- 2. TREATMENT MATCHING (30%) ---
  let specialtyScore = 0.3;
  if (bestTreatmentScore >= 0.8) {
    specialtyScore = 1.0;
    tags.push("Specialized Treatment Match");
  } else if (bestTreatmentScore >= 0.4) {
    specialtyScore = 0.6;
    tags.push("General Treatment");
  }

  const userCatPref = (hc.hospitalCategory || '').toLowerCase();
  const hospitalCat = (hospital.Cateogry || hospital.hospitalCategory || '').toLowerCase();
  if (userCatPref && userCatPref !== 'both' && hospitalCat) {
    if (hospitalCat.includes(userCatPref)) {
      specialtyScore = Math.min(1.0, specialtyScore + 0.1);
      tags.push(userCatPref === 'government' ? 'Public Hospital' : 'Private Facility');
    }
  }

  // --- 3. LOCATION & ACCESSIBILITY (25%) ---
  let locationScore = 0.1;
  let priorityLevel: 'Local' | 'Nearby' | 'Province' | 'National' = 'National';

  const travelPref = hc.travelPreference || 'Same City Only';
  const maxDistance = hc.maxDistance || hc.distanceTolerance || 'No Limit';
  
  if (userCity === hospitalCity) {
    if (userTehsil && hospitalTehsil === userTehsil) {
      locationScore = 1.0;
      priorityLevel = 'Local';
      tags.push("Very Close");
    } else {
      locationScore = 0.85;
      priorityLevel = 'Local';
      tags.push("Same City");
    }
    
    if (maxDistance === 'Under 5 KM') {
      locationScore = userTehsil && hospitalTehsil === userTehsil ? 1.0 : 0.6;
    }
  } else if (travelPref !== 'Same City Only' && NEARBY_CITIES[userCity]?.includes(hospitalCity)) {
    locationScore = 0.6;
    priorityLevel = 'Nearby';
    tags.push("Regional Access");
  } else if ((travelPref === 'Anywhere in Province' || travelPref === 'Nationwide') && (hc.province && hospital.province && hc.province === hospital.province)) {
    locationScore = 0.4;
    priorityLevel = 'Province';
  } else if (travelPref === 'Nationwide') {
    locationScore = 0.2;
    priorityLevel = 'National';
  } else {
    // User wants closer, but this is far
    locationScore = 0.1;
  }

  // --- 4. URGENCY & AVAILABILITY (20%) ---
  let urgencyScore = 0.5;
  const isEmergency = hc.urgencyLevel === 'Emergency' || hc.urgencyLevel === 'Urgent';
  const hospitalEmergency = hospital.emergencyServices || bestTreatment.isEmergency || (bestTreatment.severitySupport === 'Emergency') || (bestTreatment.severitySupport === 'Critical');
  
  if (isEmergency) {
    if (hospitalEmergency) {
      urgencyScore = 1.0;
      tags.push("Emergency Ready");
    } else {
      urgencyScore = 0.2; // Bad for emergencies
    }
  } else {
    if (bestTreatment.availability === 'Available' || hospital.availability === 'Available') {
      urgencyScore = 0.9;
      if (bestTreatment.waitingTime === 'Immediate') urgencyScore = 1.0;
    } else if (bestTreatment.availability === 'By Appointment' || hospital.availability === 'By Appointment') {
      urgencyScore = 0.7;
      tags.push("Appointment Available");
    } else if (bestTreatment.availability === 'Limited' || hospital.availability === 'Limited') {
      urgencyScore = 0.4;
    }
  }

  // --- 5. AFFORDABILITY & INSURANCE (15%) ---
  let costScore = 0.5;
  const cost = Number(bestTreatment.treatmentCost || hospital.treatmentCost || 0);
  const budget = Number(hc.maxBudget || hc.budgetRange || 0);
  const isGovt = hospitalCat.includes('government') || hospitalCat.includes('public') || hospital["Hospital Name"]?.toLowerCase().includes("govt");

  if (isGovt) {
    costScore = 1.0;
    tags.push("Affordable Care");
  } else if (budget > 0) {
    if (cost === 0) {
      costScore = 0.6; // Unknown but user has budget
    } else if (cost <= budget) {
      const comfort = (budget - cost) / budget;
      costScore = 0.7 + (comfort * 0.3); // 0.7 to 1.0
      tags.push("Within Budget");
    } else {
      const over = (cost - budget) / budget;
      if (over <= 0.2) {
        costScore = 0.5; // Slightly over
      } else {
        costScore = Math.max(0.1, 0.4 - over);
      }
    }
  }

  if (hc.financialAssistance === 'Yes' && isGovt) {
    costScore = Math.min(1.0, costScore + 0.2);
  }
  const hasInsurance = hc.hasInsurance === 'Yes' || hc.medicalInsurance === 'Yes';
  if (hasInsurance && !isGovt) {
    costScore = Math.min(1.0, costScore + 0.2);
    tags.push("Insurance Accepted");
  }

  // --- 6. SUPPORT FEATURES (10%) ---
  let supportScore = 1.0;
  const reqSupport = Array.isArray(hc.supportRequirements) ? hc.supportRequirements : (Array.isArray(hc.medicalSupport) ? hc.medicalSupport : []);
  const hospSupport = Array.isArray(hospital.supportFeatures) ? hospital.supportFeatures : (Array.isArray(bestTreatment.supportFeatures) ? bestTreatment.supportFeatures : []);
  const hospSupportString = hospSupport.join(' ').toLowerCase();

  let missingSupports = 0;
  if (reqSupport.length > 0) {
    reqSupport.forEach(req => {
      let found = false;
      if (req === 'icuAccess' && (hospSupportString.includes('icu') || hospitalEmergency)) found = true;
      if (req === 'emergencyWard' && (hospSupportString.includes('emergency') || hospitalEmergency)) found = true;
      if (req === 'ambulanceAccess' && hospSupportString.includes('ambulance')) found = true;
      if (req === 'femaleStaff' && (hospSupportString.includes('female') || hc.genderPreference === 'Female Staff')) found = true;
      if (req === 'wheelchairSupport' && hospSupportString.includes('wheelchair')) found = true;
      if (req === 'pharmacyAvailability' && hospSupportString.includes('pharmacy')) found = true;
      
      if (!found) missingSupports++;
    });
    supportScore = Math.max(0.2, 1.0 - (missingSupports * (0.8 / reqSupport.length)));
    if (supportScore === 1.0 && reqSupport.length > 0) {
      tags.push("Full Support Match");
    }
  }

  // --- CALCULATE FINAL SCORE ---
  const tieBreaker = getTieBreaker(hospitalId) / 100;

  // Dynamic weights based on urgency
  let wSpec = 30, wLoc = 25, wUrg = 20, wCost = 15, wSup = 10;
  if (isEmergency) {
    wUrg = 35; wLoc = 35; wSpec = 15; wCost = 5; wSup = 10;
  } else if (budget > 0) {
    wCost = 25; wSpec = 30; wLoc = 20; wUrg = 15; wSup = 10;
  }

  const weightedSum = weightedAverage([
    { score: specialtyScore, weight: wSpec },
    { score: locationScore,  weight: wLoc },
    { score: urgencyScore,   weight: wUrg },
    { score: costScore,      weight: wCost },
    { score: supportScore,   weight: wSup }
  ]);

  const percentage = Math.min(100, Math.round(weightedSum + tieBreaker));

  // --- SMART EXPLANATIONS ---
  const topReasons = [];
  
  if (isEmergency && urgencyScore >= 0.8 && locationScore >= 0.8) {
    topReasons.push(`immediate emergency services in your vicinity`);
  } else {
    if (specialtyScore >= 0.8) {
      const specName = bestTreatment.specialization || bestTreatment.treatmentName || hc.treatmentType || 'this specialty';
      topReasons.push(`${specName} treatment`);
    }
    
    if (supportScore >= 0.8 && reqSupport.length > 0) {
      const supports = [];
      if (reqSupport.includes('icuAccess')) supports.push('ICU support');
      if (reqSupport.includes('emergencyWard')) supports.push('emergency services');
      if (reqSupport.includes('femaleStaff')) supports.push('female staff');
      if (supports.length > 0) topReasons.push(`${supports.join(' and ')}`);
      else topReasons.push(`required medical support features`);
    }
    
    if (costScore >= 0.8 && !isGovt) {
      topReasons.push(`options within your preferred budget`);
    } else if (costScore >= 0.8 && isGovt) {
      topReasons.push(`highly affordable government care`);
    } else if (cost > 0 && budget > 0 && cost > budget && cost <= budget * 1.2) {
      reasons.push("Slightly above your preferred treatment budget.");
    }

    if (locationScore >= 0.85 && hc.city) {
      topReasons.push(`proximity to your location in ${hc.city}`);
    }
  }

  let smartExplanation = "";
  if (topReasons.length >= 2) {
    smartExplanation = `Matched because this hospital offers ${topReasons.slice(0, -1).join(', ')}, and ${topReasons[topReasons.length - 1]}.`;
  } else if (topReasons.length === 1) {
    smartExplanation = `Matched because this hospital offers ${topReasons[0]}.`;
  } else {
    smartExplanation = "A suitable medical facility based on your overall preferences.";
  }

  // --- SMART PRIORITY LABELS ---
  let primaryLabel = "Recommended Facility";
  if (isEmergency && urgencyScore >= 0.9 && locationScore >= 0.8) primaryLabel = "Best Emergency Match";
  else if (specialtyScore >= 0.9 && percentage >= 85) primaryLabel = "Specialized Treatment Match";
  else if (costScore >= 0.9 && percentage >= 75) primaryLabel = "Budget Friendly Care";
  else if (locationScore >= 0.95 && percentage >= 80) primaryLabel = "Nearby Medical Center";
  else if (supportScore === 1.0 && reqSupport.length > 2) primaryLabel = "Best Support Coverage";
  else if (bestTreatment.availability === 'Available' && bestTreatment.waitingTime === 'Immediate') primaryLabel = "Fastest Availability";
  
  tags.unshift(primaryLabel);
  const uniqueTags = Array.from(new Set(tags)).slice(0, 3);

  // Fallback reasons
  if (reasons.length === 0) {
    reasons.push(smartExplanation);
  }

  return {
    id: hospitalId,
    type: 'hospital',
    title: hospital["Hospital Name"],
    score: percentage,
    matchPercentage: percentage,
    relevanceLevel: getRelevanceLevel(percentage),
    reasons,
    explanation: smartExplanation,
    tags: uniqueTags,
    details: hospital,
    priorityLevel,
    diagnostics: {
      entityId: hospitalId,
      hospitalName: hospital["Hospital Name"],
      campusCity: hospitalCity,
      locationScore: Math.round(locationScore * 100),
      specialtyScore: Math.round(specialtyScore * 100),
      urgencyScore: Math.round(urgencyScore * 100),
      costScore: Math.round(costScore * 100),
      supportScore: Math.round(supportScore * 100),
      finalScore: percentage,
      priorityLevel,
      finalRankingReason: primaryLabel
    }
  };
};
