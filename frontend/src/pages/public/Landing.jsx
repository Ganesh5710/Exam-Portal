import React, { useState, useEffect, useRef } from "react";
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
  Clock,
  Sparkles,
  RefreshCw,
  Eye,
  CornerDownRight
} from "lucide-react";

// Custom Hook for Mouse Position (Spotlight Effect)
const useMousePosition = (ref) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      setPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    const node = ref.current;
    if (node) {
      node.addEventListener("mousemove", handleMouseMove);
    }
    return () => {
      if (node) {
        node.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, [ref]);

  return position;
};

// 3D Tilt Card Component
const TiltCard = ({ children, className, glowColor = "rgba(124, 92, 252, 0.15)", onClick }) => {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const mousePos = useMousePosition(cardRef);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const width = card.clientWidth;
    const height = card.clientHeight;
    
    // Calculate rotation angles (max 10 degrees)
    const rotateX = ((mousePos.y / height) - 0.5) * -15;
    const rotateY = ((mousePos.x / width) - 0.5) * 15;
    
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`relative overflow-hidden transition-all duration-300 rounded-[28px] border border-white/[0.04] bg-[#090714]/65 backdrop-blur-xl shadow-2xl ${className}`}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.02, 1.02, 1.02)`,
        transition: "transform 0.1s ease-out, border-color 0.3s ease",
        cursor: "pointer"
      }}
    >
      {/* Dynamic Cursor Spotlight Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle 120px at ${mousePos.x}px ${mousePos.y}px, ${glowColor}, transparent 80%)`
        }}
      />
      {children}
    </div>
  );
};

