import api from './schemeAPI';

export interface HospitalAdminRecord {
  _id: string;
  SerialNum: number;
  City: string;
  Tehsil: string;
  hospitalName: string;
  category: string;
  treatmentCost?: number;
  availability?: string;
  info?: string;
  website?: string;
  status?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface HospitalDashboardStats {
  overview: {
    totalHospitals: number;
    totalCities: number;
    totalCategories: number;
  };
  recentHospitals: HospitalAdminRecord[];
}

export const hospitalAdminAPI = {
  getAllHospitals: async (params: Record<string, string> = {}) => {
    const response = await api.get('/hospital-admin/hospitals', { params });
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await api.get('/hospital-admin/dashboard-stats');
    return response.data;
  },

  createHospital: async (hospitalData: Partial<HospitalAdminRecord>) => {
    const response = await api.post('/hospital-admin/hospitals', hospitalData);
    return response.data;
  },

  updateHospital: async (id: string, hospitalData: Partial<HospitalAdminRecord>) => {
    const response = await api.put(`/hospital-admin/hospitals/${id}`, hospitalData);
    return response.data;
  },

  deleteHospital: async (id: string) => {
    const response = await api.delete(`/hospital-admin/hospitals/${id}`);
    return response.data;
  },
};
