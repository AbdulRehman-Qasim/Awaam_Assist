import api from './schemeAPI';

export type SuperAdminManagedType = 'universities' | 'schemes' | 'hospitals' | 'admins';

export type SuperAdminAdminRecord = {
    _id: string;
    admin_name: string;
    admin_email: string;
    role: string;
    isApproved?: boolean;
    status?: 'active' | 'suspended';
    createdAt?: string;
    updatedAt?: string;
};

export type SuperAdminPendingRecord = {
    id: string;
    name: string;
    location: string;
    submittedAt?: string;
    status?: string;
    raw: Record<string, unknown>;
};

export type SuperAdminDashboardSummary = {
    totals: {
        admins: number;
        universities: number;
        schemes: number;
        hospitals: number;
    };
    pending: {
        admins: number;
        universities: number;
        schemes: number;
        hospitals: number;
    };
    suspendedAdmins: number;
};

export const superAdminAPI = {
    getAdmins: async () => {
        const response = await api.get('/superadmin/admins');
        return response.data as { success: boolean; count: number; data: SuperAdminAdminRecord[] };
    },

    getPendingAdmins: async () => {
        const response = await api.get('/superadmin/admins/pending');
        return response.data as { success: boolean; count: number; data: SuperAdminAdminRecord[] };
    },

    approveAdmin: async (id: string) => {
        const response = await api.put(`/superadmin/admins/${id}/approve`);
        return response.data as { success: boolean; message: string };
    },

    rejectAdmin: async (id: string) => {
        const response = await api.delete(`/superadmin/admins/${id}/reject`);
        return response.data as { success: boolean; message: string };
    },

    suspendAdmin: async (id: string) => {
        const response = await api.put(`/superadmin/admins/${id}/suspend`);
        return response.data as { success: boolean; message: string };
    },

    getPendingData: async (type: SuperAdminManagedType) => {
        const response = await api.get(`/superadmin/pending/${type}`);
        return response.data as { success: boolean; count: number; data: SuperAdminPendingRecord[] };
    },

    approveData: async (type: SuperAdminManagedType, id: string) => {
        const response = await api.put(`/superadmin/${type}/${id}/approve`);
        return response.data as { success: boolean; message: string };
    },

    rejectData: async (type: SuperAdminManagedType, id: string) => {
        const response = await api.put(`/superadmin/${type}/${id}/reject`);
        return response.data as { success: boolean; message: string };
    },

    getDashboardStats: async () => {
        const response = await api.get('/superadmin/dashboard');
        return response.data as { success: boolean; data: SuperAdminDashboardSummary };
    },
    
    getAllDataRecords: async () => {
        const response = await api.get('/superadmin/all-data');
        return response.data as { 
            success: boolean; 
            data: { 
                universities: any[]; 
                schemes: any[]; 
                hospitals: any[]; 
            } 
        };
    },

    getAnalyticsStats: async () => {
        const response = await api.get('/superadmin/analytics');
        return response.data as {
            success: boolean;
            data: {
                metrics: {
                    growth: string;
                    engagement: string;
                    efficiency: string;
                };
                volumeProgression: Array<{ label: string; value: number }>;
                usageStats: Array<{ label: string; value: string; detail: string }>;
            }
        };
    },
};

export default superAdminAPI;