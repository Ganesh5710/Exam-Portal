import React, { useEffect, useState, useCallback } from 'react';
import api from '../../services/api';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Users,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  UserPlus,
  Filter,
  Mail,
  Lock,
  User,
  Building2,
  CheckSquare,
  Square,
  AlertOctagon
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Types ───────────────────────────────────────────────────────────

interface Department {
  id: string;
  name: string;
  code: string;
}

interface Student {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
  departmentId: string;
  department?: { name: string; code: string };
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface StudentFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  departmentId: string;
}

interface EditFormData {
  firstName: string;
  lastName: string;
  departmentId: string;
  status: string;
}

// ─── Component ───────────────────────────────────────────────────────

export const Students: React.FC = () => {
  // Data state
  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Loading state
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Bulk select state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [createForm, setCreateForm] = useState<StudentFormData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    departmentId: '',
  });

  const [editForm, setEditForm] = useState<EditFormData>({
    firstName: '',
    lastName: '',
    departmentId: '',
    status: '',
  });

  // ─── Debounce search ────────────────────────────────────────────────

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ─── Fetch departments ─────────────────────────────────────────────

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      setDepartments(res.data.data || []);
    } catch {
      // Silent fail — department filter simply won't show options
    }
  };

  // ─── Fetch students ─────────────────────────────────────────────────

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', String(pagination.page));
      params.append('limit', String(pagination.limit));
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (filterDepartment) params.append('departmentId', filterDepartment);

      const res = await api.get(`/users?${params.toString()}`);
      const data = res.data.data;
      setStudents(data.students || []);
      if (data.pagination) {
        setPagination((prev) => ({
          ...prev,
          total: data.pagination.total || 0,
          pages: data.pagination.pages || 0,
        }));
      }
    } catch {
      toast.error('Failed to load students.');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, debouncedSearch, filterDepartment]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Reset page on filter change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [debouncedSearch, filterDepartment]);

  // ─── CRUD operations ────────────────────────────────────────────────

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.email || !createForm.password || !createForm.firstName || !createForm.lastName) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/users', createForm);
      toast.success('Student created successfully!');
      setShowCreateModal(false);
      resetCreateForm();
      fetchStudents();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to create student.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setSubmitting(true);
    try {
      await api.put(`/users/${selectedStudent.id}`, editForm);
      toast.success('Student updated successfully!');
      setShowEditModal(false);
      setSelectedStudent(null);
      fetchStudents();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update student.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedStudent) return;
    setSubmitting(true);
    try {
      await api.delete(`/users/${selectedStudent.id}`);
      toast.success('Student deleted successfully!');
      setShowDeleteModal(false);
      setSelectedStudent(null);
      fetchStudents();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete student.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleBlock = async (student: Student) => {
    setActionLoading(student.id);
    try {
      await api.patch(`/users/${student.id}/toggle-block`);
      const action = student.status === 'BLOCKED' ? 'unblocked' : 'blocked';
      toast.success(`Student ${student.firstName} ${action} successfully!`);
      fetchStudents();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to toggle student status.';
      toast.error(msg);
    } finally {
      setActionLoading(null);
    }
  };

  // ─── Helpers ─────────────────────────────────────────────────────────

  const resetCreateForm = () => {
    setCreateForm({ email: '', password: '', firstName: '', lastName: '', departmentId: '' });
  };

  const openEditModal = (student: Student) => {
    setSelectedStudent(student);
    setEditForm({
      firstName: student.firstName,
      lastName: student.lastName,
      departmentId: student.departmentId || '',
      status: student.status,
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (student: Student) => {
    setSelectedStudent(student);
    setShowDeleteModal(true);
  };

  // ── Bulk select helpers ───────────────────────────────────────────────
  const allSelected = students.length > 0 && students.every(s => selectedIds.has(s.id));
  const someSelected = students.some(s => selectedIds.has(s.id)) && !allSelected;

  const toggleSelectAll = () => {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(students.map(s => s.id)));
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
      await api.delete('/users/bulk', { data: { ids: Array.from(selectedIds) } });
      toast.success(`Deleted ${selectedIds.size} student(s) successfully!`);
      setSelectedIds(new Set());
      setShowBulkDeleteModal(false);
      fetchStudents();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Bulk delete failed.');
    } finally {
      setBulkDeleting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const goToPage = (page: number) => {
    if (page < 1 || page > pagination.pages) return;
    setPagination((prev) => ({ ...prev, page }));
  };

  // ─── Render ──────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-950 p-6 lg:p-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Student Management</h1>
          <p className="text-slate-400 mt-1 text-sm">
            Manage student accounts, enrollment, and access control.
          </p>
        </div>
        <button
          onClick={() => {
            resetCreateForm();
            setShowCreateModal(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-lg text-sm transition-all duration-200 shadow-lg shadow-violet-600/20"
        >
          <UserPlus size={18} />
          Add Student
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
          />
        </div>

        {/* Department Filter */}
        <div className="relative sm:w-64">
          <Filter
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all appearance-none"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name} ({dept.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-slate-900/80 border border-slate-800/50 rounded-xl overflow-hidden">
        {loading ? (
          /* Loading Skeleton */
          <div className="animate-pulse">
            <div className="grid grid-cols-6 gap-4 px-6 py-4 border-b border-slate-800/50">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-4 bg-slate-800/60 rounded" />
              ))}
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="grid grid-cols-6 gap-4 px-6 py-5 border-b border-slate-800/30">
                {[...Array(6)].map((_, j) => (
                  <div key={j} className="h-4 bg-slate-800/40 rounded" />
                ))}
              </div>
            ))}
          </div>
        ) : students.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800/50 rounded-full mb-4">
              <Users size={28} className="text-slate-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-300 mb-1">No Students Found</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              {debouncedSearch || filterDepartment
                ? 'No students match your search criteria. Try adjusting the filters.'
                : 'Get started by adding your first student to the portal.'}
            </p>
            {!debouncedSearch && !filterDepartment && (
              <button
                onClick={() => {
                  resetCreateForm();
                  setShowCreateModal(true);
                }}
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-lg text-sm transition-all"
              >
                <Plus size={16} />
                Add First Student
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800/50">
                    <th className="px-4 py-4 w-10">
                      <button onClick={toggleSelectAll} className="text-slate-400 hover:text-violet-400 transition-colors">
                        {allSelected ? <CheckSquare size={16} className="text-violet-400" /> : someSelected ? <CheckSquare size={16} className="text-violet-400/50" /> : <Square size={16} />}
                      </button>
                    </th>
                    <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Name</th>
                    <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Email</th>
                    <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Department</th>
                    <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Status</th>
                    <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Created</th>
                    <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr
                      key={student.id}
                      className={`border-b border-slate-800/30 hover:bg-slate-800/30 transition-colors duration-150 ${selectedIds.has(student.id) ? 'bg-violet-500/5' : ''}`}
                    >
                      <td className="px-4 py-4">
                        <button onClick={() => toggleSelect(student.id)} className="text-slate-500 hover:text-violet-400 transition-colors">
                          {selectedIds.has(student.id) ? <CheckSquare size={16} className="text-violet-400" /> : <Square size={16} />}
                        </button>
                      </td>
                      {/* Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-semibold text-violet-400">
                              {student.firstName?.charAt(0)?.toUpperCase()}
                              {student.lastName?.charAt(0)?.toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">
                              {student.firstName} {student.lastName}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-400">{student.email}</span>
                      </td>

                      {/* Department */}
                      <td className="px-6 py-4">
                        {student.department ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/60 rounded-md text-xs font-medium text-slate-300">
                            <Building2 size={12} className="text-slate-500" />
                            {student.department.name}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-600">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {student.status === 'ACTIVE' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-semibold text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-xs font-semibold text-red-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                            Blocked
                          </span>
                        )}
                      </td>

                      {/* Created */}
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-500">{formatDate(student.createdAt)}</span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Toggle Block */}
                          <button
                            onClick={() => handleToggleBlock(student)}
                            disabled={actionLoading === student.id}
                            title={student.status === 'BLOCKED' ? 'Unblock Student' : 'Block Student'}
                            className={`p-2 rounded-lg text-sm transition-all duration-200 disabled:opacity-50 ${
                              student.status === 'BLOCKED'
                                ? 'hover:bg-emerald-500/10 text-emerald-400'
                                : 'hover:bg-amber-500/10 text-amber-400'
                            }`}
                          >
                            {actionLoading === student.id ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : student.status === 'BLOCKED' ? (
                              <ShieldCheck size={15} />
                            ) : (
                              <ShieldAlert size={15} />
                            )}
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => openEditModal(student)}
                            title="Edit Student"
                            className="p-2 rounded-lg hover:bg-violet-500/10 text-slate-400 hover:text-violet-400 transition-all duration-200"
                          >
                            <Edit3 size={15} />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => openDeleteModal(student)}
                            title="Delete Student"
                            className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all duration-200"
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

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800/50">
              <p className="text-sm text-slate-500">
                Showing{' '}
                <span className="font-medium text-slate-300">
                  {(pagination.page - 1) * pagination.limit + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium text-slate-300">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{' '}
                of{' '}
                <span className="font-medium text-slate-300">{pagination.total}</span> students
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-lg text-sm font-medium text-slate-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
                <span className="px-3 py-2 text-sm text-slate-400">
                  Page {pagination.page} of {pagination.pages || 1}
                </span>
                <button
                  onClick={() => goToPage(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-lg text-sm font-medium text-slate-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Floating Bulk Action Bar ─────────────────────────────────── */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 px-6 py-3.5 bg-slate-900 border border-violet-500/30 rounded-2xl shadow-2xl shadow-violet-500/10 backdrop-blur-md">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <CheckSquare size={16} className="text-violet-400" />
            <span className="text-violet-400">{selectedIds.size}</span> student{selectedIds.size !== 1 ? 's' : ''} selected
          </div>
          <div className="w-px h-5 bg-slate-700" />
          <button onClick={() => setSelectedIds(new Set())} className="text-xs text-slate-400 hover:text-white transition-colors">Clear</button>
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
                <h2 className="text-lg font-bold text-white">Delete {selectedIds.size} Students?</h2>
                <p className="text-xs text-slate-400">This permanently removes all selected student accounts and their data.</p>
              </div>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-slate-400">This action <span className="text-red-400 font-semibold">cannot be undone</span>. All selected students will lose access and their exam submissions may also be removed.</p>
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

      {/* ═══════════════ CREATE MODAL ═══════════════ */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-lg mx-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-500/10 rounded-lg">
                  <UserPlus size={20} className="text-violet-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Add New Student</h2>
                  <p className="text-xs text-slate-500">Create a new student account</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreate} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    First Name *
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={createForm.firstName}
                      onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                      placeholder="John"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Last Name *
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={createForm.lastName}
                      onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
                      placeholder="Doe"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    placeholder="student@university.edu"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    placeholder="Minimum 8 characters"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Department
                </label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <select
                    value={createForm.departmentId}
                    onChange={(e) => setCreateForm({ ...createForm, departmentId: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all appearance-none"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm font-medium text-slate-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-lg text-sm transition-all shadow-lg shadow-violet-600/20 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Create Student
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════ EDIT MODAL ═══════════════ */}
      {showEditModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowEditModal(false)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-lg mx-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-500/10 rounded-lg">
                  <Edit3 size={20} className="text-violet-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Edit Student</h2>
                  <p className="text-xs text-slate-500">
                    Update info for {selectedStudent.firstName} {selectedStudent.lastName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEdit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={editForm.firstName}
                      onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Last Name
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={editForm.lastName}
                      onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Email (read-only)
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                  <input
                    type="email"
                    value={selectedStudent.email}
                    disabled
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/50 border border-slate-800/50 rounded-lg text-sm text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Department
                </label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <select
                    value={editForm.departmentId}
                    onChange={(e) => setEditForm({ ...editForm, departmentId: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all appearance-none"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all appearance-none"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="BLOCKED">Blocked</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm font-medium text-slate-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-lg text-sm transition-all shadow-lg shadow-violet-600/20 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Edit3 size={16} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════ DELETE CONFIRMATION MODAL ═══════════════ */}
      {showDeleteModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(false)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-md mx-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">
            <div className="p-6 text-center space-y-4">
              {/* Warning Icon */}
              <div className="inline-flex items-center justify-center w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-full mx-auto">
                <AlertTriangle size={28} className="text-red-400" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-white">Delete Student</h2>
                <p className="text-sm text-slate-400 mt-2">
                  Are you sure you want to permanently delete{' '}
                  <span className="font-semibold text-white">
                    {selectedStudent.firstName} {selectedStudent.lastName}
                  </span>
                  ? This action cannot be undone.
                </p>
              </div>

              {/* Student info card */}
              <div className="bg-slate-950/50 border border-slate-800/50 rounded-lg p-3 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                    <span className="text-sm font-semibold text-red-400">
                      {selectedStudent.firstName?.charAt(0)?.toUpperCase()}
                      {selectedStudent.lastName?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {selectedStudent.firstName} {selectedStudent.lastName}
                    </p>
                    <p className="text-xs text-slate-500">{selectedStudent.email}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm font-medium text-slate-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg text-sm transition-all shadow-lg shadow-red-600/20 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Delete Student
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
