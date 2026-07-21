/**
 * api.ts
 * Axios HTTP client instance configured for the Exam Portal REST API.
 * Automatically injects JWT Bearer token from localStorage on every request.
 * Handles 401 responses by clearing session and redirecting to login.
 * Includes 30s timeout to allow Render backend cold starts to wake up cleanly.
 */
import axios from "axios";

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  return "/api/v1";
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 35000, // 35 seconds to accommodate Render backend cold start wakeups
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Attach access token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token && config.headers) {
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

    // Retry once on network error / 503 (Render waking up from sleep)
    if ((error.code === 'ERR_NETWORK' || error.response?.status === 503) && !originalRequest._networkRetry) {
      originalRequest._networkRetry = true;
      await new Promise(resolve => setTimeout(resolve, 3000));
      return api(originalRequest);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token available");

        // Request a new token pair
        const refreshUrl = getBaseUrl() + "/auth/refresh";
        const response = await axios.post(refreshUrl, {
          refreshToken,
        });
        const { accessToken, refreshToken: newRefreshToken } =
          response.data.data;

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Invalidate session
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export default api;
