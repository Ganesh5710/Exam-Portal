import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useInView,
  AnimatePresence,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
} from "framer-motion";
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
  Eye,
  FileText,
  Users,
  Activity,
  Server,
  Code,
  CheckCircle,
  Play,
  TrendingUp,
  Cpu,
  Radio,
  Globe,
  Building,
  AlertTriangle,
  Camera,
  BookOpen,
  Download,
  Gauge,
  ShieldCheck,
  Layers,
  GitBranch,
  Wifi,
  Star,
} from "lucide-react";

/* ─── SVG Noise data-URI (fractal noise grain at ~3% opacity) ──────────────── */
const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`;

/* ─── Scroll-reveal wrapper ─────────────────────────────────────────────────── */
const Reveal = ({ children, delay = 0, y = 32, className = "" }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* ─── LIVE PROCTORING MONITOR (animated centerpiece) ────────────────────────── */
const CANDIDATES = [
  { id: "C-104", init: "AM", name: "Alex M.",  color: "#4F7BFF", status: "active" },
  { id: "C-219", init: "ST", name: "Sarah T.", color: "#ef4444", status: "alert"  },
  { id: "C-308", init: "DK", name: "David K.", color: "#06B6D4", status: "active" },
  { id: "C-412", init: "ER", name: "Elena R.", color: "#f59e0b", status: "warn"   },
  { id: "C-517", init: "RP", name: "Raj P.",   color: "#10b981", status: "active" },
  { id: "C-621", init: "ML", name: "Mei L.",   color: "#a78bfa", status: "active" },
];

function CandidateCell({ cand, isAlert }) {
  return (
    <div
      className={`relative flex flex-col items-center justify-center gap-1 rounded-xl p-2 aspect-video overflow-hidden
        ${isAlert ? "landing-alert-frame" : ""}`}
      style={{
        background: `linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)`,
        border: isAlert ? `1px solid rgba(239,68,68,0.5)` : `1px solid rgba(255,255,255,0.07)`,
      }}
    >
      {/* Scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 3px)",
        }}
      />
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-white"
        style={{ background: isAlert ? "rgba(239,68,68,0.25)" : `${cand.color}25`, border: `1.5px solid ${isAlert ? "#ef4444" : cand.color}60` }}
      >
        {cand.init}
      </div>
      <p className="text-[8px] font-mono text-slate-400 leading-none">{cand.name}</p>
      {/* Status indicator */}
      <div className="flex items-center gap-1">
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{
            background: isAlert ? "#ef4444" : cand.color,
            boxShadow: isAlert
              ? "0 0 6px 2px rgba(239,68,68,0.8)"
              : `0 0 6px 2px ${cand.color}80`,
          }}
        />
        <span
          className="text-[7.5px] font-bold leading-none"
          style={{ color: isAlert ? "#f87171" : cand.color }}
        >
          {isAlert ? "TAB SWITCH ⚠" : cand.status === "warn" ? "FRAME DROP" : "LIVE"}
        </span>
      </div>
      {/* Recording badge (top-left) */}
      <div className="absolute top-1.5 left-1.5 flex items-center gap-0.5">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 landing-live-dot" />
        <span className="text-[6px] font-bold text-rose-400 tracking-wide">REC</span>
      </div>
      {/* ID top-right */}
      <span className="absolute top-1.5 right-1.5 text-[6px] font-mono text-slate-600">{cand.id}</span>
    </div>
  );
}

function LiveMonitorMockup({ compact = false }) {
  const [alertIdx, setAlertIdx] = useState(1);
  const [frameCount, setFrameCount] = useState(30);
  const [latency, setLatency] = useState(14);

  useEffect(() => {
    const alertT = setInterval(() => setAlertIdx((i) => (i === 1 ? 3 : 1)), 2800);
    const fpsT = setInterval(() => setFrameCount(28 + Math.round(Math.random() * 4)), 900);
    const latT = setInterval(() => setLatency(11 + Math.round(Math.random() * 8)), 1200);
    return () => { clearInterval(alertT); clearInterval(fpsT); clearInterval(latT); };
  }, []);

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-2xl w-full"
      style={{
        background: "linear-gradient(145deg, #0d1224 0%, #080b18 100%)",
        border: "1px solid rgba(79,123,255,0.15)",
        boxShadow: "0 0 60px rgba(79,123,255,0.08), 0 32px 64px rgba(0,0,0,0.6)",
      }}
    >
      {/* Browser chrome bar */}
      <div
        className="flex items-center justify-between px-4 py-2.5 border-b"
        style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.025)" }}
      >
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          <span className="ml-3 text-[10px] font-mono text-slate-500">
            proctor.skillbrix.io/live/session-8921
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 landing-live-green" />
          <span className="text-[9px] font-bold text-emerald-400">512 ACTIVE</span>
        </div>
      </div>

      {/* Dashboard sub-header */}
      <div
        className="flex items-center justify-between px-4 py-2 border-b"
        style={{ borderColor: "rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.012)" }}
      >
        <div className="flex items-center gap-2">
          <Radio size={11} className="text-blue-400" style={{ animation: "pulse 1.5s ease-in-out infinite" }} />
          <span className="text-[10px] font-bold text-slate-300">NOC Monitor · JEE Batch 2026</span>
        </div>
        <div className="flex items-center gap-4 font-mono text-[9px]">
          <span className="text-slate-500">FPS: <strong className="text-blue-400">{frameCount}</strong></span>
          <span className="text-slate-500">Latency: <strong className="text-cyan-400">{latency}ms</strong></span>
          <span className="text-slate-500">Violations: <strong className="text-rose-400">3</strong></span>
        </div>
      </div>

      {/* Candidate grid */}
      <div className="grid grid-cols-3 gap-1.5 p-3">
        {CANDIDATES.map((c, i) => (
          <CandidateCell key={c.id} cand={c} isAlert={i === alertIdx} />
        ))}
      </div>

      {/* Stream health footer */}
      <div
        className="flex items-center justify-between px-4 py-2 border-t"
        style={{ borderColor: "rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.018)" }}
      >
        <span className="text-[9px] font-mono text-slate-500">
          WebSocket: <span className="text-blue-400">volatile relay · 512 streams</span>
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 landing-live-green" />
          <span className="text-[9px] font-bold text-emerald-400">All feeds healthy</span>
        </div>
      </div>
    </div>
  );
}

/* ─── SECTION: HERO ────────────────────────────────────────────────────────────  */
function HeroSection() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 60]);

  return (
    <section className="relative min-h-screen flex flex-col justify-center pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">

      {/* ── Radial spotlight behind headline ─────────────────────────────── */}
      <div
        className="landing-spotlight absolute top-[15%] left-1/2 -translate-x-1/2 w-[700px] h-[480px] rounded-full pointer-events-none -z-10"
        style={{
          background: "radial-gradient(ellipse at center, rgba(79,123,255,0.22) 0%, rgba(124,92,252,0.12) 40%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

        {/* ── LEFT: Copy ─────────────────────────────────────────────────── */}
        <div className="space-y-8">
          {/* Pill badge */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide"
            style={{
              background: "rgba(79,123,255,0.1)",
              border: "1px solid rgba(79,123,255,0.3)",
              color: "#93b4ff",
            }}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 landing-live-green" />
            Enterprise AI Proctoring — Production-Grade
            <ChevronRight size={12} className="text-blue-400" />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl sm:text-6xl lg:text-[68px] font-black leading-[1.04] tracking-tight"
            style={{ color: "#F0F4FF" }}
          >
            Run{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #4F7BFF 0%, #7C5CFC 50%, #06B6D4 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Cheat-Proof
            </span>{" "}
            Exams at Scale,{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #4F7BFF 0%, #06B6D4 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Watched by AI
            </span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.2 }}
            className="text-lg text-slate-400 leading-relaxed max-w-lg"
          >
            Skillbrix delivers real-time AI proctoring for 500+ simultaneous candidates — live webcam monitoring, instant tab-switch alerts, automated subject-wise analytics, and one-click result publishing.
          </motion.p>

          {/* CTA row */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 pt-1"
          >
            <Link
              to="/login"
              className="landing-cta-primary group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-white font-bold text-base transition-all hover:-translate-y-0.5 hover:shadow-xl"
              style={{ boxShadow: "0 8px 32px rgba(79,123,255,0.3)" }}
            >
              <Shield size={17} />
              Book a Demo
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#features"
              className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-base transition-all hover:-translate-y-0.5 glass-card"
              style={{ color: "#cbd5e1" }}
            >
              <Play size={15} style={{ color: "#06B6D4" }} />
              See it in Action
            </a>
          </motion.div>

          {/* Trust micro-stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="flex flex-wrap gap-6 pt-2"
          >
            {[
              ["500+", "Concurrent candidates"],
              ["<100ms", "Query latency"],
              ["30 FPS", "Volatile webcam relay"],
              ["Zero lag", "Frame delivery"],
            ].map(([v, l]) => (
              <div key={v} className="text-center">
                <p className="text-xl font-black" style={{ color: "#e2e8ff" }}>{v}</p>
                <p className="text-[11px] text-slate-500 font-medium">{l}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── RIGHT: Animated Live Monitor ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: 60, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="landing-float relative"
        >
          {/* Glow halo */}
          <div
            className="absolute -inset-8 rounded-3xl pointer-events-none -z-10"
            style={{
              background: "radial-gradient(ellipse at center, rgba(79,123,255,0.18) 0%, transparent 70%)",
              filter: "blur(20px)",
            }}
          />
          <LiveMonitorMockup />

          {/* Floating alert chip */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-4 -right-4 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold glass-card shadow-2xl"
            style={{ border: "1px solid rgba(239,68,68,0.4)", background: "rgba(239,68,68,0.08)" }}
          >
            <AlertTriangle size={12} style={{ color: "#f87171" }} />
            <span style={{ color: "#fca5a5" }}>Tab Switch Detected</span>
          </motion.div>

          {/* Floating "All Clear" chip */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            className="absolute -bottom-4 -left-4 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold shadow-2xl glass-card"
            style={{ border: "1px solid rgba(16,185,129,0.4)", background: "rgba(16,185,129,0.08)" }}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 landing-live-green" />
            <span style={{ color: "#6ee7b7" }}>498 Streams Healthy</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── SECTION: PROBLEM → SOLUTION STRIP ───────────────────────────────────────  */
const PROBLEMS = [
  {
    icon: Users,
    title: "Manual proctoring doesn't scale",
    body: "Hiring 50 invigilators for 500 candidates is expensive, inconsistent, and impossible for remote or hybrid exams.",
    solveTitle: "AI watches every seat simultaneously",
    solveBody: "Skillbrix monitors 500+ candidates with zero invigilators. Every infraction is flagged, timestamped, and logged automatically.",
    accent: "#ef4444",
  },
  {
    icon: Eye,
    title: "Exam fraud goes undetected",
    body: "Tab switching, phone usage, face absence, and screen sharing all slip past traditional supervision.",
    solveTitle: "Real-time multi-signal detection",
    solveBody: "Fullscreen enforcement, tab-switch traps, face-absence detection, and browser-lock combine to make cheating mathematically futile.",
    accent: "#f59e0b",
  },
  {
    icon: TrendingUp,
    title: "Results take days or weeks",
    body: "Manual grading, subject collation, and result compilation waste faculty time and keep candidates waiting.",
    solveTitle: "Instant automated assessment",
    solveBody: "Scores compute the moment a candidate submits. Subject-wise breakdowns and pass/fail status publish with one click.",
    accent: "#10b981",
  },
];

function ProblemSection() {
  const [flipped, setFlipped] = useState({});
  const toggle = (i) => setFlipped((f) => ({ ...f, [i]: !f[i] }));

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8">
      {/* Angled top divider so section bleeds into hero */}
      <div className="absolute inset-0 -z-10 clip-top-right" style={{ background: "rgba(79,123,255,0.03)" }} />

      <div className="max-w-7xl mx-auto">
        <Reveal className="text-center mb-14 space-y-3">
          <p className="text-xs font-extrabold tracking-[0.25em] uppercase" style={{ color: "#4F7BFF" }}>
            Why institutions switch
          </p>
          <h2 className="text-4xl sm:text-5xl font-black" style={{ color: "#f0f4ff" }}>
            Three problems. One platform.
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PROBLEMS.map((p, i) => {
            const Icon = p.icon;
            const active = flipped[i];
            return (
              <Reveal key={p.title} delay={i * 0.12}>
                <div
                  className="relative rounded-2xl p-7 cursor-pointer group transition-all duration-300 hover:-translate-y-1 h-full glass-card"
                  style={{ borderColor: active ? `${p.accent}40` : undefined }}
                  onClick={() => toggle(i)}
                >
                  {/* Glow on hover */}
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `radial-gradient(ellipse at 30% 40%, ${p.accent}0a 0%, transparent 70%)` }}
                  />
                  <AnimatePresence mode="wait">
                    {!active ? (
                      <motion.div key="problem" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="space-y-4">
                        <div className="p-3 rounded-xl w-fit" style={{ background: `${p.accent}18`, border: `1px solid ${p.accent}30` }}>
                          <Icon size={22} style={{ color: p.accent }} />
                        </div>
                        <div>
                          <p className="text-[11px] font-extrabold uppercase tracking-widest mb-2" style={{ color: p.accent }}>The Problem</p>
                          <h3 className="text-xl font-black mb-3 leading-snug" style={{ color: "#f0f4ff" }}>{p.title}</h3>
                          <p className="text-sm text-slate-400 leading-relaxed">{p.body}</p>
                        </div>
                        <p className="text-[11px] font-semibold text-slate-500">Click to see the solution →</p>
                      </motion.div>
                    ) : (
                      <motion.div key="solution" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="space-y-4">
                        <div className="p-3 rounded-xl w-fit" style={{ background: "rgba(79,123,255,0.15)", border: "1px solid rgba(79,123,255,0.3)" }}>
                          <CheckCircle size={22} style={{ color: "#4F7BFF" }} />
                        </div>
                        <div>
                          <p className="text-[11px] font-extrabold uppercase tracking-widest mb-2" style={{ color: "#4F7BFF" }}>Skillbrix Solution</p>
                          <h3 className="text-xl font-black mb-3 leading-snug" style={{ color: "#f0f4ff" }}>{p.solveTitle}</h3>
                          <p className="text-sm text-slate-300 leading-relaxed">{p.solveBody}</p>
                        </div>
                        <p className="text-[11px] font-semibold" style={{ color: "#4F7BFF" }}>← Click to flip back</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── ANIMATED SCORE BAR ──────────────────────────────────────────────────────── */
function ScoreBar({ label, score, max, color = "#4F7BFF" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const pct = Math.round((score / max) * 100);
  return (
    <div ref={ref} className="space-y-1">
      <div className="flex justify-between text-xs font-bold" style={{ color: "#cbd5e1" }}>
        <span>{label}</span>
        <span style={{ color }}>{score}/{max}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={inView ? { width: `${pct}%` } : {}}
          transition={{ duration: 1.1, ease: "easeOut", delay: 0.2 }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}, ${color}cc)` }}
        />
      </div>
    </div>
  );
}

