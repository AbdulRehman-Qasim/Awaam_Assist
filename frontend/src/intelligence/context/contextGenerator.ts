import { UserProfileContext, RecommendationResult } from "../types";
import { NEARBY_CITIES } from "../utils/scoringUtils";

export interface AIInsight {
  type: 'academic' | 'financial' | 'location' | 'profile';
  message: string;
  action?: { label: string; link: string };
  title?: string;
  description?: string;
  priority?: 'high' | 'medium';
}

export class ContextGenerator {
  /**
   * Generates a conversational summary of the user's profile status.
   */
  static generateProfileNarrative(user: UserProfileContext): string {
    const city = user.location?.city;
    const field = user.education?.discipline;
    
    if (city && field) {
      return `We found matches for you in ${city} for ${field}. Your profile is ready for better recommendations.`;
    }
    if (city) {
      return `We found relevant opportunities near ${city}. Complete your educational details for higher precision.`;
    }
    if (field) {
      return `We found matches for ${field} across multiple regions. Set your city to find local options.`;
    }
    
    return "Our AI is analyzing available datasets. Complete your profile to unlock personalized matches.";
  }

  /**
   * Generates smart insights based on results and user intent.
   * ENSURES NO CROSS-DOMAIN LEAKAGE.
   */
  static generateInsights(
    user: UserProfileContext, 
    results: { universities: number; schemes: number; hospitals: number }
  ): AIInsight[] {
    const insights: AIInsight[] = [];
    const activeModules = user.interests || [];
    const city = user.location?.city || "your area";

    // 1. Academic Insights (Education Intent Only)
    if (activeModules.includes('education') && results.universities > 0) {
      insights.push({
        type: 'academic',
        title: 'Education Opportunities',
        message: `We found ${results.universities} universities that align with your academic marks and ${city} residence.`,
        description: `Your profile matches the requirements of ${results.universities} institutions in the region.`,
        priority: 'high'
      });
    }

    // 2. Financial Insights (Financial Intent Only)
    if (activeModules.includes('schemes') && results.schemes > 0) {
      insights.push({
        type: 'financial',
        message: `You appear eligible for ${results.schemes} student support programs based on your income profile.`,
        priority: 'medium'
      });
    }

    // 3. Healthcare Insights (Health Intent Only)
    if (activeModules.includes('healthcare') && results.hospitals > 0) {
      insights.push({
        type: 'location',
        message: `There are ${results.hospitals} recommended medical facilities with specialized support near ${city}.`,
        priority: 'medium'
      });
    }

    // 4. Intent-Aware Location Summary
    if (user.location?.city && insights.length > 0) {
      const activeTargets = [];
      if (activeModules.includes('education')) activeTargets.push('academic options');
      if (activeModules.includes('healthcare')) activeTargets.push('healthcare centers');
      
      if (activeTargets.length > 0) {
        insights.push({
          type: 'location',
          title: 'Local Focus',
          message: `Prioritizing ${activeTargets.join(' and ')} within reach of ${user.location.city}.`,
          description: `Search results are currently focused on institutions and facilities near ${user.location.city}.`,
          priority: 'medium'
        });
      }
    }

    return insights;
  }

