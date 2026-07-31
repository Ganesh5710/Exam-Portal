import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import ModernSaaSBackground from "../../components/ModernSaaSBackground";
import {
  Shield,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Activity,
  Building,
  Scale,
  Users,
  Star,
  ChevronDown,
  Monitor,
  Lock,
  Zap,
  BarChart3,
  Check,
  FileText,
  AlertTriangle,
  Play,
  Award,
  CheckCircle,
  X,
  Clock,
  Sparkles,
  RefreshCw,
  Eye,
  CornerDownRight,
  UploadCloud,
  Layers,
  ChevronRight,
  Database,
  Terminal,
  HelpCircle,
  Sliders,
  Share2,
  SlidersHorizontal,
  Download,
  MessageSquare,
  Send,
  Sun,
  Moon,
  Video,
} from "lucide-react";

const faqs = [
  {
    q: "How does the Real-Time AI Proctoring system work?",
    a: "Our proctoring engine streams candidate webcam frames directly via WebSockets to the NOC Live Monitor console while running client-side computer vision checks to detect tab switching, fullscreen exits, webcam occlusion, and face absence.",
  },
  {
    q: "Can I bulk import questions using spreadsheets or AI?",
    a: "Yes! Skillbrix includes an AI Question Importer that supports bulk Excel/CSV file parsing up to 2,000 questions or automatic question set generation.",
  },
  {
    q: "How are subject-wise marks and grades evaluated?",
    a: "Every submission automatically calculates total scores, percentage, pass/fail status, and detailed subject breakdown across Physics, Chemistry, Mathematics, and General topics, with full manual teacher override support.",
  },
  {
    q: "What happens if a candidate's internet disconnects during an exam?",
    a: "Skillbrix features automatic local state persistence. Responses are cached locally and synced to the cloud. Once connectivity resumes, the student seamlessly picks up where they left off.",
  },
];

