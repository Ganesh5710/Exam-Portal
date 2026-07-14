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
  Check,
  ChevronDown,
  Monitor,
  Lock,
  Zap,
  BarChart4,
  RefreshCw,
  HelpCircle,
  FileSpreadsheet
} from "lucide-react";

export const Landing = () => {
  const [activeTab, setActiveTab] = useState("import");
  const [proctoringScore, setProctoringScore] = useState(98);
  const [activeFaq, setActiveFaq] = useState(null);

  // Auto-pulse the proctoring score to simulate live AI tracking
  useEffect(() => {
    const interval = setInterval(() => {
      setProctoringScore((prev) => {
        const change = Math.random() > 0.5 ? 1 : -1;
        const next = prev + change;
        return next > 100 ? 100 : next < 90 ? 90 : next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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
    <div className="min-h-screen bg-[#030014] text-slate-100 selection:bg-violet-600/30 selection:text-violet-200 overflow-x-hidden relative font-sans">
      
      {/* Background Neon Grid & Orbs */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1a3a_1px,transparent_1px),linear-gradient(to_bottom,#1f1a3a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.25] pointer-events-none" />
      
      <div className="absolute top-[-100px] left-[50%] -translate-x-[50%] w-[1000px] h-[400px] bg-gradient-to-r from-violet-600/20 via-fuchsia-600/20 to-cyan-500/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[30%] left-[-200px] w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-200px] w-[600px] h-[600px] bg-fuchsia-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Floating Interactive Controls */}
      <nav className="fixed top-0 left-0 right-0 h-20 border-b border-white/[0.04] bg-[#030014]/65 backdrop-blur-xl z-50 flex items-center justify-between px-6 md:px-12 transition-all">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-gradient-to-br from-violet-500 via-violet-600 to-fuchsia-500 rounded-xl flex items-center justify-center font-black text-white text-base shadow-lg shadow-violet-500/25 group-hover:scale-105 transition-transform">
            SB
          </div>
          <span className="text-xl font-black tracking-tight text-white">
            Skill<span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">brix</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#demo" className="hover:text-white transition-colors">Interactive Demo</a>
          <a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a>
          <a href="#faqs" className="hover:text-white transition-colors">FAQs</a>
        </div>

        <div className="flex items-center gap-3">
          <Link 
            to="/login" 
            className="px-4.5 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Login
          </Link>
          <Link 
            to="/login" 
            className="px-5 py-2.5 text-sm font-bold bg-gradient-to-r from-violet-600 via-violet-500 to-fuchsia-600 text-white rounded-xl shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
          >
            Launch Portal →
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-40 pb-24 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-violet-500/20 bg-violet-500/5 text-xs font-semibold text-violet-300 uppercase tracking-widest mb-8 animate-fade-in shadow-inner">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-ping" />
          The Next Generation Assessment Platform
        </div>

        <h1 className="text-4xl md:text-8xl font-black tracking-tight leading-[1.05] text-white max-w-5xl mb-8">
          The <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">Advanced Standard</span><br className="hidden md:block" /> for Online Examinations
        </h1>

        <p className="text-base md:text-xl text-slate-400 max-w-3xl mb-12 leading-relaxed font-normal">
          Designed for maximum scale, flawless integrity, and extreme speed. Bulk import 2,000+ questions in seconds, track student activity in real-time, and auto-grade responses with custom scoring frameworks.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-20">
          <Link 
            to="/login" 
            className="px-8 py-4.5 bg-gradient-to-r from-violet-600 via-violet-500 to-fuchsia-600 text-white font-bold rounded-xl shadow-2xl shadow-violet-600/30 hover:shadow-violet-600/50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2"
          >
            Try Free Demo <ArrowRight size={18} />
          </Link>
          <a 
            href="#demo" 
            className="px-8 py-4.5 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-violet-500/30 text-slate-300 hover:text-white font-bold rounded-xl transition-all duration-200"
          >
            ✦ Watch Workflow
          </a>
        </div>

        {/* Hero Interactive Console Mockup */}
        <div id="demo" className="w-full max-w-5xl rounded-2xl border border-white/[0.06] bg-slate-950/40 p-1.5 backdrop-blur-2xl shadow-[0_50px_100px_-15px_rgba(0,0,0,0.8)] relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/5 via-transparent to-fuchsia-600/5 blur-3xl rounded-2xl -z-10" />
          
          {/* Header Bar */}
          <div className="flex items-center justify-between px-5 py-4 bg-slate-900/30 rounded-t-xl border-b border-white/[0.04]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#ef4444]" />
              <span className="w-3 h-3 rounded-full bg-[#eab308]" />
              <span className="w-3 h-3 rounded-full bg-[#22c55e]" />
            </div>
            <div className="text-[11px] text-slate-500 font-mono tracking-wider">skillbrix.solutions/admin/dashboard</div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
              <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Live Connection</span>
            </div>
          </div>

          {/* Interactive tabs */}
          <div className="bg-[#050212]/90 rounded-b-xl p-6 md:p-8 text-left grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex flex-col gap-1.5 md:border-r border-white/[0.04] md:pr-6">
              <button 
                onClick={() => setActiveTab("import")}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                  activeTab === "import" 
                    ? "bg-violet-600/20 text-violet-400 border border-violet-500/20 shadow-lg shadow-violet-500/5" 
                    : "text-slate-400 hover:text-white bg-transparent border border-transparent"
                }`}
              >
                <FileSpreadsheet size={16} /> 01. AI Bulk Import
              </button>
              <button 
                onClick={() => setActiveTab("monitor")}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                  activeTab === "monitor" 
                    ? "bg-violet-600/20 text-violet-400 border border-violet-500/20 shadow-lg shadow-violet-500/5" 
                    : "text-slate-400 hover:text-white bg-transparent border border-transparent"
                }`}
              >
                <Monitor size={16} /> 02. Live Tracking
              </button>
              <button 
                onClick={() => setActiveTab("grading")}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                  activeTab === "grading" 
                    ? "bg-violet-600/20 text-violet-400 border border-violet-500/20 shadow-lg shadow-violet-500/5" 
                    : "text-slate-400 hover:text-white bg-transparent border border-transparent"
                }`}
              >
                <Scale size={16} /> 03. Custom Rules
              </button>
            </div>
            
            <div className="md:col-span-3 space-y-6">
              {activeTab === "import" && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">AI Question Extractor</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Processes up to 2,000+ MCQs in safe database chunks.</p>
                    </div>
                    <span className="text-[10px] bg-violet-500/10 border border-violet-500/20 text-violet-400 font-bold px-2 py-0.5 rounded uppercase">Optimized</span>
                  </div>
                  <div className="p-8 border border-dashed border-white/10 hover:border-violet-500/40 rounded-xl bg-white/[0.01] text-center cursor-pointer transition-all">
                    <Zap className="mx-auto text-violet-400 mb-2 animate-bounce" size={28} />
                    <span className="text-xs font-semibold text-white block">Drop MCQs spreadsheet here</span>
                    <span className="text-[10px] text-slate-500 block mt-1">Accepts .xlsx, .csv, .json (max 50MB)</span>
                  </div>
                  <div className="bg-slate-900/50 border border-white/5 rounded-xl p-4 flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-400" />
                      Auto-detected 6 departments and 1,840 questions.
                    </span>
                    <span className="font-bold text-emerald-400">Ready</span>
                  </div>
                </div>
              )}

              {activeTab === "monitor" && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">WebSocket Proctor Monitor</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Real-time status changes streamed directly from active test screens.</p>
                    </div>
                    <span className="text-[10px] bg-red-500/10 border border-red-500/20 text-red-400 font-bold px-2 py-0.5 rounded uppercase">Proctor Active</span>
                  </div>
                  <div className="bg-slate-900/40 border border-white/5 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs border-b border-white/[0.04] pb-2 text-slate-500 font-semibold">
                      <span>Candidate Name</span>
                      <span>Department</span>
                      <span>Real-time Integrity Status</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">Ajay Krishna</span>
                      <span className="text-slate-400">Data Analytics</span>
                      <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Active ({proctoringScore}%)
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">Nikhil Gupta</span>
                      <span className="text-slate-400">Software Dev</span>
                      <span className="flex items-center gap-1.5 text-yellow-400 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-ping" /> Focus Lost
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">Bharath Krishna</span>
                      <span className="text-slate-400">Python Dev</span>
                      <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Active (100%)
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "grading" && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">Scoring Configurations</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Control negative marking, partial credits, and auto-timing.</p>
                    </div>
                    <span className="text-[10px] bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-bold px-2 py-0.5 rounded uppercase">Live Settings</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4 space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Default Correct Mark</label>
                      <div className="text-lg font-bold text-white">+ 4.00</div>
                    </div>
                    <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4 space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Negative Mark Margin</label>
                      <div className="text-lg font-bold text-red-400">- 1.00</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Trust & Scale Section */}
      <section className="border-y border-white/[0.04] bg-slate-950/40 py-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-1">
            <div className="text-5xl font-black text-white bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">3.2M+</div>
            <div className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Tests Conducted</div>
          </div>
          <div className="space-y-1">
            <div className="text-5xl font-black text-white bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">95.4%</div>
            <div className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Completion Rate</div>
          </div>
          <div className="space-y-1">
            <div className="text-5xl font-black text-white bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">5,000+</div>
            <div className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Institutions Served</div>
          </div>
          <div className="space-y-1">
            <div className="text-5xl font-black text-white bg-gradient-to-r from-emerald-400 to-violet-400 bg-clip-text text-transparent">99.99%</div>
            <div className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Realtime Uptime</div>
          </div>
        </div>
      </section>

      {/* Advanced Features Bento Grid */}
      <section id="features" className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-20">
          <div className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-3">Enterprise Suite</div>
          <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
            Designed for scale, reliability, and security
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: AI Proctoring Signals */}
          <div className="p-8 bg-slate-900/30 border border-white/[0.04] rounded-2xl relative overflow-hidden group hover:border-violet-500/30 transition-all duration-300">
            <div className="absolute top-0 right-0 w-36 h-36 bg-violet-600/5 rounded-full blur-2xl pointer-events-none" />
            <Shield className="text-violet-400 mb-6" size={28} />
            <h3 className="text-lg font-bold text-white mb-2">AI Proctoring Signals</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Get automatic integrity flags with confidence scoring for every student test session. Know if they attempt to change tabs or lose focus.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-violet-500/10 border border-violet-500/20 text-[10px] font-semibold text-violet-300 uppercase">
              Webcam-ready
            </div>
          </div>

          {/* Card 2: Instant Leaderboards */}
          <div className="p-8 bg-slate-900/30 border border-white/[0.04] rounded-2xl relative overflow-hidden group hover:border-cyan-500/30 transition-all duration-300">
            <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-600/5 rounded-full blur-2xl pointer-events-none" />
            <BarChart4 className="text-cyan-400 mb-6" size={28} />
            <h3 className="text-lg font-bold text-white mb-2">Instant Leaderboards</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Publish rank updates and performance indicators the moment submissions are completed. No delay, no manual spreadsheet tallying.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-semibold text-cyan-300 uppercase">
              Auto-Compiled
            </div>
          </div>

          {/* Card 3: Timed Security Sessions */}
          <div className="p-8 bg-slate-900/30 border border-white/[0.04] rounded-2xl relative overflow-hidden group hover:border-fuchsia-500/30 transition-all duration-300">
            <div className="absolute top-0 right-0 w-36 h-36 bg-fuchsia-600/5 rounded-full blur-2xl pointer-events-none" />
            <Lock className="text-fuchsia-400 mb-6" size={28} />
            <h3 className="text-lg font-bold text-white mb-2">Secure Timed Sessions</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Lock down browser focus and set hard thresholds. Exams automatically submit the exact millisecond the session countdown hits zero.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-fuchsia-500/10 border border-fuchsia-500/20 text-[10px] font-semibold text-fuchsia-300 uppercase">
              Auto-Submit
            </div>
          </div>

          {/* Card 4: 2000+ Bulk Import Option (Wide) */}
          <div className="md:col-span-2 p-8 bg-slate-900/30 border border-white/[0.04] rounded-2xl relative overflow-hidden group hover:border-violet-500/30 transition-all duration-300 flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />
            <div>
              <Cpu className="text-violet-400 mb-6" size={28} />
              <h3 className="text-xl font-bold text-white mb-2">Batch Optimized AI MCQ Parser</h3>
              <p className="text-sm text-slate-400 leading-relaxed max-w-xl mb-6">
                Instead of processing records one-by-one which causes gateway timeouts, Skillbrix utilizes chunked parallel inserts to safely commit up to 2,000 questions in 500-question batch intervals.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full border border-violet-500/20 bg-violet-500/5 text-[11px] font-bold text-violet-300 uppercase">Chunked DB Inserts</span>
              <span className="px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-[11px] font-bold text-cyan-300 uppercase">Auto-resolve Departments</span>
            </div>
          </div>

          {/* Card 5: Complete Student Lifecycle Management */}
          <div className="p-8 bg-slate-900/30 border border-white/[0.04] rounded-2xl relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
            <Users className="text-emerald-400 mb-6" size={28} />
            <h3 className="text-lg font-bold text-white mb-2">Clean Student Controls</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Show students on a clean single page without annoying previous/next pagination buttons. Block/unblock credentials instantly.
            </p>
          </div>

        </div>
      </section>

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
                "We switched to Skillbrix and went from days of manually processing physical scripts to instant evaluation. Complete workflow transition."
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
                "Bulk imports with auto-matching database departments works beautifully. Rebrand capabilities made it our custom portal."
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
                <div className="p-6 text-xs md:text-sm text-slate-400 leading-relaxed">
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
              className="px-8 py-4 bg-gradient-to-r from-violet-600 via-violet-500 to-fuchsia-600 text-white font-bold rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
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
