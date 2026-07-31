import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  Shield,
  Video,
  BarChart3,
  Terminal,
  Lock,
  Database,
  Zap,
  ArrowRight,
  ChevronRight,
  Check,
  AlertTriangle,
  Eye,
  FileText,
  Users,
  Activity,
  Server,
  Code,
  Sun,
  Moon,
  CheckCircle,
  Star,
  Play,
  TrendingUp,
  Cpu,
  Radio,
  Globe,
  Download,
  Building,
  Award,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

// ─── Reusable Scroll Animation Wrapper ─────────────────────────────────────────
const FadeInWhenVisible = ({ children, delay = 0, direction = "up", className = "" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const variants = {
    hidden: {
      opacity: 0,
      y: direction === "up" ? 40 : direction === "down" ? -40 : 0,
      x: direction === "left" ? 40 : direction === "right" ? -40 : 0,
    },
    visible: { opacity: 1, y: 0, x: 0, transition: { duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] } },
  };
  return (
    <motion.div ref={ref} variants={variants} initial="hidden" animate={isInView ? "visible" : "hidden"} className={className}>
      {children}
    </motion.div>
  );
};

// ─── Animated Live Candidate Grid (Hero Mockup) ─────────────────────────────────
const candidates = [
  { id: 104, name: "Alex M.", init: "AM", color: "indigo", status: "normal", label: "Active" },
  { id: 219, name: "Sarah T.", init: "ST", color: "rose", status: "alert", label: "Tab Switch ⚠" },
  { id: 308, name: "David K.", init: "DK", color: "cyan", status: "normal", label: "Active" },
  { id: 412, name: "Elena R.", init: "ER", color: "amber", status: "warn", label: "Frame Drop" },
  { id: 517, name: "Raj P.", init: "RP", color: "emerald", status: "normal", label: "Active" },
  { id: 621, name: "Mei L.", init: "ML", color: "purple", status: "normal", label: "Active" },
];

const colorMap = {
  indigo: { ring: "ring-indigo-500/40", bg: "bg-indigo-500/20", text: "text-indigo-300", dot: "bg-indigo-400" },
  rose: { ring: "ring-rose-500/60", bg: "bg-rose-500/20", text: "text-rose-300", dot: "bg-rose-400" },
  cyan: { ring: "ring-cyan-500/40", bg: "bg-cyan-500/20", text: "text-cyan-300", dot: "bg-cyan-400" },
  amber: { ring: "ring-amber-500/40", bg: "bg-amber-500/20", text: "text-amber-300", dot: "bg-amber-400" },
  emerald: { ring: "ring-emerald-500/40", bg: "bg-emerald-500/20", text: "text-emerald-300", dot: "bg-emerald-400" },
  purple: { ring: "ring-purple-500/40", bg: "bg-purple-500/20", text: "text-purple-300", dot: "bg-purple-400" },
};

