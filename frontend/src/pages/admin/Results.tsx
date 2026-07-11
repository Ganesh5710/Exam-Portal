import React, { useEffect, useState, useCallback } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
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
  InboxIcon,
  Trash2,
  Pencil,
  AlertOctagon,
  BarChart2,
  CheckSquare,
  Square
} from 'lucide-react';

// ─── Type Definitions ───────────────────────────────────────────────
interface Student {
  firstName: string;
  lastName: string;
  email: string;
}

interface Exam {
  title: string;
  passingMarks: number;
  duration: number;
  examQuestions?: { question: { score: number } }[];
}

interface Submission {
  id: string;
  examId: string;
  studentId: string;
  status: 'PENDING' | 'COMPLETED' | 'GRADED' | 'PUBLISHED';
  totalScore: number;
  percentage: number;
  grade: string;
  isPassed: boolean;
  violationsCount: number;
  answers: any[];
  student: Student;
  exam: Exam;
  createdAt: string;
  submitTime: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ExamOption {
  id: string;
  title: string;
}

// ─── Results Component ──────────────────────────────────────────────
export const Results: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [examFilter, setExamFilter] = useState<string>('ALL');
  const [exams, setExams] = useState<ExamOption[]>([]);

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editSubmission, setEditSubmission] = useState<Submission | null>(null);
  const [editScore, setEditScore] = useState('');
  const [editPercentage, setEditPercentage] = useState('');
  const [editGrade, setEditGrade] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete confirmation state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Submission | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Bulk select state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Publish state
  const [publishing, setPublishing] = useState<string | null>(null);

  // ─── Fetch exam options ─────────────────────────────────────────
  const fetchExams = useCallback(async () => {
    try {
      const res = await api.get('/exams');
      const examData = res.data.data?.exams || res.data.data || [];
      setExams(examData.map((e: any) => ({ id: e.id, title: e.title })));
    } catch {
      // silently fail
    }
  }, []);

  // ─── Fetch submissions ─────────────────────────────────────────
  const fetchSubmissions = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, limit: 10 };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (examFilter !== 'ALL') params.examId = examFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await api.get('/submissions', { params });
      setSubmissions(res.data.data?.submissions || []);
      setPagination(res.data.data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 });
    } catch {
      toast.error('Failed to load submissions.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, examFilter, searchQuery]);

  useEffect(() => { fetchExams(); }, [fetchExams]);
  useEffect(() => { fetchSubmissions(1); }, [fetchSubmissions]);

  // ─── Open Edit Modal ──────────────────────────────────────────
  const openEditModal = (sub: Submission) => {
    setEditSubmission(sub);
    setEditScore(sub.totalScore?.toString() || '0');
    setEditPercentage(sub.percentage?.toString() || '0');
    setEditGrade(sub.grade || '');
    setEditStatus(sub.status || 'PENDING');
    setEditModalOpen(true);
  };

  // ─── Save edits ────────────────────────────────────────────────
  const handleSaveEdit = async () => {
    if (!editSubmission) return;
    const score = parseFloat(editScore);
    const pct = parseFloat(editPercentage);
    if (isNaN(score) || score < 0) {
      toast.error('Please enter a valid score.');
      return;
    }

    setSaving(true);
    try {
      await api.put(`/submissions/${editSubmission.id}`, {
        totalScore: score,
        percentage: isNaN(pct) ? undefined : pct,
        grade: editGrade.trim() || undefined,
        status: editStatus
      });
      toast.success('Submission updated successfully!');
      setEditModalOpen(false);
      fetchSubmissions(pagination.page);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update submission.');
    } finally {
      setSaving(false);
    }
  };

  // ─── Publish ───────────────────────────────────────────────────
  const handlePublish = async (sub: Submission) => {
    setPublishing(sub.id);
    try {
      await api.put(`/submissions/${sub.id}`, { status: 'PUBLISHED', totalScore: sub.totalScore });
      toast.success('Result published to student!');
      fetchSubmissions(pagination.page);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to publish result.');
    } finally {
      setPublishing(null);
    }
  };

  // ─── Open Delete Confirm ──────────────────────────────────────
  const openDeleteModal = (sub: Submission) => {
    setDeleteTarget(sub);
    setDeleteModalOpen(true);
  };

  // ─── Confirm Delete ────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/submissions/${deleteTarget.id}`);
      toast.success('Submission deleted successfully.');
      setDeleteModalOpen(false);
      setDeleteTarget(null);
      fetchSubmissions(pagination.page);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete submission.');
    } finally {
      setDeleting(false);
    }
  };

  // ── Bulk select helpers ───────────────────────────────────────────────
  const allSelected = submissions.length > 0 && submissions.every(s => selectedIds.has(s.id));
  const someSelected = submissions.some(s => selectedIds.has(s.id)) && !allSelected;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(submissions.map(s => s.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setBulkDeleting(true);
    try {
      await api.delete('/submissions/bulk', { data: { ids: Array.from(selectedIds) } });
      toast.success(`Deleted ${selectedIds.size} submission(s) successfully!`);
      setSelectedIds(new Set());
      setShowBulkDeleteModal(false);
      fetchSubmissions(pagination.page);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Bulk delete failed.');
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleBulkPublish = async () => {
    if (selectedIds.size === 0) return;
    try {
      await api.post('/submissions/bulk-publish', { ids: Array.from(selectedIds) });
      toast.success(`Published ${selectedIds.size} result(s) successfully!`);
      setSelectedIds(new Set());
      fetchSubmissions(pagination.page);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Bulk publish failed.');
    }
  };

  const handlePublishAll = async () => {
    const confirm = window.confirm("Are you sure you want to publish ALL unpublished exam results to the user feed at once?");
    if (!confirm) return;

    try {
      await api.post('/submissions/bulk-publish');
      toast.success('Successfully published all exam results!');
      fetchSubmissions(pagination.page);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to publish all results.');
    }
  };

  // ─── Helpers ───────────────────────────────────────────────────
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock size={11} /> Pending
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <CheckCircle2 size={11} /> Completed
          </span>
        );
      case 'GRADED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <BarChart2 size={11} /> Graded
          </span>
        );
      case 'PUBLISHED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Award size={11} /> Published
          </span>
        );
      default:
        return <span className="text-xs text-slate-500">{status}</span>;
    }
  };

  const getScoreDisplay = (sub: Submission) => {
    const passed = sub.isPassed;
    const score = sub.totalScore ?? 0;
    const maxMark = sub.exam?.examQuestions && sub.exam.examQuestions.length > 0
      ? sub.exam.examQuestions.reduce((sum, eq) => sum + (eq.question?.score ?? 0), 0)
      : (sub.exam?.passingMarks ?? 0);
    return (
      <div className="flex items-center gap-2">
        <span className={`text-sm font-bold ${passed ? 'text-emerald-400' : 'text-red-400'}`}>{score}</span>
        <span className="text-slate-500 text-xs">/ {maxMark}</span>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${passed ? 'text-emerald-500 bg-emerald-500/10' : 'text-red-500 bg-red-500/10'}`}>
          {passed ? 'PASS' : 'FAIL'}
        </span>
      </div>
    );
  };

  // ─── Loading Skeleton ──────────────────────────────────────────
  if (loading && submissions.length === 0) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-800 rounded w-1/4" />
        <div className="h-4 bg-slate-800/60 rounded w-1/3" />
        <div className="flex gap-4 mt-6">
          <div className="h-10 bg-slate-800 rounded-lg flex-1 max-w-md" />
          <div className="h-10 bg-slate-800 rounded-lg w-40" />
          <div className="h-10 bg-slate-800 rounded-lg w-40" />
        </div>
        <div className="glass-card rounded-xl overflow-hidden mt-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4 p-4 border-b border-slate-800/50">
              <div className="h-4 bg-slate-800 rounded flex-1" />
              <div className="h-4 bg-slate-800 rounded w-32" />
              <div className="h-4 bg-slate-800 rounded w-24" />
              <div className="h-4 bg-slate-800 rounded w-20" />
              <div className="h-4 bg-slate-800 rounded w-28" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── Main Render ───────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <TrendingUp className="text-violet-500" size={28} />
            Exam Results
          </h1>
          <p className="text-muted-foreground mt-1">
            Review, grade, edit, delete and publish student examination results.
          </p>
        </div>
        <button
          onClick={handlePublishAll}
          className="px-4 py-2.5 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-semibold text-xs rounded-lg flex items-center gap-2 shadow-lg shadow-violet-600/20 transition-all uppercase tracking-wider"
        >
          <Award size={15} /> Publish All Results
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Search by student name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
          />
        </div>

        {/* Exam Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <select
            value={examFilter}
            onChange={(e) => setExamFilter(e.target.value)}
            className="appearance-none pl-9 pr-8 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all cursor-pointer"
          >
            <option value="ALL">All Exams</option>
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>{exam.title}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
          {['ALL', 'PENDING', 'COMPLETED', 'GRADED', 'PUBLISHED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                statusFilter === status
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Results Table */}
      <div className="glass-card rounded-xl overflow-hidden border border-slate-800/50">
        {submissions.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-4 rounded-full bg-slate-800/50 mb-4">
              <InboxIcon size={40} className="text-slate-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-300">No Submissions Found</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">
              {searchQuery || statusFilter !== 'ALL' || examFilter !== 'ALL'
                ? 'Try adjusting your filters or search query.'
                : 'No exam submissions have been recorded yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="px-5 py-4 w-10">
                    <button onClick={toggleSelectAll} className="text-slate-400 hover:text-violet-400 transition-colors">
                      {allSelected ? <CheckSquare size={16} className="text-violet-400" /> : someSelected ? <CheckSquare size={16} className="text-violet-400/50" /> : <Square size={16} />}
                    </button>
                  </th>
                  {['Student', 'Email', 'Exam', 'Score', 'Grade', 'Violations', 'Status', 'Submitted', 'Actions'].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-4">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {submissions.map((sub) => (
                  <tr key={sub.id} className={`hover:bg-slate-800/30 transition-colors group ${selectedIds.has(sub.id) ? 'bg-violet-500/5' : ''}`}>
                    <td className="px-5 py-4">
                      <button onClick={() => toggleSelect(sub.id)} className="text-slate-500 hover:text-violet-400 transition-colors">
                        {selectedIds.has(sub.id) ? <CheckSquare size={16} className="text-violet-400" /> : <Square size={16} />}
                      </button>
                    </td>
                    {/* Student */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-violet-600/20 flex items-center justify-center text-violet-400 text-xs font-bold uppercase shrink-0">
                          {sub.student?.firstName?.[0] || '?'}{sub.student?.lastName?.[0] || ''}
                        </div>
                        <span className="text-sm font-medium text-white whitespace-nowrap">
                          {sub.student?.firstName} {sub.student?.lastName}
                        </span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-5 py-4">
                      <span className="text-sm text-slate-400">{sub.student?.email || '—'}</span>
                    </td>

                    {/* Exam */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-slate-500 shrink-0" />
                        <span className="text-sm text-slate-300 max-w-[180px] truncate">{sub.exam?.title || '—'}</span>
                      </div>
                    </td>

                    {/* Score */}
                    <td className="px-5 py-4">{getScoreDisplay(sub)}</td>

                    {/* Grade */}
                    <td className="px-5 py-4">
                      <span className="text-sm font-bold text-white">{sub.grade || '—'}</span>
                      {sub.percentage != null && (
                        <span className="ml-1 text-xs text-slate-500">({sub.percentage.toFixed(1)}%)</span>
                      )}
                    </td>

                    {/* Violations */}
                    <td className="px-5 py-4">
                      {(sub.violationsCount ?? 0) > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
                          <AlertTriangle size={10} /> {sub.violationsCount}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-600">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">{getStatusBadge(sub.status)}</td>

                    {/* Submitted At */}
                    <td className="px-5 py-4">
                      <span className="text-sm text-slate-400 whitespace-nowrap">{formatDate(sub.submitTime)}</span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {/* Edit Button */}
                        <button
                          onClick={() => openEditModal(sub)}
                          title="Edit submission"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-lg transition-all shadow-lg shadow-violet-500/20"
                        >
                          <Pencil size={12} /> Edit
                        </button>

                        {/* Publish Button */}
                        {sub.status !== 'PUBLISHED' && (
                          <button
                            onClick={() => handlePublish(sub)}
                            disabled={publishing === sub.id}
                            title="Publish result to student"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                          >
                            {publishing === sub.id ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                            Publish
                          </button>
                        )}

                        {/* Delete Button */}
                        <button
                          onClick={() => openDeleteModal(sub)}
                          title="Delete submission"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600/80 hover:bg-red-500 text-white text-xs font-semibold rounded-lg transition-all shadow-lg shadow-red-500/20"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800">
            <p className="text-xs text-slate-500">
              Page <span className="text-slate-300 font-medium">{pagination.page}</span> of{' '}
              <span className="text-slate-300 font-medium">{pagination.totalPages}</span>{' '}
              ({pagination.total} total)
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchSubmissions(pagination.page - 1)}
                className="p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchSubmissions(pagination.page + 1)}
                className="p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Floating Bulk Action Bar ─────────────────────────────────── */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 px-6 py-3.5 bg-slate-900 border border-violet-500/30 rounded-2xl shadow-2xl shadow-violet-500/10 backdrop-blur-md">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <CheckSquare size={16} className="text-violet-400" />
            <span className="text-violet-400">{selectedIds.size}</span> submission{selectedIds.size !== 1 ? 's' : ''} selected
          </div>
          <div className="w-px h-5 bg-slate-700" />
          <button onClick={() => setSelectedIds(new Set())} className="text-xs text-slate-400 hover:text-white transition-colors">Clear</button>
          <button
            onClick={handleBulkPublish}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all shadow-lg shadow-emerald-500/20"
          >
            <Award size={14} /> Publish {selectedIds.size} Selected
          </button>
          <button
            onClick={() => setShowBulkDeleteModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-all shadow-lg shadow-red-500/20"
          >
            <Trash2 size={14} /> Delete {selectedIds.size} Selected
          </button>
        </div>
      )}

      {/* ── Bulk Delete Confirm Modal ────────────────────────────────── */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !bulkDeleting && setShowBulkDeleteModal(false)} />
          <div className="relative bg-slate-900 border border-red-500/30 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800 bg-red-500/5">
              <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400"><AlertOctagon size={22} /></div>
              <div>
                <h2 className="text-lg font-bold text-white">Delete {selectedIds.size} Submissions?</h2>
                <p className="text-xs text-slate-400">This permanently deletes all selected student submission records and their answers.</p>
              </div>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-slate-400">This action <span className="text-red-400 font-semibold">cannot be undone</span>. All answers, auto-evaluation logs, and manual grading records for the selected submissions will be permanently wiped.</p>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800">
              <button onClick={() => !bulkDeleting && setShowBulkDeleteModal(false)} disabled={bulkDeleting} className="px-4 py-2.5 text-sm text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50">Cancel</button>
              <button onClick={handleBulkDelete} disabled={bulkDeleting} className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-red-500/20 disabled:opacity-50">
                {bulkDeleting ? <><Loader2 size={15} className="animate-spin" /> Deleting...</> : <><Trash2 size={15} /> Delete All {selectedIds.size}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Edit / Modify Modal ──────────────────────────────────────── */}
      {editModalOpen && editSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !saving && setEditModalOpen(false)} />
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-violet-600/10 to-transparent">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
                  <Pencil size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Edit Submission</h2>
                  <p className="text-xs text-slate-400">
                    {editSubmission.student?.firstName} {editSubmission.student?.lastName} · {editSubmission.exam?.title}
                  </p>
                </div>
              </div>
              <button onClick={() => !saving && setEditModalOpen(false)} className="p-2 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-6 space-y-5">
              {/* Score & Percentage row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">Total Score</label>
                  <input
                    type="number"
                    min="0"
                    value={editScore}
                    onChange={(e) => setEditScore(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                    placeholder="Score..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">Percentage (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editPercentage}
                    onChange={(e) => setEditPercentage(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                    placeholder="e.g. 85.5"
                  />
                </div>
              </div>

              {/* Grade & Status row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">Grade</label>
                  <select
                    value={editGrade}
                    onChange={(e) => setEditGrade(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                  >
                    <option value="">— None —</option>
                    {['A+', 'A', 'B', 'C', 'D', 'F'].map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="GRADED">Graded</option>
                    <option value="PUBLISHED">Published</option>
                  </select>
                </div>
              </div>

              {/* Pass/Fail Preview */}
              {editScore && !isNaN(parseFloat(editScore)) && editSubmission.exam?.passingMarks && (
                <div className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm ${parseFloat(editScore) >= editSubmission.exam.passingMarks ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
                  {parseFloat(editScore) >= editSubmission.exam.passingMarks
                    ? <><CheckCircle2 size={14} /> Score meets the passing threshold of {editSubmission.exam.passingMarks}</>
                    : <><AlertTriangle size={14} /> Score is below the passing threshold of {editSubmission.exam.passingMarks}</>
                  }
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800 bg-slate-900/50">
              <button
                onClick={() => !saving && setEditModalOpen(false)}
                disabled={saving}
                className="px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-violet-500/20 disabled:opacity-50"
              >
                {saving ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : <><CheckCircle2 size={15} /> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Confirmation Modal ─────────────────────────────────── */}
      {deleteModalOpen && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !deleting && setDeleteModalOpen(false)} />
          <div className="relative bg-slate-900 border border-red-500/30 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800 bg-red-500/5">
              <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400">
                <AlertOctagon size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Delete Submission?</h2>
                <p className="text-xs text-slate-400">This action cannot be undone.</p>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              <div className="bg-slate-800/50 rounded-xl p-4 space-y-2 border border-slate-700/50">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Student</span>
                  <span className="text-white font-medium">{deleteTarget.student?.firstName} {deleteTarget.student?.lastName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Email</span>
                  <span className="text-slate-300">{deleteTarget.student?.email}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Exam</span>
                  <span className="text-slate-300 max-w-[200px] text-right truncate">{deleteTarget.exam?.title}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Score</span>
                  <span className="text-slate-300">{deleteTarget.totalScore} / {deleteTarget.exam?.passingMarks}</span>
                </div>
              </div>
              <p className="text-sm text-slate-400 mt-4">
                Deleting this submission will permanently remove all associated answers and scores. Are you sure?
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800">
              <button
                onClick={() => !deleting && setDeleteModalOpen(false)}
                disabled={deleting}
                className="px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-red-500/20 disabled:opacity-50"
              >
                {deleting ? <><Loader2 size={15} className="animate-spin" /> Deleting...</> : <><Trash2 size={15} /> Delete Submission</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;
