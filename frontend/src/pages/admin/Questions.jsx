import React, { useEffect, useState, useCallback } from "react";
import api from "../../services/api";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  HelpCircle,
  AlertTriangle,
  Loader2,
  Filter,
  Layers,
  Award,
  BookOpen,
  Download,
  CheckSquare,
  Square,
  AlertOctagon,
} from "lucide-react";
import toast from "react-hot-toast";

export const Questions = () => {
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");
  const [filterSubject, setFilterSubject] = useState("");

  // Bulk select state
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  // AI states
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFormData, setAiFormData] = useState({
    topic: "",
    difficulty: "MEDIUM",
    type: "MCQ",
    count: 3,
    subjectId: "",
  });
  const [aiPreviewQuestions, setAiPreviewQuestions] = useState([]);

  // Form States
  const [formData, setFormData] = useState({
    type: "MCQ",
    content: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    correctAnswersList: [],
    explanation: "",
    score: "5.0",
    negativeMarks: "0.0",
    difficulty: "MEDIUM",
    subjectId: "",
    tagsString: "",
  });

  const handleGenerateAI = async (e) => {
    e.preventDefault();
    if (!aiFormData.topic || !aiFormData.subjectId) {
      toast.error("Topic and Department are required for AI generation.");
      return;
    }

    setAiLoading(true);
    setAiPreviewQuestions([]);
    try {
      const res = await api.post("/questions/generate-ai", {
        topic: aiFormData.topic,
        difficulty: aiFormData.difficulty,
        type: aiFormData.type,
        count: Number(aiFormData.count),
        departmentId: aiFormData.subjectId,
      });
      setAiPreviewQuestions(res.data.data || []);
      toast.success(
        "AI successfully generated candidate questions! Please review them.",
      );
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Failed to generate questions. Verify GEMINI_API_KEY.",
      );
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveAIQuestions = async () => {
    if (aiPreviewQuestions.length === 0) return;
    setSubmitting(true);
    try {
      for (const q of aiPreviewQuestions) {
        const body = {
          type: q.type,
          content: q.content,
          options: q.options,
          answers: q.answers,
          explanation: q.explanation,
          score: Number(q.score) || 5.0,
          negativeMarks: Number(q.negativeMarks) || 0.0,
          difficulty: q.difficulty,
          tags: q.tags || [],
          departmentId: q.departmentId || q.subjectId,
        };
        await api.post("/questions", body);
      }
      toast.success(
        "Successfully imported all AI generated questions into the bank!",
      );
      setShowAIModal(false);
      setAiPreviewQuestions([]);
      fetchQuestions();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to import AI questions.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Formats and exports the active questions list as a CSV file compatible with MS Excel
  const handleExportCSV = () => {
    if (questions.length === 0) {
      toast.error("No questions available to export.");
      return;
    }

    const headers = [
      "Type",
      "Content",
      "Options",
      "Answers",
      "Explanation",
      "Score",
      "NegativeMarks",
      "Difficulty",
      "Tags",
      "DepartmentName",
      "DepartmentCode",
    ];
    // Map individual questions attributes to rows and wrap values in quotes to escape delimiters
    const rows = questions.map((q) => {
      const optionsStr = Array.isArray(q.options) ? q.options.join("; ") : "";
      const answersStr = Array.isArray(q.answers)
        ? q.answers.join("; ")
        : typeof q.answers === "object"
          ? JSON.stringify(q.answers)
          : String(q.answers);
      const tagsStr = Array.isArray(q.tags) ? q.tags.join(", ") : "";

      return [
        q.type,
        q.content,
        optionsStr,
        answersStr,
        q.explanation || "",
        q.score,
        q.negativeMarks,
        q.difficulty,
        tagsStr,
        q.department?.name || "",
        q.department?.code || "",
      ].map((val) => `"${String(val).replace(/"/g, '""')}"`);
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `question_bank_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV Export downloaded successfully!");
  };

  // Generates and downloads a complete JSON representation of the question database for backups
  const handleExportJSON = () => {
    if (questions.length === 0) {
      toast.error("No questions available to export.");
      return;
    }

    const jsonContent = JSON.stringify(questions, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `question_bank_backup_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("JSON Backup downloaded successfully!");
  };

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

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (filterType) params.append("type", filterType);
      if (filterDifficulty) params.append("difficulty", filterDifficulty);
      if (filterSubject) params.append("departmentId", filterSubject);

      const res = await api.get(`/questions?${params.toString()}`);
      setQuestions(res.data.data || []);
    } catch {
      toast.error("Failed to retrieve question bank.");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filterType, filterDifficulty, filterSubject]);

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.content || !formData.subjectId) {
      toast.error("Content and Department are required fields.");
      return;
    }

    setSubmitting(true);
    try {
      // Build options & answers payload based on question type
      let payloadOptions = null;
      let payloadAnswers = [];

      if (formData.type === "MCQ") {
        payloadOptions = formData.options.filter((o) => o.trim() !== "");
        payloadAnswers = [formData.correctAnswer || payloadOptions[0] || ""];
      } else if (formData.type === "TRUE_FALSE") {
        payloadOptions = ["True", "False"];
        payloadAnswers = [formData.correctAnswer || "True"];
      } else if (
        formData.type === "FILL_BLANK" ||
        formData.type === "DESCRIPTIVE"
      ) {
        payloadOptions = null;
        payloadAnswers = [formData.correctAnswer || ""];
      } else if (formData.type === "CODING") {
        payloadOptions = [];
        payloadAnswers = { testCases: [{ input: "5", expectedOutput: "25" }] }; // Default placeholder testcase
      }

      const body = {
        type: formData.type,
        content: formData.content,
        options: payloadOptions,
        answers: payloadAnswers,
        explanation: formData.explanation || null,
        score: parseFloat(formData.score) || 1.0,
        negativeMarks: parseFloat(formData.negativeMarks) || 0.0,
        difficulty: formData.difficulty,
        tags: formData.tagsString
          ? formData.tagsString.split(",").map((t) => t.trim())
          : [],
        departmentId: formData.subjectId,
      };

      await api.post("/questions", body);
      toast.success("Question created successfully!");
      setShowCreateModal(false);
      resetForm();
      fetchQuestions();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create question.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!selectedQuestion) return;

    setSubmitting(true);
    try {
      let payloadOptions = null;
      let payloadAnswers = [];

      if (formData.type === "MCQ") {
        payloadOptions = formData.options.filter((o) => o.trim() !== "");
        payloadAnswers = [formData.correctAnswer || payloadOptions[0] || ""];
      } else if (formData.type === "TRUE_FALSE") {
        payloadOptions = ["True", "False"];
        payloadAnswers = [formData.correctAnswer || "True"];
      } else if (
        formData.type === "FILL_BLANK" ||
        formData.type === "DESCRIPTIVE"
      ) {
        payloadOptions = null;
        payloadAnswers = [formData.correctAnswer || ""];
      } else if (formData.type === "CODING") {
        payloadOptions = [];
        payloadAnswers = selectedQuestion.answers || { testCases: [] };
      }

      const body = {
        type: formData.type,
        content: formData.content,
        options: payloadOptions,
        answers: payloadAnswers,
        explanation: formData.explanation || null,
        score: parseFloat(formData.score) || 1.0,
        negativeMarks: parseFloat(formData.negativeMarks) || 0.0,
        difficulty: formData.difficulty,
        tags: formData.tagsString
          ? formData.tagsString.split(",").map((t) => t.trim())
          : [],
        departmentId: formData.subjectId,
      };

      await api.put(`/questions/${selectedQuestion.id}`, body);
      toast.success("Question updated successfully!");
      setShowEditModal(false);
      setSelectedQuestion(null);
      fetchQuestions();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update question.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedQuestion) return;
    setSubmitting(true);
    try {
      await api.delete(`/questions/${selectedQuestion.id}`);
      toast.success("Question deleted successfully!");
      setShowDeleteModal(false);
      setSelectedQuestion(null);
      fetchQuestions();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete question.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      type: "MCQ",
      content: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      correctAnswersList: [],
      explanation: "",
      score: "5.0",
      negativeMarks: "0.0",
      difficulty: "MEDIUM",
      subjectId: subjects[0]?.id || "",
      tagsString: "",
    });
  };

  const openEditModal = (q) => {
    setSelectedQuestion(q);
    const existingOptions = Array.isArray(q.options)
      ? [...q.options]
      : ["", "", "", ""];
    while (existingOptions.length < 4) existingOptions.push("");

    let correctVal = "";
    if (Array.isArray(q.answers) && q.answers.length > 0) {
      correctVal = q.answers[0];
    } else if (typeof q.answers === "string") {
      correctVal = q.answers;
    }

    let tagsText = "";
    if (Array.isArray(q.tags)) {
      tagsText = q.tags.join(", ");
    } else if (q.tags && typeof q.tags === "object") {
      tagsText = Object.values(q.tags).join(", ");
    }

    setFormData({
      type: q.type,
      content: q.content,
      options: existingOptions,
      correctAnswer: correctVal,
      correctAnswersList: [],
      explanation: q.explanation || "",
      score: String(q.score),
      negativeMarks: String(q.negativeMarks),
      difficulty: q.difficulty,
      subjectId: q.departmentId || q.subjectId,
      tagsString: tagsText,
    });
    setShowEditModal(true);
  };

  // ── Bulk select helpers ────────────────────────────────────────────────
  const allSelected =
    questions.length > 0 && questions.every((q) => selectedIds.has(q.id));
  const someSelected =
    questions.some((q) => selectedIds.has(q.id)) && !allSelected;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(questions.map((q) => q.id)));
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
      await api.delete("/questions/bulk", {
        data: { ids: Array.from(selectedIds) },
      });
      toast.success(`Deleted ${selectedIds.size} question(s) successfully!`);
      setSelectedIds(new Set());
      setShowBulkDeleteModal(false);
      fetchQuestions();
    } catch (err) {
      toast.error(err.response?.data?.message || "Bulk delete failed.");
    } finally {
      setBulkDeleting(false);
    }
  };

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case "EASY":
        return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
      case "HARD":
        return "bg-red-500/10 border-red-500/20 text-red-400";
      default:
        return "bg-amber-500/10 border-amber-500/20 text-amber-400";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "MCQ":
        return "bg-violet-500/10 text-violet-400 border border-violet-500/20";
      case "CODING":
        return "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20";
      case "TRUE_FALSE":
        return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      default:
        return "bg-slate-800 text-slate-300 border border-slate-700";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Questions Bank
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Create and organize questions across different subject modules.
          </p>
        </div>
        <div className="flex gap-2 relative">
          <div className="relative group">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg text-sm transition-all border border-slate-750">
              <Download size={18} />
              Export
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-lg shadow-xl hidden group-hover:block hover:block z-10">
              <button
                onClick={handleExportCSV}
                className="w-full text-left px-4 py-2 text-xs hover:bg-slate-800 text-slate-300 rounded-t-lg transition-all border-b border-slate-850"
              >
                Export as CSV (for Excel)
              </button>
              <button
                onClick={handleExportJSON}
                className="w-full text-left px-4 py-2 text-xs hover:bg-slate-800 text-slate-300 rounded-b-lg transition-all"
              >
                Export as JSON (Backup)
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              setAiFormData((prev) => ({
                ...prev,
                subjectId: subjects[0]?.id || "",
              }));
              setAiPreviewQuestions([]);
              setShowAIModal(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-sm transition-all shadow-lg shadow-emerald-600/20"
          >
            <Layers size={18} />
            Generate with AI
          </button>

          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-lg text-sm transition-all shadow-lg shadow-violet-600/20"
          >
            <Plus size={18} />
            Add Question
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search */}
        <div className="relative lg:col-span-2">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="text"
            placeholder="Search questions content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500"
          />
        </div>

        {/* Type Filter */}
        <div className="relative">
          <Filter
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500 appearance-none"
          >
            <option value="">All Types</option>
            <option value="MCQ">MCQ</option>
            <option value="TRUE_FALSE">True / False</option>
            <option value="FILL_BLANK">Fill in Blank</option>
            <option value="DESCRIPTIVE">Descriptive</option>
            <option value="CODING">Coding</option>
          </select>
        </div>

        {/* Difficulty Filter */}
        <div className="relative">
          <Award
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500 appearance-none"
          >
            <option value="">All Difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>

        {/* Department Filter */}
        <div className="relative">
          <BookOpen
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500 appearance-none"
          >
            <option value="">All Departments</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name} ({sub.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-slate-900/80 border border-slate-800/50 rounded-xl overflow-hidden">
        {loading ? (
          <div className="animate-pulse p-6 space-y-4">
            <div className="h-6 bg-slate-850 rounded w-1/3" />
            <div className="space-y-3 pt-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 bg-slate-850 rounded" />
              ))}
            </div>
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-20">
            <HelpCircle size={36} className="mx-auto text-slate-700 mb-3" />
            <h3 className="text-lg font-semibold text-slate-300">
              No Questions Found
            </h3>
            <p className="text-sm text-slate-500">
              Create new questions or adjust search filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-850">
                  {/* Select All checkbox */}
                  <th className="px-4 py-4 w-10">
                    <button
                      onClick={toggleSelectAll}
                      className="text-slate-400 hover:text-violet-400 transition-colors"
                    >
                      {allSelected ? (
                        <CheckSquare size={16} className="text-violet-400" />
                      ) : someSelected ? (
                        <CheckSquare size={16} className="text-violet-400/50" />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase px-6 py-4">
                    Content
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase px-6 py-4">
                    Type
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase px-6 py-4">
                    Department
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase px-6 py-4">
                    Difficulty
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase px-6 py-4">
                    Marks
                  </th>
                  <th className="text-right text-xs font-semibold text-slate-400 uppercase px-6 py-4">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q) => (
                  <tr
                    key={q.id}
                    className={`border-b border-slate-850 hover:bg-slate-800/35 transition-colors ${selectedIds.has(q.id) ? "bg-violet-500/5" : ""}`}
                  >
                    <td className="px-4 py-4">
                      <button
                        onClick={() => toggleSelect(q.id)}
                        className="text-slate-500 hover:text-violet-400 transition-colors"
                      >
                        {selectedIds.has(q.id) ? (
                          <CheckSquare size={16} className="text-violet-400" />
                        ) : (
                          <Square size={16} />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 font-medium text-white max-w-md truncate">
                      {q.content}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-semibold ${getTypeColor(q.type)}`}
                      >
                        {q.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {q.department?.name || "Unknown"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-semibold border ${getDifficultyColor(q.difficulty)}`}
                      >
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">{q.score} pts</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(q)}
                          className="p-1.5 hover:bg-violet-500/10 text-slate-400 hover:text-violet-400 rounded transition-all"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedQuestion(q);
                            setShowDeleteModal(true);
                          }}
                          className="p-1.5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded transition-all"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Floating Bulk Action Bar ─────────────────────────────────── */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 px-6 py-3.5 bg-slate-900 border border-violet-500/30 rounded-2xl shadow-2xl shadow-violet-500/10 backdrop-blur-md">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <CheckSquare size={16} className="text-violet-400" />
            <span className="text-violet-400">{selectedIds.size}</span> question
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
                  Delete {selectedIds.size} Questions?
                </h2>
                <p className="text-xs text-slate-400">
                  This permanently removes all selected questions and unlinks
                  them from any exams.
                </p>
              </div>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-slate-400">
                This action{" "}
                <span className="text-red-400 font-semibold">
                  cannot be undone
                </span>
                . All selected questions will be permanently deleted from the
                question bank and removed from all associated exams.
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
          <div className="relative w-full max-w-2xl mx-4 bg-slate-900 border border-slate-800 rounded-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">Create Question</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
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
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white"
                  >
                    <option value="MCQ">MCQ</option>
                    <option value="TRUE_FALSE">True / False</option>
                    <option value="FILL_BLANK">Fill Blank</option>
                    <option value="DESCRIPTIVE">Descriptive</option>
                    <option value="CODING">Coding</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Question Content
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  rows={4}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500"
                  required
                />
              </div>

              {/* Dynamic options for MCQ */}
              {formData.type === "MCQ" && (
                <div className="space-y-3 p-3 bg-slate-950 border border-slate-850 rounded-lg">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Answer Choices Options
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    {formData.options.map((opt, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <span className="text-xs font-mono font-bold text-slate-500">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const newOptions = [...formData.options];
                            newOptions[i] = e.target.value;
                            setFormData({ ...formData, options: newOptions });
                          }}
                          className="flex-1 p-2 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                          placeholder={`Option ${i + 1}`}
                          required={i < 2}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Correct answers inputs */}
              {formData.type !== "CODING" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Correct Answer
                  </label>
                  {formData.type === "MCQ" ? (
                    <select
                      value={formData.correctAnswer}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          correctAnswer: e.target.value,
                        })
                      }
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white"
                    >
                      <option value="">Select Correct Option</option>
                      {formData.options.map((opt, idx) =>
                        opt ? (
                          <option key={idx} value={opt}>
                            {opt}
                          </option>
                        ) : null,
                      )}
                    </select>
                  ) : formData.type === "TRUE_FALSE" ? (
                    <select
                      value={formData.correctAnswer}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          correctAnswer: e.target.value,
                        })
                      }
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white"
                    >
                      <option value="True">True</option>
                      <option value="False">False</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={formData.correctAnswer}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          correctAnswer: e.target.value,
                        })
                      }
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white"
                      placeholder="Input the correct answer string value..."
                    />
                  )}
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Score Points
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.score}
                    onChange={(e) =>
                      setFormData({ ...formData, score: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Negative Marks
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.negativeMarks}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        negativeMarks: e.target.value,
                      })
                    }
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Difficulty
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) =>
                      setFormData({ ...formData, difficulty: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Tags (Comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tagsString}
                  onChange={(e) =>
                    setFormData({ ...formData, tagsString: e.target.value })
                  }
                  placeholder="stack, algorithms, mid-sem"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Explanation (Optional)
                </label>
                <textarea
                  value={formData.explanation}
                  onChange={(e) =>
                    setFormData({ ...formData, explanation: e.target.value })
                  }
                  rows={2}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none"
                />
              </div>

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
                  Submit Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════ EDIT MODAL ═══════════════ */}
      {showEditModal && selectedQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowEditModal(false)}
          />
          <div className="relative w-full max-w-2xl mx-4 bg-slate-900 border border-slate-800 rounded-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">Edit Question</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
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
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white"
                  >
                    <option value="MCQ">MCQ</option>
                    <option value="TRUE_FALSE">True / False</option>
                    <option value="FILL_BLANK">Fill Blank</option>
                    <option value="DESCRIPTIVE">Descriptive</option>
                    <option value="CODING">Coding</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Question Content
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  rows={4}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500"
                  required
                />
              </div>

              {formData.type === "MCQ" && (
                <div className="space-y-3 p-3 bg-slate-950 border border-slate-850 rounded-lg">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Answer Choices Options
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    {formData.options.map((opt, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <span className="text-xs font-mono font-bold text-slate-500">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const newOptions = [...formData.options];
                            newOptions[i] = e.target.value;
                            setFormData({ ...formData, options: newOptions });
                          }}
                          className="flex-1 p-2 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                          placeholder={`Option ${i + 1}`}
                          required={i < 2}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {formData.type !== "CODING" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Correct Answer
                  </label>
                  {formData.type === "MCQ" ? (
                    <select
                      value={formData.correctAnswer}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          correctAnswer: e.target.value,
                        })
                      }
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white"
                    >
                      <option value="">Select Correct Option</option>
                      {formData.options.map((opt, idx) =>
                        opt ? (
                          <option key={idx} value={opt}>
                            {opt}
                          </option>
                        ) : null,
                      )}
                    </select>
                  ) : formData.type === "TRUE_FALSE" ? (
                    <select
                      value={formData.correctAnswer}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          correctAnswer: e.target.value,
                        })
                      }
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white"
                    >
                      <option value="True">True</option>
                      <option value="False">False</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={formData.correctAnswer}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          correctAnswer: e.target.value,
                        })
                      }
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white"
                    />
                  )}
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Score Points
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.score}
                    onChange={(e) =>
                      setFormData({ ...formData, score: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Negative Marks
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.negativeMarks}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        negativeMarks: e.target.value,
                      })
                    }
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Difficulty
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) =>
                      setFormData({ ...formData, difficulty: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Tags (Comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tagsString}
                  onChange={(e) =>
                    setFormData({ ...formData, tagsString: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Explanation (Optional)
                </label>
                <textarea
                  value={formData.explanation}
                  onChange={(e) =>
                    setFormData({ ...formData, explanation: e.target.value })
                  }
                  rows={2}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none"
                />
              </div>

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

      {/* ═══════════════ DELETE CONFIRMATION MODAL ═══════════════ */}
      {showDeleteModal && selectedQuestion && (
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
              <h2 className="text-lg font-bold text-white">Delete Question</h2>
              <p className="text-sm text-slate-400 mt-2">
                Are you sure you want to permanently delete this question? This
                action cannot be undone.
              </p>
            </div>

            <div className="bg-slate-950/50 border border-slate-800/50 rounded-lg p-3 text-left">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Question Content Preview
              </p>
              <p className="text-xs text-slate-300 font-mono truncate">
                {selectedQuestion.content}
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
                Delete Question
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ AI GENERATOR MODAL ═══════════════ */}
      {showAIModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAIModal(false)}
          />
          <div className="relative w-full max-w-2xl mx-4 bg-slate-900 border border-slate-800 rounded-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="text-emerald-400" />
                Generate Questions with Gemini AI
              </h3>
              <button
                onClick={() => setShowAIModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleGenerateAI} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Department
                  </label>
                  <select
                    value={aiFormData.subjectId}
                    onChange={(e) =>
                      setAiFormData({
                        ...aiFormData,
                        subjectId: e.target.value,
                      })
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
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Question Type
                  </label>
                  <select
                    value={aiFormData.type}
                    onChange={(e) =>
                      setAiFormData({ ...aiFormData, type: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white"
                  >
                    <option value="MCQ">MCQ</option>
                    <option value="TRUE_FALSE">True / False</option>
                    <option value="FILL_BLANK">Fill Blank</option>
                    <option value="DESCRIPTIVE">Descriptive</option>
                    <option value="CODING">Coding</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Difficulty
                  </label>
                  <select
                    value={aiFormData.difficulty}
                    onChange={(e) =>
                      setAiFormData({
                        ...aiFormData,
                        difficulty: e.target.value,
                      })
                    }
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Questions Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={aiFormData.count}
                    onChange={(e) =>
                      setAiFormData({
                        ...aiFormData,
                        count: Number(e.target.value),
                      })
                    }
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  AI Topic / Syllabus Details
                </label>
                <input
                  type="text"
                  placeholder="e.g. Binary Search Tree Insertion, REST API Principles, SQL Joins..."
                  value={aiFormData.topic}
                  onChange={(e) =>
                    setAiFormData({ ...aiFormData, topic: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={aiLoading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold flex justify-center items-center gap-2 transition-all"
              >
                {aiLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Generating questions with AI model...
                  </>
                ) : (
                  <>
                    <Layers size={16} />
                    Generate Questions
                  </>
                )}
              </button>
            </form>

            {/* AI Preview Section */}
            {aiPreviewQuestions.length > 0 && (
              <div className="border-t border-slate-800 pt-4 space-y-4 max-h-[40vh] overflow-y-auto">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Generated Questions Preview
                </span>
                <div className="space-y-3">
                  {aiPreviewQuestions.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-slate-950 border border-slate-850 rounded-lg space-y-2"
                    >
                      <div className="flex justify-between items-center text-[10px] text-slate-500">
                        <span className="font-semibold text-slate-400">
                          Question {idx + 1} ({q.type})
                        </span>
                        <span className="text-emerald-400">
                          +{q.score} Points
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed font-semibold">
                        {q.content}
                      </p>
                      {q.options && q.options.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 pl-2">
                          {q.options.map((opt, i) => (
                            <span
                              key={i}
                              className="text-[10px] text-slate-500 font-mono"
                            >
                              {String.fromCharCode(65 + i)}. {opt}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-[10px] text-slate-400">
                        <strong className="text-slate-500">Answer:</strong>{" "}
                        {Array.isArray(q.answers)
                          ? q.answers.join(", ")
                          : typeof q.answers === "object"
                            ? "Predefined Test Cases"
                            : q.answers}
                      </p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleSaveAIQuestions}
                  disabled={submitting}
                  className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-semibold flex justify-center items-center gap-2 shadow-lg"
                >
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  Import All {aiPreviewQuestions.length} Questions
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Questions;
