
export interface UserEngagementProfile {
  savedItems: string[];
  hiddenItems: string[];
  softDislikedCategories: string[];
}

export type InteractionType = 'save' | 'hide' | 'not-interested' | 'unsave';

export class EngagementManager {
  private static STORAGE_KEY = 'awam_assist_engagement_profile';

  static getProfile(): UserEngagementProfile {
    const defaultProfile: UserEngagementProfile = {
      savedItems: [],
      hiddenItems: [],
      softDislikedCategories: []
    };

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return defaultProfile;
      
      const parsed = JSON.parse(stored);
      if (!parsed || typeof parsed !== 'object') return defaultProfile;

      return {
        savedItems: Array.isArray(parsed.savedItems) ? parsed.savedItems : [],
        hiddenItems: Array.isArray(parsed.hiddenItems) ? parsed.hiddenItems : [],
        softDislikedCategories: Array.isArray(parsed.softDislikedCategories) ? parsed.softDislikedCategories : []
      };
    } catch (e) {
      console.error("Failed to parse engagement profile", e);
      return defaultProfile;
    }
  }

  static saveProfile(profile: UserEngagementProfile) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(profile));
  }

  static recordInteraction(itemId: any, type: InteractionType, category?: string) {
    const profile = this.getProfile();
    const id = String(itemId);

    switch (type) {
      case 'save':
        if (!profile.savedItems.includes(id)) {
          profile.savedItems.push(id);
        }
        break;
      case 'unsave':
        profile.savedItems = profile.savedItems.filter(sId => sId !== id);
        break;
      case 'hide':
        if (!profile.hiddenItems.includes(id)) {
          profile.hiddenItems.push(id);
        }
        break;
      case 'not-interested':
        // Permanently hide the specific item
        if (!profile.hiddenItems.includes(id)) {
          profile.hiddenItems.push(id);
        }
        // Also apply soft dislike to the category if provided
        if (category && !profile.softDislikedCategories.includes(category)) {
          profile.softDislikedCategories.push(category);
        }
        break;
    }

    this.saveProfile(profile);
    // Dispatch custom event to notify listeners (e.g. Feed to refresh if needed, though we want stability)
    window.dispatchEvent(new CustomEvent('engagement_updated', { detail: { itemId, type, category } }));
  }

  static getEngagementInfluence(itemId: any, category: string): number {
    const profile = this.getProfile();
    const id = String(itemId);
    let influence = 0;

    // 1. Item-specific signals
    if (profile.savedItems.includes(id)) {
      influence += 15; // Strong boost for explicitly saved item
    }

    if (profile.hiddenItems.includes(id)) {
      influence -= 50; // Very strong penalty to ensure it drops out of top results
    }

    // 2. Category-level signals (Soft influence)
    // Boost if user has saved other items in this category
    const savedInThisCategory = profile.savedItems.filter(id => {
      // This is a bit tricky since we only have IDs. 
      // But in a real system we'd check the item category.
      // For now, we can use a heuristic or just rely on the fact that 
      // if they saved an item, they liked that category.
      return false; // Placeholder for more complex logic if needed
    });

    // If category itself is soft-disliked
    if (profile.softDislikedCategories.includes(category)) {
      influence -= 10; 
    }

    return influence;
  }

  static isHidden(itemId: any): boolean {
    const profile = this.getProfile();
    return profile.hiddenItems.includes(String(itemId));
  }
}
