import React, { useState, useEffect, useRef } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import {
  Upload,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit3,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Eye,
  RefreshCw,
  ArrowLeft,
  Sparkles,
  BookOpen,
  Tag,
  Award,
  Image as ImageIcon,
} from "lucide-react";
import { MathContent } from "../../components/common/MathContent";

/* ─────────────────────────────── helpers ─────────────────────────── */
const TYPES = ["MCQ", "MULTI_CORRECT", "TRUE_FALSE", "FILL_BLANK", "DESCRIPTIVE", "CODING"];
const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"];
const TYPE_COLORS = {
  MCQ: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  MULTI_CORRECT: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  TRUE_FALSE: "bg-teal-500/15 text-teal-300 border-teal-500/30",
  FILL_BLANK: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  DESCRIPTIVE: "bg-pink-500/15 text-pink-300 border-pink-500/30",
  CODING: "bg-orange-500/15 text-orange-300 border-orange-500/30",
};
const DIFF_COLORS = {
  EASY: "text-emerald-400",
  MEDIUM: "text-yellow-400",
  HARD: "text-red-400",
};

/* ─────────────────────────────── main component ─────────────────── */
export const QuestionImport = () => {
  /* --- state --- */
  const [step, setStep] = useState("upload"); // upload | extracting | preview | done
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState("auto");
  const [questions, setQuestions] = useState([]);
  const [selected, setSelected] = useState({});          // idx → bool
  const [editIdx, setEditIdx] = useState(null);
  const [editQ, setEditQ] = useState(null);
  const [expanded, setExpanded] = useState({});          // idx → bool
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ saved: 0, skipped: 0, failed: 0 });
  const fileRef = useRef(null);

  /* --- load subjects on mount --- */
  useEffect(() => {
    api.get("/subjects").then((r) => {
      const list = r.data?.data || [];
      setSubjects(list);
    }).catch(() => {
      // fallback: try departments endpoint
      api.get("/departments").then((r) => {
        setSubjects(r.data?.data || []);
      }).catch(() => {});
    });
  }, []);

  /* ─── STEP 1 : File Selection ─── */
  const onFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer?.files?.[0] || e.target?.files?.[0];
    if (f) setFile(f);
  };

  /* ─── STEP 2 : Extract via direct API ─── */
  const handleExtract = async () => {
    if (!file) return toast.error("Please choose a file first.");
    setStep("extracting");

    const formData = new FormData();
    formData.append("file", file);
    if (subjectId !== "auto") formData.append("subjectId", subjectId);

    try {
      // Call the new synchronous extract endpoint
      const res = await api.post("/import/extract", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 120000, // 2 minutes
      });

      const extracted = res.data?.data?.questions || [];
      if (extracted.length === 0) {
        toast.error("No questions could be extracted. Try a different file or format.");
        setStep("upload");
        return;
      }

      // Mark all selected by default
      const selMap = {};
      extracted.forEach((_, i) => (selMap[i] = true));
      setQuestions(extracted);
      setSelected(selMap);
      setStep("preview");
      toast.success(`✅ ${extracted.length} questions extracted! Review before saving.`);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Extraction failed.";
      toast.error(`Extraction error: ${msg}`);
      setStep("upload");
    }
  };

  /* ─── STEP 3 : Edit helpers ─── */
  const openEdit = (idx) => {
    setEditIdx(idx);
    setEditQ(JSON.parse(JSON.stringify(questions[idx]))); // deep clone
  };
  const cancelEdit = () => { setEditIdx(null); setEditQ(null); };
  const saveEdit = () => {
    if (!editQ) return;
    setQuestions((prev) => prev.map((q, i) => (i === editIdx ? editQ : q)));
    setEditIdx(null);
    setEditQ(null);
    toast.success("Question updated.");
  };
  const removeQ = (idx) => {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
    setSelected((prev) => {
      const n = {};
      Object.keys(prev).forEach((k) => { if (Number(k) !== idx) n[Number(k) > idx ? Number(k) - 1 : k] = prev[k]; });
      return n;
    });
    toast.success("Question removed.");
  };
  const toggleSelect = (idx) => setSelected((p) => ({ ...p, [idx]: !p[idx] }));
  const toggleExpand = (idx) => setExpanded((p) => ({ ...p, [idx]: !p[idx] }));
  const selectAll = () => { const m = {}; questions.forEach((_, i) => (m[i] = true)); setSelected(m); };
  const deselectAll = () => setSelected({});

  /* ─── STEP 4 : Save to Question Bank ─── */
  const handleSave = async () => {
    const toSave = questions.filter((_, i) => selected[i]);
    if (toSave.length === 0) return toast.error("Select at least one question.");

    setSaving(true);
    try {
      const payload = toSave.map((q) => ({
        type: q.type || "MCQ",
        content: q.content,
        options: Array.isArray(q.options) ? q.options.filter(Boolean) : [],
        answers: q.answers,
        explanation: q.explanation || "",
        difficulty: q.difficulty || "MEDIUM",
        score: parseFloat(q.score) || 5,
        negativeMarks: parseFloat(q.negativeMarks) || 0,
        tags: Array.isArray(q.tags) ? q.tags : [],
        subjectId: subjectId !== "auto" ? subjectId : (q.subjectId || null),
        subjectName: q.subjectName || q.subjectCode || q.subject || null,
        subjectCode: q.subjectCode || q.subjectName || null,
        departmentId: q.departmentId || null,
        fileUrl: q.fileUrl || null,
        topic: q.topic || "",
      }));

      const res = await api.post("/questions/import", { questions: payload });
      const savedCount = res.data?.data?.length || payload.length;
      setStats({ saved: savedCount, skipped: toSave.length - savedCount, failed: 0 });
      setStep("done");
      toast.success(`🎉 ${savedCount} questions saved to Question Bank!`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save questions.");
    } finally {
      setSaving(false);
    }
  };

  const resetAll = () => {
    setStep("upload");
    setFile(null);
    setQuestions([]);
    setSelected({});
    setExpanded({});
    setEditIdx(null);
    setEditQ(null);
    setStats({ saved: 0, skipped: 0, failed: 0 });
    setSubjectId("auto");
  };

  const selectedCount = Object.values(selected).filter(Boolean).length;

  /* ══════════════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 space-y-8">

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-3">
            <Sparkles size={28} className="text-violet-400" />
            AI Question Importer
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Upload Excel, Word, PDF, CSV, or TXT — AI extracts all questions automatically.
          </p>
        </div>
        {step !== "upload" && (
          <button
            onClick={resetAll}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-all"
          >
            <ArrowLeft size={13} /> Start Over
          </button>
        )}
      </div>

      {/* ── Progress Bar ── */}
      <div className="flex items-center gap-0 text-xs select-none">
        {[
          { id: "upload", label: "1. Upload File" },
          { id: "extracting", label: "2. AI Extraction" },
          { id: "preview", label: "3. Review" },
          { id: "done", label: "4. Saved" },
        ].map((s, i) => {
          const steps = ["upload", "extracting", "preview", "done"];
          const current = steps.indexOf(step);
          const sIdx = steps.indexOf(s.id);
          const active = sIdx === current;
          const done = sIdx < current;
          return (
            <React.Fragment key={s.id}>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold transition-all
                ${active ? "bg-violet-600/30 text-violet-300 border border-violet-500/40" :
                  done ? "text-emerald-400" : "text-slate-600"}`}>
                {done ? <CheckCircle2 size={13} /> : null}
                {s.label}
              </div>
              {i < 3 && <div className={`h-px w-6 md:w-12 ${done ? "bg-emerald-600" : "bg-slate-800"}`} />}
            </React.Fragment>
          );
        })}
      </div>

      {/* ════════════════════════════════════════════════════
          STEP 1 : UPLOAD
      ════════════════════════════════════════════════════ */}
      {step === "upload" && (
        <div className="max-w-2xl mx-auto space-y-6">

          {/* Subject selector */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300">
              Target Subject (optional)
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500 transition-all"
            >
              <option value="auto">Auto-detect from file</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.code ? `(${s.code})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Drag-and-drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onFileDrop}
            onClick={() => fileRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200
              ${dragOver ? "border-violet-500 bg-violet-950/20" :
                file ? "border-emerald-500/60 bg-emerald-950/10" : "border-slate-700 hover:border-slate-500 bg-slate-900/30"}`}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.docx,.doc,.xlsx,.xls,.csv,.txt,.md,.png,.jpg,.jpeg"
              className="hidden"
              onChange={onFileDrop}
            />

            {file ? (
              <div className="space-y-2">
                <FileText size={44} className="mx-auto text-emerald-400" />
                <p className="font-semibold text-emerald-300 text-base">{file.name}</p>
                <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="text-xs text-slate-500 hover:text-red-400 underline mt-1"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Upload size={44} className="mx-auto text-slate-600" />
                <div>
                  <p className="font-medium text-slate-300">Drop your file here, or click to browse</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports: PDF, Word (.docx), Excel (.xlsx/.csv), TXT, Images (JPG/PNG)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Supported formats info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { ext: "XLSX / CSV", desc: "Structured question sheet" },
              { ext: "PDF / DOCX", desc: "Text or scanned document" },
              { ext: "TXT / MD", desc: "Plain text question list" },
              { ext: "JPG / PNG", desc: "Photo of printed paper" },
            ].map((f) => (
              <div key={f.ext} className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-center">
                <p className="text-xs font-bold text-violet-400">{f.ext}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{f.desc}</p>
              </div>
            ))}
          </div>

          <button
            onClick={handleExtract}
            disabled={!file}
            className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-violet-600/20"
          >
            <Sparkles size={18} />
            Extract Questions with AI
          </button>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          STEP 2 : EXTRACTING (loading)
      ════════════════════════════════════════════════════ */}
      {step === "extracting" && (
        <div className="max-w-md mx-auto text-center space-y-6 py-16">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-violet-600/20" />
            <div className="absolute inset-0 rounded-full border-4 border-t-violet-500 animate-spin" />
            <Sparkles size={36} className="absolute inset-0 m-auto text-violet-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">AI is reading your file…</h3>
            <p className="text-slate-400 text-sm mt-1">Extracting all questions. Please wait — this may take up to 60 seconds for large files.</p>
          </div>
          <div className="flex flex-col gap-1.5 text-xs text-slate-500">
            <p className="animate-pulse">📄 Parsing document structure…</p>
            <p className="animate-pulse delay-300">🧠 Sending to Gemini AI…</p>
            <p className="animate-pulse delay-500">✅ Formatting question data…</p>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          STEP 3 : PREVIEW & REVIEW
      ════════════════════════════════════════════════════ */}
      {step === "preview" && questions.length > 0 && (
        <div className="space-y-5">
          {/* Preview toolbar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/50 border border-slate-800 rounded-xl p-4">
            <div>
              <p className="font-bold text-white text-base">
                <Eye size={16} className="inline mr-2 text-violet-400" />
                Review Extracted Questions
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {questions.length} questions found &nbsp;·&nbsp; {selectedCount} selected for import
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={selectAll} className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:border-slate-500">
                Select All
              </button>
              <button onClick={deselectAll} className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:border-slate-500">
                Deselect All
              </button>
              <button
                onClick={handleSave}
                disabled={saving || selectedCount === 0}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold disabled:opacity-50 transition-all shadow-md shadow-emerald-600/20"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Save {selectedCount} Question{selectedCount !== 1 ? "s" : ""}
              </button>
            </div>
          </div>

          {/* Question cards */}
          <div className="space-y-3">
            {questions.map((q, idx) => (
              <QuestionCard
                key={idx}
                q={q}
                idx={idx}
                selected={!!selected[idx]}
                expanded={!!expanded[idx]}
                onToggleSelect={() => toggleSelect(idx)}
                onToggleExpand={() => toggleExpand(idx)}
                onEdit={() => openEdit(idx)}
                onRemove={() => removeQ(idx)}
              />
            ))}
          </div>

          {/* Bottom save bar */}
          <div className="sticky bottom-4 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving || selectedCount === 0}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm disabled:opacity-50 transition-all shadow-lg shadow-emerald-600/25"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? "Saving…" : `Save ${selectedCount} Questions to Bank`}
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          STEP 4 : DONE
      ════════════════════════════════════════════════════ */}
      {step === "done" && (
        <div className="max-w-md mx-auto text-center space-y-6 py-8">
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 size={40} className="text-emerald-400" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">Import Complete! 🎉</h3>
            <p className="text-slate-400 text-sm mt-1">Questions have been added to your Question Bank.</p>
          </div>

          <div className="grid grid-cols-3 gap-4 border border-slate-800 bg-slate-900/50 rounded-xl p-5">
            <div>
              <p className="text-2xl font-bold text-emerald-400">{stats.saved}</p>
              <p className="text-[11px] uppercase text-slate-500 mt-1 font-semibold">Saved</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-400">{stats.skipped}</p>
              <p className="text-[11px] uppercase text-slate-500 mt-1 font-semibold">Skipped</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-400">{stats.failed}</p>
              <p className="text-[11px] uppercase text-slate-500 mt-1 font-semibold">Failed</p>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={resetAll}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-medium"
            >
              <RefreshCw size={14} /> Import Another File
            </button>
            <button
              onClick={() => (window.location.href = "/admin/questions")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold"
            >
              <BookOpen size={14} /> View Question Bank
            </button>
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editIdx !== null && editQ && (
        <EditModal
          q={editQ}
          setQ={setEditQ}
          onSave={saveEdit}
          onClose={cancelEdit}
        />
      )}
    </div>
  );
};

/* ─────────────────────────────── QuestionCard sub-component ─────── */
const QuestionCard = ({ q, idx, selected, expanded, onToggleSelect, onToggleExpand, onEdit, onRemove }) => {
  const typeClass = TYPE_COLORS[q.type] || "bg-slate-700 text-slate-300 border-slate-600";
  const diffClass = DIFF_COLORS[q.difficulty] || "text-slate-400";

  return (
    <div className={`rounded-xl border transition-all duration-150
      ${selected ? "border-slate-700 bg-slate-900/40" : "border-slate-800/50 bg-slate-900/20 opacity-60"}`}>

      {/* Card Header */}
      <div className="flex items-start gap-3 p-4">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggleSelect}
          className="mt-1 w-4 h-4 accent-violet-500 cursor-pointer rounded"
        />

        {/* Content preview */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${typeClass}`}>{q.type}</span>
            <span className={`text-[10px] font-bold ${diffClass}`}>{q.difficulty}</span>
            <span className="text-[10px] text-slate-500 font-mono">#{idx + 1}</span>
            {q.score && <span className="text-[10px] text-slate-500 flex items-center gap-0.5"><Award size={9} /> {q.score}pts</span>}
            {q.topic && <span className="text-[10px] text-slate-500 flex items-center gap-0.5"><Tag size={9} /> {q.topic}</span>}
            {q.fileUrl && <span className="text-[10px] text-violet-400 font-semibold flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-violet-500/10 border border-violet-500/20"><ImageIcon size={9} /> Diagram Attached</span>}
          </div>
          <MathContent content={q.content} fileUrl={q.fileUrl} textSize="text-sm font-medium" />

          {/* Always Visible Options for MCQ */}
          {Array.isArray(q.options) && q.options.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-slate-800/80">
              {q.options.map((opt, oi) => {
                const isCorrect = Array.isArray(q.answers)
                  ? q.answers.includes(opt) || q.answers.includes(String.fromCharCode(65 + oi))
                  : q.answers === opt || q.answers === String.fromCharCode(65 + oi);
                return (
                  <div
                    key={oi}
                    className={`flex items-center gap-2 text-xs rounded-lg px-2.5 py-1.5 border transition-colors
                      ${isCorrect ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300 font-semibold" : "bg-slate-950/40 border-slate-800 text-slate-300"}`}
                  >
                    <span className="font-bold text-violet-400 shrink-0">{String.fromCharCode(65 + oi)}.</span>
                    <div className="flex-1 min-w-0 truncate">
                      <MathContent content={opt} showDiagramLabel={false} textSize="text-xs" />
                    </div>
                    {isCorrect && <CheckCircle2 size={12} className="ml-auto shrink-0 text-emerald-400" />}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={onToggleExpand} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all" title="Expand">
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
          <button onClick={onEdit} className="p-1.5 rounded-lg text-slate-500 hover:text-violet-400 hover:bg-slate-800 transition-all" title="Edit">
            <Edit3 size={15} />
          </button>
          <button onClick={onRemove} className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-all" title="Remove">
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Expanded Detail */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-slate-800 pt-3 ml-7">
          {/* Full question text & diagram */}
          <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800">
            <MathContent content={q.content} fileUrl={q.fileUrl} textSize="text-sm font-medium" />
          </div>

          {/* Options */}
          {Array.isArray(q.options) && q.options.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {q.options.map((opt, oi) => {
                const isCorrect = Array.isArray(q.answers)
                  ? q.answers.includes(opt)
                  : q.answers === opt;
                return (
                  <div
                    key={oi}
                    className={`flex items-start gap-2 text-xs rounded-lg px-3 py-2 border
                      ${isCorrect ? "bg-emerald-950/30 border-emerald-600/30 text-emerald-300" : "bg-slate-900/50 border-slate-800 text-slate-400"}`}
                  >
                    <span className="font-bold shrink-0">{String.fromCharCode(65 + oi)}.</span>
                    <div className="flex-1">
                      <MathContent content={opt} showDiagramLabel={false} textSize="text-xs" />
                    </div>
                    {isCorrect && <CheckCircle2 size={11} className="ml-auto shrink-0 text-emerald-400" />}
                  </div>
                );
              })}
            </div>
          )}

          {/* Answer for non-MCQ */}
          {(!q.options || q.options.length === 0) && q.answers !== undefined && (
            <div className="bg-emerald-950/20 border border-emerald-600/20 rounded-lg px-3 py-2">
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Answer: </span>
              <span className="text-xs text-emerald-300">
                {Array.isArray(q.answers) ? q.answers.join(", ") : String(q.answers)}
              </span>
            </div>
          )}

          {/* Explanation */}
          {q.explanation && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg px-3 py-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Explanation: </span>
              <span className="text-xs text-slate-400">{q.explanation}</span>
            </div>
          )}

          {/* Tags */}
          {Array.isArray(q.tags) && q.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {q.tags.map((t, ti) => (
                <span key={ti} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">{t}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────── EditModal sub-component ──────────── */
const EditModal = ({ q, setQ, onSave, onClose }) => {
  const update = (field, val) => setQ((prev) => ({ ...prev, [field]: val }));
  const updateOption = (i, val) => {
    const opts = [...(q.options || ["", "", "", ""])];
    opts[i] = val;
    update("options", opts);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-slate-900 border-b border-slate-800 flex justify-between items-center px-6 py-4 z-10">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Edit3 size={16} className="text-violet-400" /> Edit Question
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Type + Difficulty row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Type</label>
              <select
                value={q.type || "MCQ"}
                onChange={(e) => update("type", e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500"
              >
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Difficulty</label>
              <select
                value={q.difficulty || "MEDIUM"}
                onChange={(e) => update("difficulty", e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500"
              >
                {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {/* Score + NegMark row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Score (points)</label>
              <input
                type="number" min="0" step="0.5"
                value={q.score ?? 5}
                onChange={(e) => update("score", parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Negative Marks</label>
              <input
                type="number" min="0" step="0.25"
                value={q.negativeMarks ?? 0}
                onChange={(e) => update("negativeMarks", parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          {/* Question content */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Question Content</label>
            <textarea
              value={q.content || ""}
              onChange={(e) => update("content", e.target.value)}
              rows={4}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500 resize-y"
            />
          </div>

          {/* Diagram / Attachment Image */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <label className="block text-xs font-bold text-violet-400 uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon size={14} /> Diagram / Image Attachment
            </label>
            <div className="flex flex-wrap gap-2 items-center">
              <input
                type="file"
                accept="image/*"
                id="import-diagram-upload"
                className="hidden"
                onChange={async (e) => {
                  if (e.target.files?.[0]) {
                    const fd = new FormData();
                    fd.append("file", e.target.files[0]);
                    try {
                      const res = await api.post("/questions/upload-image", fd, {
                        headers: { "Content-Type": "multipart/form-data" },
                      });
                      update("fileUrl", res.data?.data?.fileUrl || "");
                      toast.success("Diagram image uploaded successfully!");
                    } catch (err) {
                      toast.error(err.response?.data?.message || "Failed to upload image diagram.");
                    }
                  }
                }}
              />
              <label
                htmlFor="import-diagram-upload"
                className="cursor-pointer px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
              >
                <Upload size={14} className="text-violet-400" /> Upload File
              </label>
              <input
                type="text"
                value={q.fileUrl || ""}
                onChange={(e) => update("fileUrl", e.target.value)}
                placeholder="Image / Diagram URL (e.g. https://... or /uploads/diagram.png)"
                className="flex-1 min-w-[200px] px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-violet-500"
              />
              {q.fileUrl && (
                <button
                  type="button"
                  onClick={() => update("fileUrl", null)}
                  className="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-bold transition-colors"
                >
                  Remove Diagram
                </button>
              )}
            </div>
            {q.fileUrl && (
              <div className="mt-2 p-2 bg-slate-900 border border-slate-800 rounded-lg flex items-center gap-3">
                <img
                  src={q.fileUrl}
                  alt="Diagram Preview"
                  className="h-16 w-auto object-contain rounded border border-slate-700"
                />
                <span className="text-xs text-emerald-400 font-semibold">
                  ✓ Diagram attached & ready for student exam view
                </span>
              </div>
            )}
          </div>

          {/* Options (for MCQ / MULTI_CORRECT) */}
          {(q.type === "MCQ" || q.type === "MULTI_CORRECT") && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                <span>Answer Choices Options (Text or Diagram)</span>
                <span className="text-[10px] text-violet-400 font-normal">Click 📷 icon to upload option image</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(q.options?.length ? q.options : ["", "", "", ""]).map((opt, i) => {
                  const isImg = opt && (opt.startsWith("http") || opt.startsWith("/uploads/") || opt.includes(".png") || opt.includes(".jpg") || opt.includes(".jpeg"));
                  return (
                    <div key={i} className="space-y-1.5 p-2 bg-slate-950 border border-slate-800 rounded-lg">
                      <div className="flex gap-2 items-center">
                        <span className="text-xs font-mono font-bold text-violet-400 w-5">
                          {String.fromCharCode(65 + i)}.
                        </span>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => updateOption(i, e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + i)} text or URL`}
                          className="flex-1 p-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                        />
                        <input
                          type="file"
                          accept="image/*"
                          id={`import-opt-img-${i}`}
                          className="hidden"
                          onChange={async (e) => {
                            if (e.target.files?.[0]) {
                              const fd = new FormData();
                              fd.append("file", e.target.files[0]);
                              try {
                                const res = await api.post("/questions/upload-image", fd, {
                                  headers: { "Content-Type": "multipart/form-data" },
                                });
                                updateOption(i, res.data?.data?.fileUrl || "");
                                toast.success(`Image uploaded for Option ${String.fromCharCode(65 + i)}!`);
                              } catch (err) {
                                toast.error("Failed to upload option image.");
                              }
                            }
                          }}
                        />
                        <label
                          htmlFor={`import-opt-img-${i}`}
                          className="cursor-pointer p-1.5 bg-slate-800 hover:bg-slate-700 text-violet-300 rounded text-xs font-semibold border border-slate-700 transition-colors shrink-0"
                          title={`Upload Image for Option ${String.fromCharCode(65 + i)}`}
                        >
                          <Upload size={13} />
                        </label>
                      </div>
                      {isImg && (
                        <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
                          <img
                            src={opt}
                            alt={`Option ${String.fromCharCode(65 + i)}`}
                            className="h-10 w-auto object-contain rounded border border-slate-700"
                          />
                          <span className="text-[10px] text-emerald-400 font-semibold flex-1">
                            ✓ Option Image Attached
                          </span>
                          <button
                            type="button"
                            onClick={() => updateOption(i, "")}
                            className="text-[10px] text-red-400 hover:underline font-bold"
                          >
                            Clear
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Correct Answer */}
          {q.type !== "CODING" && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Correct Answer {q.type === "MCQ" ? "(select from options)" : ""}
              </label>
              {q.type === "MCQ" ? (
                <select
                  value={Array.isArray(q.answers) ? q.answers[0] : q.answers || ""}
                  onChange={(e) => update("answers", [e.target.value])}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500"
                >
                  <option value="">-- Select correct option --</option>
                  {(q.options || []).filter(Boolean).map((opt, i) => (
                    <option key={i} value={opt}>{String.fromCharCode(65 + i)}. {opt}</option>
                  ))}
                </select>
              ) : q.type === "TRUE_FALSE" ? (
                <select
                  value={Array.isArray(q.answers) ? q.answers[0] : String(q.answers)}
                  onChange={(e) => update("answers", e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500"
                >
                  <option value="True">True</option>
                  <option value="False">False</option>
                </select>
              ) : (
                <input
                  type="text"
                  value={Array.isArray(q.answers) ? q.answers.join(", ") : String(q.answers || "")}
                  onChange={(e) => update("answers", e.target.value.split(",").map((s) => s.trim()))}
                  placeholder="Enter answer(s), comma-separated"
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500"
                />
              )}
            </div>
          )}

          {/* Explanation */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Explanation (optional)</label>
            <textarea
              value={q.explanation || ""}
              onChange={(e) => update("explanation", e.target.value)}
              rows={2}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500 resize-y"
              placeholder="Step-by-step explanation..."
            />
          </div>

          {/* Topic */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Topic / Tags</label>
            <input
              type="text"
              value={q.topic || ""}
              onChange={(e) => update("topic", e.target.value)}
              placeholder="e.g. Calculus, Kinematics, Organic Chemistry..."
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500"
            />
          </div>
        </div>

        {/* Modal footer */}
        <div className="sticky bottom-0 bg-slate-900 border-t border-slate-800 flex justify-end gap-3 px-6 py-4">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-400 hover:text-white border border-slate-700 rounded-lg hover:bg-slate-800 transition-all">
            Cancel
          </button>
          <button onClick={onSave} className="px-5 py-2 text-sm font-bold bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-all flex items-center gap-2">
            <Save size={14} /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionImport;
