import React, { useEffect, useState, useCallback } from "react";
import api from "../../services/api";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  ClipboardList,
  AlertTriangle,
  Loader2,
  Calendar,
  Clock,
  FileText,
  UserCheck,
  CheckSquare,
  Square,
  AlertOctagon,
} from "lucide-react";
import toast from "react-hot-toast";

export const ExamsPortal = () => {
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusTab, setStatusTab] = useState("ALL");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);

  // Bulk Select States
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructions: "",
    duration: "30",
    passingMarks: "10.0",
    allowNegativeMarking: false,
    shuffleQuestions: false,
    shuffleOptions: false,
    fullscreenRequired: true,
    startTime: "",
    endTime: "",
    subjectId: "",
    selectedQuestions: [],
  });

  const [assignedStudentIds, setAssignedStudentIds] = useState([]);
  const [assignedEmails, setAssignedEmails] = useState("");

  const fetchSubjects = async () => {
    try {
      const res = await api.get("/departments");
      setSubjects(res.data.data || []);
      if (res.data.data?.length > 0 && !formData.subjectId) {
        setFormData((prev) => ({ ...prev, subjectId: res.data.data[0].id }));
      }
    } catch {
      // ignore
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await api.get("/users?limit=1000");
      setStudents(res.data.data.students || []);
    } catch {
      // ignore
    }
  };

  const fetchQuestionsForSubject = async (subjId) => {
    if (!subjId) return;
    try {
      const res = await api.get(`/questions?departmentId=${subjId}`);
      setQuestions(res.data.data || []);
    } catch {
      setQuestions([]);
    }
  };

  const fetchExams = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/exams");
      setExams(res.data.data || []);
    } catch {
      toast.error("Failed to retrieve exams list.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
    fetchStudents();
    fetchExams();
  }, [fetchExams]);

  // Load questions when subject selection changes inside form
  useEffect(() => {
    if (formData.subjectId) {
      fetchQuestionsForSubject(formData.subjectId);
    }
  }, [formData.subjectId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (
      !formData.title ||
      !formData.startTime ||
      !formData.endTime ||
      !formData.subjectId
    ) {
      toast.error("Required fields are missing.");
      return;
    }

    setSubmitting(true);
    try {
      const body = {
        title: formData.title,
        description: formData.description,
        instructions: formData.instructions,
        duration: parseInt(formData.duration),
        passingMarks: parseFloat(formData.passingMarks),
        allowNegativeMarking: formData.allowNegativeMarking,
        shuffleQuestions: formData.shuffleQuestions,
        shuffleOptions: formData.shuffleOptions,
        fullscreenRequired: formData.fullscreenRequired,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        departmentId: formData.subjectId,
        questionIds: formData.selectedQuestions,
      };

      await api.post("/exams", body);
      toast.success("Exam created successfully!");
      setShowCreateModal(false);
      resetForm();
      fetchExams();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create exam.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!selectedExam) return;

    setSubmitting(true);
    try {
      const body = {
        title: formData.title,
        description: formData.description,
        instructions: formData.instructions,
        duration: parseInt(formData.duration),
        passingMarks: parseFloat(formData.passingMarks),
        allowNegativeMarking: formData.allowNegativeMarking,
        shuffleQuestions: formData.shuffleQuestions,
        shuffleOptions: formData.shuffleOptions,
        fullscreenRequired: formData.fullscreenRequired,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        departmentId: formData.subjectId,
        questionIds: formData.selectedQuestions,
      };

      await api.put(`/exams/${selectedExam.id}`, body);
      toast.success("Exam updated successfully!");
      setShowEditModal(false);
      setSelectedExam(null);
      fetchExams();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update exam.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedExam) return;
    setSubmitting(true);
    try {
      await api.delete(`/exams/${selectedExam.id}`);
      toast.success("Exam deleted successfully!");
      setShowDeleteModal(false);
      setSelectedExam(null);
      fetchExams();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete exam.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublish = async (exam) => {
    try {
      await api.put(`/exams/${exam.id}`, { status: "PUBLISHED" });
      toast.success(`Exam "${exam.title}" published successfully!`);
      fetchExams();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to publish exam.");
    }
  };

  const handleAssignStudents = async (e) => {
    e.preventDefault();
    if (!selectedExam) return;

    setSubmitting(true);
    try {
      await api.post("/exams/assign", {
        examId: selectedExam.id,
        emails: assignedEmails,
      });
      toast.success("Students assigned successfully!");
      setShowAssignModal(false);
      setSelectedExam(null);
      fetchExams();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to assign students.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      instructions: "",
      duration: "30",
      passingMarks: "10.0",
      allowNegativeMarking: false,
      shuffleQuestions: false,
      shuffleOptions: false,
      fullscreenRequired: true,
      startTime: "",
      endTime: "",
      subjectId: subjects[0]?.id || "",
      selectedQuestions: [],
    });
    setQuestions([]);
  };

  const openEditModal = (exam) => {
    setSelectedExam(exam);
    const parseLocalTime = (isoStr) => {
      const date = new Date(isoStr);
      const pad = (n) => String(n).padStart(2, "0");
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    setFormData({
      title: exam.title,
      description: exam.description || "",
      instructions: exam.instructions || "",
      duration: String(exam.duration),
      passingMarks: String(exam.passingMarks),
      allowNegativeMarking: exam.allowNegativeMarking,
      shuffleQuestions: exam.shuffleQuestions,
      shuffleOptions: exam.shuffleOptions,
      fullscreenRequired: exam.fullscreenRequired,
      startTime: parseLocalTime(exam.startTime),
      endTime: parseLocalTime(exam.endTime),
      subjectId: exam.departmentId || exam.subjectId,
      selectedQuestions: [], // Note: will reload questions below
    });

    // Fetch questions mapped to this exam to pre-check checkboxes
    api
      .get(`/exams/${exam.id}/questions`)
      .then((res) => {
        const ids = res.data.data?.questions?.map((q) => q.id) || [];
        setFormData((prev) => ({ ...prev, selectedQuestions: ids }));
      })
      .catch(() => {});

    setShowEditModal(true);
  };

  const openAssignModal = (exam) => {
    setSelectedExam(exam);
    setAssignedStudentIds([]);
    setAssignedEmails("");
    setShowAssignModal(true);
  };

  // Toggles question inclusion status inside the exam composition form state
  const handleToggleQuestion = (qId) => {
    const current = [...formData.selectedQuestions];
    if (current.includes(qId)) {
      setFormData({
        ...formData,
        selectedQuestions: current.filter((id) => id !== qId),
      });
    } else {
      setFormData({ ...formData, selectedQuestions: [...current, qId] });
    }
  };

  // Toggles selected student ID mappings for active test enrollment
  const handleToggleStudent = (sId) => {
    const current = [...assignedStudentIds];
    if (current.includes(sId)) {
      setAssignedStudentIds(current.filter((id) => id !== sId));
    } else {
      setAssignedStudentIds([...current, sId]);
    }
  };

  const filteredExams = exams.filter((e) => {
    const matchesSearch = e.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus = statusTab === "ALL" || e.status === statusTab;
    return matchesSearch && matchesStatus;
  });

  // ── Bulk select helpers ───────────────────────────────────────────────
  const allSelected =
    filteredExams.length > 0 &&
    filteredExams.every((e) => selectedIds.has(e.id));
  const someSelected =
    filteredExams.some((e) => selectedIds.has(e.id)) && !allSelected;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredExams.map((e) => e.id)));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setBulkDeleting(true);
    try {
      await api.delete("/exams/bulk", {
        data: { ids: Array.from(selectedIds) },
      });
      toast.success(`Deleted ${selectedIds.size} exam(s) successfully!`);
      setSelectedIds(new Set());
      setShowBulkDeleteModal(false);
      fetchExams();
    } catch (err) {
      toast.error(err.response?.data?.message || "Bulk delete failed.");
    } finally {
      setBulkDeleting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
      case "COMPLETED":
        return "bg-violet-500/10 border-violet-500/20 text-violet-400";
      case "CANCELLED":
        return "bg-red-500/10 border-red-500/20 text-red-400";
      default:
        return "bg-slate-800 border-slate-700 text-slate-400";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Exams Portal
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Schedule assessments, configure policies, and assign candidate
            lists.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-lg text-sm transition-all shadow-lg shadow-violet-600/20"
        >
          <Plus size={18} />
          Create Exam
        </button>
      </div>

      {/* Tabs and Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs font-semibold">
            {["ALL", "DRAFT", "PUBLISHED", "COMPLETED"].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusTab(tab)}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  statusTab === tab
                    ? "bg-violet-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tab.charAt(0) + tab.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg text-xs text-slate-400 hover:text-white transition-all"
          >
            {allSelected ? (
              <CheckSquare size={14} className="text-violet-400" />
            ) : someSelected ? (
              <CheckSquare size={14} className="text-violet-400/50" />
            ) : (
              <Square size={14} />
            )}
            Select All
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="text"
            placeholder="Search exam title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Exams Grid */}
      {loading ? (
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-48 bg-slate-900 border border-slate-800 rounded-xl"
            />
          ))}
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="text-center py-20 bg-slate-900 border border-slate-800/40 rounded-xl">
          <ClipboardList size={36} className="mx-auto text-slate-700 mb-3" />
          <h3 className="text-lg font-semibold text-slate-300">
            No Exams Scheduled
          </h3>
          <p className="text-sm text-slate-500">
            Add an exam to begin evaluating student knowledge.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredExams.map((exam) => {
            const isSelected = selectedIds.has(exam.id);
            return (
              <div
                key={exam.id}
                className={`relative bg-slate-900/80 border rounded-xl p-5 hover:bg-slate-900 transition-all flex flex-col justify-between space-y-4 ${
                  isSelected
                    ? "border-violet-500 bg-violet-950/10 shadow-lg shadow-violet-500/5"
                    : "border-slate-800"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleSelect(exam.id)}
                        className="text-slate-500 hover:text-violet-400 transition-colors shrink-0"
                      >
                        {isSelected ? (
                          <CheckSquare size={16} className="text-violet-400" />
                        ) : (
                          <Square size={16} />
                        )}
                      </button>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(exam.status)}`}
                      >
                        {exam.status}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">
                      {exam.department?.code || "GEN"}
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-base leading-snug truncate">
                    {exam.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {exam.description || "No description provided."}
                  </p>
                </div>

                {/* Specs */}
                <div className="grid grid-cols-2 gap-3 text-xs border-y border-slate-850 py-3 text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Clock size={13} /> {exam.duration} mins
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileText size={13} /> {exam._count?.examQuestions || 0}{" "}
                    Questions
                  </div>
                  <div className="flex items-center gap-1.5">
                    <UserCheck size={13} /> {exam._count?.assignments || 0}{" "}
                    Assigned
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={13} />{" "}
                    {new Date(exam.startTime).toLocaleDateString()}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {exam.status === "DRAFT" && (
                    <button
                      onClick={() => handlePublish(exam)}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded transition-all"
                    >
                      Publish
                    </button>
                  )}
                  {exam.status === "PUBLISHED" && (
                    <button
                      onClick={() => openAssignModal(exam)}
                      className="flex-1 py-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs rounded transition-all flex items-center justify-center gap-1.5"
                    >
                      <UserCheck size={13} /> Assign Users
                    </button>
                  )}
                  <button
                    onClick={() => openEditModal(exam)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 transition-all"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedExam(exam);
                      setShowDeleteModal(true);
                    }}
                    className="p-2 bg-red-950/20 hover:bg-red-500 hover:text-white border border-red-500/20 rounded text-red-400 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Floating Bulk Action Bar ─────────────────────────────────── */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 px-6 py-3.5 bg-slate-900 border border-violet-500/30 rounded-2xl shadow-2xl shadow-violet-500/10 backdrop-blur-md">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <CheckSquare size={16} className="text-violet-400" />
            <span className="text-violet-400">{selectedIds.size}</span> exam
            {selectedIds.size !== 1 ? "s" : ""} selected
          </div>
          <div className="w-px h-5 bg-slate-700" />
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            Clear
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
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => !bulkDeleting && setShowBulkDeleteModal(false)}
          />
          <div className="relative bg-slate-900 border border-red-500/30 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800 bg-red-500/5">
              <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400">
                <AlertOctagon size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  Delete {selectedIds.size} Exams?
                </h2>
                <p className="text-xs text-slate-400">
                  This permanently deletes all selected exams, assignments,
                  questions mappings, and student submissions.
                </p>
              </div>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-slate-400">
                This action{" "}
                <span className="text-red-400 font-semibold">
                  cannot be undone
                </span>
                . All associated settings, question assignments, user mappings,
                and submission records for the selected exams will be
                permanently deleted.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800">
              <button
                onClick={() => !bulkDeleting && setShowBulkDeleteModal(false)}
                disabled={bulkDeleting}
                className="px-4 py-2.5 text-sm text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-red-500/20 disabled:opacity-50"
              >
                {bulkDeleting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={15} /> Delete All {selectedIds.size}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ CREATE MODAL ═══════════════ */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          />
          <div className="relative w-full max-w-3xl mx-4 bg-slate-900 border border-slate-800 rounded-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">
                Create Examination Schedule
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                    Exam Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white"
                    placeholder="E.g., Algorithms Semester Examination"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                    Department
                  </label>
                  <select
                    value={formData.subjectId}
                    onChange={(e) =>
                      setFormData({ ...formData, subjectId: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white"
                    required
                  >
                    <option value="">Select Department</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                    Scheduled Start Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                    Scheduled End Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 p-3 bg-slate-950 border border-slate-850 rounded-lg text-xs">
                <label className="flex items-center gap-2 text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.fullscreenRequired}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fullscreenRequired: e.target.checked,
                      })
                    }
                    className="rounded border-slate-800 text-violet-600 bg-slate-900"
                  />
                  Fullscreen Lock
                </label>
                <label className="flex items-center gap-2 text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.shuffleQuestions}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shuffleQuestions: e.target.checked,
                      })
                    }
                    className="rounded border-slate-800 text-violet-600 bg-slate-900"
                  />
                  Shuffle Questions
                </label>
                <label className="flex items-center gap-2 text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.shuffleOptions}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shuffleOptions: e.target.checked,
                      })
                    }
                    className="rounded border-slate-800 text-violet-600 bg-slate-900"
                  />
                  Shuffle Options
                </label>
                <label className="flex items-center gap-2 text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.allowNegativeMarking}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        allowNegativeMarking: e.target.checked,
                      })
                    }
                    className="rounded border-slate-800 text-violet-600 bg-slate-900"
                  />
                  Negative Marking
                </label>
              </div>

              {/* Question Selection Checkboxes */}
              {formData.subjectId && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Select Questions ({formData.selectedQuestions.length}{" "}
                      selected)
                    </label>
                    {questions.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const allSelected = questions.every((q) =>
                            formData.selectedQuestions.includes(q.id),
                          );
                          if (allSelected) {
                            setFormData((prev) => ({
                              ...prev,
                              selectedQuestions: prev.selectedQuestions.filter(
                                (id) => !questions.some((q) => q.id === id),
                              ),
                            }));
                          } else {
                            const uniqueSelected = Array.from(
                              new Set([
                                ...formData.selectedQuestions,
                                ...questions.map((q) => q.id),
                              ]),
                            );
                            setFormData((prev) => ({
                              ...prev,
                              selectedQuestions: uniqueSelected,
                            }));
                          }
                        }}
                        className="text-[10px] font-bold text-violet-400 hover:text-violet-300 transition-colors uppercase tracking-wider"
                      >
                        {questions.every((q) =>
                          formData.selectedQuestions.includes(q.id),
                        )
                          ? "Deselect All"
                          : "Select All"}
                      </button>
                    )}
                  </div>
                  <div className="border border-slate-850 bg-slate-950 rounded-lg p-3 max-h-[150px] overflow-y-auto space-y-2">
                    {questions.length === 0 ? (
                      <p className="text-xs text-slate-600">
                        No questions available for this subject.
                      </p>
                    ) : (
                      questions.map((q) => (
                        <label
                          key={q.id}
                          className="flex items-center justify-between text-xs text-slate-300 border-b border-slate-900 pb-1.5 cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={formData.selectedQuestions.includes(
                                q.id,
                              )}
                              onChange={() => handleToggleQuestion(q.id)}
                              className="rounded border-slate-800 text-violet-600"
                            />

                            <span className="truncate max-w-[400px]">
                              {q.content}
                            </span>
                          </span>
                          <span className="font-semibold text-violet-400">
                            +{q.score} pts
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-semibold flex justify-center items-center gap-2"
                >
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  Submit Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════ EDIT MODAL ═══════════════ */}
      {showEditModal && selectedExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowEditModal(false)}
          />
          <div className="relative w-full max-w-3xl mx-4 bg-slate-900 border border-slate-800 rounded-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">Edit Examination</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                    Exam Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                    Department
                  </label>
                  <select
                    value={formData.subjectId}
                    onChange={(e) =>
                      setFormData({ ...formData, subjectId: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white"
                    required
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                    Scheduled Start Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                    Scheduled End Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 p-3 bg-slate-950 border border-slate-850 rounded-lg text-xs">
                <label className="flex items-center gap-2 text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.fullscreenRequired}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fullscreenRequired: e.target.checked,
                      })
                    }
                    className="rounded border-slate-800 text-violet-600 bg-slate-900"
                  />
                  Fullscreen Lock
                </label>
                <label className="flex items-center gap-2 text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.shuffleQuestions}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shuffleQuestions: e.target.checked,
                      })
                    }
                    className="rounded border-slate-800 text-violet-600 bg-slate-900"
                  />
                  Shuffle Questions
                </label>
                <label className="flex items-center gap-2 text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.shuffleOptions}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shuffleOptions: e.target.checked,
                      })
                    }
                    className="rounded border-slate-800 text-violet-600 bg-slate-900"
                  />
                  Shuffle Options
                </label>
                <label className="flex items-center gap-2 text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.allowNegativeMarking}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        allowNegativeMarking: e.target.checked,
                      })
                    }
                    className="rounded border-slate-800 text-violet-600 bg-slate-900"
                  />
                  Negative Marking
                </label>
              </div>

              {formData.subjectId && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Select Questions ({formData.selectedQuestions.length}{" "}
                      selected)
                    </label>
                    {questions.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const allSelected = questions.every((q) =>
                            formData.selectedQuestions.includes(q.id),
                          );
                          if (allSelected) {
                            setFormData((prev) => ({
                              ...prev,
                              selectedQuestions: prev.selectedQuestions.filter(
                                (id) => !questions.some((q) => q.id === id),
                              ),
                            }));
                          } else {
                            const uniqueSelected = Array.from(
                              new Set([
                                ...formData.selectedQuestions,
                                ...questions.map((q) => q.id),
                              ]),
                            );
                            setFormData((prev) => ({
                              ...prev,
                              selectedQuestions: uniqueSelected,
                            }));
                          }
                        }}
                        className="text-[10px] font-bold text-violet-400 hover:text-violet-300 transition-colors uppercase tracking-wider"
                      >
                        {questions.every((q) =>
                          formData.selectedQuestions.includes(q.id),
                        )
                          ? "Deselect All"
                          : "Select All"}
                      </button>
                    )}
                  </div>
                  <div className="border border-slate-855 bg-slate-955 rounded-lg p-3 max-h-[150px] overflow-y-auto space-y-2">
                    {questions.map((q) => (
                      <label
                        key={q.id}
                        className="flex items-center justify-between text-xs text-slate-300 border-b border-slate-900 pb-1.5 cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.selectedQuestions.includes(q.id)}
                            onChange={() => handleToggleQuestion(q.id)}
                            className="rounded border-slate-800 text-violet-600"
                          />

                          <span className="truncate max-w-[400px]">
                            {q.content}
                          </span>
                        </span>
                        <span className="font-semibold text-violet-400">
                          +{q.score} pts
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-semibold flex justify-center items-center gap-2"
                >
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════ ASSIGN STUDENTS MODAL ═══════════════ */}
      {showAssignModal && selectedExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAssignModal(false)}
          />
          <div className="relative w-full max-w-xl mx-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Assign Exam to Students
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedExam.title}
                </p>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAssignStudents} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Student Email Addresses
                </label>
                <textarea
                  value={assignedEmails}
                  onChange={(e) => setAssignedEmails(e.target.value)}
                  placeholder="Enter student emails separated by commas, spaces, or newlines&#10;e.g.&#10;student1@gmail.com&#10;student2@gmail.com"
                  rows={8}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all font-mono leading-relaxed"
                  required
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  You can assign multiple candidates at once. These student accounts will be automatically registered when they log in to the portal via OTP.
                </span>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-semibold flex justify-center items-center gap-2"
                >
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  Assign ({assignedStudentIds.length}) Students
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════ DELETE CONFIRMATION MODAL ═══════════════ */}
      {showDeleteModal && selectedExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(false)}
          />
          <div className="relative w-full max-w-md mx-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-full">
              <AlertTriangle size={28} className="text-red-400" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">
                Delete Assessment
              </h2>
              <p className="text-sm text-slate-400 mt-2">
                Are you sure you want to permanently delete the exam{" "}
                <span className="font-semibold text-white">
                  "{selectedExam.title}"
                </span>
                ? This action cannot be undone and will delete student results!
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={submitting}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold flex justify-center items-center gap-2"
              >
                {submitting && <Loader2 size={16} className="animate-spin" />}
                Delete Exam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamsPortal;
