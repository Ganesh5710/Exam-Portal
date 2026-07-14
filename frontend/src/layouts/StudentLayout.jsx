import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { LogOut, Sun, Moon, Shield } from "lucide-react";

export const StudentLayout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-200">
      {/* Header Bar */}
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center font-black text-white text-sm shadow-md shadow-violet-500/20">
              SB
            </div>
            <span className="text-lg font-extrabold tracking-tight text-foreground">
              Skill<span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">brix</span> Student Workspace
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold">
                {user?.firstName} {user?.lastName}
              </p>
              <span className="text-xs text-muted-foreground">
                {user?.email}
              </span>
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-accent rounded-lg text-muted-foreground transition-colors"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main workspace */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  );
};
export default StudentLayout;
