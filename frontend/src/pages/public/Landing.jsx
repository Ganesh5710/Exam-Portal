import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Shield, 
  ArrowRight, 
  CheckCircle2, 
  Cpu, 
  Activity, 
  Building2, 
  Scale, 
  Users, 
  Star,
  ChevronDown,
  Monitor,
  Lock,
  Zap,
  BarChart4,
  Check,
  FileText,
  AlertTriangle,
  Play,
  Award,
  CheckCircle,
  X,
  Clock
} from "lucide-react";

export const Landing = () => {
  const [activeFaq, setActiveFaq] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  
  // Interactive Simulator States
  const [simStep, setSimStep] = useState("start");
  const [uploadedCount, setUploadedCount] = useState(0);
  const [activeStudentStatus, setActiveStudentStatus] = useState("Idle");
  const [studentScore, setStudentScore] = useState(100);
  const [proctorLogs, setProctorLogs] = useState([]);

  // Mock Active Clock for Timed Sessions Card Detail
  const [mockTime, setMockTime] = useState("01:29:59");

  useEffect(() => {
    const timer = setInterval(() => {
      const parts = mockTime.split(":");
      let h = parseInt(parts[0]);
      let m = parseInt(parts[1]);
      let s = parseInt(parts[2]);
      s--;
      if (s < 0) { s = 59; m--; }
      if (m < 0) { m = 59; h--; }
      const format = (n) => String(n).padStart(2, "0");
      setMockTime(`${format(h)}:${format(m)}:${format(s)}`);
    }, 1000);
    return () => clearInterval(timer);
  }, [mockTime]);

  // Simulate file upload progress
  useEffect(() => {
    if (simStep === "uploading") {
      let current = 0;
      const interval = setInterval(() => {
        current += 250;
        setUploadedCount(current);
        if (current >= 2000) {
          clearInterval(interval);
          setSimStep("ready");
        }
      }, 300);
      return () => clearInterval(interval);
    }
  }, [simStep]);

  // Simulate live proctor exam states
  useEffect(() => {
    if (simStep === "running") {
      setActiveStudentStatus("Active (100% Focus)");
      setProctorLogs(["[09:00:00] Exam Session Started.", "[09:00:15] Student terminal initialized."]);
      
      const timer1 = setTimeout(() => {
        setActiveStudentStatus("Tab Switch Detected!");
        setStudentScore(75);
        setProctorLogs(prev => ["[09:01:05] WARNING: Student exited full-screen terminal.", ...prev]);
        setSimStep("cheated");
      }, 4000);

      return () => clearTimeout(timer1);
    }
  }, [simStep]);

  const startSimulation = () => {
    setSimStep("uploading");
    setUploadedCount(0);
  };

  const resetSimulation = () => {
    setSimStep("start");
    setUploadedCount(0);
    setActiveStudentStatus("Idle");
    setStudentScore(100);
    setProctorLogs([]);
  };

  const featureCards = [
    {
      id: "proctor",
      title: "AI Proctoring Signals",
      description: "Get automatic integrity flags with confidence scoring for every student test session. Know if they attempt to change tabs or lose focus.",
      icon: Shield,
      color: "from-violet-500 to-fuchsia-500",
      glowColor: "rgba(139, 92, 246, 0.4)",
      badge: "Webcam-Ready",
      detail: {
        title: "Deep Gaze Proctoring Engine",
        subtitle: "Real-time webcam gaze tracking & browser window validation.",
        visual: (
          <div className="w-full bg-slate-950/80 rounded-xl p-5 border border-white/5 relative overflow-hidden flex flex-col items-center">
            <div className="w-32 h-32 rounded-full border border-violet-500/30 bg-violet-600/10 flex items-center justify-center relative overflow-hidden mb-4">
              <span className="w-24 h-24 rounded-full border border-dashed border-violet-500/50 animate-spin" style={{ animationDuration: '8s' }} />
              <Activity className="absolute text-violet-400 animate-pulse" size={32} />
            </div>
            <div className="text-center">
              <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest block mb-1">Gaze Status</span>
              <span className="text-xs font-semibold text-white">Active scanning — Gaze Locked on Screen</span>
            </div>
          </div>
        )
      }
    },
    {
      id: "leaderboard",
      title: "Instant Leaderboards",
      description: "Publish rank updates and performance indicators the moment submissions are completed. No delay, no manual spreadsheet tallying.",
      icon: BarChart4,
      color: "from-cyan-400 to-violet-500",
      glowColor: "rgba(6, 182, 212, 0.4)",
      badge: "Auto-Compiled",
      detail: {
        title: "Automated Merging Leaderboards",
        subtitle: "Live rank consolidation on student exam submission.",
        visual: (
          <div className="w-full bg-slate-950/80 rounded-xl p-4 border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold border-b border-white/5 pb-2 uppercase tracking-wider">
              <span>Rank</span>
              <span>Candidate</span>
              <span>Final score</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-cyan-400">1</span>
              <span className="text-white">Ajay Krishna</span>
              <span className="font-semibold text-emerald-400">98%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-400">2</span>
              <span className="text-white">Nikhil Gupta</span>
              <span className="font-semibold text-emerald-400">94%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-500">3</span>
              <span className="text-white">Bharath Krishna</span>
              <span className="font-semibold text-emerald-400">89%</span>
            </div>
          </div>
        )
      }
    },
    {
      id: "timed",
      title: "Secure Timed Sessions",
      description: "Lock down browser focus and set hard thresholds. Exams automatically submit the exact millisecond the session countdown hits zero.",
      icon: Lock,
      color: "from-fuchsia-500 to-violet-600",
      glowColor: "rgba(217, 70, 239, 0.4)",
      badge: "Auto-Submit",
      detail: {
        title: "Millisecond Precise Timing Lock",
        subtitle: "Fail-safe countdown submission engine.",
        visual: (
          <div className="w-full bg-slate-950/80 rounded-xl p-5 border border-white/5 text-center flex flex-col items-center justify-center">
            <Clock className="text-fuchsia-400 mb-3 animate-pulse" size={32} />
            <div className="text-3xl font-black text-white tracking-widest font-mono">{mockTime}</div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest block mt-2">Remaining Exam Time</span>
          </div>
        )
      }
    },
    {
      id: "batch",
      title: "Batch Optimized AI MCQ Parser",
      description: "Instead of processing records one-by-one which causes gateway timeouts, Skillbrix utilizes chunked parallel inserts to safely commit up to 2,000 questions in 500-question batch intervals.",
      icon: Cpu,
      color: "from-violet-500 to-cyan-400",
      glowColor: "rgba(124, 92, 252, 0.4)",
      badge: "Chunked DB Inserts",
      detail: {
        title: "Chunked Transaction Processing",
        subtitle: "Eliminates server timeout risks on large question bank imports.",
        visual: (
          <div className="w-full bg-slate-950/80 rounded-xl p-4 border border-white/5 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Batch 1 (500 records)</span>
              <span className="text-emerald-400 font-bold">Success</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Batch 2 (500 records)</span>
              <span className="text-emerald-400 font-bold">Success</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Batch 3 (500 records)</span>
              <span className="text-emerald-400 font-bold">Success</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Batch 4 (500 records)</span>
              <span className="text-emerald-400 font-bold">Success</span>
            </div>
          </div>
        )
      }
    },
    {
      id: "students",
      title: "Clean Student Controls",
      description: "Show students on a clean single page without annoying previous/next pagination buttons. Block/unblock credentials instantly.",
      icon: Users,
      color: "from-emerald-400 to-violet-500",
      glowColor: "rgba(52, 211, 153, 0.4)",
      badge: "Clean Layout",
      detail: {
        title: "All-in-One Student Controller",
        subtitle: "Manage entire student cohorts on a single fluid layout.",
        visual: (
          <div className="w-full bg-slate-950/80 rounded-xl p-4 border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white block">Ajay Krishna</span>
              <span className="text-[10px] text-slate-500 block">student1503@example.com</span>
            </div>
            <button className="px-3 py-1 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 text-red-400 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-colors">
              Block student
            </button>
          </div>
        )
      }
    }
  ];

  const faqs = [
    {
      q: "Can I import 2,000+ questions at once?",
      a: "Yes! Skillbrix supports bulk imports of up to 5,000 questions in Excel, CSV, JSON, or TXT format. Our parser is optimized to process large question banks in quick parallel batches."
    },
    {
      q: "How does the real-time student monitoring work?",
      a: "The admin panel connects to active student terminals via real-time WebSockets, showing instantly if a student is actively taking the test, has finished, or exited the tab."
    },
    {
      q: "Is negative marking supported?",
      a: "Absolutely. You can set positive weights and negative mark margins (e.g., -0.25 or -1.0) globally or on a per-question level to mirror competitive exam structures."
    },
    {
      q: "Are departments auto-detected during uploads?",
      a: "Yes. When importing student records or question lists, the platform scans target columns to automatically identify existing departments or create new ones on the fly."
    }
  ];

  return (
    <div className="min-h-screen bg-[#02000A] text-slate-100 selection:bg-violet-600/30 selection:text-violet-200 overflow-x-hidden relative font-sans">
      
      {/* Custom styles for WOW floating components, zoom overlays, and neon glow effects */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(1.5deg); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(-2deg); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(1deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.25; transform: scale(1); filter: blur(100px); }
          50% { opacity: 0.45; transform: scale(1.1); filter: blur(120px); }
        }
        
        .animate-float-1 { animation: float-slow 8s ease-in-out infinite; }
        .animate-float-2 { animation: float-medium 7s ease-in-out infinite 1.5s; }
        .animate-float-3 { animation: float-fast 6s ease-in-out infinite 0.7s; }
        
        .glow-radial-1 {
          position: absolute;
          background: radial-gradient(circle, rgba(124, 92, 252, 0.3) 0%, transparent 70%);
          animation: pulse-glow 9s ease-in-out infinite;
        }
        .glow-radial-2 {
          position: absolute;
          background: radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, transparent 70%);
          animation: pulse-glow 7s ease-in-out infinite 2.5s;
        }

        .neon-border-glow {
          position: relative;
          border-radius: 24px;
          background: linear-gradient(185deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);
        }
        .neon-border-glow::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: 24px;
          padding: 1px;
          background: linear-gradient(135deg, rgba(124, 92, 252, 0.4) 0%, rgba(256, 256, 256, 0.03) 40%, rgba(236, 72, 153, 0.25) 100%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }

        .glass-card-wow {
          background: rgba(10, 8, 20, 0.7);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255,255,255,0.05);
        }

        .shimmer-btn {
          position: relative;
          overflow: hidden;
        }
        .shimmer-btn::after {
          content: '';
          position: absolute;
          top: -50%; left: -60%;
          width: 30%; height: 200%;
          background: rgba(255, 255, 255, 0.15);
          transform: rotate(35deg);
          transition: all 0.6s ease;
          opacity: 0;
        }
        .shimmer-btn:hover::after {
          left: 130%;
          opacity: 1;
        }
      `}</style>

      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#2a1f4d_1px,transparent_1px),linear-gradient(to_bottom,#2a1f4d_1px,transparent_1px)] bg-[size:5rem_5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.22] pointer-events-none" />
      
      {/* Background Glows */}
      <div className="glow-radial-1 w-[800px] h-[500px] -top-40 left-[50%] -translate-x-[50%] -z-10" />

      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 h-20 border-b border-white/[0.04] bg-[#02000A]/70 backdrop-blur-xl z-50 flex items-center justify-between px-6 md:px-12">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-gradient-to-br from-violet-500 via-violet-600 to-fuchsia-500 rounded-xl flex items-center justify-center font-black text-white text-base shadow-lg shadow-violet-500/25 group-hover:scale-105 transition-transform">
            SB
          </div>
          <span className="text-xl font-black tracking-tight text-white">
            Skill<span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">brix</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="#interactive-arena" className="hover:text-white transition-colors">Interactive Arena</a>
          <a href="#features" className="hover:text-white transition-colors">Platform Features</a>
          <a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a>
          <a href="#faqs" className="hover:text-white transition-colors">FAQs</a>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/login" className="px-4.5 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors">
            Login
          </Link>
          <Link to="/login" className="px-5 py-2.5 text-sm font-bold bg-gradient-to-r from-violet-600 via-violet-500 to-fuchsia-600 text-white rounded-xl shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shimmer-btn">
            Launch Portal →
          </Link>
        </div>
      </nav>

      {/* Hero Header Area */}
      <header className="pt-44 pb-28 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/5 text-[11px] font-bold text-violet-300 uppercase tracking-widest mb-8 animate-fade-in shadow-inner">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-ping" />
          The Advanced Assessment Architecture
        </div>

        <h1 className="text-5xl md:text-8.5xl font-black tracking-tight leading-[1.02] text-white max-w-6xl mb-8">
          The <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent font-extrabold">Futuristic Standard</span><br className="hidden md:block" /> for Online Examinations
        </h1>

        <p className="text-base md:text-xl text-slate-400 max-w-3xl mb-12 leading-relaxed font-normal">
          Designed for maximum scale, flawless integrity, and extreme speed. Bulk import 2,000+ questions in seconds, track student activity in real-time, and auto-grade responses with custom scoring frameworks.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-24 relative z-20">
          <a href="#interactive-arena" className="px-8 py-4.5 bg-gradient-to-r from-violet-600 via-violet-500 to-fuchsia-600 text-white font-bold rounded-xl shadow-2xl shadow-violet-600/35 hover:shadow-violet-600/50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 shimmer-btn">
            Play Live Simulator <Play size={16} fill="currentColor" />
          </a>
          <Link to="/login" className="px-8 py-4.5 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-violet-500/30 text-slate-300 hover:text-white font-bold rounded-xl transition-all duration-200">
            ✦ Launch Application
          </Link>
        </div>

        {/* ── INTERACTIVE PLAYGROUND ARENA ── */}
        <div id="interactive-arena" className="w-full max-w-5xl relative mb-28">
          {/* Main Simulator Panel */}
          <div className="neon-border-glow p-1">
            <div className="w-full rounded-[22px] bg-slate-950/60 p-1.5 backdrop-blur-3xl shadow-2xl">
              {/* Simulator Header */}
              <div className="flex items-center justify-between px-5 py-4 bg-slate-900/30 rounded-t-[18px] border-b border-white/[0.04]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#ef4444]" />
                  <span className="w-3 h-3 rounded-full bg-[#eab308]" />
                  <span className="w-3 h-3 rounded-full bg-[#22c55e]" />
                </div>
                <div className="text-[11px] text-slate-500 font-mono tracking-wider">skillbrix.solutions/interactive-arena</div>
                <div className="flex items-center gap-2 bg-violet-600/10 border border-violet-500/20 rounded-full px-2.5 py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                  <span className="text-[9px] text-violet-400 font-bold uppercase tracking-wider">Playable Simulator</span>
                </div>
              </div>

              {/* Simulator Body */}
              <div className="bg-[#050212]/95 rounded-b-[18px] p-6 md:p-8 text-left grid grid-cols-1 md:grid-cols-4 gap-8 min-h-[400px]">
                
                {/* Control Sidebar */}
                <div className="flex flex-col gap-2 md:border-r border-white/[0.04] md:pr-6">
                  <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Simulate Actions</div>
                  
                  <button 
                    onClick={startSimulation}
                    disabled={simStep !== "start"}
                    className={`px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-left border transition-all ${
                      simStep === "start" 
                        ? "bg-violet-600/20 text-violet-400 border-violet-500/30 hover:bg-violet-600/30" 
                        : "text-slate-600 border-transparent bg-transparent cursor-not-allowed"
                    }`}
                  >
                    1. Import 2000 Questions
                  </button>

                  <button 
                    onClick={() => setSimStep("running")}
                    disabled={simStep !== "ready"}
                    className={`px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-left border transition-all ${
                      simStep === "ready" 
                        ? "bg-violet-600/20 text-violet-400 border-violet-500/30 hover:bg-violet-600/30" 
                        : "text-slate-600 border-transparent bg-transparent cursor-not-allowed"
                    }`}
                  >
                    2. Launch Exam
                  </button>

                  <button 
                    onClick={() => {
                      setSimStep("completed");
                      setActiveStudentStatus("Submitted Successfully");
                    }}
                    disabled={simStep !== "cheated"}
                    className={`px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-left border transition-all ${
                      simStep === "cheated" 
                        ? "bg-violet-600/20 text-violet-400 border-violet-500/30 hover:bg-violet-600/30" 
                        : "text-slate-600 border-transparent bg-transparent cursor-not-allowed"
                    }`}
                  >
                    3. Auto-Submit & Score
                  </button>

                  <button 
                    onClick={resetSimulation}
                    className="mt-auto px-4 py-2.5 rounded-lg border border-white/5 hover:border-red-500/30 text-slate-400 hover:text-red-400 font-bold text-[10px] uppercase tracking-wider text-center transition-all"
                  >
                    Reset Sandbox
                  </button>
                </div>

                {/* Simulator Workspace Screen */}
                <div className="md:col-span-3 flex flex-col justify-between">
                  {simStep === "start" && (
                    <div className="space-y-4 my-auto text-center py-8">
                      <Zap className="mx-auto text-violet-400 animate-bounce mb-3" size={32} />
                      <h4 className="text-base font-bold text-white uppercase tracking-wider">Assessment Sandbox Arena</h4>
                      <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                        Click the buttons on the left sidebar to trace the exact database and AI monitoring steps for a batch of 2,000 students and questions.
                      </p>
                    </div>
                  )}

                  {simStep === "uploading" && (
                    <div className="space-y-6 my-auto py-8">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Parsing questions document...</span>
                        <span className="text-xs text-violet-400 font-bold">{Math.round((uploadedCount / 2000) * 100)}%</span>
                      </div>
                      <div className="h-2 bg-slate-900 border border-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-300" style={{ width: `${(uploadedCount / 2000) * 100}%` }} />
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono">Running bulk database transactions: Added {uploadedCount} records...</p>
                    </div>
                  )}

                  {simStep === "ready" && (
                    <div className="space-y-4 my-auto py-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2">
                        <CheckCircle size={24} />
                      </div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">Database Batch Write Completed</h4>
                      <p className="text-xs text-slate-400 leading-relaxed max-w-lg">
                        Import success! Added **2,000 questions** in **4 database chunks** (500 records each). Safe from server timeouts.
                      </p>
                    </div>
                  )}

                  {simStep === "running" && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center bg-violet-600/10 border border-violet-500/20 p-4 rounded-xl">
                        <div className="flex items-center gap-3">
                          <Activity className="text-violet-400 animate-pulse" size={18} />
                          <div>
                            <span className="text-xs font-bold text-white uppercase tracking-wider block">Live Proctoring Watchdog</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">Tracking candidate tab switches...</span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-emerald-400 uppercase">Secure State</span>
                      </div>
                      <p className="text-[11px] text-slate-500 italic">Wait a few seconds for the candidate simulation to switch windows...</p>
                    </div>
                  )}

                  {simStep === "cheated" && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="text-red-400 animate-bounce" size={18} />
                          <div>
                            <span className="text-xs font-bold text-white uppercase tracking-wider block">Flagged: Integrity Breach</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">Focus lost. Confidence score dropped.</span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-red-400 uppercase">Focus Lost</span>
                      </div>
                      <p className="text-[11px] text-slate-500 italic">Proceed to Step 3 to auto-submit and finalize the candidate's grading logs.</p>
                    </div>
                  )}

                  {simStep === "completed" && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
                        <div className="flex items-center gap-3">
                          <Award className="text-emerald-400" size={18} />
                          <div>
                            <span className="text-xs font-bold text-white uppercase tracking-wider block">Auto-Graded Submission</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">Audit log saved. Scorecard generated.</span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-emerald-400 uppercase">Complete</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Exam finalized. Results and proctoring departure records successfully logged to the database.
                      </p>
                    </div>
                  )}

                  {/* Simulator Logs Box */}
                  {proctorLogs.length > 0 && (
                    <div className="bg-slate-950 border border-white/5 rounded-xl p-4 mt-4 font-mono text-[10px] text-slate-500 max-h-24 overflow-y-auto space-y-1">
                      {proctorLogs.map((log, i) => (
                        <div key={i}>{log}</div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Advanced Features Bento Grid (WITH FOCUS/ZOOM MODE AND DYNAMIC NEON GLOW BACKDROP) */}
      <section id="features" className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative z-20">
        <div className="text-center max-w-xl mx-auto mb-20">
          <div className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-3">Enterprise Suite</div>
          <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
            Designed for scale, reliability, and security
          </h2>
          <p className="text-xs text-slate-400 mt-2">Click on any card to zoom in and check its visual interface.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featureCards.map((card, idx) => {
            const Icon = card.icon;
            const isWide = card.id === "batch";
            return (
              <div 
                key={card.id}
                onClick={() => setSelectedCard(card)}
                className={`p-8 bg-[#0b0818]/60 border border-white/[0.04] rounded-3xl relative overflow-hidden group cursor-pointer transition-all duration-300 hover:border-violet-500/40 hover:-translate-y-1 hover:shadow-2xl hover:shadow-violet-600/5 ${isWide ? "md:col-span-2" : ""}`}
              >
                {/* Micro glow corner */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-tr from-transparent to-violet-500/10 rounded-full blur-xl pointer-events-none group-hover:scale-110 transition-transform" />
                
                <Icon className="text-violet-400 mb-6 group-hover:scale-105 transition-transform" size={32} />
                <h3 className="text-xl font-bold text-white mb-2">{card.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">{card.description}</p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-semibold text-slate-300 uppercase tracking-widest">
                  {card.badge}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── HIGH FIDELITY ZOOM MODAL AREA (100% WOW EFFECT) ── */}
      {selectedCard && (
        <div className="fixed inset-0 bg-[#02000a]/90 backdrop-blur-md z-50 flex items-center justify-center p-6 transition-all duration-300">
          
          {/* Dynamic Backdrop Glow matching card's glow color variable */}
          <div 
            className="absolute w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none transition-all duration-500 animate-pulse"
            style={{ 
              background: `radial-gradient(circle, ${selectedCard.glowColor} 0%, transparent 70%)` 
            }}
          />

          {/* Modal Focus Card */}
          <div className="w-full max-w-lg glass-card-wow rounded-3xl p-6 md:p-8 relative z-10 border border-white/10 transform scale-100 transition-transform duration-300">
            
            {/* Close trigger */}
            <button 
              onClick={() => setSelectedCard(null)}
              className="absolute top-5 right-5 p-2 bg-white/5 border border-white/10 text-slate-400 hover:text-white rounded-full transition-colors"
            >
              <X size={16} />
            </button>

            {/* Header Content */}
            <div className="flex items-center gap-3.5 mb-6">
              <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                {React.createElement(selectedCard.icon, { size: 20 })}
              </div>
              <div>
                <h3 className="text-lg font-black text-white">{selectedCard.detail.title}</h3>
                <p className="text-xs text-slate-400">{selectedCard.detail.subtitle}</p>
              </div>
            </div>

            {/* Live Visual inside Modal */}
            <div className="mb-6">
              {selectedCard.detail.visual}
            </div>

            {/* Description text */}
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed mb-6 font-normal">
              {selectedCard.description}
            </p>

            {/* Action close button */}
            <button 
              onClick={() => setSelectedCard(null)}
              className="w-full py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-violet-600/20"
            >
              Close Focus View
            </button>

          </div>
        </div>
      )}

      {/* Testimonials */}
      <section id="testimonials" className="py-24 border-t border-white/[0.04] bg-slate-950/20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-16">
            <div className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-3">Educator Feedback</div>
            <h2 className="text-3xl md:text-5xl font-black text-white">
              Trusted in classrooms and admission cells
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl border border-white/[0.04] bg-slate-900/10">
              <div className="flex gap-1 text-yellow-500 mb-4">
                <Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" />
              </div>
              <p className="text-sm text-slate-400 leading-relaxed mb-6 font-medium italic">
                "We switched to Skillbrix and went from days of manually processing exam papers to instant results distribution. Tremendous time-saver."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-violet-600 text-white font-bold flex items-center justify-center text-xs">RK</div>
                <div>
                  <div className="text-sm font-semibold text-white">Rajesh Kumar</div>
                  <div className="text-xs text-slate-500">VIT Hyderabad</div>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-2xl border border-white/[0.04] bg-slate-900/10">
              <div className="flex gap-1 text-yellow-500 mb-4">
                <Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" />
              </div>
              <p className="text-sm text-slate-400 leading-relaxed mb-6 font-medium italic">
                "Uploading 2,000 students at a time with department auto-mapping is incredibly fast. The database handles bulk inserts seamlessly."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-fuchsia-600 text-white font-bold flex items-center justify-center text-xs">SP</div>
                <div>
                  <div className="text-sm font-semibold text-white">Sunita Patel</div>
                  <div className="text-xs text-slate-500">JNTU Admissions</div>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-2xl border border-white/[0.04] bg-slate-900/10">
              <div className="flex gap-1 text-yellow-500 mb-4">
                <Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" />
              </div>
              <p className="text-sm text-slate-400 leading-relaxed mb-6 font-medium italic">
                "We upload JEE and GATE mocks with complex negative marking structures. Handles scoring options without errors."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-xs">AM</div>
                <div>
                  <div className="text-sm font-semibold text-white">Arjun Mehta</div>
                  <div className="text-xs text-slate-500">HOD, NIT Warangal</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive FAQs Section */}
      <section id="faqs" className="py-24 px-6 md:px-12 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-3">Questions & Answers</div>
          <h2 className="text-3xl md:text-5xl font-black text-white">Frequently Asked</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx}
              className="border border-white/[0.04] bg-slate-900/10 rounded-xl overflow-hidden transition-all duration-300"
            >
              <button 
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-white text-sm"
              >
                <span>{faq.q}</span>
                <ChevronDown 
                  size={16} 
                  className={`text-slate-400 transition-transform duration-300 ${activeFaq === idx ? "rotate-180 text-white" : ""}`} 
                />
              </button>
              <div 
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  activeFaq === idx ? "max-h-40 border-t border-white/[0.04] bg-white/[0.01]" : "max-h-0"
                }`}
              >
                <div className="p-6 text-xs md:text-sm text-slate-400 leading-relaxed font-normal">
                  {faq.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Box */}
      <section className="py-20 px-6 md:px-12 max-w-5xl mx-auto relative z-10">
        <div className="p-12 md:p-20 rounded-3xl border border-violet-500/20 bg-[#050212] text-center shadow-2xl relative">
          <div className="absolute inset-0 bg-violet-600/5 blur-3xl rounded-3xl -z-10" />
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
            Ready to upgrade your assessments?
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto mb-8 text-sm">
            Deploy online tests, configure proctor options, and analyze student logs in one custom workspace.
          </p>
          <div className="flex justify-center gap-4">
            <Link 
              to="/login" 
              className="px-8 py-4 bg-gradient-to-r from-violet-600 via-violet-500 to-fuchsia-600 text-white font-bold rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shimmer-btn"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-12 px-6 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center font-black text-white text-xs shadow-md shadow-violet-500/25">
              SB
            </div>
            <span className="font-extrabold tracking-tight text-white">Skillbrix Solutions</span>
          </div>
          <p className="text-xs text-slate-500">© 2026 Skillbrix Solutions. All rights reserved.</p>
        </div>

        <div className="flex gap-6 text-xs text-slate-500">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-white transition-colors">Support</a>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
