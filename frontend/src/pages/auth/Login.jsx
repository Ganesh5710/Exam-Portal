import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Shield, Lock, Mail, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("All fields are required.");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      toast.success("Login successful!");

      // Check user role to redirect
      const userString = localStorage.getItem("user");
      if (userString) {
        const user = JSON.parse(userString);
        if (user.role === "SUPER_ADMIN") {
          navigate("/superadmin/dashboard");
        } else if (user.role === "ADMIN") {
          navigate("/admin/dashboard");
        } else {
          navigate("/student/exams");
        }
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Login failed. Please check your credentials.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (role) => {
    if (role === "SUPER_ADMIN") {
      setEmail("superadmin@skillbrix.com");
      setPassword("SuperAdmin@123");
    } else if (role === "ADMIN") {
      setEmail("Skillbrix@admin.in");
      setPassword("Admin@123");
    } else {
      setEmail("student@gmail.com");
      setPassword("user@123");
    }
  };

  return (
    <div className="glass-card p-8 rounded-2xl shadow-2xl border border-white/10 w-full max-w-md mx-auto animate-fade-in">
      {/* Brand Icon */}
      <div className="flex flex-col items-center gap-2 mb-8 text-center">
        <div className="w-12 h-12 bg-gradient-to-r from-amber-500 via-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center font-black text-white text-lg shadow-lg shadow-violet-500/20">
          SB
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight text-white">
          Skill<span className="bg-gradient-to-r from-amber-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">brix</span>
        </h2>
        <p className="text-sm text-slate-400">Enterprise Assessment Portal</p>
      </div>

      {/* Quick Demo Login Shortcuts */}
      <div className="mb-6 space-y-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block text-center">
          Quick Demo Credentials:
        </span>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setDemoCredentials("SUPER_ADMIN")}
            className="px-2 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-bold transition-all text-center"
          >
            👑 SuperAdmin
          </button>
          <button
            type="button"
            onClick={() => setDemoCredentials("ADMIN")}
            className="px-2 py-1.5 rounded-lg border border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 text-xs font-bold transition-all text-center"
          >
            👨‍💼 Admin
          </button>
          <button
            type="button"
            onClick={() => setDemoCredentials("STUDENT")}
            className="px-2 py-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-bold transition-all text-center"
          >
            🎓 Student
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Email Address
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
              placeholder="e.g. superadmin@skillbrix.com"
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
              Authenticating Access...
            </>
          ) : (
            "Authenticate Access"
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-900 text-center text-xs text-slate-500">
        <p>Protected by active real-time proctoring and audit trail logging.</p>
      </div>
    </div>
  );
};

export default Login;
