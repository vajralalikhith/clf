import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Search,
  PlusCircle,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Laptop,
  BookOpen,
  CreditCard,
  Key,
  Briefcase,
  Shirt,
  Glasses,
  Dumbbell,
  HelpCircle,
  Users
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ItemCard } from '../components/ItemCard';
import { Modal } from '../components/Modal';
import { Item } from '../types';

export const LandingPage: React.FC = () => {
  const { items, addNotification, showToast } = useApp();
  const navigate = useNavigate();

  const [heroSearch, setHeroSearch] = useState('');
  const [claimingItem, setClaimingItem] = useState<Item | null>(null);
  const [claimProof, setClaimProof] = useState('');
  const [claimerPhone, setClaimerPhone] = useState('');

  const activeItems = items.filter(i => i.status === 'active');
  const recentItems = items.slice(0, 6);
  const totalClaimed = items.filter(i => i.status === 'claimed').length;

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/search?q=${encodeURIComponent(heroSearch.trim())}`);
    } else {
      navigate('/search');
    }
  };

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimingItem) return;

    addNotification(
      'Claim Request Submitted',
      `Your claim request for "${claimingItem.title}" has been sent to the reporter.`,
      'claim',
      `/item/${claimingItem.id}`
    );

    showToast('Claim request sent! The reporter will contact you soon.');
    setClaimingItem(null);
    setClaimProof('');
    setClaimerPhone('');
  };

  const categoryIcons = [
    { name: 'Electronics', icon: Laptop, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/50' },
    { name: 'Books & Notes', icon: BookOpen, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50' },
    { name: 'Cards & IDs', icon: CreditCard, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/50' },
    { name: 'Keys', icon: Key, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/50' },
    { name: 'Bags & Backpacks', icon: Briefcase, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/50' },
    { name: 'Clothing & Shoes', icon: Shirt, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/50' },
    { name: 'Accessories', icon: Glasses, color: 'text-teal-500 bg-teal-50 dark:bg-teal-950/50' },
    { name: 'Sports & Gym', icon: Dumbbell, color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/50' },
  ];

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/80 via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 pt-10 pb-16 rounded-3xl border border-blue-100/60 dark:border-slate-800 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
          >
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Official Campus Lost & Recovery Portal</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight"
          >
            Lost Something on Campus? <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              We'll Help You Find It.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sm sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed"
          >
            A secure, centralized database for students and staff. Report misplaced items, search found inventory, or claim your lost belongings in minutes.
          </motion.p>

          {/* Quick Hero Search */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            onSubmit={handleHeroSearchSubmit}
            className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-2 p-2 rounded-2xl bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700"
          >
            <div className="relative w-full flex items-center">
              <Search className="absolute left-3.5 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                placeholder="Try 'AirPods', 'Library', 'Hydroflask'..."
                className="w-full pl-11 pr-4 py-3 bg-transparent text-slate-900 dark:text-white text-sm focus:outline-none placeholder-slate-400"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-md shrink-0 flex items-center justify-center gap-2"
            >
              <span>Search Database</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.form>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-3 pt-2"
          >
            <Link
              to="/report-lost"
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              I Lost An Item
            </Link>
            <Link
              to="/report-found"
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              I Found An Item
            </Link>
          </motion.div>
        </div>

        {/* Live Metrics Row */}
        <div className="max-w-5xl mx-auto mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-slate-200/60 dark:border-slate-800">
          <div className="text-center p-4 rounded-2xl bg-white/60 dark:bg-slate-800/40 backdrop-blur-xs">
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400">
              {activeItems.length}+
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
              Active Listings
            </div>
          </div>
          <div className="text-center p-4 rounded-2xl bg-white/60 dark:bg-slate-800/40 backdrop-blur-xs">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {totalClaimed + 18}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
              Items Reunited
            </div>
          </div>
          <div className="text-center p-4 rounded-2xl bg-white/60 dark:bg-slate-800/40 backdrop-blur-xs">
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-500">
              94%
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
              Match Verification
            </div>
          </div>
          <div className="text-center p-4 rounded-2xl bg-white/60 dark:bg-slate-800/40 backdrop-blur-xs">
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-600 dark:text-purple-400">
              10+
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
              Campus Buildings
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Browse by Category
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Filter campus listings quickly by item classification
            </p>
          </div>
          <Link
            to="/search"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
          >
            View All Items <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {categoryIcons.map((cat) => {
            const Icon = cat.icon;
            const count = items.filter(
              (i) => i.category === cat.name && i.status === 'active'
            ).length;
            return (
              <button
                key={cat.name}
                onClick={() => navigate(`/search?category=${encodeURIComponent(cat.name)}`)}
                className="group p-3.5 min-h-[56px] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md active:scale-[0.98] transition-all text-left flex items-center sm:items-start gap-3"
              >
                <div className={`p-3 rounded-xl ${cat.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {cat.name}
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    {count} active item{count !== 1 ? 's' : ''}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Recent Items Preview Grid */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Recent Campus Reports
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Latest lost and found postings from students and staff
            </p>
          </div>
          <Link
            to="/search"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
          >
            Explore Full Inventory <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
          {recentItems.map((item) => (
            <ItemCard key={item.id} item={item} onClaim={(item) => setClaimingItem(item)} />
          ))}
        </div>
      </section>

      {/* How it Works Section */}
      <section className="bg-slate-50 dark:bg-slate-900/60 rounded-3xl p-8 sm:p-12 border border-slate-200/80 dark:border-slate-800 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            How Campus Lost & Found Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            A simple 3-step safe recovery system for the entire campus community
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 font-bold text-xl flex items-center justify-center">
              1
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Submit a Detailed Report
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Post lost or found items with location details, photos, and secret verification clues to protect item ownership.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 font-bold text-xl flex items-center justify-center">
              2
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Smart Network Search
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Filter through items by location, category, date, or keywords. Our algorithm flags matching lost & found entries automatically.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 font-bold text-xl flex items-center justify-center">
              3
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Safe Campus Handover
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Verify proof of ownership and coordinate a safe exchange at Campus Security or Student Union Info Desks.
            </p>
          </div>
        </div>
      </section>

      {/* Claim Modal */}
      <Modal
        isOpen={!!claimingItem}
        onClose={() => setClaimingItem(null)}
        title={claimingItem ? `Claim Request: ${claimingItem.title}` : ''}
      >
        {claimingItem && (
          <form onSubmit={handleClaimSubmit} className="space-y-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/50 rounded-xl text-xs text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
              <p className="font-semibold">Security Note:</p>
              <p>
                To prevent false claims, please describe a specific feature or secret detail about this item (e.g., sticker, serial number, wallpaper, or unique mark).
              </p>
            </div>

            {claimingItem.verificationQuestion && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Reporter's Verification Question:
                </label>
                <p className="text-xs italic text-slate-600 dark:text-slate-400 mb-2">
                  "{claimingItem.verificationQuestion}"
                </p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Your Proof of Ownership Details *
              </label>
              <textarea
                required
                rows={3}
                value={claimProof}
                onChange={(e) => setClaimProof(e.target.value)}
                placeholder="Describe unique details only the owner would know..."
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
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
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
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
                Send Claim Request
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
