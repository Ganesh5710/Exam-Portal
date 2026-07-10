import React, { useEffect, useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import {
  AlertTriangle,
  Monitor,
  Clock,
  Wifi,
  WifiOff,
  Bell,
  Hourglass,
  Send,
  UserCheck2,
  Video,
  ShieldAlert,
  XOctagon
} from 'lucide-react';
import toast from 'react-hot-toast';

interface LiveStudentSession {
  studentId: string;
  studentName: string;
  examId: string;
  currentQuestionIndex: number;
  remainingTime: number;
  internetStatus: 'online' | 'offline';
  fullscreenStatus: boolean;
  tabSwitchCount: number;
  exitFullscreenCount: number;
  faceStatus?: 'normal' | 'look_away' | 'multiple_faces' | 'no_face';
  faceViolationCount?: number;
  lastActive: number;
}

interface SecurityAlert {
  studentName: string;
  type: string;
  details: string;
  timestamp: number;
}

export const LiveMonitor: React.FC = () => {
  const { socket, connected } = useSocket();
  const [sessions, setSessions] = useState<LiveStudentSession[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [selectedSession, setSelectedSession] = useState<LiveStudentSession | null>(null);
  const [announcementText, setAnnouncementText] = useState('');
  const [selectedExtension, setSelectedExtension] = useState(10); // 10 minutes default

  useEffect(() => {
    if (!socket) return;

    // Join admin proctor room
    socket.emit('join-admin-monitor');

    socket.on('live-sessions-update', (updatedSessions: LiveStudentSession[]) => {
      setSessions(updatedSessions);
    });

    socket.on('violation-alert', (alert: {
      studentName: string;
      type: string;
      details: string;
      timestamp?: number;
    }) => {
      toast.error(`Proctor Alert: ${alert.studentName} flagged for ${alert.type}!`, {
        duration: 5000,
        id: `alert-${alert.studentName}-${Date.now()}`
      });

      // Append to the real-time NOC violation log
      const newAlert: SecurityAlert = {
        studentName: alert.studentName,
        type: alert.type.replace(/_/g, ' '),
        details: alert.details,
        timestamp: alert.timestamp || Date.now()
      };
      setAlerts(prev => [newAlert, ...prev].slice(0, 50));
    });

    return () => {
      socket.off('live-sessions-update');
      socket.off('violation-alert');
    };
  }, [socket]);

  const handleExtendTime = (session: LiveStudentSession) => {
    if (!socket) return;
    socket.emit('extend-exam-time', {
      examId: session.examId,
      studentId: session.studentId,
      extensionMinutes: selectedExtension
    });
    toast.success(`Sent time extension request of ${selectedExtension}m to student.`);
  };

  const handleBroadcastAnnouncement = (examId: string) => {
    if (!socket || !announcementText.trim()) return;
    socket.emit('send-announcement', {
      examId,
      message: announcementText,
      type: 'WARNING'
    });
    toast.success('Broadcasted warning alert to this candidate.');
    setAnnouncementText('');
  };

  const handleForceTerminate = (session: LiveStudentSession) => {
    if (!socket || !announcementText.trim()) {
      toast.error('Please enter a reason for termination.');
      return;
    }
    socket.emit('terminate-exam-session', {
      examId: session.examId,
      studentId: session.studentId,
      reason: announcementText
    });
    toast.success(`Force-terminated exam session for ${session.studentName}.`);
    setAnnouncementText('');
  };

  const formatRemainingTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
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
          <p className="text-muted-foreground mt-1">Real-time candidate monitoring dashboard.</p>
        </div>
        <div className="flex items-center gap-2 border border-border px-3.5 py-1.5 rounded-lg text-sm bg-card">
          <span className="font-semibold">Network status:</span>
          {connected ? (
            <span className="text-emerald-400 font-medium">Synced</span>
          ) : (
            <span className="text-red-400 font-medium">Reconnecting</span>
          )}
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-xl flex flex-col items-center justify-center gap-4 min-h-[300px]">
          <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center text-muted-foreground">
            <UserCheck2 size={32} />
          </div>
          <div>
            <h3 className="font-semibold text-lg">No active examinations</h3>
            <p className="text-sm text-muted-foreground mt-1">There are no candidates sitting for examinations currently.</p>
          </div>
        </div>
      ) : (
        /* Multi-grid Layout: Live Session Cards + Side NOC Feed */
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
          
          {/* Main Sessions Grid */}
          <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
            {sessions.map((session) => {
              const faceViolCount = session.faceViolationCount || 0;
              const faceState = session.faceStatus || 'normal';
              
              const hasViolations = session.tabSwitchCount > 0 || session.exitFullscreenCount > 0 || faceViolCount > 0;
              const isDanger = session.tabSwitchCount >= 3 || session.exitFullscreenCount >= 3 || faceViolCount >= 3;

              return (
                <div
                  key={`${session.examId}::${session.studentId}`}
                  className={`glass-card p-6 rounded-xl flex flex-col justify-between transition-all duration-300 border
                    ${isDanger ? 'border-red-500/50 glow-danger bg-red-950/5' : hasViolations ? 'border-amber-500/40 bg-amber-950/5' : 'border-border'}
                  `}
                >
                  <div>
                    {/* Student Info Title */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-base">{session.studentName}</h3>
                        <p className="text-xs text-muted-foreground">Exam ID: {session.examId.substring(0,8)}...</p>
                      </div>

                      <div className="flex items-center gap-1">
                        {session.internetStatus === 'online' ? (
                          <Wifi className="text-emerald-500" size={16} />
                        ) : (
                          <WifiOff className="text-red-500 animate-bounce" size={16} />
                        )}
                      </div>
                    </div>

                    {/* Telemetry info rows */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center py-1.5 border-b border-border">
                        <span className="text-muted-foreground flex items-center gap-1.5"><Monitor size={14} /> Screen state</span>
                        <span className={`font-semibold ${session.fullscreenStatus ? 'text-emerald-400' : 'text-red-400'}`}>
                          {session.fullscreenStatus ? 'Locked (Fullscreen)' : 'Windowed / Minimize'}
                        </span>
                      </div>

                      {/* Webcam Gaze status */}
                      <div className="flex justify-between items-center py-1.5 border-b border-border">
                        <span className="text-muted-foreground flex items-center gap-1.5"><Video size={14} /> Webcam gaze</span>
                        <span className={`font-semibold ${
                          faceState === 'normal' ? 'text-emerald-400'
                            : faceState === 'look_away' ? 'text-orange-400'
                            : 'text-red-400 animate-pulse'
                        }`}>
                          {faceState === 'normal' ? 'Gaze Verified'
                            : faceState === 'look_away' ? 'Gaze Look Away'
                            : faceState === 'multiple_faces' ? 'Multiple Faces'
                            : 'No Face Found'}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-1.5 border-b border-border">
                        <span className="text-muted-foreground flex items-center gap-1.5"><Clock size={14} /> Time Remaining</span>
                        <span className="font-mono font-semibold">{formatRemainingTime(session.remainingTime)}</span>
                      </div>

                      <div className="flex justify-between items-center py-1.5 border-b border-border">
                        <span className="text-muted-foreground flex items-center gap-1.5"><AlertTriangle size={14} /> Screen Violations</span>
                        <span className={`font-bold ${session.tabSwitchCount + session.exitFullscreenCount > 0 ? 'text-amber-500' : ''}`}>
                          Tabs: {session.tabSwitchCount} | Escapes: {session.exitFullscreenCount}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-1.5">
                        <span className="text-muted-foreground flex items-center gap-1.5"><AlertTriangle size={14} /> Face Violations</span>
                        <span className={`font-bold ${faceViolCount > 0 ? 'text-red-500' : ''}`}>{faceViolCount}</span>
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
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Live Security Log</h3>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs select-none">
                {alerts.length === 0 ? (
                  <div className="text-center py-16 text-slate-500 space-y-1">
                    <p>No proctor warnings flagged.</p>
                    <p className="text-[10px]">Telemetry active & watching...</p>
                  </div>
                ) : (
                  alerts.map((al, idx) => (
                    <div key={idx} className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg space-y-1.5 animate-fade-in">
                      <div className="flex justify-between items-center text-[10px] text-slate-500">
                        <span className="font-bold text-slate-300">{al.studentName}</span>
                        <span>{new Date(al.timestamp).toLocaleTimeString()}</span>
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
              <p className="text-xs text-muted-foreground mt-1">To: {selectedSession.studentName}</p>
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
