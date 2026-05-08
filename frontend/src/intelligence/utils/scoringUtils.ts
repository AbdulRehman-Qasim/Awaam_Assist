/**
 * Normalizes a value based on a maximum range.
 */
export const normalize = (value: number, max: number): number => {
  return Math.min(Math.max(value / max, 0), 1);
};

/**
 * Calculates a weighted average based on scores and their respective weights.
 */
export const weightedAverage = (scores: { score: number; weight: number }[]): number => {
  const totalWeight = scores.reduce((acc, s) => acc + s.weight, 0);
  if (totalWeight === 0) return 0;
  
  const weightedSum = scores.reduce((acc, s) => acc + (s.score * s.weight), 0);
  return (weightedSum / totalWeight) * 100;
};

/**
 * Simple location matcher that returns a score based on proximity level.
 */
export const matchLocation = (
  entityLoc: { city?: string; province?: string; tehsil?: string },
  userLoc: { city?: string; province?: string; tehsil?: string }
): number => {
  if (!entityLoc || !userLoc) return 0.2; // Baseline score
  
  // Exact city match
  if (entityLoc.city && userLoc.city && entityLoc.city.toLowerCase() === userLoc.city.toLowerCase()) {
    return 1.0;
  }
  
  // Tehsil match (higher than province)
  if (entityLoc.tehsil && userLoc.tehsil && entityLoc.tehsil.toLowerCase() === userLoc.tehsil.toLowerCase()) {
    return 0.8;
  }
  
  // Province match
  if (entityLoc.province && userLoc.province && entityLoc.province.toLowerCase() === userLoc.province.toLowerCase()) {
    return 0.6;
  }
  
  return 0.3; // Nearby or same country
};

/**
 * Geographic Proximity Map for intelligently weighting nearby cities.
 */
export const NEARBY_CITIES: { [key: string]: string[] } = {
  'lahore': ['sheikhupura', 'kasur', 'gujranwala', 'faisalabad', 'okara'],
  'islamabad': ['rawalpindi', 'taxila', 'wah cantt', 'chakwal', 'attock'],
  'rawalpindi': ['islamabad', 'taxila', 'wah cantt', 'chakwal', 'attock'],
  'karachi': ['hyderabad', 'jamshoro', 'thatta'],
  'peshawar': ['mardan', 'charsadda', 'nowshera', 'swabi'],
  'multan': ['khanewal', 'lodhran', 'muzaffargarh'],
  'faisalabad': ['lahore', 'jhang', 'toba tek singh', 'chiniot']
};

/**
 * Maps a numerical score to a relevance level.
 */
export const getRelevanceLevel = (score: number): 'High' | 'Medium' | 'Low' => {
  if (score >= 80) return 'High';
  if (score >= 50) return 'Medium';
  return 'Low';
};

/**
 * Generates a deterministic tie-breaker score based on a string ID.
 * Returns a float between 0.01 and 0.99.
 */
export const getTieBreaker = (id: string): number => {
  if (!id) return 0.5;
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash |= 0;
  }
  // We use 0.01 to 0.99 range to avoid rounding to 0 or 1 easily
  return 0.01 + ((Math.abs(hash) % 98) / 100);
};
