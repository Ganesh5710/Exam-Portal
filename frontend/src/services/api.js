/**
 * api.ts
 * Axios HTTP client instance configured for the Exam Portal REST API.
 * Automatically injects JWT Bearer token from localStorage on every request.
 * Handles 401 responses by clearing session and redirecting to login.
 * Includes 30s timeout to allow Render backend cold starts to wake up cleanly.
 */
import axios from "axios";

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (import.meta.env.DEV || (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"))) {
    return "http://localhost:5000/api/v1";
  }
  if (typeof window !== "undefined" && window.location.origin) {
    return `${window.location.origin}/api/v1`;
  }
  return "/api/v1";
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 120000, // 2 minutes timeout to support AI image/PDF extractions
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Attach access token to headers (except on auth endpoints like login/refresh/otp)
api.interceptors.request.use(
  (config) => {
    const isAuthRoute =
      config.url?.includes("/auth/login") ||
      config.url?.includes("/auth/send-otp") ||
      config.url?.includes("/auth/verify-otp") ||
      config.url?.includes("/auth/refresh");

    const token = localStorage.getItem("accessToken");
    if (token && config.headers && !isAuthRoute) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Intercept responses for token refresh rotation on expiration & cold start retries
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Retry automatically on 502 Bad Gateway, 503, 504, network error, or HTML error page (Render booting/restarting)
    const isServerWakingOrDeploying =
      error.code === 'ERR_NETWORK' ||
      error.response?.status === 502 ||
      error.response?.status === 503 ||
      error.response?.status === 504 ||
      (typeof error.response?.data === 'string' && error.response.data.includes('DOCTYPE'));

    if (isServerWakingOrDeploying && (originalRequest._retryCount || 0) < 4) {
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      await new Promise(resolve => setTimeout(resolve, 2500));
      return api(originalRequest);
    }

    if (error.response?.status === 401) {
      const isAuthRoute =
        originalRequest?.url?.includes("/auth/login") ||
        originalRequest?.url?.includes("/auth/send-otp") ||
        originalRequest?.url?.includes("/auth/verify-otp") ||
        originalRequest?.url?.includes("/auth/refresh");

      // For auth endpoints, directly return the error response to the calling form
      if (isAuthRoute) {
        return Promise.reject(error);
      }

      if (!originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const refreshToken = localStorage.getItem("refreshToken");
          if (!refreshToken) throw new Error("No refresh token available");

          // Request a new token pair
          const refreshUrl = getBaseUrl() + "/auth/refresh";
          const response = await axios.post(refreshUrl, { refreshToken });
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;

          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Clear stale tokens and force login redirect
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      } else {
        // Clear stale session on second failed attempt
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
