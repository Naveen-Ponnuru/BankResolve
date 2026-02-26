/**
 * userService — Enterprise User Management Service
 *
 * All endpoints match Spring Boot /api/users/* contract.
 */
import apiClient from "../api/apiClient";

const userService = {
    /** GET /users — Admin: list all users with optional filters */
    getAllUsers: async (params = {}) => {
        const response = await apiClient.get("/users", { params });
        return response.data;
    },

    /** GET /users/:id — Get user by ID */
    getUserById: async (userId) => {
        const response = await apiClient.get(`/users/${userId}`);
        return response.data;
    },

    /** GET /auth/me — Current user's own profile */
    getProfile: async () => {
        const response = await apiClient.get("/auth/me");
        return response.data;
    },

    /** POST /users — Admin: create new user (staff/manager) */
    createUser: async (userData) => {
        const response = await apiClient.post("/users", userData);
        return response.data;
    },

    /** PATCH /users/:id/role — Admin: assign role */
    updateUserRole: async (userId, role) => {
        const response = await apiClient.patch(`/users/${userId}/role`, { role });
        return response.data;
    },

    /** PATCH /users/:id/status — Admin: activate/deactivate */
    updateUserStatus: async (userId, status) => {
        const response = await apiClient.patch(`/users/${userId}/status`, { status });
        return response.data;
    },

    /** DELETE /users/:id — Admin: hard delete (use with caution) */
    deleteUser: async (userId) => {
        const response = await apiClient.delete(`/users/${userId}`);
        return response.data;
    },

    /** GET /users/staff — Get all staff members for reassignment dropdowns */
    getStaffMembers: async () => {
        const response = await apiClient.get("/users/staff");
        return response.data;
    },

    /** GET /users/stats — Admin: user statistics summary */
    getUserStats: async () => {
        const response = await apiClient.get("/users/stats");
        return response.data;
    },
};

export default userService;
