import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import ModernSaaSBackground from "../../components/ModernSaaSBackground";
import {
  Shield,
  Cpu,
  Zap,
  Activity,
  Video,
  Lock,
  Database,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Terminal,
  ArrowRight,
  FileText,
  Code,
  Server,
  Eye,
  Sun,
  Moon,
  ChevronRight,
  RefreshCw,
  Globe,
  Sparkles,
} from "lucide-react";

export const Landing = () => {
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === "dark";

  // State Management for Interactive Tech Stack Tabs
  const [techTab, setTechTab] = useState("backend");

  return (
    <div className="min-h-screen bg-[#030712] text-gray-50 font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      {/* ─── BACKGROUND FX & AMBIENT GLOW ORBS ─────────────────────── */}
      <ModernSaaSBackground />
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[750px] h-[400px] bg-indigo-600/20 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="absolute top-[600px] left-1/4 w-[500px] h-[320px] bg-cyan-500/15 rounded-full blur-[130px] pointer-events-none -z-10" />
      <div className="absolute top-[1200px] right-1/4 w-[500px] h-[320px] bg-emerald-500/10 rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* ─── SECTION 1: HEADER / NAVIGATION BAR ────────────────────── */}
      <header className="sticky top-0 z-50 bg-[#030712]/85 backdrop-blur-md border-b border-gray-800 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-cyan-500 to-indigo-700 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white flex items-center gap-1">
                Skill<span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-300 bg-clip-text text-transparent">brix</span>
              </span>
              <span className="text-[10px] text-cyan-400 tracking-widest font-extrabold uppercase block -mt-1">
                Enterprise AI Proctoring
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-300">
            <a href="#features" className="hover:text-cyan-400 transition-colors">
              Features
            </a>
            <a href="#architecture" className="hover:text-cyan-400 transition-colors">
              Architecture
            </a>
            <a href="#benchmarks" className="hover:text-cyan-400 transition-colors">
              Engineering Benchmarks
            </a>
            <a href="#techstack" className="hover:text-cyan-400 transition-colors">
              Tech Stack
            </a>
            <a href="#security" className="hover:text-cyan-400 transition-colors">
              Security
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 hover:text-white transition-all cursor-pointer"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
            </button>
            <a
              href="#architecture"
              className="hidden sm:flex px-4 py-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 hover:text-white text-sm font-semibold transition-all"
            >
              Documentation
            </a>
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-cyan-600 to-indigo-700 hover:from-indigo-500 hover:to-cyan-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 flex items-center gap-2 hover:scale-105 transition-all cursor-pointer border border-indigo-400/30"
            >
              Request Enterprise Demo
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      {/* ─── SECTION 2: HERO SECTION ─────────────────────────────────── */}
      <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-8">
        {/* Top Badge Pill */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-gray-900/90 border border-indigo-500/40 text-cyan-300 text-xs font-extrabold tracking-wide backdrop-blur-md shadow-xl">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span>⚡ ENTERPRISE EXAMINATION INFRASTRUCTURE</span>
        </div>

        {/* Main Headline */}
        <div className="space-y-5 max-w-5xl mx-auto">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-gray-50 tracking-tight leading-tight drop-shadow-[0_4px_30px_rgba(255,255,255,0.2)]">
            Secure, Real-Time AI Proctoring Built for{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              High-Stakes Assessments
            </span>
          </h1>
          {/* Subheadline Copy */}
          <p className="text-base sm:text-xl text-gray-300 max-w-3xl mx-auto font-medium leading-relaxed">
            Skillbrix powers 500+ concurrent candidate exams with zero latency. Built on Node.js, Express, React, and Supabase PostgreSQL—delivering live webcam relays, instant tab-switch alerts, and automated subject analytics.
          </p>
        </div>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-cyan-600 to-indigo-700 hover:from-indigo-500 hover:to-cyan-500 text-white font-extrabold text-base shadow-2xl shadow-indigo-600/40 flex items-center justify-center gap-3 hover:scale-105 transition-all border border-indigo-400/40 cursor-pointer animate-pulse"
          >
            <Shield size={20} />
            Schedule Live Demonstration
            <ArrowRight size={18} />
          </Link>
          <a
            href="#architecture"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gray-900/80 hover:bg-gray-800 border border-gray-800 text-gray-200 font-bold text-base flex items-center justify-center gap-2 backdrop-blur-md transition-all cursor-pointer"
          >
            <Cpu size={20} className="text-cyan-400" />
            Explore System Specs
            <ChevronRight size={18} />
          </a>
        </div>

        {/* ─── INTERACTIVE LIVE PROCTORING HERO MOCKUP ───────────────── */}
        <div className="mt-14 relative max-w-5xl mx-auto rounded-2xl p-1.5 bg-gradient-to-b from-indigo-500/40 via-gray-800/80 to-[#030712] border border-gray-800 shadow-2xl backdrop-blur-md overflow-hidden">
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden text-left">
            {/* Top Bar */}
            <div className="bg-[#0B0F17] p-4 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="ml-3 text-xs font-mono text-gray-400">
                  https://proctor.skillbrix.io/live/session-8921
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-extrabold text-emerald-400">
                  LIVE • 512 Candidates Active
                </span>
              </div>
            </div>

            {/* Candidate Stream 4-Card Grid Display */}
            <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1 */}
              <div className="bg-[#030712] border border-gray-800 rounded-xl p-3 space-y-2 relative overflow-hidden">
                <div className="flex justify-between items-center text-[11px] font-bold">
                  <span className="text-gray-200">Candidate #104 - Alex M.</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> 🟢 Normal
                  </span>
                </div>
                <div className="aspect-video bg-gray-900 rounded-lg border border-gray-800/80 flex flex-col items-center justify-center p-3 relative">
                  <div className="w-10 h-10 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold text-sm mb-1">
                    AM
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">Video Stream Active</span>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-[#030712] border border-rose-500/40 rounded-xl p-3 space-y-2 relative overflow-hidden bg-rose-950/10">
                <div className="flex justify-between items-center text-[11px] font-bold">
                  <span className="text-gray-200">Candidate #219 - Sarah T.</span>
                  <span className="text-rose-400 flex items-center gap-1 font-extrabold">
                    <AlertTriangle size={12} /> 🔴 Tab Switch Alert
                  </span>
                </div>
                <div className="aspect-video bg-gray-900 rounded-lg border border-rose-500/30 flex flex-col items-center justify-center p-3 relative">
                  <div className="w-10 h-10 rounded-full bg-rose-600/30 text-rose-300 flex items-center justify-center font-bold text-sm mb-1">
                    ST
                  </div>
                  <span className="text-[10px] text-rose-300 font-mono">Detected 2s ago</span>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-[#030712] border border-gray-800 rounded-xl p-3 space-y-2 relative overflow-hidden">
                <div className="flex justify-between items-center text-[11px] font-bold">
                  <span className="text-gray-200">Candidate #308 - David K.</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> 🟢 Normal
                  </span>
                </div>
                <div className="aspect-video bg-gray-900 rounded-lg border border-gray-800/80 flex flex-col items-center justify-center p-3 relative">
                  <div className="w-10 h-10 rounded-full bg-cyan-600/30 text-cyan-300 flex items-center justify-center font-bold text-sm mb-1">
                    DK
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">Video Stream Active</span>
                </div>
              </div>

              {/* Card 4 */}
              <div className="bg-[#030712] border border-amber-500/40 rounded-xl p-3 space-y-2 relative overflow-hidden bg-amber-950/10">
                <div className="flex justify-between items-center text-[11px] font-bold">
                  <span className="text-gray-200">Candidate #412 - Elena R.</span>
                  <span className="text-amber-400 flex items-center gap-1">
                    🟡 Safeguard
                  </span>
                </div>
                <div className="aspect-video bg-gray-900 rounded-lg border border-amber-500/30 flex flex-col items-center justify-center p-3 relative">
                  <div className="w-10 h-10 rounded-full bg-amber-600/30 text-amber-300 flex items-center justify-center font-bold text-sm mb-1">
                    ER
                  </div>
                  <span className="text-[10px] text-amber-300 font-mono">Frame Drop Active</span>
                </div>
              </div>
            </div>

            {/* Real-Time Stream Health Widget Footer */}
            <div className="bg-[#0B0F17] px-6 py-3 border-t border-gray-800 flex flex-wrap items-center justify-between text-xs font-mono text-gray-400">
              <div className="flex items-center gap-6">
                <span>FPS: <strong className="text-emerald-400">30 FPS</strong></span>
                <span>Latency: <strong className="text-cyan-400">14ms</strong></span>
                <span>Memory Load: <strong className="text-indigo-400">18%</strong></span>
              </div>
              <span className="text-gray-500 text-[11px]">WebSocket Transport: Volatile Relay</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 3: KEY METRICS BANNER (STATS BAR) ──────────────── */}
      <section id="benchmarks" className="border-y border-gray-800 bg-[#0B0F17]/60 backdrop-blur-md py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <h3 className="text-3xl sm:text-4xl font-black text-white">500+</h3>
              <p className="text-xs font-extrabold text-cyan-400 uppercase tracking-wider mt-1">
                Concurrent Active Candidates
              </p>
            </div>
            <div>
              <h3 className="text-3xl sm:text-4xl font-black text-indigo-400">&lt;1s</h3>
              <p className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mt-1">
                Query Response Time (PostgreSQL Session Pooling)
              </p>
            </div>
            <div>
              <h3 className="text-3xl sm:text-4xl font-black text-emerald-400">100%</h3>
              <p className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mt-1">
                Zero Memory Leak Frame Relays (<code className="text-emerald-300">socket.volatile.emit</code>)
              </p>
            </div>
            <div>
              <h3 className="text-3xl sm:text-4xl font-black text-amber-400">0</h3>
              <p className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mt-1">
                Redundant Auth Roundtrips (In-Memory JWT Middleware)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 4: CORE CAPABILITIES MATRIX (BENTO GRID) ────────── */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="text-xs font-extrabold text-cyan-400 uppercase tracking-widest">
            Core Capabilities Matrix
          </h2>
          <h3 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Enterprise Exam Features
          </h3>
          <p className="text-gray-300 text-base">
            Organized into high-performance operation modules.
          </p>
        </div>

        {/* Asymmetrical 4-Card Bento Box Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 (Large) */}
          <div className="md:col-span-2 backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-indigo-500/50 transition-all group">
            <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl w-fit text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
              <Video size={32} />
            </div>
            <h4 className="text-2xl font-bold text-white mb-3">Zero-Lag Live Proctoring & Stream Relays</h4>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              Multi-admin webcam monitoring rooms powered by Socket.io WebSockets. Admin rooms receive real-time video frame broadcasts and instantaneous threat alerts.
            </p>
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <span className="px-3.5 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-indigo-300">
                Socket.io WebSockets
              </span>
              <span className="px-3.5 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-cyan-300">
                Multi-Admin Rooms
              </span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-cyan-500/50 transition-all group">
            <div className="p-3.5 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl w-fit text-cyan-400 mb-6 group-hover:scale-110 transition-transform">
              <AlertTriangle size={32} />
            </div>
            <h4 className="text-2xl font-bold text-white mb-3">Tamper-Proof Violation Detection</h4>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              Instantaneous tab-switching detection, window blur tracking, multi-display detection, and automated event log timestamping directly sent to admin audit logs.
            </p>
          </div>

          {/* Card 3 */}
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-amber-500/50 transition-all group">
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl w-fit text-amber-400 mb-6 group-hover:scale-110 transition-transform">
              <Terminal size={32} />
            </div>
            <h4 className="text-2xl font-bold text-white mb-3">Automated Evaluation & KaTeX Math</h4>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              Instant evaluation engine supporting complex scientific and mathematical notations rendered perfectly using integrated KaTeX engines.
            </p>
          </div>

          {/* Card 4 (Large) */}
          <div className="md:col-span-2 backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-emerald-500/50 transition-all group">
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl w-fit text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
              <BarChart3 size={32} />
            </div>
            <h4 className="text-2xl font-bold text-white mb-3">Subject-Wise Analytics & Instant Results</h4>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              Granular candidate breakdown, subject-level competence metrics (Physics, Chemistry, Math), automated score distribution curves, and instant result publishing.
            </p>
          </div>
        </div>
      </section>

      {/* ─── SECTION 5: TECH STACK ARCHITECTURE SHOWCASE ("UNDER THE HOOD") ─── */}
      <section id="techstack" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="text-xs font-extrabold text-cyan-400 uppercase tracking-widest">
            Architecture Specs
          </h2>
          <h3 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Tech Stack Breakdown ("Under The Hood")
          </h3>
          <p className="text-gray-300 text-base">
            Inspect the exact frontend & backend packages powering Skillbrix.
          </p>
        </div>

        {/* Tabbed Tech Stack Container */}
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-8">
          <div className="flex items-center justify-center gap-4 border-b border-gray-800 pb-6">
            <button
              onClick={() => setTechTab("backend")}
              className={`px-6 py-3 rounded-xl text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                techTab === "backend"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/40"
                  : "bg-gray-900 text-gray-400 hover:text-white border border-gray-800"
              }`}
            >
              <Server size={18} />
              Backend Engine (backend/package.json)
            </button>
            <button
              onClick={() => setTechTab("frontend")}
              className={`px-6 py-3 rounded-xl text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                techTab === "frontend"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/40"
                  : "bg-gray-900 text-gray-400 hover:text-white border border-gray-800"
              }`}
            >
              <Code size={18} />
              Frontend Interface (frontend/package.json)
            </button>
          </div>

          {/* Code-style Display Panel */}
          <div className="bg-[#030712] rounded-2xl border border-gray-800 p-6 sm:p-8 font-mono text-sm leading-relaxed text-gray-300 space-y-3">
            {techTab === "backend" ? (
              <ul className="space-y-2.5 text-xs sm:text-sm">
                <li><strong className="text-indigo-400">express</strong>: Fast REST API routing (<code className="text-cyan-300">/auth</code>, <code className="text-cyan-300">/exams</code>, <code className="text-cyan-300">/submissions</code>, <code className="text-cyan-300">/analytics</code>).</li>
                <li><strong className="text-indigo-400">@prisma/client & prisma</strong>: Type-safe ORM for relational queries and schema migrations on Supabase PostgreSQL.</li>
                <li><strong className="text-indigo-400">socket.io</strong>: Real-time WebSocket engine for live proctoring, webcam video frame relays, and violation alerts.</li>
                <li><strong className="text-indigo-400">jsonwebtoken</strong>: Stateless JWT authentication with access & refresh token rotation.</li>
                <li><strong className="text-indigo-400">bcryptjs</strong>: Salted blowfish hashing for secure password storage.</li>
                <li><strong className="text-indigo-400">cors</strong>: Secure cross-origin resource sharing between Vercel frontend and Railway backend.</li>
                <li><strong className="text-indigo-400">helmet</strong>: HTTP security hardening (HSTS, CSP, X-Frame-Options).</li>
                <li><strong className="text-indigo-400">express-rate-limit</strong>: Rate limiting and brute-force protection per IP address.</li>
                <li><strong className="text-indigo-400">pino</strong>: Low-overhead structured JSON logging for audit trails.</li>
              </ul>
            ) : (
              <ul className="space-y-2.5 text-xs sm:text-sm">
                <li><strong className="text-cyan-400">react & react-dom</strong>: Component-based UI library with custom React Hooks.</li>
                <li><strong className="text-cyan-400">vite</strong>: Next-generation fast build tool with instant HMR.</li>
                <li><strong className="text-cyan-400">react-router-dom</strong>: Client-side single page app (SPA) routing.</li>
                <li><strong className="text-cyan-400">axios</strong>: Promise-based HTTP client with automatic JWT token injection and 401 refresh interceptors.</li>
                <li><strong className="text-cyan-400">socket.io-client</strong>: Real-time client for joining admin rooms and streaming webcam frames.</li>
                <li><strong className="text-cyan-400">tailwindcss</strong>: Utility-first CSS framework for modern dark-mode glassmorphism styling.</li>
                <li><strong className="text-cyan-400">katex</strong>: Math formula renderer for complex scientific notation.</li>
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* ─── SECTION 6: TOP 3 ENGINEERING ACHIEVEMENTS (CALLOUT HIGHLIGHTS) ─── */}
      <section id="security" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="text-xs font-extrabold text-cyan-400 uppercase tracking-widest">
            Engineering Breakthroughs
          </h2>
          <h3 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Top 3 Engineering Achievements
          </h3>
          <p className="text-gray-300 text-base">
            System optimizations built into the core Skillbrix backend architecture.
          </p>
        </div>

        {/* 3 Technical Highlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-8 relative overflow-hidden space-y-4 hover:border-emerald-500/50 transition-all">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                DATABASE OPTIMIZATION
              </span>
              <Database size={20} className="text-emerald-400" />
            </div>
            <h4 className="text-xl font-bold text-white leading-snug">
              Supabase Database Session Pooling (Port 5432)
            </h4>
            <p className="text-gray-300 text-xs leading-relaxed">
              Fixed database connection resets under heavy user spikes by routing relational queries through <span className="text-emerald-400 font-mono font-bold">Port 5432</span> with <code className="text-white">connection_limit=10</code>, delivering consistent sub-second query response times under load.
            </p>
          </div>

          {/* Card 2 */}
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-8 relative overflow-hidden space-y-4 hover:border-indigo-500/50 transition-all">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-[10px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                PERFORMANCE & AUTH
              </span>
              <Lock size={20} className="text-indigo-400" />
            </div>
            <h4 className="text-xl font-bold text-white leading-snug">
              In-Memory JWT Auth Middleware
            </h4>
            <p className="text-gray-300 text-xs leading-relaxed">
              Refactored user authorization and role validation checks to decode stateless JWT payloads in-memory, completely eliminating millions of redundant database roundtrips during exam submissions.
            </p>
          </div>

          {/* Card 3 */}
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-8 relative overflow-hidden space-y-4 hover:border-cyan-500/50 transition-all">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-[10px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
                REAL-TIME WEBSOCKETS
              </span>
              <Activity size={20} className="text-cyan-400" />
            </div>
            <h4 className="text-xl font-bold text-white leading-snug">
              Volatile Socket Video Frame Streaming
            </h4>
            <p className="text-gray-300 text-xs leading-relaxed">
              Optimized live webcam video broadcasts over Socket.io using <code className="text-cyan-300 font-bold">socket.volatile.emit()</code>. Automatically drops stale frames during candidate network drops, preventing server memory queues and eliminating stream lag.
            </p>
          </div>
        </div>
      </section>

      {/* ─── SECTION 7: CALL-TO-ACTION (CTA) & FOOTER ─────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-indigo-900/60 via-cyan-950/60 to-gray-900/90 border border-indigo-500/40 rounded-3xl p-10 sm:p-16 text-center space-y-6 backdrop-blur-md relative overflow-hidden shadow-2xl">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Scale Your Assessment Infrastructure Today
          </h2>
          <p className="text-gray-200 max-w-xl mx-auto text-base">
            Join the next generation of tamper-proof, real-time exam administration.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-cyan-600 to-indigo-700 hover:from-indigo-500 hover:to-cyan-500 text-white font-extrabold text-base shadow-xl shadow-indigo-600/40 flex items-center justify-center gap-2 hover:scale-105 transition-all cursor-pointer border border-indigo-400/40"
            >
              <Shield size={20} />
              Schedule Live Enterprise Demo
              <ArrowRight size={18} />
            </Link>
            <a
              href="#architecture"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-200 font-bold text-base flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <FileText size={20} className="text-cyan-400" />
              Read Engineering Documentation
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-[#0B0F17] py-12 px-4 sm:px-6 lg:px-8 text-center text-xs text-gray-500 space-y-6">
        <div className="flex items-center justify-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-xs">
            SB
          </div>
          <span className="font-bold text-gray-300 text-sm">Skillbrix Assessment Portal</span>
        </div>

        <div className="flex flex-wrap justify-center gap-6 text-gray-400 font-medium">
          <a href="#features" className="hover:text-cyan-400">Product</a>
          <a href="#architecture" className="hover:text-cyan-400">Architecture</a>
          <a href="#security" className="hover:text-cyan-400">Security Spec</a>
          <a href="#techstack" className="hover:text-cyan-400">API Docs</a>
          <a href="#benchmarks" className="hover:text-cyan-400">Legal</a>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> System Status: 100% Operational
          </span>
        </div>

        <p>© 2026 Skillbrix Inc. All rights reserved. Enterprise AI Proctoring & Examination Engine.</p>
      </footer>
    </div>
  );
};

export default Landing;
