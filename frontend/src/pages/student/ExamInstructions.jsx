import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AlertCircle, ShieldCheck, ChevronRight } from "lucide-react";

export const ExamInstructions = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [checkedRules, setCheckedRules] = useState(false);

  /**
   * Navigates candidate to the hardware system compatibility check page
   * after explicit user acknowledgement of anti-cheat proctoring policies.
   */
  const handleNext = () => {
    navigate(`/student/exams/${id}/compatibility`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Security Guidelines
          </h1>
          <p className="text-muted-foreground mt-1">
            Read the following code of conduct before joining the session.
          </p>
        </div>
      </div>

      {/* Rules list */}
      <div className="glass-card p-6 rounded-xl border border-border space-y-6">
        <div className="flex items-start gap-4">
          <AlertCircle
            className="text-violet-500 mt-1 flex-shrink-0"
            size={20}
          />
          <div>
            <h3 className="font-semibold text-lg">
              Active Proctoring Policies
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              This examination is monitored in real-time. Any violation can
              result in immediate termination.
            </p>
          </div>
        </div>

        <ul className="space-y-4 text-sm border-t border-border pt-6">
          <li className="flex gap-3">
            <span className="text-violet-500 font-bold">1.</span>
            <span>
              <strong>Fullscreen Lockdown</strong>: The exam dashboard requires
              full screen mode. If you exit fullscreen mode, a security warning
              is logged and transmitted to proctors.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-violet-500 font-bold">2.</span>
            <span>
              <strong>Tab Switch Guard</strong>: Opening other tabs, minimizing
              browser window, or navigating to external programs is strictly
              blocked. System triggers auto-submit after 5 infractions.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-violet-500 font-bold">3.</span>
            <span>
              <strong>Copy-Paste Restrictions</strong>: Right-clicks and
              keyboard commands (Ctrl+C, Ctrl+V, Printscreen, etc.) are
              disabled.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-violet-500 font-bold">4.</span>
            <span>
              <strong>Auto-Save</strong>: Progress is saved locally and on the
              server. If your internet disconnects, you can resume once
              connected.
            </span>
          </li>
        </ul>
      </div>

      {/* Confirmation Checkbox */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pt-4">
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={checkedRules}
            onChange={(e) => setCheckedRules(e.target.checked)}
            className="w-5 h-5 accent-violet-600 rounded bg-slate-900 border-slate-800"
          />

          <span className="text-sm font-medium text-muted-foreground">
            I verify that I have read the guidelines and accept all proctoring
            terms.
          </span>
        </label>

        <button
          onClick={handleNext}
          disabled={!checkedRules}
          className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/95 text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:pointer-events-none"
        >
          Proceed to Check
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
export default ExamInstructions;
