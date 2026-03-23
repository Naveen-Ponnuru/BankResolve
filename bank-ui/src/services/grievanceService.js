/**
 * grievanceService — Enterprise Grievance Service
 *
 * All endpoints match Spring Boot /api/grievances/* contract.
 */
import apiClient from "../api/apiClient";

const grievanceService = {
    /**
     * POST /api/grievances - File a new grievance
     */
    createGrievance: async (data) => {
        // Requirements check: If we support files, use FormData, but our current backend 
        // GrievanceRequestDto is a simple JSON. I'll adjust to JSON for now 
        // to match the specific 'fileGrievance' signature I recently implemented.
        const response = await apiClient.post("/grievances", data);
        return response.data;
    },

    /**
     * GET /api/grievances - Unified listing (role-adapted)
     */
    getGrievances: async (params = {}) => {
        try {
            const response = await apiClient.get("/grievances", { params });
            return response.data;
        } catch (error) {
            console.error("API ERROR (getGrievances):", error.response || error.message);
            throw error;
        }
    },

    /**
     * GET /api/grievances/:id - Get single grievance by ID
     */
    getGrievanceById: async (id) => {
        try {
            const response = await apiClient.get(`/grievances/${id}`);
            return response.data;
        } catch (error) {
            console.error("API ERROR (getGrievanceById):", error.response || error.message);
            throw error;
        }
    },

    /**
     * GET /api/grievances/dashboard-summary - Role-scoped KPI counts
     */
    getDashboardSummary: async () => {
        try {
            const response = await apiClient.get("/grievances/dashboard-summary");
            return response.data;
        } catch (error) {
            console.error("API ERROR (getDashboardSummary):", error.response || error.message);
            throw error;
        }
    },

    /**
     * GET /api/grievances/monthly-trend - Chart data
     */
    getMonthlyTrend: async () => {
        try {
            const response = await apiClient.get("/grievances/monthly-trend");
            return response.data;
        } catch (error) {
            console.error("API ERROR (getMonthlyTrend):", error.response || error.message);
            throw error;
        }
    },

    /**
     * GET /api/grievances/feedback - Recent customer feedback
     */
    getRecentFeedback: async () => {
        try {
            const response = await apiClient.get("/grievances/feedback");
            return response.data;
        } catch (error) {
            console.error("API ERROR (getRecentFeedback):", error.response || error.message);
            throw error;
        }
    },

    /**
     * PUT /api/grievances/{id}/forward - Escalation to manager
     */
    forwardGrievance: async (id) => {
        const response = await apiClient.put(`/grievances/${id}/forward`);
        return response.data;
    },

    /**
     * PUT /api/grievances/{id}/resolve - Resolution (guarded by priority and role)
     */
    resolveGrievance: async (id) => {
        const response = await apiClient.put(`/grievances/${id}/resolve`);
        return response.data;
    },

    /**
     * PUT /api/grievances/{id}/status - Update status (Enterprise Workflow)
     */
    updateStatus: async (id, status) => {
        const response = await apiClient.put(`/grievances/${id}/status`, { status });
        return response.data;
    },

    /**
     * GET /api/grievances/customer - Specific for Phase 2
     */
    getCustomerGrievances: async () => {
        const response = await apiClient.get("/grievances/customer");
        return response.data;
    },

    /**
     * GET /api/grievances/{id}/history - Timeline data
     */
    getGrievanceHistory: async (id) => {
        const response = await apiClient.get(`/grievances/${id}/history`);
        return response.data;
    },

    /**
     * POST /api/grievances/{id}/withdraw - Withdraw a grievance
     */
    withdrawGrievance: async (id) => {
        const response = await apiClient.post(`/grievances/${id}/withdraw`);
        return response.data;
    },

    /**
     * POST /api/grievances/{id}/feedback - Submit feedback
     */
    submitFeedback: async (id, feedback) => {
        const response = await apiClient.post(`/grievances/${id}/feedback`, feedback);
        return response.data;
    },
};

export default grievanceService;