/* ─── SECTION: CORE FEATURES ──────────────────────────────────────────────────── */
const TECH_PACKAGES = {
  backend: [
    ["express",           "REST API: /auth, /exams, /submissions, /analytics, /admin"],
    ["@prisma/client",    "Type-safe ORM · schema migrations on Supabase PostgreSQL"],
    ["socket.io",         "WebSocket engine for real-time webcam frame relay & alerts"],
    ["jsonwebtoken",      "Stateless JWT auth — access + refresh token rotation, in-memory"],
    ["bcryptjs",          "Salted blowfish hashing for secure password storage"],
    ["cors",              "Cross-origin resource sharing (Vercel ↔ Railway)"],
    ["helmet",            "HSTS, CSP, X-Frame-Options, clickjacking protection"],
    ["express-rate-limit","IP rate limiting + brute-force protection on auth routes"],
    ["pino",              "Low-overhead structured JSON logging for full audit trail"],
  ],
  frontend: [
    ["react & react-dom", "Component UI with custom Hooks for exam state management"],
    ["vite",              "Next-gen build tool with sub-300ms HMR, tree-shaking"],
    ["react-router-dom",  "SPA routing: public, auth-protected, and admin role routes"],
    ["axios",             "HTTP client with JWT injection + silent 401 refresh interceptors"],
    ["socket.io-client",  "WebSocket client for admin monitor rooms & frame streaming"],
    ["framer-motion",     "Scroll-triggered animations, interactive micro-interactions"],
    ["tailwindcss",       "Utility-first CSS · glassmorphism dark-mode design system"],
    ["katex",             "Client-side LaTeX/MathJax rendering for science/math exams"],
    ["lucide-react",      "Consistent 24×24 icon library, zero weight overhead"],
  ],
};

