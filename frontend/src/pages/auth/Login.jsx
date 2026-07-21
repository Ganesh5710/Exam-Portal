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
      const userProfile = await login(email, password);
      toast.success("Login successful!");

      const role = userProfile?.role || JSON.parse(localStorage.getItem("user") || "{}").role;
      if (role === "SUPER_ADMIN") {
        navigate("/superadmin/dashboard", { replace: true });
      } else if (role === "ADMIN") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/student/exams", { replace: true });
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
              placeholder="e.g. user@organization.com"
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
