import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, Home } from "lucide-react";
import api from "../../services/api";

/**
 * SubmissionConfirmation Component
 * Renders the exam submission confirmation page for students.
 * Automatically checks for graded results in the background.
 */
export const SubmissionConfirmation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  // Holds the dynamically fetched student submission status and scores
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let intervalId;

    const fetchResult = async () => {
      try {
        const res = await api.get(`/submissions/my-submission/${id}`);
        const data = res.data.data;
        setSubmission(data);
        
        // Stop polling the database once the grades are published
        if (data && data.status === "PUBLISHED") {
          clearInterval(intervalId);
        }
      } catch (err) {
        // silently fail (e.g. if submission not found yet)
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchResult();
      // Poll every 3 seconds for instant results release detection without manual page refresh
      intervalId = setInterval(fetchResult, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [id]);

  /** Evaluates whether instructor has published official evaluation marks */
  const isPublished = submission && submission.status === "PUBLISHED";

  return (
    <div className="max-w-md mx-auto text-center space-y-8 py-12 animate-fade-in">
      <div className="flex flex-col items-center gap-4">
        <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/5">
          <CheckCircle2 size={48} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Exam Submitted</h1>
        <p className="text-muted-foreground text-sm">
          Your answers have been securely received and recorded on the
          centralized database server.
        </p>
      </div>

      <div className="glass-card p-6 rounded-xl border border-border text-sm text-left space-y-4">
        <div className="flex justify-between items-center py-1 border-b border-slate-800 last:border-0">
          <span className="text-muted-foreground">Proctor Status</span>
          <span className="font-semibold text-emerald-400">
            Security Clearance Passed
          </span>
        </div>
        <div className="flex justify-between items-center py-1 border-b border-slate-800 last:border-0">
          <span className="text-muted-foreground">Evaluation status</span>
          {isPublished ? (
            <span className="font-semibold text-emerald-400">
              Graded & Released
            </span>
          ) : (
            <span className="font-semibold text-violet-400 animate-pulse">
              Awaiting Grade Release
            </span>
          )}
        </div>

        {!isPublished && (
          <div className="p-4 bg-violet-950/20 border border-violet-500/20 rounded-lg text-xs text-violet-300 text-center leading-relaxed">
            ⏱️ Your results will be announced soon. Please stay on this page.
            The system is checking for released grades automatically in the
            background.
          </div>
        )}

        {isPublished && submission && (
          <>
            <div className="flex justify-between items-center py-1 border-b border-slate-800">
              <span className="text-muted-foreground">Overall Percentage</span>
              <span className="font-semibold text-white">
                {submission.percentage !== null
                  ? `${submission.percentage.toFixed(1)}%`
                  : "—"}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-800">
              <span className="text-muted-foreground">Grade</span>
              <span className="font-bold text-violet-400">
                {submission.grade || "—"}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-800">
              <span className="text-muted-foreground">Result Status</span>
              <span
                className={`font-bold px-2 py-0.5 rounded text-xs ${
                  submission.isPassed
                    ? "text-emerald-400 bg-emerald-500/10"
                    : "text-red-400 bg-red-500/10"
                }`}
              >
                {submission.isPassed ? "PASSED" : "FAILED"}
              </span>
            </div>

            {/* Subject-Wise Marks Breakdown */}
            <div className="pt-4 border-t border-slate-800 space-y-2.5">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                Subject-Wise Section Breakdown
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Section 1: Physics</span>
                  <span className="font-bold text-sky-400 text-sm">
                    {submission.sectionScores?.Physics ?? 0}
                  </span>
                </div>
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Section 2: Chemistry</span>
                  <span className="font-bold text-emerald-400 text-sm">
                    {submission.sectionScores?.Chemistry ?? 0}
                  </span>
                </div>
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Section 3: Mathematics</span>
                  <span className="font-bold text-amber-400 text-sm">
                    {submission.sectionScores?.Mathematics ?? 0}
                  </span>
                </div>
                {submission.sectionScores?.Descriptive !== undefined && (
                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Section 4: Descriptive</span>
                    <span className="font-bold text-purple-400 text-sm">
                      {submission.sectionScores?.Descriptive ?? 0}
                    </span>
                  </div>
                )}
                <div className="bg-violet-950/40 p-3 rounded-lg border border-violet-500/30">
                  <span className="text-violet-300 block text-[11px]">Total Combined Score</span>
                  <span className="font-bold text-violet-400 text-sm">
                    {submission.sectionScores?.totalCombined ?? submission.totalScore}{" "}
                    <span className="text-slate-500 text-[10px]">/ {submission.maxPossibleScore}</span>
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <button
        onClick={() => navigate("/student/exams")}
        className="w-full bg-violet-600 hover:bg-violet-700 active:bg-violet-800 font-semibold text-white py-3 rounded-lg text-sm shadow-lg shadow-violet-600/20 flex items-center justify-center gap-2 transition-all"
      >
        <Home size={16} /> Return to Assessments
      </button>
    </div>
  );
};
export default SubmissionConfirmation;
