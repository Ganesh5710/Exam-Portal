/**
 * DemoExam.jsx
 * A fully self-contained demo exam page — no auth, no API.
 * Mimics the real ExamTerminal with: timer, question navigation,
 * answer selection, webcam preview simulation, fullscreen lock,
 * tab-switch detection, and a results screen at the end.
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  CheckCircle,
  AlertTriangle,
  Maximize2,
  Video,
  VideoOff,
  Shield,
  Flag,
  Home,
  BarChart3,
  Eye,
  ChevronLeft,
  ChevronRight,
  Award,
  RefreshCw,
} from "lucide-react";

/* ─── DEMO EXAM DATA ─────────────────────────────────────────────── */
const DEMO_EXAM = {
  title: "Skillbrix Platform Demo Exam",
  subject: "Mixed — Physics, Math & Aptitude",
  duration: 15 * 60, // 15 minutes in seconds
  totalMarks: 40,
  negativeMarking: -0.25,
  candidateName: "Demo Candidate",
  rollNo: "DEMO-2026",
};

const QUESTIONS = [
  {
    id: 1,
    subject: "Physics",
    text: "A body is thrown vertically upward with velocity u. The ratio of the time of ascent to the time of descent is:",
    options: ["1 : 1", "1 : 2", "2 : 1", "1 : 3"],
    correct: 0,
    marks: 4,
  },
  {
    id: 2,
    subject: "Physics",
    text: "The dimensional formula of angular momentum is:",
    options: ["[ML²T⁻¹]", "[ML²T⁻²]", "[MLT⁻¹]", "[M²L²T⁻¹]"],
    correct: 0,
    marks: 4,
  },
  {
    id: 3,
    subject: "Physics",
    text: "Which of the following correctly describes Ohm's Law?",
    options: [
      "V = IR where resistance is constant",
      "I = VR where resistance is constant",
      "R = IV where resistance varies",
      "V = I/R where resistance is constant",
    ],
    correct: 0,
    marks: 4,
  },
  {
    id: 4,
    subject: "Mathematics",
    text: "If f(x) = x² + 3x + 2, what are the roots of f(x) = 0?",
    options: ["x = -1, -2", "x = 1, 2", "x = -1, 2", "x = 1, -2"],
    correct: 0,
    marks: 4,
  },
  {
    id: 5,
    subject: "Mathematics",
    text: "What is the derivative of sin(x) · cos(x)?",
    options: ["cos(2x)", "sin(2x)", "cos²(x)", "−sin(2x)"],
    correct: 0,
    marks: 4,
  },
  {
    id: 6,
    subject: "Mathematics",
    text: "The sum of an infinite geometric series with first term 1 and common ratio 1/2 is:",
    options: ["2", "1", "3", "4"],
    correct: 0,
    marks: 4,
  },
  {
    id: 7,
    subject: "Aptitude",
    text: "A train 150m long passes a pole in 15 seconds. What is the speed of the train?",
    options: ["10 m/s", "12 m/s", "8 m/s", "15 m/s"],
    correct: 0,
    marks: 4,
  },
  {
    id: 8,
    subject: "Aptitude",
    text: "If 8 workers can complete a task in 12 days, how many workers are needed to complete it in 6 days?",
    options: ["16", "12", "14", "18"],
    correct: 0,
    marks: 4,
  },
  {
    id: 9,
    subject: "Aptitude",
    text: "What comes next in the series: 2, 6, 12, 20, 30, ...?",
    options: ["42", "40", "44", "36"],
    correct: 0,
    marks: 4,
  },
  {
    id: 10,
    subject: "Aptitude",
    text: "A shopkeeper buys goods at ₹800 and sells at ₹1000. What is the profit percentage?",
    options: ["25%", "20%", "15%", "30%"],
    correct: 0,
    marks: 4,
  },
];

const SUBJECT_COLORS = {
  Physics:     { bg: "rgba(79,123,255,0.15)",  border: "rgba(79,123,255,0.4)",  text: "#93b4ff" },
  Mathematics: { bg: "rgba(124,92,252,0.15)",  border: "rgba(124,92,252,0.4)", text: "#c4b5fd" },
  Aptitude:    { bg: "rgba(16,185,129,0.15)",  border: "rgba(16,185,129,0.4)", text: "#6ee7b7" },
};

/* ─── HELPERS ────────────────────────────────────────────────────── */
function fmtTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

