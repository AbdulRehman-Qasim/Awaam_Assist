import { toast } from "sonner";

export interface FeedbackData {
  moduleName?: 'education' | 'schemes' | 'healthcare' | 'platform';
  rating?: number;
  comment?: string;
  recommendationId?: string;
  moduleType?: 'education' | 'schemes' | 'healthcare' | 'platform';
  reaction?: 'helpful' | 'not_relevant';
  metadata?: any;
  message?: string;
  category?: string;
  itemId?: string;
}

const API_URL = import.meta.env.VITE_API_URL || '';

const getHeaders = () => {
  const userStr = localStorage.getItem("user");
  const token = userStr ? JSON.parse(userStr).token : null;
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

const getAdminHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const FeedbackService = {
  async submitModuleRating(data: { moduleName: string; rating: number; comment?: string; itemId?: string }) {
    try {
      const response = await fetch(`${API_URL}/api/feedback/module`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      if (!result.success) throw new Error(result.message);
      return result;          // returns { data, isUpdate }
    } catch (error: any) {
      console.error("Feedback Error:", error);
      toast.error("Failed to submit rating");
      throw error;
    }
  },

  /**
   * Returns a map of { [module]: { rating, comment, submittedAt } }
   * for all modules the current user has already rated.
   */
  async getMyRatings(): Promise<Record<string, { rating: number; comment: string; submittedAt: string }>> {
    try {
      const response = await fetch(`${API_URL}/api/feedback/my-ratings`, {
        headers: getHeaders(),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.message);
      return result.data;
    } catch (error: any) {
      console.error("getMyRatings error:", error);
      return {};   // fail silently — show form as if no previous rating
    }
  },

  async submitRecommendationFeedback(data: FeedbackData) {
    try {
      const response = await fetch(`${API_URL}/api/feedback/recommendation`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      if (!result.success) throw new Error(result.message);
      return result.data;
    } catch (error: any) {
      console.error("Feedback Error:", error);
      throw error;
    }
  },

  async submitPlatformFeedback(message: string) {
    try {
      const response = await fetch(`${API_URL}/api/feedback/platform`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ message })
      });
      
      const result = await response.json();
      if (!result.success) throw new Error(result.message);
      return result.data;
    } catch (error: any) {
      console.error("Feedback Error:", error);
      toast.error("Failed to send message");
      throw error;
    }
  },

  async getFeedbackAnalytics() {
    try {
      const response = await fetch(`${API_URL}/api/feedback/analytics`, {
        headers: getAdminHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Feedback analytics error:', error);
      throw error;
    }
  },

  async getAllFeedback(params: any = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const response = await fetch(`${API_URL}/api/feedback/all?${query}`, {
        headers: getAdminHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Fetch all feedback error:', error);
      throw error;
    }
  }
};
