import React from 'react';

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm animate-pulse space-y-3 p-4">
      <div className="w-full h-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      <div className="flex items-center justify-between">
        <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-4 w-1/4 bg-slate-200 dark:bg-slate-800 rounded-lg" />
      </div>
      <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-lg" />
      <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded-lg" />
      <div className="h-3 w-2/3 bg-slate-200 dark:bg-slate-800 rounded-lg" />
      <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
        <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-7 w-20 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>
    </div>
  );
};

export const ListSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 animate-pulse flex items-center gap-4">
      <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-5 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-3 w-2/3 bg-slate-200 dark:bg-slate-800 rounded-lg" />
      </div>
      <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl shrink-0 hidden sm:block" />
    </div>
  );
};

export const DetailSkeleton: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
      <div className="w-full h-80 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="h-6 w-1/4 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-8 w-2/3 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-4 w-4/5 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
      </div>
    </div>
  );
};
