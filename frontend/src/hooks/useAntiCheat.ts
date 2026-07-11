import { useEffect, useRef, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';

interface UseAntiCheatProps {
  examId: string;
  studentId: string;
  fullscreenRequired: boolean;
  maxViolations?: number;
  onAutoSubmit: () => void;
}

/**
 * useAntiCheat custom React hook
 * Prevents copy-paste, right click, developer tools, tab switches, and fullscreen escapes.
 * Triggers an auto-submit action if warnings threshold is crossed.
 */
export const useAntiCheat = ({
  examId,
  studentId,
  fullscreenRequired,
  maxViolations = 5,
  onAutoSubmit
}: UseAntiCheatProps) => {
  const { socket } = useSocket();
  const [tabSwitches, setTabSwitches] = useState(0);
  const [fullscreenExits, setFullscreenExits] = useState(0);
  const isSubmitting = useRef(false);

  useEffect(() => {
    // 1. Right Click blocker
    const preventRightClick = (e: MouseEvent) => {
      e.preventDefault();
      toast.error('Right-click is disabled during exams.', { id: 'cheat-right-click' });
    };

    // 2. Text Selection / Copy-Paste blocker
    const preventCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      toast.error('Copy/Paste is disabled during exams.', { id: 'cheat-copy-paste' });
    };

    // 3. Dev tools shortcuts blocker
    const preventShortcuts = (e: KeyboardEvent) => {
      const forbiddenKeys = [
        e.key === 'F12',
        (e.ctrlKey && e.shiftKey && e.key === 'I'), // Inspector
        (e.ctrlKey && e.shiftKey && e.key === 'J'), // Console
        (e.ctrlKey && e.shiftKey && e.key === 'C'), // Elements
        (e.ctrlKey && e.key === 'u'),             // View Source
        (e.ctrlKey && e.key === 'c'),             // Copy
        (e.ctrlKey && e.key === 'v'),             // Paste
        (e.metaKey),                              // OS key
      ];

      if (forbiddenKeys.some(Boolean)) {
        e.preventDefault();
        toast.error('Keyboard shortcut blocked.', { id: 'cheat-shortcut' });
      }
    };

    // 4. Tab Switch Detection
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches(prev => {
          const newCount = prev + 1;
          triggerViolationAlert('TAB_SWITCH', `Switched away from browser tab. Count: ${newCount}`);
          return newCount;
        });
      }
    };

    // 5. Fullscreen change listener
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && fullscreenRequired && !isSubmitting.current) {
        setFullscreenExits(prev => {
          const newCount = prev + 1;
          triggerViolationAlert('FULLSCREEN_EXIT', `Exited fullscreen mode. Count: ${newCount}`);
          return newCount;
        });
        toast.error('Fullscreen mode is required. Please re-enter fullscreen.', { id: 'fullscreen-warn', duration: 5000 });
      }
    };

    const triggerViolationAlert = (type: 'TAB_SWITCH' | 'FULLSCREEN_EXIT', details: string) => {
      if (socket) {
        socket.emit('security-violation', {
          studentId,
          examId,
          violationType: type,
          details
        });
      }
      toast.error(`Warning: ${details}`, { duration: 5000 });
    };

    document.addEventListener('contextmenu', preventRightClick);
    document.addEventListener('copy', preventCopyPaste);
    document.addEventListener('paste', preventCopyPaste);
    document.addEventListener('keydown', preventShortcuts);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('contextmenu', preventRightClick);
      document.removeEventListener('copy', preventCopyPaste);
      document.removeEventListener('paste', preventCopyPaste);
      document.removeEventListener('keydown', preventShortcuts);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [socket, examId, studentId, fullscreenRequired]);

  // Check limits
  useEffect(() => {
    const totalViolations = tabSwitches + fullscreenExits;
    if (totalViolations >= maxViolations && !isSubmitting.current) {
      isSubmitting.current = true;
      toast.error('Maximum cheating warnings exceeded. Auto-submitting exam...', {
        duration: 10000,
        id: 'force-submit-toast'
      });
      setTimeout(() => {
        onAutoSubmit();
      }, 2000);
    }
  }, [tabSwitches, fullscreenExits, maxViolations, onAutoSubmit]);

  // Request fullscreen
  const enterFullscreen = () => {
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen().catch(() => {
        toast.error('Failed to request fullscreen. Ensure browser has permissions.');
      });
    }
  };

  return {
    tabSwitches,
    fullscreenExits,
    enterFullscreen,
    isViolationExceeded: tabSwitches + fullscreenExits >= maxViolations
  };
};
