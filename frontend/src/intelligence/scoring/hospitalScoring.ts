import { UserProfileContext, RecommendationResult } from "../types";
import { weightedAverage, getRelevanceLevel, NEARBY_CITIES, getTieBreaker } from "../utils/scoringUtils";

export const calculateHospitalScore = (
  hospital: any,
  user: UserProfileContext
): RecommendationResult => {
  const reasons: string[] = [];
  const tags: string[] = [];
  const userCity = (user.healthcare?.city || user.location?.city || '').toLowerCase();
  const hospitalCity = (hospital.City || '').toLowerCase();
  
  // UNIQUE ENTITY KEY: Hospital Name + City
  const entityId = `${hospital["Hospital Name"]}_${hospitalCity}`.toUpperCase().replace(/\s+/g, '_');
  const hospitalId = String(hospital._id || entityId);
  
  // 1. LOCATION RELEVANCE & PROXIMITY (50%) - CRITICAL FOR HEALTHCARE
  let locationScore = 0.15; 
  let locationLabel = "General Recommendation";
  let priorityLevel: 'Local' | 'Nearby' | 'Province' | 'National' = 'National';

  if (userCity && hospitalCity === userCity) {
    locationScore = 1.0;
    locationLabel = "Local Facility";
    priorityLevel = 'Local';
    reasons.push(`Directly available in ${hospital.City}`);
    tags.push("Instant Access");
  } else if (userCity && NEARBY_CITIES[userCity]?.includes(hospitalCity)) {
    locationScore = 0.75;
    locationLabel = "Regional Facility";
    priorityLevel = 'Nearby';
    reasons.push(`Accessible regional facility in ${hospital.City}`);
    tags.push("Short Travel");
  }

  // 2. SPECIALTY & SERVICE (30%)
  let specialtyScore = 0.45;
  if (user.healthcare?.hospitalCategory && hospital.Cateogry) {
    const userPref = user.healthcare.hospitalCategory.toLowerCase();
    const itemCat = hospital.Cateogry.toLowerCase();
    if (itemCat.includes(userPref)) {
      specialtyScore = 1.0;
      reasons.push(`Matches your specialty need: ${hospital.Cateogry}`);
      tags.push("Specialized");
    } else if (userPref.includes('general') || itemCat.includes('general')) {
      specialtyScore = 0.65;
    }
  }

  // 3. EMERGENCY & AVAILABILITY (15%)
  const emergencyScore = hospital.availability === 'Available' ? 1.0 : 0.35;
  if (hospital.availability === 'Available') {
    tags.push("24/7 Support");
    reasons.push("Round-the-clock emergency services");
  }

  // 4. COST & PUBLIC SECTOR (5%)
  let costScore = 0.55;
  if (hospital["Hospital Name"]?.toLowerCase().includes("govt")) {
    costScore = 1.0;
    tags.push("Affordable");
  }

  // TIE-BREAKER
  const tieBreaker = getTieBreaker(hospitalId) / 100;

  const weightedSum = weightedAverage([
    { score: locationScore, weight: 50 },
    { score: specialtyScore, weight: 30 },
    { score: emergencyScore, weight: 15 },
    { score: costScore, weight: 5 }
  ]);

  const percentage = Math.round(weightedSum + tieBreaker);

  return {
    id: hospitalId,
    type: 'hospital',
    title: hospital["Hospital Name"],
    score: percentage,
    matchPercentage: percentage,
    relevanceLevel: getRelevanceLevel(percentage),
    reasons: reasons.slice(0, 3),
    tags: [locationLabel, ...tags].slice(0, 3),
    details: hospital,
    priorityLevel,
    diagnostics: {
      entityId: hospitalId,
      hospitalName: hospital["Hospital Name"],
      campusCity: hospital.City,
      locationScore: Math.round(locationScore * 100),
      specialtyScore: Math.round(specialtyScore * 100),
      finalScore: percentage,
      priorityLevel,
      finalRankingReason: priorityLevel === 'Local' ? "Prioritized for immediate proximity" : "Selected based on specialty availability"
    }
  };
};