// Interactive Glass Bento Card Component
const PremiumBentoCard = ({ children, className = "", glowColor = "rgba(168, 85, 247, 0.2)" }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsHovered(true);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-xl transition-all duration-300 hover:border-purple-500/40 hover:shadow-2xl hover:shadow-purple-950/20 overflow-hidden ${className}`}
    >
      {/* Radial Hover Glow Effect */}
      {isHovered && (
        <div
          className="pointer-events-none absolute -inset-px transition-opacity duration-300 opacity-100"
          style={{
            background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, ${glowColor}, transparent 40%)`,
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export const Landing = () => {
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === "dark";
  const [activeFaq, setActiveFaq] = useState(null);
  const [activeDemoTab, setActiveDemoTab] = useState("monitor");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-purple-500 selection:text-white relative overflow-x-hidden">
      {/* Dynamic Background Mesh */}
      <ModernSaaSBackground />

      {/* ─── 1. TOP NAVIGATION BAR ────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-fuchsia-500 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-purple-500/25 group-hover:scale-105 transition-transform">
              SB
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white flex items-center gap-1">
                Skill<span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-amber-400 bg-clip-text text-transparent">brix</span>
              </span>
              <span className="text-[10px] text-slate-400 tracking-wider font-semibold uppercase block -mt-1">
                Assessment System
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
            <a href="#features" className="hover:text-purple-400 transition-colors">
              Features
            </a>
            <a href="#proctoring" className="hover:text-purple-400 transition-colors">
              AI Proctoring
            </a>
            <a href="#demo" className="hover:text-purple-400 transition-colors">
              Live Console
            </a>
            <a href="#faq" className="hover:text-purple-400 transition-colors">
              FAQ
            </a>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
            </button>
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 flex items-center gap-2 hover:scale-105 transition-all cursor-pointer"
            >
              Log In to Portal
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      {/* ─── 2. HERO SECTION ─────────────────────────────────────────── */}
      <section className="relative pt-16 pb-24 lg:pt-24 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          {/* Release Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold tracking-wide backdrop-blur-md animate-fadeIn">
            <Sparkles size={14} className="text-amber-400 animate-spin" />
            <span>Skillbrix 2.0 Released: Real-Time AI Proctoring & HD Frame Streaming</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-tight">
            The Next-Gen Enterprise{" "}
            <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-amber-400 bg-clip-text text-transparent">
              Examination Portal
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
            Conduct seamless online examinations for 500+ candidates with real-time WebSockets webcam surveillance, anti-cheat AI detection, automated scoring, and subject-wise result analytics.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-extrabold text-base shadow-xl shadow-purple-600/30 flex items-center justify-center gap-3 hover:scale-105 transition-all cursor-pointer"
            >
              <Shield size={20} />
              Launch Portal Login
              <ArrowRight size={18} />
            </Link>
            <a
              href="#demo"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-base flex items-center justify-center gap-2 backdrop-blur-md transition-all cursor-pointer"
            >
              <Monitor size={20} className="text-purple-400" />
              Explore Live Console
            </a>
          </div>
        </div>

        {/* Floating Mock Hero Interface Card */}
        <div className="mt-16 relative max-w-5xl mx-auto rounded-3xl p-2 bg-gradient-to-b from-purple-500/20 via-slate-800/40 to-slate-950/80 border border-purple-500/30 shadow-2xl backdrop-blur-2xl overflow-hidden group">
          <div className="bg-slate-950 rounded-2xl p-4 sm:p-6 border border-slate-800/80 space-y-6">
            {/* Window Top Bar */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="ml-3 text-xs font-mono text-slate-400">
                  skillbrix-exam.vercel.app/admin/monitor
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Network Synced
                </span>
              </div>
            </div>

            {/* Content Preview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Live Candidate Box */}
              <div className="md:col-span-2 bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-300 flex items-center gap-2">
                    <Video size={14} className="text-purple-400" />
                    LIVE CANDIDATE STREAM #104
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    ✨ 720p MAX HD
                  </span>
                </div>
                <div className="aspect-video bg-slate-950 rounded-lg border border-slate-800/80 relative flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-purple-950/40 via-slate-900/80 to-slate-950 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-300 font-bold text-xl mb-3">
                      GB
                    </div>
                    <p className="font-bold text-white text-sm">Ganesh Bathula</p>
                    <p className="text-xs text-slate-400 font-mono">JEE Advanced Mock Test 2026</p>
                    <span className="mt-3 px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                      <CheckCircle size={12} />
                      Active Candidate Telemetry
                    </span>
                  </div>
                </div>
              </div>

              {/* Side Security Audit Stream */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <Shield size={14} className="text-amber-400" />
                  REAL-TIME NOC SECURITY LOG
                </span>
                <div className="space-y-2.5 text-xs font-mono">
                  <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                    <p className="text-emerald-400 font-bold">10:44:02 PM - Student Logged In</p>
                    <p className="text-slate-400 text-[10px]">Session verified via JWT token</p>
                  </div>
                  <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                    <p className="text-blue-400 font-bold">10:44:15 PM - Fullscreen Locked</p>
                    <p className="text-slate-400 text-[10px]">Anti-cheat DOM lockdown enabled</p>
                  </div>
                  <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                    <p className="text-purple-400 font-bold">10:44:30 PM - Frame Stream Active</p>
                    <p className="text-slate-400 text-[10px]">Socket emission: 640x480 @ 0.85</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. METRICS TRUST BAR ────────────────────────────────────── */}
      <section className="border-y border-slate-800/80 bg-slate-900/40 backdrop-blur-md py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <h3 className="text-3xl font-black text-white">99.9%</h3>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">
                Uptime SLA Guarantee
              </p>
            </div>
            <div>
              <h3 className="text-3xl font-black text-purple-400">500+</h3>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">
                Concurrent Candidates
              </p>
            </div>
            <div>
              <h3 className="text-3xl font-black text-emerald-400">&lt; 100ms</h3>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">
                API Response Speed
              </p>
            </div>
            <div>
              <h3 className="text-3xl font-black text-blue-400">0%</h3>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">
                Connection Reset Rate
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. FEATURES BENTO GRID ──────────────────────────────────── */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="text-xs font-extrabold text-purple-400 uppercase tracking-widest">
            Enterprise Architecture
          </h2>
          <h3 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Built for Scale, Security & Precision
          </h3>
          <p className="text-slate-400 text-base">
            Every layer of Skillbrix is engineered with modern cloud technologies to support reliable, tamper-proof examinations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <PremiumBentoCard className="md:col-span-2">
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-2xl w-fit text-purple-400 mb-6">
              <Shield size={28} />
            </div>
            <h4 className="text-2xl font-bold text-white mb-3">Real-Time AI Proctoring & NOC Monitor</h4>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Monitor active candidates in real time with HD webcam frame streaming, automated tab-switch warnings, and immediate anti-cheat security flags.
            </p>
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <span className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-purple-300">
                WebSockets Stream
              </span>
              <span className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-emerald-300">
                Tab Switch Logs
              </span>
              <span className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-blue-300">
                Fullscreen Lock
              </span>
            </div>
          </PremiumBentoCard>

          {/* Card 2 */}
          <PremiumBentoCard>
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl w-fit text-amber-400 mb-6">
              <BarChart3 size={28} />
            </div>
            <h4 className="text-2xl font-bold text-white mb-3">Subject-Wise Marks Breakdown</h4>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Automatically calculate candidate marks broken down by Physics, Chemistry, Mathematics, and custom subjects.
            </p>
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
              Detailed Analytics & CSV Exports <ChevronRight size={14} />
            </span>
          </PremiumBentoCard>

          {/* Card 3 */}
          <PremiumBentoCard>
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl w-fit text-blue-400 mb-6">
              <UploadCloud size={28} />
            </div>
            <h4 className="text-2xl font-bold text-white mb-3">AI Question Importer</h4>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Bulk upload up to 2,000 questions via Excel/CSV spreadsheets or leverage built-in AI generators for instant exam creation.
            </p>
            <span className="text-xs font-bold text-blue-400 flex items-center gap-1">
              Supports MathJax & KaTeX <ChevronRight size={14} />
            </span>
          </PremiumBentoCard>

          {/* Card 4 */}
          <PremiumBentoCard className="md:col-span-2">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl w-fit text-emerald-400 mb-6">
              <Database size={28} />
            </div>
            <h4 className="text-2xl font-bold text-white mb-3">Supabase PostgreSQL Session Pooling</h4>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Engineered with custom Port 5432 session poolers and in-memory JWT authentication to prevent database resets and support sub-second API speeds.
            </p>
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <span className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-emerald-300">
                Port 5432 Session Pooler
              </span>
              <span className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-purple-300">
                In-Memory Auth
              </span>
            </div>
          </PremiumBentoCard>
        </div>
      </section>

      {/* ─── 5. LIVE DEMO CONSOLE PREVIEW SECTION ─────────────────────── */}
      <section id="demo" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 sm:p-10 backdrop-blur-xl space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                <Terminal className="w-6 h-6 text-purple-400" />
                Live Application Workflows
              </h3>
              <p className="text-slate-400 text-sm mt-1">
                Explore the candidate terminal, admin dashboard, and live monitoring console.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
              <button
                onClick={() => setActiveDemoTab("monitor")}
                className={`px-3 py-2 rounded-lg transition-all ${
                  activeDemoTab === "monitor"
                    ? "bg-purple-600 text-white font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                NOC Monitor
              </button>
              <button
                onClick={() => setActiveDemoTab("results")}
                className={`px-3 py-2 rounded-lg transition-all ${
                  activeDemoTab === "results"
                    ? "bg-purple-600 text-white font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Results Review
              </button>
            </div>
          </div>

          {/* Interactive Demo View Area */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 min-h-[300px] flex flex-col justify-center">
            {activeDemoTab === "monitor" ? (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-purple-400 flex items-center gap-2">
                    <Activity size={16} /> NOC LIVE PROCTORING TELEMETRY
                  </span>
                  <span className="text-emerald-400 font-mono font-bold">1 ACTIVE CANDIDATE</span>
                </div>
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-300 flex items-center justify-center font-bold">
                      GB
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">Ganesh Bathula</p>
                      <p className="text-xs text-slate-400 font-mono">Exam: JEE Advanced 2026</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                    Webcam HD Active
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-blue-400 flex items-center gap-2">
                    <BarChart3 size={16} /> SUBJECT-WISE MARKS BREAKDOWN
                  </span>
                  <span className="text-slate-400 font-mono">Score: 280 / 300 pts</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                    <p className="text-slate-400">Physics</p>
                    <p className="font-bold text-emerald-400 text-sm">90 / 100 pts</p>
                  </div>
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                    <p className="text-slate-400">Chemistry</p>
                    <p className="font-bold text-emerald-400 text-sm">95 / 100 pts</p>
                  </div>
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                    <p className="text-slate-400">Mathematics</p>
                    <p className="font-bold text-emerald-400 text-sm">95 / 100 pts</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── 6. FAQ ACCORDION SECTION ─────────────────────────────────── */}
      <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-xs font-extrabold text-purple-400 uppercase tracking-widest">
            Frequently Asked Questions
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white">
            Everything You Need to Know
          </h3>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-xl transition-all"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full p-6 text-left flex items-center justify-between font-bold text-slate-100 text-base cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-purple-400 transition-transform ${
                    activeFaq === idx ? "rotate-180" : ""
                  }`}
                />
              </button>
              {activeFaq === idx && (
                <div className="px-6 pb-6 text-sm text-slate-400 leading-relaxed border-t border-slate-800/60 pt-4 animate-fadeIn">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ─── 7. FINAL CTA FOOTER BANNER ───────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-slate-900/80 border border-purple-500/30 rounded-3xl p-10 sm:p-16 text-center space-y-6 backdrop-blur-2xl relative overflow-hidden">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Ready to Modernize Your Examination Workflow?
          </h2>
          <p className="text-slate-300 max-w-xl mx-auto text-base">
            Log in to the admin console to launch live exams, monitor candidate feeds, and analyze subject performance.
          </p>
          <div className="pt-4 flex justify-center">
            <Link
              to="/login"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-extrabold text-base shadow-xl shadow-purple-600/30 flex items-center gap-2 hover:scale-105 transition-all cursor-pointer"
            >
              Get Started Now
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 8. FOOTER ────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 space-y-4">
        <div className="flex items-center justify-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-purple-600 flex items-center justify-center font-bold text-white text-xs">
            SB
          </div>
          <span className="font-bold text-slate-300 text-sm">Skillbrix Assessment Portal</span>
        </div>
        <p>© 2026 Skillbrix Inc. All rights reserved. Enterprise AI Proctoring Engine.</p>
      </footer>
    </div>
  );
};

export default Landing;
