import React, { useEffect, useState, useCallback, useMemo } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Award,
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
  TrendingUp,
  AlertTriangle,
  Send,
  Loader2,
  Trash2,
  Pencil,
  Download,
  AlertOctagon,
  BarChart2,
  CheckSquare,
  Square,
  Eye,
  RefreshCw,
  Printer,
  Sparkles,
  CheckCircle,
  XCircle,
  HelpCircle,
  User,
  BookOpen,
  SlidersHorizontal,
} from "lucide-react";

export const Results = () => {
  // Main Data States
  const [submissions, setSubmissions] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [examFilter, setExamFilter] = useState("ALL");
  const [pageSize, setPageSize] = useState(25);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 1,
  });

  // Modal States
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailedData, setDetailedData] = useState(null);

  // Manual Edit Score Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editSubmission, setEditSubmission] = useState(null);
  const [editScore, setEditScore] = useState("");
  const [editPercentage, setEditPercentage] = useState("");
  const [editGrade, setEditGrade] = useState("");
  const [editStatus, setEditStatus] = useState("COMPLETED");
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete & Bulk Delete States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkPublishing, setBulkPublishing] = useState(false);

  // Single Action Loading States
  const [publishingId, setPublishingId] = useState(null);
  const [gradingAnswerId, setGradingAnswerId] = useState(null);
  const [gradeInputs, setGradeInputs] = useState({});

  // ─── 1. Fetch Exams List ─────────────────────────────────────────
  const fetchExams = useCallback(async () => {
    try {
      const res = await api.get("/exams", { timeout: 15000 });
      const examData = res.data.data?.exams || res.data.data || [];
      setExams(Array.isArray(examData) ? examData : []);
    } catch {
      // Ignore exam filter fetch failures gracefully
    }
  }, []);

  // ─── 2. Fetch Submissions Grid ───────────────────────────────────
  const fetchSubmissions = useCallback(
    async (page = 1, currentLimit = pageSize, isRetry = false) => {
      setLoading(true);
      setFetchError(false);
      try {
        const params = { page, limit: currentLimit };
        if (statusFilter !== "ALL") params.status = statusFilter;
        if (examFilter !== "ALL") params.examId = examFilter;
        if (searchQuery.trim()) params.search = searchQuery.trim();

        const res = await api.get("/submissions", { params, timeout: 30000 });
        const subs = res.data.data?.submissions || res.data.submissions || res.data.data || [];
        const pag = res.data.data?.pagination || res.data.pagination || {
          page,
          limit: currentLimit,
          total: Array.isArray(subs) ? subs.length : 0,
          totalPages: 1,
        };

        setSubmissions(Array.isArray(subs) ? subs : []);
        setPagination(pag);
      } catch (err) {
        console.error("Error fetching submissions:", err);
        if (!isRetry) {
          // Automatic 1s fallback retry to absorb network hiccups
          setTimeout(() => fetchSubmissions(page, currentLimit, true), 1000);
          return;
        }
        setFetchError(true);
        toast.error("Failed to load examination results.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [statusFilter, examFilter, searchQuery, pageSize],
  );

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  useEffect(() => {
    fetchSubmissions(1);
  }, [fetchSubmissions]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSubmissions(pagination.page);
  };

  // ─── 3. Compute KPI Analytics Cards ──────────────────────────────
  const kpis = useMemo(() => {
    const total = pagination.total || submissions.length || 0;
    if (!submissions || submissions.length === 0) {
      return { total, passRate: 0, avgScore: 0, pendingCount: 0 };
    }
    const completed = submissions.filter((s) => s.status === "COMPLETED" || s.status === "PUBLISHED");
    const passed = completed.filter((s) => s.isPassed || (s.percentage || 0) >= 40).length;
    const passRate = completed.length > 0 ? Math.round((passed / completed.length) * 100) : 0;
    const totalPct = completed.reduce((acc, s) => acc + (s.percentage || 0), 0);
    const avgScore = completed.length > 0 ? (totalPct / completed.length).toFixed(1) : 0;
    const pendingCount = submissions.filter((s) => s.status === "PENDING").length;

    return { total, passRate, avgScore, pendingCount };
  }, [submissions, pagination.total]);

  // ─── 4. Detailed Submission Modal (Review Mode) ────────────────
  const openDetailModal = async (sub) => {
    setSelectedSubmission(sub);
    setDetailModalOpen(true);
    setDetailLoading(true);
    setDetailedData(null);
    setGradeInputs({});

    try {
      const res = await api.get(`/submissions/${sub.id}`, { timeout: 20000 });
      const data = res.data.data || res.data;
      setDetailedData(data);

      // Pre-fill descriptive answer grading inputs
      if (data.answers && Array.isArray(data.answers)) {
        const initialInputs = {};
        data.answers.forEach((ans) => {
          if (ans.question?.type === "DESCRIPTIVE" || ans.question?.type === "SHORT_ANSWER") {
            initialInputs[ans.id] = {
              score: ans.scoreAwarded?.toString() || "0",
              feedback: ans.feedback || "",
            };
          }
        });
        setGradeInputs(initialInputs);
      }
    } catch {
      toast.error("Could not load complete answer breakdown.");
      setDetailedData(sub); // Fallback to basic row data
    } finally {
      setDetailLoading(false);
    }
  };

  // ─── 5. Grade Descriptive Answer Inline ─────────────────────────
  const handleGradeAnswer = async (answerId, maxScore) => {
    const input = gradeInputs[answerId];
    if (!input) return;
    const scoreVal = parseFloat(input.score);
    if (isNaN(scoreVal) || scoreVal < 0 || scoreVal > maxScore) {
      toast.error(`Score must be between 0 and ${maxScore}`);
      return;
    }

    setGradingAnswerId(answerId);
    try {
      await api.post(`/submissions/grade/${answerId}`, {
        scoreAwarded: scoreVal,
        feedback: input.feedback,
      });
      toast.success("Answer scored successfully!");

      // Refresh detailed modal data
      if (selectedSubmission) {
        const res = await api.get(`/submissions/${selectedSubmission.id}`);
        setDetailedData(res.data.data || res.data);
      }
      fetchSubmissions(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save score.");
    } finally {
      setGradingAnswerId(null);
    }
  };

  // ─── 6. Single Result Edit Modal ───────────────────────────────
  const openEditModal = (sub) => {
    setEditSubmission(sub);
    setEditScore(sub.totalScore?.toString() || "0");
    setEditPercentage(sub.percentage?.toString() || "0");
    setEditGrade(sub.grade || "F");
    setEditStatus(sub.status || "COMPLETED");
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editSubmission) return;
    const score = parseFloat(editScore);
    const pct = parseFloat(editPercentage);

    if (isNaN(score) || score < 0) {
      toast.error("Please enter a valid numeric score.");
      return;
    }

    setSavingEdit(true);
    try {
      await api.put(`/submissions/${editSubmission.id}`, {
        totalScore: score,
        percentage: isNaN(pct) ? undefined : pct,
        grade: editGrade.trim() || undefined,
        status: editStatus,
      });
      toast.success("Candidate score updated successfully!");
      setEditModalOpen(false);
      fetchSubmissions(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update submission.");
    } finally {
      setSavingEdit(false);
    }
  };

  // ─── 7. Single Result Publish / Unpublish ───────────────────────
  const handlePublish = async (sub) => {
    setPublishingId(sub.id);
    const newStatus = sub.status === "PUBLISHED" ? "COMPLETED" : "PUBLISHED";
    try {
      await api.put(`/submissions/${sub.id}`, {
        status: newStatus,
      });
      toast.success(
        newStatus === "PUBLISHED"
          ? "Result published to student portal!"
          : "Result unpublished.",
      );
      fetchSubmissions(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to publish result.");
    } finally {
      setPublishingId(null);
    }
  };

  // ─── 8. Delete Single Submission ───────────────────────────────
  const openDeleteModal = (sub) => {
    setDeleteTarget(sub);
    setDeleteModalOpen(true);
  };

  const handleDeleteSingle = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/submissions/${deleteTarget.id}`);
      toast.success("Submission deleted & candidate assignment reset.");
      setDeleteModalOpen(false);
      setDeleteTarget(null);
      fetchSubmissions(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete submission.");
    } finally {
      setDeleting(false);
    }
  };

  // ─── 9. Bulk Selection Helpers ─────────────────────────────────
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = new Set(submissions.map((s) => s.id));
      setSelectedIds(allIds);
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkPublish = async () => {
    if (selectedIds.size === 0) return;
    setBulkPublishing(true);
    try {
      await api.post("/submissions/bulk-publish", {
        ids: Array.from(selectedIds),
      });
      toast.success(`Published ${selectedIds.size} selected result(s)!`);
      setSelectedIds(new Set());
      fetchSubmissions(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Bulk publish failed.");
    } finally {
      setBulkPublishing(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setBulkDeleting(true);
    try {
      await api.delete("/submissions/bulk", {
        data: { ids: Array.from(selectedIds) },
      });
      toast.success(`Deleted ${selectedIds.size} submission(s).`);
      setSelectedIds(new Set());
      setShowBulkDeleteModal(false);
      fetchSubmissions(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Bulk deletion failed.");
    } finally {
      setBulkDeleting(false);
    }
  };

  // ─── 10. Export to CSV & Print ──────────────────────────────────
  const handleExportCSV = () => {
    if (!submissions || submissions.length === 0) {
      toast.error("No submissions available to export.");
      return;
    }

    const headers = [
      "Student Name",
      "Email",
      "Exam Title",
      "Score",
      "Max Score",
      "Percentage",
      "Grade",
      "Status",
      "Pass/Fail",
      "Violations",
      "Submitted At",
    ];

    const rows = submissions.map((s) => [
      `"${s.student?.firstName || ""} ${s.student?.lastName || ""}"`,
      `"${s.student?.email || ""}"`,
      `"${s.exam?.title || ""}"`,
      s.totalScore ?? 0,
      s.exam?.totalMarks || 100,
      `${(s.percentage || 0).toFixed(1)}%`,
      `"${s.grade || "N/A"}"`,
      `"${s.status || ""}"`,
      s.isPassed ? "PASSED" : "FAILED",
      s.violationsCount || 0,
      `"${s.submitTime ? new Date(s.submitTime).toLocaleString() : "N/A"}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Exam_Results_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV Export downloaded!");
  };

  const handlePrintReport = () => {
    window.print();
  };

  // ─── Helper Badge Colors ────────────────────────────────────────
  const getGradeBadge = (grade) => {
    switch (grade) {
      case "A+":
      case "A":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "B":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "C":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "D":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      default:
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/30 icon-sparkles";
      case "COMPLETED":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "PENDING":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/30";
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* ─── Page Title Header ───────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center gap-3">
            <BarChart2 className="w-8 h-8 text-purple-400" />
            Results & Assessment Review
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Review candidate answer sheets, evaluate descriptive responses, override marks, and publish official grades.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-medium transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-purple-400" : ""}`} />
            Refresh
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-sm font-semibold transition-all shadow-lg shadow-purple-950/20"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={handlePrintReport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-sm font-semibold transition-all"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </button>
        </div>
      </div>

      {/* ─── Top KPI Metric Cards ──────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Submissions</p>
              <h3 className="text-2xl font-bold text-slate-100 mt-1">{kpis.total}</h3>
            </div>
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
              <FileText className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-500 flex items-center gap-1.5">
            <span className="text-purple-400 font-semibold">Active Records</span> in system
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pass Rate</p>
              <h3 className="text-2xl font-bold text-emerald-400 mt-1">{kpis.passRate}%</h3>
            </div>
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <Award className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-500 flex items-center gap-1.5">
            <span className="text-emerald-400 font-semibold">Candidates</span> meeting passing threshold
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Score</p>
              <h3 className="text-2xl font-bold text-blue-400 mt-1">{kpis.avgScore}%</h3>
            </div>
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-500 flex items-center gap-1.5">
            <span className="text-blue-400 font-semibold">Cohort Mean</span> score performance
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Evaluation</p>
              <h3 className="text-2xl font-bold text-amber-400 mt-1">{kpis.pendingCount}</h3>
            </div>
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-500 flex items-center gap-1.5">
            <span className="text-amber-400 font-semibold">Requires</span> manual teacher grading
          </div>
        </div>
      </div>

      {/* ─── Search, Filters & Bulk Actions Bar ─────────────────── */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-4 backdrop-blur-md">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidate by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all"
            />
          </div>

          {/* Exam Dropdown Filter */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={examFilter}
                onChange={(e) => setExamFilter(e.target.value)}
                className="appearance-none bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 pr-9 text-sm text-slate-300 font-medium focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="ALL">All Examinations</option>
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.title}
                  </option>
                ))}
              </select>
              <Filter className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Items Per Page */}
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Rows:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="bg-slate-950/80 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 overflow-x-auto">
          <div className="flex items-center gap-1.5">
            {["ALL", "PENDING", "COMPLETED", "PUBLISHED"].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  statusFilter === tab
                    ? "bg-purple-600 text-white shadow-md shadow-purple-900/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                {tab === "ALL" ? "All Submissions" : tab}
              </button>
            ))}
          </div>

          {/* Bulk Selection Quick Menu */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-3 bg-purple-950/40 border border-purple-500/30 px-3 py-1.5 rounded-xl animate-fadeIn">
              <span className="text-xs font-semibold text-purple-300">
                {selectedIds.size} Selected
              </span>
              <button
                onClick={handleBulkPublish}
                disabled={bulkPublishing}
                className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1 transition-all"
              >
                {bulkPublishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Publish Selected
              </button>
              <button
                onClick={() => setShowBulkDeleteModal(true)}
                className="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-medium flex items-center gap-1 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Selected
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── Submissions Data Grid ───────────────────────────────── */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
        {loading ? (
          <div className="p-12 text-center space-y-4">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto" />
            <p className="text-slate-400 text-sm font-medium">Loading candidate submissions...</p>
          </div>
        ) : fetchError ? (
          <div className="p-12 text-center space-y-4">
            <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
            <p className="text-slate-300 font-semibold">Failed to fetch result records.</p>
            <button
              onClick={() => fetchSubmissions(pagination.page)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg"
            >
              Retry Connection
            </button>
          </div>
        ) : submissions.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-slate-200 font-semibold">No Submissions Found</h3>
            <p className="text-slate-400 text-xs max-w-sm mx-auto">
              No student examination submissions match your search or status criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold text-xs tracking-wider uppercase">
                  <th className="p-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === submissions.length && submissions.length > 0}
                      onChange={handleSelectAll}
                      className="rounded bg-slate-900 border-slate-700 text-purple-600 focus:ring-purple-500 cursor-pointer"
                    />
                  </th>
                  <th className="p-4">Candidate</th>
                  <th className="p-4">Exam Title</th>
                  <th className="p-4">Score / Pct</th>
                  <th className="p-4">Grade</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Violations</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {submissions.map((sub) => {
                  const studentName = sub.student
                    ? `${sub.student.firstName || ""} ${sub.student.lastName || ""}`.trim() || "Candidate"
                    : "Candidate";
                  const initial = studentName.charAt(0).toUpperCase();
                  const isSelected = selectedIds.has(sub.id);

                  return (
                    <tr
                      key={sub.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isSelected ? "bg-purple-950/20" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(sub.id)}
                          className="rounded bg-slate-900 border-slate-700 text-purple-600 focus:ring-purple-500 cursor-pointer"
                        />
                      </td>

                      {/* Candidate Avatar & Details */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 flex items-center justify-center font-bold text-sm shrink-0">
                            {initial}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-100 leading-snug">{studentName}</p>
                            <p className="text-xs text-slate-400 font-mono">{sub.student?.email || "N/A"}</p>
                          </div>
                        </div>
                      </td>

                      {/* Exam Title */}
                      <td className="p-4 font-medium text-slate-200">
                        {sub.exam?.title || "Exam Paper"}
                      </td>

                      {/* Score / Percentage */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-100">{sub.totalScore ?? 0} pts</span>
                          <span className="text-xs text-slate-400 font-mono">
                            ({(sub.percentage || 0).toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-24 h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              sub.isPassed || (sub.percentage || 0) >= 40
                                ? "bg-emerald-400"
                                : "bg-rose-400"
                            }`}
                            style={{ width: `${Math.min(100, Math.max(0, sub.percentage || 0))}%` }}
                          />
                        </div>
                      </td>

                      {/* Grade Pill */}
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-lg border text-xs font-bold ${getGradeBadge(
                            sub.grade || "F",
                          )}`}
                        >
                          {sub.grade || "N/A"}
                        </span>
                      </td>

                      {/* Status Pill */}
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border text-xs font-semibold ${getStatusBadge(
                            sub.status,
                          )}`}
                        >
                          {sub.status === "PUBLISHED" && <Sparkles className="w-3 h-3" />}
                          {sub.status || "PENDING"}
                        </span>
                      </td>

                      {/* Proctoring Violations */}
                      <td className="p-4">
                        {sub.violationsCount > 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-500/20">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {sub.violationsCount} Alert(s)
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500 font-mono">0 Alerts</span>
                        )}
                      </td>

                      {/* Row Action Buttons */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openDetailModal(sub)}
                            title="Inspect Paper & Grade Answers"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
                          >
                            <Eye className="w-4 h-4 text-purple-400" />
                          </button>
                          <button
                            onClick={() => openEditModal(sub)}
                            title="Override Score / Grade"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
                          >
                            <Pencil className="w-4 h-4 text-blue-400" />
                          </button>
                          <button
                            onClick={() => handlePublish(sub)}
                            disabled={publishingId === sub.id}
                            title={sub.status === "PUBLISHED" ? "Unpublish Result" : "Publish to Student"}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
                          >
                            {publishingId === sub.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                            ) : (
                              <Send className={`w-4 h-4 ${sub.status === "PUBLISHED" ? "text-emerald-400" : "text-slate-400"}`} />
                            )}
                          </button>
                          <button
                            onClick={() => openDeleteModal(sub)}
                            title="Delete Submission"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-700 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ─── Pagination Footer ─────────────────────────────────── */}
        {!loading && submissions.length > 0 && (
          <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div>
              Showing <span className="font-semibold text-slate-200">{submissions.length}</span> of{" "}
              <span className="font-semibold text-slate-200">{pagination.total}</span> result records
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchSubmissions(pagination.page - 1)}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-medium text-slate-300 px-2">
                Page {pagination.page} of {pagination.totalPages || 1}
              </span>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchSubmissions(pagination.page + 1)}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── DETAILED PAPER REVIEW MODAL ───────────────────────────── */}
      {detailModalOpen && selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100 leading-snug">
                    Candidate Examination Review Sheet
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedSubmission.student?.firstName} {selectedSubmission.student?.lastName} (
                    {selectedSubmission.student?.email})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Scroll Area */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-300 text-sm">
              {detailLoading ? (
                <div className="p-12 text-center space-y-3">
                  <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto" />
                  <p className="text-slate-400 text-xs">Loading complete answer sheet & questions...</p>
                </div>
              ) : (
                <>
                  {/* Summary Bar inside Modal */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                    <div>
                      <p className="text-xs text-slate-400 font-semibold uppercase">Exam Title</p>
                      <p className="font-semibold text-slate-200 mt-0.5">
                        {detailedData?.exam?.title || selectedSubmission.exam?.title}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-semibold uppercase">Total Score</p>
                      <p className="font-bold text-purple-400 mt-0.5">
                        {detailedData?.totalScore ?? selectedSubmission.totalScore ?? 0} pts (
                        {(detailedData?.percentage ?? selectedSubmission.percentage ?? 0).toFixed(1)}%)
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-semibold uppercase">Grade / Status</p>
                      <p className="font-semibold text-emerald-400 mt-0.5">
                        Grade {detailedData?.grade || selectedSubmission.grade || "N/A"} -{" "}
                        {detailedData?.isPassed || selectedSubmission.isPassed ? "PASSED" : "FAILED"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-semibold uppercase">Proctoring Alerts</p>
                      <p className="font-semibold text-rose-400 mt-0.5">
                        {detailedData?.violationsCount || selectedSubmission.violationsCount || 0} Alert(s)
                      </p>
                    </div>
                  </div>

                  {/* Answers & Questions Breakdown */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-200 tracking-wide uppercase flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-purple-400" />
                      Question-by-Question Evaluation
                    </h4>

                    {detailedData?.answers && detailedData.answers.length > 0 ? (
                      detailedData.answers.map((ans, idx) => {
                        const q = ans.question;
                        const isDescriptive = q?.type === "DESCRIPTIVE" || q?.type === "SHORT_ANSWER";

                        return (
                          <div
                            key={ans.id || idx}
                            className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <span className="font-bold text-slate-100 text-sm">
                                Q{idx + 1}. {q?.text || "Question Prompt"}
                              </span>
                              <span className="text-xs font-semibold px-2 py-0.5 bg-slate-800 text-slate-300 rounded-md border border-slate-700 shrink-0">
                                Max {q?.score || 1} pt(s)
                              </span>
                            </div>

                            {/* Multiple Choice Options Display */}
                            {q?.options && Array.isArray(q.options) && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                                {q.options.map((opt, oIdx) => {
                                  const isCorrectOpt = oIdx === q.correctAnswer;
                                  const isStudentChoice =
                                    typeof ans.studentAnswer === "number"
                                      ? ans.studentAnswer === oIdx
                                      : false;

                                  return (
                                    <div
                                      key={oIdx}
                                      className={`p-2.5 rounded-lg border flex items-center justify-between ${
                                        isCorrectOpt
                                          ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-300"
                                          : isStudentChoice
                                          ? "bg-rose-950/30 border-rose-500/40 text-rose-300"
                                          : "bg-slate-900/60 border-slate-800 text-slate-400"
                                      }`}
                                    >
                                      <span>
                                        {String.fromCharCode(65 + oIdx)}. {opt}
                                      </span>
                                      {isCorrectOpt && <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                                      {isStudentChoice && !isCorrectOpt && (
                                        <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Descriptive Answer Evaluation Box */}
                            {isDescriptive && (
                              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-3 mt-2">
                                <div>
                                  <p className="text-xs font-semibold text-slate-400 uppercase">
                                    Student Response:
                                  </p>
                                  <p className="text-xs text-slate-200 font-mono mt-1 bg-slate-950 p-2.5 rounded-lg border border-slate-800 whitespace-pre-wrap">
                                    {typeof ans.studentAnswer === "string"
                                      ? ans.studentAnswer
                                      : JSON.stringify(ans.studentAnswer) || "No response provided."}
                                  </p>
                                </div>

                                {/* Scoring Form for Teacher */}
                                <div className="flex flex-col sm:flex-row items-end gap-3 pt-2 border-t border-slate-800">
                                  <div className="w-full sm:w-32">
                                    <label className="text-xs text-slate-400 font-medium">Award Points:</label>
                                    <input
                                      type="number"
                                      step="0.5"
                                      min="0"
                                      max={q?.score || 10}
                                      value={gradeInputs[ans.id]?.score || ""}
                                      onChange={(e) =>
                                        setGradeInputs((prev) => ({
                                          ...prev,
                                          [ans.id]: {
                                            ...prev[ans.id],
                                            score: e.target.value,
                                          },
                                        }))
                                      }
                                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 mt-1"
                                    />
                                  </div>

                                  <div className="flex-1 w-full">
                                    <label className="text-xs text-slate-400 font-medium">Teacher Feedback:</label>
                                    <input
                                      type="text"
                                      placeholder="Optional remarks..."
                                      value={gradeInputs[ans.id]?.feedback || ""}
                                      onChange={(e) =>
                                        setGradeInputs((prev) => ({
                                          ...prev,
                                          [ans.id]: {
                                            ...prev[ans.id],
                                            feedback: e.target.value,
                                          },
                                        }))
                                      }
                                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 mt-1"
                                    />
                                  </div>

                                  <button
                                    onClick={() => handleGradeAnswer(ans.id, q?.score || 10)}
                                    disabled={gradingAnswerId === ans.id}
                                    className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1 transition-all shrink-0"
                                  >
                                    {gradingAnswerId === ans.id ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                    )}
                                    Save Score
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-slate-400 italic">No detailed question responses found.</p>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3 shrink-0">
              <button
                onClick={() => setDetailModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
              >
                Close Review Sheet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MANUAL EDIT SCORE MODAL ──────────────────────────────── */}
      {editModalOpen && editSubmission && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Pencil className="w-5 h-5 text-blue-400" />
                Override Candidate Score
              </h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 font-medium">Total Score Points:</label>
                <input
                  type="number"
                  step="0.5"
                  value={editScore}
                  onChange={(e) => setEditScore(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-sm mt-1 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium">Percentage (%):</label>
                <input
                  type="number"
                  step="0.1"
                  value={editPercentage}
                  onChange={(e) => setEditPercentage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-sm mt-1 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium">Grade Pill:</label>
                <select
                  value={editGrade}
                  onChange={(e) => setEditGrade(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-sm mt-1 focus:outline-none focus:border-purple-500"
                >
                  <option value="A+">A+</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="F">F</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-medium">Result Status:</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-sm mt-1 focus:outline-none focus:border-purple-500"
                >
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="PUBLISHED">PUBLISHED</option>
                  <option value="PENDING">PENDING</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
              <button
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                {savingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Overrides"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── SINGLE DELETE CONFIRMATION MODAL ───────────────────────── */}
      {deleteModalOpen && deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Delete Candidate Submission?</h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to delete the submission for{" "}
              <span className="text-slate-200 font-semibold">
                {deleteTarget.student?.firstName} {deleteTarget.student?.lastName}
              </span>
              ? This action will reset the candidate's exam assignment state.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSingle}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete Submission"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── BULK DELETE CONFIRMATION MODAL ─────────────────────────── */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Bulk Delete Submissions?</h3>
            <p className="text-xs text-slate-400">
              You are about to delete <span className="text-rose-400 font-bold">{selectedIds.size}</span> selected
              candidate submission(s). This cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowBulkDeleteModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                {bulkDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Bulk Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;
