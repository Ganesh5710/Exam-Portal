import React, { useEffect, useState, useMemo } from "react";
import api from "../../services/api";
import {
  BookOpen,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Filter,
  AlertTriangle,
  GraduationCap,
  Hash,
  ChevronDown,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";

const emptyForm = {
  name: "",
  code: "",
  course: "",
  semester: 1,
  departmentId: "",
};

/* ═══════════════════════════════════════════
   Subjects Page
   ═══════════════════════════════════════════ */
export const Subjects = () => {
  /* ── state ── */
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  /* ── data fetching ── */
  const fetchSubjects = async () => {
    try {
      const res = await api.get("/subjects");
      setSubjects(res.data.data);
    } catch {
      toast.error("Failed to load subjects.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get("/departments");
      setDepartments(res.data.data);
    } catch {
      toast.error("Failed to load departments.");
    }
  };

  useEffect(() => {
    fetchSubjects();
    fetchDepartments();
  }, []);

  /* ── filtered list ── */
  const filtered = useMemo(() => {
    let result = subjects;
    if (deptFilter) {
      result = result.filter((s) => s.departmentId === deptFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.code.toLowerCase().includes(q) ||
          s.course.toLowerCase().includes(q),
      );
    }
    return result;
  }, [subjects, search, deptFilter]);

  /* ── modal helpers ── */
  const openCreate = () => {
    setEditingSubject(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (subject) => {
    setEditingSubject(subject);
    setForm({
      name: subject.name,
      code: subject.code,
      course: subject.course,
      semester: subject.semester,
      departmentId: subject.departmentId,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSubject(null);
    setForm(emptyForm);
  };

  /* ── CRUD handlers ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.departmentId) {
      toast.error("Please select a department.");
      return;
    }
    setSubmitting(true);
    try {
      if (editingSubject) {
        await api.put(`/subjects/${editingSubject.id}`, form);
        toast.success("Subject updated successfully.");
      } else {
        await api.post("/subjects", form);
        toast.success("Subject created successfully.");
      }
      closeModal();
      fetchSubjects();
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
      await api.delete(`/subjects/${deleteTarget.id}`);
      toast.success(`Subject "${deleteTarget.name}" deleted.`);
      setDeleteTarget(null);
      fetchSubjects();
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to delete subject.";
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
        <div className="h-8 bg-muted rounded w-1/4" />
        <div className="h-4 bg-muted rounded w-1/5" />
        <div className="flex gap-4 mt-4">
          <div className="h-10 bg-muted rounded-lg flex-1" />
          <div className="h-10 bg-muted rounded-lg w-48" />
          <div className="h-10 bg-muted rounded-lg w-40" />
        </div>
        <div className="space-y-3 mt-6">
          <div className="h-12 bg-muted rounded-lg" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 bg-muted rounded-lg" />
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
        <h1 className="text-3xl font-bold tracking-tight">Subjects</h1>
        <p className="text-muted-foreground mt-1">
          Manage course subjects and their department assignments.
        </p>
      </div>

      {/* ── Toolbar: Search + Department Filter + Add ── */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />

          <input
            type="text"
            placeholder="Search by name, code, or course…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-slate-500"
          />
        </div>

        <div className="relative">
          <Filter
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="appearance-none bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-10 py-2.5 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all text-slate-300 min-w-[180px]"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm shadow-lg shadow-violet-600/20 transition-all whitespace-nowrap"
        >
          <Plus size={18} /> Add Subject
        </button>
      </div>

      {/* ── Empty state ── */}
      {filtered.length === 0 && (
        <div className="glass-card rounded-xl flex flex-col items-center justify-center py-20 text-center">
          <div className="p-4 rounded-full bg-violet-500/10 mb-4">
            <FileText size={40} className="text-violet-500" />
          </div>
          <h3 className="text-lg font-semibold">No subjects found</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            {search || deptFilter
              ? "No subjects match your filters. Try adjusting your search."
              : "Get started by creating your first subject."}
          </p>
          {!search && !deptFilter && (
            <button
              onClick={openCreate}
              className="mt-6 flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-all"
            >
              <Plus size={16} /> Create Subject
            </button>
          )}
        </div>
      )}

      {/* ── Data Table ── */}
      {filtered.length > 0 && (
        <div className="glass-card rounded-xl border border-slate-800/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left px-6 py-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                    Name
                  </th>
                  <th className="text-left px-6 py-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                    Code
                  </th>
                  <th className="text-left px-6 py-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                    Course
                  </th>
                  <th className="text-center px-6 py-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                    Semester
                  </th>
                  <th className="text-left px-6 py-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                    Department
                  </th>
                  <th className="text-right px-6 py-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filtered.map((subject) => (
                  <tr
                    key={subject.id}
                    className="hover:bg-slate-800/30 transition-colors group"
                  >
                    {/* Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-violet-500/10 text-violet-500">
                          <BookOpen size={16} />
                        </div>
                        <span className="font-medium text-white">
                          {subject.name}
                        </span>
                      </div>
                    </td>

                    {/* Code */}
                    <td className="px-6 py-4">
                      <span className="inline-block px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 rounded-md">
                        {subject.code}
                      </span>
                    </td>

                    {/* Course */}
                    <td className="px-6 py-4 text-slate-300">
                      {subject.course}
                    </td>

                    {/* Semester */}
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold text-xs">
                        {subject.semester}
                      </span>
                    </td>

                    {/* Department */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <GraduationCap size={14} className="text-blue-400" />
                        <span className="text-slate-300">
                          {subject.department.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          ({subject.department.code})
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(subject)}
                          className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-violet-400 transition-all"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(subject)}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          <div className="px-6 py-3 border-t border-slate-800 text-xs text-muted-foreground flex items-center justify-between">
            <span>
              Showing{" "}
              <span className="font-semibold text-slate-300">
                {filtered.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-300">
                {subjects.length}
              </span>{" "}
              subjects
            </span>
            {(search || deptFilter) && (
              <button
                onClick={() => {
                  setSearch("");
                  setDeptFilter("");
                }}
                className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
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
                  <BookOpen size={18} />
                </div>
                <h2 className="text-lg font-bold">
                  {editingSubject ? "Edit Subject" : "Add Subject"}
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
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Subject Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Data Structures & Algorithms"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-slate-600"
                  required
                />
              </div>

              {/* Code + Course */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Subject Code <span className="text-red-400">*</span>
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
                      placeholder="e.g. CS201"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-3 text-sm uppercase tracking-wider focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-slate-600 placeholder:normal-case placeholder:tracking-normal"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Course <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.course}
                    onChange={(e) =>
                      setForm({ ...form, course: e.target.value })
                    }
                    placeholder="e.g. B.Tech"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-slate-600"
                    required
                  />
                </div>
              </div>

              {/* Semester + Department */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Semester <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={form.semester}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        semester: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Department <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={form.departmentId}
                      onChange={(e) =>
                        setForm({ ...form, departmentId: e.target.value })
                      }
                      className="appearance-none w-full bg-slate-900 border border-slate-800 rounded-lg p-3 pr-10 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all text-slate-300"
                      required
                    >
                      <option value="">Select department</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.code})
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                    />
                  </div>
                </div>
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
                  ) : editingSubject ? (
                    "Update Subject"
                  ) : (
                    "Create Subject"
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
            <h3 className="text-lg font-bold">Delete Subject</h3>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-white">
                "{deleteTarget.name}"
              </span>
              ? This action cannot be undone and may affect associated exams and
              questions.
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

export default Subjects;