/* ─── WEBCAM SIMULATION TILE ─────────────────────────────────────── */
function WebcamTile({ active }) {
  const [blink, setBlink] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setBlink((b) => !b), 900);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="relative rounded-xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0a0e1f 0%, #050610 100%)",
        border: active ? "1.5px solid rgba(79,123,255,0.4)" : "1.5px solid rgba(255,255,255,0.07)",
        aspectRatio: "4/3",
      }}
    >
      {/* Scanline overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.07]"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 3px)" }} />

      {/* Avatar simulation */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <div className="w-10 h-10 rounded-full bg-indigo-600/40 flex items-center justify-center text-base font-black text-white border border-indigo-500/40">
          DC
        </div>
        <p className="text-[9px] font-mono text-slate-500">Demo Candidate</p>
      </div>

      {/* REC badge */}
      <div className="absolute top-2 left-2 flex items-center gap-1">
        <span
          className="w-1.5 h-1.5 rounded-full bg-rose-500"
          style={{ boxShadow: blink ? "0 0 6px 2px rgba(239,68,68,0.8)" : "none" }}
        />
        <span className="text-[8px] font-bold text-rose-400 tracking-wide">REC</span>
      </div>

      {/* AI label */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center">
        <span className="px-2 py-0.5 rounded-full text-[8px] font-bold"
          style={{ background: "rgba(79,123,255,0.25)", color: "#93b4ff", border: "1px solid rgba(79,123,255,0.3)" }}>
          AI MONITORING
        </span>
      </div>
    </div>
  );
}

