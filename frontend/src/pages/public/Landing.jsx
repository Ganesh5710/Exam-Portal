import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import ModernSaaSBackground from "../../components/ModernSaaSBackground";
import {
  Shield,
  ArrowRight,
  CheckCircle,
  Cpu,
  Activity,
  Video,
  Lock,
  Database,
  BarChart3,
  Zap,
  Server,
  Code,
  Sparkles,
  Terminal,
  Layers,
  Globe,
  RefreshCw,
  FileText,
  Radio,
  Check,
  ChevronRight,
  Sun,
  Moon,
  AlertTriangle,
  Award,
} from "lucide-react";

export const Landing = () => {
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === "dark";

  // Interactive State Controls
  const [activeArchTab, setActiveArchTab] = useState("backend");
  const [mockFeedActive, setMockFeedActive] = useState(true);

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      {/* ─── AMBIENT GLOWING AURAS & GRID BACKGROUND ───────────────── */}
      <ModernSaaSBackground />
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[380px] bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-96 left-1/4 w-[500px] h-[320px] bg-cyan-500/15 rounded-full blur-[130px] pointer-events-none -z-10" />
      <div className="absolute top-[800px] right-1/4 w-[500px] h-[320px] bg-purple-600/15 rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* ─── 1. TOP ENTERPRISE NAVIGATION BAR ─────────────────────── */}
      <header className="sticky top-0 z-50 bg-[#0B0F17]/85 backdrop-blur-2xl border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 via-cyan-400 to-indigo-600 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              SB
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white flex items-center gap-1">
                Skill<span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-300 bg-clip-text text-transparent">brix</span>
              </span>
              <span className="text-[10px] text-cyan-400 tracking-widest font-extrabold uppercase block -mt-1">
                AI Proctoring Platform
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
            <a href="#features" className="hover:text-cyan-400 transition-colors">
              Core Features
            </a>
            <a href="#architecture" className="hover:text-cyan-400 transition-colors">
              Under The Hood
            </a>
            <a href="#proof" className="hover:text-cyan-400 transition-colors">
              Engineering Proof
            </a>
            <a href="#demo" className="hover:text-cyan-400 transition-colors">
              Live Console
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Toggle Dark/Light Mode"
            >
              {isDarkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
            </button>
            <Link
              to="/login"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-cyan-600 to-indigo-700 hover:from-indigo-500 hover:to-cyan-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 flex items-center gap-2 hover:scale-105 transition-all cursor-pointer border border-indigo-400/30"
            >
              Log In to Portal
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      {/* ─── 2. HERO SECTION ─────────────────────────────────────────── */}
      <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-8">
        {/* Enterprise Badge / Pill */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900/90 border border-indigo-500/40 text-cyan-300 text-xs font-extrabold tracking-wide backdrop-blur-xl shadow-xl shadow-indigo-950/40">
          <Zap size={15} className="text-amber-400 animate-pulse" />
          <span>⚡ Enterprise-Grade Online Examination Platform</span>
        </div>

        {/* Hero Headline */}
        <div className="space-y-5 max-w-5xl mx-auto">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-tight drop-shadow-[0_4px_30px_rgba(255,255,255,0.2)]">
            Secure, Real-Time AI Proctoring Built for{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-teal-300 bg-clip-text text-transparent">
              High-Stakes Assessments
            </span>
          </h1>
          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto font-medium leading-relaxed">
            Skillbrix powers 500+ concurrent candidate exams with zero latency—featuring live webcam monitoring, instant tab-switch alerts, and automated subject analytics.
          </p>
        </div>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-cyan-600 to-indigo-700 hover:from-indigo-500 hover:to-cyan-500 text-white font-extrabold text-base shadow-2xl shadow-indigo-600/40 flex items-center justify-center gap-3 hover:scale-105 transition-all border border-indigo-400/40 cursor-pointer"
          >
            <Shield size={20} />
            Request Enterprise Demo
            <ArrowRight size={18} />
          </Link>
          <a
            href="#architecture"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-base flex items-center justify-center gap-2 backdrop-blur-xl transition-all cursor-pointer"
          >
            <Cpu size={20} className="text-cyan-400" />
            View System Architecture
          </a>
        </div>

        {/* ─── INTERACTIVE HERO DASHBOARD MOCKUP ─────────────────────── */}
        <div id="demo" className="mt-14 relative max-w-5xl mx-auto rounded-3xl p-1.5 bg-gradient-to-b from-indigo-500/40 via-slate-800/80 to-[#0B0F17] border border-indigo-500/40 shadow-2xl backdrop-blur-2xl overflow-hidden">
          <div className="bg-[#0B0F17] rounded-2xl p-5 sm:p-7 border border-slate-800/90 space-y-6 text-left">
            {/* Console Control Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="ml-3 text-xs font-mono text-slate-400">
                  skillbrix-exam.vercel.app/admin/monitor
                </span>
              </div>

              {/* Stream Health & Control Toggle */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMockFeedActive(!mockFeedActive)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white flex items-center gap-2 transition-all cursor-pointer"
                >
                  <RefreshCw size={14} className={mockFeedActive ? "text-cyan-400 animate-spin" : "text-slate-500"} />
                  {mockFeedActive ? "Feed Active (640x480)" : "Feed Paused"}
                </button>
                <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Sockets Synced (Green)
                </span>
              </div>
            </div>

            {/* Dashboard Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Primary Video Feed Box */}
              <div className="md:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-cyan-300 flex items-center gap-2">
                    <Video size={14} className="text-cyan-400 animate-pulse" />
                    LIVE CANDIDATE SURVEILLANCE FEED #104
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    VOLATILE BROADCAST
                  </span>
                </div>

                <div className="aspect-video bg-[#070A0F] rounded-xl border border-slate-800 relative flex items-center justify-center overflow-hidden">
                  {mockFeedActive ? (
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950/70 via-slate-900/90 to-[#0B0F17] flex flex-col items-center justify-center p-6 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center font-black text-indigo-200 text-2xl mb-3 shadow-lg">
                        GB
                      </div>
                      <p className="font-extrabold text-white text-base">Ganesh Bathula</p>
                      <p className="text-xs text-slate-400 font-mono">JEE Advanced Mock Examination 2026</p>
                      <div className="mt-4 flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                          <CheckCircle size={12} />
                          Webcam HD Active
                        </span>
                        <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                          0 Tab Switches
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-500 text-xs font-mono">Camera Feed Paused</div>
                  )}
                </div>
              </div>

              {/* Side Real-Time Security Log */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
                <span className="text-xs font-extrabold text-slate-200 flex items-center gap-2">
                  <Shield size={14} className="text-amber-400" />
                  PROCTORING THREAT AUDIT
                </span>
                <div className="space-y-2.5 text-xs font-mono">
                  <div className="p-3 bg-[#070A0F] border border-slate-800 rounded-xl">
                    <p className="text-emerald-400 font-bold">10:52:01 PM - Student Auth Success</p>
                    <p className="text-slate-400 text-[10px] mt-0.5">Role verified via JWT token</p>
                  </div>
                  <div className="p-3 bg-[#070A0F] border border-slate-800 rounded-xl">
                    <p className="text-cyan-400 font-bold">10:52:15 PM - Fullscreen Lock Active</p>
                    <p className="text-slate-400 text-[10px] mt-0.5">DOM anti-cheat listener enabled</p>
                  </div>
                  <div className="p-3 bg-[#070A0F] border border-slate-800 rounded-xl">
                    <p className="text-indigo-400 font-bold">10:52:30 PM - Frame Streaming</p>
                    <p className="text-slate-400 text-[10px] mt-0.5">Socket URL: Railway Engine</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. KEY HIGHLIGHTS & STATS RIBBON ─────────────────────────── */}
      <section className="border-y border-slate-800/80 bg-slate-900/50 backdrop-blur-xl py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <h3 className="text-3xl sm:text-4xl font-black text-white">500+</h3>
              <p className="text-xs font-extrabold text-cyan-400 uppercase tracking-wider mt-1">
                Concurrent Test Candidates
              </p>
            </div>
            <div>
              <h3 className="text-3xl sm:text-4xl font-black text-indigo-400">&lt; 1 Sec</h3>
              <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mt-1">
                Sub-Second Query Latency
              </p>
            </div>
            <div>
              <h3 className="text-3xl sm:text-4xl font-black text-emerald-400">Zero-Lag</h3>
              <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mt-1">
                Volatile Frame Broadcasts
              </p>
            </div>
            <div>
              <h3 className="text-3xl sm:text-4xl font-black text-amber-400">Automated</h3>
              <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mt-1">
                Instant Grading & Analytics
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. CORE FEATURE MATRIX (ASYMMETRICAL BENTO GRID) ─────────── */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="text-xs font-extrabold text-cyan-400 uppercase tracking-widest">
            Core Operational Features
          </h2>
          <h3 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Comprehensive Assessment Capabilities
          </h3>
          <p className="text-slate-300 text-base">
            Everything required to create, monitor, evaluate, and publish high-stakes online examinations seamlessly.
          </p>
        </div>

        {/* Asymmetrical Bento Box Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Box 1: Real-Time AI & Live Proctoring (Large) */}
          <div className="md:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl hover:border-indigo-500/50 transition-all group">
            <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl w-fit text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
              <Video size={32} />
            </div>
            <h4 className="text-2xl font-bold text-white mb-3">1. Real-Time AI & Live Proctoring</h4>
            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              WebRTC and Socket.io powered live video frame relays, multi-admin monitoring rooms, and instant threat alert triggers designed to stream HD candidate video directly to the NOC console.
            </p>
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <span className="px-3.5 py-1.5 rounded-xl bg-[#070A0F] border border-slate-800 text-indigo-300">
                Socket.io Engine
              </span>
              <span className="px-3.5 py-1.5 rounded-xl bg-[#070A0F] border border-slate-800 text-cyan-300">
                Multi-Admin Rooms
              </span>
              <span className="px-3.5 py-1.5 rounded-xl bg-[#070A0F] border border-slate-800 text-emerald-300">
                Instant Threat Triggers
              </span>
            </div>
          </div>

          {/* Box 2: Anti-Cheat Engine */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl hover:border-cyan-500/50 transition-all group">
            <div className="p-3.5 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl w-fit text-cyan-400 mb-6 group-hover:scale-110 transition-transform">
              <Lock size={32} />
            </div>
            <h4 className="text-2xl font-bold text-white mb-3">2. Anti-Cheat Engine</h4>
            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              Tab-switch detection, window focus monitoring, webcam occlusion flags, and automated event log timestamping to protect exam integrity.
            </p>
            <span className="text-xs font-bold text-cyan-400 flex items-center gap-1">
              DOM Lockdown Active <ChevronRight size={14} />
            </span>
          </div>

          {/* Box 3: Automated Evaluation & Math Support */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl hover:border-amber-500/50 transition-all group">
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl w-fit text-amber-400 mb-6 group-hover:scale-110 transition-transform">
              <Code size={32} />
            </div>
            <h4 className="text-2xl font-bold text-white mb-3">3. Evaluation & KaTeX Math</h4>
            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              Automated question grading paired with built-in KaTeX rendering for scientific formulas, physics equations, and mathematical notation.
            </p>
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
              Supports Complex Formulas <ChevronRight size={14} />
            </span>
          </div>

          {/* Box 4: Deep Analytics & Instant Results (Large) */}
          <div className="md:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl hover:border-emerald-500/50 transition-all group">
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl w-fit text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
              <BarChart3 size={32} />
            </div>
            <h4 className="text-2xl font-bold text-white mb-3">4. Deep Analytics & Instant Results</h4>
            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              Subject-wise performance tracking (Physics, Chemistry, Mathematics), automated score distribution breakdown, CSV exports, and instant report card publishing.
            </p>
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <span className="px-3.5 py-1.5 rounded-xl bg-[#070A0F] border border-slate-800 text-emerald-300">
                Subject Score Breakdown
              </span>
              <span className="px-3.5 py-1.5 rounded-xl bg-[#070A0F] border border-slate-800 text-amber-300">
                CSV Data Export
              </span>
              <span className="px-3.5 py-1.5 rounded-xl bg-[#070A0F] border border-slate-800 text-cyan-300">
                Teacher Score Overrides
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. TECH STACK & ARCHITECTURE SHOWCASE ("UNDER THE HOOD") ─── */}
      <section id="architecture" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="text-xs font-extrabold text-cyan-400 uppercase tracking-widest">
            System Architecture
          </h2>
          <h3 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Under The Hood Technology Stack
          </h3>
          <p className="text-slate-300 text-base">
            Inspect the high-performance technology layers powering the Skillbrix examination engine.
          </p>
        </div>

        {/* Interactive Architecture Navigation Tabs */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl space-y-8">
          <div className="flex flex-wrap items-center justify-center gap-3 border-b border-slate-800 pb-6">
            {[
              { id: "backend", label: "Backend Engine", icon: Server },
              { id: "database", label: "Database & ORM", icon: Database },
              { id: "realtime", label: "Real-Time Engine", icon: Activity },
              { id: "security", label: "Security & Hardening", icon: Shield },
              { id: "frontend", label: "Modern Frontend UI", icon: Cpu },
            ].map((tab) => {
              const IconComp = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveArchTab(tab.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                    activeArchTab === tab.id
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/40"
                      : "bg-[#070A0F] text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  <IconComp size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content Display */}
          <div className="bg-[#070A0F] rounded-2xl border border-slate-800 p-6 sm:p-8 font-mono text-sm leading-relaxed text-slate-300 animate-fadeIn">
            {activeArchTab === "backend" && (
              <div className="space-y-3">
                <p className="text-indigo-400 font-bold text-base">// Node.js & Express REST API Engine</p>
                <p className="text-slate-300">
                  Handles modular routing across <span className="text-cyan-300">/auth</span>, <span className="text-cyan-300">/exams</span>, <span className="text-cyan-300">/submissions</span>, and <span className="text-cyan-300">/analytics</span>.
                </p>
                <p className="text-slate-400 text-xs">// Deployed live on Railway microservices with sub-100ms average endpoint latency.</p>
              </div>
            )}

            {activeArchTab === "database" && (
              <div className="space-y-3">
                <p className="text-cyan-400 font-bold text-base">// Supabase PostgreSQL & Prisma ORM</p>
                <p className="text-slate-300">
                  Utilizes PostgreSQL managed via Supabase with <span className="text-emerald-300">Prisma ORM</span> for type-safe relational queries, schema migrations, and zero-raw-SQL injection vulnerabilities.
                </p>
                <p className="text-slate-400 text-xs">// Configured with Port 5432 Session Pooling for maximum connection stability.</p>
              </div>
            )}

            {activeArchTab === "realtime" && (
              <div className="space-y-3">
                <p className="text-emerald-400 font-bold text-base">// Socket.io WebSockets Engine</p>
                <p className="text-slate-300">
                  Bi-directional event streaming server for candidate webcam frames, broadcast announcements, and immediate proctoring violation alerts.
                </p>
                <p className="text-slate-400 text-xs">// Emits volatile frame broadcasts to prevent server memory queue spikes.</p>
              </div>
            )}

            {activeArchTab === "security" && (
              <div className="space-y-3">
                <p className="text-amber-400 font-bold text-base">// Enterprise Security & HTTP Hardening</p>
                <p className="text-slate-300">
                  Stateless <span className="text-cyan-300">In-Memory JWT</span> auth verification, salted <span className="text-cyan-300">bcrypt</span> password hashing, Helmet HTTP headers (HSTS, CSP), and Express rate-limiting.
                </p>
                <p className="text-slate-400 text-xs">// Complete protection against brute-force attacks and session hijacking.</p>
              </div>
            )}

            {activeArchTab === "frontend" && (
              <div className="space-y-3">
                <p className="text-purple-400 font-bold text-base">// React + Vite + TailwindCSS Glassmorphism</p>
                <p className="text-slate-300">
                  Single-Page Application built with <span className="text-indigo-300">React</span>, <span className="text-indigo-300">Vite</span>, React Router DOM, Axios interceptors with automatic 401 refresh handlers, KaTeX math renderer, and Tailwind CSS.
                </p>
                <p className="text-slate-400 text-xs">// Optimized production bundle deployed globally on Vercel Edge CDN.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── 6. ENGINEERING ACHIEVEMENTS & PROOF SECTION ──────────────── */}
      <section id="proof" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="text-xs font-extrabold text-cyan-400 uppercase tracking-widest">
            Proven Performance
          </h2>
          <h3 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Key Engineering Achievements
          </h3>
          <p className="text-slate-300 text-base">
            Three high-impact technical optimizations built into the core Skillbrix infrastructure.
          </p>
        </div>

        {/* 3 Callout Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Achievement 1 */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden space-y-4 hover:border-emerald-500/50 transition-all">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                Database Optimization
              </span>
              <Database size={20} className="text-emerald-400" />
            </div>
            <h4 className="text-xl font-bold text-white leading-snug">
              Database Connection Pooling Optimization
            </h4>
            <p className="text-slate-300 text-xs leading-relaxed">
              Optimized Supabase PostgreSQL routing through <span className="text-emerald-400 font-mono font-bold">Port 5432</span> using <span className="text-slate-100 font-mono">connection_limit=10</span>, eliminating connection resets and dropping response times under 1 second.
            </p>
          </div>

          {/* Achievement 2 */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden space-y-4 hover:border-indigo-500/50 transition-all">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-[10px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                Auth Acceleration
              </span>
              <Lock size={20} className="text-indigo-400" />
            </div>
            <h4 className="text-xl font-bold text-white leading-snug">
              In-Memory JWT Authentication Middleware
            </h4>
            <p className="text-slate-300 text-xs leading-relaxed">
              Refactored authorization logic to decode stateless JWT payloads completely in-memory, cutting millions of redundant database roundtrips across API requests.
            </p>
          </div>

          {/* Achievement 3 */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden space-y-4 hover:border-cyan-500/50 transition-all">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-[10px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
                Socket Optimization
              </span>
              <Activity size={20} className="text-cyan-400" />
            </div>
            <h4 className="text-xl font-bold text-white leading-snug">
              Volatile Socket Video Frame Streaming
            </h4>
            <p className="text-slate-300 text-xs leading-relaxed">
              Leveraged <span className="text-cyan-400 font-mono font-bold">socket.volatile.emit()</span> for webcam stream relays, automatically dropping stale video frames during network spikes to keep server memory clean and lag-free.
            </p>
          </div>
        </div>
      </section>

      {/* ─── 7. FINAL CALL-TO-ACTION (CTA) ─────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-indigo-900/60 via-cyan-950/60 to-slate-900/90 border border-indigo-500/40 rounded-3xl p-10 sm:p-16 text-center space-y-6 backdrop-blur-2xl relative overflow-hidden shadow-2xl">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Ready to scale your assessment infrastructure?
          </h2>
          <p className="text-slate-200 max-w-xl mx-auto text-base">
            Experience seamless, tamper-proof examinations powered by modern real-time technology.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-cyan-600 to-indigo-700 hover:from-indigo-500 hover:to-cyan-500 text-white font-extrabold text-base shadow-xl shadow-indigo-600/40 flex items-center justify-center gap-2 hover:scale-105 transition-all cursor-pointer border border-indigo-400/40"
            >
              <Shield size={20} />
              Schedule a Live Demo
              <ArrowRight size={18} />
            </Link>
            <a
              href="#architecture"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-base flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <FileText size={20} className="text-cyan-400" />
              Explore Documentation
            </a>
          </div>
        </div>
      </section>

      {/* ─── 8. FOOTER ────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800/80 bg-[#070A0F] py-12 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 space-y-4">
        <div className="flex items-center justify-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-xs">
            SB
          </div>
          <span className="font-bold text-slate-300 text-sm">Skillbrix Assessment Portal</span>
        </div>
        <p>© 2026 Skillbrix Inc. All rights reserved. Enterprise AI Proctoring & Examination Engine.</p>
      </footer>
    </div>
  );
};

export default Landing;