function FeaturesSection() {
  const [techTab, setTechTab] = useState("backend");

  return (
    <section id="features" className="relative py-24 px-4 sm:px-6 lg:px-8">

      {/* Faint angled bg bleed */}
      <div className="absolute inset-0 -z-10" style={{ background: "linear-gradient(180deg, transparent 0%, rgba(79,123,255,0.025) 50%, transparent 100%)" }} />

      <div className="max-w-7xl mx-auto space-y-8">

        {/* Section header */}
        <Reveal className="text-center space-y-3 mb-4">
          <p className="text-xs font-extrabold tracking-[0.25em] uppercase" style={{ color: "#06B6D4" }}>Platform Capabilities</p>
          <h2 className="text-4xl sm:text-5xl font-black" style={{ color: "#f0f4ff" }}>
            Built for institutions that take exams seriously
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-base">
            Every feature is engineered for high-concurrency, tamper-resistant, institution-grade examination.
          </p>
        </Reveal>

        {/* ── BIG FEATURE: Live AI Proctoring (full-width) ──────────────── */}
        <Reveal>
          <div
            className="relative rounded-3xl overflow-hidden glass-card"
            style={{ borderColor: "rgba(79,123,255,0.2)" }}
          >
            {/* Blue glow halo */}
            <div className="absolute top-0 left-0 w-[600px] h-[400px] pointer-events-none -z-0"
              style={{ background: "radial-gradient(ellipse at 0% 0%, rgba(79,123,255,0.12) 0%, transparent 70%)" }} />

            <div className="relative grid grid-cols-1 lg:grid-cols-2">
              {/* Left: copy */}
              <div className="p-10 sm:p-14 flex flex-col justify-center space-y-6 z-10">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl" style={{ background: "rgba(79,123,255,0.15)", border: "1px solid rgba(79,123,255,0.3)" }}>
                    <Video size={26} style={{ color: "#4F7BFF" }} />
                  </div>
                  <span className="text-[11px] font-extrabold tracking-[0.2em] uppercase" style={{ color: "#4F7BFF" }}>Live AI Proctoring</span>
                </div>
                <h3 className="text-3xl font-black leading-tight" style={{ color: "#f0f4ff" }}>
                  Zero-Lag NOC Monitor — 500+ Candidates, One Screen
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  Real-time webcam feeds powered by Socket.io volatile broadcasts — every frame delivered without queueing. Admins see all candidates simultaneously, receive instant violation alerts, and broadcast announcements to the entire cohort in one click.
                </p>
                <ul className="space-y-2.5">
                  {[
                    "Tab-switch & fullscreen exit detection with auto-flag",
                    "Face-absence & webcam occlusion detection",
                    "Multi-admin monitoring rooms with live annotation",
                    "Broadcast messages to all candidates simultaneously",
                    "Violation log with timestamp, screenshot, and severity",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-slate-300">
                      <Check size={14} style={{ color: "#4F7BFF", marginTop: 2, flexShrink: 0 }} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Right: live mockup */}
              <div className="p-6 sm:p-8 flex items-center justify-center" style={{ borderLeft: "1px solid rgba(255,255,255,0.04)" }}>
                <LiveMonitorMockup compact />
              </div>
            </div>
          </div>
        </Reveal>

        {/* ── BENTO GRID: 2 medium cards ───────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Results Engine */}
          <Reveal delay={0.1}>
            <div className="relative rounded-2xl p-8 space-y-6 glass-card h-full group hover:-translate-y-1 transition-all duration-300"
              style={{ borderColor: "rgba(16,185,129,0.15)" }}>
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: "radial-gradient(ellipse at 20% 50%, rgba(16,185,129,0.05) 0%, transparent 70%)" }} />
              <div className="relative">
                <div className="p-3 rounded-xl w-fit mb-5" style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)" }}>
                  <BarChart3 size={24} style={{ color: "#10b981" }} />
                </div>
                <span className="text-[10px] font-extrabold tracking-widest uppercase" style={{ color: "#10b981" }}>Assessment Engine</span>
                <h3 className="mt-2 text-2xl font-black" style={{ color: "#f0f4ff" }}>Results & Subject-Wise Analytics</h3>
                <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                  Scores compute the moment a candidate submits. Subject breakdowns, pass/fail status, and accuracy stats are ready instantly. Review question-by-question, override if needed, publish or export with one click.
                </p>
                {/* Animated score bars */}
                <div className="mt-5 space-y-3 p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <ScoreBar label="Physics" score={87} max={100} color="#4F7BFF" />
                  <ScoreBar label="Chemistry" score={92} max={100} color="#10b981" />
                  <ScoreBar label="Mathematics" score={78} max={100} color="#7C5CFC" />
                  <ScoreBar label="Biology" score={95} max={100} color="#06B6D4" />
                </div>
              </div>
            </div>
          </Reveal>

          {/* AI Question Importer */}
          <Reveal delay={0.18}>
            <div className="relative rounded-2xl p-8 space-y-6 glass-card h-full group hover:-translate-y-1 transition-all duration-300"
              style={{ borderColor: "rgba(245,158,11,0.15)" }}>
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: "radial-gradient(ellipse at 80% 30%, rgba(245,158,11,0.05) 0%, transparent 70%)" }} />
              <div className="relative">
                <div className="p-3 rounded-xl w-fit mb-5" style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)" }}>
                  <BookOpen size={24} style={{ color: "#f59e0b" }} />
                </div>
                <span className="text-[10px] font-extrabold tracking-widest uppercase" style={{ color: "#f59e0b" }}>Question Bank</span>
                <h3 className="mt-2 text-2xl font-black" style={{ color: "#f0f4ff" }}>AI Question Importer & Bank</h3>
                <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                  Bulk import 2,000 questions via Excel/CSV in one upload. Full KaTeX/MathJax rendering for physics, chemistry, and math notation. AI-generated paper options tagged by subject, difficulty, and question type.
                </p>
                {/* Tag cloud */}
                <div className="mt-5 flex flex-wrap gap-2">
                  {["MCQ", "Descriptive", "Short Answer", "KaTeX Math", "AI Generated", "Subject Tagging", "Difficulty Filter", "Bulk Import"].map((t) => (
                    <span key={t} className="px-3 py-1 rounded-lg text-xs font-bold"
                      style={{ background: "rgba(245,158,11,0.10)", border: "1px solid rgba(245,158,11,0.20)", color: "#fcd34d" }}>
                      {t}
                    </span>
                  ))}
                </div>
                {/* Mini import progress bar */}
                <div className="mt-5 p-3 rounded-xl font-mono text-xs space-y-1.5" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <p className="text-slate-500">{">"} Importing questions.xlsx...</p>
                  <p style={{ color: "#f59e0b" }}>{">"} 2,000 questions parsed ✓</p>
                  <p style={{ color: "#10b981" }}>{">"} KaTeX rendered for 348 entries ✓</p>
                  <p className="text-slate-400">{">"} Bank updated. Ready to assign.</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* ── 2 SMALLER FEATURE CARDS ─────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Secure Exam Terminal */}
          <Reveal delay={0.1}>
            <div className="relative rounded-2xl p-8 glass-card h-full group hover:-translate-y-1 transition-all duration-300"
              style={{ borderColor: "rgba(6,182,212,0.15)" }}>
              <div className="p-3 rounded-xl w-fit mb-5" style={{ background: "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.25)" }}>
                <Lock size={22} style={{ color: "#06B6D4" }} />
              </div>
              <span className="text-[10px] font-extrabold tracking-widest uppercase" style={{ color: "#06B6D4" }}>Candidate Terminal</span>
              <h3 className="mt-2 text-2xl font-black mb-3" style={{ color: "#f0f4ff" }}>Secure Exam Terminal</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Fullscreen DOM lockdown before the exam begins. Pre-exam compatibility check verifies webcam, browser, and screen resolution. Offline-safe auto-save ensures no progress is ever lost.
              </p>
              <ul className="space-y-2">
                {["Fullscreen enforcement + exit detection", "System check: webcam, bandwidth, browser", "Auto-save every 30s — offline resilient", "Timer synchronization with server clock"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-slate-300">
                    <Check size={12} style={{ color: "#06B6D4", flexShrink: 0 }} /> {f}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* Super Admin */}
          <Reveal delay={0.18}>
            <div className="relative rounded-2xl p-8 glass-card h-full group hover:-translate-y-1 transition-all duration-300"
              style={{ borderColor: "rgba(124,92,252,0.15)" }}>
              <div className="p-3 rounded-xl w-fit mb-5" style={{ background: "rgba(124,92,252,0.12)", border: "1px solid rgba(124,92,252,0.25)" }}>
                <Building size={22} style={{ color: "#7C5CFC" }} />
              </div>
              <span className="text-[10px] font-extrabold tracking-widest uppercase" style={{ color: "#7C5CFC" }}>Command Center</span>
              <h3 className="mt-2 text-2xl font-black mb-3" style={{ color: "#f0f4ff" }}>Super Admin Multi-Tenant Management</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Manage multiple institutions, departments, and faculty hierarchies from one command center. Full audit logs, role-based access control, and AI infrastructure monitoring built-in.
              </p>
              <ul className="space-y-2">
                {["Multi-institution & department management", "Role-based access (Super Admin / Faculty / Candidate)", "Full audit trail of every admin action", "AI usage & infrastructure dashboard"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-slate-300">
                    <Check size={12} style={{ color: "#7C5CFC", flexShrink: 0 }} /> {f}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        {/* ── TECH STACK TABBED CODE VIEW ───────────────────────────────── */}
        <Reveal delay={0.1}>
          <div className="rounded-3xl overflow-hidden glass-card" style={{ borderColor: "rgba(79,123,255,0.15)" }}>
            {/* Tab bar */}
            <div className="flex gap-1 p-3 border-b" style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}>
              <p className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-500 mr-2">
                <Layers size={12} style={{ color: "#4F7BFF" }} />
                Full-Stack Package Breakdown
              </p>
              {[{ id: "backend", icon: Server, label: "backend/package.json" }, { id: "frontend", icon: Code, label: "frontend/package.json" }].map((t) => {
                const Icon = t.icon;
                return (
                  <button key={t.id} onClick={() => setTechTab(t.id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${techTab === t.id ? "text-white" : "text-slate-500 hover:text-slate-300"}`}
                    style={techTab === t.id ? { background: "rgba(79,123,255,0.2)", border: "1px solid rgba(79,123,255,0.35)", color: "#93b4ff" } : {}}
                  >
                    <Icon size={12} /> {t.label}
                  </button>
                );
              })}
            </div>
            {/* Package list */}
            <AnimatePresence mode="wait">
              <motion.div
                key={techTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="p-8 font-mono text-sm grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3"
              >
                {TECH_PACKAGES[techTab].map(([pkg, desc]) => (
                  <div key={pkg} className="flex gap-3 items-start">
                    <span className="shrink-0 font-black" style={{ color: techTab === "backend" ? "#4F7BFF" : "#06B6D4", minWidth: "160px" }}>
                      "{pkg}"
                    </span>
                    <span className="text-slate-500 text-xs mt-0.5">// {desc}</span>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── SECTION: HOW IT WORKS ────────────────────────────────────────────────────  */
const HOW_STEPS = [
  { n: "01", icon: FileText, color: "#4F7BFF",  title: "Import Questions",    body: "Bulk upload 2,000 questions from Excel/CSV, or use the AI paper generator. Tag by subject, difficulty, and type instantly." },
  { n: "02", icon: Cpu,      color: "#7C5CFC",  title: "Configure Exam",      body: "Set duration, negative marking, eligible candidates, and proctoring sensitivity — all in a five-minute setup wizard." },
  { n: "03", icon: Radio,    color: "#ef4444",  title: "AI Proctors Live",    body: "Candidates enter the secure terminal. AI watches every webcam, locks fullscreen, and logs each infraction in real-time." },
  { n: "04", icon: BarChart3,color: "#10b981",  title: "Instant Results",     body: "Scores publish automatically at submission. Review breakdowns, override if needed, and export CSVs in one click." },
];

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-24 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 clip-top-left" style={{ background: "rgba(124,92,252,0.03)" }} />

      <div className="max-w-7xl mx-auto">
        <Reveal className="text-center mb-16 space-y-3">
          <p className="text-xs font-extrabold tracking-[0.25em] uppercase" style={{ color: "#7C5CFC" }}>Simple Workflow</p>
          <h2 className="text-4xl sm:text-5xl font-black" style={{ color: "#f0f4ff" }}>
            From question to result in four steps
          </h2>
        </Reveal>

        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Connector line */}
          <div className="hidden lg:block absolute top-14 left-[12.5%] right-[12.5%] h-px"
            style={{ background: "linear-gradient(90deg, transparent, rgba(79,123,255,0.4), rgba(124,92,252,0.4), rgba(16,185,129,0.4), transparent)" }} />

          {HOW_STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <Reveal key={s.n} delay={i * 0.13}>
                <div className="relative flex flex-col items-center text-center gap-4 p-7 rounded-2xl glass-card group hover:-translate-y-1 transition-all duration-300 h-full">
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: `radial-gradient(ellipse at 50% 30%, ${s.color}08 0%, transparent 70%)` }} />
                  <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: `${s.color}18`, border: `1px solid ${s.color}35` }}>
                    <Icon size={24} style={{ color: s.color }} />
                    <span className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black text-white"
                      style={{ background: s.color }}>
                      {s.n}
                    </span>
                  </div>
                  <h4 className="text-base font-bold" style={{ color: "#f0f4ff" }}>{s.title}</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">{s.body}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── SECTION: SECURITY & TRUST ────────────────────────────────────────────────  */
const SECURITY_CARDS = [
  {
    icon: Database,
    badge: "DATABASE",
    badgeColor: "#10b981",
    title: "Supabase Session Pooling (Port 5432)",
    body: "Production uses the Supabase Session Pooler (Port 5432, connection_limit=10), solving connection resets under 500+ concurrent load — sub-second query times, zero dropped sessions.",
    code: ['postgresql://...@pooler:5432/postgres', '?connection_limit=10&pool_timeout=20'],
    codeColor: "#10b981",
  },
  {
    icon: ShieldCheck,
    badge: "AUTHENTICATION",
    badgeColor: "#4F7BFF",
    title: "In-Memory JWT Dual-Token Auth",
    body: "Access tokens verified purely in-memory — no database round-trip on every request. Refresh tokens rotate on 401. Millions of saved DB calls across a 512-candidate exam session.",
    code: ['const payload = jwt.verify(token, secret)', '// Zero DB hits on each req'],
    codeColor: "#4F7BFF",
  },
  {
    icon: Wifi,
    badge: "REAL-TIME",
    badgeColor: "#06B6D4",
    title: "Volatile WebSocket Frame Relay",
    body: "socket.volatile.emit() automatically drops stale webcam frames when a candidate disconnects, preventing queue buildup and memory leaks under network spikes — keeps every stream responsive.",
    code: ['socket.volatile.emit("frame", data)', '// Stale frames auto-dropped'],
    codeColor: "#06B6D4",
  },
];

function SecuritySection() {
  return (
    <section id="security" className="relative py-24 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10"
        style={{ background: "linear-gradient(180deg, transparent 0%, rgba(16,185,129,0.025) 50%, transparent 100%)" }} />

      <div className="max-w-7xl mx-auto">
        <Reveal className="text-center mb-16 space-y-3">
          <p className="text-xs font-extrabold tracking-[0.25em] uppercase" style={{ color: "#10b981" }}>Infrastructure & Security</p>
          <h2 className="text-4xl sm:text-5xl font-black" style={{ color: "#f0f4ff" }}>
            Enterprise-hardened from the ground up
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Security isn't a checkbox. Every layer of Skillbrix is hardened to protect candidate data, prevent session hijacking, and survive high-concurrency spikes without flinching.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SECURITY_CARDS.map((c, i) => {
            const Icon = c.icon;
            return (
              <Reveal key={c.title} delay={i * 0.12}>
                <div className="rounded-2xl p-8 space-y-5 glass-card h-full group hover:-translate-y-1 transition-all duration-300"
                  style={{ borderColor: `${c.badgeColor}20` }}>
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide"
                      style={{ background: `${c.badgeColor}18`, border: `1px solid ${c.badgeColor}35`, color: c.badgeColor }}>
                      {c.badge}
                    </span>
                    <div className="p-2 rounded-xl" style={{ background: `${c.badgeColor}15`, border: `1px solid ${c.badgeColor}25` }}>
                      <Icon size={18} style={{ color: c.badgeColor }} />
                    </div>
                  </div>
                  <h4 className="text-xl font-bold leading-snug" style={{ color: "#f0f4ff" }}>{c.title}</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">{c.body}</p>
                  {/* Code snippet */}
                  <div className="rounded-xl px-4 py-3 font-mono text-xs space-y-1"
                    style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    {c.code.map((line, li) => (
                      <p key={li} style={{ color: li === 0 ? c.codeColor : "#64748b" }}>{line}</p>
                    ))}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* Security badge grid */}
        <Reveal delay={0.2} className="mt-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Lock,      label: "End-to-End Encryption",   color: "#4F7BFF" },
              { icon: GitBranch, label: "Audit Trail on All Events",color: "#7C5CFC" },
              { icon: ShieldCheck,label: "Role-Based Access Control",color: "#10b981" },
              { icon: Gauge,     label: "Rate-Limiting on All Endpoints", color: "#f59e0b" },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex items-center gap-3 p-4 rounded-xl glass-card">
                <div className="p-2 rounded-lg shrink-0" style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <span className="text-xs font-semibold text-slate-300">{label}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── SECTION: STAT BAND / SOCIAL PROOF ───────────────────────────────────────  */
function StatBandSection() {
  const STATS = [
    { val: "500+",   label: "Concurrent Candidates Per Session",     color: "#4F7BFF" },
    { val: "2,000",  label: "Questions Per Single Bulk Import",       color: "#7C5CFC" },
    { val: "<100ms", label: "Average API Query Latency",             color: "#06B6D4" },
    { val: "30 FPS", label: "Volatile WebSocket Frame Rate",         color: "#10b981" },
  ];
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 -z-10"
        style={{ background: "linear-gradient(90deg, rgba(79,123,255,0.04) 0%, rgba(124,92,252,0.04) 50%, rgba(6,182,212,0.04) 100%)", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <p className="text-center text-xs font-bold tracking-[0.2em] uppercase text-slate-500 mb-12">
            Trusted by leading institutions & coaching centers
          </p>
        </Reveal>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map(({ val, label, color }, i) => (
            <Reveal key={val} delay={i * 0.1}>
              <div className="space-y-1.5">
                <p className="text-4xl sm:text-5xl font-black"
                  style={{
                    background: `linear-gradient(135deg, ${color}, ${color}99)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}>
                  {val}
                </p>
                <p className="text-xs text-slate-500 font-medium leading-snug">{label}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Placeholder institution logos */}
        <Reveal delay={0.2} className="mt-14">
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {["Premier IIT Coaching", "National Law Institute", "Corporate L&D Hub", "State Board Exam Authority", "Engineering Academy"].map((name) => (
              <div key={name} className="px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide text-slate-600 glass-card">
                {name}
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── SECTION: FINAL CTA BANNER ───────────────────────────────────────────────  */
function FinalCTASection() {
  return (
    <section className="py-28 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
      <Reveal>
        <div
          className="relative rounded-3xl overflow-hidden p-14 sm:p-20 space-y-8"
          style={{
            background: "linear-gradient(135deg, #0d1a3d 0%, #080b18 50%, #120d2a 100%)",
            border: "1px solid rgba(79,123,255,0.25)",
            boxShadow: "0 0 80px rgba(79,123,255,0.1), 0 48px 96px rgba(0,0,0,0.5)",
          }}
        >
          {/* Dot grid inside CTA */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.07]"
            style={{ backgroundImage: "radial-gradient(circle, #4F7BFF 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

          {/* Top glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] pointer-events-none"
            style={{ background: "radial-gradient(ellipse at top, rgba(79,123,255,0.2) 0%, transparent 70%)" }} />

          <div className="relative space-y-5">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold"
              style={{ background: "rgba(79,123,255,0.12)", border: "1px solid rgba(79,123,255,0.3)", color: "#93b4ff" }}>
              <Star size={11} style={{ color: "#4F7BFF" }} />
              Enterprise-ready · Deploy in days, not months
            </div>
            <h2 className="text-4xl sm:text-6xl font-black leading-tight" style={{ color: "#f0f4ff" }}>
              Ready to run your next exam<br />without the chaos?
            </h2>
            <p className="text-lg text-slate-300 max-w-xl mx-auto">
              Institutions choose Skillbrix for one reason: it works at scale, under pressure, with zero tolerance for compromise. AI watches. You deliver results.
            </p>
          </div>

          <div className="relative flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/login"
              className="landing-cta-primary group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-white font-bold text-base transition-all hover:-translate-y-1"
              style={{ boxShadow: "0 8px 32px rgba(79,123,255,0.35)" }}
            >
              <Shield size={18} />
              Schedule a Live Demo
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#features"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-base transition-all hover:-translate-y-1 glass-card"
              style={{ color: "#cbd5e1" }}
            >
              Talk to Sales
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ─── FOOTER ───────────────────────────────────────────────────────────────────  */
function Footer() {
  return (
    <footer className="border-t px-4 sm:px-6 lg:px-8 py-16"
      style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.012)" }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #4F7BFF, #7C5CFC)" }}>
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black" style={{ color: "#f0f4ff" }}>
                Skill<span style={{ background: "linear-gradient(135deg, #4F7BFF, #06B6D4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>brix</span>
              </span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
              Enterprise AI Proctoring & Examination Portal. Built for institutions that take exams seriously.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold" style={{ color: "#10b981" }}>
              <span className="w-2 h-2 rounded-full bg-emerald-400 landing-live-green" />
              All Systems Operational
            </div>
          </div>

          {/* Links */}
          {[
            { head: "Product",  links: ["Live Monitor", "Results Engine", "Question Bank", "Exam Terminal", "Admin Center"] },
            { head: "Resources",links: ["Documentation", "API Reference", "Security Spec", "Engineering Blog", "Changelog"] },
            { head: "Legal",    links: ["Privacy Policy", "Terms of Service", "Security", "Data Processing", "Cookies"] },
          ].map(({ head, links }) => (
            <div key={head}>
              <p className="text-xs font-extrabold uppercase tracking-widest mb-4" style={{ color: "#f0f4ff" }}>{head}</p>
              <ul className="space-y-3">
                {links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-slate-500 hover:text-slate-200 transition-colors">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600"
          style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          <p>© 2026 Skillbrix Inc. All rights reserved. Enterprise Examination Infrastructure.</p>
          <Link to="/login" className="font-semibold transition-colors hover:text-slate-300" style={{ color: "#4F7BFF" }}>
            Log In to Portal →
          </Link>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   ROOT LANDING COMPONENT
   ═══════════════════════════════════════════════════════════════════════════════ */
export const Landing = () => {
  const [navScrolled, setNavScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="min-h-screen font-sans selection:bg-blue-600 selection:text-white overflow-x-hidden"
      style={{ background: "#05060F", color: "#e2e8f0" }}
    >

      {/* ═══════════════════════════════════════════════════════════════
          GLOBAL LAYERED BACKGROUND SYSTEM
          ═══════════════════════════════════════════════════════════════ */}
      <div className="fixed inset-0 pointer-events-none -z-20 overflow-hidden">

        {/* Layer 1 — Base diagonal gradient (not flat) */}
        <div className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse 120% 80% at 50% -10%, #0A0E1F 0%, #05060F 60%)" }} />

        {/* Layer 2 — Dot-matrix grid (5% opacity, system feel) */}
        <div className="absolute inset-0 opacity-[0.055]"
          style={{
            backgroundImage: "radial-gradient(circle, #4F7BFF 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }} />

        {/* Layer 3 — Glow orb 1 (top-left, blue, slow drift) */}
        <div
          className="landing-orb-1 absolute -top-32 -left-32 w-[700px] h-[700px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(79,123,255,0.25) 0%, transparent 65%)",
            filter: "blur(80px)",
          }}
        />

        {/* Layer 3 — Glow orb 2 (top-right, violet, slow drift) */}
        <div
          className="landing-orb-2 absolute top-[10%] right-[-10%] w-[600px] h-[600px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(124,92,252,0.20) 0%, transparent 65%)",
            filter: "blur(100px)",
          }}
        />

        {/* Layer 3 — Glow orb 3 (mid-page, cyan) */}
        <div
          className="landing-orb-3 absolute top-[55%] left-[5%] w-[500px] h-[500px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(6,182,212,0.14) 0%, transparent 65%)",
            filter: "blur(120px)",
          }}
        />

        {/* Layer 4 — Noise grain texture overlay (3% opacity) */}
        <div
          className="landing-noise absolute inset-0 opacity-[0.032]"
          style={{
            backgroundImage: NOISE_SVG,
            backgroundRepeat: "repeat",
            backgroundSize: "200px 200px",
          }}
        />
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          STICKY NAV
          ═══════════════════════════════════════════════════════════════ */}
      <motion.header
        className="sticky top-0 z-50 transition-all duration-300"
        style={navScrolled ? {
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          background: "rgba(5,6,15,0.85)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        } : {}}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105"
              style={{ background: "linear-gradient(135deg, #4F7BFF, #7C5CFC)", boxShadow: "0 4px 20px rgba(79,123,255,0.35)" }}>
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-black" style={{ color: "#f0f4ff" }}>
                Skill
                <span style={{
                  background: "linear-gradient(135deg, #4F7BFF, #06B6D4)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>brix</span>
              </span>
              <p className="hidden sm:block text-[9px] text-slate-600 tracking-[0.2em] uppercase -mt-0.5">
                Enterprise Proctoring
              </p>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-400">
            {[["#features", "Features"], ["#how-it-works", "How it Works"], ["#security", "Security"]].map(([href, label]) => (
              <a key={label} href={href} className="hover:text-white transition-colors">{label}</a>
            ))}
          </nav>

          {/* CTA row */}
          <div className="flex items-center gap-3">
            <a href="#features" className="hidden sm:block px-4 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:text-white transition-colors glass-card">
              Docs
            </a>
            <Link
              to="/login"
              className="landing-cta-primary group px-5 py-2.5 rounded-xl text-white text-sm font-bold flex items-center gap-1.5 transition-all hover:-translate-y-0.5"
              style={{ boxShadow: "0 4px 20px rgba(79,123,255,0.3)" }}
            >
              Request Demo
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </motion.header>

      {/* ═══════════════════════════════════════════════════════════════
          PAGE SECTIONS
          ═══════════════════════════════════════════════════════════════ */}
      <HeroSection />
      <ProblemSection />
      <FeaturesSection />
      <HowItWorksSection />
      <SecuritySection />
      <StatBandSection />
      <FinalCTASection />
      <Footer />
    </div>
  );
};

export default Landing;
