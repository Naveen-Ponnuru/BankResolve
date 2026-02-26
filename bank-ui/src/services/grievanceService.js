/**
 * grievanceService — Enterprise Grievance Service
 *
 * All endpoints match Spring Boot /api/grievances/* contract.
 */
import apiClient from "../api/apiClient";

const grievanceService = {
    createGrievance: async (data, files) => {
        const formData = new FormData();
        formData.append("data", JSON.stringify(data));
        if (files && files.length > 0) {
            Array.from(files).forEach((file) => {
                formData.append("files", file);
            });
        }

        const response = await apiClient.post("/grievances", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },

    getCustomerGrievances: async (params = {}) => {
        const response = await apiClient.get("/grievances/customer", { params });
        return response.data;
    },

    getGrievanceById: async (id) => {
        const response = await apiClient.get(`/grievances/${id}`);
        return response.data;
    },

    // Staff & Manager Actions
    getAssignedGrievances: async (params = {}) => {
        const response = await apiClient.get("/grievances/assigned", { params });
        return response.data;
    },

    getEscalatedGrievances: async (params = {}) => {
        const response = await apiClient.get("/grievances/escalated", { params });
        return response.data;
    },

    updateStatus: async (id, status, notes) => {
        const response = await apiClient.patch(`/grievances/${id}/status`, { status, notes });
        return response.data;
    },

    reassignGrievance: async (id, staffId) => {
        const response = await apiClient.patch(`/grievances/${id}/assign`, { staffId });
        return response.data;
    },

    submitFeedback: async (id, rating, comment) => {
        const response = await apiClient.post(`/grievances/${id}/feedback`, { rating, comment });
        return response.data;
    },

    /**
     * GET /grievances/stats — Dashboard KPI summary
     * Returns: { total, open, inProgress, resolved, slaBreachCount }
     */
    getDashboardStats: async (bankId) => {
        const params = bankId ? { bankId } : {};
        const response = await apiClient.get("/grievances/stats", { params });
        return response.data;
    },

    /**
     * GET /grievances/analytics — Trend data for manager charts
     * Returns: [{ month, total, resolved, escalated }]
     */
    getAnalytics: async (bankId, period = "6months") => {
        const params = { period, ...(bankId ? { bankId } : {}) };
        const response = await apiClient.get("/grievances/analytics", { params });
        return response.data;
    },

    /**
     * GET /grievances/all — Admin: all grievances across bank
     */
    getAll: async (params = {}) => {
        const response = await apiClient.get("/grievances/all", { params });
        return response.data;
    },
};

export default grievanceService;
