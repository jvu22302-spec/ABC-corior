import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { SPRING } from '@/motion/tokens';
import { useMotionPreference } from '@/motion/useMotionPreference';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (message: string, type?: ToastType, title?: string) => void;
  removeToast: (id: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

function ToastItemCard({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const { reduced } = useMotionPreference();
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(100);
  const remainingTimeRef = useRef(4000);
  const lastTimestampRef = useRef<number | null>(null);

  useEffect(() => {
    let animId: number;

    const tick = (now: number) => {
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = now;
      }
      const delta = now - lastTimestampRef.current;
      lastTimestampRef.current = now;

      if (!isHovered) {
        remainingTimeRef.current -= delta;
        const currentProgress = Math.max(0, (remainingTimeRef.current / 4000) * 100);
        setProgress(currentProgress);

        if (remainingTimeRef.current <= 0) {
          onDismiss(toast.id);
          return;
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isHovered, onDismiss, toast.id]);

  let bg = 'bg-white border-ink-200 text-ink-900';
  let IconComponent = Info;
  let iconColor = 'text-info';
  let progressColor = 'bg-info';

  if (toast.type === 'success') {
    bg = 'bg-white border-green-200 text-ink-900';
    IconComponent = CheckCircle2;
    iconColor = 'text-success';
    progressColor = 'bg-success';
  } else if (toast.type === 'error') {
    bg = 'bg-white border-red-200 text-ink-900';
    IconComponent = AlertCircle;
    iconColor = 'text-danger';
    progressColor = 'bg-danger';
  } else if (toast.type === 'warning') {
    bg = 'bg-white border-amber-200 text-ink-900';
    IconComponent = AlertTriangle;
    iconColor = 'text-warning';
    progressColor = 'bg-warning';
  }

  return (
    <m.div
      layout
      initial={reduced ? { opacity: 0 } : { opacity: 0, x: 40, scale: 0.95 }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, x: 0, scale: 1 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, x: 30, scale: 0.9 }}
      transition={reduced ? { duration: 0.1 } : SPRING.snappy}
      role="alert"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        lastTimestampRef.current = null;
        setIsHovered(false);
      }}
      className={`pointer-events-auto relative overflow-hidden p-3.5 rounded-lg border shadow-lg flex items-start gap-3 select-none ${bg}`}
    >
      <IconComponent className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
      <div className="flex-1 min-w-0 pr-2">
        {toast.title && <div className="text-xs font-semibold text-ink-900 mb-0.5">{toast.title}</div>}
        <div className="text-sm text-ink-700 leading-snug break-words">{toast.message}</div>
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="text-ink-400 hover:text-ink-900 p-1 rounded focus:outline-none focus:ring-2 focus:ring-brand-600 shrink-0"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Auto-dismiss shrinking progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-ink-100 overflow-hidden">
        <div
          className={`h-full ${progressColor} transition-all duration-75`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </m.div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', title?: string) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { id, message, type, title };
      setToasts((prev) => [...prev, newToast]);
    },
    []
  );

  const success = useCallback((msg: string, title?: string) => showToast(msg, 'success', title), [showToast]);
  const error = useCallback((msg: string, title?: string) => showToast(msg, 'error', title), [showToast]);
  const warning = useCallback((msg: string, title?: string) => showToast(msg, 'warning', title), [showToast]);
  const info = useCallback((msg: string, title?: string) => showToast(msg, 'info', title), [showToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast, success, error, warning, info }}>
      {children}
      {/* Toast Render Viewport */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <ToastItemCard key={toast.id} toast={toast} onDismiss={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
