import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  HelpCircle,
  FileText,
  Activity,
  BarChart3,
  ClipboardList,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  Building,
  Settings,
  UploadCloud,
} from "lucide-react";

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Students", path: "/admin/students", icon: Users },
    { name: "Departments", path: "/admin/departments", icon: Building },
    { name: "Subjects", path: "/admin/subjects", icon: BookOpen },
    { name: "Questions Bank", path: "/admin/questions", icon: HelpCircle },
    { name: "AI Question Importer", path: "/admin/import", icon: UploadCloud },
    { name: "Exams Portal", path: "/admin/exams", icon: ClipboardList },
    { name: "Live Monitor", path: "/admin/monitor", icon: Activity },
    { name: "Results & Review", path: "/admin/results", icon: FileText },
    { name: "Analytics", path: "/admin/analytics", icon: BarChart3 },
    { name: "Settings & Backups", path: "/admin/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground transition-colors duration-200">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between w-full h-16 px-4 border-b border-border bg-card fixed top-0 left-0 z-40">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
            SecureExam
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-foreground"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-50 flex flex-col h-full border-r border-border bg-card transition-all duration-300 md:relative
        ${collapsed ? "w-20" : "w-64"}
        ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-border">
          {!collapsed && (
            <span className="text-xl font-bold bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
              SecureExam
            </span>
          )}
          {collapsed && (
            <span className="text-xl font-bold text-violet-500 mx-auto">
              🛡️
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:block p-1 hover:bg-accent rounded text-muted-foreground"
          >
            {collapsed ? "→" : "←"}
          </button>
        </div>

        {/* User Details */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center font-semibold text-white">
              {user?.firstName[0]}
              {user?.lastName[0]}
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <span className="text-xs text-violet-400 capitalize">
                  {user?.role.toLowerCase()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Links Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                  ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                  }
                `}
              >
                <Icon size={20} />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-border space-y-2">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-4 w-full px-4 py-3 rounded-lg text-sm font-medium hover:bg-accent text-muted-foreground"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            {!collapsed && <span>Toggle Theme</span>}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 w-full px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10"
          >
            <LogOut size={20} />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto md:pt-0 pt-16">
        <div className="container mx-auto p-6 md:p-8 space-y-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
export default AdminLayout;
