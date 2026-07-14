import React from "react";
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
  Check, 
  HelpCircle,
  Database,
  Star
} from "lucide-react";

export const Landing = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-violet-600/30 selection:text-violet-200 overflow-x-hidden relative">
      
      {/* Background Decorative Glow Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse duration-10000" />
      <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[20%] w-[400px] h-[400px] bg-fuchsia-500/5 rounded-full blur-[90px] pointer-events-none" />

      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 h-20 border-b border-white/5 bg-slate-950/70 backdrop-blur-xl z-50 flex items-center justify-between px-6 md:px-12">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center font-black text-white text-base shadow-lg shadow-violet-500/25">
            SB
          </div>
          <span className="text-xl font-black tracking-tight text-white">
            Skill<span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">brix</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
          <a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a>
        </div>

        <div className="flex items-center gap-4">
          <Link 
            to="/login" 
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link 
            to="/login" 
            className="px-4.5 py-2 text-sm font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl shadow-lg shadow-violet-600/20 hover:shadow-violet-600/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
          >
            Launch Portal →
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-36 pb-20 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/5 text-xs font-semibold text-violet-300 uppercase tracking-wider mb-6 animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-ping" />
          Enterprise-Grade Online Assessments
        </div>

        <h1 className="text-4xl md:text-7xl font-black tracking-tight leading-[1.1] text-white max-w-4xl mb-6">
          The <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">Smartest Way</span><br className="hidden md:block" /> to Run Assessments
        </h1>

        <p className="text-base md:text-lg text-slate-400 max-w-2xl mb-10 leading-relaxed">
          Skillbrix Solutions delivers high-performance exam infrastructure with AI question builders, real-time proctoring, and comprehensive analytics. Built for modern educational institutions.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Link 
            to="/login" 
            className="px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-xl shadow-xl shadow-violet-600/25 hover:shadow-violet-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2"
          >
            Start Free Trial <ArrowRight size={16} />
          </Link>
          <a 
            href="#features" 
            className="px-8 py-4 bg-slate-900 border border-slate-800 hover:border-violet-500/40 text-slate-300 hover:text-white font-semibold rounded-xl transition-all duration-200"
          >
            ✦ Explore Features
          </a>
        </div>

        {/* Dashboard Mockup Panel */}
        <div className="w-full max-w-5xl rounded-2xl border border-white/5 bg-slate-900/40 p-1.5 backdrop-blur-lg shadow-2xl relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/10 to-transparent blur-2xl rounded-2xl -z-10" />
          
          {/* Mockup Header Bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-950/60 rounded-t-xl border-b border-white/5">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <span className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <div className="text-xs text-slate-500 font-mono tracking-wider">https://skillbrix-solutions.com/portal</div>
            <div className="w-12" />
          </div>

          {/* Mockup Main Screen */}
          <div className="bg-slate-950/80 rounded-b-xl p-6 md:p-8 text-left grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="hidden md:flex flex-col gap-1 border-r border-white/5 pr-6">
              <div className="flex items-center gap-3 px-3 py-2 bg-violet-600/15 text-violet-400 rounded-lg font-semibold text-sm">
                <div className="w-4 h-4 rounded bg-violet-400/20" /> Dashboard
              </div>
              <div className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white rounded-lg text-sm">
                <div className="w-4 h-4 rounded bg-slate-800" /> Students List
              </div>
              <div className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white rounded-lg text-sm">
                <div className="w-4 h-4 rounded bg-slate-800" /> Question Bank
              </div>
              <div className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white rounded-lg text-sm">
                <div className="w-4 h-4 rounded bg-slate-800" /> Exams
              </div>
            </div>
            
            <div className="md:col-span-3 space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4">
                  <div className="text-2xl font-black text-white">2,000</div>
                  <div className="text-xs text-slate-500 font-medium mt-1">Total Students</div>
                </div>
                <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4">
                  <div className="text-2xl font-black text-emerald-400">94.8%</div>
                  <div className="text-xs text-slate-500 font-medium mt-1">Completion Rate</div>
                </div>
                <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4">
                  <div className="text-2xl font-black text-fuchsia-400">12</div>
                  <div className="text-xs text-slate-500 font-medium mt-1">Active Exams</div>
                </div>
              </div>

              <div className="bg-slate-900/40 border border-white/5 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 font-semibold border-b border-white/5 pb-2">
                  <span>Student Name</span>
                  <span>Department</span>
                  <span>Activity Status</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-white">Ajay Krishna</span>
                  <span className="text-slate-400">Data Analytics</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold">Active</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-white">Nikhil Gupta</span>
                  <span className="text-slate-400">Software Dev</span>
                  <span className="px-2 py-0.5 rounded bg-violet-500/15 text-violet-400 font-semibold">In Exam</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-white">Bharath Krishna</span>
                  <span className="text-slate-400">Python Dev</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <section className="border-y border-white/5 bg-slate-900/20 py-12 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-extrabold text-white mb-2">2M+</div>
            <div className="text-xs font-semibold tracking-widest text-slate-500 uppercase">Tests Completed</div>
          </div>
          <div>
            <div className="text-4xl font-extrabold text-white mb-2">96%</div>
            <div className="text-xs font-semibold tracking-widest text-slate-500 uppercase">Completion Rate</div>
          </div>
          <div>
            <div className="text-4xl font-extrabold text-white mb-2">500+</div>
            <div className="text-xs font-semibold tracking-widest text-slate-500 uppercase">Institutions Onboarded</div>
          </div>
          <div>
            <div className="text-4xl font-extrabold text-white mb-2">99.99%</div>
            <div className="text-xs font-semibold tracking-widest text-slate-500 uppercase">Platform Uptime</div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 px-6 md:px-12 max-w-7xl mx-auto text-center">
        <div className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-3">Workflow Overview</div>
        <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-16">
          Set up Assessments in <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Three Easy Steps</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="p-8 rounded-2xl border border-white/5 bg-slate-900/25 relative hover:border-violet-500/20 transition-all duration-300 group">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center font-bold text-violet-400 text-sm mb-6">
              01
            </div>
            <h3 className="text-lg font-bold text-white mb-3">Upload Question Bank</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Upload thousands of MCQs at once using Excel, CSV or AI importer. Our system auto-resolves departments and validates formats instantly.
            </p>
          </div>

          <div className="p-8 rounded-2xl border border-white/5 bg-slate-900/25 relative hover:border-violet-500/20 transition-all duration-300 group">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center font-bold text-violet-400 text-sm mb-6">
              02
            </div>
            <h3 className="text-lg font-bold text-white mb-3">Configure & Launch Exams</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Assign exams to departments, set duration limits, configure custom grading, negative marks, and publish to students workspace.
            </p>
          </div>

          <div className="p-8 rounded-2xl border border-white/5 bg-slate-900/25 relative hover:border-violet-500/20 transition-all duration-300 group">
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

      {/* Features Bento Grid */}
      <section id="features" className="py-20 bg-slate-900/15 border-t border-white/5 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-xl mb-16">
            <div className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-3">Platform Features</div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">
              Everything needed to <span className="bg-gradient-to-r from-fuchsia-400 to-violet-400 bg-clip-text text-transparent">run better tests</span>
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Experience enterprise-grade security and rich analytics tools. Purpose-built for reliable examination cycles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento item 1 */}
            <div className="md:col-span-2 p-8 bg-slate-900/30 border border-white/5 rounded-2xl relative overflow-hidden group">
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
            <div className="p-8 bg-slate-900/30 border border-white/5 rounded-2xl relative overflow-hidden">
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
            <div className="p-8 bg-slate-900/30 border border-white/5 rounded-2xl relative overflow-hidden">
              <Building2 className="text-fuchsia-400 mb-6" size={32} />
              <h3 className="text-xl font-bold text-white mb-2">Flexible Departments</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Seamlessly group students, exam scopes, and question pools by department, with auto-creation during student bulk uploads.
              </p>
            </div>

            {/* Bento item 4 */}
            <div className="md:col-span-2 p-8 bg-slate-900/30 border border-white/5 rounded-2xl relative overflow-hidden">
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
      <section id="testimonials" className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-16">
          <div className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-3">Testimonials</div>
          <h2 className="text-3xl md:text-5xl font-black text-white">
            Trusted by modern <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">educators</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl border border-white/5 bg-slate-900/20">
            <div className="flex gap-1 text-yellow-500 mb-4">
              <Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" />
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-6 font-medium italic">
              "We migrated to Skillbrix and went from days of manually processing exam papers to instant results distribution. Tremendous time-saver."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-violet-600 text-white font-bold flex items-center justify-center text-xs">RK</div>
              <div>
                <div className="text-sm font-semibold text-white">Rajesh Kumar</div>
                <div className="text-xs text-slate-500">Principal, VIT College Hyderabad</div>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-2xl border border-white/5 bg-slate-900/20">
            <div className="flex gap-1 text-yellow-500 mb-4">
              <Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" />
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-6 font-medium italic">
              "Uploading 2,000 students at a time with department auto-mapping is incredibly fast. The database handles bulk inserts seamlessly."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-fuchsia-600 text-white font-bold flex items-center justify-center text-xs">SP</div>
              <div>
                <div className="text-sm font-semibold text-white">Sunita Patel</div>
                <div className="text-xs text-slate-500">Dean of Admissions, JNTU</div>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-2xl border border-white/5 bg-slate-900/20">
            <div className="flex gap-1 text-yellow-500 mb-4">
              <Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" />
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-6 font-medium italic">
              "AI question parsing from our existing curriculum sheets saved our professors weeks of manual formatting. Best system on the market."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-xs">AM</div>
              <div>
                <div className="text-sm font-semibold text-white">Arjun Mehta</div>
                <div className="text-xs text-slate-500">HOD Computer Science, NIT Warangal</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="py-20 px-6 md:px-12 max-w-5xl mx-auto relative">
        <div className="p-12 md:p-20 rounded-3xl border border-violet-500/20 bg-slate-900/40 backdrop-blur-xl text-center shadow-2xl relative">
          <div className="absolute inset-0 bg-violet-600/5 blur-3xl rounded-3xl -z-10" />
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
            Ready to upgrade your portal?
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto mb-8">
            Experience smart online exams with Skillbrix Solutions today. Get started in minutes.
          </p>
          <div className="flex justify-center gap-4">
            <Link 
              to="/login" 
              className="px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-xl shadow-lg shadow-violet-600/20 hover:shadow-violet-600/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              Launch Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-7 h-7 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center font-black text-white text-xs shadow-md shadow-violet-500/25">
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
