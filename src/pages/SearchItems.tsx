import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, Filter, Grid, List, MapPin, Tag, RefreshCw, X, ShieldCheck, AlertCircle, Database, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SearchBar } from '../components/SearchBar';
import { ItemCard } from '../components/ItemCard';
import { Modal } from '../components/Modal';
import { Item } from '../types';
import { queryItemsFromFirestore } from '../utils/searchFirestore';
import { CardSkeleton, ListSkeleton } from '../components/SkeletonLoader';
import { EmptyState } from '../components/EmptyState';
import { OptimizedImage } from '../components/OptimizedImage';

export const SearchItems: React.FC = () => {
  const { items: contextItems, addNotification, showToast } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get('location') || '');
  const [selectedBuilding, setSelectedBuilding] = useState(searchParams.get('building') || '');
  const [selectedColor, setSelectedColor] = useState(searchParams.get('color') || '');
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || 'all');
  const [selectedDate, setSelectedDate] = useState(searchParams.get('date') || '');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'all');

  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'alphabetical' | 'alphabetical-reverse' | 'views'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [firestoreResults, setFirestoreResults] = useState<Item[] | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);

  // Pagination & Infinite Scroll State
  const [visibleCount, setVisibleCount] = useState<number>(6);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const observerTarget = useRef<HTMLDivElement | null>(null);

  const [claimingItem, setClaimingItem] = useState<Item | null>(null);
  const [claimProof, setClaimProof] = useState('');
  const [claimerPhone, setClaimerPhone] = useState('');

  // Synchronize state from URL search params
  useEffect(() => {
    const q = searchParams.get('q');
    const cat = searchParams.get('category');
    const loc = searchParams.get('location');
    const bldg = searchParams.get('building');
    const col = searchParams.get('color');
    const br = searchParams.get('brand');
    const t = searchParams.get('type');
    const d = searchParams.get('date');
    const st = searchParams.get('status');

    if (q !== null) setSearchTerm(q);
    if (cat !== null) setSelectedCategory(cat);
    if (loc !== null) setSelectedLocation(loc);
    if (bldg !== null) setSelectedBuilding(bldg);
    if (col !== null) setSelectedColor(col);
    if (br !== null) setSelectedBrand(br);
    if (t !== null) setSelectedType(t);
    if (d !== null) setSelectedDate(d);
    if (st !== null) setSelectedStatus(st);
  }, [searchParams]);

  // Execute Firestore query when search filters change
  useEffect(() => {
    let isSubscribed = true;

    async function executeFirestoreQuery() {
      setIsQuerying(true);
      const results = await queryItemsFromFirestore({
        searchTerm,
        category: selectedCategory,
        location: selectedLocation,
        building: selectedBuilding,
        color: selectedColor,
        brand: selectedBrand,
        type: selectedType,
        date: selectedDate,
        status: selectedStatus,
      });

      if (isSubscribed) {
        setFirestoreResults(results);
        setIsQuerying(false);
      }
    }

    executeFirestoreQuery();

    return () => {
      isSubscribed = false;
    };
  }, [searchTerm, selectedCategory, selectedLocation, selectedBuilding, selectedColor, selectedBrand, selectedType, selectedDate, selectedStatus]);

  // Reset pagination count on search/filter update
  useEffect(() => {
    setVisibleCount(6);
  }, [searchTerm, selectedCategory, selectedLocation, selectedBuilding, selectedColor, selectedBrand, selectedType, selectedDate, selectedStatus, sortBy]);

  // Combine Firestore query results with fallback local context items
  const baseItemsList = firestoreResults !== null && firestoreResults.length > 0
    ? firestoreResults
    : contextItems;

  const filteredItems = baseItemsList
    .filter((item) => {
      if (selectedType === 'lost' && item.type !== 'lost') return false;
      if (selectedType === 'found' && item.type !== 'found') return false;

      if (selectedCategory && item.category !== selectedCategory) return false;
      if (selectedLocation && item.location !== selectedLocation) return false;

      if (selectedBuilding) {
        const bLower = selectedBuilding.toLowerCase();
        const itemB = (item.building || '').toLowerCase();
        const itemL = (item.location || '').toLowerCase();
        if (!itemB.includes(bLower) && !itemL.includes(bLower)) return false;
      }

      if (selectedColor) {
        const cLower = selectedColor.toLowerCase();
        const itemColor = (item.color || '').toLowerCase();
        const itemDesc = (item.description || '').toLowerCase();
        const itemTitle = (item.title || '').toLowerCase();
        const itemTags = (item.tags || []).join(' ').toLowerCase();
        if (!itemColor.includes(cLower) && !itemDesc.includes(cLower) && !itemTitle.includes(cLower) && !itemTags.includes(cLower)) return false;
      }

      if (selectedBrand) {
        const brLower = selectedBrand.toLowerCase();
        const itemBrand = (item.brand || '').toLowerCase();
        const itemDesc = (item.description || '').toLowerCase();
        const itemTitle = (item.title || '').toLowerCase();
        const itemTags = (item.tags || []).join(' ').toLowerCase();
        if (!itemBrand.includes(brLower) && !itemDesc.includes(brLower) && !itemTitle.includes(brLower) && !itemTags.includes(brLower)) return false;
      }

      if (selectedDate && item.date !== selectedDate) return false;
      if (selectedStatus && selectedStatus !== 'all' && item.status !== selectedStatus) return false;

      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchTitle = item.title?.toLowerCase().includes(q);
        const matchDesc = item.description?.toLowerCase().includes(q);
        const matchLoc = item.location?.toLowerCase().includes(q);
        const matchBldg = item.building?.toLowerCase().includes(q);
        const matchColor = item.color?.toLowerCase().includes(q);
        const matchBrand = item.brand?.toLowerCase().includes(q);
        const matchTags = item.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchLoc && !matchBldg && !matchColor && !matchBrand && !matchTags) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'alphabetical') return (a.title || '').localeCompare(b.title || '');
      if (sortBy === 'alphabetical-reverse') return (b.title || '').localeCompare(a.title || '');
      if (sortBy === 'views') return (b.viewsCount || 0) - (a.viewsCount || 0);
      return 0;
    });

  const handleClear = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedLocation('');
    setSelectedBuilding('');
    setSelectedColor('');
    setSelectedBrand('');
    setSelectedType('all');
    setSelectedDate('');
    setSelectedStatus('all');
    setSearchParams({});
    setVisibleCount(6);
  };

  const displayedItems = filteredItems.slice(0, visibleCount);
  const hasMore = visibleCount < filteredItems.length;

  // Infinite Scroll Trigger via Intersection Observer
  useEffect(() => {
    if (!hasMore || isQuerying) return;

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
  }, [hasMore, isQuerying, isLoadingMore]);

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimingItem) return;

    addNotification(
      'Claim Request Submitted',
      `Claim request for "${claimingItem.title}" sent.`,
      'claim',
      `/item/${claimingItem.id}`
    );

    showToast('Claim request sent to the reporter!');
    setClaimingItem(null);
    setClaimProof('');
    setClaimerPhone('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Campus Lost & Found Directory
            </h1>
            {isQuerying && (
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" title="Querying Firestore database..." />
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Advanced Firestore query search by name, category, date, status, and campus location
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg text-xs font-semibold transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg text-xs font-semibold transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer font-semibold"
          >
            <option value="newest">Sort: Recently Added (Newest)</option>
            <option value="alphabetical">Sort: Alphabetical (A-Z)</option>
            <option value="alphabetical-reverse">Sort: Alphabetical (Z-A)</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="views">Sort: Most Viewed</option>
          </select>
        </div>
      </div>

      {/* Search & Filter Component */}
      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
        selectedBuilding={selectedBuilding}
        onBuildingChange={setSelectedBuilding}
        selectedColor={selectedColor}
        onColorChange={setSelectedColor}
        selectedBrand={selectedBrand}
        onBrandChange={setSelectedBrand}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        onClearFilters={handleClear}
      />

      {/* Results Count & Badges */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-blue-500" />
          Showing <strong className="text-slate-900 dark:text-white">{filteredItems.length}</strong> matches from combined search query
        </span>
        {(searchTerm || selectedCategory || selectedLocation || selectedBuilding || selectedColor || selectedBrand || selectedType !== 'all' || selectedDate || (selectedStatus && selectedStatus !== 'all')) && (
          <button
            onClick={handleClear}
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> Reset All Filters
          </button>
        )}
      </div>

      {/* Grid or List Display */}
      {isQuerying ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <div className="space-y-3">
            <ListSkeleton />
            <ListSkeleton />
            <ListSkeleton />
          </div>
        )
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={AlertCircle}
          title="No items matched your search query"
          description="Try searching with broader keywords, clearing specific date/location filters, or posting a new report."
          actionText="Clear Search Filters"
          onActionClick={handleClear}
        />
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
              {displayedItems.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
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
          ) : (
            <div className="space-y-3">
              {displayedItems.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ x: 2 }}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <OptimizedImage
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-16 h-16 rounded-xl shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            item.type === 'lost'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          }`}
                        >
                          {item.type}
                        </span>
                        <span className="text-xs font-semibold text-slate-900 dark:text-white">
                          {item.title}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1">
                        {item.description}
                      </p>
                      <div className="text-[11px] text-slate-400 flex items-center gap-3">
                        <span>{item.location}</span>
                        <span>•</span>
                        <span>{item.date}</span>
                        <span>•</span>
                        <span className="capitalize text-slate-500 font-medium">{item.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => setClaimingItem(item)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700"
                    >
                      {item.type === 'lost' ? 'I Found This' : 'Claim Item'}
                    </button>
                  </div>
                </motion.div>
              ))}

              {isLoadingMore && (
                <>
                  <ListSkeleton />
                  <ListSkeleton />
                </>
              )}
            </div>
          )}

          {/* Infinite Scroll Intersection Sentinel */}
          <div ref={observerTarget} className="py-6 flex flex-col items-center justify-center space-y-2">
            {hasMore ? (
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium animate-pulse">
                <span>Loading more directory records...</span>
              </div>
            ) : filteredItems.length > 6 ? (
              <span className="text-xs text-slate-400 font-medium">
                • End of directory results ({filteredItems.length} total) •
              </span>
            ) : null}
          </div>
        </>
      )}

      {/* Claim Modal */}
      <Modal
        isOpen={!!claimingItem}
        onClose={() => setClaimingItem(null)}
        title={claimingItem ? `Claim Request: ${claimingItem.title}` : ''}
      >
        {claimingItem && (
          <form onSubmit={handleClaimSubmit} className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Provide unique details to verify ownership with the reporter.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Your Proof of Ownership *
              </label>
              <textarea
                required
                rows={3}
                value={claimProof}
                onChange={(e) => setClaimProof(e.target.value)}
                placeholder="Serial number, custom engraving, desktop wallpaper, sticker placement..."
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                value={claimerPhone}
                onChange={(e) => setClaimerPhone(e.target.value)}
                placeholder="(555) 000-0000"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setClaimingItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
              >
                Send Claim Request
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