const LiveCandidateGrid = () => {
  const [alertIdx, setAlertIdx] = useState(1);
  useEffect(() => {
    const t = setInterval(() => setAlertIdx((i) => (i === 1 ? 3 : 1)), 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="grid grid-cols-3 gap-2 p-4">
      {candidates.map((c, idx) => {
        const isAlert = idx === alertIdx;
        const cols = colorMap[isAlert ? "rose" : c.color];
        return (
          <motion.div
            key={c.id}
            animate={isAlert ? { scale: [1, 1.03, 1], boxShadow: ["0 0 0px #f87171", "0 0 16px #f87171", "0 0 0px #f87171"] } : {}}
            transition={{ duration: 1.5, repeat: isAlert ? Infinity : 0 }}
            className={`relative bg-slate-900 rounded-xl overflow-hidden border ${isAlert ? "border-rose-500/60" : "border-white/[0.07]"} p-2 aspect-video flex flex-col items-center justify-center gap-1`}
          >
            <div className={`w-8 h-8 rounded-full ${isAlert ? "bg-rose-500/20" : cols.bg} ${isAlert ? "text-rose-300" : cols.text} flex items-center justify-center text-[10px] font-black`}>
              {c.init}
            </div>
            <p className="text-[9px] text-slate-400 font-mono">{c.name}</p>
            <div className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${isAlert ? "bg-rose-400 animate-ping" : `${cols.dot} animate-pulse`}`} />
              <span className={`text-[8px] font-bold ${isAlert ? "text-rose-400" : cols.text}`}>{isAlert ? "TAB SWITCH ⚠" : c.label}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

// ─── Problem→Solution Strip Cards ──────────────────────────────────────────────
const problems = [
  {
    problem: "Manual proctoring doesn't scale",
    icon: Users,
    solution: "Skillbrix monitors 500+ candidates simultaneously with zero human supervisors—AI handles the watching.",
    accentColor: "from-rose-500/20 to-rose-500/5",
    iconColor: "text-rose-400",
    borderHover: "hover:border-rose-500/40",
  },
  {
    problem: "Exam fraud goes undetected",
    icon: Eye,
    solution: "Real-time tab-switch detection, fullscreen enforcement, and webcam surveillance flag every infraction the moment it happens.",
    accentColor: "from-amber-500/20 to-amber-500/5",
    iconColor: "text-amber-400",
    borderHover: "hover:border-amber-500/40",
  },
  {
    problem: "Grading takes weeks",
    icon: TrendingUp,
    solution: "Automated evaluation computes subject-wise marks, pass/fail status, and publishes report cards instantly after submission.",
    accentColor: "from-emerald-500/20 to-emerald-500/5",
    iconColor: "text-emerald-400",
    borderHover: "hover:border-emerald-500/40",
  },
];

// ─── How It Works Steps ─────────────────────────────────────────────────────────
const steps = [
  { n: "01", icon: FileText, title: "Import Questions", body: "Bulk upload 2,000 questions via Excel/CSV or use the AI generator. Tag by subject, difficulty, and type." },
  { n: "02", icon: Cpu, title: "Configure Exam", body: "Set duration, negative marking, eligible candidates, and proctoring sensitivity thresholds." },
  { n: "03", icon: Radio, title: "AI Proctors Live", body: "Candidates enter the secure terminal. AI watches webcams, locks fullscreen, and logs every infraction in real time." },
  { n: "04", icon: BarChart3, title: "Instant Results", body: "Scores publish automatically. Review subject-wise breakdowns, override if needed, and export with one click." },
];

// ─── MAIN LANDING COMPONENT ──────────────────────────────────────────────────────
export const Landing = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const [navScrolled, setNavScrolled] = useState(false);
  const [techTab, setTechTab] = useState("backend");

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">

      {/* ── Ambient Background Auras ──────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-indigo-600/15 rounded-full blur-[160px]" />
        <div className="absolute top-[800px] left-1/4 w-[600px] h-[400px] bg-cyan-500/10 rounded-full blur-[140px]" />
        <div className="absolute top-[1600px] right-1/4 w-[600px] h-[400px] bg-violet-600/10 rounded-full blur-[140px]" />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: "radial-gradient(circle at 1px 1px, #6366f1 1px, transparent 0)", backgroundSize: "40px 40px"}} />
      </div>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* SECTION 1: STICKY NAV ─────────────────────────────────────── */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <motion.header
        className={`sticky top-0 z-50 transition-all duration-300 ${navScrolled ? "bg-[#030712]/90 backdrop-blur-xl border-b border-white/[0.06] shadow-xl shadow-black/20" : "bg-transparent"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-cyan-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white">
                Skill<span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">brix</span>
              </span>
              <span className="hidden sm:block text-[9px] text-slate-500 tracking-[0.2em] uppercase -mt-0.5">
                Enterprise Proctoring
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm text-slate-400 font-medium">
            {["Features", "Architecture", "Security", "How It Works"].map((l) => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`} className="hover:text-white transition-colors">{l}</a>
            ))}
          </nav>

          {/* CTAs */}
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all">
              {isDark ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
            </button>
            <a href="#features" className="hidden sm:block px-4 py-2 rounded-lg text-sm text-slate-300 font-semibold hover:text-white transition-colors border border-white/[0.08] hover:border-white/20">
              Documentation
            </a>
            <Link to="/login" className="group px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-indigo-600/25 hover:shadow-indigo-500/40">
              Request Demo
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </motion.header>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* SECTION 2: HERO ───────────────────────────────────────────── */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <section className="relative pt-20 pb-20 lg:pt-28 lg:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          {/* Badge Pill */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Enterprise Examination Infrastructure — AI-Powered & Zero-Lag
          </motion.div>

          {/* Headline */}
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-5xl sm:text-6xl lg:text-[76px] font-black text-white tracking-tight leading-[1.05]">
            Run Cheat-Proof Exams{" "}
            <span className="relative">
              <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent">
                at Scale,
              </span>
            </span>
            {" "}Watched by AI
          </motion.h1>

          {/* Subheadline */}
          <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
            Skillbrix delivers real-time AI proctoring for 500+ concurrent candidates—with live webcam monitoring, instant tab-switch alerts, automated subject analytics, and one-click result publishing.
          </motion.p>

          {/* CTAs */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link to="/login" className="group w-full sm:w-auto px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/30 hover:shadow-indigo-500/40 transition-all hover:-translate-y-0.5">
              <Shield size={18} />
              Book a Demo
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#features" className="group w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-white font-bold text-base flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 backdrop-blur-sm">
              <Play size={16} className="text-cyan-400" />
              Watch it in Action
              <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </motion.div>
        </div>

        {/* ── ANIMATED HERO MOCKUP ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 48, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="mt-16 relative max-w-5xl mx-auto"
        >
          {/* Glow halo behind card */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-indigo-500/20 to-transparent blur-2xl -z-10 scale-105" />

          <div className="rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0B0F1A] shadow-2xl shadow-black/60">
            {/* Browser chrome */}
            <div className="bg-[#0d1117] px-5 py-3 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="ml-4 text-xs font-mono text-slate-500">https://proctor.skillbrix.io/live/session-8921</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[11px] font-bold text-emerald-400">LIVE · 512 Candidates Active</span>
              </div>
            </div>

            {/* Dashboard header */}
            <div className="px-5 py-3 border-b border-white/[0.04] flex items-center justify-between bg-[#0B0F1A]">
              <div className="flex items-center gap-3">
                <Radio size={14} className="text-indigo-400 animate-pulse" />
                <span className="text-xs font-bold text-slate-300">NOC Live Monitor — JEE Advanced Batch 2026</span>
              </div>
              <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500">
                <span>FPS: <strong className="text-emerald-400">30</strong></span>
                <span>Latency: <strong className="text-cyan-400">14ms</strong></span>
                <span>Mem: <strong className="text-indigo-400">18%</strong></span>
              </div>
            </div>

            {/* Live candidate grid */}
            <LiveCandidateGrid />

            {/* Footer stream health bar */}
            <div className="bg-[#0d1117] px-5 py-2.5 border-t border-white/[0.04] flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>WebSocket Transport: <span className="text-indigo-400">volatile relay active</span></span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                All streams healthy
              </span>
            </div>
          </div>
        </motion.div>

        {/* Trust Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-8 text-center"
        >
          {[
            { val: "500+", label: "Concurrent Candidates" },
            { val: "<100ms", label: "Query Latency" },
            { val: "Zero Lag", label: "Volatile Frame Relay" },
            { val: "0", label: "Redundant Auth Calls" },
          ].map(({ val, label }) => (
            <div key={val} className="flex flex-col items-center">
              <span className="text-2xl font-black text-white">{val}</span>
              <span className="text-xs text-slate-500 mt-0.5 font-medium">{label}</span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* SECTION 3: PROBLEM → SOLUTION ─────────────────────────────── */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {problems.map((p, i) => {
            const Icon = p.icon;
            return (
              <FadeInWhenVisible key={p.problem} delay={i * 0.12}>
                <div className={`group relative bg-gradient-to-b ${p.accentColor} border border-white/[0.07] ${p.borderHover} rounded-2xl p-6 space-y-4 transition-all duration-300 hover:-translate-y-1 h-full`}>
                  <div className={`p-2.5 rounded-xl bg-white/5 w-fit ${p.iconColor}`}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">The Problem</p>
                    <h3 className="text-xl font-black text-white leading-snug">{p.problem}</h3>
                  </div>
                  <div className="border-t border-white/[0.06] pt-4">
                    <p className="text-sm font-bold text-indigo-400 mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
                      <CheckCircle size={13} /> Skillbrix Solution
                    </p>
                    <p className="text-sm text-slate-300 leading-relaxed">{p.solution}</p>
                  </div>
                </div>
              </FadeInWhenVisible>
            );
          })}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* SECTION 4: CORE FEATURE SHOWCASE ──────────────────────────── */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
        {/* Section Header */}
        <FadeInWhenVisible>
          <div className="text-center space-y-3 max-w-2xl mx-auto mb-16">
            <p className="text-xs font-extrabold text-cyan-400 uppercase tracking-[0.2em]">Core Feature Showcase</p>
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">Built for institutions that take exams seriously</h2>
          </div>
        </FadeInWhenVisible>

        {/* FEATURE 1: LARGE — Live Proctoring with animated mockup */}
        <FadeInWhenVisible>
          <div className="group relative rounded-3xl overflow-hidden border border-white/[0.08] hover:border-indigo-500/40 transition-all duration-500 bg-[#0B0F1A]">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-transparent to-transparent" />
            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Left: Copy */}
              <div className="p-10 sm:p-14 flex flex-col justify-center space-y-6">
                <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 w-fit">
                  <Video size={28} className="text-indigo-400" />
                </div>
                <div>
                  <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">Live AI Proctoring</span>
                  <h3 className="mt-2 text-3xl font-black text-white leading-tight">Zero-Lag Live Proctoring & NOC Monitor</h3>
                </div>
                <p className="text-base text-slate-300 leading-relaxed">
                  Real-time webcam grid fed by Socket.io volatile broadcasts — every frame delivered with no queuing. Admins see live candidate feeds, receive instant violation alerts, and can broadcast messages to all candidates simultaneously.
                </p>
                <ul className="space-y-2">
                  {["Tab-switch & fullscreen detection", "Multi-admin monitoring rooms", "Live broadcast to all candidates", "Webcam occlusion & face-absence flags"].map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                      <Check size={14} className="text-indigo-400 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Right: Live Mini Mockup */}
              <div className="p-6 sm:p-8 flex items-center justify-center border-t lg:border-t-0 lg:border-l border-white/[0.05]">
                <div className="w-full rounded-2xl overflow-hidden border border-white/[0.07] bg-[#030712] shadow-2xl">
                  <div className="bg-[#0d1117] px-4 py-2.5 border-b border-white/[0.05] flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500">NOC LIVE MONITOR</span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-[10px] text-emerald-400 font-bold">512 ACTIVE</span>
                    </div>
                  </div>
                  <LiveCandidateGrid />
                </div>
              </div>
            </div>
          </div>
        </FadeInWhenVisible>

        {/* FEATURE GRID: 2-column bento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Feature 2: Results Engine */}
          <FadeInWhenVisible delay={0.1}>
            <div className="group relative rounded-2xl overflow-hidden border border-white/[0.08] hover:border-emerald-500/40 bg-[#0B0F1A] p-8 space-y-6 transition-all duration-300 hover:-translate-y-1 h-full">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 w-fit">
                <BarChart3 size={24} className="text-emerald-400" />
              </div>
              <div>
                <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Assessment Engine</span>
                <h3 className="mt-2 text-2xl font-black text-white">Results & Subject-Wise Analytics</h3>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Every submission auto-computes subject-level scores, pass/fail status, and accuracy breakdowns. Review question-by-question, override scores, and publish in one click.
              </p>
              {/* Mini score mock */}
              <div className="bg-[#030712] rounded-xl border border-white/[0.06] p-4 space-y-2.5">
                {[["Physics", 90, 100], ["Chemistry", 85, 100], ["Mathematics", 95, 100]].map(([sub, score, max]) => (
                  <div key={sub}>
                    <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                      <span>{sub}</span>
                      <span className="text-emerald-400">{score}/{max}</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} whileInView={{ width: `${(score / max) * 100}%` }} transition={{ duration: 1, ease: "easeOut" }} className="h-full bg-emerald-400 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeInWhenVisible>

          {/* Feature 3: AI Question Importer */}
          <FadeInWhenVisible delay={0.2}>
            <div className="group relative rounded-2xl overflow-hidden border border-white/[0.08] hover:border-amber-500/40 bg-[#0B0F1A] p-8 space-y-6 transition-all duration-300 hover:-translate-y-1 h-full">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 w-fit">
                <Terminal size={24} className="text-amber-400" />
              </div>
              <div>
                <span className="text-xs font-black text-amber-400 uppercase tracking-widest">Question Bank</span>
                <h3 className="mt-2 text-2xl font-black text-white">AI Question Importer & Bank</h3>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Bulk import 2,000 questions via Excel/CSV or let the AI generator create entire papers. Full KaTeX rendering for physics, chemistry, and math notation.
              </p>
              <div className="flex flex-wrap gap-2">
                {["MCQ", "Descriptive", "Short Answer", "KaTeX Math", "AI Generated", "Subject Tagging"].map((t) => (
                  <span key={t} className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-500/10 border border-amber-500/20 text-amber-300">{t}</span>
                ))}
              </div>
            </div>
          </FadeInWhenVisible>
        </div>

        {/* FEATURE ROW: 2 smaller side-by-side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Feature 4: Secure Exam Terminal */}
          <FadeInWhenVisible delay={0.1}>
            <div className="group relative rounded-2xl overflow-hidden border border-white/[0.08] hover:border-cyan-500/40 bg-[#0B0F1A] p-8 space-y-5 transition-all duration-300 hover:-translate-y-1 h-full">
              <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 w-fit">
                <Lock size={24} className="text-cyan-400" />
              </div>
              <div>
                <span className="text-xs font-black text-cyan-400 uppercase tracking-widest">Exam Terminal</span>
                <h3 className="mt-2 text-2xl font-black text-white">Secure Candidate Exam Terminal</h3>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Fullscreen DOM lockdown, pre-exam compatibility check (webcam, browser, screen), and offline-safe auto-save so candidates never lose progress.
              </p>
            </div>
          </FadeInWhenVisible>

          {/* Feature 5: Super Admin */}
          <FadeInWhenVisible delay={0.2}>
            <div className="group relative rounded-2xl overflow-hidden border border-white/[0.08] hover:border-violet-500/40 bg-[#0B0F1A] p-8 space-y-5 transition-all duration-300 hover:-translate-y-1 h-full">
              <div className="p-3 rounded-2xl bg-violet-500/10 border border-violet-500/20 w-fit">
                <Building size={24} className="text-violet-400" />
              </div>
              <div>
                <span className="text-xs font-black text-violet-400 uppercase tracking-widest">Command Center</span>
                <h3 className="mt-2 text-2xl font-black text-white">Super Admin Multi-Tenant Management</h3>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Manage institutions, departments, and faculties from one command center. Full audit logs, role-based access, and AI infrastructure monitoring.
              </p>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* SECTION 5: HOW IT WORKS (4-STEP TIMELINE) ──────────────────── */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <FadeInWhenVisible>
          <div className="text-center mb-16 space-y-3">
            <p className="text-xs font-extrabold text-cyan-400 uppercase tracking-[0.2em]">How It Works</p>
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">From question to result in four steps</h2>
          </div>
        </FadeInWhenVisible>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connecting line (desktop only) */}
          <div className="hidden lg:block absolute top-14 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <FadeInWhenVisible key={s.n} delay={i * 0.12}>
                <div className="relative flex flex-col items-center text-center gap-4 p-6 rounded-2xl border border-white/[0.07] bg-[#0B0F1A] hover:border-indigo-500/30 transition-all hover:-translate-y-1">
                  <div className="relative w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                    <Icon size={24} className="text-indigo-400" />
                    <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-indigo-600 text-white text-[9px] font-black flex items-center justify-center">{s.n}</span>
                  </div>
                  <h4 className="text-base font-bold text-white">{s.title}</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">{s.body}</p>
                </div>
              </FadeInWhenVisible>
            );
          })}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* SECTION 6: SECURITY & TRUST ────────────────────────────────── */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <section id="security" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <FadeInWhenVisible>
          <div className="text-center mb-16 space-y-3">
            <p className="text-xs font-extrabold text-cyan-400 uppercase tracking-[0.2em]">Infrastructure & Security</p>
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">Enterprise-hardened from the ground up</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Security isn't an afterthought. Every layer of Skillbrix is hardened to protect candidate data, prevent session hijacking, and survive high concurrency spikes.</p>
          </div>
        </FadeInWhenVisible>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Database,
              badge: "DATABASE OPTIMIZATION",
              badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
              borderHover: "hover:border-emerald-500/40",
              iconColor: "text-emerald-400",
              iconBg: "bg-emerald-500/10 border-emerald-500/20",
              title: "Supabase Session Pooling (Port 5432)",
              body: "Fixed database connection resets under load by routing queries through Port 5432 with connection_limit=10. Sub-second queries, zero resets under 500+ concurrent candidates.",
              code: "connection_limit=10",
            },
            {
              icon: Lock,
              badge: "PERFORMANCE & AUTH",
              badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
              borderHover: "hover:border-indigo-500/40",
              iconColor: "text-indigo-400",
              iconBg: "bg-indigo-500/10 border-indigo-500/20",
              title: "In-Memory JWT Auth Middleware",
              body: "Stateless JWT payloads decoded in-memory — no database roundtrip on every request. Millions of saved DB calls across exam sessions.",
              code: "jwt.verify(token, secret)",
            },
            {
              icon: Activity,
              badge: "REAL-TIME WEBSOCKETS",
              badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
              borderHover: "hover:border-cyan-500/40",
              iconColor: "text-cyan-400",
              iconBg: "bg-cyan-500/10 border-cyan-500/20",
              title: "Volatile Socket Video Frame Relay",
              body: "socket.volatile.emit() automatically drops stale frames when candidates disconnect, preventing memory queues and keeping the live stream responsive under network spikes.",
              code: "socket.volatile.emit(frame)",
            },
          ].map((c, i) => {
            const Icon = c.icon;
            return (
              <FadeInWhenVisible key={c.title} delay={i * 0.12}>
                <div className={`group rounded-2xl bg-[#0B0F1A] border border-white/[0.07] ${c.borderHover} p-8 space-y-5 transition-all duration-300 hover:-translate-y-1 h-full`}>
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${c.badgeColor} uppercase tracking-wide`}>{c.badge}</span>
                    <div className={`p-2 rounded-xl border ${c.iconBg} ${c.iconColor}`}>
                      <Icon size={18} />
                    </div>
                  </div>
                  <h4 className="text-xl font-bold text-white leading-snug">{c.title}</h4>
                  <p className="text-sm text-slate-300 leading-relaxed">{c.body}</p>
                  <div className="bg-[#030712] rounded-xl border border-white/[0.06] px-4 py-3 font-mono text-xs text-slate-400">
                    <span className="text-slate-600">// Production config:</span><br />
                    <span className={c.iconColor}>{c.code}</span>
                  </div>
                </div>
              </FadeInWhenVisible>
            );
          })}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* SECTION 7: TECH STACK ("UNDER THE HOOD") ───────────────────── */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <section id="architecture" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <FadeInWhenVisible>
          <div className="text-center mb-12 space-y-3">
            <p className="text-xs font-extrabold text-cyan-400 uppercase tracking-[0.2em]">Under The Hood</p>
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">Full-Stack Package Breakdown</h2>
          </div>
        </FadeInWhenVisible>

        <FadeInWhenVisible delay={0.1}>
          <div className="bg-[#0B0F1A] border border-white/[0.08] rounded-3xl overflow-hidden">
            {/* Tabs */}
            <div className="flex gap-1 p-4 border-b border-white/[0.06] bg-[#0d1117]">
              {[{ id: "backend", label: "backend/package.json", icon: Server }, { id: "frontend", label: "frontend/package.json", icon: Code }].map((t) => {
                const Icon = t.icon;
                return (
                  <button key={t.id} onClick={() => setTechTab(t.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${techTab === t.id ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white"}`}
                  >
                    <Icon size={14} /> {t.label}
                  </button>
                );
              })}
            </div>
            {/* Code block */}
            <AnimatePresence mode="wait">
              <motion.div key={techTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="p-8 font-mono text-sm">
                {techTab === "backend" ? (
                  <div className="space-y-3">
                    {[
                      ["express", "REST API routing — /auth, /exams, /submissions, /analytics"],
                      ["@prisma/client", "Type-safe ORM + schema migrations on Supabase PostgreSQL"],
                      ["socket.io", "Real-time WebSocket engine for live proctoring & webcam relays"],
                      ["jsonwebtoken", "Stateless JWT auth with access & refresh token rotation"],
                      ["bcryptjs", "Salted blowfish hashing for secure password storage"],
                      ["cors", "Cross-origin resource sharing (Vercel frontend ↔ Railway backend)"],
                      ["helmet", "HTTP hardening: HSTS, CSP, X-Frame-Options"],
                      ["express-rate-limit", "IP-based rate limiting + brute-force protection"],
                      ["pino", "Low-overhead structured JSON logging for audit trails"],
                    ].map(([pkg, desc]) => (
                      <div key={pkg} className="flex gap-4 items-start">
                        <span className="text-indigo-400 font-black min-w-[180px] shrink-0">"{pkg}"</span>
                        <span className="text-slate-400 text-xs mt-0.5">// {desc}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[
                      ["react & react-dom", "Component UI library with custom Hooks"],
                      ["vite", "Next-gen build tool with instant HMR"],
                      ["react-router-dom", "Client-side SPA routing"],
                      ["axios", "HTTP client with JWT injection + 401 refresh interceptors"],
                      ["socket.io-client", "WebSocket client for admin rooms & webcam frame streaming"],
                      ["framer-motion", "Scroll-triggered animations & interactive micro-interactions"],
                      ["tailwindcss", "Utility-first CSS — glassmorphism dark-mode UI"],
                      ["katex", "Math formula renderer for scientific notation"],
                      ["lucide-react", "Clean, consistent icon library"],
                    ].map(([pkg, desc]) => (
                      <div key={pkg} className="flex gap-4 items-start">
                        <span className="text-cyan-400 font-black min-w-[200px] shrink-0">"{pkg}"</span>
                        <span className="text-slate-400 text-xs mt-0.5">// {desc}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </FadeInWhenVisible>
      </section>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* SECTION 8: SOCIAL PROOF / STAT BAND ────────────────────────── */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <section className="py-16 border-y border-white/[0.06] bg-white/[0.02] backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInWhenVisible>
            <p className="text-center text-xs text-slate-500 uppercase tracking-widest font-bold mb-10">Trusted by leading institutions & coaching centers</p>
          </FadeInWhenVisible>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { stat: "500+", label: "Concurrent Candidates Per Session" },
              { stat: "2,000", label: "Questions Per Bulk Import" },
              { stat: "<100ms", label: "Avg API Query Latency" },
              { stat: "100%", label: "Zero Memory Leak Frame Relays" },
            ].map(({ stat, label }, i) => (
              <FadeInWhenVisible key={stat} delay={i * 0.1}>
                <div>
                  <p className="text-3xl sm:text-4xl font-black text-white">{stat}</p>
                  <p className="text-xs text-slate-400 mt-1.5 font-medium leading-snug">{label}</p>
                </div>
              </FadeInWhenVisible>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* SECTION 9: FINAL CTA BANNER ────────────────────────────────── */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <section className="py-28 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <FadeInWhenVisible>
          <div className="relative rounded-3xl overflow-hidden border border-indigo-500/30 bg-gradient-to-br from-indigo-950/80 via-[#0B0F1A] to-violet-950/50 p-14 sm:p-20 space-y-8">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-transparent to-violet-600/10" />
            <div className="absolute inset-0" style={{backgroundImage: "radial-gradient(circle at 1px 1px, #4f46e5 1px, transparent 0)", backgroundSize: "32px 32px", opacity: 0.05}} />
            <div className="relative space-y-5">
              <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
                Ready to run your next exam<br />without the chaos?
              </h2>
              <p className="text-lg text-slate-300 max-w-xl mx-auto">
                Join the next generation of tamper-proof, real-time exam administration. AI watches. You relax.
              </p>
            </div>
            <div className="relative flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link to="/login" className="group w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base flex items-center justify-center gap-2 shadow-2xl shadow-indigo-600/30 transition-all hover:-translate-y-1">
                <Shield size={18} />
                Schedule a Live Demo
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#architecture" className="group w-full sm:w-auto px-8 py-4 rounded-xl bg-white/5 border border-white/15 hover:border-white/30 text-white font-bold text-base flex items-center justify-center gap-2 backdrop-blur-sm transition-all hover:-translate-y-1">
                Talk to Sales
              </a>
            </div>
          </div>
        </FadeInWhenVisible>
      </section>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* FOOTER ──────────────────────────────────────────────────────── */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] bg-[#0d1117] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-black text-white">
                  Skill<span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">brix</span>
                </span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
                Enterprise AI Proctoring & Examination Portal. Built for institutions that take exams seriously.
              </p>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                System Status: 100% Operational
              </div>
            </div>

            {/* Product */}
            <div>
              <p className="text-xs font-extrabold text-white uppercase tracking-widest mb-4">Product</p>
              <ul className="space-y-3 text-sm text-slate-500">
                {["Features", "Live Monitor", "Results Engine", "Question Bank", "Exam Terminal"].map((l) => (
                  <li key={l}><a href="#features" className="hover:text-slate-200 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <p className="text-xs font-extrabold text-white uppercase tracking-widest mb-4">Resources</p>
              <ul className="space-y-3 text-sm text-slate-500">
                {["Architecture", "API Docs", "Security Spec", "Engineering Blog", "Changelog"].map((l) => (
                  <li key={l}><a href="#architecture" className="hover:text-slate-200 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <p className="text-xs font-extrabold text-white uppercase tracking-widest mb-4">Legal</p>
              <ul className="space-y-3 text-sm text-slate-500">
                {["Privacy Policy", "Terms of Service", "Security", "Data Processing", "Cookie Policy"].map((l) => (
                  <li key={l}><a href="#" className="hover:text-slate-200 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
            <p>© 2026 Skillbrix Inc. All rights reserved. Enterprise AI Proctoring & Examination Engine.</p>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                Log In to Portal →
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
