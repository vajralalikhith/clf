import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  // Keyboard trap & ESC key handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      confirmBtnRef.current?.focus();
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      iconBg: 'bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400',
      btnBg: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    },
    warning: {
      iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
      btnBg: 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500',
    },
    primary: {
      iconBg: 'bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400',
      btnBg: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    },
  }[variant];

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-desc"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4 relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-2xl shrink-0 ${variantStyles.iconBg}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 id="confirm-modal-title" className="text-lg font-bold text-slate-900 dark:text-white">
                {title}
              </h3>
              <p id="confirm-modal-desc" className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {message}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              {cancelText}
            </button>
            <button
              ref={confirmBtnRef}
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              disabled={isLoading}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all focus:outline-none focus:ring-2 shadow-sm ${variantStyles.btnBg}`}
            >
              {isLoading ? 'Processing...' : confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
