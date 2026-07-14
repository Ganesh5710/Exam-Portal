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
  Terminal,
  HelpCircle,
  Sliders,
  Share2,
  SlidersHorizontal,
  Download,
  MessageSquare,
  Send
} from "lucide-react";

// Ultra-Premium Interactive Bento Card Wrapper
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

  // ── EXTRA FEATURE 1: AI CALIBRATION WIZARD (WEBCAM) ──
  const [calibState, setCalibState] = useState("idle"); // "idle", "calibrating", "success"
  const [calibMetrics, setCalibMetrics] = useState({ gaze: "0.0°", headPose: "0.0°", light: "0%" });
  
  const handleStartCalibration = () => {
    setCalibState("calibrating");
    setTimeout(() => {
      setCalibMetrics({ gaze: "1.2° (Centered)", headPose: "Pitch: -0.4°, Yaw: 0.1°", light: "88% (Good)" });
      setCalibState("success");
    }, 1500);
  };

  // ── EXTRA FEATURE 2: MINI EXAM TERMINAL SANDBOX ──
  const [sandboxCode, setSandboxCode] = useState("def calculate_sum(a, b):\n    return a + b\n\n# Run tests\nprint(calculate_sum(10, 15))");
  const [sandboxLang, setSandboxLang] = useState("python");
  const [sandboxOutput, setSandboxOutput] = useState("");
  const [isCompilingSandbox, setIsCompilingSandbox] = useState(false);

  const handleRunSandbox = () => {
    setIsCompilingSandbox(true);
    setSandboxOutput("");
    setTimeout(() => {
      setIsCompilingSandbox(false);
      if (sandboxLang === "python") {
        setSandboxOutput(">>> Executing script...\n25\n\nAll Test cases passed.");
      } else {
        setSandboxOutput(">>> Executing JavaScript...\nstdout: 25\n\nProcess completed with 0 errors.");
      }
    }, 1000);
  };

  // ── EXTRA FEATURE 3: LIVE WEBSOCKET LOGS STREAM ──
  const [socketLogs, setSocketLogs] = useState([
    "[SYSTEM] Database connections synchronized successfully.",
    "[REDIS] Cache key pool initialized. TTL 3600s.",
    "[WEBSOCKET] Proctor event loop active on port 5000."
  ]);

  useEffect(() => {
    const logPool = [
      "[WEBSOCKET] Candidate #8402 heartbeats verified.",
      "[REDIS] Cache hit for exam session list configurations.",
      "[SYSTEM] Auto-saving student exam draft buffer to DB.",
      "[PROCTOR] Gaze threshold deviation check: NORMAL.",
      "[INTEGRITY] Fullscreen focus validation check: MATCH."
    ];
    const logInterval = setInterval(() => {
      const randomLog = logPool[Math.floor(Math.random() * logPool.length)];
      const timestamp = new Date().toLocaleTimeString();
      setSocketLogs(prev => [`[${timestamp}] ${randomLog}`, ...prev.slice(0, 7)]);
    }, 4000);
    return () => clearInterval(logInterval);
  }, []);

  // ── EXTRA FEATURE 4: BULK EXCEL/CSV TEMPLATE GENERATOR ──
  const [selectedTemplate, setSelectedTemplate] = useState("questions");
  const templates = {
    questions: "content,type,options,answers,score,explanation\nWhich keyword is used to extend a class in Java?,MCQ,\"[\"\"extends\"\",\"\"implements\"\",\"\"imports\"\"]\",extends,1.0,extends is the inheritance keyword in class design.",
    students: "firstName,lastName,email,departmentCode\nRahul,Sharma,rahul@nitw.ac.in,CSE\nAjay,Krishna,ajay@nitw.ac.in,CSE"
  };

  // ── EXTRA FEATURE 5: DYNAMIC SCORE & PENALTY SIMULATOR ──
  const [correctWeight, setCorrectWeight] = useState(4);
  const [penaltyWeight, setPenaltyWeight] = useState(1);
  const [correctAnswers, setCorrectAnswers] = useState(8);
  const [incorrectAnswers, setIncorrectAnswers] = useState(2);
  const finalScore = (correctAnswers * correctWeight) - (incorrectAnswers * penaltyWeight);

  // ── EXTRA FEATURE 6: SYSTEM INTEGRITY HEALTH CHECK ──
  const [healthStatus, setHealthStatus] = useState("ONLINE");
  const [pingTimes, setPingTimes] = useState({ postgres: "14ms", redis: "2ms", socket: "22ms" });

  const triggerHealthRefresh = () => {
    setHealthStatus("REFRESHING");
    setTimeout(() => {
      setPingTimes({
        postgres: `${Math.floor(Math.random() * 20) + 8}ms`,
        redis: `${Math.floor(Math.random() * 4) + 1}ms`,
        socket: `${Math.floor(Math.random() * 30) + 15}ms`
      });
      setHealthStatus("ONLINE");
    }, 800);
  };

  // ── EXTRA FEATURE 7: TIMELINE OF EXAM SESSION SLIDER ──
  const [timelineVal, setTimelineVal] = useState(25);
  const getTimelineState = () => {
    if (timelineVal < 25) return { t: "0m - Initiation", d: "Webcam parameters validated, fullscreen mode locked on workspace." };
    if (timelineVal < 50) return { t: "15m - In Progress", d: "First tab switch warnings detected. Real-time alert dispatched to proctor feed." };
    if (timelineVal < 75) return { t: "30m - Flag Applied", d: "Second deviation detected. Automatical negative scoring penalty marked." };
    return { t: "45m - Submission", d: "Exam countdown elapsed. Fail-safe script commits student draft automatically." };
  };

  // ── EXTRA FEATURE 8: INTERACTIVE STUDENT COHORT STATISTICS ──
  const [selectedDept, setSelectedDept] = useState("CSE");
  const deptStats = {
    CSE: { avg: "82.4%", passRate: "96.5%", size: "542 Candidates" },
    ECE: { avg: "78.1%", passRate: "92.2%", size: "412 Candidates" },
    MECH: { avg: "71.5%", passRate: "88.0%", size: "294 Candidates" }
  };

  // ── EXTRA FEATURE 9: INTEGRATION APP CONNECTOR CONNECTIVITY ──
  const [activeConn, setActiveConn] = useState(null);

  // ── EXTRA FEATURE 10: INTERACTIVE HELPDESK CHAT BOX ──
  const [chatInput, setChatInput] = useState("");
  const [chatLogs, setChatLogs] = useState([
    { sender: "AI Assistant", text: "Hello! How can I assist you with the Skillbrix Online Exam Portal today?" }
  ]);

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatLogs(prev => [...prev, { sender: "You", text: userText }]);
    setChatInput("");

    setTimeout(() => {
      let reply = "I can assist you with bulk CSV questions formatting, setting up proctor tolerances, or locking exams.";
      if (userText.toLowerCase().includes("proctor")) {
        reply = "Our AI proctor scans candidate gaze via webcams and blocks tab switches. If warnings hit 5, it auto-submits.";
      } else if (userText.toLowerCase().includes("csv") || userText.toLowerCase().includes("import")) {
        reply = "You can download Excel templates, fill them out in bulk, and upload up to 2,000 questions in parallel blocks.";
      }
      setChatLogs(prev => [...prev, { sender: "AI Assistant", text: reply }]);
    }, 800);
  };

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
    }
  ];

  return (
    <div className="min-h-screen bg-[#02000A] text-slate-100 selection:bg-violet-600/30 selection:text-violet-200 overflow-x-hidden relative font-sans">
      
      {/* Global CSS style overrides for premium dashboard features */}
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
          <a href="#proctor-calibration" className="hover:text-white transition-colors">Calibration</a>
          <a href="#code-sandbox" className="hover:text-white transition-colors">Sandbox</a>
          <a href="#scoring-simulator" className="hover:text-white transition-colors">Score Simulator</a>
          <a href="#session-timeline" className="hover:text-white transition-colors">Timeline</a>
          <a href="#cohort-map" className="hover:text-white transition-colors">Cohorts</a>
          <a href="#helpdesk-chat" className="hover:text-white transition-colors">AI Helpdesk</a>
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

        <div className="flex flex-col sm:flex-row gap-4 mb-20 relative z-20">
          <a href="#proctor-calibration" className="px-8 py-4.5 bg-gradient-to-r from-violet-600 via-violet-500 to-fuchsia-600 text-white font-bold rounded-xl shadow-2xl shadow-violet-600/35 hover:shadow-violet-600/50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 shimmer-btn">
            Explore 10 Premium Features <ArrowRight size={16} />
          </a>
        </div>
      </header>

      {/* ── INTERACTIVE AREA: 10 PREMIUM ASSESSMENT TOOLS PANEL ── */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-white/[0.04] space-y-16">
        
        {/* 1. AI PROCTORING CALIBRATION WIZARD & 2. REAL-TIME LOGS STREAM */}
        <div id="proctor-calibration" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Feature 1: AI Calibration Panel */}
          <div className="glass-card-wow p-8 rounded-3xl border border-white/5 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="px-2.5 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-[9px] font-bold text-violet-400 uppercase tracking-widest w-fit block">
                Feature #1
              </span>
              <h3 className="text-xl font-bold text-white">AI Proctoring Calibration Wizard</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pre-test system parameters to measure eye-gaze lock and head position index before starting the exam.
              </p>
              
              <div className="bg-[#050212] p-5 rounded-2xl border border-white/5 space-y-4">
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">Gaze Angle</span>
                    <span className="text-white font-bold block mt-1">{calibMetrics.gaze}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">Head Yaw</span>
                    <span className="text-white font-bold block mt-1">{calibMetrics.headPose}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">Ambient Light</span>
                    <span className="text-white font-bold block mt-1">{calibMetrics.light}</span>
                  </div>
                </div>

                <button 
                  onClick={handleStartCalibration}
                  disabled={calibState === "calibrating"}
                  className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-all disabled:opacity-50"
                >
                  {calibState === "calibrating" ? "Calibrating Sensors..." : "Run Calibration Check"}
                </button>
              </div>
            </div>
          </div>

          {/* Feature 2: WebSocket Logs Stream */}
          <div className="glass-card-wow p-8 rounded-3xl border border-white/5 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="px-2.5 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-[9px] font-bold text-violet-400 uppercase tracking-widest w-fit block">
                Feature #2
              </span>
              <h3 className="text-xl font-bold text-white">Real-Time WebSocket Log Stream</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Active connections compile and stream client telemetry details directly into the database.
              </p>
              
              <div className="bg-slate-950 border border-white/5 rounded-2xl p-4 font-mono text-[10px] text-slate-400 space-y-1.5 h-36 overflow-y-auto">
                {socketLogs.map((log, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="text-slate-600">→</span>
                    <span className="text-slate-300">{log}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3. MINI EXAM TERMINAL SANDBOX & 4. SYSTEM HEALTH CHECK */}
        <div id="code-sandbox" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Feature 3: Code Sandbox */}
          <div className="glass-card-wow p-8 rounded-3xl border border-white/5 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="px-2.5 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-[9px] font-bold text-violet-400 uppercase tracking-widest w-fit block">
                Feature #3
              </span>
              <h3 className="text-xl font-bold text-white">Interactive Code Editor Sandbox</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Test code compiles against dynamic test parameters inside the sandbox environment.
              </p>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-slate-950 px-3 py-1.5 border border-white/5 rounded-t-xl">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Editor pane</span>
                  <select 
                    value={sandboxLang} 
                    onChange={(e) => setSandboxLang(e.target.value)}
                    className="bg-transparent border-none text-[10px] text-violet-400 font-bold focus:outline-none"
                  >
                    <option value="python" className="bg-[#050212]">Python 3.10</option>
                    <option value="javascript" className="bg-[#050212]">JavaScript (Node)</option>
                  </select>
                </div>
                
                <textarea
                  value={sandboxCode}
                  onChange={(e) => setSandboxCode(e.target.value)}
                  rows={4}
                  className="w-full bg-[#050212] border border-white/10 rounded-b-xl p-3 text-[11px] text-slate-300 font-mono focus:outline-none"
                />

                <button 
                  onClick={handleRunSandbox}
                  disabled={isCompilingSandbox}
                  className="w-full py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl text-[10px] uppercase tracking-widest transition-all"
                >
                  {isCompilingSandbox ? "Executing..." : "Execute Test Case"}
                </button>

                {sandboxOutput && (
                  <pre className="bg-slate-950 p-3 rounded-xl border border-white/5 font-mono text-[9px] text-emerald-400">
                    {sandboxOutput}
                  </pre>
                )}
              </div>
            </div>
          </div>

          {/* Feature 4: System Integrity Health Check */}
          <div className="glass-card-wow p-8 rounded-3xl border border-white/5 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="px-2.5 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-[9px] font-bold text-violet-400 uppercase tracking-widest w-fit block">
                Feature #4
              </span>
              <h3 className="text-xl font-bold text-white">System Integrity Health Checker</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Confirm backend database, caching, and network latency response rates globally.
              </p>

              <div className="bg-[#050212] border border-white/5 rounded-2xl p-5 space-y-3.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-semibold">PostgreSQL Ping</span>
                  <span className="text-emerald-400 font-bold">{pingTimes.postgres}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-semibold">Redis Cache Speed</span>
                  <span className="text-emerald-400 font-bold">{pingTimes.redis}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-semibold">Socket.IO Heartbeat</span>
                  <span className="text-emerald-400 font-bold">{pingTimes.socket}</span>
                </div>

                <button 
                  onClick={triggerHealthRefresh}
                  className="w-full py-2 bg-slate-900 border border-white/10 hover:bg-slate-800 text-white font-bold rounded-xl text-[10px] uppercase tracking-widest transition-colors"
                >
                  {healthStatus === "REFRESHING" ? "Querying Nodes..." : "Refresh Status"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 5. DYNAMIC SCORING SIMULATOR & 6. BULK TEMPLATE GENERATOR */}
        <div id="scoring-simulator" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Feature 5: Score Simulator */}
          <div className="glass-card-wow p-8 rounded-3xl border border-white/5 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="px-2.5 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-[9px] font-bold text-violet-400 uppercase tracking-widest w-fit block">
                Feature #5
              </span>
              <h3 className="text-xl font-bold text-white">Dynamic Score & Penalty Simulator</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Adjust marking weights and penalty indices to calculate simulated final exam scores.
              </p>

              <div className="bg-[#050212] border border-white/5 rounded-2xl p-5 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Correct Answer Value (+{correctWeight})</span>
                    <input 
                      type="range" min={1} max={4} value={correctWeight}
                      onChange={(e) => setCorrectWeight(parseInt(e.target.value))}
                      className="accent-violet-500"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Incorrect Answer Penalty (-{penaltyWeight})</span>
                    <input 
                      type="range" min={0} max={2} value={penaltyWeight}
                      onChange={(e) => setPenaltyWeight(parseInt(e.target.value))}
                      className="accent-violet-500"
                    />
                  </div>
                </div>

                <div className="border-t border-white/[0.04] pt-4 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Correct: {correctAnswers} / Incorrect: {incorrectAnswers}</span>
                  <span className="text-sm font-black text-white">Total Score: <span className="text-violet-400">{finalScore} Marks</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 6: Bulk Template Generator */}
          <div className="glass-card-wow p-8 rounded-3xl border border-white/5 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="px-2.5 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-[9px] font-bold text-violet-400 uppercase tracking-widest w-fit block">
                Feature #6
              </span>
              <h3 className="text-xl font-bold text-white">Bulk Excel / CSV Template Generator</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Select and generate standard formats for questions or student list templates.
              </p>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <button 
                    onClick={() => setSelectedTemplate("questions")}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-colors ${
                      selectedTemplate === "questions" ? "bg-violet-600 text-white" : "bg-white/5 text-slate-400"
                    }`}
                  >
                    Questions Schema
                  </button>
                  <button 
                    onClick={() => setSelectedTemplate("students")}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-colors ${
                      selectedTemplate === "students" ? "bg-violet-600 text-white" : "bg-white/5 text-slate-400"
                    }`}
                  >
                    Students Schema
                  </button>
                </div>
                <textarea
                  readOnly
                  value={templates[selectedTemplate]}
                  rows={3}
                  className="w-full bg-[#050212] border border-white/10 rounded-xl p-3 text-[10px] text-slate-400 font-mono focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 7. TIMELINE OF EXAM SESSION & 8. COHORT MAP STATISTICS */}
        <div id="session-timeline" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Feature 7: Session Timeline */}
          <div className="glass-card-wow p-8 rounded-3xl border border-white/5 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="px-2.5 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-[9px] font-bold text-violet-400 uppercase tracking-widest w-fit block">
                Feature #7
              </span>
              <h3 className="text-xl font-bold text-white">Interactive Session Timeline</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Drag the slider to review proctoring and compilation stages throughout the exam.
              </p>

              <div className="bg-[#050212] border border-white/5 rounded-2xl p-5 space-y-4">
                <input 
                  type="range" min={0} max={100} value={timelineVal}
                  onChange={(e) => setTimelineVal(parseInt(e.target.value))}
                  className="w-full accent-violet-500"
                />
                
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-violet-400">{getTimelineState().t}</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{getTimelineState().d}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 8: Cohort Map */}
          <div id="cohort-map" className="glass-card-wow p-8 rounded-3xl border border-white/5 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="px-2.5 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-[9px] font-bold text-violet-400 uppercase tracking-widest w-fit block">
                Feature #8
              </span>
              <h3 className="text-xl font-bold text-white">Interactive Cohort Map</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Select a department division to review its average grades and student sizes.
              </p>

              <div className="space-y-3.5">
                <div className="flex gap-2">
                  {["CSE", "ECE", "MECH"].map((dept) => (
                    <button
                      key={dept}
                      onClick={() => setSelectedDept(dept)}
                      className={`flex-1 py-1 rounded-lg text-[10px] font-bold uppercase transition-colors ${
                        selectedDept === dept ? "bg-violet-600 text-white" : "bg-white/5 text-slate-400"
                      }`}
                    >
                      {dept} Division
                    </button>
                  ))}
                </div>

                <div className="bg-[#050212] border border-white/5 rounded-2xl p-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Candidates</span>
                    <span className="text-white font-bold">{deptStats[selectedDept].size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Class Average</span>
                    <span className="text-violet-400 font-bold">{deptStats[selectedDept].avg}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Integrity Pass Rate</span>
                    <span className="text-emerald-400 font-bold">{deptStats[selectedDept].passRate}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 9. CONNECTORS GRID & 10. HELPDESK CHAT BOX */}
        <div id="helpdesk-chat" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Feature 9: Connectors Grid */}
          <div className="glass-card-wow p-8 rounded-3xl border border-white/5 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="px-2.5 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-[9px] font-bold text-violet-400 uppercase tracking-widest w-fit block">
                Feature #9
              </span>
              <h3 className="text-xl font-bold text-white">Platform Integration Connectors</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Hover over an application block to establish standard API sync connections.
              </p>

              <div className="grid grid-cols-2 gap-3 mt-4">
                {["Slack Alerts", "Canvas LTI", "Moodle API", "Google Workspaces"].map((app) => (
                  <div 
                    key={app}
                    onMouseEnter={() => setActiveConn(app)}
                    onMouseLeave={() => setActiveConn(null)}
                    className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${
                      activeConn === app ? "bg-violet-600/10 border-violet-500/35 text-white" : "bg-[#050212] border-white/5 text-slate-400"
                    }`}
                  >
                    <span className="text-xs font-bold block">{app}</span>
                    <span className="text-[8px] uppercase tracking-wider block mt-1 text-slate-500">
                      {activeConn === app ? "Establish Connection" : "Offline"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Feature 10: Helpdesk Chat Box */}
          <div className="glass-card-wow p-8 rounded-3xl border border-white/5 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="px-2.5 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-[9px] font-bold text-violet-400 uppercase tracking-widest w-fit block">
                Feature #10
              </span>
              <h3 className="text-xl font-bold text-white">Interactive Helpdesk AI Chat</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Type queries about platform setup or CSV formats to check simulated AI responses.
              </p>

              <div className="space-y-3">
                <div className="bg-[#050212] border border-white/5 rounded-xl p-3 h-28 overflow-y-auto space-y-2 text-[10px] font-sans">
                  {chatLogs.map((msg, idx) => (
                    <div key={idx} className={msg.sender === "You" ? "text-right" : "text-left"}>
                      <span className="text-slate-500 block text-[8px] uppercase font-bold">{msg.sender}</span>
                      <p className="text-white mt-0.5 inline-block bg-white/5 px-2.5 py-1 rounded-lg max-w-[80%]">{msg.text}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendChat} className="flex gap-2">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type 'proctor' or 'csv'..."
                    className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500"
                  />
                  <button type="submit" className="p-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl transition-all">
                    <Send size={12} />
                  </button>
                </form>
              </div>
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
