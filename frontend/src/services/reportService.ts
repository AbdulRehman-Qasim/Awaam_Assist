const API_URL = import.meta.env.VITE_API_URL || 'https://awaam-assist.onrender.com';

export interface ReportRecord {
  _id: string;
  userId: string;
  module: 'healthcare' | 'education' | 'schemes';
  reportUrl: string;
  generatedAt: string;
  reportSnapshot: {
    userProfile: any;
    recommendations: any[];
    insights: string;
  };
}

const getHeaders = () => {
  const userStr = localStorage.getItem("user");
  const token = userStr ? JSON.parse(userStr).token : null;
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const reportService = {
  generateReport: async (module: 'healthcare' | 'education' | 'schemes', recommendations?: any[], insights?: string) => {
    const response = await fetch(`${API_URL}/api/reports/generate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ module, recommendations, insights })
    });
    const data = await response.json();
    return data as { success: boolean; data: ReportRecord };
  },

  getReportHistory: async () => {
    const response = await fetch(`${API_URL}/api/reports/history`, {
      method: 'GET',
      headers: getHeaders()
    });
    const data = await response.json();
    return data as { success: boolean; data: ReportRecord[] };
  },

  downloadReport: (url: string) => {
    // Construct full URL if it's relative
    const baseUrl = import.meta.env.VITE_API_URL || 'https://awaam-assist.onrender.com';
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

    // Open in new tab or trigger download
    window.open(fullUrl, '_blank');
  }
};
