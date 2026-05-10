'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Warning, Info } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/ui';

const variantStyles = {
  success: {
    bg: 'bg-forest-500',
    icon: CheckCircle,
  },
  error: {
    bg: 'bg-red-500',
    icon: Warning,
  },
  info: {
    bg: 'bg-sand-500',
    icon: Info,
  },
} as const;

const AUTO_DISMISS_MS = 4000;

const ToastItem: React.FC<{
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}> = ({ id, message, type }) => {
  const removeToast = useUIStore((s) => s.removeToast);
  const [progress, setProgress] = React.useState(100);
  const style = variantStyles[type];
  const Icon = style.icon;

  React.useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / AUTO_DISMISS_MS) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        removeToast(id);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [id, removeToast]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.95 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cn(
        'relative flex items-start gap-3 min-w-[300px] max-w-[420px] rounded-lg px-4 py-3 shadow-warm-lg text-white overflow-hidden',
        style.bg
      )}
    >
      <Icon size={20} weight="fill" className="flex-shrink-0 mt-0.5" />
      <p className="text-sm font-medium flex-1">{message}</p>
      <button
        onClick={() => removeToast(id)}
        className="flex-shrink-0 text-white/80 hover:text-white transition-colors p-0.5 rounded-full hover:bg-white/10"
        aria-label="Dismiss toast"
      >
        <X size={16} weight="bold" />
      </button>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10">
        <div
          className="h-full bg-white/30 transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </motion.div>
  );
};

const ToastContainer: React.FC = () => {
  const toasts = useUIStore((s) => s.toasts);

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem
              id={toast.id}
              message={toast.message}
              type={toast.type}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export { ToastContainer };