/* ─── RESULTS SCREEN ─────────────────────────────────────────────── */
function ResultsScreen({ answers, timeUsed, navigate }) {
  const attempted = answers.filter((a) => a !== null).length;
  const correct   = answers.filter((a, i) => a === QUESTIONS[i].correct).length;
  const wrong     = attempted - correct;
  const score     = correct * 4 + wrong * DEMO_EXAM.negativeMarking;
  const pct       = Math.max(0, (score / DEMO_EXAM.totalMarks) * 100).toFixed(1);

  const bySubject = ["Physics", "Mathematics", "Aptitude"].map((sub) => {
    const qs = QUESTIONS.map((q, i) => ({ ...q, idx: i })).filter((q) => q.subject === sub);
    const c  = qs.filter((q) => answers[q.idx] === q.correct).length;
    const t  = qs.length;
    return { sub, c, t, pct: Math.round((c / t) * 100) };
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen flex flex-col items-center justify-center px-4 py-16"
      style={{ background: "#05060F", color: "#f0f4ff" }}
    >
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(79,123,255,0.15) 0%, transparent 70%)", filter: "blur(80px)" }} />
      </div>

      <div className="w-full max-w-3xl space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-3"
            style={{ background: "linear-gradient(135deg, #4F7BFF, #7C5CFC)", boxShadow: "0 0 40px rgba(79,123,255,0.4)" }}>
            <Award size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-black" style={{ color: "#f0f4ff" }}>Demo Exam Completed!</h1>
          <p className="text-slate-400 text-sm">
            This is how Skillbrix presents your results — instant, detailed, and subject-wise.
          </p>
        </motion.div>

        {/* Score card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl p-6 text-center"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(79,123,255,0.2)", boxShadow: "0 0 40px rgba(79,123,255,0.06)" }}
        >
          <p className="text-sm text-slate-500 font-medium mb-1">Total Score</p>
          <p className="text-6xl font-black mb-1"
            style={{ background: "linear-gradient(135deg, #4F7BFF, #06B6D4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            {score.toFixed(0)}<span className="text-2xl">/{DEMO_EXAM.totalMarks}</span>
          </p>
          <p className="text-slate-400 text-sm">{pct}% accuracy · {fmtTime(timeUsed)} used</p>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/[0.06]">
            {[
              { label: "Attempted", val: attempted, color: "#4F7BFF" },
              { label: "Correct",   val: correct,   color: "#10b981" },
              { label: "Wrong",     val: wrong,      color: "#ef4444" },
            ].map(({ label, val, color }) => (
              <div key={label}>
                <p className="text-2xl font-black" style={{ color }}>{val}</p>
                <p className="text-xs text-slate-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Subject-wise breakdown */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl p-6 space-y-4"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <h3 className="text-sm font-bold text-slate-300 mb-4">Subject-Wise Breakdown</h3>
          {bySubject.map(({ sub, c, t, pct: p }) => {
            const col = SUBJECT_COLORS[sub];
            return (
              <div key={sub}>
                <div className="flex justify-between text-xs font-semibold mb-1.5" style={{ color: col.text }}>
                  <span>{sub}</span>
                  <span>{c}/{t} correct — {p}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${p}%` }} transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${col.border}, ${col.text})` }}
                  />
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Proctoring summary */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl p-5 flex items-center gap-4"
          style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)" }}>
          <div className="p-2.5 rounded-xl shrink-0" style={{ background: "rgba(16,185,129,0.15)" }}>
            <Shield size={20} style={{ color: "#10b981" }} />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: "#6ee7b7" }}>Proctoring Passed ✓</p>
            <p className="text-xs text-slate-500 mt-0.5">
              AI monitoring active throughout · 0 tab switches detected · Webcam feed stable · Report auto-generated
            </p>
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => navigate("/")}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#cbd5e1" }}
          >
            <Home size={16} />
            Back to Home
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(110deg, #4F7BFF 0%, #7C5CFC 50%, #06B6D4 100%)",
              backgroundSize: "200% auto",
              color: "#fff",
              boxShadow: "0 4px 20px rgba(79,123,255,0.3)",
            }}
          >
            <RefreshCw size={16} />
            Retake Demo
          </button>
          <button
            onClick={() => navigate("/login")}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5"
            style={{ background: "rgba(79,123,255,0.15)", border: "1px solid rgba(79,123,255,0.35)", color: "#93b4ff" }}
          >
            <Award size={16} />
            Get Full Access →
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ─── MAIN DEMO EXAM COMPONENT ───────────────────────────────────── */
export default function DemoExam() {
  const navigate = useNavigate();

  /* ── State ── */
  const [phase, setPhase]         = useState("instructions"); // instructions | exam | results
  const [currentQ, setCurrentQ]   = useState(0);
  const [answers, setAnswers]      = useState(Array(QUESTIONS.length).fill(null));
  const [bookmarked, setBookmarked]= useState(new Set());
  const [timeLeft, setTimeLeft]    = useState(DEMO_EXAM.duration);
  const [timeUsed, setTimeUsed]    = useState(0);
  const [tabWarning, setTabWarning]= useState(false);
  const [tabCount, setTabCount]    = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showGrid, setShowGrid]    = useState(false);
  const [submitted, setSubmitted]  = useState(false);

  const timerRef = useRef(null);

  /* ── Timer ── */
  useEffect(() => {
    if (phase !== "exam" || submitted) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { handleSubmit(); return 0; }
        return t - 1;
      });
      setTimeUsed((u) => u + 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, submitted]);

  /* ── Tab-switch detection ── */
  useEffect(() => {
    if (phase !== "exam") return;
    const onVisibility = () => {
      if (document.hidden) {
        setTabCount((c) => c + 1);
        setTabWarning(true);
        setTimeout(() => setTabWarning(false), 4000);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [phase]);

  /* ── Fullscreen tracking ── */
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const requestFullscreen = () => {
    document.documentElement.requestFullscreen?.().catch(() => {});
  };

  /* ── Actions ── */
  const handleStart = () => {
    requestFullscreen();
    setPhase("exam");
  };

  const handleAnswer = (optIdx) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentQ] = optIdx;
      return next;
    });
  };

  const toggleBookmark = () =>
    setBookmarked((prev) => {
      const next = new Set(prev);
      next.has(currentQ) ? next.delete(currentQ) : next.add(currentQ);
      return next;
    });

  const handleSubmit = useCallback(() => {
    if (submitted) return;
    setSubmitted(true);
    clearInterval(timerRef.current);
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    setTimeout(() => setPhase("results"), 800);
  }, [submitted]);

  /* ── Status helpers ── */
  const getQStatus = (i) => {
    if (answers[i] !== null && bookmarked.has(i)) return "answered-bookmarked";
    if (answers[i] !== null) return "answered";
    if (bookmarked.has(i)) return "bookmarked";
    if (i === currentQ) return "current";
    if (i < currentQ) return "skipped";
    return "not-visited";
  };

  const statusStyle = (s) => {
    switch (s) {
      case "answered":             return { bg: "#10b981", border: "#10b981", text: "#fff" };
      case "answered-bookmarked":  return { bg: "#7C5CFC", border: "#7C5CFC", text: "#fff" };
      case "bookmarked":           return { bg: "transparent", border: "#f59e0b", text: "#f59e0b" };
      case "current":              return { bg: "#4F7BFF", border: "#4F7BFF", text: "#fff" };
      case "skipped":              return { bg: "rgba(239,68,68,0.15)", border: "#ef4444", text: "#f87171" };
      default:                     return { bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.12)", text: "#64748b" };
    }
  };

  const q    = QUESTIONS[currentQ];
  const subC = SUBJECT_COLORS[q?.subject] || SUBJECT_COLORS.Physics;
  const isRed = timeLeft < 120;

  /* ─────────────────────────────────────────────────────────────────
     RENDER: INSTRUCTIONS
  ───────────────────────────────────────────────────────────────── */
  if (phase === "instructions") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: "#05060F", color: "#f0f4ff" }}>
        <div className="fixed inset-0 pointer-events-none -z-10">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[500px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(79,123,255,0.13) 0%, transparent 70%)", filter: "blur(80px)" }} />
        </div>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="w-full max-w-2xl space-y-6">

          {/* Logo */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #4F7BFF, #7C5CFC)", boxShadow: "0 4px 20px rgba(79,123,255,0.4)" }}>
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <span className="text-xl font-black" style={{ color: "#f0f4ff" }}>
                Skill<span style={{ background: "linear-gradient(135deg, #4F7BFF, #06B6D4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>brix</span>
              </span>
              <p className="text-[9px] text-slate-600 tracking-widest uppercase">Demo Exam Environment</p>
            </div>
          </div>

          <div className="rounded-2xl p-6 space-y-5"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(79,123,255,0.2)" }}>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: "#4F7BFF" }}>Demo Examination</span>
              <h1 className="text-2xl font-black mt-1" style={{ color: "#f0f4ff" }}>{DEMO_EXAM.title}</h1>
              <p className="text-sm text-slate-400 mt-1">{DEMO_EXAM.subject}</p>
            </div>

            {/* Exam info grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                ["⏱ Duration",  "15 Minutes"],
                ["📝 Questions", "10"],
                ["🏆 Total Marks","40"],
                ["➖ Negative",  "−0.25 / wrong"],
              ].map(([l, v]) => (
                <div key={l} className="rounded-xl p-3 text-center"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <p className="text-[10px] text-slate-500">{l}</p>
                  <p className="text-sm font-bold mt-0.5" style={{ color: "#f0f4ff" }}>{v}</p>
                </div>
              ))}
            </div>

            {/* Instructions */}
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Exam Instructions</p>
              <ul className="space-y-1.5">
                {[
                  "The exam will enter fullscreen mode once you click Start — do not exit.",
                  "Switching tabs or windows will be logged as a violation.",
                  "Your webcam is simulated in this demo (no real camera access needed).",
                  "Each correct answer = +4 marks. Each wrong answer = −0.25 marks.",
                  "You can bookmark questions and revisit them before submitting.",
                  "Timer auto-submits when 15 minutes expire.",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2 text-xs text-slate-400">
                    <CheckCircle size={12} style={{ color: "#10b981", flexShrink: 0, marginTop: 1 }} />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            {/* Proctoring notice */}
            <div className="flex items-start gap-3 p-3 rounded-xl"
              style={{ background: "rgba(79,123,255,0.08)", border: "1px solid rgba(79,123,255,0.2)" }}>
              <Eye size={16} style={{ color: "#4F7BFF", flexShrink: 0, marginTop: 1 }} />
              <p className="text-xs text-slate-400">
                <strong style={{ color: "#93b4ff" }}>AI Proctoring Active</strong> — This demo simulates real exam proctoring. Tab switches, fullscreen exits, and inactivity are all tracked just like in a live Skillbrix exam.
              </p>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex gap-3">
            <button onClick={() => navigate("/")}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "#94a3b8" }}>
              <ChevronLeft size={15} /> Back
            </button>
            <button onClick={handleStart}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(110deg, #4F7BFF 0%, #7C5CFC 50%, #06B6D4 100%)",
                backgroundSize: "200% auto",
                boxShadow: "0 4px 24px rgba(79,123,255,0.4)",
              }}>
              <Flag size={15} />
              Start Demo Exam
              <ChevronRight size={15} />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────────
     RENDER: RESULTS
  ───────────────────────────────────────────────────────────────── */
  if (phase === "results") {
    return <ResultsScreen answers={answers} timeUsed={timeUsed} navigate={navigate} />;
  }

  /* ─────────────────────────────────────────────────────────────────
     RENDER: EXAM TERMINAL
  ───────────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#05060F", color: "#f0f4ff", fontFamily: "sans-serif" }}>

      {/* ── Tab-switch warning overlay ── */}
      <AnimatePresence>
        {tabWarning && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center"
            style={{ background: "rgba(239,68,68,0.18)", backdropFilter: "blur(4px)" }}
          >
            <motion.div
              initial={{ scale: 0.85, y: -20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85 }}
              className="rounded-2xl p-8 text-center max-w-sm mx-4"
              style={{ background: "#0d0f1e", border: "1.5px solid rgba(239,68,68,0.6)", boxShadow: "0 0 60px rgba(239,68,68,0.3)" }}
            >
              <AlertTriangle size={36} className="mx-auto mb-3" style={{ color: "#f87171" }} />
              <h2 className="text-lg font-black mb-2" style={{ color: "#fca5a5" }}>Tab Switch Detected!</h2>
              <p className="text-sm text-slate-400 mb-1">
                Leaving the exam window has been logged as a violation.
              </p>
              <p className="text-xs" style={{ color: "#f87171" }}>Total violations: {tabCount}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TOP BAR ── */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b shrink-0"
        style={{ background: "rgba(5,6,15,0.95)", borderColor: "rgba(255,255,255,0.07)", backdropFilter: "blur(16px)" }}>

        {/* Left: Logo + exam title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #4F7BFF, #7C5CFC)" }}>
            <Shield size={14} className="text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-black" style={{ color: "#f0f4ff" }}>{DEMO_EXAM.title}</p>
            <p className="text-[10px] text-slate-500">{DEMO_EXAM.candidateName} · {DEMO_EXAM.rollNo}</p>
          </div>
        </div>

        {/* Center: Timer */}
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl"
          style={{
            background: isRed ? "rgba(239,68,68,0.12)" : "rgba(255,255,255,0.05)",
            border: `1px solid ${isRed ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.1)"}`,
          }}>
          <Clock size={15} style={{ color: isRed ? "#f87171" : "#4F7BFF" }} className={isRed ? "animate-pulse" : ""} />
          <span className="text-base font-black font-mono" style={{ color: isRed ? "#f87171" : "#f0f4ff" }}>
            {fmtTime(timeLeft)}
          </span>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2">
          {!isFullscreen && (
            <button onClick={requestFullscreen}
              className="p-2 rounded-lg text-slate-400 hover:text-white transition-colors"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <Maximize2 size={14} />
            </button>
          )}
          <button
            onClick={handleSubmit}
            className="px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:-translate-y-0.5"
            style={{ background: "rgba(239,68,68,0.8)", border: "1px solid rgba(239,68,68,0.5)" }}>
            Submit
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex flex-1 min-h-0">

        {/* ── LEFT: Question Area ── */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Question header bar */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 border-b"
            style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.01)" }}>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase"
                style={{ background: subC.bg, border: `1px solid ${subC.border}`, color: subC.text }}>
                {q.subject}
              </span>
              <span className="text-xs text-slate-500">Q{currentQ + 1} of {QUESTIONS.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">{q.marks} marks</span>
              <button onClick={toggleBookmark} className="p-1.5 rounded-lg transition-colors"
                style={{ color: bookmarked.has(currentQ) ? "#f59e0b" : "#4b5563", background: bookmarked.has(currentQ) ? "rgba(245,158,11,0.1)" : "transparent" }}>
                <Bookmark size={15} fill={bookmarked.has(currentQ) ? "#f59e0b" : "none"} />
              </button>
            </div>
          </div>

          {/* Question + Options */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
            <AnimatePresence mode="wait">
              <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }} className="space-y-6">

                {/* Question text */}
                <div className="text-base font-semibold leading-relaxed" style={{ color: "#f0f4ff" }}>
                  <span className="text-slate-500 mr-2">Q{currentQ + 1}.</span>
                  {q.text}
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {q.options.map((opt, oi) => {
                    const selected = answers[currentQ] === oi;
                    return (
                      <button key={oi} onClick={() => handleAnswer(oi)}
                        className="w-full text-left flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-150 hover:-translate-y-0.5"
                        style={{
                          background: selected ? "rgba(79,123,255,0.15)" : "rgba(255,255,255,0.03)",
                          border: `1.5px solid ${selected ? "rgba(79,123,255,0.5)" : "rgba(255,255,255,0.08)"}`,
                          boxShadow: selected ? "0 0 20px rgba(79,123,255,0.1)" : "none",
                        }}>
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                          style={{
                            background: selected ? "#4F7BFF" : "rgba(255,255,255,0.06)",
                            color: selected ? "#fff" : "#64748b",
                            border: `1px solid ${selected ? "#4F7BFF" : "rgba(255,255,255,0.1)"}`,
                          }}>
                          {String.fromCharCode(65 + oi)}
                        </div>
                        <span className="text-sm font-medium" style={{ color: selected ? "#f0f4ff" : "#94a3b8" }}>
                          {opt}
                        </span>
                        {selected && <CheckCircle size={15} style={{ color: "#4F7BFF", marginLeft: "auto" }} />}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation footer */}
          <div className="px-4 sm:px-6 py-3 border-t flex items-center justify-between"
            style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(5,6,15,0.8)" }}>
            <button onClick={() => setCurrentQ((c) => Math.max(0, c - 1))} disabled={currentQ === 0}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-30"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "#94a3b8" }}>
              <ArrowLeft size={13} /> Previous
            </button>

            <button onClick={() => setShowGrid((v) => !v)}
              className="px-3 py-2 rounded-lg text-xs font-bold transition-all"
              style={{ background: "rgba(79,123,255,0.1)", border: "1px solid rgba(79,123,255,0.3)", color: "#93b4ff" }}>
              {showGrid ? "Hide" : "Question"} Grid
            </button>

            <button onClick={() => setCurrentQ((c) => Math.min(QUESTIONS.length - 1, c + 1))}
              disabled={currentQ === QUESTIONS.length - 1}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-30"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "#94a3b8" }}>
              Next <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <div className="hidden lg:flex flex-col w-[260px] shrink-0 border-l overflow-y-auto"
          style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.015)" }}>

          {/* Webcam preview */}
          <div className="p-3 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-2">Webcam Monitor</p>
            <WebcamTile active />
            <div className="mt-2 flex items-center gap-1.5 text-[9px] font-semibold" style={{ color: "#10b981" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 6px rgba(16,185,129,0.8)" }} />
              Face detected · AI monitoring active
            </div>
          </div>

          {/* Question grid */}
          <div className="p-3 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-3">Question Palette</p>
            <div className="grid grid-cols-5 gap-1.5">
              {QUESTIONS.map((_, i) => {
                const s = getQStatus(i);
                const st = statusStyle(s);
                return (
                  <button key={i} onClick={() => setCurrentQ(i)}
                    className="w-full aspect-square rounded-lg text-[11px] font-black transition-all hover:scale-105"
                    style={{ background: st.bg, border: `1.5px solid ${st.border}`, color: st.text }}>
                    {i + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 space-y-1.5">
              {[
                { col: "#10b981", label: "Answered" },
                { col: "#7C5CFC", label: "Answered + Bookmarked" },
                { col: "#f59e0b", label: "Bookmarked" },
                { col: "#ef4444", label: "Skipped" },
                { col: "#4b5563", label: "Not Visited" },
              ].map(({ col, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: col }} />
                  <span className="text-[9px] text-slate-500">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats mini-panel */}
          <div className="p-3 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Answered", val: answers.filter((a) => a !== null).length, color: "#10b981" },
                { label: "Skipped",  val: answers.filter((a, i) => a === null && i < currentQ).length, color: "#ef4444" },
                { label: "Bookmarked", val: bookmarked.size, color: "#f59e0b" },
                { label: "Remaining", val: QUESTIONS.length - answers.filter((a) => a !== null).length, color: "#4F7BFF" },
              ].map(({ label, val, color }) => (
                <div key={label} className="rounded-lg p-2 text-center"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <p className="text-base font-black" style={{ color }}>{val}</p>
                  <p className="text-[9px] text-slate-600 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile: Question Grid Sheet ── */}
      <AnimatePresence>
        {showGrid && (
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="lg:hidden fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl p-4"
            style={{ background: "#0d1024", border: "1px solid rgba(79,123,255,0.25)", maxHeight: "60vh", overflowY: "auto" }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-slate-300">Question Palette</p>
              <button onClick={() => setShowGrid(false)} className="text-slate-500 hover:text-white text-xs">Close ✕</button>
            </div>
            <div className="grid grid-cols-8 gap-1.5 mb-4">
              {QUESTIONS.map((_, i) => {
                const s = getQStatus(i);
                const st = statusStyle(s);
                return (
                  <button key={i} onClick={() => { setCurrentQ(i); setShowGrid(false); }}
                    className="aspect-square rounded-lg text-[11px] font-black"
                    style={{ background: st.bg, border: `1.5px solid ${st.border}`, color: st.text }}>
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
