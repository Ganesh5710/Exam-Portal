import React, { useEffect, useState } from "react";
import api from "../../services/api";
import {
  Crown,
  Building2,
  Users,
  BookOpen,
  FileText,
  Activity,
  ShieldCheck,
  Power,
  RefreshCw,
  Cpu,
  Zap,
  TrendingUp,
  AlertTriangle,
  Server,
  Layers,
} from "lucide-react";
import toast from "react-hot-toast";

export const SuperAdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toggling, setToggling] = useState(false);

  const fetchMetrics = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await api.get("/superadmin/metrics");
      setMetrics(res.data.data);
      if (isRefresh) toast.success("Super Admin metrics updated!");
    } catch (err) {
      toast.error("Failed to load platform telemetry.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleToggleMaintenance = async () => {
    setToggling(true);
    try {
      const res = await api.post("/superadmin/toggle-maintenance");
      toast.success(res.data.message);
      fetchMetrics();
    } catch (err) {
      toast.error("Failed to update maintenance mode status.");
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-muted rounded w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Registered Institutions",
      value: metrics?.totalDepartments || 0,
      icon: Building2,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
    },
    {
      label: "Total Candidate Students",
      value: metrics?.totalStudents || 0,
      icon: Users,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    {
      label: "Active Institution Admins",
      value: metrics?.totalAdmins || 0,
      icon: ShieldCheck,
      color: "text-violet-400",
      bgColor: "bg-violet-500/10",
      borderColor: "border-violet-500/20",
    },
    {
      label: "Platform Examinations",
      value: metrics?.totalExams || 0,
      icon: BookOpen,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
    },
    {
      label: "Total Submissions Evaluated",
      value: metrics?.totalSubmissions || 0,
      icon: FileText,
      color: "text-pink-400",
      bgColor: "bg-pink-500/10",
      borderColor: "border-pink-500/20",
    },
    {
      label: "AI Import Operations",
      value: metrics?.totalImportJobs || 0,
      icon: Cpu,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/20",
    },
    {
      label: "Platform Pass Rate",
      value: `${metrics?.platformPassRate || 0}%`,
      icon: TrendingUp,
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20",
    },
    {
      label: "Average Platform Score",
      value: `${metrics?.platformAvgScore || 0}%`,
      icon: Zap,
      color: "text-fuchsia-400",
      bgColor: "bg-fuchsia-500/10",
      borderColor: "border-fuchsia-500/20",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 glass-card p-6 rounded-2xl border border-amber-500/20 bg-amber-500/5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-amber-500 to-violet-600 flex items-center justify-center text-white shadow-xl shadow-amber-500/20">
            <Crown size={30} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
              SaaS Command Center
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 uppercase font-bold">
                Global Super Admin
              </span>
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Cross-institution telemetries, infrastructure health monitors, and master audit controls.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Maintenance Mode Toggle Button */}
          <button
            onClick={handleToggleMaintenance}
            disabled={toggling}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg ${
              metrics?.isMaintenanceMode
                ? "bg-red-600 hover:bg-red-700 text-white shadow-red-600/20"
                : "bg-accent/40 border border-border hover:bg-accent text-foreground"
            }`}
          >
            <Power size={14} className={metrics?.isMaintenanceMode ? "animate-pulse" : ""} />
            {toggling
              ? "Updating..."
              : metrics?.isMaintenanceMode
              ? "Maintenance Active (Click to Disable)"
              : "Enable Maintenance Mode"}
          </button>

          <button
            onClick={() => fetchMetrics(true)}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-border bg-card hover:bg-accent text-muted-foreground hover:text-foreground transition-all"
            title="Refresh Telemetry"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin text-amber-400" : ""} />
          </button>
        </div>
      </div>

      {/* Infrastructure Node Status Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-4 rounded-xl border border-border flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Server size={18} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Active Cloud Cluster</span>
            <span className="text-xs font-semibold">{metrics?.activeServerNode || "Skillbrix-East-Cluster"}</span>
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-border flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
            <Activity size={18} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Platform SLA Uptime</span>
            <span className="text-xs font-semibold text-blue-400">{metrics?.systemUptime || "99.99%"}</span>
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-border flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <Layers size={18} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Platform Status</span>
            <span className={`text-xs font-bold ${metrics?.isMaintenanceMode ? "text-red-400" : "text-emerald-400"}`}>
              {metrics?.isMaintenanceMode ? "MAINTENANCE LOCK" : "ONLINE / OPERATIONAL"}
            </span>
          </div>
        </div>
      </div>

      {/* Global Telemetry Grid */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
          Global Telemetry Indicators
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {statCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={i}
                className={`glass-card p-5 rounded-xl border ${card.borderColor} flex flex-col justify-between space-y-4 hover:shadow-lg transition-all duration-300`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-xs font-medium text-muted-foreground">{card.label}</span>
                  <div className={`p-2.5 rounded-lg ${card.bgColor}`}>
                    <Icon size={18} className={card.color} />
                  </div>
                </div>
                <span className="text-2xl font-black tracking-tight">{card.value}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
