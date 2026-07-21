import React, { useEffect, useState } from "react";
import api from "../../services/api";
import {
  ShieldAlert,
  Search,
  RefreshCw,
  User,
  Globe,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";

export const MasterAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchLogs = async (page = 1, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await api.get(`/superadmin/audit-logs?page=${page}&limit=20&search=${encodeURIComponent(search)}`);
      setLogs(res.data.data.logs);
      setPagination(res.data.data.pagination);
      if (isRefresh) toast.success("Audit trail logs updated.");
    } catch {
      toast.error("Failed to load audit logs.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [search]);

  const formatDate = (isoStr) => {
    if (!isoStr) return "Just now";
    return new Date(isoStr).toLocaleString();
  };

  const getActionBadge = (action) => {
    if (action.includes("DELETE") || action.includes("BLOCK")) {
      return "bg-red-500/15 text-red-400 border-red-500/30";
    }
    if (action.includes("CREATE") || action.includes("IMPORT")) {
      return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    }
    if (action.includes("SUPER_ADMIN") || action.includes("TOGGLE")) {
      return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    }
    return "bg-violet-500/15 text-violet-400 border-violet-500/30";
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Master Audit Trail</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Platform-wide immutable security logs tracking administrative operations, IP addresses, and database mutations.
          </p>
        </div>
        <button
          onClick={() => fetchLogs(pagination.page, true)}
          disabled={refreshing}
          className="flex items-center gap-2 border border-border bg-card hover:bg-accent px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin text-amber-400" : ""} />
          Refresh Logs
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="text"
          placeholder="Search audit trail by action keyword, target ID, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
        />
      </div>

      {/* Table Container */}
      <div className="glass-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-accent/40 border-b border-border text-xs uppercase font-bold text-muted-foreground">
              <tr>
                <th className="px-6 py-4">Action Event</th>
                <th className="px-6 py-4">User / Initiator</th>
                <th className="px-6 py-4">Target Payload</th>
                <th className="px-6 py-4">Client IP</th>
                <th className="px-6 py-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground animate-pulse">
                    Loading audit trail logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-accent/20 transition-colors">
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-lg border ${getActionBadge(
                          log.action,
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-muted-foreground" />
                        <span className="font-semibold text-xs text-foreground">
                          {log.user ? `${log.user.firstName} (${log.user.email})` : "System / Automated"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-muted-foreground max-w-xs truncate">
                      {log.target || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Globe size={12} />
                        {log.ipAddress || "127.0.0.1"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground whitespace-nowrap">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatDate(log.createdAt)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Page <strong className="text-foreground">{pagination.page}</strong> of{" "}
            <strong className="text-foreground">{pagination.pages}</strong> ({pagination.total} total logs)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchLogs(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-2 rounded-lg border border-border disabled:opacity-30 hover:bg-accent"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => fetchLogs(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="p-2 rounded-lg border border-border disabled:opacity-30 hover:bg-accent"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterAuditLogs;
