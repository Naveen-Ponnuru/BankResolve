/**
 * authService — Enterprise Authentication Service
 *
 * All endpoints match Spring Boot /api/auth/* contract.
 * JWT is attached automatically by apiClient interceptor.
 */
import apiClient from "../api/apiClient";

const authService = {
  /**
   * Login user
   * POST /auth/login
   * @param {string} email
   * @param {string} password
   * @returns {{ user, jwtToken }}
   */
  login: async (email, password, bankId) => {
    const response = await apiClient.post("/auth/login", {
      email,
      password,
      bankId,
    });
    return response.data;
  },

  /**
   * Register new customer
   * POST /auth/register
   * @param {{ name, email, phone, password }} userData
   */
  register: async (userData) => {
    // Ensure bankId is included from userData or context
    const { bankId, bankIdFromContext, ...rest } = userData;
    const payload = {
      ...rest,
      bankId: bankId || bankIdFromContext || null,
    };
    const response = await apiClient.post("/auth/register", payload);
    return response.data;
  },

  /**
   * Fetch currently authenticated user profile
   * GET /auth/me
   */
  getCurrentUser: async () => {
    const response = await apiClient.get("/auth/me");
    return response.data;
  },

  /**
   * Backend logout (token invalidation optional)
   * POST /auth/logout
   */
  logout: async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch (e) {
      console.warn(
        "[authService] Backend logout failed, proceeding with local logout", e
      );
    }
  },

  /**
   * Change password for authenticated user
   * POST /auth/change-password
   */
  changePassword: async (currentPassword, newPassword) => {
    const response = await apiClient.post("/auth/change-password", {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  /**
   * Initiate forgot password flow
   * POST /auth/forgot-password
   */
  forgotPassword: async (email) => {
    const response = await apiClient.post("/auth/forgot-password", { email });
    return response.data;
  },
};

export default authService;