  /**
   * Helper to get a semi-random but deterministic variation of a string.
   * Supports an optional offset to cycle through variations.
   */
  private static getVariation(options: string[], id: string, offset: number = 0): string {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = ((hash << 5) - hash) + id.charCodeAt(i);
      hash |= 0; 
    }
    const index = (Math.abs(hash) + offset) % options.length;
    return options[index];
  }

  /**
   * Generates a unique contextual explanation for a specific recommendation.
   * @param offset Used to cycle through variations if the primary one is a duplicate.
   */
  static generateExplanation(
    type: 'university' | 'scheme' | 'hospital', 
    rec: RecommendationResult, 
    user: UserProfileContext,
    offset: number = 0
  ): string {
    const userCity = (user.location?.city || user.education?.city || '').toLowerCase();
    const itemCity = (rec.details.City || rec.details.city || rec.details.location || '').toLowerCase();
    const isSameCity = userCity && itemCity === userCity;
    const isNearby = userCity && NEARBY_CITIES[userCity]?.includes(itemCity);
    const userField = (user.education?.discipline || '').toLowerCase();
    const itemField = (rec.details?.discipline || rec.details?.Category || rec.details?.Cateogry || '').toLowerCase();
    
    const id = String(rec.id || rec.title);

    if (type === 'university') {
      if (isSameCity) {
        return this.getVariation([
          `Top recommended choice located right here in ${itemCity}.`,
          `Conveniently located institution matching your academic profile.`,
          `Excellent ${itemField || 'academic'} facilities near your residence.`,
          `A prominent local choice for ${userField || 'higher education'} in ${itemCity}.`,
          `Ideally situated for students in ${itemCity} with your marks.`,
          `A highly-rated local option for your ${userField || 'future'} studies.`
        ], id, offset);
      }

      if (itemField && userField && (itemField.includes(userField) || userField.includes(itemField))) {
        return this.getVariation([
          `Focuses on ${rec.details.discipline}, perfectly aligning with your interests.`,
          `Renowned for its ${rec.details.discipline} programs and research.`,
          `Provides specialized tracks that fit your career goals in ${rec.details.discipline}.`,
          `Strong academic alignment with your background in ${rec.details.discipline}.`,
          `Offers advanced learning opportunities in your field of interest.`
        ], id, offset);
      }

      if (isNearby) {
        return this.getVariation([
          `A quality option in nearby ${itemCity} with regional access.`,
          `Easily accessible from your city, located in ${itemCity}.`,
          `Regional leader in ${itemField || 'education'} located in ${itemCity}.`,
          `A short commute away in ${itemCity} with great career prospects.`,
          `Matches your marks and is situated in the ${itemCity} region.`
        ], id, offset);
      }

      return this.getVariation([
        `Matches your education level with promising career outcomes.`,
        `Nationally recognized institution fitting your academic profile.`,
        `Solid learning environment with specialized ${itemField || 'study'} options.`,
        `Strongly recommended based on your marks and career direction.`,
        `A high-potential match for your future academic growth.`
      ], id, offset);
    }

    if (type === 'scheme') {
      if (user.location?.province && rec.details.Province?.toLowerCase() === user.location.province.toLowerCase()) {
        return this.getVariation([
          `A dedicated support program for residents of ${user.location.province}.`,
          `Active provincial grant tailored for students in ${user.location.province}.`,
          `Local government assistance based on your ${user.location.province} residency.`,
          `Regional financial support initiative for ${user.location.province} citizens.`
        ], id, offset);
      }
      return this.getVariation([
        `Meets all core eligibility criteria for this support program.`,
        `Financial aid designed to assist with your educational expenses.`,
        `Government-backed initiative matching your academic profile.`,
        `A great opportunity based on your verified eligibility status.`,
        `Assistance program aimed at reducing your tuition burden.`,
        `Official support scheme tailored for students with your profile.`
      ], id, offset);
    }

    if (type === 'hospital') {
      const cityName = rec.details.City || rec.details.city || user.location?.city || "your city";
      if (isSameCity) {
        return this.getVariation([
          `Convenient medical access located directly in ${cityName}.`,
          `Highly accessible facility with specialized care in your city.`,
          `A reliable choice for healthcare services near your location.`,
          `Top-rated center for specialized medical support in ${cityName}.`
        ], id, offset);
      }
      if (rec.tags.includes('24/7 Support')) {
        return this.getVariation([
          `Reliable emergency services available round-the-clock.`,
          `Equipped for trauma care and urgent medical assistance.`,
          `A dependable facility for emergency support in the region.`,
          `Ready for critical care with 24/7 medical supervision.`
        ], id, offset);
      }
      return this.getVariation([
        `Specialized facility matching your healthcare requirements.`,
        `Quality medical care with specialized trauma and general units.`,
        `Public sector facility recommended for your specific needs.`,
        `Medical center offering comprehensive healthcare in the region.`
      ], id, offset);
    }

    return `A personalized match based on your current profile and location.`;
  }
}
