export interface Diagnostics {
  renderCount: number;
  rankingDuration: number;
  universitiesProcessed: number;
  schemesProcessed: number;
  hospitalsProcessed: number;
  filteredOutCounts: {
    universities: number;
    schemes: number;
    hospitals: number;
  };
  scoringBreakdown: {
    [key: string]: any;
  };
  profileCompleteness: number;
  recommendationCoverage: number;
  lowConfidenceDrops: number;
}

export interface UserProfileContext {
  name: string;
  location?: {
    city?: string;
    province?: string;
    tehsil?: string;
  };
  education?: {
    degree?: string;
    discipline?: string;
    marks?: number;
    city?: string;
    feeRange?: string;
  };
  schemes?: {
    income?: number;
    age?: number;
    employmentStatus?: string;
    province?: string;
    educationLevel?: string;
    category?: string;
  };
  healthcare?: {
    city?: string;
    tehsil?: string;
    hospitalCategory?: string;
  };
  interests: string[];
}

export interface RecommendationResult {
  id: string;
  type: 'university' | 'scheme' | 'hospital';
  title: string;
  score: number;
  matchPercentage: number;
  relevanceLevel: 'High' | 'Medium' | 'Low';
  reasons: string[];
  explanation?: string;
  tags: string[];
  details: any; // Original entity data
  priorityLevel?: 'Local' | 'Nearby' | 'Province' | 'National';
  diagnostics?: {
    locationScore: number;
    meritScore?: number;
    fieldScore?: number;
    educationScore?: number;
    distancePenalty?: number;
    eligibilityScore?: number;
    priorityLevel: string;
    finalRankingReason: string;
  };
}

export interface RecommendationEngineOutput {
  universities: RecommendationResult[];
  schemes: RecommendationResult[];
  hospitals: RecommendationResult[];
  overallConfidence: number;
  profileNarrative: string;
  insights: any[];
  diagnostics: Diagnostics;
}

export interface ScoringWeights {
  [key: string]: number;
}
