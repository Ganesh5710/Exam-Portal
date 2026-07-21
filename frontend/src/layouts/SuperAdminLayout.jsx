import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  Crown,
  Building2,
  ShieldAlert,
  Cpu,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  LayoutDashboard,
  ExternalLink,
  Activity,
} from "lucide-react";

export const SuperAdminLayout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { name: "SaaS Command Center", path: "/superadmin/dashboard", icon: LayoutDashboard },
    { name: "Institutions & Tenants", path: "/superadmin/institutions", icon: Building2 },
    { name: "Master Audit Trail", path: "/superadmin/audit-logs", icon: ShieldAlert },
    { name: "AI Operations & Tokens", path: "/superadmin/ai-usage", icon: Cpu },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground transition-colors duration-200">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between w-full h-16 px-4 border-b border-border bg-card fixed top-0 left-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-violet-600 rounded-lg flex items-center justify-center font-black text-white text-sm shadow-md shadow-amber-500/20">
            <Crown size={16} />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-foreground">
            Skill<span className="bg-gradient-to-r from-amber-400 to-violet-500 bg-clip-text text-transparent">brix</span>
            <span className="text-xs ml-1.5 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold uppercase">Super</span>
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 flex flex-col bg-card border-r border-border transition-all duration-300 ${
          collapsed ? "w-20" : "w-64"
        } ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-border">
          <div className={`flex items-center gap-3 ${collapsed ? "justify-center w-full" : ""}`}>
            <div className="w-9 h-9 bg-gradient-to-r from-amber-500 to-violet-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
              <Crown size={20} />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-lg font-extrabold tracking-tight">
                  Skill<span className="bg-gradient-to-r from-amber-400 to-violet-500 bg-clip-text text-transparent">brix</span>
                </span>
                <span className="text-[10px] font-bold tracking-wider text-amber-400 uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Super Admin
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {!collapsed && (
            <div className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              SaaS Control Hub
            </div>
          )}
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 group ${
                  isActive
                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-md shadow-amber-500/5"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
                title={collapsed ? item.name : undefined}
              >
                <Icon
                  size={18}
                  className={`transition-colors ${
                    isActive ? "text-amber-400" : "text-muted-foreground group-hover:text-foreground"
                  }`}
                />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t border-border">
            {!collapsed && (
              <div className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Cross-Portal Access
              </div>
            )}
            <Link
              to="/admin/dashboard"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs text-violet-400 hover:bg-violet-500/10 border border-violet-500/20 transition-all"
            >
              <ExternalLink size={16} />
              {!collapsed && <span>Single College Admin</span>}
            </Link>
          </div>
        </nav>

        {/* Footer User & Theme Switcher */}
        <div className="p-3 border-t border-border bg-accent/20 space-y-2">
          {/* User Info */}
          <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : "px-2 py-1.5"}`}>
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs">
              👑
            </div>
            {!collapsed && (
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-bold truncate text-foreground">
                  {user?.firstName || "Global"} {user?.lastName || "Super Admin"}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
              </div>
            )}
          </div>

          {/* Theme & Logout Buttons */}
          <div className={`flex gap-1.5 ${collapsed ? "flex-col" : "items-center"}`}>
            <button
              onClick={toggleTheme}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground text-xs font-semibold transition-all"
              title="Toggle Theme"
            >
              {theme === "dark" ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-violet-400" />}
              {!collapsed && <span>{theme === "dark" ? "Light" : "Dark"}</span>}
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-semibold transition-all"
              title="Sign Out"
            >
              <LogOut size={14} />
              {!collapsed && <span>Exit</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-20 md:pt-8 bg-background">
        <div className="max-w-7xl mx-auto space-y-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default SuperAdminLayout;
