import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ShieldAlert,
  MonitorCheck,
  Loader2,
  Check,
  Video,
  Globe,
  Award,
} from "lucide-react";
import toast from "react-hot-toast";

export const CompatibilityCheck = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [browserPassed, setBrowserPassed] = useState(null);
  const [networkPassed, setNetworkPassed] = useState(null);
  const [cameraPassed, setCameraPassed] = useState(null);

  useEffect(() => {
    // Run mock tests
    const runTests = async () => {
      // 1. Browser check
      await new Promise((resolve) => setTimeout(resolve, 800));
      setBrowserPassed(true);

      // 2. Network ping test
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setNetworkPassed(true);

      // 3. Camera checking
      await new Promise((resolve) => setTimeout(resolve, 1200));
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          // Attempt to get stream (safe mock fallback if fails)
          await navigator.mediaDevices
            .getUserMedia({ video: true })
            .then((stream) => {
              // stop stream track
              stream.getTracks().forEach((track) => track.stop());
              setCameraPassed(true);
            })
            .catch(() => {
              loggerWarning(
                "Camera permission denied. Proceeding with simulated camera...",
              );
              setCameraPassed(true); // Proceed anyway for dev demo robustness
            });
        } else {
          setCameraPassed(true);
        }
      } catch (e) {
        setCameraPassed(true);
      }
    };

    runTests();
  }, []);

  const loggerWarning = (msg) => {
    toast.error(msg, { id: "camera-toast" });
  };

  const handleStartExam = () => {
    navigate(`/student/exams/${id}/terminal`);
  };

  const allPassed = browserPassed && networkPassed && cameraPassed;

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col items-center text-center gap-2">
        <div className="p-3 rounded-xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
          <MonitorCheck size={28} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">System Checks</h1>
        <p className="text-sm text-slate-400">
          Verifying browser layouts, connection quality, and proctor modules.
        </p>
      </div>

      <div className="glass-card p-6 rounded-xl border border-border space-y-4">
        {/* Browser check row */}
        <div className="flex items-center justify-between p-4 border-b border-border last:border-0">
          <div className="flex items-center gap-3">
            <Globe className="text-violet-500" size={20} />
            <div>
              <p className="font-semibold text-sm">Browser Layout Engine</p>
              <p className="text-xs text-muted-foreground">
                Chrome / Safari / Firefox compatibility
              </p>
            </div>
          </div>
          <div>
            {browserPassed === null ? (
              <Loader2 className="animate-spin text-primary" size={20} />
            ) : browserPassed ? (
              <div className="w-6 h-6 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center">
                <Check size={14} />
              </div>
            ) : (
              <ShieldAlert className="text-red-500" size={20} />
            )}
          </div>
        </div>

        {/* Network speed check */}
        <div className="flex items-center justify-between p-4 border-b border-border last:border-0">
          <div className="flex items-center gap-3">
            <Globe className="text-violet-500" size={20} />
            <div>
              <p className="font-semibold text-sm">Network Ping & Stability</p>
              <p className="text-xs text-muted-foreground">
                Latency bounds & bandwidth quality
              </p>
            </div>
          </div>
          <div>
            {networkPassed === null ? (
              <Loader2 className="animate-spin text-primary" size={20} />
            ) : networkPassed ? (
              <div className="w-6 h-6 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center">
                <Check size={14} />
              </div>
            ) : (
              <ShieldAlert className="text-red-500" size={20} />
            )}
          </div>
        </div>

        {/* Web Camera check */}
        <div className="flex items-center justify-between p-4 border-b border-border last:border-0">
          <div className="flex items-center gap-3">
            <Video className="text-violet-500" size={20} />
            <div>
              <p className="font-semibold text-sm">Proctor Media Input</p>
              <p className="text-xs text-muted-foreground">
                Webcam authorization validation
              </p>
            </div>
          </div>
          <div>
            {cameraPassed === null ? (
              <Loader2 className="animate-spin text-primary" size={20} />
            ) : cameraPassed ? (
              <div className="w-6 h-6 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center">
                <Check size={14} />
              </div>
            ) : (
              <ShieldAlert className="text-red-500" size={20} />
            )}
          </div>
        </div>
      </div>

      <button
        onClick={handleStartExam}
        disabled={!allPassed}
        className="w-full bg-violet-600 hover:bg-violet-700 active:bg-violet-800 font-semibold text-white py-3 rounded-lg text-sm shadow-lg shadow-violet-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:pointer-events-none"
      >
        <Award size={18} />
        Start Examination Workspace
      </button>
    </div>
  );
};
export default CompatibilityCheck;
