import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { AlertTriangle, Home, Search, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, type: 'spring' }}
        className="w-24 h-24 rounded-3xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center justify-center shadow-lg"
      >
        <AlertTriangle className="w-12 h-12" />
      </motion.div>

      <div className="space-y-2 max-w-md">
        <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
          Error 404
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Page or Item Not Found
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          The listing or page you are looking for might have been resolved, removed, or moved to a different location.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Home className="w-4 h-4" /> Go to Dashboard
        </Link>
        <Link
          to="/search"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all focus:outline-none focus:ring-2 focus:ring-slate-400"
        >
          <Search className="w-4 h-4" /> Search Directory
        </Link>
      </div>
    </div>
  );
};
