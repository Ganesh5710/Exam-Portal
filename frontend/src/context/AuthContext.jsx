/**
 * AuthContext.tsx
 * Global authentication state management for the exam portal.
 * Persists user session in localStorage and exposes login/logout helpers.
 * Consumed by all protected routes via useAuth() hook.
 */
import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Automatic tab/browser close logout handler via navigator.sendBeacon
  useEffect(() => {
    if (!user) return;

    const handleTabClose = () => {
      const refreshToken = localStorage.getItem("refreshToken");
      const apiUrl = import.meta.env.VITE_API_URL || "https://exam-portal-backend-70m2.onrender.com/api";
      const payload = JSON.stringify({ refreshToken, userId: user.id });

      // Clear local authentication storage on tab/window close
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      // Send async HTTP logout beacon to invalidate session on backend
      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: "application/json" });
        navigator.sendBeacon(`${apiUrl}/auth/logout`, blob);
      }
    };

    window.addEventListener("pagehide", handleTabClose);
    window.addEventListener("beforeunload", handleTabClose);

    return () => {
      window.removeEventListener("pagehide", handleTabClose);
      window.removeEventListener("beforeunload", handleTabClose);
    };
  }, [user]);

  // Runs immediately on render startup to verify if cached sessions exist inside local storage
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("accessToken");
      const savedUser = localStorage.getItem("user");

      // Verify availability of token metadata before matching user profile
      if (token && savedUser) {
        setUser(JSON.parse(savedUser));
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { user: userProfile, accessToken, refreshToken } = res.data.data;

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(userProfile));

    setUser(userProfile);
    return userProfile;
  };

  const loginWithOtp = async (email, otp) => {
    const res = await api.post("/auth/verify-otp", { email, otp });
    const { user: userProfile, accessToken, refreshToken } = res.data.data;

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(userProfile));

    setUser(userProfile);
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      await api.post("/auth/logout", { refreshToken });
    } catch (e) {
      // Fail silently for network logout errors
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, loginWithOtp, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
