import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Home } from 'lucide-react';

export const SubmissionConfirmation: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-md mx-auto text-center space-y-8 py-12 animate-fade-in">
      <div className="flex flex-col items-center gap-4">
        <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/5">
          <CheckCircle2 size={48} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Exam Submitted</h1>
        <p className="text-muted-foreground text-sm">Your answers have been securely received and recorded on the centralized database server.</p>
      </div>

      <div className="glass-card p-6 rounded-xl border border-border text-sm text-left space-y-4">
        <div className="flex justify-between items-center py-1 border-b border-border last:border-0">
          <span className="text-muted-foreground">Proctor Status</span>
          <span className="font-semibold text-emerald-400">Security Clearance Passed</span>
        </div>
        <div className="flex justify-between items-center py-1 border-b border-border last:border-0">
          <span className="text-muted-foreground">Evaluation status</span>
          <span className="font-semibold text-violet-400">Awaiting Grade Release</span>
        </div>
      </div>

      <button
        onClick={() => navigate('/student/exams')}
        className="w-full bg-violet-600 hover:bg-violet-700 active:bg-violet-800 font-semibold text-white py-3 rounded-lg text-sm shadow-lg shadow-violet-600/20 flex items-center justify-center gap-2 transition-all"
      >
        <Home size={16} /> Return to Assessments
      </button>
    </div>
  );
};
export default SubmissionConfirmation;
