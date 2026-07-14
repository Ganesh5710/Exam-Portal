import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
  BarChart4,
  Layout,
  UserCheck
} from "lucide-react";

// Ultra-Premium Bento Card Wrapper
const PremiumBentoCard = ({ children, className, glowColor = "rgba(124, 92, 252, 0.25)", onClick }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    const width = rect.width;
    const height = rect.height;
    const rotateX = ((y / height) - 0.5) * -10;
    const rotateY = ((x / width) - 0.5) * 10;
    
    setTilt({ x: rotateX, y: rotateY });
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`relative overflow-hidden rounded-[32px] border border-white/[0.03] bg-[#070514]/80 backdrop-blur-2xl transition-all duration-300 flex flex-col h-full ${className}`}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(${isHovered ? 1.015 : 1}, ${isHovered ? 1.015 : 1}, 1)`,
        boxShadow: isHovered 
          ? `0 30px 60px -15px rgba(0,0,0,0.8), 0 0 50px -10px ${glowColor}, inset 0 1px 0 rgba(255,255,255,0.05)`
          : '0 20px 40px -20px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.02)',
        cursor: "pointer"
      }}
    >
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle 200px at ${mousePos.x}px ${mousePos.y}px, ${glowColor}, transparent 80%)`,
          opacity: isHovered ? 1 : 0
        }}
      />
      {children}
    </div>
  );
};

