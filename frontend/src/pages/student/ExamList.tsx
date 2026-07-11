import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Calendar, Clock, BookOpen, ChevronRight, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

interface Exam {
  id: string;
  assignmentId: string;
  title: string;
  duration: number;
  startTime: string;
  endTime: string;
  status: string; // ASSIGNED, STARTED, SUBMITTED
  subject: { name: string; code: string };
  submission?: {
    id: string;
    status: string;
    totalScore: number | null;
    percentage: number | null;
    grade: string | null;
    isPassed: boolean | null;
    maxPossibleScore: number;
  } | null;
}

/**
 * Student assessments list component
 * Fetches and displays all exams assigned to the logged-in student
 * Supports real-time countdown availability checks
 */
export const ExamList: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await api.get('/exams');
        setExams(res.data.data);
      } catch (err: any) {
        toast.error('Failed to load assigned exams.');
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  const handleStartProcess = (exam: Exam) => {
    navigate(`/student/exams/${exam.id}/instructions`);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse max-w-4xl mx-auto">
        <div className="h-8 bg-muted rounded w-1/4" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-muted rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Assessments</h1>
        <p className="text-muted-foreground mt-1">Review and select an active assigned examination to start.</p>
      </div>

      {exams.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-xl flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center text-muted-foreground">
            <Lock size={32} />
          </div>
          <div>
            <h3 className="font-semibold text-lg">No assigned exams</h3>
            <p className="text-sm text-muted-foreground mt-1">You do not have any pending examinations assigned to you.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {exams.map((exam) => {
            const isSubmitted = exam.status === 'SUBMITTED';
            const examStart = new Date(exam.startTime);
            const examEnd = new Date(exam.endTime);
            const isNotStarted = currentTime < examStart;
            const isExpired = currentTime > examEnd;
            const isAvailable = !isSubmitted && !isNotStarted && !isExpired;

            return (
              <div
                key={exam.id}
                className={`glass-card p-6 rounded-xl border border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 transition-all duration-300
                  ${isAvailable ? 'hover:border-primary/40 hover:glow-primary' : 'opacity-65'}
                `}
              >
                <div className="space-y-3">
                  {/* Title & Subject */}
                  <div>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-primary/10 text-primary rounded-full uppercase tracking-wider">
                      {exam.subject.name} ({exam.subject.code})
                    </span>
                    <h3 className="font-bold text-xl mt-2">{exam.title}</h3>
                  </div>

                  {/* Meta details */}
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Clock size={16} /> {exam.duration} Minutes</span>
                    <span className="flex items-center gap-1.5"><Calendar size={16} /> Start: {examStart.toLocaleDateString()} {examStart.toLocaleTimeString()}</span>
                  </div>
                </div>

                {/* Status Trigger */}
                <div>
                  {isSubmitted ? (
                    exam.submission?.status === 'PUBLISHED' ? (
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${
                          exam.submission.isPassed 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          Score: {exam.submission.totalScore} / {exam.submission.maxPossibleScore} ({exam.submission.grade})
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                          Result Released ({exam.submission.isPassed ? 'Passed' : 'Failed'})
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs font-semibold bg-amber-500/10 text-amber-400 px-4 py-2 rounded-lg border border-amber-500/20">
                        Awaiting Grade Release
                      </span>
                    )
                  ) : isNotStarted ? (
                    <span className="text-xs font-semibold bg-blue-500/10 text-blue-400 px-4 py-2 rounded-lg border border-blue-500/20">
                      Starts Scheduled Time
                    </span>
                  ) : isExpired ? (
                    <span className="text-xs font-semibold bg-red-500/10 text-red-400 px-4 py-2 rounded-lg border border-red-500/20">
                      Exam Window Expired
                    </span>
                  ) : (
                    <button
                      onClick={() => handleStartProcess(exam)}
                      className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/95 text-sm flex items-center gap-2 shadow-lg shadow-primary/20 transition-all"
                    >
                      Begin Exam
                      <ChevronRight size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default ExamList;
