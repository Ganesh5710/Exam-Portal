import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Shield, Lock, Mail, Loader2, KeyRound } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";

export const Login = () => {
  const { login, loginWithOtp } = useAuth();
  const navigate = useNavigate();
  
  const [roleMode, setRoleMode] = useState("student"); // "student" or "admin"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [debugOtp, setDebugOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    setLoading(true);
    setDebugOtp("");
    try {
      const res = await api.post("/auth/send-otp", { email });
      setOtpSent(true);
      if (res.data.debugOtp) {
        setDebugOtp(res.data.debugOtp);
      }
      toast.success("Verification code sent to your email!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!email || !otp) {
      toast.error("Please fill in all verification fields.");
      return;
    }

    setLoading(true);
    try {
      await loginWithOtp(email, otp);
      toast.success("Login successful!");
      navigate("/student/exams");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid or expired verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("All fields are required.");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      toast.success("Admin login successful!");
      navigate("/admin/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid admin credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-8 rounded-2xl shadow-2xl border border-white/10 w-full max-w-md mx-auto animate-fade-in">
      {/* Brand Icon */}
      <div className="flex flex-col items-center gap-2 mb-6 text-center">
        <div className="w-12 h-12 rounded-xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
          <Shield size={24} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Access SecureExam</h2>
        <p className="text-sm text-slate-400">Enterprise Examination Portal</p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 bg-slate-900/60 p-1 rounded-xl border border-slate-800 text-xs font-semibold mb-6">
        <button
          onClick={() => {
            setRoleMode("student");
            setOtpSent(false);
            setOtp("");
            setDebugOtp("");
          }}
          className={`py-2 rounded-lg transition-all ${
            roleMode === "student"
              ? "bg-violet-600 text-white shadow-md"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Student Portal
        </button>
        <button
          onClick={() => {
            setRoleMode("admin");
          }}
          className={`py-2 rounded-lg transition-all ${
            roleMode === "admin"
              ? "bg-violet-600 text-white shadow-md"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Admin Portal
        </button>
      </div>

      {/* Forms */}
      {roleMode === "student" ? (
        !otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Student Email Address
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. student@admin.in"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-violet-600 hover:bg-violet-700 active:bg-violet-800 font-semibold text-white py-2.5 rounded-lg text-sm shadow-lg shadow-violet-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Sending Code...
                </>
              ) : (
                "Request Verification Code"
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Verification Code (OTP)
              </label>
              <div className="relative">
                <KeyRound
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                  required
                />
              </div>
              {debugOtp && (
                <div className="mt-2.5 p-2.5 bg-violet-500/10 border border-violet-500/20 rounded-lg text-center text-xs text-violet-400 font-mono animate-pulse">
                  [Demo Mode] OTP Code: <strong className="text-white text-sm select-all">{debugOtp}</strong>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 font-semibold text-white py-2.5 rounded-lg text-sm shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Verifying...
                </>
              ) : (
                "Verify & Join Exam"
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setOtpSent(false);
                setOtp("");
                setDebugOtp("");
              }}
              className="w-full text-center text-xs text-slate-400 hover:text-white transition-colors"
            >
              Change Email Address
            </button>
          </form>
        )
      ) : (
        <form onSubmit={handleAdminSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Admin Email Address
            </label>
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. Skillbrix@admin.in"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Security Password
              </label>
            </div>
            <div className="relative">
              <Lock
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-violet-600 hover:bg-violet-700 active:bg-violet-800 font-semibold text-white py-2.5 rounded-lg text-sm shadow-lg shadow-violet-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Authenticating...
              </>
            ) : (
              "Login as Admin"
            )}
          </button>
        </form>
      )}

      <div className="mt-8 pt-6 border-t border-slate-900 text-center text-xs text-slate-500">
        <p>Protected by active real-time proctoring and audit trail logging.</p>
      </div>
    </div>
  );
};

export default Login;
