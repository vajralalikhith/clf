import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { LucideIcon, FileQuestion } from 'lucide-react';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionTo?: string;
  onActionClick?: () => void;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = FileQuestion,
  title,
  description,
  actionText,
  actionTo,
  onActionClick,
  actionLabel,
  onAction,
  className = ''
}) => {
  const buttonLabel = actionText || actionLabel;
  const clickHandler = onActionClick || onAction;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mb-4 shadow-inner">
        <Icon className="w-8 h-8" />
      </div>

      <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white mb-1">
        {title}
      </h3>

      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {buttonLabel && actionTo && (
        <Link
          to={actionTo}
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 active:scale-95"
        >
          {buttonLabel}
        </Link>
      )}

      {buttonLabel && !actionTo && clickHandler && (
        <button
          onClick={clickHandler}
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 active:scale-95"
        >
          {buttonLabel}
        </button>
      )}
    </motion.div>
  );
};
