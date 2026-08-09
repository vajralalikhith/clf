import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { FileText, PlusCircle, ShieldCheck, CheckCircle2, Trash2, Eye, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ConfirmModal } from '../components/ConfirmModal';
import { EmptyState } from '../components/EmptyState';
import { Item, ItemStatus } from '../types';

export const MyReports: React.FC = () => {
  const { user, items, updateItemStatus, deleteItem } = useApp();
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'claimed'>('all');
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  if (!user) {
    return (
      <EmptyState
        icon={FileText}
        title="Sign In Required"
        description="Please log in to manage your submitted lost and found listings."
        actionText="Go to Sign In"
        actionTo="/login"
        className="mt-12"
      />
    );
  }

  const myItems = items.filter((item) => item.reporterId === user.id);

  const filteredMyItems = myItems.filter((item) => {
    if (statusFilter === 'active' && item.status !== 'active') return false;
    if (statusFilter === 'claimed' && item.status !== 'claimed' && item.status !== 'resolved') return false;
    return true;
  });

  const handleDeleteConfirm = () => {
    if (deletingItemId) {
      deleteItem(deletingItemId);
      setDeletingItemId(null);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            My Submitted Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Manage your active lost and found listings on the campus network
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/report-lost"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-sm flex items-center gap-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <PlusCircle className="w-3.5 h-3.5" /> Report Lost
          </Link>
          <Link
            to="/report-found"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Report Found
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            statusFilter === 'all'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          All Reports ({myItems.length})
        </button>
        <button
          onClick={() => setStatusFilter('active')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            statusFilter === 'active'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Active Listings ({myItems.filter((i) => i.status === 'active').length})
        </button>
        <button
          onClick={() => setStatusFilter('claimed')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            statusFilter === 'claimed'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Resolved / Claimed ({myItems.filter((i) => i.status === 'claimed' || i.status === 'resolved').length})
        </button>
      </div>

      {/* Report List */}
      {filteredMyItems.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No reports in this category"
          description="You haven't posted any lost or found items under this tab yet."
          actionText="File New Report"
          actionTo="/report-lost"
        />
      ) : (
        <div className="space-y-4">
          {filteredMyItems.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.05 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-20 h-20 rounded-2xl object-cover shrink-0 bg-slate-100 dark:bg-slate-800"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        item.type === 'lost'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      }`}
                    >
                      {item.type}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        item.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <Link
                    to={`/item/${item.id}`}
                    className="font-bold text-slate-900 dark:text-white hover:text-blue-600 text-base block focus:outline-none focus:underline"
                  >
                    {item.title}
                  </Link>

                  <p className="text-xs text-slate-500 line-clamp-1">
                    {item.location} • Reported on {item.date}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                <Link
                  to={`/item/${item.id}`}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  <Eye className="w-3.5 h-3.5" /> View
                </Link>

                {item.status === 'active' ? (
                  <button
                    onClick={() => updateItemStatus(item.id, 'claimed')}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Mark Resolved
                  </button>
                ) : (
                  <button
                    onClick={() => updateItemStatus(item.id, 'active')}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Reactivate
                  </button>
                )}

                <button
                  onClick={() => setDeletingItemId(item.id)}
                  className="p-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 focus:outline-none focus:ring-2 focus:ring-red-500"
                  title="Delete Report"
                  aria-label={`Delete report ${item.title}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!deletingItemId}
        onClose={() => setDeletingItemId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Item Report?"
        message="Are you sure you want to permanently delete this report from the campus lost & found network? This action cannot be undone."
        confirmText="Delete Permanently"
        variant="danger"
      />
    </div>
  );
};
