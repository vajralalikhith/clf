import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { MapPin, Calendar, Eye, Tag, Award, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Item } from '../types';
import { OptimizedImage } from './OptimizedImage';

interface ItemCardProps {
  item: Item;
  onClaim?: (item: Item) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onClaim }) => {
  const isLost = item.type === 'lost';

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group bg-white dark:bg-slate-900 rounded-2xl shadow-sm hover:shadow-md border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col justify-between"
    >
      <div>
        {/* Card Image Header */}
        <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
          <OptimizedImage
            src={item.imageUrl || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&q=80&w=800'}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Type Tag (Lost vs Found) */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider shadow-sm backdrop-blur-md ${
                isLost
                  ? 'bg-amber-500/95 text-white'
                  : 'bg-blue-600/95 text-white'
              }`}
            >
              {item.type}
            </span>

            {item.status === 'claimed' && (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-600 text-white flex items-center gap-1 shadow-sm">
                <CheckCircle2 className="w-3 h-3" /> Claimed
              </span>
            )}
          </div>

          {/* Category Badge */}
          <div className="absolute bottom-3 right-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-900/75 text-white backdrop-blur-md">
              <Tag className="w-3 h-3" /> {item.category}
            </span>
          </div>

          {/* Reward pill if any */}
          {item.reward && (
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-900/80 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700 shadow-sm">
                <Award className="w-3 h-3" /> {item.reward}
              </span>
            </div>
          )}
        </div>

        {/* Card Content Body */}
        <div className="p-5">
          <Link to={`/item/${item.id}`} className="block group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-1 text-base sm:text-lg mb-1">
              {item.title}
            </h3>
          </Link>

          <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 mb-4 leading-relaxed">
            {item.description}
          </p>

          <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-3">
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="truncate">{item.location}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{item.date} {item.time && `at ${item.time}`}</span>
              </div>
              {item.viewsCount !== undefined && (
                <div className="flex items-center gap-1 text-slate-400">
                  <Eye className="w-3 h-3" />
                  <span>{item.viewsCount}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="px-5 pb-5 pt-1 flex items-center justify-between gap-3">
        <Link
          to={`/item/${item.id}`}
          className="flex-1 py-2.5 min-h-[44px] flex items-center justify-center px-3 text-center rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-[0.98] transition-all"
        >
          View Details
        </Link>

        {item.status === 'active' && (
          <button
            onClick={() => onClaim ? onClaim(item) : undefined}
            className={`py-2.5 min-h-[44px] px-4 rounded-xl text-xs font-semibold text-white transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-1.5 ${
              isLost
                ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            {isLost ? 'I Found This' : 'Claim Item'}
          </button>
        )}
      </div>
    </motion.div>
  );
};
