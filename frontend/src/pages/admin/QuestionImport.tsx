import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import {
  UploadCloud,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Trash2,
  Edit2,
  X,
  Plus,
  BookOpen,
  ArrowRight,
  RefreshCw,
  HelpCircle,
  Check,
  AlertCircle,
  ArrowLeft,
  Settings
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface Question {
  id?: string;
  type: 'MCQ' | 'MULTI_CORRECT' | 'TRUE_FALSE' | 'FILL_BLANK' | 'DESCRIPTIVE' | 'CODING';
  content: string;
  options: string[] | null;
  answers: string[] | string;
  explanation: string | null;
  score: number;
  negativeMarks: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  tags: string[];
  topic?: string;
  validationWarnings?: string[];
  isPossibleDuplicate?: boolean;
}

export const QuestionImport: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  
  // Job Tracking states
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string>('IDLE'); // IDLE, PENDING, PROCESSING, PREVIEW_READY, COMPLETED, FAILED, CANCELLED
  const [progress, setProgress] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [processed, setProcessed] = useState(0);
  const [failed, setFailed] = useState(0);
  const [duplicates, setDuplicates] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Questions preview states
  const [parsedQuestions, setParsedQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Record<number, boolean>>({});
  const [duplicateActions, setDuplicateActions] = useState<Record<string, 'SKIP' | 'REPLACE' | 'UPDATE' | 'KEEP_BOTH'>>({});
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<Question | null>(null);
  const [existingQuestionContents, setExistingQuestionContents] = useState<string[]>([]);
  
  const [submitting, setSubmitting] = useState(false);

  // 1. Fetch Subjects & existing Questions for duplicate check
  const fetchSubjects = async () => {
    try {
      const res = await api.get('/subjects');
      setSubjects(res.data.data || []);
      if (res.data.data?.length > 0) {
        setSelectedSubjectId(res.data.data[0].id);
      }
    } catch {
      toast.error('Failed to load subjects.');
    }
  };

  const fetchExistingQuestions = useCallback(async () => {
    if (!selectedSubjectId) return;
    try {
      const res = await api.get(`/questions?subjectId=${selectedSubjectId}`);
      const contents = (res.data.data || []).map((q: any) => q.content.trim().toLowerCase());
      setExistingQuestionContents(contents);
    } catch {
      // Ignore fallback
    }
  }, [selectedSubjectId]);

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    fetchExistingQuestions();
  }, [fetchExistingQuestions]);

  // 2. Drag & Drop File handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file to import.');
      return;
    }
    if (!selectedSubjectId) {
      toast.error('Please select a Subject.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await api.post('/import/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setJobId(res.data.data.jobId);
      setJobStatus('PENDING');
      setProgress(0);
      toast.success('Document uploaded. Starting background extraction...');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to upload document.');
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Poll Background progress status
  useEffect(() => {
    if (!jobId || ['COMPLETED', 'FAILED', 'CANCELLED', 'PREVIEW_READY'].includes(jobStatus)) return;

    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/import/status/${jobId}`);
        const job = res.data.data;
        setJobStatus(job.status);
        setProgress(job.progress);
        setTotalItems(job.totalItems);
        setProcessed(job.processed);
        setFailed(job.failed);
        setDuplicates(job.duplicates);
        setErrorMessage(job.errorMessage);

        if (job.status === 'PREVIEW_READY') {
          // Pre-populate parsed questions and run duplicate detection checks
          const questionsList: Question[] = job.resultData || [];
          const enriched = questionsList.map((q) => {
            const isDup = existingQuestionContents.includes(q.content.trim().toLowerCase());
            return {
              ...q,
              isPossibleDuplicate: isDup
            };
          });

          setParsedQuestions(enriched);
          // Auto-select all questions, and setup default actions for duplicates
          const initialSelection: Record<number, boolean> = {};
          const initialDupActions: Record<string, 'SKIP' | 'REPLACE' | 'UPDATE' | 'KEEP_BOTH'> = {};
          
          enriched.forEach((q, idx) => {
            initialSelection[idx] = true;
            if (q.isPossibleDuplicate) {
              initialDupActions[q.content] = 'SKIP'; // default action is to skip duplicate
            }
          });

          setSelectedQuestions(initialSelection);
          setDuplicateActions(initialDupActions);
          clearInterval(interval);
          toast.success('AI Question extraction completed! Please review.');
        } else if (job.status === 'FAILED') {
          clearInterval(interval);
          toast.error(`Import failed: ${job.errorMessage}`);
        }
      } catch (err) {
        clearInterval(interval);
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [jobId, jobStatus, existingQuestionContents]);

  // 4. Cancel active Import Job
  const handleCancelJob = async () => {
    if (!jobId) return;
    try {
      await api.post(`/import/cancel/${jobId}`);
      setJobStatus('CANCELLED');
      toast.success('Extraction processing cancelled.');
    } catch {
      toast.error('Failed to cancel job.');
    }
  };

  // 5. In-place Edit Modals
  const openEditModal = (idx: number) => {
    setEditingIndex(idx);
    setEditFormData({ ...parsedQuestions[idx] });
  };

  const saveEdit = () => {
    if (editingIndex === null || !editFormData) return;
    const newList = [...parsedQuestions];
    newList[editingIndex] = editFormData;
    setParsedQuestions(newList);
    setEditingIndex(null);
    setEditFormData(null);
    toast.success('Question updated locally.');
  };

  const deleteQuestion = (idx: number) => {
    setParsedQuestions(prev => prev.filter((_, i) => i !== idx));
    toast.success('Question removed from the preview list.');
  };

  // 6. Submit final approved questions list
  const handleFinalImport = async () => {
    if (!jobId) return;
    
    // Filter only selected questions
    const finalQuestions = parsedQuestions.filter((_, idx) => selectedQuestions[idx]);
    if (finalQuestions.length === 0) {
      toast.error('Please select at least one question to import.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post(`/import/approve/${jobId}`, {
        subjectId: selectedSubjectId,
        questions: finalQuestions,
        duplicateActions
      });

      setJobStatus('COMPLETED');
      toast.success(res.data.message || 'Import operation completed successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to complete import.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 min-h-screen bg-slate-950 text-slate-100 p-2">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-900 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-3">
            AI Question Importer
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 uppercase">Enterprise</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Upload files to automatically extract and import questions using Gemini AI & OCR.</p>
        </div>
      </div>

      {/* ═══════════════ UPLOAD FILE PANEL ═══════════════ */}
      {jobStatus === 'IDLE' && (
        <form onSubmit={handleUpload} className="glass-card max-w-2xl mx-auto p-8 rounded-2xl border border-slate-800 space-y-6 bg-slate-900/40">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300">Target Subject Module</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 p-3 rounded-lg text-sm focus:outline-none focus:border-emerald-500 text-white"
              required
            >
              <option value="">Select Target Subject</option>
              {subjects.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>
              ))}
            </select>
          </div>

          <div className="border-2 border-dashed border-slate-800 hover:border-emerald-500/60 rounded-xl p-8 text-center cursor-pointer transition-all duration-300 relative bg-slate-950/40">
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.docx,.doc,.txt,.md,.csv,.xlsx,.xls,.png,.jpg,.jpeg"
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <UploadCloud className="mx-auto text-slate-600 mb-3" size={40} />
            {file ? (
              <div className="space-y-1">
                <p className="text-sm text-slate-200 font-semibold">{file.name}</p>
                <p className="text-xs text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-sm text-slate-300 font-medium">Drag and drop file, or click to browse</p>
                <p className="text-xs text-slate-600">Supports PDF (including Scanned PDF OCR), Word, Excel, CSV, Images (JPEG/PNG), MD & TXT</p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting || !file}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold flex justify-center items-center gap-2 transition-all disabled:opacity-40 disabled:hover:bg-emerald-600"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Uploading document file...
              </>
            ) : (
              <>
                <ArrowRight size={16} />
                Upload & Process with AI
              </>
            )}
          </button>
        </form>
      )}

      {/* ═══════════════ POLLING PROGRESS PANEL ═══════════════ */}
      {(jobStatus === 'PENDING' || jobStatus === 'PROCESSING') && (
        <div className="glass-card max-w-xl mx-auto p-8 rounded-2xl border border-slate-800 space-y-6 text-center bg-slate-900/40">
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
            <Loader2 className="text-emerald-400 animate-spin absolute" size={80} />
            <span className="font-mono text-sm font-bold text-emerald-400">{progress}%</span>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-lg">AI Document Analysis in Progress</h3>
            <p className="text-xs text-slate-400">
              {progress < 25 ? 'Uploading and reading document file...'
                : progress < 50 ? 'Loading pages & executing OCR...'
                : progress < 85 ? 'Parsing layout and extracting questions via Gemini AI...'
                : 'Validating questions content and metadata structures...'}
            </p>
            <p className="text-[10px] text-slate-500 animate-pulse mt-1">Please do not refresh the browser.</p>
          </div>

          <button
            onClick={handleCancelJob}
            className="px-4 py-2 border border-slate-800 hover:border-red-500/30 text-slate-400 hover:text-red-400 text-xs font-semibold rounded-lg transition-all"
          >
            Cancel Ingestion
          </button>
        </div>
      )}

      {/* ═══════════════ PREVIEW QUESTIONS REVIEW PANEL ═══════════════ */}
      {jobStatus === 'PREVIEW_READY' && parsedQuestions.length > 0 && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/30 border border-slate-850 p-5 rounded-xl">
            <div>
              <h3 className="text-lg font-bold text-white">Ingestion Review Hub</h3>
              <p className="text-xs text-slate-400 mt-1">Review the extracted items, resolve duplicates, and approve questions for bank insertion.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setJobStatus('IDLE')}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold border border-slate-800 hover:bg-slate-900 rounded-lg text-slate-300"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <button
                onClick={handleFinalImport}
                disabled={submitting}
                className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white shadow-lg shadow-emerald-600/20 transition-all"
              >
                {submitting ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
                Import Checked ({Object.values(selectedQuestions).filter(Boolean).length})
              </button>
            </div>
          </div>

          {/* List layout */}
          <div className="space-y-4">
            {parsedQuestions.map((q, idx) => {
              const hasWarnings = q.validationWarnings && q.validationWarnings.length > 0;
              const isSelected = selectedQuestions[idx] || false;
              const isDup = q.isPossibleDuplicate;

              return (
                <div
                  key={idx}
                  className={`glass-card p-6 rounded-xl border transition-all duration-200 flex gap-4 items-start
                    ${isSelected ? 'bg-slate-900/20' : 'opacity-50'}
                    ${isDup ? 'border-orange-500/30 bg-orange-950/5' : hasWarnings ? 'border-amber-500/20' : 'border-slate-850'}
                  `}
                >
                  {/* Select Checkbox */}
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => setSelectedQuestions(prev => ({ ...prev, [idx]: e.target.checked }))}
                    className="mt-1.5 accent-emerald-500 w-4.5 h-4.5 cursor-pointer rounded"
                  />

                  {/* Body Content */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap justify-between items-center gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-slate-950 text-slate-400 font-mono">#{idx+1}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-violet-400">{q.type}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400">{q.difficulty}</span>
                        <span className="text-[10px] font-bold text-slate-500">Suggested: {q.score} Points</span>
                      </div>

                      {/* Warnings and Duplicates */}
                      <div className="flex gap-2">
                        {isDup && (
                          <span className="flex items-center gap-1 text-[10px] bg-orange-500/10 border border-orange-500/20 text-orange-400 font-bold px-2 py-0.5 rounded">
                            <AlertCircle size={10} /> Duplicate in Bank
                          </span>
                        )}
                        {hasWarnings && (
                          <span className="flex items-center gap-1 text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded">
                            <AlertTriangle size={10} /> Validation Warnings
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Question Content string */}
                    <p className="text-sm font-semibold text-slate-100 font-mono leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-900">{q.content}</p>

                    {/* Choice options for MCQ */}
                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-3">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className="text-xs text-slate-400 flex gap-2 font-mono">
                            <span className="font-bold text-slate-500">{String.fromCharCode(65+oIdx)}.</span>
                            <span>{opt}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Correct Answers */}
                    <div className="text-xs space-y-1">
                      <p className="text-slate-400 font-mono">
                        <strong className="text-emerald-400 font-semibold uppercase tracking-wider text-[10px]">Answer key:</strong>{' '}
                        {Array.isArray(q.answers) ? q.answers.join(', ') : typeof q.answers === 'object' ? 'Coding testcases object' : String(q.answers)}
                      </p>
                      {q.explanation && (
                        <p className="text-slate-500 text-[11px] leading-relaxed">
                          <strong className="text-slate-400">Explanation:</strong> {q.explanation}
                        </p>
                      )}
                      {q.topic && (
                        <p className="text-[10px] text-slate-500">
                          <strong className="text-slate-600">Tags / Topic:</strong> {q.tags.join(', ') || 'none'} | {q.topic}
                        </p>
                      )}
                    </div>

                    {/* Validation Warnings List */}
                    {hasWarnings && (
                      <div className="bg-amber-950/20 border border-amber-500/20 p-2.5 rounded-lg text-[10px] text-amber-400 space-y-1">
                        <p className="font-bold flex items-center gap-1"><AlertTriangle size={11} /> Validate alerts:</p>
                        <ul className="list-disc pl-4 space-y-0.5">
                          {q.validationWarnings?.map((w, i) => <li key={i}>{w}</li>)}
                        </ul>
                      </div>
                    )}

                    {/* Duplicate Action selector */}
                    {isDup && (
                      <div className="flex items-center gap-3 bg-orange-950/15 border border-orange-500/10 p-3 rounded-lg text-xs">
                        <span className="font-bold text-orange-400 flex items-center gap-1.5">
                          <Settings size={14} /> Duplicate action choice:
                        </span>
                        <select
                          value={duplicateActions[q.content] || 'SKIP'}
                          onChange={(e) => setDuplicateActions(prev => ({ ...prev, [q.content]: e.target.value as any }))}
                          className="bg-slate-950 border border-slate-800 px-2.5 py-1 text-slate-200 text-xs rounded focus:outline-none focus:border-orange-500"
                        >
                          <option value="SKIP">Skip import (ignore)</option>
                          <option value="REPLACE">Overwrite existing question</option>
                          <option value="UPDATE">Update fields only</option>
                          <option value="KEEP_BOTH">Keep both (import as duplicate)</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => openEditModal(idx)}
                      className="p-2 hover:bg-slate-850 border border-slate-850 hover:text-emerald-400 rounded-lg text-slate-400 transition-all"
                      title="Edit Question details"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => deleteQuestion(idx)}
                      className="p-2 hover:bg-slate-850 border border-slate-850 hover:text-red-400 rounded-lg text-slate-400 transition-all"
                      title="Remove question"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════ FINAL IMPORT COMPLETED SCREEN ═══════════════ */}
      {jobStatus === 'COMPLETED' && (
        <div className="glass-card max-w-xl mx-auto p-8 rounded-2xl border border-slate-800 space-y-6 text-center bg-slate-900/40">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={36} />
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-xl">Import Action Completed</h3>
            <p className="text-sm text-slate-400">Questions have been added to your bank with audit logging details.</p>
          </div>

          <div className="grid grid-cols-3 gap-4 border border-slate-800 bg-slate-950/50 p-4 rounded-xl text-center">
            <div>
              <p className="text-xl font-bold text-emerald-400">{processed}</p>
              <p className="text-[10px] uppercase text-slate-500 mt-1 font-semibold">Processed</p>
            </div>
            <div>
              <p className="text-xl font-bold text-orange-400">{duplicates}</p>
              <p className="text-[10px] uppercase text-slate-500 mt-1 font-semibold">Duplicates</p>
            </div>
            <div>
              <p className="text-xl font-bold text-red-400">{failed}</p>
              <p className="text-[10px] uppercase text-slate-500 mt-1 font-semibold">Failed</p>
            </div>
          </div>

          <div className="flex gap-3 justify-center pt-2">
            <button
              onClick={() => setJobStatus('IDLE')}
              className="px-5 py-2.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              Import another file
            </button>
            <button
              onClick={() => window.location.href = '/admin/questions'}
              className="px-5 py-2.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              Open Questions Bank
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════ ERROR / FAIL PANEL ═══════════════ */}
      {jobStatus === 'FAILED' && (
        <div className="glass-card max-w-xl mx-auto p-8 rounded-2xl border border-red-500/20 bg-red-950/5 space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={36} />
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-xl text-red-400">AI Processing Error</h3>
            <p className="text-sm text-slate-400">An unexpected error occurred during extraction.</p>
            {errorMessage && (
              <p className="text-xs font-mono bg-slate-950 border border-slate-850 p-3 rounded text-red-300 select-all leading-normal text-left max-h-[150px] overflow-y-auto">
                {errorMessage}
              </p>
            )}
          </div>

          <button
            onClick={() => setJobStatus('IDLE')}
            className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
          >
            Try Again
          </button>
        </div>
      )}

      {/* ═══════════════ EDIT ITEM MODAL ═══════════════ */}
      {editingIndex !== null && editFormData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingIndex(null)} />
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5 text-left">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit2 size={16} /> Edit Extracted Question
              </h3>
              <button onClick={() => setEditingIndex(null)} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Type</label>
                  <select
                    value={editFormData.type}
                    onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-850 rounded-lg text-sm text-white"
                  >
                    <option value="MCQ">MCQ</option>
                    <option value="MULTI_CORRECT">Multiple Correct</option>
                    <option value="TRUE_FALSE">True / False</option>
                    <option value="FILL_BLANK">Fill Blank</option>
                    <option value="DESCRIPTIVE">Descriptive</option>
                    <option value="CODING">Coding</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Difficulty</label>
                  <select
                    value={editFormData.difficulty}
                    onChange={(e) => setEditFormData({ ...editFormData, difficulty: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-850 rounded-lg text-sm text-white"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Question Content</label>
                <textarea
                  value={editFormData.content}
                  onChange={(e) => setEditFormData({ ...editFormData, content: e.target.value })}
                  rows={4}
                  className="w-full p-2.5 bg-slate-950 border border-slate-850 rounded-lg text-sm text-white focus:outline-none"
                  required
                />
              </div>

              {/* Options for MCQ / Multi Correct */}
              {(editFormData.type === 'MCQ' || editFormData.type === 'MULTI_CORRECT') && (
                <div className="space-y-3 p-3 bg-slate-950 border border-slate-850 rounded-lg">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Choice Options</span>
                  <div className="space-y-2">
                    {(editFormData.options || ['', '', '', '']).map((opt, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <span className="text-xs font-mono font-bold text-slate-500">{String.fromCharCode(65+i)}</span>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const newOptions = [...(editFormData.options || ['', '', '', ''])];
                            newOptions[i] = e.target.value;
                            setEditFormData({ ...editFormData, options: newOptions });
                          }}
                          className="flex-1 p-2 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                          placeholder={`Option ${i+1}`}
                          required
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Answers keys */}
              {editFormData.type !== 'CODING' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Correct Answer</label>
                  {editFormData.type === 'MCQ' ? (
                    <select
                      value={Array.isArray(editFormData.answers) ? editFormData.answers[0] : String(editFormData.answers)}
                      onChange={(e) => setEditFormData({ ...editFormData, answers: [e.target.value] })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-850 rounded-lg text-sm text-white"
                    >
                      <option value="">Select Correct Option</option>
                      {(editFormData.options || []).map((opt, idx) => (
                        opt ? <option key={idx} value={opt}>{opt}</option> : null
                      ))}
                    </select>
                  ) : editFormData.type === 'TRUE_FALSE' ? (
                    <select
                      value={String(editFormData.answers)}
                      onChange={(e) => setEditFormData({ ...editFormData, answers: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-850 rounded-lg text-sm text-white"
                    >
                      <option value="True">True</option>
                      <option value="False">False</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={Array.isArray(editFormData.answers) ? editFormData.answers.join(', ') : String(editFormData.answers)}
                      onChange={(e) => setEditFormData({ ...editFormData, answers: e.target.value.split(',').map(s => s.trim()) })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-850 rounded-lg text-sm text-white"
                    />
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Score Points</label>
                  <input
                    type="number"
                    step="0.5"
                    value={editFormData.score}
                    onChange={(e) => setEditFormData({ ...editFormData, score: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-850 rounded-lg text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Negative Marks</label>
                  <input
                    type="number"
                    step="0.5"
                    value={editFormData.negativeMarks}
                    onChange={(e) => setEditFormData({ ...editFormData, negativeMarks: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-850 rounded-lg text-sm text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Explanation</label>
                <textarea
                  value={editFormData.explanation || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, explanation: e.target.value })}
                  rows={2}
                  className="w-full p-2.5 bg-slate-950 border border-slate-850 rounded-lg text-sm text-white focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setEditingIndex(null)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default QuestionImport;
