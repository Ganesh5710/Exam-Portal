import React, { useEffect, useState, useMemo } from "react";
import api from "../../services/api";
import {
  Building2,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Users,
  BookOpen,
  Calendar,
  Hash,
  AlertTriangle,
  FolderOpen,
} from "lucide-react";
import toast from "react-hot-toast";

const emptyForm = { name: "", code: "", description: "" };

/* ═══════════════════════════════════════════
   Departments Page
   ═══════════════════════════════════════════ */
export const Departments = () => {
  /* ── state ── */
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  /* ── data fetching ── */
  const fetchDepartments = async () => {
    try {
      const res = await api.get("/departments");
      setDepartments(res.data.data);
    } catch {
      toast.error("Failed to load departments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  /* ── filtered list ── */
  const filtered = useMemo(() => {
    if (!search.trim()) return departments;
    const q = search.toLowerCase();
    return departments.filter(
      (d) =>
        d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q),
    );
  }, [departments, search]);

  /* ── modal helpers ── */
  const openCreate = () => {
    setEditingDept(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (dept) => {
    setEditingDept(dept);
    setForm({
      name: dept.name,
      code: dept.code,
      description: dept.description,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDept(null);
    setForm(emptyForm);
  };

  /* ── CRUD handlers ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingDept) {
        await api.put(`/departments/${editingDept.id}`, form);
        toast.success("Department updated successfully.");
      } else {
        await api.post("/departments", form);
        toast.success("Department created successfully.");
      }
      closeModal();
      fetchDepartments();
    } catch (err) {
      const msg = err?.response?.data?.message || "Operation failed.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/departments/${deleteTarget.id}`);
      toast.success(`Department "${deleteTarget.name}" deleted.`);
      setDeleteTarget(null);
      fetchDepartments();
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Failed to delete department.";
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  /* ═══════ Loading skeleton ═══════ */
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/3" />
        <div className="h-4 bg-muted rounded w-1/5" />
        <div className="flex gap-4 mt-4">
          <div className="h-10 bg-muted rounded-lg flex-1" />
          <div className="h-10 bg-muted rounded-lg w-44" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-52 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  /* ═══════ Render ═══════ */
  return (
    <div className="space-y-8">
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
        <p className="text-muted-foreground mt-1">
          Manage academic departments across the institution.
        </p>
      </div>

      {/* ── Toolbar: Search + Add ── */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />

          <input
            type="text"
            placeholder="Search by name or code…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-slate-500"
          />
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm shadow-lg shadow-violet-600/20 transition-all whitespace-nowrap"
        >
          <Plus size={18} /> Add Department
        </button>
      </div>

      {/* ── Empty state ── */}
      {filtered.length === 0 && (
        <div className="glass-card rounded-xl flex flex-col items-center justify-center py-20 text-center">
          <div className="p-4 rounded-full bg-violet-500/10 mb-4">
            <FolderOpen size={40} className="text-violet-500" />
          </div>
          <h3 className="text-lg font-semibold">No departments found</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            {search
              ? "No departments match your search. Try a different query."
              : "Get started by creating your first department."}
          </p>
          {!search && (
            <button
              onClick={openCreate}
              className="mt-6 flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-all"
            >
              <Plus size={16} /> Create Department
            </button>
          )}
        </div>
      )}

      {/* ── Department cards grid ── */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((dept) => (
            <div
              key={dept.id}
              className="glass-card rounded-xl border border-slate-800/60 p-6 flex flex-col justify-between hover:border-violet-500/30 transition-all group"
            >
              {/* Card top */}
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-violet-500/10 text-violet-500">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-base leading-tight">
                        {dept.name}
                      </h3>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-violet-500/15 text-violet-400 rounded-md">
                        {dept.code}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(dept)}
                      className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-violet-400 transition-all"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(dept)}
                      className="p-1.5 rounded-md hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 min-h-[2.5rem]">
                  {dept.description || "No description provided."}
                </p>
              </div>

              {/* Card bottom stats */}
              <div className="mt-5 pt-4 border-t border-slate-800/60 flex items-center gap-5 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5" title="Students">
                  <Users size={13} className="text-blue-400" />
                  <span className="font-semibold text-slate-300">
                    {dept._count.users}
                  </span>
                  <span>students</span>
                </div>
                <div className="flex items-center gap-1.5" title="Subjects">
                  <BookOpen size={13} className="text-emerald-400" />
                  <span className="font-semibold text-slate-300">
                    {dept._count.subjects}
                  </span>
                  <span>subjects</span>
                </div>
                <div
                  className="flex items-center gap-1.5 ml-auto"
                  title="Created"
                >
                  <Calendar size={12} />
                  <span>{formatDate(dept.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══════ Create / Edit Modal ═══════ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Panel */}
          <div className="relative w-full max-w-lg mx-4 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl shadow-black/40 animate-in fade-in zoom-in-95">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-violet-500/10 text-violet-500">
                  <Building2 size={18} />
                </div>
                <h2 className="text-lg font-bold">
                  {editingDept ? "Edit Department" : "Add Department"}
                </h2>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Department Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Computer Science"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-slate-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Department Code <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Hash
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />

                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) =>
                      setForm({ ...form, code: e.target.value.toUpperCase() })
                    }
                    placeholder="e.g. CS"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-3 text-sm uppercase tracking-wider focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-slate-600 placeholder:normal-case placeholder:tracking-normal"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Brief description of the department…"
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all resize-none placeholder:text-slate-600"
                />
              </div>

              {/* Modal footer */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium border border-slate-800 hover:bg-slate-800 text-slate-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-600/20 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving…
                    </>
                  ) : editingDept ? (
                    "Update Department"
                  ) : (
                    "Create Department"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════ Delete Confirmation Dialog ═══════ */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDeleteTarget(null)}
          />

          <div className="relative w-full max-w-md mx-4 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl shadow-black/40 p-6 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
              <AlertTriangle size={28} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold">Delete Department</h3>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-white">
                "{deleteTarget.name}"
              </span>
              ? This action cannot be undone and may affect related subjects and
              users.
            </p>

            <div className="flex gap-3 mt-6 justify-center">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-5 py-2.5 rounded-lg text-sm font-medium border border-slate-800 hover:bg-slate-800 text-slate-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deleting…
                  </>
                ) : (
                  <>
                    <Trash2 size={14} /> Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;