export const Landing = () => {
  const [activeFaq, setActiveFaq] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  
  // ── FEATURE 1: DYNAMIC AI QUESTION GENERATOR CUSTOMIZER ──
  const [aiSubject, setAiSubject] = useState("Java OOP");
  const [aiDifficulty, setAiDifficulty] = useState("Hard");
  const [aiCount, setAiCount] = useState(3);
  const [aiNegativeMarking, setAiNegativeMarking] = useState(true);
  const [aiState, setAiState] = useState("idle"); // "idle", "generating", "complete"
  const [generatedMcqs, setGeneratedMcqs] = useState([]);

  const handleGenerateCustomMcqs = () => {
    setAiState("generating");
    setGeneratedMcqs([]);
    
    setTimeout(() => {
      const samples = {
        "Java OOP": [
          { q: "Explain the memory storage allocation differences between an abstract class reference variable and its subclass instance memory block.", ans: "Reference is allocated on the Stack, object instance is allocated in Heap memory." },
          { q: "Under what conditions does the JVM invoke class initializers (<clinit>) for a class with static nested properties?", ans: "When a static member of the nested class is accessed or instance constructed." },
          { q: "Why is multiple inheritance via interfaces preferred over class extensions in large microservices architecture?", ans: "Decouples type inheritance and avoids the diamond problem dependency conflict." }
        ],
        "Python": [
          { q: "What is the computational complexity difference between lookup in a list vs dictionary inside a list comprehension?", ans: "List lookup is O(N), dictionary lookup is O(1) hash map." },
          { q: "How do Python metaclasses __new__ and __init__ differ during class object compilation?", ans: "__new__ creates and returns the class object, __init__ configures the attributes." }
        ],
        "React & Vite": [
          { q: "How does Fiber reconciler perform work loops in concurrent rendering mode?", ans: "Breaks rendering work into chunks using requestIdleCallback scheduling." },
          { q: "What is the structural performance impact of using inline arrow functions inside render loops?", ans: "Forces garbage collection and triggers child re-renders due to new reference keys." }
        ],
        "SQL Databases": [
          { q: "How does a B-Tree index scan differ from a Hash Index lookup for range filters?", ans: "B-Tree supports ranges via sequential nodes; Hash index only supports point equality." },
          { q: "Explain the ACID isolation anomaly known as Write Skew in transactions.", ans: "Two transactions read same data, execute disjoint updates, violating consistency check." }
        ]
      };

      const selectedList = samples[aiSubject] || samples["Java OOP"];
      const sliced = selectedList.slice(0, aiCount);
      setGeneratedMcqs(sliced);
      setAiState("complete");
    }, 1200);
  };

  // ── FEATURE 2: INTERACTIVE LIVE PROCTOR CONTROL DECK ──
  const [proctorStatus, setProctorStatus] = useState("Secured"); // "Secured", "Tab Warning", "Multiple Faces", "Candidate Missing", "Intervened"
  const [proctorFlags, setProctorFlags] = useState(0);
  const [proctorLogs, setProctorLogs] = useState([
    "[10:00:00] Candidate session initialized.",
    "[10:00:02] Biometric face validation: Match (99% confidence)."
  ]);

  const triggerProctorSimulation = (type) => {
    const time = new Date().toLocaleTimeString();
    if (type === "tab") {
      setProctorStatus("Tab Warning");
      setProctorFlags(prev => prev + 1);
      setProctorLogs(prev => [`[${time}] ALERT: Unfocused window. Departure logged.`, ...prev]);
    } else if (type === "multi") {
      setProctorStatus("Multiple Faces");
      setProctorFlags(prev => prev + 1);
      setProctorLogs(prev => [`[${time}] CRITICAL: Secondary face detection anomaly.`, ...prev]);
    } else if (type === "missing") {
      setProctorStatus("Candidate Missing");
      setProctorFlags(prev => prev + 1);
      setProctorLogs(prev => [`[${time}] WARNING: Candidate silhouette departed webcam feed.`, ...prev]);
    } else if (type === "reset") {
      setProctorStatus("Secured");
      setProctorFlags(0);
      setProctorLogs([`[${time}] Proctor system reset. Session secured.`, ...proctorLogs]);
    } else if (type === "lock") {
      setProctorStatus("Intervened");
      setProctorLogs(prev => [`[${time}] ADMIN COMMAND: Candidate workstation locked down.`, ...prev]);
    }
  };

  // ── FEATURE 3: INTERACTIVE ANALYTICS METRICS DASHBOARD ──
  const [activeTab, setActiveTab] = useState("overview"); // "overview", "departments", "integrations"
  
  // ── FEATURE 4: BATCH IMPORT SIMULATOR ──
  const [csvText, setCsvText] = useState("name,email,department\nRahul Sharma,rahul@nitw.ac.in,CSE\nAjay Krishna,ajay@nitw.ac.in,CSE\nPriya Nath,priya@nitw.ac.in,ECE");
  const [batchProgress, setBatchProgress] = useState(0);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedStudents, setParsedStudents] = useState([]);

  const handleSimulateBatchImport = () => {
    setIsParsing(true);
    setBatchProgress(10);
    setParsedStudents([]);
    
    const intervals = [30, 60, 90, 100];
    intervals.forEach((val, idx) => {
      setTimeout(() => {
        setBatchProgress(val);
        if (val === 100) {
          setIsParsing(false);
          setParsedStudents([
            { name: "Rahul Sharma", email: "rahul@nitw.ac.in", dept: "CSE", status: "Imported Successfully" },
            { name: "Ajay Krishna", email: "ajay@nitw.ac.in", dept: "CSE", status: "Imported Successfully" },
            { name: "Priya Nath", email: "priya@nitw.ac.in", dept: "ECE", status: "Imported Successfully" }
          ]);
        }
      }, (idx + 1) * 400);
    });
  };

  // Safe Timer Engine (seconds tracking)
  const [secondsLeft, setSecondsLeft] = useState(5399); 
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 5399));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  };
  
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

  const featureCards = [
    {
      id: "proctor",
      title: "AI Proctoring Signals",
      description: "Get automatic integrity flags with confidence scoring for every student test session. Know if they attempt to change tabs or lose focus.",
      icon: Shield,
      glowColor: "rgba(139, 92, 246, 0.45)",
      badge: "Webcam-Ready",
      visualWidget: (
        <div className="w-full bg-[#050212]/90 border border-white/[0.04] p-5 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group-hover:border-violet-500/20 transition-all min-h-[160px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,92,252,0.06)_0%,transparent_70%)]" />
          <div className="w-20 h-20 rounded-full border border-violet-500/25 flex items-center justify-center relative bg-violet-600/5 shadow-inner">
            <div className="absolute inset-1.5 border border-dashed border-violet-500/40 rounded-full animate-spin" style={{ animationDuration: '8s' }} />
            <div className="absolute w-12 h-12 rounded-full border border-violet-500/30 flex items-center justify-center bg-[#070514]/95 shadow-md z-10">
              <Activity className="text-violet-400 animate-pulse" size={20} />
            </div>
          </div>
          <div className="mt-4 text-center z-10">
            <span className="text-[9px] font-bold text-violet-400 uppercase tracking-widest block">AI Camera Feed</span>
            <span className="text-[11px] text-slate-300 font-medium block mt-0.5">Scanning Face / Gaze Locked</span>
          </div>
        </div>
      )
    },
    {
      id: "leaderboard",
      title: "Instant Leaderboards",
      description: "Publish rank updates and performance indicators the moment submissions are completed. No delay, no manual spreadsheet tallying.",
      icon: BarChart3,
      glowColor: "rgba(6, 182, 212, 0.45)",
      badge: "Auto-Compiled",
      visualWidget: (
        <div className="w-full bg-[#050212]/90 border border-white/[0.04] p-5 rounded-2xl flex flex-col justify-between group-hover:border-cyan-500/20 transition-all min-h-[160px]">
          <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/[0.04] pb-2 flex justify-between">
            <span>Student</span>
            <span>Grade</span>
          </div>
          <div className="space-y-2 mt-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-white font-semibold flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Ajay K.</span>
              <span className="text-emerald-400 font-bold">98%</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-white font-semibold flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Priya N.</span>
              <span className="text-emerald-400 font-bold">94%</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "timed",
      title: "Secure Timed Sessions",
      description: "Lock down browser focus and set hard thresholds. Exams automatically submit the exact millisecond the session countdown hits zero.",
      icon: Lock,
      glowColor: "rgba(236, 72, 153, 0.45)",
      badge: "Auto-Submit",
      visualWidget: (
        <div className="w-full bg-[#050212]/90 border border-white/[0.04] p-5 rounded-2xl flex flex-col items-center justify-center group-hover:border-fuchsia-500/20 transition-all min-h-[160px] relative">
          <Clock className="text-fuchsia-400 mb-2 animate-pulse" size={24} />
          <span className="text-2xl font-black text-white tracking-widest font-mono">00:59:59</span>
          <span className="text-[9px] text-slate-500 uppercase tracking-widest block mt-1">Countdown Lock</span>
        </div>
      )
    },
    {
      id: "batch",
      title: "Batch Optimized AI MCQ Parser",
      description: "Instead of processing records one-by-one which causes gateway timeouts, Skillbrix utilizes chunked parallel inserts to safely commit up to 2,000 questions in 500-question batch intervals.",
      icon: Cpu,
      glowColor: "rgba(124, 92, 252, 0.45)",
      badge: "Chunked DB Writes",
      visualWidget: (
        <div className="w-full bg-[#050212]/90 border border-white/[0.04] p-5 rounded-2xl flex items-center gap-6 group-hover:border-violet-500/20 transition-all min-h-[160px]">
          <div className="flex-1 space-y-2.5">
            <div className="h-1.5 bg-slate-900 border border-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-violet-500 w-[100%]" />
            </div>
            <div className="h-1.5 bg-slate-900 border border-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-violet-500 w-[100%]" />
            </div>
            <div className="h-1.5 bg-slate-900 border border-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-violet-500 w-[60%] animate-pulse" />
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Chunk Pipeline</span>
            <span className="text-sm font-black text-white block mt-1">1,500/2,000</span>
          </div>
        </div>
      )
    },
    {
      id: "students",
      title: "Clean Student Controls",
      description: "Show students on a clean single page without annoying previous/next pagination buttons. Block/unblock credentials instantly.",
      icon: Users,
      glowColor: "rgba(52, 211, 153, 0.45)",
      badge: "Clean Layout",
      visualWidget: (
        <div className="w-full bg-[#050212]/90 border border-white/[0.04] p-5 rounded-2xl flex flex-col justify-between group-hover:border-emerald-500/20 transition-all min-h-[160px]">
          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-white block">Rahul Sharma</span>
              <span className="text-[9px] text-slate-500 block">rahul@example.com</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold text-emerald-400 uppercase">Active</span>
          </div>
          <div className="flex items-center justify-between text-xs border-t border-white/[0.04] pt-3 mt-3">
            <div>
              <span className="font-semibold text-white block">Ajay Krishna</span>
              <span className="text-[9px] text-slate-500 block">ajay@example.com</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-[9px] font-bold text-red-400 uppercase">Blocked</span>
          </div>
        </div>
      )
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
      
      {/* Global CSS for glows and animations */}
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.25; transform: scale(1); filter: blur(100px); }
          50% { opacity: 0.45; transform: scale(1.1); filter: blur(120px); }
        }
        .glow-radial-1 {
          position: absolute;
          background: radial-gradient(circle, rgba(124, 92, 252, 0.3) 0%, transparent 70%);
          animation: pulse-glow 9s ease-in-out infinite;
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
      
      {/* Background Glow */}
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
          <a href="#proctor-simulation" className="hover:text-white transition-colors">Proctor Deck</a>
          <a href="#analytics-dashboard" className="hover:text-white transition-colors">Metrics</a>
          <a href="#custom-ai-prompter" className="hover:text-white transition-colors">AI Sandbox</a>
          <a href="#batch-import" className="hover:text-white transition-colors">Batch Tool</a>
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

      {/* Hero Section */}
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

        {/* Floating elements */}
        <div 
          className="absolute top-1/2 left-[10%] pointer-events-none hidden lg:block border border-white/5 bg-[#0a0815]/80 backdrop-blur-md p-4 rounded-2xl shadow-xl transition-transform duration-100 ease-out"
          style={{ transform: `translate(${parallaxOffset.x * 2}px, ${parallaxOffset.y * 2}px)` }}
        >
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">WebSocket Stable</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-20 relative z-20">
          <a href="#proctor-simulation" className="px-8 py-4.5 bg-gradient-to-r from-violet-600 via-violet-500 to-fuchsia-600 text-white font-bold rounded-xl shadow-2xl shadow-violet-600/35 hover:shadow-violet-600/50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 shimmer-btn">
            View Live Simulator <ArrowRight size={16} />
          </a>
        </div>
      </header>

      {/* ── FEATURE 1: INTERACTIVE LIVE PROCTOR CONTROL DECK ── */}
      <section id="proctor-simulation" className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-white/[0.04]">
        <div className="text-center max-w-xl mx-auto mb-16">
          <div className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-3">Workstation Deck</div>
          <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">Live Proctor Console</h2>
          <p className="text-sm text-slate-400 mt-2">Simulate real-time candidate actions to test how our proctor engine automatically captures focus violations.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          
          {/* Controls Panel */}
          <div className="glass-card-wow p-6 rounded-3xl border border-white/5 space-y-4">
            <h4 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Zap className="text-violet-400" size={16} /> Event Control Deck
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">Click any simulation button to trigger a student anomaly event and see the logs react.</p>
            
            <button 
              onClick={() => triggerProctorSimulation("tab")}
              className="w-full py-3 px-4 bg-white/5 border border-white/10 hover:bg-violet-600/10 hover:border-violet-500/20 text-left text-xs font-bold rounded-xl text-slate-200 flex justify-between items-center transition-all"
            >
              <span>Simulate Tab Departure</span>
              <span className="text-[10px] text-violet-400 uppercase tracking-wider font-semibold">Focus Out</span>
            </button>

            <button 
              onClick={() => triggerProctorSimulation("multi")}
              className="w-full py-3 px-4 bg-white/5 border border-white/10 hover:bg-violet-600/10 hover:border-violet-500/20 text-left text-xs font-bold rounded-xl text-slate-200 flex justify-between items-center transition-all"
            >
              <span>Simulate Multi-Face Detection</span>
              <span className="text-[10px] text-violet-400 uppercase tracking-wider font-semibold">Camera Check</span>
            </button>

            <button 
              onClick={() => triggerProctorSimulation("missing")}
              className="w-full py-3 px-4 bg-white/5 border border-white/10 hover:bg-violet-600/10 hover:border-violet-500/20 text-left text-xs font-bold rounded-xl text-slate-200 flex justify-between items-center transition-all"
            >
              <span>Simulate Candidate Missing</span>
              <span className="text-[10px] text-violet-400 uppercase tracking-wider font-semibold">Webcam Anomaly</span>
            </button>

            <div className="border-t border-white/[0.04] pt-4 flex gap-2">
              <button 
                onClick={() => triggerProctorSimulation("reset")}
                className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 border border-white/10 text-white font-bold rounded-xl text-[10px] uppercase tracking-widest transition-colors"
              >
                Reset Session
              </button>
              <button 
                onClick={() => triggerProctorSimulation("lock")}
                className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-[10px] uppercase tracking-widest transition-colors"
              >
                Lock Terminal
              </button>
            </div>
          </div>

          {/* Student Workstation Screen */}
          <div className="glass-card-wow p-6 rounded-3xl border border-white/5 flex flex-col justify-between min-h-[300px]">
            <div>
              <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Candidate Terminal</span>
                <span className="flex items-center gap-1.5 text-xs text-slate-300 font-bold">
                  <Clock size={12} className="text-fuchsia-400" /> {formatTime(secondsLeft)}
                </span>
              </div>

              {proctorStatus === "Intervened" ? (
                <div className="text-center py-10 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-400 mx-auto animate-pulse">
                    <Lock size={20} />
                  </div>
                  <h4 className="text-sm font-bold text-red-400">WORKSTATION TERMINATED</h4>
                  <p className="text-[11px] text-slate-400">Locked by proctor administrator command.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <span className="text-[9px] font-bold text-violet-400 uppercase tracking-widest">Question 1 of 5</span>
                  <h4 className="text-xs font-semibold text-white">Which keyword is used to make a class inherit from an interface in Java?</h4>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-[11px] text-slate-300">A) extends</div>
                    <div className="p-3 bg-violet-600/20 border border-violet-500/40 rounded-xl text-[11px] text-white font-bold">B) implements</div>
                  </div>
                </div>
              )}
            </div>

            <div className="text-[10px] text-slate-500 border-t border-white/5 pt-3 mt-4 flex justify-between items-center">
              <span>Candidate: Rahul Sharma</span>
              <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                proctorStatus === "Secured" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
              }`}>{proctorStatus}</span>
            </div>
          </div>

          {/* Admin Proctor Log Dashboard */}
          <div className="glass-card-wow p-6 rounded-3xl border border-white/5 flex flex-col justify-between min-h-[300px]">
            <div>
              <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Security Watch Feed</span>
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold animate-pulse">
                  <Activity size={10} /> Live Monitoring
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-[#050212] border border-white/5 p-3.5 rounded-xl text-center">
                  <span className="text-[8px] text-slate-500 font-bold block uppercase tracking-wider">Integrity Watch</span>
                  <span className={`text-base font-bold block mt-0.5 ${proctorFlags > 1 ? "text-red-400" : "text-emerald-400"}`}>
                    {proctorFlags === 0 ? "100%" : proctorFlags === 1 ? "80%" : "40%"}
                  </span>
                </div>
                <div className="bg-[#050212] border border-white/5 p-3.5 rounded-xl text-center">
                  <span className="text-[8px] text-slate-500 font-bold block uppercase tracking-wider">Anomaly Count</span>
                  <span className="text-base font-bold block mt-0.5 text-white">{proctorFlags} Flags</span>
                </div>
              </div>

              <div className="bg-slate-950 border border-white/5 rounded-xl p-3 font-mono text-[9px] text-slate-400 space-y-1.5 max-h-32 overflow-y-auto">
                {proctorLogs.map((log, index) => (
                  <div key={index} className="flex gap-2">
                    <span className="text-slate-600">→</span>
                    <span className={log.includes("ALERT") || log.includes("CRITICAL") ? "text-red-400" : ""}>{log}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-[9px] text-slate-500 border-t border-white/5 pt-3 mt-4">
              Real-time socket events sync on action event intervals.
            </div>
          </div>

        </div>
      </section>

      {/* ── FEATURE 2: INTERACTIVE ANALYTICS METRICS DASHBOARD ── */}
      <section id="analytics-dashboard" className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-white/[0.04]">
        <div className="text-center max-w-xl mx-auto mb-16">
          <div className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-3">Live Metrics</div>
          <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">Interactive Metrics</h2>
          <p className="text-sm text-slate-400 mt-2">Toggle between different admin panel tabs to review automated scoring pipelines.</p>
        </div>

        <div className="glass-card-wow rounded-3xl border border-white/5 p-6 md:p-8">
          <div className="flex gap-2 border-b border-white/5 pb-4 mb-6">
            {["overview", "departments", "integrations"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === tab ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20" : "bg-white/5 text-slate-400 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#050212] border border-white/5 p-5 rounded-2xl">
                <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Average Test Duration</span>
                <span className="text-3xl font-black text-white block mt-2">48m 12s</span>
                <p className="text-xs text-slate-400 mt-2">Average compilation completion time.</p>
              </div>
              <div className="bg-[#050212] border border-white/5 p-5 rounded-2xl">
                <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Active Cohort Count</span>
                <span className="text-3xl font-black text-violet-400 block mt-2">1,248 Candidates</span>
                <p className="text-xs text-slate-400 mt-2">Active database record sessions.</p>
              </div>
              <div className="bg-[#050212] border border-white/5 p-5 rounded-2xl">
                <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Average Proctor Rating</span>
                <span className="text-3xl font-black text-emerald-400 block mt-2">99.8%</span>
                <p className="text-xs text-slate-400 mt-2">Accurate gaze confirmation score.</p>
              </div>
            </div>
          )}

          {activeTab === "departments" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                <span className="font-bold text-slate-400">Department</span>
                <span className="font-bold text-slate-400">Allocated Candidates</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-white font-semibold">Computer Science Engineering (CSE)</span>
                <span className="text-violet-400 font-bold">542 Students</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-white font-semibold">Electronics & Communications (ECE)</span>
                <span className="text-violet-400 font-bold">412 Students</span>
              </div>
            </div>
          )}

          {activeTab === "integrations" && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {["Slack Alerts", "Canvas LTI", "Microsoft Teams", "Google Sheets API"].map((tool) => (
                <div key={tool} className="bg-[#050212] border border-white/5 p-4 rounded-xl text-center">
                  <span className="text-xs font-bold text-white block">{tool}</span>
                  <span className="inline-block mt-2 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[9px] font-semibold border border-emerald-500/20">Synced</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── FEATURE 3: DYNAMIC AI QUESTION GENERATOR CUSTOMIZER ── */}
      <section id="custom-ai-prompter" className="py-24 px-6 bg-slate-950/20 border-t border-white/[0.04]">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="max-w-xl mx-auto space-y-3">
            <div className="text-xs font-bold text-violet-400 uppercase tracking-widest">AI Customizer</div>
            <h2 className="text-3xl md:text-5xl font-black text-white">Dynamic AI Sandbox</h2>
            <p className="text-sm text-slate-400">Select subjects, set negative marking options, and compile personalized MCQ test segments instantly.</p>
          </div>

          <div className="neon-border-glow p-0.5">
            <div className="bg-[#050212] rounded-[22px] p-6 md:p-8 text-left border border-white/5 space-y-6">
              
              {/* Controls Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Subject</label>
                  <select 
                    value={aiSubject}
                    onChange={(e) => setAiSubject(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="Java OOP" className="bg-[#050212]">Java OOP</option>
                    <option value="Python" className="bg-[#050212]">Python</option>
                    <option value="React & Vite" className="bg-[#050212]">React & Vite</option>
                    <option value="SQL Databases" className="bg-[#050212]">SQL Databases</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Difficulty</label>
                  <select 
                    value={aiDifficulty}
                    onChange={(e) => setAiDifficulty(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="Easy" className="bg-[#050212]">Easy</option>
                    <option value="Medium" className="bg-[#050212]">Medium</option>
                    <option value="Hard" className="bg-[#050212]">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Count</label>
                  <input 
                    type="number" 
                    min={1} 
                    max={3}
                    value={aiCount}
                    onChange={(e) => setAiCount(parseInt(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <button 
                    onClick={handleGenerateCustomMcqs}
                    disabled={aiState === "generating"}
                    className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-violet-600/20"
                  >
                    {aiState === "generating" ? <RefreshCw className="animate-spin" size={12} /> : <Sparkles size={12} />}
                    Compile Test
                  </button>
                </div>
              </div>

              {/* Output Display */}
              {aiState === "generating" && (
                <div className="flex items-center gap-3 text-xs text-slate-400 border-t border-white/5 pt-6">
                  <RefreshCw className="animate-spin text-violet-400" size={16} />
                  Structuring {aiSubject} segment with negative weights ({aiDifficulty} parameters)...
                </div>
              )}

              {aiState === "complete" && generatedMcqs.length > 0 && (
                <div className="space-y-6 animate-fade-in border-t border-white/5 pt-6">
                  {generatedMcqs.map((q, idx) => (
                    <div key={idx} className="space-y-2 bg-[#0a0815]/50 border border-white/[0.03] p-4 rounded-xl">
                      <h4 className="text-xs md:text-sm font-bold text-white flex items-start gap-2">
                        <CornerDownRight size={14} className="text-violet-400 shrink-0 mt-0.5" />
                        {q.q}
                      </h4>
                      <p className="pl-6 text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
                        Suggested Key answer: {q.ans}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURE 4: BATCH IMPORT SIMULATOR ── */}
      <section id="batch-import" className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-white/[0.04]">
        <div className="text-center max-w-xl mx-auto mb-16">
          <div className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-3">Bulk Tools</div>
          <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">Department auto-detection</h2>
          <p className="text-sm text-slate-400 mt-2">Paste raw student lists to check how the platform groups records into transactions.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* CSV Input Panel */}
          <div className="glass-card-wow p-6 rounded-3xl border border-white/5 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">Paste student CSV / text</span>
              <textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                rows={5}
                className="w-full bg-[#050212] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-violet-500 font-mono"
              />
            </div>
            <button 
              onClick={handleSimulateBatchImport}
              disabled={isParsing}
              className="w-full mt-4 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-violet-600/20 flex items-center justify-center gap-2"
            >
              {isParsing ? <RefreshCw className="animate-spin" size={14} /> : <UploadCloud size={14} />}
              Parse & Map cohort
            </button>
          </div>

          {/* Mapping Output Panel */}
          <div className="glass-card-wow p-6 rounded-3xl border border-white/5 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider mb-3">Mapped Pipeline output</span>
              
              {batchProgress > 0 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Mapping progress</span>
                    <span className="text-violet-400 font-bold">{batchProgress}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-900 border border-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-500 transition-all duration-300" style={{ width: `${batchProgress}%` }} />
                  </div>
                </div>
              )}

              <div className="space-y-2 mt-4 max-h-[140px] overflow-y-auto">
                {parsedStudents.map((stud, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[11px] bg-white/5 p-2 rounded-lg border border-white/[0.04]">
                    <div>
                      <span className="text-white font-bold block">{stud.name}</span>
                      <span className="text-slate-500 block">{stud.email}</span>
                    </div>
                    <span className="text-emerald-400 font-semibold">{stud.dept}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="text-[10px] text-slate-500 border-t border-white/5 pt-3 mt-4">
              Identifies columns to match student credentials.
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Platform Features */}
      <section id="features" className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative z-20 border-t border-white/[0.04]">
        <div className="text-center max-w-xl mx-auto mb-20">
          <div className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-3">Enterprise Suite</div>
          <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
            Designed for scale, reliability, and security
          </h2>
          <p className="text-xs text-slate-400 mt-2">Click on any card to zoom in and check its visual interface.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featureCards.map((card, idx) => {
            const Icon = card.icon;
            const isWide = card.id === "batch";
            return (
              <PremiumBentoCard 
                key={card.id}
                onClick={() => setSelectedCard(card)}
                glowColor={card.glowColor}
                className={isWide ? "md:col-span-2" : ""}
              >
                <div className="p-8 h-full flex flex-col justify-between gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-violet-400">
                        <Icon size={22} />
                      </div>
                      <span className="px-2.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        {card.badge}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{card.title}</h3>
                      <p className="text-sm text-slate-400 leading-relaxed">{card.description}</p>
                    </div>
                  </div>

                  {/* Embedded Visual Widget */}
                  <div className="mt-auto">
                    {card.visualWidget}
                  </div>
                </div>
              </PremiumBentoCard>
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
                <h3 className="text-lg font-black text-white">{selectedCard.title}</h3>
                <p className="text-xs text-slate-400">Deep Integration Mockup</p>
              </div>
            </div>

            {/* Live Visual */}
            <div className="mb-6">
              {selectedCard.visualWidget}
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
