/**
 * bankService — Enterprise Bank Service
 *
 * Handles all bank-related API calls.
 * Ready for Spring Boot integration via centralized apiClient.
 */
import apiClient from "../api/apiClient";

const bankService = {
    /**
     * Fetch all available banks
     * GET /banks
     */
    getBanks: async () => {
        const response = await apiClient.get("/banks");
        return response.data;
    },

    /**
     * Fetch a specific bank by ID
     * GET /banks/:id
     */
    getBankById: async (id) => {
        const response = await apiClient.get(`/banks/${id}`);
        return response.data;
    },

    /**
     * Fetch dashboard statistics for a specific bank
     * GET /banks/:id/stats
     */
    getBankStats: async (id) => {
        const response = await apiClient.get(`/banks/${id}/stats`);
        return response.data;
    },

    /**
     * Update bank configuration (Admin only)
     * PUT /banks/:id/config
     */
    updateBankConfig: async (id, config) => {
        const response = await apiClient.put(`/banks/${id}/config`, config);
        return response.data;
    },

    /**
     * Create a new bank entry (Admin only)
     * POST /banks
     */
    createBank: async (bankData) => {
        const response = await apiClient.post("/banks", bankData);
        return response.data;
    },

    /**
     * Deactivate a bank (soft delete, Admin only)
     * PATCH /banks/:id/status
     */
    setBankStatus: async (id, status) => {
        const response = await apiClient.patch(`/banks/${id}/status`, { status });
        return response.data;
    },

    /**
     * Get multi-bank overview for admin dashboard
     * GET /banks/overview
     */
    getMultiBankOverview: async () => {
        const response = await apiClient.get("/banks/overview");
        return response.data;
    },
};

export default bankService;
