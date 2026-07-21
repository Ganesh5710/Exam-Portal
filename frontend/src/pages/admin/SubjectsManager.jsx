import React, { useEffect, useState, useCallback } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import {
  BookOpen,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  FileText,
  HelpCircle,
  Building,
  Loader2,
  CheckCircle2,
  Layers
} from "lucide-react";

export const SubjectsManager = () => {
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [targetSubject, setTargetSubject] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchSubjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/subjects");
      setSubjects(res.data.data || []);
    } catch {
      toast.error("Failed to load subjects.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await api.get("/departments");
      setDepartments(res.data.data || []);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
    fetchDepartments();
  }, [fetchSubjects, fetchDepartments]);

  const openCreateModal = () => {
    setEditingSubject(null);
    setName("");
    setCode("");
    setDescription("");
    setDepartmentId("");
    setModalOpen(true);
  };

  const openEditModal = (sub) => {
    setEditingSubject(sub);
    setName(sub.name || "");
    setCode(sub.code || "");
    setDescription(sub.description || "");
    setDepartmentId(sub.departmentId || "");
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      toast.error("Subject name and code are required.");
      return;
    }

    setSaving(true);
    try {
      if (editingSubject) {
        await api.put(`/subjects/${editingSubject.id}`, {
          name: name.trim(),
          code: code.trim(),
          description: description.trim() || undefined,
          departmentId: departmentId || null,
        });
        toast.success("Subject updated successfully!");
      } else {
        await api.post("/subjects", {
          name: name.trim(),
          code: code.trim(),
          description: description.trim() || undefined,
          departmentId: departmentId || null,
        });
        toast.success("Subject created successfully!");
      }
      setModalOpen(false);
      fetchSubjects();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save subject.");
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (sub) => {
    setTargetSubject(sub);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!targetSubject) return;
    setDeleting(true);
    try {
      await api.delete(`/subjects/${targetSubject.id}`);
      toast.success("Subject deleted successfully!");
      setDeleteModalOpen(false);
      setTargetSubject(null);
      fetchSubjects();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete subject.");
    } finally {
      setDeleting(false);
    }
  };

  const filteredSubjects = subjects.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      (s.department?.name || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <BookOpen className="text-violet-500" size={28} />
            Subject Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Organize academic subjects (Maths, Physics, Chemistry) for question tagging and subject-wise score breakdown.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-lg shadow-violet-600/25 transition-all hover:-translate-y-0.5"
        >
          <Plus size={16} /> Add Subject
        </button>
      </div>

      {/* Search Bar & Stats */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Search subjects by name, code, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          />
        </div>
        <div className="text-xs text-slate-400 font-medium">
          Total Subjects: <span className="text-violet-400 font-bold">{subjects.length}</span>
        </div>
      </div>

      {/* Grid of Subject Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 bg-slate-900/60 rounded-2xl border border-slate-800" />
          ))}
        </div>
      ) : filteredSubjects.length === 0 ? (
        <div className="p-12 text-center border border-slate-800 rounded-2xl bg-slate-900/40">
          <BookOpen size={40} className="mx-auto text-slate-600 mb-3" />
          <h3 className="text-lg font-bold text-slate-300">No Subjects Found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery ? "No subjects match your search criteria." : "Create your first subject (e.g. Mathematics, Physics, Chemistry) to tag questions."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredSubjects.map((sub) => (
            <div
              key={sub.id}
              className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-violet-500/40 transition-all flex flex-col justify-between group shadow-xl"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-violet-500/10 text-violet-400 border border-violet-500/20">
                    {sub.code}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(sub)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Edit Subject"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => openDeleteModal(sub)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete Subject"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-violet-300 transition-colors">
                  {sub.name}
                </h3>

                {sub.description && (
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    {sub.description}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 mt-4">
                <div className="flex items-center gap-1.5">
                  <HelpCircle size={14} className="text-cyan-400" />
                  <span><strong className="text-white">{sub._count?.questions ?? 0}</strong> Questions</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FileText size={14} className="text-amber-400" />
                  <span><strong className="text-white">{sub._count?.exams ?? 0}</strong> Exams</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !saving && setModalOpen(false)} />
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen size={18} className="text-violet-400" />
                {editingSubject ? "Edit Subject" : "Create New Subject"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Subject Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mathematics, Physics, Chemistry"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Subject Code *
                </label>
                <input
                  type="text"
                  placeholder="e.g. MATH101, PHYS101, CHEM101"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500 uppercase font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Department (Optional)
                </label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
                >
                  <option value="">No Department Associated</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief summary of syllabus or subject domain..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-lg shadow-violet-600/20 disabled:opacity-50"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  {editingSubject ? "Update Subject" : "Create Subject"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !deleting && setDeleteModalOpen(false)} />
          <div className="relative bg-slate-900 border border-red-500/30 rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-white mb-2">Delete Subject "{targetSubject?.name}"?</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              This action will unbind questions associated with this subject. Existing question entries will not be deleted.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 disabled:opacity-50"
              >
                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectsManager;
