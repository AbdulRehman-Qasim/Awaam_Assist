import api from './schemeAPI';
import userApi from './userAPI';

// ── Types ────────────────────────────────────────────────────────────────────

export interface HospitalTreatment {
  _id: string;
  treatmentName: string;
  specialization: string;
  treatmentCost: number;
  costRange: { min: number; max: number };
  availability: 'Available' | 'Limited' | 'Unavailable' | 'By Appointment';
  requirements: string;
  estimatedWaitTime: string;
  doctorCount: number;
  isEmergency: boolean;
  description: string;
  supportFeatures: string[];
  waitingTime: string;
  severitySupport: 'Basic' | 'Moderate' | 'Critical' | 'Emergency';
  appointmentRequired: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface HospitalRecord {
  _id: string;
  SerialNum: number;
  // Legacy field names (DB)
  City: string;
  Tehsil: string;
  'Hospital Name': string;
  Cateogry: string;
  // Normalized aliases
  hospitalName: string;
  category: string;
  // Contact & web
  website: string;
  contactNumber: string;
  email: string;
  address: string;
  hospitalLink?: string;
  // Profile
  description: string;
  hospitalImage: string;
  emergencyServices: boolean;
  bedCapacity: number;
  // Quality
  rating: number;
  totalReviews: number;
  isVerified: boolean;
  // Legacy flat treatment
  treatmentCost: number;
  availability: string;
  info: string;
  
  description: string;
  supportFeatures: string[];
  waitingTime: string;
  severitySupport: 'Basic' | 'Moderate' | 'Critical' | 'Emergency';
  appointmentRequired: boolean;
  treatmentName: string;
  treatmentSpecialty: string;
  // Enriched
  treatments: HospitalTreatment[];
  tags: string[];
  // Recommendation
  matchScore?: number;
  reasons?: string[];
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Alias kept for backward compat with hospital admin pages */
export type HospitalAdminRecord = HospitalRecord;

export interface HospitalFilters {
  cities: string[];
  categories: string[];
  specializations: string[];
}

export interface HospitalDashboardStats {
  overview: {
    totalHospitals: number;
    totalCities: number;
    totalCategories: number;
    totalTreatments: number;
  };
  recentHospitals: HospitalRecord[];
}

export interface HospitalQueryParams {
  city?: string;
  category?: string;
  q?: string;
  availability?: string;
  maxCost?: string;
  treatmentType?: string;
}

// ── Public API ────────────────────────────────────────────────────────────────

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const hospitalPublicAPI = {
  /** Fetch all hospitals with optional filter params */
  getAll: async (params: HospitalQueryParams = {}): Promise<HospitalRecord[]> => {
    const sp = new URLSearchParams();
    if (params.city         && params.city         !== 'all') sp.append('city',          params.city);
    if (params.category     && params.category     !== 'all') sp.append('category',      params.category);
    if (params.q            && params.q.trim())               sp.append('q',             params.q.trim());
    if (params.availability && params.availability !== 'all') sp.append('availability',  params.availability);
    if (params.maxCost      && Number(params.maxCost) > 0)    sp.append('maxCost',       params.maxCost);
    if (params.treatmentType && params.treatmentType !== 'all') sp.append('treatmentType', params.treatmentType);

    const res = await fetch(`${BASE}/api/hospitals?${sp.toString()}`);
    const json = await res.json();
    return json.data ?? [];
  },

  /** Fetch dynamic filter options from the database */
  getFilters: async (): Promise<HospitalFilters> => {
    const res = await fetch(`${BASE}/api/hospitals/filters`);
    const json = await res.json();
    return json.data ?? { cities: [], categories: [], specializations: [] };
  },

  /** Book a new hospital appointment */
  bookAppointment: async (appointmentData: any) => {
    const response = await userApi.post('/api/healthcare/appointments', appointmentData);
    return response.data;
  },

  /** Get current user's appointments */
  getMyAppointments: async () => {
    const response = await userApi.get('/api/healthcare/appointments/my');
    return response.data;
  },
};

// ── Admin API (authenticated, uses axios instance) ────────────────────────────

export interface Appointment {
  _id: string;
  userId: string;
  hospitalId: string;
  hospitalName: string;
  treatmentSpecialty: string;
  fullName: string;
  cnic: string;
  email: string;
  phone: string;
  city: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: string;
  symptoms: string;
  notes?: string;
  estimatedCost: number;
  status: 'pending' | 'accepted' | 'waiting' | 'rejected' | 'completed' | 'cancelled';
  adminReason?: string;
  createdAt: string;
}

export const hospitalAdminAPI = {
  // ... (existing methods)
  getAllHospitals: async (params: Record<string, string> = {}) => {
    const response = await api.get('/hospital-admin/hospitals', { params });
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await api.get('/hospital-admin/dashboard-stats');
    return response.data;
  },

  createHospital: async (data: Partial<HospitalRecord>) => {
    const response = await api.post('/hospital-admin/hospitals', data);
    return response.data;
  },

  updateHospital: async (id: string, data: Partial<HospitalRecord>) => {
    const response = await api.put(`/hospital-admin/hospitals/${id}`, data);
    return response.data;
  },

  deleteHospital: async (id: string) => {
    const response = await api.delete(`/hospital-admin/hospitals/${id}`);
    return response.data;
  },

  // ── Treatment CRUD ─────────────────────────────────────────────────────────

  addTreatment: async (hospitalId: string, treatment: Partial<HospitalTreatment>) => {
    const response = await api.post(`/hospital-admin/hospitals/${hospitalId}/treatments`, treatment);
    return response.data;
  },

  updateTreatment: async (hospitalId: string, treatmentId: string, treatment: Partial<HospitalTreatment>) => {
    const response = await api.put(`/hospital-admin/hospitals/${hospitalId}/treatments/${treatmentId}`, treatment);
    return response.data;
  },

  deleteTreatment: async (hospitalId: string, treatmentId: string) => {
    const response = await api.delete(`/hospital-admin/hospitals/${hospitalId}/treatments/${treatmentId}`);
    return response.data;
  },

  // ── Appointment Management ──────────────────────────────────────────────────

  getHospitalAppointments: async (hospitalId: string) => {
    try {
      const response = await api.get(`/hospital-admin/appointments/${hospitalId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return { success: true, data: [], count: 0 };
      }
      throw error;
    }
  },

  updateAppointmentStatus: async (appointmentId: string, data: { status: string; adminReason?: string }) => {
    // Both original and new production-grade endpoint supported
    const response = await api.patch(`/hospital-admin/appointments/${appointmentId}/status`, data);
    return response.data;
  },

  rejectAppointment: async (appointmentId: string, reason: string) => {
    const response = await api.post('/appointment/reject', { appointmentId, reason });
    return response.data;
  },

  getAppointmentDetails: async (appointmentId: string) => {
    const response = await api.get(`/appointment/${appointmentId}`);
    return response.data;
  },
};
