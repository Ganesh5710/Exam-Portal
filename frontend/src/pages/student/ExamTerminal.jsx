import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { useAntiCheat } from "../../hooks/useAntiCheat";
import { useTimer } from "../../hooks/useTimer";
import {
  Clock,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  CheckCircle,
  AlertOctagon,
  Maximize2,
  Video,
  VideoOff,
  UserCheck,
} from "lucide-react";
import toast from "react-hot-toast";

// Utility script loader for dynamic CDN models loading
// Resolves a promise once the script tag has finished importing into the document header.
// Used for loading script assets dynamically on-demand, such as the TensorFlow Face Detection CDN.
const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    // If script is already registered in the document body, resolve immediately
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.body.appendChild(script);
  });
};

export const ExamTerminal = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Answers State: maps questionId to student answer structure { value, selectedOption, selectedOptions, language }
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState({});
  const [executingCode, setExecutingCode] = useState(false);
  const [codeOutput, setCodeOutput] = useState(null);
  const [customInput, setCustomInput] = useState("");
  const [selectedLang, setSelectedLang] = useState("python");

  // AI Webcam Proctoring States
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [proctorActive, setProctorActive] = useState(false);
  const [proctorWarning, setProctorWarning] = useState(null);
  const [faceCount, setFaceCount] = useState(0);
  const violationSustainedSeconds = useRef({});

  const isSubmitting = useRef(false);
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);

  // Fullscreen state listener to dynamically lock/unlock exam view
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
    };
  }, []);

  // Fetch exam questions
  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await api.get(`/exams/${id}/questions`);
        setExam(res.data.data.exam);
        setQuestions(res.data.data.questions);

        // Load progress cache from localStorage for Offline Resilience
        if (user) {
          const cacheKey = `exam_progress_${id}_${user.id}`;
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              if (parsed.answers) setAnswers(parsed.answers);
              if (parsed.markedForReview)
                setMarkedForReview(parsed.markedForReview);
              toast.success(
                "Restored previous exam progress from local cache.",
              );
            } catch (cacheErr) {
              console.error("Failed to parse cached progress:", cacheErr);
            }
          }
        }

        // Socket initial tracking
        if (socket && user) {
          socket.emit("start-exam-session", {
            studentId: user.id,
            studentName: `${user.firstName} ${user.lastName}`,
            examId: id,
          });
        }
      } catch (err) {
        toast.error("Failed to initialize exam workspace.");
        navigate("/student/exams");
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [id, socket, user]);

  // Sync selected language dynamically based on question's previous state
  useEffect(() => {
    const currentQuestion = questions[currentIndex];
    if (currentQuestion && currentQuestion.type === "CODING") {
      const savedLang = answers[currentQuestion.id]?.language;
      if (savedLang) {
        setSelectedLang(savedLang);
      }
    }
  }, [currentIndex, questions, answers]);

  // Duration Calculations
  const getSecondsRemaining = () => {
    if (!exam) return 600;
    const end = new Date(exam.endTime).getTime();
    const now = Date.now();
    const timeLeftInWindow = Math.floor((end - now) / 1000);

    const startedTime = new Date(exam.assignmentStartTime).getTime();
    const durationLimit = exam.duration * 60;
    const elapsed = Math.floor((now - startedTime) / 1000);
    const timeLeftInDuration = durationLimit - elapsed;

    return Math.min(timeLeftInWindow, timeLeftInDuration);
  };

  const handleTimeUp = () => {
    if (!isSubmitting.current) {
      toast.error("Time expired! Submitting responses automatically...", {
        id: "time-up-toast",
      });
      triggerSubmit();
    }
  };

  const { secondsLeft, formatTime, setSecondsLeft } = useTimer({
    initialSeconds: exam ? getSecondsRemaining() : 600,
    onTimeUp: handleTimeUp,
  });

  const triggerSubmit = async () => {
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    setLoading(true);

    try {
      // 1. Save outstanding answers
      const answersList = Object.keys(answers).map((qId) => ({
        questionId: qId,
        studentAnswer: answers[qId],
      }));

      await api.post("/submissions/save", { examId: id, answers: answersList });

      // 2. Submit assessment
      await api.post("/submissions/submit", {
        examId: id,
        tabSwitchCount: tabSwitches,
        exitFullscreenCount: fullscreenExits,
      });

      // Clear Socket session
      if (socket && user) {
        socket.emit("end-exam-session", { studentId: user.id, examId: id });
      }

      // Clear offline progress cache on successful submission
      if (user) {
        localStorage.removeItem(`exam_progress_${id}_${user.id}`);
      }

      toast.success("Examination submitted successfully!");
      navigate(`/student/exams/${id}/confirmation`);
    } catch (err) {
      toast.error("Submission encountered errors. Saving local copy...");
      isSubmitting.current = false;
      setLoading(false);
    }
  };

  const { tabSwitches, fullscreenExits, enterFullscreen } = useAntiCheat({
    examId: id || "",
    studentId: user?.id || "",
    fullscreenRequired: exam?.fullscreenRequired || false,
    maxViolations: 5,
    onAutoSubmit: triggerSubmit,
  });

  // Dynamic Gaze/Face AI Proctoring Hook Setup
  useEffect(() => {
    if (loading || !exam || !user) return;

    let active = true;
    let model = null;
    let stream = null;
    let intervalId = null;

    const initProctor = async () => {
      try {
        // Dynamically import TensorFlow and BlazeFace from CDN
        await loadScript(
          "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.20.0/dist/tf.min.js",
        );
        await loadScript(
          "https://cdn.jsdelivr.net/npm/@tensorflow-models/blazeface@0.0.7/dist/blazeface.min.js",
        );

        if (!active) return;

        // Initialize webcam
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 320, height: 240, facingMode: "user" },
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (camErr) {
          toast.error(
            "Webcam access failed. Running simulation proctor feed...",
            { id: "webcam-err" },
          );
          runSimulation();
          return;
        }

        const blazeface = window.blazeface;
        if (blazeface) {
          model = await blazeface.load({ maxFaces: 5, scoreThreshold: 0.5 });
          setProctorActive(true);

          intervalId = setInterval(async () => {
            if (videoRef.current && canvasRef.current && model) {
              const video = videoRef.current;
              const canvas = canvasRef.current;
              const ctx = canvas.getContext("2d");

              if (ctx && video.readyState === 4) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                const predictions = await model.estimateFaces(video, false);
                setFaceCount(predictions.length);

                let warning = null;
                let violationType = null;
                let violationDetails = "";

                if (predictions.length === 0) {
                  warning = "NO FACE DETECTED";
                  violationType = "NO_FACE_DETECTED";
                  violationDetails =
                    "Student walked away or covered the camera.";
                  // Render warning overlay
                  ctx.fillStyle = "rgba(239, 68, 68, 0.15)";
                  ctx.fillRect(0, 0, canvas.width, canvas.height);
                } else if (predictions.length > 1) {
                  warning = "MULTIPLE FACES DETECTED";
                  violationType = "MULTIPLE_FACES";
                  violationDetails = `${predictions.length} faces visible in frame.`;
                  ctx.strokeStyle = "#ef4444";
                  ctx.lineWidth = 3;
                  for (const pred of predictions) {
                    const start = pred.topLeft;
                    const end = pred.bottomRight;
                    ctx.strokeRect(
                      start[0],
                      start[1],
                      end[0] - start[0],
                      end[1] - start[1],
                    );
                  }
                } else {
                  // Single face detected: run gaze/goniometry head-turn check
                  const pred = predictions[0];
                  const start = pred.topLeft;
                  const end = pred.bottomRight;
                  const width = end[0] - start[0];
                  const height = end[1] - start[1];

                  // Render green face box
                  ctx.strokeStyle = "#10b981";
                  ctx.lineWidth = 2;
                  ctx.strokeRect(start[0], start[1], width, height);

                  // Calculate ratio of nose position between eyes
                  const landmarks = pred.landmarks;
                  if (landmarks && landmarks.length >= 3) {
                    const rightEye = landmarks[0];
                    const leftEye = landmarks[1];
                    const nose = landmarks[2];

                    const distRight = Math.abs(nose[0] - rightEye[0]);
                    const distLeft = Math.abs(leftEye[0] - nose[0]);
                    const ratio = distRight / distLeft;

                    if (ratio < 0.35 || ratio > 2.8) {
                      warning = "LOOKING AWAY DETECTED";
                      violationType = "FACE_LOOK_AWAY";
                      violationDetails = `Head turned away (gaze ratio: ${ratio.toFixed(2)}).`;

                      ctx.strokeStyle = "#ef4444";
                      ctx.lineWidth = 3;
                      ctx.strokeRect(start[0], start[1], width, height);
                    }
                  }
                }

                setProctorWarning(warning);

                // Handle sustained violations (must persist 5 seconds)
                if (violationType) {
                  const currentSecs =
                    violationSustainedSeconds.current[violationType] || 0;
                  const nextSecs = currentSecs + 0.5;
                  violationSustainedSeconds.current[violationType] = nextSecs;

                  if (nextSecs >= 5) {
                    if (socket && user && exam) {
                      socket.emit("security-violation", {
                        studentId: user.id,
                        examId: exam.id,
                        violationType,
                        details: violationDetails,
                      });
                      toast.error(
                        `Security Warning: ${warning}! Flagged to Admin proctor.`,
                        { id: `warn-${violationType}` },
                      );
                    }
                    violationSustainedSeconds.current[violationType] = 0; // throttle repeated alerts
                  }
                } else {
                  violationSustainedSeconds.current = {};
                }
              }
            }
          }, 500);
        }
      } catch (err) {
        console.error(
          "Proctor initialization error, using fallback simulation:",
          err,
        );
        runSimulation();
      }
    };

    const runSimulation = () => {
      setProctorActive(true);
      intervalId = setInterval(() => {
        setFaceCount(1);
        setProctorWarning(null);
      }, 5000);
    };

    initProctor();

    return () => {
      active = false;
      if (intervalId) clearInterval(intervalId);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [loading, exam, socket, user]);

  // Socket Telemetry sync loop
  useEffect(() => {
    if (!socket || !exam || !user || isSubmitting.current) return;

    const interval = setInterval(() => {
      socket.emit("report-progress", {
        studentId: user.id,
        examId: exam.id,
        currentQuestionIndex: currentIndex,
        remainingTime: secondsLeft,
        internetStatus: navigator.onLine ? "online" : "offline",
        fullscreenStatus: !!document.fullscreenElement,
        faceStatus:
          proctorWarning === "NO FACE DETECTED"
            ? "no_face"
            : proctorWarning === "MULTIPLE FACES DETECTED"
              ? "multiple_faces"
              : proctorWarning === "LOOKING AWAY DETECTED"
                ? "look_away"
                : "normal",
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [socket, exam, user, currentIndex, secondsLeft, proctorWarning]);

  // Listen to admin alerts and command controls (time extension, force termination)
  useEffect(() => {
    if (!socket || !id || !user) return;

    const handleAnnouncement = (announcement) => {
      toast(announcement.message, {
        icon: "📢",
        duration: 8000,
        style: {
          background: "#8B5CF6",
          color: "#ffffff",
        },
      });
    };

    const handleTimeExtended = (data) => {
      const addedSecs = data.extensionMinutes * 60;
      setSecondsLeft((prev) => prev + addedSecs);
      toast.success(
        `Proctor extended your exam time by ${data.extensionMinutes} minutes!`,
        {
          icon: "⏳",
          duration: 8000,
        },
      );
    };

    const handleForceTerminate = (data) => {
      toast.error(
        `Exam Terminated by Proctor: ${data.reason}. Submitting answers...`,
        {
          icon: "⚠️",
          duration: 10000,
        },
      );
      triggerSubmit();
    };

    socket.on("announcement-broadcast", handleAnnouncement);
    socket.on(`time-extended::${id}::${user.id}`, handleTimeExtended);
    socket.on(`force-terminate::${id}::${user.id}`, handleForceTerminate);

    return () => {
      socket.off("announcement-broadcast", handleAnnouncement);
      socket.off(`time-extended::${id}::${user.id}`, handleTimeExtended);
      socket.off(`force-terminate::${id}::${user.id}`, handleForceTerminate);
    };
  }, [socket, id, user, setSecondsLeft]);

  // Auto-Save background cycle (Every 15s to Database)
  useEffect(() => {
    if (loading || isSubmitting.current) return;

    const autoSave = async () => {
      try {
        const answersList = Object.keys(answers).map((qId) => ({
          questionId: qId,
          studentAnswer: answers[qId],
        }));
        if (answersList.length > 0) {
          await api.post("/submissions/save", {
            examId: id,
            answers: answersList,
          });
        }
      } catch (e) {
        // Silently capture sync network losses (localStorage keeps copy)
      }
    };

    const interval = setInterval(autoSave, 15000);
    return () => clearInterval(interval);
  }, [answers, id, loading]);

  // Save to local cache immediately upon answer updates for Offline Resilience
  useEffect(() => {
    if (exam && user && Object.keys(answers).length > 0) {
      const cacheKey = `exam_progress_${exam.id}_${user.id}`;
      localStorage.setItem(
        cacheKey,
        JSON.stringify({ answers, markedForReview }),
      );
    }
  }, [answers, markedForReview, exam, user]);

  const handleSelectOption = (qId, option) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: { selectedOption: option },
    }));
  };

  const handleTextChange = (qId, value) => {
    const currentQ = questions[currentIndex];
    setAnswers((prev) => ({
      ...prev,
      [qId]: {
        value,
        ...(currentQ?.type === "CODING"
          ? { language: prev[qId]?.language || selectedLang }
          : {}),
      },
    }));
  };

  const handleLanguageChange = (lang) => {
    setSelectedLang(lang);
    const qId = questions[currentIndex]?.id;
    if (qId) {
      setAnswers((prev) => ({
        ...prev,
        [qId]: {
          ...prev[qId],
          language: lang,
        },
      }));
    }
  };

  // Tab key intercepting for textarea editor mapping spaces instead of shifting focus
  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;
      const newVal = val.substring(0, start) + "    " + val.substring(end);
      const qId = questions[currentIndex]?.id;
      if (qId) {
        handleTextChange(qId, newVal);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 4;
        }, 0);
      }
    }
  };

  const handleRunCode = async (qId) => {
    const studentCode = answers[qId]?.value || "";
    if (!studentCode.trim()) {
      toast.error("Code body cannot be blank.");
      return;
    }

    setExecutingCode(true);
    setCodeOutput(null);

    try {
      const res = await api.post("/questions/run-code", {
        language: selectedLang,
        code: studentCode,
        input: customInput,
        questionId: qId,
      });

      setCodeOutput(res.data.data);
      if (res.data.data.success) {
        toast.success("Sandbox Run Complete! All public test cases passed.");
      } else {
        toast.error(`Execution failed: ${res.data.data.status}`);
      }
    } catch (e) {
      toast.error("Compilation runner endpoint offline.");
    } finally {
      setExecutingCode(false);
    }
  };

  const handleClear = (qId) => {
    setAnswers((prev) => {
      const copy = { ...prev };
      delete copy[qId];
      return copy;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4 text-center text-slate-100 bg-slate-950">
        <Clock className="animate-spin text-violet-500" size={32} />
        <p className="text-slate-400 text-sm">Syncing test modules...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-5 bg-slate-900/50 border border-slate-850 p-8 rounded-2xl">
          <AlertOctagon className="mx-auto text-amber-500" size={48} />
          <h2 className="text-xl font-bold">No Questions Assigned</h2>
          <p className="text-slate-400 text-sm">
            This exam does not have any questions linked to it yet. Please
            contact your administrator to configure questions.
          </p>
          <button
            onClick={() => navigate("/student/exams")}
            className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-lg transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;

  if (exam?.fullscreenRequired && !isFullscreen) {
    return (
      <div className="min-h-screen bg-[#02000a] text-white flex flex-col items-center justify-center p-6 no-select">
        <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-2xl p-8 text-center space-y-6 shadow-2xl shadow-red-500/5">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-red-500/10 flex items-center justify-center text-red-400">
            <AlertOctagon size={48} className="animate-pulse" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tight text-white">Fullscreen Lockdown Active</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              This examination requires absolute fullscreen mode for academic integrity. Access to exam contents is locked until fullscreen is restored.
            </p>
          </div>
          
          <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl text-left space-y-2 text-xs text-slate-400">
            <div className="flex gap-2.5">
              <span className="text-red-400 font-bold">⚠️ Warning:</span>
              <span>Exiting fullscreen mode logs security violations and alerts proctors in real-time.</span>
            </div>
            <div className="flex gap-2.5 border-t border-slate-800 pt-2">
              <span className="text-red-400 font-bold">⚠️ Threshold:</span>
              <span>Exceeding 5 security violations will result in automatic exam submission.</span>
            </div>
          </div>

          <button
            onClick={enterFullscreen}
            className="w-full py-3.5 bg-violet-600 hover:bg-violet-750 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-violet-600/25 flex items-center justify-center gap-2"
          >
            <Maximize2 size={16} /> Restore Fullscreen & Unlock Exam
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col no-select">
      {/* Locked top Header */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-30">
        <div>
          <h2 className="font-bold text-lg">{exam?.title}</h2>
          <p className="text-xs text-slate-400">
            Duration Limits: {exam?.duration} mins
          </p>
        </div>

        {/* Lock Screen Fullscreen Button */}
        {exam?.fullscreenRequired && !document.fullscreenElement && (
          <button
            onClick={enterFullscreen}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg text-xs font-semibold text-white transition-all shadow-lg animate-pulse"
          >
            <Maximize2 size={14} /> Force Fullscreen
          </button>
        )}

        {/* Big countdown clock */}
        <div className="flex items-center gap-3 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg shadow-inner">
          <Clock className="text-violet-400" size={18} />
          <span className="font-mono text-lg font-bold text-violet-400">
            {formatTime()}
          </span>
        </div>
      </header>

      {/* Main Terminal Grid Split */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden max-w-full">
        {/* Left Side Pane: Question details */}
        <div className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto max-h-[calc(100vh-8rem)]">
          <div className="flex justify-between items-center pb-4 border-b border-slate-900">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Question {currentIndex + 1} of {totalQuestions}
            </span>
            <span className="text-xs font-bold text-violet-400 bg-violet-500/10 px-3 py-1.5 rounded-full border border-violet-500/20">
              +{currentQuestion?.score} Points
            </span>
          </div>

          {/* Question Text */}
          <div className="space-y-6">
            <p className="text-lg font-medium leading-relaxed">
              {currentQuestion?.content ? currentQuestion.content.replace(/^\d+[\s\.\)\-:]+\s*/, "") : ""}
            </p>

            {/* Render input components according to question types */}
            {currentQuestion?.type === "MCQ" && (
              <div className="space-y-3">
                {currentQuestion.options?.map((opt, i) => {
                  const letter = String.fromCharCode(65 + i);
                  const isSelected =
                    answers[currentQuestion.id]?.selectedOption === opt;

                  return (
                    <button
                      key={i}
                      onClick={() =>
                        handleSelectOption(currentQuestion.id, opt)
                      }
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left text-sm font-medium transition-all duration-200
                        ${isSelected ? "bg-primary/10 border-primary shadow-lg shadow-primary/5 text-white" : "bg-slate-900/50 border-slate-800 hover:border-slate-700 text-slate-300"}
                      `}
                    >
                      <span
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs
                        ${isSelected ? "bg-primary text-white" : "bg-slate-800 text-slate-400"}
                      `}
                      >
                        {letter}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}

            {currentQuestion?.type === "TRUE_FALSE" && (
              <div className="flex gap-4">
                {["True", "False"].map((val) => {
                  const isSelected = answers[currentQuestion.id]?.value === val;

                  return (
                    <button
                      key={val}
                      onClick={() => handleTextChange(currentQuestion.id, val)}
                      className={`flex-1 p-4 rounded-xl border text-center font-medium transition-all duration-200
                        ${isSelected ? "bg-primary/10 border-primary text-white" : "bg-slate-900/50 border-slate-800 hover:border-slate-700 text-slate-300"}
                      `}
                    >
                      {val}
                    </button>
                  );
                })}
              </div>
            )}

            {currentQuestion?.type === "FILL_BLANK" && (
              <input
                type="text"
                value={answers[currentQuestion.id]?.value || ""}
                onChange={(e) =>
                  handleTextChange(currentQuestion.id, e.target.value)
                }
                placeholder="Type your answer here..."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-4 text-sm text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
              />
            )}

            {currentQuestion?.type === "DESCRIPTIVE" && (
              <textarea
                value={answers[currentQuestion.id]?.value || ""}
                onChange={(e) =>
                  handleTextChange(currentQuestion.id, e.target.value)
                }
                placeholder="Write your detailed response here..."
                rows={12}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-4 text-sm text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
              />
            )}

            {currentQuestion?.type === "CODING" && (
              <div className="space-y-4">
                {/* Language Select Header */}
                <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-3 rounded-lg">
                  <span className="text-xs text-slate-400 font-semibold uppercase">
                    Coding Workspace
                  </span>
                  <select
                    value={selectedLang}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="python">Python 3</option>
                    <option value="javascript">JavaScript (Node.js)</option>
                    <option value="cpp">C++ (g++)</option>
                    <option value="c">C (gcc)</option>
                    <option value="java">Java (JDK)</option>
                  </select>
                </div>

                {/* Editor Textarea with line gutter mock */}
                <div className="flex border border-slate-800 rounded-lg overflow-hidden bg-slate-950 min-h-[300px]">
                  <div className="w-10 bg-slate-900/50 border-r border-slate-800 py-4 flex flex-col items-center text-slate-600 font-mono text-xs select-none">
                    {Array.from({ length: 15 }).map((_, i) => (
                      <span key={i} className="leading-6">
                        {i + 1}
                      </span>
                    ))}
                  </div>
                  <textarea
                    value={answers[currentQuestion.id]?.value || ""}
                    onChange={(e) =>
                      handleTextChange(currentQuestion.id, e.target.value)
                    }
                    onKeyDown={handleKeyDown}
                    placeholder="// Write your code program here..."
                    className="flex-1 bg-transparent p-4 text-sm font-mono text-white focus:outline-none leading-6 resize-y"
                    rows={15}
                  />
                </div>

                {/* Stdin Inputs and Action bar */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-900">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Custom Input Stream (stdin)
                    </label>
                    <textarea
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      placeholder="Input data to pass to stdin..."
                      rows={4}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs font-mono text-white focus:outline-none focus:border-violet-500 transition-all"
                    />
                  </div>

                  <div className="flex flex-col justify-end">
                    <button
                      type="button"
                      onClick={() => handleRunCode(currentQuestion.id)}
                      disabled={executingCode}
                      className="w-full bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-600/20 transition-all disabled:opacity-50"
                    >
                      {executingCode
                        ? "Compiling & Executing..."
                        : "Run Code against Sandbox"}
                    </button>
                  </div>
                </div>

                {/* Console Logs / Outputs report panel */}
                {codeOutput && (
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-3 font-mono text-xs">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <span className="font-bold uppercase tracking-wider text-slate-400">
                        Sandbox Execution Report
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded font-bold uppercase
                        ${codeOutput.status === "SUCCESS" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}
                      `}
                      >
                        {codeOutput.status}
                      </span>
                    </div>

                    {codeOutput.status === "COMPILATION_ERROR" ? (
                      <pre className="text-red-400 overflow-x-auto whitespace-pre-wrap">
                        {codeOutput.logs}
                      </pre>
                    ) : (
                      <div className="space-y-2">
                        {codeOutput.results.map((res, idx) => (
                          <div key={idx} className="space-y-1">
                            <p className="font-semibold text-slate-400">
                              Test Case {idx + 1} ({res.timeTakenMs}ms):{" "}
                              {res.passed ? (
                                <span className="text-emerald-400">PASSED</span>
                              ) : (
                                <span className="text-red-400">FAILED</span>
                              )}
                            </p>
                            <div className="bg-slate-950 p-2.5 border border-slate-800 rounded space-y-1 mt-1 text-[11px]">
                              <p>
                                <span className="text-slate-500 font-bold">
                                  Input:
                                </span>{" "}
                                {res.input}
                              </p>
                              <p>
                                <span className="text-slate-500 font-bold">
                                  Expected:
                                </span>{" "}
                                {res.expected}
                              </p>
                              <p>
                                <span className="text-slate-500 font-bold">
                                  Output:
                                </span>{" "}
                                {res.actual || res.error || "(empty)"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Controls bottom bar */}
          <div className="flex justify-between items-center pt-8 border-t border-slate-900">
            <div className="flex gap-2">
              <button
                onClick={() => handleClear(currentQuestion.id)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900 transition-all"
              >
                Clear Answer
              </button>
              <button
                onClick={() =>
                  setMarkedForReview((p) => ({
                    ...p,
                    [currentQuestion.id]: !p[currentQuestion.id],
                  }))
                }
                className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all
                  ${markedForReview[currentQuestion.id] ? "bg-amber-500/10 border border-amber-500/20 text-amber-400" : "text-slate-400 hover:text-white"}
                `}
              >
                <Bookmark size={14} />
                Mark Review
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
                disabled={currentIndex === 0}
                className="px-4 py-2.5 rounded-lg border border-slate-800 text-slate-300 text-sm hover:border-slate-700 flex items-center gap-1.5 transition-all disabled:opacity-30 disabled:pointer-events-none"
              >
                <ArrowLeft size={16} /> Prev
              </button>
              {currentIndex < totalQuestions - 1 ? (
                <button
                  onClick={() => setCurrentIndex((p) => p + 1)}
                  className="px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-sm hover:border-slate-700 flex items-center gap-1.5 transition-all"
                >
                  Next <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  onClick={triggerSubmit}
                  className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 font-semibold text-white text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
                >
                  <CheckCircle size={16} /> Submit Exam
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Side Pane: Palette & AI webcam monitor */}
        <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-900/30 p-6 space-y-6 max-h-[calc(100vh-4rem)] overflow-y-auto">
          {/* AI Proctor Live Webcam Stream */}
          <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-3 relative overflow-hidden bg-slate-900/40">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Video size={14} className="text-violet-400" />
                AI Proctor Live Feed
              </h4>
              <span
                className={`w-2 h-2 rounded-full ${proctorActive ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}
              />
            </div>

            <div className="relative aspect-video w-full bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
              />

              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full object-cover scale-x-[-1] pointer-events-none"
              />

              {!proctorActive && (
                <div className="flex flex-col items-center gap-1.5 text-slate-600 text-xs">
                  <VideoOff size={24} />
                  <span>Loading proctor models...</span>
                </div>
              )}

              {proctorWarning && (
                <div className="absolute inset-x-0 bottom-0 bg-red-600/90 text-white text-[10px] font-bold text-center py-1 uppercase tracking-wider animate-pulse">
                  {proctorWarning}
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-500 space-y-1 pt-1 border-t border-slate-800/50 flex justify-between">
              <span className="flex items-center gap-1">
                <UserCheck
                  size={12}
                  className={
                    proctorWarning ? "text-red-400" : "text-emerald-400"
                  }
                />
                Face Count:{" "}
                <strong className="text-slate-300">{faceCount}</strong>
              </span>
              <span>
                Status:{" "}
                <strong
                  className={
                    proctorWarning ? "text-red-400" : "text-emerald-400"
                  }
                >
                  {proctorWarning ? "FLAGGED" : "NORMAL"}
                </strong>
              </span>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400 mb-4">
              Question Palette
            </h3>
            <div className="grid grid-cols-5 gap-2.5">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = !!answers[q.id];
                const isMarked = markedForReview[q.id];

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm border transition-all duration-200
                      ${
                        isCurrent
                          ? "bg-primary border-primary text-white ring-2 ring-primary/40"
                          : isMarked
                            ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                            : isAnswered
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                              : "bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700"
                      }
                    `}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Legend guide */}
          <div className="border-t border-slate-800 pt-6 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
              Legend
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 bg-amber-500/10 border border-amber-500/30 rounded" />
                <span>Marked Review</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 bg-slate-900 border border-slate-800 rounded" />
                <span>Not Visited</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 bg-primary rounded" />
                <span>Current</span>
              </div>
            </div>
          </div>

          {/* Proctor Warnings warning cards */}
          {(tabSwitches > 0 || fullscreenExits > 0) && (
            <div className="border-t border-slate-800 pt-6">
              <div className="p-4 bg-red-950/20 border border-red-500/20 rounded-lg flex gap-3 text-xs text-red-400">
                <AlertOctagon size={16} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Proctor Warnings Active</p>
                  <p className="mt-1">
                    Violations: Tab Switches ({tabSwitches}), Fullscreen Exits (
                    {fullscreenExits}). Exceeding 5 warnings triggers
                    auto-submit.
                  </p>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
export default ExamTerminal;
