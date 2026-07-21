import React, { useEffect, useState, useMemo } from "react";
import api from "../../services/api";
import {
  Building2,
  Plus,
  Search,
  Users,
  BookOpen,
  HelpCircle,
  X,
  Hash,
  Award,
  Calendar,
  CheckCircle2,
  FolderOpen,
} from "lucide-react";
import toast from "react-hot-toast";

const emptyForm = { name: "", code: "", description: "" };

export const InstitutionsManager = () => {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchInstitutions = async () => {
    try {
      const res = await api.get("/superadmin/institutions");
      setInstitutions(res.data.data);
    } catch {
      toast.error("Failed to load institutions list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return institutions;
    const q = search.toLowerCase();
    return institutions.filter(
      (inst) =>
        inst.name.toLowerCase().includes(q) ||
        inst.code.toLowerCase().includes(q),
    );
  }, [institutions, search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/superadmin/institutions", form);
      toast.success("Institution tenant created successfully!");
      setShowModal(false);
      setForm(emptyForm);
      fetchInstitutions();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create institution.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Institutions & Tenants</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage registered universities, colleges, and enterprise SaaS organization tenants.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm shadow-lg shadow-amber-500/20 transition-all whitespace-nowrap"
        >
          <Plus size={18} /> Register Institution
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="text"
          placeholder="Search by institution name or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
        />
      </div>

      {/* Cards Grid */}
      {filtered.length === 0 ? (
        <div className="glass-card rounded-2xl flex flex-col items-center justify-center py-20 text-center border border-border">
          <FolderOpen size={40} className="text-amber-500 mb-3" />
          <h3 className="text-lg font-semibold">No institutions found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting your search criteria or register a new institution tenant.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((inst) => (
            <div
              key={inst.id}
              className="glass-card rounded-2xl border border-border p-6 flex flex-col justify-between hover:border-amber-500/30 transition-all space-y-5"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
                      <Building2 size={22} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base leading-tight">
                        {inst.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 rounded-md">
                          {inst.code}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-violet-500/15 text-violet-400 rounded-md">
                          {inst.tier}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {inst.description || "Registered platform institution tenant."}
                </p>
              </div>

              {/* Institution Counters */}
              <div className="pt-4 border-t border-border grid grid-cols-3 gap-2 text-center">
                <div className="bg-accent/30 p-2 rounded-lg">
                  <span className="block text-xs font-extrabold text-foreground">
                    {inst.studentCount}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-semibold">Students</span>
                </div>
                <div className="bg-accent/30 p-2 rounded-lg">
                  <span className="block text-xs font-extrabold text-foreground">
                    {inst.examCount}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-semibold">Exams</span>
                </div>
                <div className="bg-accent/30 p-2 rounded-lg">
                  <span className="block text-xs font-extrabold text-foreground">
                    {inst.questionCount}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-semibold">Questions</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Building2 size={20} className="text-amber-400" />
                Register New Institution
              </h2>
              <button onClick={() => setShowModal(false)}>
                <X size={18} className="text-muted-foreground hover:text-foreground" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Institution / College Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Stanford Technology Institute"
                  className="w-full bg-background border border-border rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Unique Code <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. STAN"
                  className="w-full bg-background border border-border rounded-xl p-3 text-sm uppercase tracking-wider focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Institution notes or department summary..."
                  rows={3}
                  className="w-full bg-background border border-border rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Create Tenant"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstitutionsManager;
