import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  Users,
  Building2,
  BookOpen,
  HelpCircle,
  PlayCircle,
  CheckCircle2,
  TrendingUp,
  Award,
  Activity,
  AlertTriangle,
  Clock,
  RefreshCw,
  BarChart3,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";

export const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalDepartments: 0,
    totalExams: 0,
    totalQuestions: 0,
    activeExams: 0,
    completedExams: 0,
    averageScore: 0,
    passRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recentActivity, setRecentActivity] = useState([]);

  const fetchDashboardData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const summaryRes = await api.get("/analytics/summary");
      const summary = summaryRes.data?.data || {};

      setStats({
        totalStudents: summary.totalStudents || 0,
        totalDepartments: summary.totalDepartments || 0,
        totalExams: summary.totalExams || 0,
        totalQuestions: summary.totalQuestions || 0,
        activeExams: summary.activeExams || 0,
        completedExams: summary.completedExams || 0,
        averageScore: summary.avgScore || 0,
        passRate: summary.passPercentage || 0,
      });

      // Build recent activity safely from summary data
      const activities = [
        {
          id: "act-1",
          text: `${summary.totalStudents || 0} candidate accounts active in portal`,
          time: "Live",
          type: "info",
        },
        {
          id: "act-2",
          text: `${summary.totalQuestions || 0} questions configured in bank`,
          time: "Live",
          type: "success",
        },
      ];

      if (summary.activeExams > 0) {
        activities.unshift({
          id: "act-0",
          text: `${summary.activeExams} examination session(s) live`,
          time: "Now",
          type: "warn",
        });
      }

      setRecentActivity(activities.slice(0, 6));

      if (isRefresh) toast.success("Dashboard refreshed successfully.");
    } catch (err) {
      console.error("Dashboard metrics error:", err);
      // Suppress toast error if summary data loaded successfully
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatRelativeTime = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const statCards = [
    {
      label: "Total Students",
      value: stats.totalStudents,
      icon: Users,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      path: "/admin/students",
    },
    {
      label: "Departments",
      value: stats.totalDepartments,
      icon: Building2,
      color: "text-violet-400",
      bgColor: "bg-violet-500/10",
      borderColor: "border-violet-500/20",
      path: "/admin/departments",
    },
    {
      label: "Total Exams",
      value: stats.totalExams,
      icon: BookOpen,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/20",
      path: "/admin/exams",
    },
    {
      label: "Questions",
      value: stats.totalQuestions,
      icon: HelpCircle,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
      path: "/admin/questions",
    },
    {
      label: "Active Exams",
      value: stats.activeExams,
      icon: PlayCircle,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
      path: "/admin/exams",
    },
    {
      label: "Completed Exams",
      value: stats.completedExams,
      icon: CheckCircle2,
      color: "text-teal-400",
      bgColor: "bg-teal-500/10",
      borderColor: "border-teal-500/20",
      path: "/admin/results",
    },
    {
      label: "Average Score",
      value: `${stats.averageScore}%`,
      icon: TrendingUp,
      color: "text-pink-400",
      bgColor: "bg-pink-500/10",
      borderColor: "border-pink-500/20",
      path: "/admin/results",
    },
    {
      label: "Pass Rate",
      value: `${stats.passRate}%`,
      icon: Award,
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20",
      path: "/admin/results",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 lg:p-8 space-y-8">
        {/* Header skeleton */}
        <div className="space-y-2 animate-pulse">
          <div className="h-9 bg-slate-800/60 rounded-lg w-72" />
          <div className="h-5 bg-slate-800/40 rounded w-96" />
        </div>

        {/* Stats grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-slate-900/80 border border-slate-800/50 rounded-xl p-6 space-y-4"
            >
              <div className="flex justify-between items-start">
                <div className="h-4 bg-slate-800/60 rounded w-24" />
                <div className="h-10 w-10 bg-slate-800/60 rounded-lg" />
              </div>
              <div className="h-8 bg-slate-800/60 rounded w-16" />
            </div>
          ))}
        </div>

        {/* Activity skeleton */}
        <div className="animate-pulse bg-slate-900/80 border border-slate-800/50 rounded-xl p-6 space-y-4">
          <div className="h-6 bg-slate-800/60 rounded w-48" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-800/40 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 lg:p-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Admin Dashboard
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Real-time overview of your examination portal metrics and activity.
          </p>
        </div>
        <button
          onClick={() => fetchDashboardData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-sm font-medium text-slate-300 hover:text-white transition-all duration-200 disabled:opacity-50"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              onClick={() => navigate(card.path)}
              className={`group relative bg-slate-900/80 border ${card.borderColor} rounded-xl p-6 hover:bg-slate-900 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-950/20 overflow-hidden`}
            >
              {/* Subtle gradient overlay on hover */}
              <div
                className={`absolute inset-0 ${card.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl`}
              />

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-sm font-medium text-slate-400 tracking-wide group-hover:text-slate-200 transition-colors">
                    {card.label}
                  </span>
                  <div className={`p-2.5 rounded-lg ${card.bgColor} flex items-center gap-1`}>
                    <Icon size={20} className={card.color} />
                    <ChevronRight size={14} className="text-slate-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
                <div>
                  <span className="text-3xl font-bold tracking-tight text-white group-hover:text-purple-300 transition-colors">
                    {card.value}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Section: Activity + Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Feed */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <Activity size={20} className="text-violet-500" />
              <h3 className="font-semibold text-lg text-white">
                Recent Activity
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Auto-generated from system data
            </span>
          </div>

          <div className="space-y-1">
            {recentActivity.length === 0 ? (
              <div className="text-center py-12">
                <Clock size={32} className="mx-auto text-slate-700 mb-3" />
                <p className="text-sm text-slate-500">
                  No recent activity to display.
                </p>
              </div>
            ) : (
              recentActivity.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between py-3.5 px-4 rounded-lg hover:bg-slate-800/50 transition-colors duration-150 group"
                >
                  <div className="flex items-center gap-3">
                    {log.type === "warn" ? (
                      <div className="p-1.5 rounded-md bg-amber-500/10">
                        <AlertTriangle size={14} className="text-amber-500" />
                      </div>
                    ) : log.type === "success" ? (
                      <div className="p-1.5 rounded-md bg-emerald-500/10">
                        <CheckCircle2 size={14} className="text-emerald-500" />
                      </div>
                    ) : (
                      <div className="p-1.5 rounded-md bg-violet-500/10">
                        <Activity size={14} className="text-violet-500" />
                      </div>
                    )}
                    <span className="text-sm text-slate-300">{log.text}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 whitespace-nowrap">
                      {log.time}
                    </span>
                    <ChevronRight
                      size={14}
                      className="text-slate-700 group-hover:text-slate-500 transition-colors"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Overview Panel */}
        <div className="bg-slate-900/80 border border-slate-800/50 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-6">
              <BarChart3 size={20} className="text-violet-500" />
              <h3 className="font-semibold text-lg text-white">
                Quick Overview
              </h3>
            </div>

            <div className="space-y-5">
              {/* Total Exams */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Total Exams Created</span>
                  <span className="font-semibold text-white">
                    {stats.activeExams + stats.completedExams}
                  </span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-600 to-violet-400 rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(100, (stats.activeExams + stats.completedExams) * 10)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Pass Rate */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Overall Pass Rate</span>
                  <span className="font-semibold text-white">
                    {stats.passRate}%
                  </span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-700"
                    style={{ width: `${stats.passRate}%` }}
                  />
                </div>
              </div>

              {/* Average Score */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Average Score</span>
                  <span className="font-semibold text-white">
                    {stats.averageScore}%
                  </span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full transition-all duration-700"
                    style={{ width: `${stats.averageScore}%` }}
                  />
                </div>
              </div>

              {/* Active vs Completed */}
              <div className="mt-6 pt-5 border-t border-slate-800">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-400">
                      {stats.activeExams}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Live Now</div>
                  </div>
                  <div className="text-center p-3 bg-slate-800/50 border border-slate-700/50 rounded-lg">
                    <div className="text-2xl font-bold text-slate-300">
                      {stats.completedExams}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Completed</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timestamp footer */}
          <div className="mt-6 pt-4 border-t border-slate-800">
            <p className="text-xs text-slate-600 flex items-center gap-1.5">
              <Clock size={12} />
              Last updated: {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
