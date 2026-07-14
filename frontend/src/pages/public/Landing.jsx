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
  AlertTriangle
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
    }, 2500);
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
      
      {/* Inject custom styling for advanced floating cards and premium glass borders */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(1deg); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(-1.5deg); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
        .animate-float-1 { animation: float-slow 7s ease-in-out infinite; }
        .animate-float-2 { animation: float-medium 6s ease-in-out infinite 1s; }
        .animate-float-3 { animation: float-fast 5s ease-in-out infinite 0.5s; }
        
        .premium-glass {
          background: rgba(13, 11, 28, 0.45);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
        }
        .glow-orb-purple {
          position: absolute;
          background: radial-gradient(circle, rgba(124, 92, 252, 0.2) 0%, transparent 70%);
          filter: blur(80px);
          animation: pulse-glow 8s ease-in-out infinite;
        }
        .glow-orb-pink {
          position: absolute;
          background: radial-gradient(circle, rgba(244, 63, 94, 0.15) 0%, transparent 70%);
          filter: blur(60px);
          animation: pulse-glow 6s ease-in-out infinite 2s;
        }
      `}</style>

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1a3a_1px,transparent_1px),linear-gradient(to_bottom,#1f1a3a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.25] pointer-events-none" />
      
      {/* Glowing background highlights */}
      <div className="absolute top-[-100px] left-[50%] -translate-x-[50%] w-[1000px] h-[400px] bg-gradient-to-r from-violet-600/20 via-fuchsia-600/20 to-cyan-500/20 rounded-full blur-[140px] pointer-events-none" />

      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 h-20 border-b border-white/[0.04] bg-[#030014]/65 backdrop-blur-xl z-50 flex items-center justify-between px-6 md:px-12">
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

      {/* Hero Section with Floating WOW Cards */}
      <header className="pt-40 pb-28 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-violet-500/20 bg-violet-500/5 text-xs font-semibold text-violet-300 uppercase tracking-widest mb-8 animate-fade-in shadow-inner">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-ping" />
          The Next Generation Assessment Platform
        </div>

        <h1 className="text-4xl md:text-8xl font-black tracking-tight leading-[1.05] text-white max-w-5xl mb-8">
          The <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent font-extrabold">Advanced Standard</span><br className="hidden md:block" /> for Online Examinations
        </h1>

        <p className="text-base md:text-xl text-slate-400 max-w-3xl mb-12 leading-relaxed font-normal">
          Designed for maximum scale, flawless integrity, and extreme speed. Bulk import 2,000+ questions in seconds, track student activity in real-time, and auto-grade responses with custom scoring frameworks.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-24 relative z-20">
          <Link 
            to="/login" 
            className="px-8 py-4.5 bg-gradient-to-r from-violet-600 via-violet-500 to-fuchsia-600 text-white font-bold rounded-xl shadow-2xl shadow-violet-600/35 hover:shadow-violet-600/50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2"
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

        {/* 3D Floating Wow Elements Grid */}
        <div className="w-full max-w-5xl relative mb-28">
          <div className="glow-orb-purple w-96 h-96 -top-20 -left-20 -z-10" />
          <div className="glow-orb-pink w-96 h-96 -bottom-20 -right-20 -z-10" />
          
          {/* Main Visual Centerpiece Card */}
          <div className="w-full rounded-2xl border border-white/[0.06] bg-slate-950/40 p-1.5 backdrop-blur-2xl shadow-[0_50px_100px_-15px_rgba(0,0,0,0.8)]">
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
            <div className="bg-[#050212]/95 rounded-b-xl p-8 text-left grid grid-cols-1 md:grid-cols-4 gap-8 min-h-[350px]">
              <div className="flex flex-col gap-1.5 md:border-r border-white/[0.04] md:pr-6">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Live Portal Modules</div>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-violet-600/10 text-violet-400 border border-violet-500/20">
                  <Cpu size={16} /> Admin Workspace
                </div>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-500">
                  <Users size={16} /> Student Terminal
                </div>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-500">
                  <BarChart4 size={16} /> Advanced Metrics
                </div>
              </div>
              <div className="md:col-span-3 space-y-6">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Live System Overview</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-900/50 border border-white/5 p-5 rounded-2xl relative overflow-hidden">
                    <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">Active Registrations</span>
                    <span className="text-3xl font-extrabold text-white block mt-2">2,000+</span>
                  </div>
                  <div className="bg-slate-900/50 border border-white/5 p-5 rounded-2xl relative overflow-hidden">
                    <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">Avg Score</span>
                    <span className="text-3xl font-extrabold text-violet-400 block mt-2">84.2%</span>
                  </div>
                  <div className="bg-slate-900/50 border border-white/5 p-5 rounded-2xl relative overflow-hidden">
                    <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">Active Proctors</span>
                    <span className="text-3xl font-extrabold text-emerald-400 block mt-2">Online</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Card 1: AI Proctor Alert */}
          <div className="absolute top-[-40px] right-[-60px] w-64 premium-glass p-5 rounded-2xl animate-float-1 pointer-events-none hidden md:block text-left z-20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] bg-red-500/10 border border-red-500/20 text-red-400 font-bold px-2 py-0.5 rounded uppercase">Suspicious Activity</span>
              <AlertTriangle size={14} className="text-red-400 animate-pulse" />
            </div>
            <p className="text-xs text-white font-bold">Multiple Tab Changes Detected</p>
            <p className="text-[10px] text-slate-400 mt-1">Student ID: #10842 (Rahul Sharma)</p>
          </div>

          {/* Floating Card 2: Question Import Status */}
          <div className="absolute bottom-[-50px] left-[-70px] w-72 premium-glass p-5 rounded-2xl animate-float-2 pointer-events-none hidden md:block text-left z-20">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Check size={14} />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Question Bank Importer</span>
            </div>
            <p className="text-xs text-white font-bold">Successfully imported 2,000 Questions</p>
            <p className="text-[10px] text-emerald-400 mt-1">Processed in 4 parallel batch operations</p>
          </div>

          {/* Floating Card 3: Active Proctor Log */}
          <div className="absolute bottom-[-30px] right-[-80px] w-64 premium-glass p-5 rounded-2xl animate-float-3 pointer-events-none hidden md:block text-left z-20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Integrity Watchdog</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="flex items-center gap-3">
              <div className="text-3xl font-black text-white">{proctoringScore}%</div>
              <div>
                <span className="text-xs text-emerald-400 font-bold block">Secure State</span>
                <span className="text-[9px] text-slate-500 block">AI Confidence Score</span>
              </div>
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

      {/* Interactive Workflow Demo Tabs */}
      <section id="demo" className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-16">
          <div className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-3">Interactive Tour</div>
          <h2 className="text-3xl md:text-5xl font-black text-white">How Skillbrix Works</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl border border-white/[0.04] bg-slate-900/25 relative group hover:border-violet-500/20 transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center font-bold text-violet-400 text-sm mb-6">
              01
            </div>
            <h3 className="text-lg font-bold text-white mb-3">Upload Question Bank</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Upload thousands of MCQs at once using Excel, CSV or AI importer. Our system auto-resolves departments and validates formats instantly.
            </p>
          </div>

          <div className="p-8 rounded-2xl border border-white/[0.04] bg-slate-900/25 relative group hover:border-violet-500/20 transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center font-bold text-violet-400 text-sm mb-6">
              02
            </div>
            <h3 className="text-lg font-bold text-white mb-3">Configure & Launch Exams</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Assign exams to departments, set duration limits, configure custom grading, negative marks, and publish to students workspace.
            </p>
          </div>

          <div className="p-8 rounded-2xl border border-white/[0.04] bg-slate-900/25 relative group hover:border-violet-500/20 transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center font-bold text-violet-400 text-sm mb-6">
              03
            </div>
            <h3 className="text-lg font-bold text-white mb-3">Instant Result Analysis</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              View live candidate progress monitoring. Instantly check overall score distributions, pass/fail ratios, and detailed student submissions.
            </p>
          </div>
        </div>
      </section>

      {/* Advanced Features Bento Grid */}
      <section id="features" className="py-20 bg-slate-900/15 border-t border-white/5 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-xl mb-16">
            <div className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-3">Enterprise Suite</div>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
              Everything needed to <span className="bg-gradient-to-r from-fuchsia-400 to-violet-400 bg-clip-text text-transparent">run better tests</span>
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Experience enterprise-grade security and rich analytics tools. Purpose-built for reliable examination cycles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento item 1 */}
            <div className="md:col-span-2 p-8 bg-slate-900/30 border border-white/5 rounded-2xl relative overflow-hidden group hover:border-violet-500/20 transition-all duration-300">
              <div className="absolute top-0 right-0 w-48 h-48 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
              <Cpu className="text-violet-400 mb-6" size={32} />
              <h3 className="text-xl font-bold text-white mb-2">AI-Powered Question Processing</h3>
              <p className="text-sm text-slate-400 leading-relaxed max-w-lg mb-6">
                Direct AI questions parsing extracts structured MCQs with automated tagging, difficulty mapping, and duplicate detection from any document upload.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full border border-violet-500/20 bg-violet-500/5 text-xs text-violet-300 font-semibold">2,000+ MCQs Upload</span>
                <span className="px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-xs text-cyan-300 font-semibold">Department Match</span>
                <span className="px-3 py-1 rounded-full border border-fuchsia-500/20 bg-fuchsia-500/5 text-xs text-fuchsia-300 font-semibold">Duplicate Check</span>
              </div>
            </div>

            {/* Bento item 2 */}
            <div className="p-8 bg-slate-900/30 border border-white/5 rounded-2xl relative overflow-hidden group hover:border-cyan-500/20 transition-all duration-300">
              <Activity className="text-cyan-400 mb-6" size={32} />
              <h3 className="text-xl font-bold text-white mb-2">Live Monitor Feed</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Watch student exam status in real-time. Catch departures and block/unblock students instantly with a single button.
              </p>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full w-[80%] animate-pulse" />
              </div>
            </div>

            {/* Bento item 3 */}
            <div className="p-8 bg-slate-900/30 border border-white/5 rounded-2xl relative overflow-hidden group hover:border-fuchsia-500/20 transition-all duration-300">
              <Building2 className="text-fuchsia-400 mb-6" size={32} />
              <h3 className="text-xl font-bold text-white mb-2">Flexible Departments</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Seamlessly group students, exam scopes, and question pools by department, with auto-creation during student bulk uploads.
              </p>
            </div>

            {/* Bento item 4 */}
            <div className="md:col-span-2 p-8 bg-slate-900/30 border border-white/5 rounded-2xl relative overflow-hidden group hover:border-emerald-500/20 transition-all duration-300">
              <Scale className="text-emerald-400 mb-6" size={32} />
              <h3 className="text-xl font-bold text-white mb-2">Custom Grading & Negative Marks</h3>
              <p className="text-sm text-slate-400 leading-relaxed max-w-lg">
                Assign positive marks and negative margins to replicate national entrance exams (GATE/JEE style). Customize question weighting per exam template.
              </p>
            </div>
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
                "We migrated to Skillbrix and went from days of manually processing exam papers to instant results distribution. Tremendous time-saver."
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
