import React from 'react';
import { Compass } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showSubtitle = true }) => {
  const iconSizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-xl'
  };

  const compassSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7'
  };

  return (
    <div className="flex items-center gap-2.5 group">
      <div className={`${iconSizes[size]} rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform duration-200`}>
        <Compass className={`${compassSizes[size]} animate-pulse`} />
      </div>
      <div className="flex flex-col">
        <span className="font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight">
          Campus<span className="text-blue-600 dark:text-blue-400"> Lost&Found</span>
        </span>
        {showSubtitle && (
          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
            AI Recovery Network
          </span>
        )}
      </div>
    </div>
  );
};
