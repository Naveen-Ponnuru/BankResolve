import axios from "axios";
import { toast } from "react-toastify";

// base url from env or default
const baseURL = import.meta.env.VITE_API_BASE_URL || "/api";

const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000,
  withCredentials: true,
});

// attach token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (!error.response) {
      toast.error("Network error. Please check your connection.");
      return Promise.reject(error);
    }
    const status = error.response.status;
    if (status === 401) {
      toast.error("Session expired. Please log in again.");
      localStorage.removeItem("jwtToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    } else if (status === 403) {
      toast.error("Unauthorized action.");
    } else if (status >= 500) {
      toast.error("Server error. Please try later.");
    }
    return Promise.reject(error);
  },
);

export default apiClient;
