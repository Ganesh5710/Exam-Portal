import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";

// Layout Imports
import AuthLayout from "./layouts/AuthLayout";
import AdminLayout from "./layouts/AdminLayout";
import StudentLayout from "./layouts/StudentLayout";

// Page Imports
import Login from "./pages/auth/Login";
import Landing from "./pages/public/Landing";
import Dashboard from "./pages/admin/Dashboard";
import LiveMonitor from "./pages/admin/LiveMonitor";
import Students from "./pages/admin/Students";
import Departments from "./pages/admin/Departments";
import Questions from "./pages/admin/Questions";
import QuestionImport from "./pages/admin/QuestionImport";
import ExamsPortal from "./pages/admin/ExamsPortal";
import Results from "./pages/admin/Results";
import Settings from "./pages/admin/Settings";
import ExamList from "./pages/student/ExamList";
import ExamInstructions from "./pages/student/ExamInstructions";
import CompatibilityCheck from "./pages/student/CompatibilityCheck";
import ExamTerminal from "./pages/student/ExamTerminal";
import SubmissionConfirmation from "./pages/student/SubmissionConfirmation";

// Route guards
// Prevents unauthorized navigation by validating user roles and authentication status.
// Redirects unauthenticated users to /login and handles role-based fallback pathways.
const RequireAuth = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-sm text-slate-400">
        Loading Session Modules...
      </div>
    );
  }

  // Redirect to login if user object does not exist in local auth state context
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Enforce role authorization parameters (e.g. STUDENT / ADMIN)
  if (user.role !== allowedRole) {
    return (
      <Navigate
        to={user.role === "ADMIN" ? "/admin/dashboard" : "/student/exams"}
        replace
      />
    );
  }

  return <>{children}</>;
};

export const App = () => {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#0D111E",
            color: "#fff",
            border: "1px solid #1E293B",
          },
        }}
      />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />

        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Admin Console Route Paths */}
        <Route
          path="/admin"
          element={
            <RequireAuth allowedRole="ADMIN">
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="monitor" element={<LiveMonitor />} />
          <Route path="settings" element={<Settings />} />
          {/* Admin module routes */}
          <Route path="students" element={<Students />} />
          <Route path="departments" element={<Departments />} />
          <Route path="questions" element={<Questions />} />
          <Route path="import" element={<QuestionImport />} />
          <Route path="exams" element={<ExamsPortal />} />
          <Route path="results" element={<Results />} />
          <Route path="analytics" element={<Dashboard />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Student Terminal Route Paths */}
        <Route
          path="/student"
          element={
            <RequireAuth allowedRole="STUDENT">
              <StudentLayout />
            </RequireAuth>
          }
        >
          <Route path="exams" element={<ExamList />} />
          <Route path="exams/:id/instructions" element={<ExamInstructions />} />
          <Route
            path="exams/:id/compatibility"
            element={<CompatibilityCheck />}
          />
          <Route
            path="exams/:id/confirmation"
            element={<SubmissionConfirmation />}
          />
          <Route index element={<Navigate to="exams" replace />} />
        </Route>

        {/* Special standalone route for exam terminal to prevent navigation distraction */}
        <Route
          path="/student/exams/:id/terminal"
          element={
            <RequireAuth allowedRole="STUDENT">
              <ExamTerminal />
            </RequireAuth>
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
export default App;
