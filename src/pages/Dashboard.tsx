import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  Search,
  PlusCircle,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowRight,
  Filter,
  PackageX,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useApp } from '../context/AppContext';
import { ItemCard } from '../components/ItemCard';
import { SearchBar } from '../components/SearchBar';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';
import { CardSkeleton } from '../components/SkeletonLoader';
import { Item } from '../types';

export const Dashboard: React.FC = () => {
  const { items: contextItems, user, addNotification, showToast } = useApp();
  const navigate = useNavigate();

  const [liveItems, setLiveItems] = useState<Item[]>(contextItems);
  const [activeTab, setActiveTab] = useState<'all' | 'lost' | 'found' | 'claimed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  const [claimingItem, setClaimingItem] = useState<Item | null>(null);
  const [claimProof, setClaimProof] = useState('');
  const [claimerPhone, setClaimerPhone] = useState('');

  // Firestore Real-time Listener for items
  useEffect(() => {
    const itemsRef = collection(db, 'items');
    const unsubscribe = onSnapshot(
      itemsRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const docsData = snapshot.docs.map((doc) => doc.data() as Item);
          setLiveItems(docsData);
        }
      },
      (err) => {
        console.warn('Firestore real-time dashboard sync notice:', err);
      }
    );

    return () => unsubscribe();
  }, []);

  const items = liveItems.length > 0 ? liveItems : contextItems;

  // Summary Metrics
  const totalLostItems = items.filter((i) => i.type === 'lost').length;
  const totalFoundItems = items.filter((i) => i.type === 'found').length;
  const myReportsCount = user ? items.filter((i) => i.reporterId === user.id).length : 0;
  const itemsReturnedCount = items.filter((i) => i.status === 'claimed' || i.status === 'resolved').length;

  // Latest 5 Lost Items and Latest 5 Found Items
  const latestLostItems = items.filter((i) => i.type === 'lost').slice(0, 5);
  const latestFoundItems = items.filter((i) => i.type === 'found').slice(0, 5);

  // Filter items for full feed
  const filteredItems = items.filter((item) => {
    if (activeTab === 'lost' && item.type !== 'lost') return false;
    if (activeTab === 'found' && item.type !== 'found') return false;
    if (activeTab === 'claimed' && item.status !== 'claimed' && item.status !== 'resolved') return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchTitle = item.title ? item.title.toLowerCase().includes(q) : false;
      const matchDesc = item.description ? item.description.toLowerCase().includes(q) : false;
      const matchLoc = item.location ? item.location.toLowerCase().includes(q) : false;
      const matchTags = item.tags ? item.tags.some((t) => t.toLowerCase().includes(q)) : false;
      if (!matchTitle && !matchDesc && !matchLoc && !matchTags) return false;
    }

    if (selectedCategory && item.category !== selectedCategory) return false;
    if (selectedLocation && item.location !== selectedLocation) return false;

    return true;
  });

  // Pagination & Infinite Scroll State
  const [visibleCount, setVisibleCount] = useState<number>(6);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const observerTarget = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setVisibleCount(6);
  }, [activeTab, searchTerm, selectedCategory, selectedLocation]);

  const displayedItems = filteredItems.slice(0, visibleCount);
  const hasMore = visibleCount < filteredItems.length;

  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setVisibleCount((prev) => prev + 6);
            setIsLoadingMore(false);
          }, 350);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoadingMore]);

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimingItem) return;

    addNotification(
      'Claim Request Sent',
      `You submitted a claim request for "${claimingItem.title}".`,
      'claim',
      `/item/${claimingItem.id}`
    );

    showToast('Claim request sent to the reporter!');
    setClaimingItem(null);
    setClaimProof('');
    setClaimerPhone('');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner / Welcome & Quick Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Real-time Firestore Connected</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user ? user.name : 'Student'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
            Track active reports, search found inventory, or file new listings for lost belongings across campus.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link
            to="/report-lost"
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-900 transition-all shadow-sm flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-amber-300"
          >
            <PlusCircle className="w-4 h-4" /> Report Lost Item
          </Link>
          <Link
            to="/report-found"
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-blue-700 hover:bg-blue-50 transition-all shadow-sm flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-white"
          >
            <ShieldCheck className="w-4 h-4" /> Report Found Item
          </Link>
          <Link
            to="/search"
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white/15 hover:bg-white/25 text-white border border-white/20 transition-all shadow-sm flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-white"
          >
            <Search className="w-4 h-4" /> Search Items
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Lost Items */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {totalLostItems}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Total Lost Items
            </div>
          </div>
        </div>

        {/* Total Found Items */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {totalFoundItems}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Total Found Items
            </div>
          </div>
        </div>

        {/* My Reports */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {myReportsCount}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              My Reports
            </div>
          </div>
        </div>

        {/* Items Returned */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {itemsReturnedCount}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Items Returned
            </div>
          </div>
        </div>
      </div>

      {/* Latest 5 Lost Items Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span>Latest Lost Items</span>
          </h2>
          <Link
            to="/search?type=lost"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>View All Lost</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {latestLostItems.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 italic">No lost items reported yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestLostItems.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.04 }}
              >
                <ItemCard item={item} onClaim={(i) => setClaimingItem(i)} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Latest 5 Found Items Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <span>Latest Found Items</span>
          </h2>
          <Link
            to="/search?type=found"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>View All Found</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {latestFoundItems.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 italic">No found items reported yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestFoundItems.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.04 }}
              >
                <ItemCard item={item} onClaim={(i) => setClaimingItem(i)} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Search and Filter Section */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedLocation={selectedLocation}
          onLocationChange={setSelectedLocation}
          selectedType={activeTab}
          onTypeChange={(t) => setActiveTab(t as any)}
          onClearFilters={() => {
            setSearchTerm('');
            setSelectedCategory('');
            setSelectedLocation('');
            setActiveTab('all');
          }}
        />

        {/* Full Directory Stream */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-blue-600" />
              <span>Campus Items Directory ({filteredItems.length})</span>
            </h2>
          </div>

          {filteredItems.length === 0 ? (
            <EmptyState
              icon={AlertTriangle}
              title="No matching items found"
              description="Try adjusting your search keywords, location filters, or post a new report."
              actionText="Post New Lost Report"
              actionTo="/report-lost"
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
                {displayedItems.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: Math.min(idx * 0.04, 0.2) }}
                  >
                    <ItemCard item={item} onClaim={(item) => setClaimingItem(item)} />
                  </motion.div>
                ))}

                {isLoadingMore && (
                  <>
                    <CardSkeleton />
                    <CardSkeleton />
                    <CardSkeleton />
                  </>
                )}
              </div>

              {/* Infinite Scroll Sentinel */}
              <div ref={observerTarget} className="py-6 flex justify-center">
                {hasMore ? (
                  <div className="text-xs text-slate-400 font-medium animate-pulse">
                    Loading more directory items...
                  </div>
                ) : filteredItems.length > 6 ? (
                  <span className="text-xs text-slate-400 font-medium">
                    • End of campus directory ({filteredItems.length} total) •
                  </span>
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Claim Modal */}
      <Modal
        isOpen={!!claimingItem}
        onClose={() => setClaimingItem(null)}
        title={claimingItem ? `Claim Item: ${claimingItem.title}` : ''}
      >
        {claimingItem && (
          <form onSubmit={handleClaimSubmit} className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Provide unique ownership details to verify item ownership with the reporter.
            </p>

            {claimingItem.verificationQuestion && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-xs text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800">
                <p className="font-semibold">Verification Challenge:</p>
                <p className="italic">{claimingItem.verificationQuestion}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Your Ownership Proof *
              </label>
              <textarea
                required
                rows={3}
                value={claimProof}
                onChange={(e) => setClaimProof(e.target.value)}
                placeholder="Serial number, custom engraving, desktop wallpaper, sticker placement..."
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Contact Phone Number
              </label>
              <input
                type="tel"
                value={claimerPhone}
                onChange={(e) => setClaimerPhone(e.target.value)}
                placeholder="(555) 000-0000"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setClaimingItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              >
                Submit Claim Request
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