export const Landing = () => {
  const [activeFaq, setActiveFaq] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  
  // Interactive Simulation Sandbox States
  const [simState, setSimState] = useState("idle"); // "idle", "typing", "generating", "complete"
  const [promptText, setPromptText] = useState("");
  const [aiQuestions, setAiQuestions] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  // Split-Screen Simulator States
  const [splitState, setSplitState] = useState("start"); // "start", "progress", "tab-out", "proctor-alert", "graded"
  const [splitLogs, setSplitLogs] = useState([]);
  const [splitTimer, setSplitTimer] = useState("00:59:59");
  
  // Custom Parallax Mouse offsets
  const [parallaxOffset, setParallaxOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseParallax = (e) => {
      setParallaxOffset({
        x: (e.clientX - window.innerWidth / 2) * 0.015,
        y: (e.clientY - window.innerHeight / 2) * 0.015,
      });
    };
    window.addEventListener("mousemove", handleMouseParallax);
    return () => window.removeEventListener("mousemove", handleMouseParallax);
  }, []);

  // AI Prompt typing effect
  const triggerAiGenerator = () => {
    setSimState("typing");
    setAiQuestions([]);
    setIsTyping(true);
    const targetPrompt = "Generate 3 advanced Java OOP MCQs with negative marking...";
    let currentText = "";
    let i = 0;
    
    const interval = setInterval(() => {
      currentText += targetPrompt[i];
      setPromptText(currentText);
      i++;
      if (i >= targetPrompt.length) {
        clearInterval(interval);
        setIsTyping(false);
        setSimState("generating");
        
        // Simulate Generation Delay
        setTimeout(() => {
          setAiQuestions([
            {
              q: "Q1. Which keyword is used to make a class inherit from an interface in Java?",
              options: ["[A] extends", "[B] implements", "[C] inherits", "[D] imports"],
              ans: "[B] implements",
              explanation: "Classes implement interfaces, whereas classes extend other classes."
            },
            {
              q: "Q2. What is encapsulation in Object-Oriented Programming?",
              options: ["[A] Dynamic binding", "[B] Wrapping data and methods together", "[C] Operator overloading", "[D] Multiple inheritance"],
              ans: "[B] Wrapping data and methods together",
              explanation: "Encapsulation keeps variables and methods safe in a class container."
            }
          ]);
          setSimState("complete");
        }, 1500);
      }
    }, 50);
  };

  // Run Split Screen Proctor Demo Cycles
  useEffect(() => {
    let timerInterval;
    if (splitState === "progress") {
      setSplitLogs(["[10:00:00] Candidate initialized terminal.", "[10:00:02] Face scan verification: OK."]);
      
      const timeout1 = setTimeout(() => {
        setSplitState("tab-out");
        setSplitLogs(prev => ["[10:00:12] SYSTEM WARNING: Focus departed from workspace.", ...prev]);
      }, 4000);

      const timeout2 = setTimeout(() => {
        setSplitState("proctor-alert");
        setSplitLogs(prev => ["[10:00:15] CRITICAL ALERT: Tab switch detected. Proctor notified.", ...prev]);
      }, 8000);

      const timeout3 = setTimeout(() => {
        setSplitState("graded");
        setSplitLogs(prev => ["[10:00:25] Exam finalized. Auto-graded with penalty.", ...prev]);
      }, 12000);

      // Ticking Timer
      timerInterval = setInterval(() => {
        setSplitTimer(prev => {
          const parts = prev.split(":");
          let s = parseInt(parts[2]) - 1;
          let m = parseInt(parts[1]);
          let h = parseInt(parts[0]);
          if (s < 0) { s = 59; m--; }
          if (m < 0) { m = 59; h--; }
          const f = (val) => String(val).padStart(2, "0");
          return `${f(h)}:${f(m)}:${f(s)}`;
        });
      }, 1000);

      return () => {
        clearTimeout(timeout1);
        clearTimeout(timeout2);
        clearTimeout(timeout3);
        clearInterval(timerInterval);
      };
    }
  }, [splitState]);

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
            <div className="text-3xl font-black text-white tracking-widest font-mono">00:59:59</div>
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

  return (
    <div className="min-h-screen bg-[#02000A] text-slate-100 selection:bg-violet-600/30 selection:text-violet-200 overflow-x-hidden relative font-sans">
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#2a1f4d_1px,transparent_1px),linear-gradient(to_bottom,#2a1f4d_1px,transparent_1px)] bg-[size:5rem_5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.22] pointer-events-none" />
      
      {/* Background Neon Orbs */}
      <div className="glow-radial-1 w-[800px] h-[500px] -top-40 left-[50%] -translate-x-[50%] -z-10 animate-pulse" />

      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 h-20 border-b border-white/[0.04] bg-[#02000A]/70 backdrop-blur-xl z-50 flex items-center justify-between px-6 md:px-12">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-gradient-to-br from-violet-500 via-violet-600 to-fuchsia-500 rounded-xl flex items-center justify-center font-black text-white text-base shadow-lg shadow-violet-500/25 group-hover:scale-105 transition-transform">
            SB
          </div>
          <span className="text-xl font-black tracking-tight text-white">
            Skill<span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent font-extrabold">brix</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="#interactive-simulator" className="hover:text-white transition-colors">Split Monitor</a>
          <a href="#ai-prompter" className="hover:text-white transition-colors">AI Prompter</a>
          <a href="#features" className="hover:text-white transition-colors">Platform Features</a>
          <a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a>
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

      {/* Hero Header */}
      <header className="pt-44 pb-20 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
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

        {/* ── PARALLAX FLOATING WIDGETS ── */}
        <div 
          className="absolute top-1/2 left-[10%] pointer-events-none hidden lg:block border border-white/5 bg-[#0a0815]/80 backdrop-blur-md p-4 rounded-2xl shadow-xl transition-transform duration-100 ease-out"
          style={{ transform: `translate(${parallaxOffset.x * 2}px, ${parallaxOffset.y * 2}px)` }}
        >
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">WebSocket Stable</span>
          </div>
        </div>

        <div 
          className="absolute top-[60%] right-[10%] pointer-events-none hidden lg:block border border-white/5 bg-[#0a0815]/80 backdrop-blur-md p-4 rounded-2xl shadow-xl transition-transform duration-100 ease-out"
          style={{ transform: `translate(${parallaxOffset.x * -2}px, ${parallaxOffset.y * -2}px)` }}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="text-violet-400" size={14} />
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">AI Generation Active</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-20 relative z-20">
          <a href="#interactive-simulator" className="px-8 py-4.5 bg-gradient-to-r from-violet-600 via-violet-500 to-fuchsia-600 text-white font-bold rounded-xl shadow-2xl shadow-violet-600/35 hover:shadow-violet-600/50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 shimmer-btn">
            View Live Simulator <ArrowRight size={16} />
          </a>
        </div>
      </header>

      {/* ── SPLIT-SCREEN PROCTOR & STUDENT DEMO ── */}
      <section id="interactive-simulator" className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-white/[0.04]">
        <div className="text-center max-w-xl mx-auto mb-16">
          <div className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-3">Live Integration</div>
          <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">Split-Screen Simulator</h2>
          <p className="text-xs text-slate-500 mt-2">See exactly what the student experiences and how the administrator dashboard responds instantly.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          {/* Left: Student Screen */}
          <div className="neon-border-glow p-0.5 flex flex-col">
            <div className="flex-1 bg-slate-950 rounded-[22px] p-6 flex flex-col justify-between border border-white/5 min-h-[350px]">
              <div>
                <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-6">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Student Workspace</span>
                  <div className="flex items-center gap-2 font-mono text-xs text-white">
                    <Clock size={12} className="text-fuchsia-400" /> {splitTimer}
                  </div>
                </div>

                {splitState === "start" && (
                  <div className="space-y-6 text-center my-auto py-8">
                    <p className="text-sm text-slate-300">Click below to start taking the mock Java inheritance exam.</p>
                    <button 
                      onClick={() => setSplitState("progress")}
                      className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-all"
                    >
                      Start Mock Exam
                    </button>
                  </div>
                )}

                {splitState === "progress" && (
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Question 1 of 5</span>
                    <h4 className="text-sm font-semibold text-white">Which keyword is used to make a class inherit from an interface in Java?</h4>
                    <div className="grid grid-cols-1 gap-2.5">
                      <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-300">A) extends</div>
                      <div className="p-3 bg-violet-600/20 border border-violet-500/40 rounded-xl text-xs text-white font-bold">B) implements</div>
                      <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-300">C) inherits</div>
                    </div>
                  </div>
                )}

                {(splitState === "tab-out" || splitState === "proctor-alert") && (
                  <div className="space-y-6 text-center py-8">
                    <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mx-auto animate-pulse">
                      <AlertTriangle size={24} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-red-400 uppercase tracking-wider">Warning: Tab Switch Detected</h4>
                      <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto">
                        Please return to the fullscreen testing layout immediately. This departure has been logged to the admin dashboard.
                      </p>
                    </div>
                  </div>
                )}

                {splitState === "graded" && (
                  <div className="space-y-4 text-center py-8">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
                      <CheckCircle2 size={24} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">Exam Submission Finalized</h4>
                      <p className="text-xs text-slate-400 mt-2">Scorecard compiled. Proctor log file saved successfully.</p>
                    </div>
                  </div>
                )}
              </div>

              {splitState !== "start" && (
                <div className="text-[10px] text-slate-500 border-t border-white/5 pt-4 mt-6">
                  Candidate ID: #8402 (Rahul Sharma) — CSE Department
                </div>
              )}
            </div>
          </div>

          {/* Right: Administrator Proctor Console */}
          <div className="neon-border-glow p-0.5 flex flex-col">
            <div className="flex-1 bg-slate-950 rounded-[22px] p-6 flex flex-col justify-between border border-white/5 min-h-[350px]">
              <div>
                <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-6">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Administrator Dashboard</span>
                  <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Proctor Feed
                  </span>
                </div>

                {splitState === "start" && (
                  <div className="space-y-3 text-center my-auto py-8">
                    <p className="text-xs text-slate-500">Awaiting student exam initiation...</p>
                  </div>
                )}

                {splitState !== "start" && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-900/60 border border-white/5 p-4 rounded-xl">
                        <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Integrity Watch</span>
                        <span className={`text-lg font-bold block mt-1 ${
                          splitState === "tab-out" || splitState === "proctor-alert" ? "text-red-400" : "text-emerald-400"
                        }`}>
                          {splitState === "progress" ? "Secure (100%)" : splitState === "tab-out" ? "Warning (75%)" : splitState === "proctor-alert" ? "Breached (40%)" : "Graded"}
                        </span>
                      </div>
                      <div className="bg-slate-900/60 border border-white/5 p-4 rounded-xl">
                        <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Anomaly Flags</span>
                        <span className={`text-lg font-bold block mt-1 ${
                          splitState === "tab-out" || splitState === "proctor-alert" ? "text-red-400" : "text-white"
                        }`}>
                          {splitState === "tab-out" ? "1 Flag" : splitState === "proctor-alert" ? "2 Flags" : "0 Flags"}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-950 border border-white/5 rounded-xl p-4 font-mono text-[10px] text-slate-400 space-y-1.5 max-h-32 overflow-y-auto">
                      {splitLogs.map((log, index) => (
                        <div key={index} className="flex gap-2">
                          <span className="text-slate-600">→</span>
                          <span>{log}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {splitState !== "start" && (
                <div className="flex justify-between items-center text-xs border-t border-white/5 pt-4 mt-6">
                  <span className="text-slate-500">Live logs refresh automatically</span>
                  {splitState === "proctor-alert" && (
                    <button 
                      onClick={() => {
                        setSplitState("graded");
                        setSplitLogs(prev => ["[10:00:20] Admin intervened: Session closed.", ...prev]);
                      }}
                      className="px-3 py-1 bg-red-600 text-white font-bold rounded-lg text-[10px] uppercase tracking-wider transition-all"
                    >
                      Lock Terminal
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* ── AI QUESTION PROMPTER SIMULATOR ── */}
      <section id="ai-prompter" className="py-24 px-6 bg-slate-950/20 border-t border-white/[0.04]">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="max-w-xl mx-auto space-y-3">
            <div className="text-xs font-bold text-violet-400 uppercase tracking-widest">AI Generation Sandbox</div>
            <h2 className="text-3xl md:text-5xl font-black text-white">Interactive AI Prompter</h2>
            <p className="text-xs text-slate-500">Type or prompt our built-in question builder to automatically compile and tags MCQs in batches.</p>
          </div>

          <div className="neon-border-glow p-0.5">
            <div className="bg-[#050212] rounded-[22px] p-6 md:p-8 text-left border border-white/5">
              <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/5 mb-6">
                <Sparkles className="text-violet-400 shrink-0" size={18} />
                <input 
                  type="text" 
                  readOnly 
                  value={promptText} 
                  placeholder="Click 'Generate' below to prompt..." 
                  className="bg-transparent border-none focus:outline-none text-xs md:text-sm text-white placeholder-slate-500 w-full"
                />
                <button 
                  onClick={triggerAiGenerator}
                  disabled={simState === "typing" || simState === "generating"}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-all shrink-0 disabled:opacity-50"
                >
                  {simState === "generating" ? "Compiling..." : "Generate"}
                </button>
              </div>

              {simState === "generating" && (
                <div className="flex items-center gap-3 text-xs text-slate-400 py-6">
                  <RefreshCw className="animate-spin text-violet-400" size={16} />
                  Structuring, mapping, and exporting questions to database...
                </div>
              )}

              {simState === "complete" && aiQuestions.length > 0 && (
                <div className="space-y-6 animate-fade-in border-t border-white/5 pt-6">
                  {aiQuestions.map((q, idx) => (
                    <div key={idx} className="space-y-2">
                      <h4 className="text-xs md:text-sm font-bold text-white flex items-start gap-2">
                        <CornerDownRight size={14} className="text-violet-400 shrink-0 mt-0.5" />
                        {q.q}
                      </h4>
                      <div className="grid grid-cols-2 gap-2 pl-6">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className="p-2 bg-white/5 border border-white/5 rounded-lg text-[10px] text-slate-400">
                            {opt}
                          </div>
                        ))}
                      </div>
                      <div className="pl-6 text-[10px] text-emerald-400 font-semibold">
                        Correct Answer: {q.ans}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Platform Features (WITH TILT AND SHADOW EFFECT ON CLICK) */}
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
              <TiltCard 
                key={card.id}
                onClick={() => setSelectedCard(card)}
                glowColor={card.glowColor}
                className={isWide ? "md:col-span-2" : ""}
              >
                <div className="p-8 h-full flex flex-col justify-between">
                  <div>
                    <Icon className="text-violet-400 mb-6" size={32} />
                    <h3 className="text-xl font-bold text-white mb-2">{card.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed mb-6">{card.description}</p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-semibold text-slate-300 uppercase tracking-widest w-fit">
                    {card.badge}
                  </div>
                </div>
              </TiltCard>
            );
          })}
        </div>
      </section>

      {/* ── HIGH FIDELITY ZOOM MODAL AREA ── */}
      {selectedCard && (
        <div className="fixed inset-0 bg-[#02000a]/90 backdrop-blur-md z-50 flex items-center justify-center p-6 transition-all duration-300">
          
          {/* Dynamic Backdrop Glow */}
          <div 
            className="absolute w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none transition-all duration-500 animate-pulse"
            style={{ 
              background: `radial-gradient(circle, ${selectedCard.glowColor} 0%, transparent 70%)` 
            }}
          />

          {/* Modal Focus Card */}
          <div className="w-full max-w-lg glass-card-wow rounded-3xl p-6 md:p-8 relative z-10 border border-white/10 transform scale-100 transition-transform duration-300">
            
            {/* Close */}
            <button 
              onClick={() => setSelectedCard(null)}
              className="absolute top-5 right-5 p-2 bg-white/5 border border-white/10 text-slate-400 hover:text-white rounded-full transition-colors"
            >
              <X size={16} />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3.5 mb-6">
              <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                {React.createElement(selectedCard.icon, { size: 20 })}
              </div>
              <div>
                <h3 className="text-lg font-black text-white">{selectedCard.detail.title}</h3>
                <p className="text-xs text-slate-400">{selectedCard.detail.subtitle}</p>
              </div>
            </div>

            {/* Live Visual */}
            <div className="mb-6">
              {selectedCard.detail.visual}
            </div>

            <p className="text-xs md:text-sm text-slate-400 leading-relaxed mb-6 font-normal">
              {selectedCard.description}
            </p>

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
      <section className="py-24 border-t border-white/[0.04] bg-slate-950/20 px-6">
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

      {/* Interactive FAQs */}
      <section className="py-24 px-6 md:px-12 max-w-4xl mx-auto">
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
