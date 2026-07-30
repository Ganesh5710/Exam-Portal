import React, { useEffect, useState, useRef } from "react";
import { useSocket } from "../../context/SocketContext";
import {
  AlertTriangle,
  Monitor,
  Clock,
  Wifi,
  WifiOff,
  Bell,
  Hourglass,
  Send,
  Megaphone,
  UserCheck2,
  Video,
  ShieldAlert,
  Mic,
  Activity,
  Layers,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";

const CandidateLiveStreamFrame = React.memo(({ session, socket, candStatus, getStatusBadgeStyle, candidateQuality, onQualityToggle }) => {
  const [frameSrc, setFrameSrc] = useState(null);
  const [currentQuality, setCurrentQuality] = useState(candidateQuality || "STANDARD");
  const [remoteStream, setRemoteStream] = useState(null);
  const adminVideoRef = useRef(null);
  const pcRef = useRef(null);

  useEffect(() => {
    if (!socket || !session?.studentId) return;

    // Listen to real-time frame fallback stream over Socket (both individual and broadcast channels)
    const handleFrame = (data) => {
      const targetId = String(session.studentId);
      const incomingId = String(data?.studentId || "");

      if (data?.frame && (incomingId === targetId || !data.studentId)) {
        setFrameSrc(data.frame);
      }
      if (data?.quality) {
        setCurrentQuality(data.quality);
      }
    };

    const channelName = `candidate-frame::${session.studentId}`;
    socket.on(channelName, handleFrame);
    socket.on("candidate-frame-broadcast", handleFrame);

    // Initialize WebRTC PeerConnection using Google STUN servers
    try {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      pcRef.current = pc;

      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0]);
          if (adminVideoRef.current) {
            adminVideoRef.current.srcObject = event.streams[0];
          }
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("webrtc-ice-candidate", {
            targetId: session.studentId,
            candidate: event.candidate,
          });
        }
      };

      const handleAnswer = async (data) => {
        if (data.from === session.studentId && pcRef.current) {
          try {
            await pcRef.current.setRemoteDescription(
              new RTCSessionDescription(data.answer),
            );
          } catch (err) {
            console.error("WebRTC setRemoteDescription answer error:", err);
          }
        }
      };

      const handleIceCandidate = async (data) => {
        if (data.from === session.studentId && pcRef.current) {
          try {
            await pcRef.current.addIceCandidate(
              new RTCIceCandidate(data.candidate),
            );
          } catch (err) {
            console.error("WebRTC addIceCandidate error:", err);
          }
        }
      };

      socket.on("webrtc-answer", handleAnswer);
      socket.on("webrtc-ice-candidate", handleIceCandidate);

      return () => {
        socket.off(channelName, handleFrame);
        socket.off("candidate-frame-broadcast", handleFrame);
        socket.off("webrtc-answer", handleAnswer);
        socket.off("webrtc-ice-candidate", handleIceCandidate);
        if (pcRef.current) {
          pcRef.current.close();
          pcRef.current = null;
        }
      };
    } catch (err) {
      console.warn("WebRTC initialization error:", err);
      return () => {
        socket.off(channelName, handleFrame);
        socket.off("candidate-frame-broadcast", handleFrame);
      };
    }
  }, [socket, session?.studentId]);

  const isMaxHD = (candidateQuality || currentQuality) === "MAX_HD";

  return (
    <div className="relative aspect-video bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center group shadow-inner">
      {/* Top Floating Badge bar */}
      <div className="absolute top-2 left-2 right-2 flex justify-between items-center z-10">
        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-900/90 text-white border border-slate-700/80 shadow flex items-center gap-1 backdrop-blur-md">
          {isMaxHD ? (
            <span className="text-amber-300 flex items-center gap-1 font-black animate-pulse">
              <Sparkles size={11} className="text-amber-300" /> ✨ 720p MAX HD
            </span>
          ) : (
            <span className="text-sky-400 font-semibold flex items-center gap-1">
              <Video size={11} /> 360p Standard
            </span>
          )}
        </span>

        {/* Quality Switch Toggle for Single Candidate */}
        <button
          onClick={() =>
            onQualityToggle &&
            onQualityToggle(session.studentId, isMaxHD ? "STANDARD" : "MAX_HD")
          }
          className={`px-2 py-0.5 rounded text-[10px] font-black transition-all cursor-pointer shadow backdrop-blur-md border ${
            isMaxHD
              ? "bg-fuchsia-600/90 hover:bg-fuchsia-500 text-white border-fuchsia-400"
              : "bg-slate-900/90 hover:bg-violet-600/90 text-slate-300 hover:text-white border-slate-700"
          }`}
          title="Toggle Max HD 720p Quality for this candidate"
        >
          {isMaxHD ? "⚡ Set 360p" : "✨ Max HD"}
        </button>

        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadgeStyle(candStatus)} shadow-sm`}>
          {candStatus}
        </span>
      </div>

      {/* WebRTC Video Stream Element */}
      <video
        ref={adminVideoRef}
        autoPlay
        playsInline
        muted
        style={{ objectFit: "cover" }}
        className={`absolute inset-0 w-full h-full object-cover scale-x-[-1] ${remoteStream ? "block" : "hidden"}`}
      />

      {/* Real-time Socket Frame Stream Fallback Element */}
      {!remoteStream && frameSrc && (
        <img
          src={frameSrc}
          alt={`Live Feed ${session.studentName}`}
          style={{ objectFit: "cover" }}
          className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
        />
      )}

      {/* Loading Overlay if connecting */}
      {!remoteStream && !frameSrc && (
        <div className="flex flex-col items-center gap-1.5 text-slate-400 text-xs">
          <Video size={28} className="text-violet-400 animate-pulse" />
          <span className="font-semibold text-white text-xs">{session.studentName}</span>
          <span className="text-[10px] text-slate-500 font-mono">Connecting Real-time Live Stream...</span>
        </div>
      )}

      {/* Audio Level Meter Overlay Footer */}
      <div className="absolute bottom-0 inset-x-0 bg-slate-950/90 border-t border-slate-800 px-3 py-1.5 flex items-center justify-between backdrop-blur-md z-10">
        <span className="text-[10px] text-slate-300 font-bold flex items-center gap-1.5">
          <Mic size={12} className="text-emerald-400 animate-pulse" />
          Audio Level Meter:
        </span>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            <span className="w-1 h-3 bg-emerald-400 rounded-full animate-pulse"></span>
            <span className="w-1 h-4 bg-emerald-400 rounded-full animate-pulse"></span>
            <span className="w-1 h-2 bg-emerald-500/60 rounded-full"></span>
          </div>
          <span className="text-[10px] font-extrabold text-emerald-400">
            {session.audioLevelMeter || "Normal (12 dB)"}
          </span>
        </div>
      </div>
    </div>
  );
});

export const LiveMonitor = () => {
  const { socket, connected } = useSocket();
  const [sessions, setSessions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [announcementText, setAnnouncementText] = useState("");
  const [globalMessage, setGlobalMessage] = useState("");
  const [gridDensity, setGridDensity] = useState("compact"); // 'compact' for 100 candidate monitoring, 'standard'
  const [selectedExtension, setSelectedExtension] = useState(10); // 10 minutes default
  const [globalVideoQuality, setGlobalVideoQuality] = useState("STANDARD"); // 'LOW', 'STANDARD', 'MAX_HD'
  const [candidateQualityMap, setCandidateQualityMap] = useState({});

  const handleGlobalQualityChange = (quality) => {
    setGlobalVideoQuality(quality);
    if (socket) {
      socket.emit("set-video-quality", { quality });
      toast.success(
        quality === "MAX_HD"
          ? "🚀 Switched to MAX HD Video Quality (720p @ 0.90) for all feeds!"
          : quality === "LOW"
            ? "⚡ Switched to Low Bandwidth Mode (240p @ 0.40)."
            : "⚖️ Switched to Standard Quality Mode (360p @ 0.65).",
        { icon: quality === "MAX_HD" ? "✨" : "📹" },
      );
    }
  };

  const handleSingleCandidateQualityChange = (studentId, quality) => {
    setCandidateQualityMap((prev) => ({ ...prev, [studentId]: quality }));
    if (socket) {
      socket.emit("set-video-quality", { studentId, quality });
      toast.success(
        `Video quality set to ${quality === "MAX_HD" ? "✨ MAX HD 720p" : quality} for candidate.`,
      );
    }
  };

  const handleGlobalBroadcast = (e) => {
    e.preventDefault();
    if (!socket || !globalMessage.trim()) {
      toast.error("Please type a message to broadcast to all candidates.");
      return;
    }
    socket.emit("broadcast-global-announcement", {
      message: globalMessage.trim(),
      type: "GENERAL",
    });
    toast.success("📢 Broadcasted live announcement to all active candidates!");
    setGlobalMessage("");
  };

  useEffect(() => {
    if (!socket) return;

    // Join the secure admin proctor telemetry monitor room
    socket.emit("join-admin-monitor");

    // Listen for live assessment candidate socket updates
    socket.on("live-sessions-update", (updatedSessions) => {
      setSessions(updatedSessions);
    });

    // Listen for integrity rules violations (tab switches, webcam absences, look aways)
    socket.on("violation-alert", (alert) => {
      toast.error(
        `Proctor Alert: ${alert.studentName} flagged for ${alert.type}!`,
        {
          duration: 5000,
          id: `alert-${alert.studentName}-${Date.now()}`,
        },
      );

      // Append to the real-time NOC violation log panel
      const newAlert = {
        studentName: alert.studentName || "Student",
        type: (alert.type || "VIOLATION").replace(/_/g, " "),
        details: alert.details || "",
        timestamp: alert.timestamp || Date.now(),
      };
      setAlerts((prev) => [newAlert, ...prev].slice(0, 50));
    });

    return () => {
      // Cleanup WebSocket socket event listeners on unmount to prevent leaks
      socket.off("live-sessions-update");
      socket.off("violation-alert");
    };
  }, [socket]);

  const handleExtendTime = (session) => {
    if (!socket) return;
    socket.emit("extend-exam-time", {
      examId: session.examId,
      studentId: session.studentId,
      extensionMinutes: selectedExtension,
    });
    toast.success(
      `Sent time extension request of ${selectedExtension}m to student.`,
    );
  };

  const handleBroadcastAnnouncement = (examId) => {
    if (!socket || !announcementText.trim()) return;
    socket.emit("send-announcement", {
      examId,
      message: announcementText,
      type: "WARNING",
    });
    toast.success("Broadcasted warning alert to this candidate.");
    setAnnouncementText("");
  };

  const handleForceTerminate = (session) => {
    if (!socket || !announcementText.trim()) {
      toast.error("Please enter a reason for termination.");
      return;
    }
    socket.emit("terminate-exam-session", {
      examId: session.examId,
      studentId: session.studentId,
      reason: announcementText,
    });
    toast.success(`Force-terminated exam session for ${session.studentName}.`);
    setAnnouncementText("");
  };

  // Helper utility to format integer seconds remaining into hh:mm:ss strings (e.g. 2h 45m 30s)
  const formatRemainingTime = (secs) => {
    if (!secs || secs <= 0) return "0m 0s";
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m ${s}s`;
    }
    return `${mins}m ${s}s`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            Proctoring Console
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time candidate monitoring dashboard.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Global Video Quality Selector Mode */}
          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold">
            <span className="px-2 text-[11px] font-extrabold text-slate-400 flex items-center gap-1">
              <Video size={12} className="text-violet-400" /> Quality:
            </span>
            <button
              onClick={() => handleGlobalQualityChange("LOW")}
              className={`px-2.5 py-1 rounded-md transition-all text-[11px] cursor-pointer ${
                globalVideoQuality === "LOW"
                  ? "bg-slate-800 text-amber-400 font-extrabold shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Low Bandwidth (240p @ 0.40)"
            >
              Low (240p)
            </button>
            <button
              onClick={() => handleGlobalQualityChange("STANDARD")}
              className={`px-2.5 py-1 rounded-md transition-all text-[11px] cursor-pointer ${
                globalVideoQuality === "STANDARD"
                  ? "bg-slate-800 text-sky-400 font-extrabold shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Standard Quality (360p @ 0.65)"
            >
              Standard
            </button>
            <button
              onClick={() => handleGlobalQualityChange("MAX_HD")}
              className={`px-3 py-1 rounded-md transition-all text-[11px] flex items-center gap-1 cursor-pointer ${
                globalVideoQuality === "MAX_HD"
                  ? "bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white font-black shadow-md shadow-fuchsia-500/20 animate-pulse"
                  : "text-fuchsia-400 hover:text-white hover:bg-fuchsia-950/40"
              }`}
              title="Maximum Video Quality (720p HD @ 0.90)"
            >
              <Sparkles size={12} className="text-amber-300 animate-spin" /> MAX HD (720p)
            </button>
          </div>

          {/* View Density Switcher for 100 Candidate Monitoring */}
          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setGridDensity("compact")}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                gridDensity === "compact"
                  ? "bg-violet-600 text-white shadow-sm font-extrabold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Layers size={13} /> Compact (100 Grid)
            </button>
            <button
              onClick={() => setGridDensity("standard")}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                gridDensity === "standard"
                  ? "bg-violet-600 text-white shadow-sm font-extrabold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Monitor size={13} /> Standard
            </button>
          </div>

          <div className="flex items-center gap-2 border border-border px-3.5 py-1.5 rounded-lg text-xs bg-card">
            <span className="font-semibold text-slate-400">Network status:</span>
            {connected ? (
              <span className="text-emerald-400 font-bold">Synced</span>
            ) : (
              <span className="text-red-400 font-bold">Reconnecting</span>
            )}
          </div>
        </div>
      </div>

      {/* Global Broadcast Announcement Toolbar to All Candidates */}
      <form
        onSubmit={handleGlobalBroadcast}
        className="glass-card p-4 rounded-xl border border-violet-500/30 bg-slate-900/60 flex flex-col sm:flex-row items-center gap-3 shadow-lg shadow-violet-500/5"
      >
        <div className="flex items-center gap-2 text-violet-400 font-bold text-xs uppercase tracking-wider whitespace-nowrap">
          <Megaphone size={16} className="text-amber-400 animate-bounce" />
          Broadcast to All Candidates:
        </div>
        <input
          type="text"
          value={globalMessage}
          onChange={(e) => setGlobalMessage(e.target.value)}
          placeholder="Type announcement message to broadcast live to all active candidates..."
          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-all w-full"
        />
        <button
          type="submit"
          className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 active:scale-95 text-white font-bold text-xs rounded-lg flex items-center gap-2 shadow-md shadow-violet-600/20 transition-all whitespace-nowrap cursor-pointer"
        >
          <Send size={14} /> Send Broadcast
        </button>
      </form>

      {sessions.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-xl flex flex-col items-center justify-center gap-4 min-h-[300px]">
          <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center text-muted-foreground">
            <UserCheck2 size={32} />
          </div>
          <div>
            <h3 className="font-semibold text-lg">No active examinations</h3>
            <p className="text-sm text-muted-foreground mt-1">
              There are no candidates sitting for examinations currently.
            </p>
          </div>
        </div>
      ) : (
        /* Multi-grid Layout: Live Session Cards + Side NOC Feed */
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
          {/* Main Sessions Grid */}
          <div
            className={`xl:col-span-3 grid gap-4 ${
              gridDensity === "compact"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4"
                : "grid-cols-1 md:grid-cols-2"
            }`}
          >
            {sessions.map((session) => {
              const faceViolCount = session.faceViolationCount || 0;
              const faceState = session.faceStatus || "normal";
              const hasViolations =
                session.tabSwitchCount > 0 ||
                session.exitFullscreenCount > 0 ||
                faceViolCount > 0;
              const isDanger =
                session.tabSwitchCount >= 3 ||
                session.exitFullscreenCount >= 3 ||
                faceViolCount >= 3;

              const currentSec = session.currentSection || "Section 1: Physics";
              const candStatus = session.internetStatus === "offline"
                ? "Hardware Disconnected"
                : session.tabSwitchCount > 0 || session.exitFullscreenCount > 0
                  ? "Tab Switch Warning"
                  : "Active";

              const getSectionBadgeStyle = (sec) => {
                if (sec.includes("Phys")) return "bg-sky-500/10 text-sky-400 border-sky-500/30";
                if (sec.includes("Chem")) return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
                if (sec.includes("Math")) return "bg-amber-500/10 text-amber-400 border-amber-500/30";
                return "bg-violet-500/10 text-violet-400 border-violet-500/30";
              };

              const getStatusBadgeStyle = (st) => {
                if (st === "Active") return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
                if (st === "Hardware Disconnected") return "bg-red-500/10 text-red-400 border-red-500/30 animate-pulse";
                return "bg-amber-500/10 text-amber-400 border-amber-500/30";
              };

              if (gridDensity === "compact") {
                return (
                  <div
                    key={`${session.examId}::${session.studentId}`}
                    className={`glass-card p-3 rounded-xl border flex flex-col justify-between transition-all duration-200 space-y-2.5 bg-slate-900/70 hover:border-violet-500/50 shadow-md
                      ${isDanger ? "border-red-500/60 bg-red-950/20 shadow-red-500/10" : hasViolations ? "border-amber-500/50 bg-amber-950/15" : "border-slate-800"}
                    `}
                  >
                    {/* Stream Frame */}
                    <CandidateLiveStreamFrame
                      session={session}
                      socket={socket}
                      candStatus={candStatus}
                      getStatusBadgeStyle={getStatusBadgeStyle}
                      candidateQuality={candidateQualityMap[session.studentId] || globalVideoQuality}
                      onQualityToggle={handleSingleCandidateQualityChange}
                    />

                    {/* Header: Candidate Name & Active Section */}
                    <div className="flex justify-between items-center gap-1.5 pt-1">
                      <div className="truncate">
                        <h3 className="font-bold text-xs text-white truncate" title={session.studentName}>
                          {session.studentName || "Candidate"}
                        </h3>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {(session.examId || "").substring(0, 6)}...
                        </p>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold border ${getSectionBadgeStyle(currentSec)} whitespace-nowrap`}>
                        {currentSec}
                      </span>
                    </div>

                    {/* Micro Telemetry Bar */}
                    <div className="grid grid-cols-2 gap-1 text-[10px] pt-1 border-t border-slate-800/80">
                      <div className="flex items-center gap-1 text-slate-300">
                        <Clock size={11} className="text-violet-400" />
                        <span className="font-mono font-bold text-violet-300">{formatRemainingTime(session.remainingTime)}</span>
                      </div>
                      <div className="flex items-center gap-1 justify-end">
                        <Monitor size={11} className={session.fullscreenStatus ? "text-emerald-400" : "text-red-400"} />
                        <span className={session.fullscreenStatus ? "text-emerald-400 font-semibold" : "text-red-400 font-bold"}>
                          {session.fullscreenStatus ? "Locked" : "Windowed"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400 col-span-2 justify-between pt-0.5">
                        <span className="flex items-center gap-1">
                          <AlertTriangle size={11} className={session.tabSwitchCount + session.exitFullscreenCount > 0 ? "text-amber-400" : "text-slate-500"} />
                          Tabs: <strong className="text-white">{session.tabSwitchCount}</strong> | Esc: <strong className="text-white">{session.exitFullscreenCount}</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <ShieldAlert size={11} className={faceViolCount > 0 ? "text-red-400" : "text-slate-500"} />
                          Faces: <strong className={faceViolCount > 0 ? "text-red-400" : "text-white"}>{faceViolCount}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-slate-800/80 flex gap-1.5">
                      <button
                        onClick={() => setSelectedSession(session)}
                        className="flex-1 text-[10px] font-bold py-1 px-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center gap-1 transition-all cursor-pointer"
                      >
                        <Bell size={10} /> Warn
                      </button>
                      <button
                        onClick={() => handleExtendTime(session)}
                        className="flex-1 text-[10px] font-bold py-1 px-2 rounded bg-violet-600/80 hover:bg-violet-600 text-white flex items-center justify-center gap-1 transition-all cursor-pointer"
                      >
                        <Hourglass size={10} /> +{selectedExtension}m
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={`${session.examId}::${session.studentId}`}
                  className={`glass-card p-5 rounded-xl flex flex-col justify-between transition-all duration-300 border space-y-4
                    ${isDanger ? "border-red-500/50 glow-danger bg-red-950/5" : hasViolations ? "border-amber-500/40 bg-amber-950/5" : "border-border"}
                  `}
                >
                  <div className="space-y-4">
                    {/* Real Live Stream & Audio Level Frame */}
                    <CandidateLiveStreamFrame
                      session={session}
                      socket={socket}
                      candStatus={candStatus}
                      getStatusBadgeStyle={getStatusBadgeStyle}
                      candidateQuality={candidateQualityMap[session.studentId] || globalVideoQuality}
                      onQualityToggle={handleSingleCandidateQualityChange}
                    />

                    {/* Student Info & Active Section */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-base text-white">
                          {session.studentName || "Candidate"}
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          Exam: {(session.examId || "").substring(0, 8)}...
                        </p>
                      </div>

                      {/* Current Active Section Badge */}
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold border ${getSectionBadgeStyle(currentSec)} shadow-sm flex items-center gap-1.5`}>
                        <Layers size={12} />
                        {currentSec}
                      </span>
                    </div>

                    {/* Telemetry info rows */}
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center py-1.5 border-b border-border">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <Activity size={13} strokeWidth={2.5} /> Real-time Status
                        </span>
                        <span className={`font-bold px-2 py-0.5 rounded text-[11px] border ${getStatusBadgeStyle(candStatus)}`}>
                          {candStatus}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-1.5 border-b border-border">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <Monitor size={13} /> Screen State
                        </span>
                        <span className={`font-semibold ${session.fullscreenStatus ? "text-emerald-400" : "text-red-400"}`}>
                          {session.fullscreenStatus ? "Locked (Fullscreen)" : "Windowed / Minimize"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-1.5 border-b border-border">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <Clock size={13} /> Time Remaining
                        </span>
                        <span className="font-mono font-bold text-violet-300">
                          {formatRemainingTime(session.remainingTime)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-1.5 border-b border-border">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <AlertTriangle size={13} /> Screen Violations
                        </span>
                        <span className={`font-bold ${session.tabSwitchCount + session.exitFullscreenCount > 0 ? "text-amber-500" : "text-slate-300"}`}>
                          Tabs: {session.tabSwitchCount} | Escapes: {session.exitFullscreenCount}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-1.5">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <ShieldAlert size={13} /> Face Violations
                        </span>
                        <span className={`font-bold ${faceViolCount > 0 ? "text-red-400" : "text-slate-300"}`}>
                          {faceViolCount}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions bottom bar */}
                  <div className="mt-6 pt-4 border-t border-border flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedSession(session);
                      }}
                      className="flex-1 text-xs font-semibold py-2 rounded-lg bg-accent text-accent-foreground hover:bg-accent/80 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Bell size={12} />
                      Warning
                    </button>

                    <button
                      onClick={() => {
                        handleExtendTime(session);
                      }}
                      className="flex-1 text-xs font-semibold py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Hourglass size={12} />
                      +10m
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* NOC Live Violation Alerts Sidebar Feed */}
          <div className="xl:col-span-1 space-y-4">
            <div className="glass-card p-5 rounded-xl border border-border h-[520px] flex flex-col bg-slate-900/40">
              <div className="flex items-center gap-2 border-b border-border pb-3 mb-4">
                <Bell className="text-red-500 animate-pulse" size={16} />
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                  Live Security Log
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs select-none">
                {alerts.length === 0 ? (
                  <div className="text-center py-16 text-slate-500 space-y-1">
                    <p>No proctor warnings flagged.</p>
                    <p className="text-[10px]">
                      Telemetry active & watching...
                    </p>
                  </div>
                ) : (
                  alerts.map((al, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg space-y-1.5 animate-fade-in"
                    >
                      <div className="flex justify-between items-center text-[10px] text-slate-500">
                        <span className="font-bold text-slate-300">
                          {al.studentName}
                        </span>
                        <span>
                          {new Date(al.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="font-bold text-red-400 text-[11px] uppercase tracking-wider">
                        {al.type}
                      </div>
                      <p className="text-slate-400 text-[10px] leading-relaxed">
                        {al.details}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 rounded-xl space-y-6">
            <div>
              <h3 className="font-bold text-lg">Send Alert Warning</h3>
              <p className="text-xs text-muted-foreground mt-1">
                To: {selectedSession.studentName}
              </p>
            </div>

            <textarea
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              placeholder="e.g. Return to fullscreen mode immediately. This is your final warning."
              rows={4}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm focus:outline-none focus:border-violet-500"
            />

            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setSelectedSession(null)}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleBroadcastAnnouncement(selectedSession.examId);
                  setSelectedSession(null);
                }}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5 transition-colors"
              >
                <Send size={13} /> Warn
              </button>
              <button
                onClick={() => {
                  handleForceTerminate(selectedSession);
                  setSelectedSession(null);
                }}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5 transition-colors"
              >
                <ShieldAlert size={13} /> Terminate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default LiveMonitor;
