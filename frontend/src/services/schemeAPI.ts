import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Scheme API Service
export const schemeAPI = {
    // Get all schemes with optional filters
    getAllSchemes: async (params = {}) => {
        try {
            const response = await api.get('/api/schemes', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching schemes:', error);
            throw error;
        }
    },

    // Get scheme by ID
    getSchemeById: async (id) => {
        try {
            const response = await api.get(`/api/schemes/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching scheme:', error);
            throw error;
        }
    },

    // Get scheme by custom scheme ID
    getSchemeBySchemeId: async (schemeId) => {
        try {
            const response = await api.get(`/api/schemes/scheme/${schemeId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching scheme:', error);
            throw error;
        }
    },

    // Get scheme statistics
    getSchemeStats: async () => {
        try {
            const response = await api.get('/api/schemes/stats');
            return response.data;
        } catch (error) {
            console.error('Error fetching scheme stats:', error);
            throw error;
        }
    },

    // Get unique categories
    getCategories: async () => {
        try {
            const response = await api.get('/api/schemes/categories');
            return response.data;
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }
    },

    // Get unique provinces
    getProvinces: async () => {
        try {
            const response = await api.get('/api/schemes/provinces');
            return response.data;
        } catch (error) {
            console.error('Error fetching provinces:', error);
            throw error;
        }
    },

    // Get schemes by category
    getSchemesByCategory: async (category) => {
        try {
            const response = await api.get(`/api/schemes/category/${category}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching schemes by category:', error);
            throw error;
        }
    },

    // Get schemes by province
    getSchemesByProvince: async (province) => {
        try {
            const response = await api.get(`/api/schemes/province/${province}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching schemes by province:', error);
            throw error;
        }
    },

    // Check eligibility for all schemes (batch)
    checkEligibilityBatch: async (userProfile) => {
        try {
            const response = await api.post('/api/schemes/check-eligibility', userProfile);
            return response.data;
        } catch (error) {
            console.error('Error checking eligibility:', error);
            throw error;
        }
    },

    // Check eligibility for a specific scheme
    checkEligibility: async (schemeId, userProfile) => {
        try {
            const response = await api.post(`/api/schemes/${schemeId}/check-eligibility`, userProfile);
            return response.data;
        } catch (error) {
            console.error('Error checking eligibility:', error);
            throw error;
        }
    },
};

// Admin Scheme API Service
export const schemeAdminAPI = {
    // Get all schemes for admin (including inactive)
    getAllSchemes: async (params = {}) => {
        try {
            const response = await api.get('/admin/schemes', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching admin schemes:', error);
            throw error;
        }
    },

    // Get admin dashboard statistics
    getDashboardStats: async () => {
        try {
            const response = await api.get('/admin/schemes/dashboard-stats');
            return response.data;
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw error;
        }
    },

    // Create new scheme
    createScheme: async (schemeData) => {
        try {
            const response = await api.post('/admin/schemes', schemeData);
            return response.data;
        } catch (error) {
            console.error('Error creating scheme:', error);
            throw error;
        }
    },

    // Update scheme
    updateScheme: async (id, schemeData) => {
        try {
            const response = await api.put(`/admin/schemes/${id}`, schemeData);
            return response.data;
        } catch (error) {
            console.error('Error updating scheme:', error);
            throw error;
        }
    },

    // Delete scheme
    deleteScheme: async (id) => {
        try {
            const response = await api.delete(`/admin/schemes/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting scheme:', error);
            throw error;
        }
    },

    // Update scheme status
    updateSchemeStatus: async (id, status) => {
        try {
            const response = await api.put(`/admin/schemes/${id}/status`, { status });
            return response.data;
        } catch (error) {
            console.error('Error updating scheme status:', error);
            throw error;
        }
    },

    // Update scheme statistics
    updateSchemeStats: async (id, stats) => {
        try {
            const response = await api.put(`/admin/schemes/${id}/stats`, stats);
            return response.data;
        } catch (error) {
            console.error('Error updating scheme stats:', error);
            throw error;
        }
    },

    // Bulk import schemes
    bulkImportSchemes: async (schemes) => {
        try {
            const response = await api.post('/admin/schemes/bulk-import', { schemes });
            return response.data;
        } catch (error) {
            console.error('Error bulk importing schemes:', error);
            throw error;
        }
    },
};

export default api;
