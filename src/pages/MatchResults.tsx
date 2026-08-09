import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  ArrowLeft,
  Search,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Calendar,
  AlertCircle,
  RefreshCw,
  Eye,
  Sliders,
  Filter,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { findVisuallySimilarFoundItems, ImageMatchResult } from '../services/imageMatchingService';
import { Item } from '../types';
import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const MatchResults: React.FC = () => {
  const { itemId } = useParams<{ itemId?: string }>();
  const [searchParams] = useSearchParams();
  const imageUrlQuery = searchParams.get('image');

  const { items, showToast } = useApp();
  const navigate = useNavigate();

  // Selected lost item or custom uploaded image
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [customImageUrl, setCustomImageUrl] = useState<string>('');
  const [customTitle, setCustomTitle] = useState<string>('Uploaded Lost Item Photo');

  // Match state
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [matches, setMatches] = useState<ImageMatchResult[]>([]);
  const [minScoreFilter, setMinScoreFilter] = useState<number>(50);

  // Find lost items available in app for quick selection dropdown
  const lostItems = items.filter(i => i.type === 'lost');

  useEffect(() => {
    let targetItem: Item | undefined;
    if (itemId) {
      targetItem = items.find(i => i.id === itemId);
    }

    if (targetItem) {
      setSelectedItem(targetItem);
      setCustomImageUrl(targetItem.imageUrl || '');
      setCustomTitle(targetItem.title);
    } else if (imageUrlQuery) {
      setCustomImageUrl(imageUrlQuery);
      setSelectedItem(null);
    } else if (lostItems.length > 0) {
      // Default to first lost item if present
      setSelectedItem(lostItems[0]);
      setCustomImageUrl(lostItems[0].imageUrl || '');
      setCustomTitle(lostItems[0].title);
    }
  }, [itemId, imageUrlQuery, items]);

  // Run AI matching when image or item changes
  const runAiMatching = async () => {
    setIsScanning(true);
    try {
      const activeImage = selectedItem?.imageUrl || customImageUrl;
      const results = await findVisuallySimilarFoundItems(
        activeImage,
        selectedItem || { title: customTitle, category: 'Electronics' },
        items
      );
      setMatches(results);
    } catch (err) {
      console.error('Error running AI image match:', err);
      showToast('Error generating visual matches.');
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    if (selectedItem || customImageUrl) {
      runAiMatching();
    } else {
      setIsScanning(false);
    }
  }, [selectedItem, customImageUrl, items]);

  const filteredMatches = matches.filter(m => m.similarityScore >= minScoreFilter);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Back navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Item Selector Dropdown */}
        {lostItems.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">
              Scanning Lost Item:
            </span>
            <select
              value={selectedItem?.id || ''}
              onChange={(e) => {
                const found = items.find(i => i.id === e.target.value);
                if (found) {
                  setSelectedItem(found);
                  setCustomImageUrl(found.imageUrl || '');
                  setCustomTitle(found.title);
                  navigate(`/match-results/${found.id}`);
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {lostItems.map(item => (
                <option key={item.id} value={item.id}>
                  {item.title} ({item.location})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white p-6 sm:p-8 rounded-3xl shadow-lg space-y-3">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>AI Vision Matching Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
          Visual Match Results
        </h1>
        <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
          Comparing the visual features, color histogram, contour signatures, and metadata of your lost report against all active campus found items.
        </p>
      </div>

      {/* Main Content Grid: Left Source Image vs Right Matches */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 4 Cols: Source Lost Item Card */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 sticky top-24">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Source Lost Photo
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md">
                Target Image
              </span>
            </div>

            {/* Source Image Display with Scanner Effect */}
            <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-950 border border-slate-200 dark:border-slate-800 group">
              <img
                src={customImageUrl || selectedItem?.imageUrl || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&q=80&w=800'}
                alt={customTitle}
                className="w-full h-full object-cover"
              />
              {/* Laser scanning overlay when scanning */}
              {isScanning && (
                <div className="absolute inset-0 bg-blue-500/10 pointer-events-none">
                  <motion.div
                    initial={{ top: '0%' }}
                    animate={{ top: '100%' }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#38bdf8]"
                  />
                </div>
              )}
            </div>

            {/* Source Details */}
            <div className="space-y-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                {selectedItem ? selectedItem.title : customTitle}
              </h3>

              {selectedItem && (
                <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-slate-400" />
                    <span>Category: <strong>{selectedItem.category}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Lost at: <strong>{selectedItem.location}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Date: <strong>{selectedItem.date}</strong></span>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={runAiMatching}
              disabled={isScanning}
              className="w-full py-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              Re-Scan Visual Features
            </button>
          </div>
        </div>

        {/* Right 8 Cols: Top 5 Visual Matches */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Top 5 Visually Similar Found Items
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-400">Min Score:</span>
              <select
                value={minScoreFilter}
                onChange={(e) => setMinScoreFilter(Number(e.target.value))}
                className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              >
                <option value={50}>50%+</option>
                <option value={65}>65%+</option>
                <option value={80}>80%+</option>
              </select>
            </div>
          </div>

          {/* Scanning animation status */}
          {isScanning && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 text-center space-y-4">
              <LoadingSpinner size="md" />
              <div className="space-y-1">
                <p className="text-xs font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest animate-pulse">
                  AI Image Feature Analysis in Progress
                </p>
                <p className="text-xs text-slate-500">
                  Extracting key contours, color palettes, and category embeddings...
                </p>
              </div>
            </div>
          )}

          {/* Results List */}
          {!isScanning && (
            <AnimatePresence mode="wait">
              {filteredMatches.length === 0 ? (
                <EmptyState
                  title="No Visual Matches Above Threshold"
                  description="We couldn't find any active found items matching this image signature closely. Check back soon as new items are reported daily!"
                  icon={Search}
                  actionLabel="View All Found Items"
                  onAction={() => navigate('/search?type=found')}
                />
              ) : (
                <div className="space-y-4">
                  {filteredMatches.map((match, idx) => {
                    const item = match.foundItem;
                    const isTopMatch = idx === 0;

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        className={`bg-white dark:bg-slate-900 rounded-3xl p-5 border transition-all shadow-sm hover:shadow-md relative overflow-hidden ${
                          isTopMatch
                            ? 'border-blue-500 dark:border-blue-500/80 ring-2 ring-blue-500/20'
                            : 'border-slate-200/80 dark:border-slate-800'
                        }`}
                      >
                        {isTopMatch && (
                          <div className="absolute top-0 right-0 bg-gradient-to-l from-blue-600 to-indigo-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1 shadow-sm">
                            <Sparkles className="w-3 h-3 text-amber-300" />
                            Best Visual Match
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-4 items-start">
                          {/* Image Thumbnail */}
                          <div className="relative w-full sm:w-36 h-32 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700">
                            <img
                              src={item.imageUrl || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&q=80&w=800'}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm">
                              Found Item
                            </div>
                          </div>

                          {/* Info Column */}
                          <div className="flex-1 space-y-3 w-full">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                  Rank #{idx + 1}
                                </span>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white hover:text-blue-600 transition-colors">
                                  <Link to={`/item/${item.id}`}>{item.title}</Link>
                                </h3>
                              </div>

                              {/* Similarity Badge */}
                              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80">
                                <span className="text-xs font-black">
                                  {match.similarityScore}% Match
                                </span>
                              </div>
                            </div>

                            {/* Progress bar visualizer */}
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden flex shadow-inner">
                              <div
                                className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                                style={{ width: `${match.similarityScore}%` }}
                              />
                            </div>

                            {/* Attribute Match Breakdown Chips */}
                            {match.attributes && match.attributes.length > 0 && (
                              <div className="space-y-1.5 pt-1">
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                                  Attribute Comparison breakdown:
                                </span>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px]">
                                  {match.attributes.map((attr, aIdx) => (
                                    <div
                                      key={aIdx}
                                      className={`px-2 py-1 rounded-lg border flex items-center justify-between gap-1 font-semibold ${
                                        attr.isMatch
                                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/60 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300'
                                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-500 dark:text-slate-400'
                                      }`}
                                    >
                                      <span className="capitalize">{attr.attribute}:</span>
                                      <span className="font-extrabold">
                                        {attr.score}/{attr.maxScore} pts
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Visual Match Reasons */}
                            <div className="space-y-1">
                              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                                Key Matching Indicators:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {match.matchReasons.map((reason, rIdx) => (
                                  <span
                                    key={rIdx}
                                    className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                                  >
                                    <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                                    {reason}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Item Meta & Quick Action */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                  {item.location}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                  {item.date}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <Link
                                  to={`/item/${item.id}`}
                                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-1 shadow-sm"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  View Details & Claim
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};
