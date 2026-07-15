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
  Send,
  Sun,
  Moon,
  Video
} from "lucide-react";

const faqs = [
  {
    q: "How does the AI Proctoring system work?",
    a: "Our AI proctor scans candidate gaze via standard webcams and flags tab switches or window resizing. If infractions exceed the set limit, the session automatically submits."
  },
  {
    q: "Can I bulk import questions using spreadsheets?",
    a: "Yes! You can download Excel/CSV templates, populate up to 2,000 questions, and upload them instantly."
  },
  {
    q: "Does the system support negative marking?",
    a: "Absolutely. You can customize grading models, configure positive weights for correct answers, and set negative penalties for incorrect choices."
  },
  {
    q: "What happens if a student disconnects during an exam?",
    a: "Our system features fail-safe auto-save. Responses are cached locally and synced to the cloud. Once the internet is restored, the candidate can resume from where they left off."
  }
];

// Ultra-Premium Interactive Bento Card Wrapper
const PremiumBentoCard = ({ id, children, className, glowColor = "rgba(124, 92, 252, 0.25)", onClick, isDarkMode }) => {
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
    const rotateX = ((y / height) - 0.5) * -22;
    const rotateY = ((x / width) - 0.5) * 22;
    
    setTilt({ x: rotateX, y: rotateY });
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <div
      id={id}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`relative rounded-[32px] transition-all duration-300 flex flex-col h-full ${className}`}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(${isHovered ? 1.04 : 1}, ${isHovered ? 1.04 : 1}, 1)`,
        cursor: "pointer",
        transformStyle: "preserve-3d",
        transition: "transform 0.15s ease-out"
      }}
    >
      {/* Background layer with rounded clipping and glassmorphism */}
      <div 
        className={`absolute inset-0 rounded-[32px] border overflow-hidden pointer-events-none transition-all duration-500 ${
          isDarkMode 
            ? "border-white/[0.06] bg-[#070514]/80 backdrop-blur-2xl" 
            : "border-slate-200/80 bg-white/95 shadow-sm shadow-slate-100/50 backdrop-blur-2xl"
        }`}
        style={{
          boxShadow: isHovered 
            ? (isDarkMode 
                ? `0 35px 70px -15px rgba(0,0,0,0.9), 0 0 50px -10px ${glowColor}, inset 0 1px 0 rgba(255,255,255,0.08)` 
                : `0 20px 40px -10px rgba(0,0,0,0.06), 0 0 35px -5px ${glowColor.replace(/0.45/, '0.12')}, inset 0 1px 0 rgba(255,255,255,0.6)`)
            : (isDarkMode 
                ? '0 20px 40px -20px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.02)' 
                : '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01)'),
          transition: "box-shadow 0.3s ease",
          transform: "translateZ(0px)"
        }}
      >
        {/* Dynamic Glow Spotlight */}
        <div 
          className="absolute inset-0 pointer-events-none transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle 220px at ${mousePos.x}px ${mousePos.y}px, ${
              isDarkMode ? glowColor : glowColor.replace(/0.45/, '0.12')
            }, transparent 80%)`,
            opacity: isHovered ? 1 : 0
          }}
        />
        {/* Holographic Sheen reflection */}
        <div 
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle 350px at ${mousePos.x}px ${mousePos.y}px, ${
              isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(124, 92, 252, 0.05)'
            }, transparent 60%)`,
            opacity: isHovered ? 1 : 0
          }}
        />
      </div>
      
      {/* Content container lifted in 3D space above the background */}
      <div 
        className="flex flex-col h-full relative z-20 pointer-events-auto"
        style={{ 
          transform: isHovered ? "translateZ(45px)" : "translateZ(12px)", 
          transition: "transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
          transformStyle: "preserve-3d"
        }}
      >
        {children}
      </div>
    </div>
  );
};
export const Landing = () => {
  const [activeFaq, setActiveFaq] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [activeFooterModal, setActiveFooterModal] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
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

  // ── EXTRA FEATURE 11: ASSESSMENT COMMAND CENTER STATE ──
  const [ccEvent, setCcEvent] = useState("normal"); // "normal" | "cheat" | "frozen"
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [ccLogs, setCcLogs] = useState([
    "[12:30:00] Admin session initialized.",
    "[12:30:02] Connected to Edge WebSocket node (Mumbai-01).",
    "[12:30:05] Monitoring 4 active candidate workspaces..."
  ]);
  const [ccCandidates, setCcCandidates] = useState([
    { id: 1, name: "Arjun Mehta", course: "Computer Science", status: "Active", warnings: 0, avatar: "AM", integrity: "100%" },
    { id: 2, name: "Sarah Connor", course: "Mathematics III", status: "Active", warnings: 0, avatar: "SC", integrity: "100%" },
    { id: 3, name: "Carlos Ray", course: "Electrical Systems", status: "Active", warnings: 0, avatar: "CR", integrity: "98%" },
    { id: 4, name: "Yuki Tanaka", course: "Data Structures", status: "Active", warnings: 0, avatar: "YT", integrity: "100%" }
  ]);

  useEffect(() => {
    let interval = null;
    if (ccEvent === "normal") {
      setCcCandidates(prev => prev.map(c => ({ ...c, warnings: 0, status: "Active", integrity: c.id === 3 ? "98%" : "100%" })));
      interval = setInterval(() => {
        const events = [
          "Candidate Arjun Mehta: Webcam feed synced (100% integrity)",
          "Candidate Yuki Tanaka: Code sandbox compiled successfully (JS runtime)",
          "Telemetry Node (Mumbai-01): Average ping stable at 12ms",
          "Candidate Carlos Ray: Answer state auto-saved to cloud database"
        ];
        const randomEvent = events[Math.floor(Math.random() * events.length)];
        const time = new Date().toTimeString().split(' ')[0];
        setCcLogs(prev => [`[${time}] ${randomEvent}`, ...prev.slice(0, 8)]);
      }, 4000);
    } else if (ccEvent === "cheat") {
      setCcCandidates(prev => prev.map(c => {
        if (c.id === 2) return { ...c, warnings: 3, status: "Flagged", integrity: "45%" };
        if (c.id === 3) return { ...c, warnings: 1, status: "Warning", integrity: "85%" };
        return c;
      }));
      interval = setInterval(() => {
        const time = new Date().toTimeString().split(' ')[0];
        const alerts = [
          "[ALERT] Sarah Connor switched tabs! Warning 3/5 sent.",
          "[WARNING] Carlos Ray: Multi-face pattern detected.",
          "[ALERT] Sarah Connor: Gaze deviation > 45°.",
          "Telemetry Monitor: Flagging candidate Sarah Connor to admin dashboard."
        ];
        const randomAlert = alerts[Math.floor(Math.random() * alerts.length)];
        setCcLogs(prev => [`[${time}] ${randomAlert}`, ...prev.slice(0, 8)]);
      }, 3000);
    } else if (ccEvent === "frozen") {
      setCcCandidates(prev => prev.map(c => ({ ...c, status: "Frozen" })));
      const time = new Date().toTimeString().split(' ')[0];
      setCcLogs(prev => [`[${time}] [SYSTEM] All candidate exam sessions frozen by Admin.`, ...prev.slice(0, 8)]);
    }

    return () => clearInterval(interval);
  }, [ccEvent]);

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
      title: "AI Proctoring & Telemetry Feed",
      description: "Continuous face validation, gaze detection, and tab-focus telemetry streamed via websocket loops to flag deviations in real-time.",
      icon: Shield,
      glowColor: "rgba(139, 92, 246, 0.45)",
      badge: "Telemetry-Ready",
      className: "md:col-span-2",
      visualWidget: (
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 w-full p-4 rounded-[24px] group-hover:border-violet-500/20 transition-all min-h-[170px] relative overflow-hidden text-left border ${
          isDarkMode ? "bg-[#0b081e] border-white/[0.04]" : "bg-slate-50 border-slate-200"
        }`}>
          <div className={`flex flex-col items-center justify-center p-3 border rounded-xl relative transition-colors duration-500 ${
            isDarkMode ? "border-white/[0.03] bg-slate-950/40" : "border-slate-200 bg-white shadow-sm"
          }`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,92,252,0.05)_0%,transparent_70%)]" />
            <div className={`w-14 h-14 rounded-full border flex items-center justify-center relative ${
              isDarkMode ? "border-violet-500/25 bg-violet-600/5" : "border-violet-200 bg-violet-50/50"
            }`}>
              <div className="absolute inset-1 border border-dashed border-violet-500/30 rounded-full animate-spin" style={{ animationDuration: '10s' }} />
              <Activity className="text-violet-400 animate-pulse relative z-10" size={16} />
            </div>
            <div className="mt-2 text-center">
              <span className="text-[8px] font-bold text-violet-400 uppercase tracking-widest block">AI Camera Feed</span>
              <span className={`text-[10px] font-medium block mt-0.5 ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
                {calibState === "success" ? "Gaze: 1.2° Centered" : "Scanning Gaze..."}
              </span>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); handleStartCalibration(); }}
              className="mt-2 px-3 py-1 bg-violet-600/80 hover:bg-violet-600 text-white font-bold rounded-lg text-[9px] uppercase tracking-wider transition-colors z-20 shadow-sm"
            >
              {calibState === "calibrating" ? "Calibrating..." : "Calibrate"}
            </button>
          </div>
          <div className={`flex flex-col justify-between p-3 border rounded-xl font-mono text-[9px] h-full overflow-hidden transition-colors duration-500 ${
            isDarkMode ? "border-white/[0.03] bg-slate-950/40 text-slate-400" : "border-slate-200 bg-white text-slate-600 shadow-sm"
          }`}>
            <div className={`text-[8px] font-bold uppercase tracking-widest border-b pb-1.5 mb-1.5 flex justify-between ${
              isDarkMode ? "text-slate-500 border-white/[0.04]" : "text-slate-400 border-slate-100"
            }`}>
              <span>Telemetry Logs</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="space-y-1 overflow-y-auto max-h-[90px] pr-1">
              {socketLogs.slice(0, 4).map((log, idx) => (
                <div key={idx} className={`truncate ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
                  <span className="text-violet-500">›</span> {log.replace(/^\[.*\]\s/, '')}
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: "scoring",
      title: "Score & Penalty Simulator",
      description: "Tweak weights and penalty parameters dynamically to preview student grades automatically.",
      icon: SlidersHorizontal,
      glowColor: "rgba(236, 72, 153, 0.45)",
      badge: "Weights-Core",
      className: "md:col-span-1",
      visualWidget: (
        <div className={`w-full p-4 rounded-[24px] flex flex-col justify-between group-hover:border-fuchsia-500/20 transition-all min-h-[170px] text-left border ${
          isDarkMode ? "bg-[#0b081e] border-white/[0.04]" : "bg-slate-50 border-slate-200"
        }`}>
          <div className="space-y-3">
            <div className="space-y-1">
              <div className={`flex justify-between text-[10px] font-bold uppercase tracking-wide ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                <span>Correct Answer (+{correctWeight})</span>
              </div>
              <input 
                type="range" min={1} max={4} value={correctWeight}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => setCorrectWeight(parseInt(e.target.value))}
                className="w-full accent-fuchsia-500 h-1.5 rounded-lg bg-slate-200 dark:bg-white/10 cursor-pointer"
              />
            </div>
            <div className="space-y-1">
              <div className={`flex justify-between text-[10px] font-bold uppercase tracking-wide ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                <span>Negative Penalty (-{penaltyWeight})</span>
              </div>
              <input 
                type="range" min={0} max={2} value={penaltyWeight}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => setPenaltyWeight(parseInt(e.target.value))}
                className="w-full accent-fuchsia-500 h-1.5 rounded-lg bg-slate-200 dark:bg-white/10 cursor-pointer"
              />
            </div>
          </div>
          <div className={`border-t pt-2 flex justify-between items-center text-[10px] ${
            isDarkMode ? "border-white/[0.04]" : "border-slate-200"
          }`}>
            <span className={isDarkMode ? "text-slate-500" : "text-slate-500"}>Correct: {correctAnswers} | Wrong: {incorrectAnswers}</span>
            <span className="text-fuchsia-400 font-extrabold">{finalScore} Marks</span>
          </div>
        </div>
      )
    },
    {
      id: "sandbox",
      title: "Code Sandbox Compiler",
      description: "Write and execute JavaScript or Python scripts inside an isolated runner node.",
      icon: Terminal,
      glowColor: "rgba(34, 197, 94, 0.45)",
      badge: "Isolated Node",
      className: "md:col-span-1",
      visualWidget: (
        <div className={`w-full p-4 rounded-[24px] flex flex-col justify-between group-hover:border-emerald-500/20 transition-all min-h-[170px] text-left border ${
          isDarkMode ? "bg-[#0b081e] border-white/[0.04]" : "bg-slate-50 border-slate-200"
        }`}>
          <div className="space-y-2">
            <div className={`flex justify-between items-center px-2 py-0.5 rounded-xl border ${
              isDarkMode ? "bg-slate-950 border-white/5" : "bg-slate-200 border-slate-300"
            }`}>
              <span className={`text-[8px] font-bold uppercase tracking-wider ${isDarkMode ? "text-slate-500" : "text-slate-600"}`}>compiler.node</span>
              <select 
                value={sandboxLang} 
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => setSandboxLang(e.target.value)}
                className={`bg-transparent border-none text-[8px] font-bold focus:outline-none ${
                  isDarkMode ? "text-emerald-400" : "text-emerald-600"
                }`}
              >
                <option value="python" className={isDarkMode ? "bg-[#050212] text-white" : "bg-white text-slate-800"}>Python</option>
                <option value="javascript" className={isDarkMode ? "bg-[#050212] text-white" : "bg-white text-slate-800"}>JS</option>
              </select>
            </div>
            <textarea
              value={sandboxCode}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => setSandboxCode(e.target.value)}
              rows={2}
              className={`w-full border rounded-xl p-3 text-[10px] font-mono focus:outline-none resize-none transition-all ${
                isDarkMode ? "bg-[#030014] border-white/10 text-slate-300 focus:border-emerald-500/30" : "bg-white border-slate-200 text-slate-800 focus:border-emerald-500"
              }`}
            />
          </div>
          <div className="space-y-1 mt-1">
            <button 
              onClick={(e) => { e.stopPropagation(); handleRunSandbox(); }}
              disabled={isCompilingSandbox}
              className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[8px] uppercase tracking-widest transition-colors disabled:opacity-50"
            >
              {isCompilingSandbox ? "Executing..." : "Run Sandbox"}
            </button>
            {sandboxOutput && (
              <pre className={`p-1.5 rounded border font-mono text-[8px] truncate text-center ${
                isDarkMode ? "bg-slate-950/80 border-white/5 text-emerald-400" : "bg-slate-100 border-slate-200 text-emerald-600"
              }`}>
                {sandboxOutput.split('\n')[1] || "All Test cases passed."}
              </pre>
            )}
          </div>
        </div>
      )
    },
    {
      id: "stats",
      title: "Interactive Cohort Performance",
      description: "Drill down by department to retrieve student pass rates, exam list metrics, and averages.",
      icon: BarChart3,
      glowColor: "rgba(6, 182, 212, 0.45)",
      badge: "Analytics-Core",
      className: "md:col-span-2",
      visualWidget: (
        <div className={`w-full p-4 rounded-[24px] flex flex-col justify-between group-hover:border-cyan-500/20 transition-all min-h-[170px] text-left border ${
          isDarkMode ? "bg-[#0b081e] border-white/[0.04]" : "bg-slate-50 border-slate-200"
        }`}>
          <div className={`flex gap-1 mb-2 border rounded-full p-0.5 ${isDarkMode ? "bg-slate-950 border-white/5" : "bg-slate-200/50 border-slate-200/60"}`}>
            {["CSE", "ECE", "MECH"].map((dept) => (
              <button
                key={dept}
                onClick={(e) => { e.stopPropagation(); setSelectedDept(dept); }}
                className={`flex-1 py-1.5 rounded-full text-[9.5px] font-extrabold uppercase transition-all duration-300 border ${
                  selectedDept === dept 
                    ? (isDarkMode ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400" : "bg-white border-slate-200 text-cyan-600 shadow-sm shadow-slate-100") 
                    : (isDarkMode ? "bg-transparent border-transparent text-slate-500 hover:text-slate-300" : "bg-transparent border-transparent text-slate-500 hover:text-slate-800")
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-center py-2">
            <div className={`border-r ${isDarkMode ? "border-white/[0.04]" : "border-slate-200"}`}>
              <span className="text-[8px] text-slate-500 block uppercase font-bold">Candidates</span>
              <span className={`font-bold text-xs mt-1 block ${isDarkMode ? "text-white" : "text-slate-800"}`}>{deptStats[selectedDept].size}</span>
            </div>
            <div className={`border-r ${isDarkMode ? "border-white/[0.04]" : "border-slate-200"}`}>
              <span className="text-[8px] text-slate-500 block uppercase font-bold">Class Avg</span>
              <span className="text-cyan-500 font-bold text-xs mt-1 block">{deptStats[selectedDept].avg}</span>
            </div>
            <div>
              <span className="text-[8px] text-slate-500 block uppercase font-bold">Integrity Pass</span>
              <span className="text-emerald-500 font-bold text-xs mt-1 block">{deptStats[selectedDept].passRate}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "connectors",
      title: "API Sync Integration",
      description: "Hover over components to synchronize Moodle API, Canvas LTI, Slack alerts, or GSuite feeds.",
      icon: Layers,
      glowColor: "rgba(249, 115, 22, 0.45)",
      badge: "LTI-Compatible",
      className: "md:col-span-1",
      visualWidget: (
        <div className={`w-full p-4 rounded-[24px] flex flex-col justify-between group-hover:border-orange-500/20 transition-all min-h-[170px] text-left border ${
          isDarkMode ? "bg-[#0b081e] border-white/[0.04]" : "bg-slate-50 border-slate-200"
        }`}>
          <div className="grid grid-cols-2 gap-2 my-auto">
            {["Slack", "Canvas LTI", "Moodle", "GSuite Sync"].map((app) => (
              <div 
                key={app}
                onClick={(e) => e.stopPropagation()}
                onMouseEnter={() => setActiveConn(app)}
                onMouseLeave={() => setActiveConn(null)}
                className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                  activeConn === app 
                    ? "bg-orange-600/10 border-orange-500/30 text-orange-500" 
                    : (isDarkMode ? "bg-slate-950 border-white/5 text-slate-400" : "bg-white border-slate-200 text-slate-500 shadow-sm")
                }`}
              >
                <span className="text-[9px] font-bold block truncate">{app}</span>
                <span className="text-[7px] uppercase tracking-wider block mt-0.5 text-slate-500 truncate">
                  {activeConn === app ? "Connected" : "Offline"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: "ingest",
      title: "Bulk CSV Ingest Schema",
      description: "Auto-maps departments and parses spreadsheets with smart cell corrections instantly.",
      icon: UploadCloud,
      glowColor: "rgba(16, 185, 129, 0.45)",
      badge: "Excel-Core",
      className: "md:col-span-2",
      visualWidget: (
        <div className={`w-full p-4 rounded-[24px] flex flex-col justify-between group-hover:border-emerald-500/20 transition-all min-h-[170px] text-left border ${
          isDarkMode ? "bg-[#0b081e] border-white/[0.04]" : "bg-slate-50 border-slate-200"
        }`}>
          <div className={`flex gap-1 mb-2 border p-0.5 rounded-full ${isDarkMode ? "bg-slate-950 border-white/5" : "bg-slate-200/50 border-slate-200/60"}`}>
            <button 
              onClick={(e) => { e.stopPropagation(); setSelectedTemplate("questions"); }}
              className={`flex-1 py-1 rounded-full text-[8.5px] font-extrabold uppercase transition-all duration-300 border ${
                selectedTemplate === "questions" 
                  ? "bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-600/10" 
                  : (isDarkMode ? "bg-transparent border-transparent text-slate-500" : "bg-transparent border-transparent text-slate-500")
              }`}
            >
              Questions Schema
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setSelectedTemplate("students"); }}
              className={`flex-1 py-1 rounded-full text-[8.5px] font-extrabold uppercase transition-all duration-300 border ${
                selectedTemplate === "students" 
                  ? "bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-600/10" 
                  : (isDarkMode ? "bg-transparent border-transparent text-slate-500" : "bg-transparent border-transparent text-slate-500")
              }`}
            >
              Students Schema
            </button>
          </div>
          <textarea
            readOnly
            onClick={(e) => e.stopPropagation()}
            value={templates[selectedTemplate]}
            rows={3}
            className={`w-full border rounded-xl p-2.5 text-[8px] font-mono focus:outline-none resize-none transition-all ${
              isDarkMode ? "bg-[#030014] border-white/10 text-slate-400" : "bg-white border-slate-200 text-slate-700"
            }`}
          />
        </div>
      )
    },
    {
      id: "latency",
      title: "Node Heartbeat Monitor",
      description: "Track direct connection metrics of Postgres database nodes, Redis caches, and web socket servers.",
      icon: Activity,
      glowColor: "rgba(59, 130, 246, 0.45)",
      badge: "System-Online",
      className: "md:col-span-1",
      visualWidget: (
        <div className={`w-full p-4 rounded-[24px] flex flex-col justify-between group-hover:border-blue-500/20 transition-all min-h-[170px] text-left border ${
          isDarkMode ? "bg-[#0b081e] border-white/[0.04]" : "bg-slate-50 border-slate-200"
        }`}>
          <div className="space-y-2 my-auto">
            <div className={`flex justify-between items-center text-[10px] p-2.5 rounded-xl border ${
              isDarkMode ? "bg-slate-950 border-white/5" : "bg-white border-slate-200/50 shadow-sm"
            }`}>
              <span className={`font-semibold ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>PostgreSQL</span>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-500 font-extrabold font-mono">{pingTimes.postgres}</span>
              </div>
            </div>
            <div className={`flex justify-between items-center text-[10px] p-2.5 rounded-xl border ${
              isDarkMode ? "bg-slate-950 border-white/5" : "bg-white border-slate-200/50 shadow-sm"
            }`}>
              <span className={`font-semibold ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>Redis Cache</span>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-500 font-extrabold font-mono">{pingTimes.redis}</span>
              </div>
            </div>
            <div className={`flex justify-between items-center text-[10px] p-2.5 rounded-xl border ${
              isDarkMode ? "bg-slate-950 border-white/5" : "bg-white border-slate-200/50 shadow-sm"
            }`}>
              <span className={`font-semibold ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>Sockets Heartbeat</span>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-500 font-extrabold font-mono">{pingTimes.socket}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); triggerHealthRefresh(); }}
            className={`w-full py-1.5 border font-bold rounded-lg text-[8px] uppercase tracking-widest transition-colors ${
              isDarkMode ? "bg-slate-900 border-white/10 text-white hover:bg-slate-800" : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
            }`}
          >
            {healthStatus === "REFRESHING" ? "Querying..." : "Ping Nodes"}
          </button>
        </div>
      )
    },
    {
      id: "helpdesk",
      title: "AI Helpdesk Chatbot",
      description: "Ask natural language questions about test setups, CSV imports, or AI webcam parameters.",
      icon: MessageSquare,
      glowColor: "rgba(168, 85, 247, 0.45)",
      badge: "AI-Companion",
      className: "md:col-span-1",
      visualWidget: (
        <div className={`w-full p-4 rounded-[24px] flex flex-col justify-between group-hover:border-purple-500/20 transition-all min-h-[170px] text-left border ${
          isDarkMode ? "bg-[#0b081e] border-white/[0.04]" : "bg-slate-50 border-slate-200"
        }`}>
          <div className={`border rounded-xl p-2.5 h-20 overflow-y-auto space-y-1.5 text-[8px] transition-all ${
            isDarkMode ? "bg-[#030014] border-white/5" : "bg-white border-slate-200 shadow-inner"
          }`}>
            {chatLogs.map((msg, idx) => (
              <div key={idx} className={msg.sender === "You" ? "text-right" : "text-left"}>
                <span className="text-slate-500 block text-[6.5px] uppercase font-bold">{msg.sender}</span>
                <p className={`mt-0.5 inline-block px-2.5 py-1 rounded-lg max-w-[85%] text-[8px] ${
                  isDarkMode ? "bg-white/5 text-white" : "bg-slate-100 text-slate-800"
                }`}>{msg.text}</p>
              </div>
            ))}
          </div>
          <form onSubmit={(e) => { e.stopPropagation(); handleSendChat(e); }} className="flex gap-1.5 mt-2">
            <input 
              type="text" 
              value={chatInput}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask AI..."
              className={`flex-1 border rounded-xl px-3.5 py-2 text-[10px] focus:outline-none transition-all ${
                isDarkMode ? "bg-slate-950 border-white/10 text-white focus:border-purple-500" : "bg-white border-slate-300 text-slate-800 focus:border-purple-500"
              }`}
            />
            <button type="submit" className="p-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-all shadow-md shadow-purple-600/15 flex items-center justify-center">
              <Send size={10} />
            </button>
          </form>
        </div>
      )
    },
    {
      id: "timed",
      title: "Timed Session Hard Lock",
      description: "Auto-save active test inputs and enforce strict session countdown submissions.",
      icon: Clock,
      glowColor: "rgba(239, 68, 68, 0.45)",
      badge: "Fail-Safe",
      className: "md:col-span-1",
      visualWidget: (
        <div className={`w-full p-4 rounded-[24px] flex flex-col justify-between group-hover:border-red-500/20 transition-all min-h-[170px] text-left border ${
          isDarkMode ? "bg-[#0b081e] border-white/[0.04]" : "bg-slate-50 border-slate-200"
        }`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5 text-red-500 animate-pulse">
              <Clock size={12} />
              <span className="text-[10px] font-bold font-mono">{formatTime(secondsLeft)}</span>
            </div>
            <span className="text-[8px] text-slate-500 uppercase tracking-widest font-extrabold">Active Limit</span>
          </div>
          <div className="space-y-2 mt-2">
            <input 
              type="range" min={0} max={100} value={timelineVal}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => setTimelineVal(parseInt(e.target.value))}
              className="w-full accent-red-500 h-1.5 rounded-lg bg-slate-200 dark:bg-white/10 cursor-pointer"
            />
            <div className="space-y-0.5">
              <h4 className="text-[9px] font-bold text-red-500 uppercase tracking-wider">{getTimelineState().t}</h4>
              <p className={`text-[8px] leading-normal line-clamp-1 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>{getTimelineState().d}</p>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-500 selection:bg-violet-600/30 selection:text-violet-200 overflow-x-hidden relative font-sans ${
      isDarkMode ? "bg-[#02000A] text-slate-100" : "bg-[#f8f9fc] text-slate-900"
    }`}>
      
      {/* Global CSS style overrides for premium dashboard features */}
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.25; transform: scale(1); filter: blur(100px); }
          50% { opacity: 0.45; transform: scale(1.1); filter: blur(120px); }
        }
        @keyframes drift-blob-1 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(120px, -80px) scale(1.1); }
          66% { transform: translate(-60px, 100px) scale(0.95); }
        }
        @keyframes drift-blob-2 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(-100px, 120px) scale(1.15); }
        }
        @keyframes drift-blob-3 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          40% { transform: translate(80px, 150px) scale(0.9); }
        }
        .blob-violet {
          animation: drift-blob-1 18s ease-in-out infinite;
          background: radial-gradient(circle, rgba(124, 92, 252, 0.22) 0%, transparent 70%);
        }
        .blob-fuchsia {
          animation: drift-blob-2 22s ease-in-out infinite;
          background: radial-gradient(circle, rgba(236, 72, 153, 0.18) 0%, transparent 70%);
        }
        .blob-cyan {
          animation: drift-blob-3 20s ease-in-out infinite;
          background: radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, transparent 70%);
        }
        .glow-radial-1 {
          position: absolute;
          background: radial-gradient(circle, rgba(124, 92, 252, 0.3) 0%, transparent 70%);
          animation: pulse-glow 9s ease-in-out infinite;
        }
        .glass-card-wow {
          background: ${isDarkMode ? "rgba(10, 8, 20, 0.7)" : "rgba(255, 255, 255, 0.75)"};
          backdrop-filter: blur(24px);
          border: 1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.08)"};
          box-shadow: ${isDarkMode 
            ? "0 30px 60px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255,255,255,0.05)" 
            : "0 20px 40px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255,255,255,0.8)"};
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
      <div className={`absolute inset-0 bg-[size:5rem_5rem] pointer-events-none transition-opacity duration-500 -z-10 ${
        isDarkMode 
          ? "bg-[linear-gradient(to_right,#2a1f4d_1px,transparent_1px),linear-gradient(to_bottom,#2a1f4d_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.22]"
          : "bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.6]"
      }`} />
      
      {/* Background Neon Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 transition-opacity duration-500" style={{ opacity: isDarkMode ? 1 : 0.45 }}>
        <div className="absolute w-[800px] h-[600px] rounded-full blur-[130px] blob-violet top-[-100px] left-[15%]" />
        <div className="absolute w-[700px] h-[500px] rounded-full blur-[140px] blob-fuchsia top-[20%] right-[10%]" />
        <div className="absolute w-[900px] h-[600px] rounded-full blur-[150px] blob-cyan bottom-[10%] left-[20%]" />
      </div>

      {/* Navigation Header */}
      <nav className={`fixed top-4 left-1/2 -translate-x-1/2 w-[92%] max-w-7xl h-16 rounded-full border z-50 flex items-center justify-between px-8 transition-all duration-500 ${
        isDarkMode 
          ? "bg-[#02000A]/70 border-white/[0.08] backdrop-blur-xl text-white shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]" 
          : "bg-white/80 border-slate-200/80 backdrop-blur-xl text-slate-900 shadow-[0_8px_32px_0_rgba(148,163,184,0.1)]"
      }`}>
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-500 via-violet-600 to-fuchsia-500 rounded-lg flex items-center justify-center font-black text-white text-sm shadow-md shadow-violet-500/25 group-hover:scale-105 transition-transform">
            SB
          </div>
          <span className={`text-lg font-bold tracking-tight transition-colors ${isDarkMode ? "text-white" : "text-slate-900"}`}>
            Skill<span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent font-extrabold">brix</span>
          </span>
        </Link>

        <div className={`hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider transition-colors ${
          isDarkMode ? "text-slate-400" : "text-slate-600"
        }`}>
          <a href="#proctor-calibration" className={`transition-colors ${isDarkMode ? "hover:text-white" : "hover:text-slate-900"}`}>Proctoring</a>
          <a href="#code-sandbox" className={`transition-colors ${isDarkMode ? "hover:text-white" : "hover:text-slate-900"}`}>Sandbox</a>
          <a href="#cohort-map" className={`transition-colors ${isDarkMode ? "hover:text-white" : "hover:text-slate-900"}`}>Analytics</a>
          <a href="#helpdesk-chat" className={`transition-colors ${isDarkMode ? "hover:text-white" : "hover:text-slate-900"}`}>AI Support</a>
        </div>

        <div className="flex items-center gap-3.5">
          {/* Theme Toggle */}
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-full border transition-all duration-300 ${
              isDarkMode 
                ? "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10" 
                : "bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            }`}
            aria-label="Toggle Theme"
          >
            {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          <Link to="/login" className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
            isDarkMode ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-950"
          }`}>
            Login
          </Link>
          <Link to="/login" className="px-5 py-2.5 text-xs font-black uppercase tracking-widest bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-full shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shimmer-btn">
            Launch Portal
          </Link>
        </div>
      </nav>

      {/* Hero Header */}
      <header className="pt-48 pb-20 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border transition-all duration-500 text-[10px] font-black uppercase tracking-widest mb-6 shadow-inner ${
          isDarkMode ? "border-violet-500/20 bg-violet-500/5 text-violet-300" : "border-violet-200 bg-violet-100/50 text-violet-700"
        }`}>
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-ping" />
          The Advanced Assessment Architecture
        </div>

        <h1 className={`text-4xl md:text-7xl font-bold tracking-tight leading-[1.08] max-w-5xl mb-6 transition-colors duration-500 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
          The <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent font-extrabold">Futuristic Standard</span><br className="hidden md:block" /> for Online Examinations
        </h1>

        <p className={`text-sm md:text-base max-w-2xl mb-10 leading-relaxed font-medium transition-colors duration-500 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
          Designed for maximum scale, flawless integrity, and extreme speed. Bulk import 2,000+ questions in seconds, track student activity in real-time, and auto-grade responses with custom scoring frameworks.
        </p>

        <div className="flex flex-row justify-center gap-4 mb-20 relative z-20">
          <a href="#proctor-calibration" className="px-6 py-3.5 bg-gradient-to-r from-violet-600 via-violet-500 to-fuchsia-600 text-white font-extrabold rounded-full shadow-xl shadow-violet-600/30 hover:shadow-violet-600/55 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 shimmer-btn text-xs uppercase tracking-wider">
            Explore Features ⚡
          </a>
          <a href="#scoring-simulator" className={`px-6 py-3.5 border rounded-full font-bold transition-all duration-200 flex items-center justify-center gap-2 text-xs uppercase tracking-wider ${
            isDarkMode 
              ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white" 
              : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
          }`}>
            Launch Demo
          </a>
        </div>
      </header>

      {/* Bento Grid Platform Features */}
      <section id="features" className={`py-24 px-6 md:px-12 max-w-7xl mx-auto relative z-20 border-t transition-colors duration-500 ${
        isDarkMode ? "border-white/[0.04]" : "border-slate-200"
      }`}>
        <div className="text-center max-w-2xl mx-auto mb-20">
          <div className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-3">Enterprise Core</div>
          <h2 className={`text-3xl md:text-5xl font-black leading-tight transition-colors duration-500 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
            Designed for scale, reliability, and absolute security
          </h2>
          <p className={`text-sm md:text-base mt-4 max-w-xl mx-auto transition-colors duration-500 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>Click on any card to zoom in and check its visual interface details.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8" style={{ transformStyle: "preserve-3d" }}>
          {featureCards.map((card, idx) => {
            const Icon = card.icon;
            
            // Map bento card ID to the corresponding anchor ID expected by the navigation menu links
            let sectionId = "";
            if (card.id === "proctor") sectionId = "proctor-calibration";
            else if (card.id === "scoring") sectionId = "scoring-simulator";
            else if (card.id === "sandbox") sectionId = "code-sandbox";
            else if (card.id === "stats") sectionId = "cohort-map";
            else if (card.id === "connectors") sectionId = "api-integrations";
            else if (card.id === "helpdesk") sectionId = "helpdesk-chat";
            else if (card.id === "timed") sectionId = "session-timeline";

            return (
              <PremiumBentoCard 
                key={card.id}
                id={sectionId}
                isDarkMode={isDarkMode}
                onClick={() => setSelectedCard(card)}
                glowColor={card.glowColor}
                className={card.className || ""}
              >
                <div className="p-6 md:p-8 h-full flex flex-col justify-between gap-6" style={{ transformStyle: "preserve-3d" }}>
                  <div className="space-y-4" style={{ transform: "translateZ(30px)" }}>
                    <div className="flex justify-between items-start">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                        isDarkMode 
                          ? "bg-white/[0.03] border border-white/[0.05] text-violet-400" 
                          : "bg-slate-100 border border-slate-200/60 text-violet-600"
                      }`} style={{ transform: "translateZ(15px)" }}>
                        <Icon size={22} />
                      </div>
                      <span className={`px-2.5 py-0.5 rounded border text-[9px] font-bold uppercase tracking-widest transition-all duration-500 ${
                        isDarkMode ? "bg-white/5 border-white/10 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-600"
                      }`} style={{ transform: "translateZ(10px)" }}>
                        {card.badge}
                      </span>
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold mb-2 transition-colors duration-500 ${isDarkMode ? "text-white" : "text-slate-900"}`} style={{ transform: "translateZ(20px)" }}>{card.title}</h3>
                      <p className={`text-sm leading-relaxed font-normal transition-colors duration-500 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`} style={{ transform: "translateZ(10px)" }}>{card.description}</p>
                    </div>
                  </div>

                  {/* Embedded Visual Widget */}
                  <div className="mt-auto" style={{ transform: "translateZ(40px)", transformStyle: "preserve-3d" }}>
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
          <div className={`w-full max-w-lg glass-card-wow rounded-3xl p-6 md:p-8 relative z-10 transform scale-100 transition-all duration-300 border ${
            isDarkMode ? "border-white/10" : "border-slate-200"
          }`}>
            
            {/* Close */}
            <button 
              onClick={() => setSelectedCard(null)}
              className={`absolute top-5 right-5 p-2 rounded-full transition-colors focus:outline-none ${
                isDarkMode ? "bg-white/5 border border-white/10 text-slate-400 hover:text-white" : "bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900"
              }`}
            >
              <X size={16} />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3.5 mb-6">
              <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                {React.createElement(selectedCard.icon, { size: 20 })}
              </div>
              <div>
                <h3 className={`text-lg font-black transition-colors ${isDarkMode ? "text-white" : "text-slate-900"}`}>{selectedCard.title}</h3>
                <p className={`text-xs transition-colors ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Deep Integration Mockup</p>
              </div>
            </div>

            {/* Live Visual */}
            <div className="mb-6">
              {selectedCard.visualWidget}
            </div>

            <p className={`text-xs md:text-sm leading-relaxed mb-6 font-normal transition-colors ${
              isDarkMode ? "text-slate-400" : "text-slate-600"
            }`}>
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

      {/* ── ASSESSMENT COMMAND CENTER (ULTRA PREMIUM FEATURE) ── */}
      <section className={`py-24 border-t px-6 transition-colors duration-500 relative z-10 ${
        isDarkMode ? "border-white/[0.04] bg-[#02000A]" : "border-slate-200 bg-[#f8f9fc]"
      }`}>
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/5 via-transparent to-cyan-500/5 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-violet-400 uppercase tracking-widest px-3 py-1 rounded-full border border-violet-500/20 bg-violet-500/5">
              Operations Monitor
            </span>
            <h2 className={`text-3xl md:text-5xl font-black mt-4 transition-colors duration-500 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              Assessment Command Center
            </h2>
            <p className={`text-sm mt-3 transition-colors duration-500 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
              Unified real-time proctor control pane. Toggle student behaviors and monitor live events.
            </p>
          </div>

          {/* Mac-style Browser Mockup Wrapper */}
          <div className={`rounded-3xl border p-1.5 backdrop-blur-sm shadow-2xl transition-all duration-500 ${
            isDarkMode 
              ? "bg-[#0b081e]/30 border-white/[0.08] shadow-[#02000a]" 
              : "bg-white/40 border-slate-200/85 shadow-slate-100/60"
          }`}>
            {/* Browser Header Bar */}
            <div className={`flex items-center justify-between px-6 py-4 border-b rounded-t-[22px] ${
              isDarkMode ? "border-white/5 bg-[#070514]/60" : "border-slate-200/60 bg-slate-50/80"
            }`}>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
              </div>
              
              <div className={`flex items-center gap-2 px-3 py-1 rounded-lg text-[9px] font-mono tracking-wider ${
                isDarkMode ? "bg-slate-950/80 text-slate-500" : "bg-slate-200/50 text-slate-500"
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                https://proctor.skillbrix.com/live/session_48a9c
              </div>

              <div className="text-[10px] font-bold tracking-widest text-slate-500 uppercase font-mono hidden sm:block">
                Assessment Command Center
              </div>
            </div>

            {/* Browser Content Area */}
            <div className="p-6 md:p-8">
              {/* Grid Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Column 1 & 2: Candidate Live Feed Cards */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className={`text-sm font-bold uppercase tracking-wider ${isDarkMode ? "text-slate-400" : "text-slate-700"}`}>
                      Candidate Grid
                    </h3>
                    <span className="text-xs text-slate-500">4 Candidates Active</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ccCandidates.map((candidate) => {
                      const isFlagged = candidate.status === "Flagged";
                      const isWarning = candidate.status === "Warning";
                      const isFrozen = candidate.status === "Frozen";
                      
                      return (
                        <div 
                          key={candidate.id} 
                          className={`p-5 rounded-[24px] border transition-all duration-300 relative overflow-hidden ${
                            isFrozen 
                              ? (isDarkMode ? "bg-cyan-950/20 border-cyan-500/30" : "bg-cyan-50/50 border-cyan-200")
                              : isFlagged
                                ? (isDarkMode ? "bg-red-950/20 border-red-500/30 animate-pulse" : "bg-red-50/50 border-red-200")
                                : isWarning
                                  ? (isDarkMode ? "bg-amber-950/20 border-amber-500/30" : "bg-amber-50/50 border-amber-200")
                                  : (isDarkMode ? "bg-slate-900/40 border-white/[0.04]" : "bg-white border-slate-200 shadow-sm shadow-slate-100")
                          }`}
                        >
                          {/* Frozen Overlay */}
                          {isFrozen && (
                            <div className="absolute inset-0 bg-[#02000a]/20 backdrop-blur-[1px] flex items-center justify-center z-20">
                              <span className="bg-cyan-500 text-white font-extrabold text-[9px] uppercase tracking-widest px-3 py-1 rounded-full shadow-md animate-pulse">
                                Session Frozen
                              </span>
                            </div>
                          )}

                          {/* Header row */}
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shadow-sm ${
                                isFlagged 
                                  ? "bg-red-500/10 text-red-500 border border-red-500/20"
                                  : "bg-violet-600/10 text-violet-500 border border-violet-500/20"
                              }`}>
                                {candidate.avatar}
                              </div>
                              <div>
                                <h4 className={`text-xs font-bold transition-colors ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                                  {candidate.name}
                                </h4>
                                <p className="text-[10px] text-slate-500">{candidate.course}</p>
                              </div>
                            </div>

                            {/* Status tag */}
                            <span className={`text-[8px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border ${
                              isFrozen
                                ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                                : isFlagged
                                  ? "bg-red-500/10 border-red-500/20 text-red-400 animate-pulse"
                                  : isWarning
                                    ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            }`}>
                              {candidate.status}
                            </span>
                          </div>

                          {/* Mock Webcam Frame */}
                          <div className={`h-24 rounded-xl border relative overflow-hidden flex flex-col items-center justify-center ${
                            isDarkMode ? "bg-slate-955/60 border-white/5" : "bg-slate-100 border-slate-200"
                          }`}>
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,92,252,0.03)_0%,transparent_70%)]" />
                            <div className={`w-8 h-8 rounded-full border flex items-center justify-center relative ${
                              isFlagged 
                                ? "border-red-500/30 bg-red-500/5 text-red-400" 
                                : "border-violet-500/25 bg-violet-600/5 text-violet-400"
                            }`}>
                              <Video size={12} className={isFlagged ? "animate-pulse" : ""} />
                            </div>
                            <span className={`text-[7.5px] font-mono mt-1.5 ${isFlagged ? "text-red-400 font-bold" : "text-slate-500"}`}>
                              {isFlagged ? "Webcam Flagged - Gaze Left" : "Webcam Feed: Operational"}
                            </span>

                            {/* Scanlines indicator */}
                            <div className="absolute top-1 left-2 flex items-center gap-1">
                              <span className={`w-1.5 h-1.5 rounded-full animate-ping ${isFlagged ? "bg-red-500" : "bg-emerald-500"}`} />
                              <span className={`text-[6.5px] uppercase font-bold tracking-widest ${isFlagged ? "text-red-400" : "text-slate-400"}`}>
                                {isFlagged ? "ALERT" : "LIVE"}
                              </span>
                            </div>
                          </div>

                          {/* Integrity score progress bar */}
                          <div className="mt-3.5 space-y-1">
                            <div className="flex justify-between text-[8.5px] font-bold text-slate-500 uppercase">
                              <span>Integrity Metric</span>
                              <span className={isFlagged ? "text-red-400" : "text-slate-300"}>{candidate.integrity}</span>
                            </div>
                            <div className={`h-1.5 rounded-full w-full ${isDarkMode ? "bg-white/5" : "bg-slate-200"}`}>
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  isFlagged ? "bg-red-500" : isWarning ? "bg-amber-500" : "bg-emerald-500"
                                }`} 
                                style={{ width: candidate.integrity }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Column 3: Control Panel & Live Logs */}
                <div className="lg:col-span-1 space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className={`text-sm font-bold uppercase tracking-wider ${isDarkMode ? "text-slate-400" : "text-slate-700"}`}>
                      Controller Node
                    </h3>
                  </div>

                  <div className={`p-6 rounded-[24px] border space-y-5 ${
                    isDarkMode ? "bg-[#0b081e] border-white/[0.04]" : "bg-slate-50 border-slate-200"
                  }`}>
                    {/* Event Select Buttons */}
                    <div className="space-y-2">
                      <span className="text-[8px] text-slate-500 block uppercase font-bold tracking-widest">
                        Select Simulation Event
                      </span>
                      
                      <div className={`flex flex-col gap-1.5 p-1 rounded-2xl ${isDarkMode ? "bg-slate-950/60 border border-white/5" : "bg-slate-200/50 border border-slate-200"}`}>
                        <button 
                          onClick={() => setCcEvent("normal")}
                          className={`py-2 px-3 rounded-xl text-[9px] font-extrabold uppercase transition-all text-left flex items-center justify-between border ${
                            ccEvent === "normal" 
                              ? "bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-600/10" 
                              : "bg-transparent border-transparent text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          <span>Normal Class flow</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        </button>
                        
                        <button 
                          onClick={() => setCcEvent("cheat")}
                          className={`py-2 px-3 rounded-xl text-[9px] font-extrabold uppercase transition-all text-left flex items-center justify-between border ${
                            ccEvent === "cheat" 
                              ? "bg-red-600 border-red-500 text-white shadow-md shadow-red-600/10 animate-pulse" 
                              : "bg-transparent border-transparent text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          <span>Simulate Cheating Alerts</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                        </button>

                        <button 
                          onClick={() => setCcEvent("frozen")}
                          className={`py-2 px-3 rounded-xl text-[9px] font-extrabold uppercase transition-all text-left flex items-center justify-between border ${
                            ccEvent === "frozen" 
                              ? "bg-cyan-600 border-cyan-500 text-white shadow-md shadow-cyan-600/10" 
                              : "bg-transparent border-transparent text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          <span>Freeze Exam Session</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        </button>
                      </div>
                    </div>

                    {/* Live Output Console */}
                    <div className="space-y-2">
                      <span className="text-[8px] text-slate-500 block uppercase font-bold tracking-widest">
                        Edge Log Feed (Mumbai-01)
                      </span>

                      <div className={`p-4 rounded-2xl h-36 font-mono text-[9px] overflow-y-auto space-y-1.5 transition-all ${
                        isDarkMode ? "bg-slate-950 text-slate-400 border border-white/5" : "bg-white text-slate-600 border border-slate-200 shadow-inner"
                      }`}>
                        {ccLogs.map((log, idx) => {
                          const isAlert = log.includes("[ALERT]");
                          const isWarn = log.includes("[WARNING]");
                          const isSys = log.includes("[SYSTEM]");
                          const isAnn = log.includes("[BROADCAST]");
                          
                          return (
                            <div 
                              key={idx} 
                              className={`leading-normal ${
                                isAlert 
                                  ? "text-red-400 font-bold" 
                                  : isWarn
                                    ? "text-amber-400"
                                    : isSys
                                      ? "text-cyan-400"
                                      : isAnn
                                        ? "text-fuchsia-400 font-bold"
                                        : "text-slate-400"
                              }`}
                            >
                              <span className="text-violet-500/80">›</span> {log}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Broadcast Msg Announcement Form */}
                    <div className="space-y-2">
                      <span className="text-[8px] text-slate-500 block uppercase font-bold tracking-widest">
                        Broadcast Announcement
                      </span>

                      <div className="flex gap-1.5">
                        <input 
                          type="text"
                          placeholder="Send alert message to candidates..."
                          value={broadcastMsg}
                          onChange={(e) => setBroadcastMsg(e.target.value)}
                          className={`flex-1 border rounded-xl px-3 py-2 text-[10px] focus:outline-none transition-all ${
                            isDarkMode ? "bg-slate-950 border-white/10 text-white focus:border-violet-500" : "bg-white border-slate-200 text-slate-800 focus:border-violet-500 shadow-sm"
                          }`}
                        />
                        <button 
                          onClick={() => {
                            if (!broadcastMsg.trim()) return;
                            const time = new Date().toTimeString().split(' ')[0];
                            setCcLogs(prev => [`[${time}] [BROADCAST] Alert: "${broadcastMsg}"`, ...prev.slice(0, 8)]);
                            setBroadcastMsg("");
                            toast.success("Broadcast announcement sent!");
                          }}
                          className="px-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl flex items-center justify-center shadow-md shadow-violet-600/10"
                        >
                          <Send size={10} />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className={`py-24 border-t px-6 transition-colors duration-500 ${isDarkMode ? "border-white/[0.04] bg-slate-950/20" : "border-slate-200 bg-slate-100/10"}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-16">
            <div className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-3">Educator Feedback</div>
            <h2 className={`text-3xl md:text-5xl font-black transition-colors duration-500 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              Trusted in classrooms and admission cells
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className={`p-8 rounded-2xl border transition-all duration-500 ${isDarkMode ? "border-white/[0.04] bg-slate-900/10" : "border-slate-200 bg-white shadow-sm"}`}>
              <div className="flex gap-1 text-yellow-500 mb-4">
                <Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" />
              </div>
              <p className={`text-sm leading-relaxed mb-6 font-medium italic transition-colors duration-500 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                "We switched to Skillbrix and went from days of manually processing exam papers to instant results distribution. Tremendous time-saver."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-violet-600 text-white font-bold flex items-center justify-center text-xs">RK</div>
                <div>
                  <div className={`text-sm font-semibold transition-colors duration-500 ${isDarkMode ? "text-white" : "text-slate-900"}`}>Rajesh Kumar</div>
                  <div className="text-xs text-slate-500">VIT Hyderabad</div>
                </div>
              </div>
            </div>

            <div className={`p-8 rounded-2xl border transition-all duration-500 ${isDarkMode ? "border-white/[0.04] bg-slate-900/10" : "border-slate-200 bg-white shadow-sm"}`}>
              <div className="flex gap-1 text-yellow-500 mb-4">
                <Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" />
              </div>
              <p className={`text-sm leading-relaxed mb-6 font-medium italic transition-colors duration-500 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                "Uploading 2,000 students at a time with department auto-mapping is incredibly fast. The database handles bulk inserts seamlessly."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-fuchsia-600 text-white font-bold flex items-center justify-center text-xs">SP</div>
                <div>
                  <div className={`text-sm font-semibold transition-colors duration-500 ${isDarkMode ? "text-white" : "text-slate-900"}`}>Sunita Patel</div>
                  <div className="text-xs text-slate-500">JNTU Admissions</div>
                </div>
              </div>
            </div>

            <div className={`p-8 rounded-2xl border transition-all duration-500 ${isDarkMode ? "border-white/[0.04] bg-slate-900/10" : "border-slate-200 bg-white shadow-sm"}`}>
              <div className="flex gap-1 text-yellow-500 mb-4">
                <Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" />
              </div>
              <p className={`text-sm leading-relaxed mb-6 font-medium italic transition-colors duration-500 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                "We upload JEE and GATE mocks with complex negative marking structures. Handles scoring options without errors."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-xs">AM</div>
                <div>
                  <div className={`text-sm font-semibold transition-colors duration-500 ${isDarkMode ? "text-white" : "text-slate-900"}`}>Arjun Mehta</div>
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
          <h2 className={`text-3xl md:text-5xl font-black transition-colors duration-500 ${isDarkMode ? "text-white" : "text-slate-900"}`}>Frequently Asked</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx}
              className={`border rounded-xl overflow-hidden transition-all duration-500 ${
                isDarkMode ? "border-white/[0.04] bg-slate-900/10" : "border-slate-200 bg-white shadow-sm"
              }`}
            >
              <button 
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className={`w-full px-6 py-5 flex items-center justify-between text-left font-bold text-sm transition-colors duration-500 ${
                  isDarkMode ? "text-white" : "text-slate-900"
                }`}
              >
                <span>{faq.q}</span>
                <ChevronDown 
                  size={16} 
                  className={`text-slate-400 transition-transform duration-300 ${activeFaq === idx ? "rotate-180 text-violet-500" : ""}`} 
                />
              </button>
              <div 
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  activeFaq === idx 
                    ? (isDarkMode ? "max-h-40 border-t border-white/[0.04] bg-white/[0.01]" : "max-h-40 border-t border-slate-200 bg-slate-50/50") 
                    : "max-h-0"
                }`}
              >
                <div className={`p-6 text-xs md:text-sm leading-relaxed font-normal transition-colors duration-500 ${
                  isDarkMode ? "text-slate-400" : "text-slate-600"
                }`}>
                  {faq.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Box */}
      <section className="py-20 px-6 md:px-12 max-w-5xl mx-auto relative z-10">
        <div className={`p-12 md:p-20 rounded-3xl border text-center shadow-2xl relative transition-all duration-500 ${
          isDarkMode ? "border-violet-500/20 bg-[#050212]" : "border-slate-200 bg-white shadow-md shadow-slate-100"
        }`}>
          <div className="absolute inset-0 bg-violet-600/5 blur-3xl rounded-3xl -z-10 animate-pulse" />
          <h2 className={`text-3xl md:text-5xl font-black mb-4 transition-colors duration-500 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
            Ready to upgrade your assessments?
          </h2>
          <p className={`max-w-xl mx-auto mb-8 text-sm transition-colors duration-500 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
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
      <footer className={`border-t py-12 px-6 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 transition-colors duration-500 ${
        isDarkMode ? "border-white/[0.04]" : "border-slate-200"
      }`}>
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center font-black text-white text-xs shadow-md shadow-violet-500/25">
              SB
            </div>
            <span className={`font-extrabold tracking-tight transition-colors duration-500 ${isDarkMode ? "text-white" : "text-slate-900"}`}>Skillbrix Solutions</span>
          </div>
          <p className="text-xs text-slate-500">© 2026 Skillbrix Solutions. All rights reserved.</p>
        </div>

        <div className="flex gap-6 text-xs text-slate-500">
          <button onClick={() => setActiveFooterModal("privacy")} className={`transition-colors focus:outline-none ${isDarkMode ? "text-slate-500 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}>Privacy Policy</button>
          <button onClick={() => setActiveFooterModal("terms")} className={`transition-colors focus:outline-none ${isDarkMode ? "text-slate-500 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}>Terms of Service</button>
          <button onClick={() => setActiveFooterModal("support")} className={`transition-colors focus:outline-none ${isDarkMode ? "text-slate-500 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}>Support</button>
        </div>
      </footer>

      {/* ── FOOTER INFORMATION MODAL ── */}
      {activeFooterModal && (
        <div className="fixed inset-0 bg-[#02000a]/90 backdrop-blur-md z-50 flex items-center justify-center p-6 transition-all duration-300">
          <div className="absolute w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none bg-violet-500/10" />
          
          <div className={`w-full max-w-2xl glass-card-wow rounded-3xl p-8 relative z-10 max-h-[85vh] overflow-y-auto border ${
            isDarkMode ? "border-white/10" : "border-slate-200"
          }`}>
            {/* Close Button */}
            <button 
              onClick={() => setActiveFooterModal(null)}
              className={`absolute top-5 right-5 p-2 rounded-full transition-colors focus:outline-none ${
                isDarkMode ? "bg-white/5 border border-white/10 text-slate-400 hover:text-white" : "bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900"
              }`}
            >
              <X size={16} />
            </button>

            {/* Content */}
            {activeFooterModal === "privacy" && (
              <div className="space-y-4 text-left">
                <h3 className={`text-2xl font-black transition-colors ${isDarkMode ? "text-white" : "text-slate-900"}`}>Privacy Policy</h3>
                <p className={`text-xs font-bold uppercase tracking-wider transition-colors ${isDarkMode ? "text-violet-400" : "text-violet-600"}`}>Effective Date: July 15, 2026</p>
                <div className={`text-sm space-y-3 leading-relaxed font-normal animate-fade-in transition-colors ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
                  <p>
                    Skillbrix Solutions is committed to protecting your academic and telemetry privacy. This policy outlines how candidate verification data is handled during active examination sessions.
                  </p>
                  <h4 className={`font-bold mt-4 transition-colors ${isDarkMode ? "text-white" : "text-slate-900"}`}>1. Local Telemetry Verification</h4>
                  <p>
                    All webcam signals, eye-gaze tracking parameters, and face positions are processed strictly inside the student's browser sandbox using client-side WebAssembly scripts. No raw video feed is uploaded or stored on our servers.
                  </p>
                  <h4 className={`font-bold mt-4 transition-colors ${isDarkMode ? "text-white" : "text-slate-900"}`}>2. WebSocket Security</h4>
                  <p>
                    Integrity status and tab-focus logs are sent over secure WebSocket channels. The telemetry checks are encrypted in-transit and cleared automatically from active session indices within 48 hours after exam commits.
                  </p>
                  <h4 className={`font-bold mt-4 transition-colors ${isDarkMode ? "text-white" : "text-slate-900"}`}>3. Data Compliance</h4>
                  <p>
                    Skillbrix complies with global academic privacy mandates. Candidate data is strictly restricted to department administrators and is never sold or utilized for profiling.
                  </p>
                </div>
              </div>
            )}

            {activeFooterModal === "terms" && (
              <div className="space-y-4 text-left">
                <h3 className={`text-2xl font-black transition-colors ${isDarkMode ? "text-white" : "text-slate-900"}`}>Terms of Service</h3>
                <p className={`text-xs font-bold uppercase tracking-wider transition-colors ${isDarkMode ? "text-violet-400" : "text-violet-600"}`}>Last Updated: July 15, 2026</p>
                <div className={`text-sm space-y-3 leading-relaxed font-normal animate-fade-in transition-colors ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
                  <p>
                    Welcome to Skillbrix. By accessing or conducting assessments on our platform, you agree to these academic integrity terms.
                  </p>
                  <h4 className={`font-bold mt-4 transition-colors ${isDarkMode ? "text-white" : "text-slate-900"}`}>1. Integrity Enforceability</h4>
                  <p>
                    Exams on this portal are proctored. By entering an assessment session, candidates consent to tab-focus locking and screen integrity monitoring.
                  </p>
                  <h4 className={`font-bold mt-4 transition-colors ${isDarkMode ? "text-white" : "text-slate-900"}`}>2. Sandbox Resources</h4>
                  <p>
                    The code execution sandbox supports sandboxed scripts. Abuse or execution of malicious commands will result in instant IP lockout and score nullification.
                  </p>
                  <h4 className={`font-bold mt-4 transition-colors ${isDarkMode ? "text-white" : "text-slate-900"}`}>3. System Commits</h4>
                  <p>
                    Submissions are hard-committed on timer expiry. Any attempt to modify telemetry requests will result in an immediate automatic submit flag.
                  </p>
                </div>
              </div>
            )}

            {activeFooterModal === "support" && (
              <div className="space-y-4 text-left">
                <h3 className={`text-2xl font-black transition-colors ${isDarkMode ? "text-white" : "text-slate-900"}`}>Developer Support Center</h3>
                <p className={`text-xs font-bold uppercase tracking-wider transition-colors ${isDarkMode ? "text-violet-400" : "text-violet-600"}`}>Available 24/7</p>
                <div className={`text-sm space-y-3 leading-relaxed font-normal animate-fade-in transition-colors ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
                  <p>
                    Need assistance setting up schemas or checking database latency nodes? We are here to help.
                  </p>
                  <h4 className={`font-bold mt-4 transition-colors ${isDarkMode ? "text-white" : "text-slate-900"}`}>1. Direct Communication</h4>
                  <p>
                    Reach our technical operations team directly at <span className="text-violet-400 font-bold">support@skillbrix.com</span> for system integrations or LTI keys.
                  </p>
                  <h4 className={`font-bold mt-4 transition-colors ${isDarkMode ? "text-white" : "text-slate-900"}`}>2. Helpdesk Assistant</h4>
                  <p>
                    You can ask quick questions about template schemas, proctor parameters, or database tables directly using the AI chatbot inside the features grid.
                  </p>
                  <h4 className={`font-bold mt-4 transition-colors ${isDarkMode ? "text-white" : "text-slate-900"}`}>3. System Heartbeats</h4>
                  <p>
                    Check live service latencies in the Node Heartbeat card to diagnose Redis or PostgreSQL database network speed drops.
                  </p>
                </div>
              </div>
            )}

            <button 
              onClick={() => setActiveFooterModal(null)}
              className="mt-8 w-full py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-violet-600/20"
            >
              Close Document
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Landing;
