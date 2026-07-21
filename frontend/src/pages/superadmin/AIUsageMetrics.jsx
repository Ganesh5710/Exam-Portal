import React, { useEffect, useState } from "react";
import api from "../../services/api";
import {
  Cpu,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FileText,
  DollarSign,
  Layers,
} from "lucide-react";
import toast from "react-hot-toast";

export const AIUsageMetrics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAIMetrics = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await api.get("/superadmin/ai-usage");
      setData(res.data.data);
      if (isRefresh) toast.success("AI operations telemetry updated!");
    } catch {
      toast.error("Failed to load AI usage metrics.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAIMetrics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Operations & Token Telemetry</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Monitor Gemini 1.5 AI extraction jobs, OCR vision requests, token usage overhead, and estimated API expenses.
          </p>
        </div>
        <button
          onClick={() => fetchAIMetrics(true)}
          disabled={refreshing}
          className="flex items-center gap-2 border border-border bg-card hover:bg-accent px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin text-amber-400" : ""} />
          Sync AI Telemetry
        </button>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card p-5 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 space-y-3">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-muted-foreground">AI Token Overhead</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Cpu size={18} />
            </div>
          </div>
          <span className="text-2xl font-black tracking-tight">{data?.totalTokensUsed?.toLocaleString() || 0}</span>
          <span className="text-[10px] text-cyan-400 font-bold block">Prompt + Candidate Tokens</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 space-y-3">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-muted-foreground">Estimated API Cost</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <DollarSign size={18} />
            </div>
          </div>
          <span className="text-2xl font-black tracking-tight text-emerald-400">{data?.estimatedAICost || "$0.00"}</span>
          <span className="text-[10px] text-emerald-400 font-bold block">Calculated API overhead</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-violet-500/20 bg-violet-500/5 space-y-3">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-muted-foreground">Questions Parsed</span>
            <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
              <FileText size={18} />
            </div>
          </div>
          <span className="text-2xl font-black tracking-tight">{data?.totalProcessedQuestions || 0}</span>
          <span className="text-[10px] text-violet-400 font-bold block">Extracted from PDF / Docx / Excel</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 space-y-3">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-muted-foreground">Active Model Engine</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Zap size={18} />
            </div>
          </div>
          <span className="text-xs font-bold truncate block">{data?.aiEngine || "Gemini 1.5 Pro"}</span>
          <span className="text-[10px] text-amber-400 font-bold block">High Speed OCR Pipeline</span>
        </div>
      </div>

      {/* Recent Import Jobs Table */}
      <div className="glass-card rounded-2xl border border-border p-6 space-y-4">
        <h3 className="text-base font-bold flex items-center gap-2">
          <Layers size={18} className="text-amber-400" />
          Recent Document Extraction Invocations
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-accent/40 border-b border-border text-xs uppercase font-bold text-muted-foreground">
              <tr>
                <th className="px-4 py-3">File Name</th>
                <th className="px-4 py-3">Job Status</th>
                <th className="px-4 py-3">Extracted Count</th>
                <th className="px-4 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {data?.recentJobs?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-muted-foreground">
                    No document extraction jobs recorded yet.
                  </td>
                </tr>
              ) : (
                data?.recentJobs?.map((job) => (
                  <tr key={job.id} className="hover:bg-accent/20">
                    <td className="px-4 py-3 font-semibold text-foreground">{job.fileName}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded font-extrabold uppercase text-[10px] ${
                          job.status === "COMPLETED" || job.status === "PREVIEW_READY"
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : job.status === "FAILED"
                            ? "bg-red-500/15 text-red-400 border border-red-500/30"
                            : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono">{job.processed} questions</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(job.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AIUsageMetrics;
