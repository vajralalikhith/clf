import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Users,
  FileText,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  TrendingUp,
  AlertTriangle,
  Building,
  Clock,
  Sparkles,
  UserCheck,
  Tag,
  Eye,
  Shield,
  ShieldAlert,
  BarChart2,
  Check,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Item, User } from '../types';
import { Modal } from '../components/Modal';

type TabType = 'overview' | 'lost' | 'found' | 'users';

export const AdminDashboard: React.FC = () => {
  const {
    user,
    isAdmin,
    items,
    allUsers,
    deleteItem,
    toggleVerifyItem,
    updateItemStatus,
    updateUserRole,
    showToast
  } = useApp();

  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Deletion modal state
  const [deleteModalItem, setDeleteModalItem] = useState<Item | null>(null);
  const [deleteReason, setDeleteReason] = useState('Inappropriate content');

  // Access check fallback screen
  if (!isAdmin) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-1 max-w-md">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Admin Access Restricted
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            You must have administrator or security staff privileges to access the Campus Lost & Found Admin Portal.
          </p>
        </div>
        <Link
          to="/"
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
        >
          Return to Campus Home
        </Link>
      </div>
    );
  }

  // Filtered collections
  const lostItems = items.filter(i => i.type === 'lost');
  const foundItems = items.filter(i => i.type === 'found');

  const filterReports = (reportsList: Item[]) => {
    return reportsList.filter(item => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.reporterId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  };

  const filteredLost = filterReports(lostItems);
  const filteredFound = filterReports(foundItems);

  // Fallback mock users if allUsers list from Firestore is empty
  const displayUsers: User[] = allUsers.length > 0 ? allUsers : [
    {
      id: user?.id || 'usr_admin',
      name: user?.name || 'Campus Administrator',
      email: user?.email || 'admin@university.edu',
      studentId: user?.studentId || 'ADM-001',
      role: user?.role || 'admin',
      department: user?.department || 'Campus Safety & IT',
      phone: user?.phone || '(555) 000-1122',
      avatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      joinedDate: 'Aug 2024',
      isAdmin: true,
    },
    {
      id: 'usr_101',
      name: 'Alex Rivera',
      email: 'alex.rivera@university.edu',
      studentId: 'STU-882190',
      role: 'student',
      department: 'Computer Science',
      phone: '(555) 234-5678',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
      joinedDate: 'Sep 2024'
    },
    {
      id: 'usr_102',
      name: 'Jordan Lee',
      email: 'jordan.lee@university.edu',
      studentId: 'STU-994120',
      role: 'student',
      department: 'Business Administration',
      phone: '(555) 876-5432',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
      joinedDate: 'Oct 2024'
    },
    {
      id: 'usr_sec_01',
      name: 'Officer Marcus Vance',
      email: 'security.vance@university.edu',
      studentId: 'SEC-402',
      role: 'security',
      department: 'Campus Police Department',
      phone: '(555) 911-0011',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
      joinedDate: 'Jan 2023'
    }
  ];

  const filteredUsers = displayUsers.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Statistics calculation
  const totalReportsCount = items.length;
  const verifiedCount = items.filter(i => i.verified).length;
  const resolvedCount = items.filter(i => i.status === 'resolved' || i.status === 'claimed').length;
  const activeCount = items.filter(i => i.status === 'active').length;
  const pendingCount = items.filter(i => i.status === 'pending').length;

  const handleDeleteConfirm = () => {
    if (deleteModalItem) {
      deleteItem(deleteModalItem.id);
      showToast(`Report removed. Reason: ${deleteReason}`);
      setDeleteModalItem(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* Top Banner */}
      <div className="relative overflow-hidden bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-4">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 border border-blue-400/30 text-blue-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Campus Security & Admin Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Administrator Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Role-based management console for campus lost and found operations, user authorization, and report moderation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-800/80 border border-slate-700/80 p-3 rounded-2xl flex items-center gap-3">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                alt={user?.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/50"
              />
              <div className="text-xs">
                <div className="font-bold text-white">{user?.name}</div>
                <div className="text-slate-400 capitalize">{user?.role} Access</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            Overview & Stats
          </button>
          <button
            onClick={() => setActiveTab('lost')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'lost'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Lost Reports ({lostItems.length})
          </button>
          <button
            onClick={() => setActiveTab('found')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'found'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Found Reports ({foundItems.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'users'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            User Management ({displayUsers.length})
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW & STATS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Reports</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{totalReportsCount}</div>
              <p className="text-[11px] text-slate-500">
                {lostItems.length} Lost • {foundItems.length} Found
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verified Reports</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{verifiedCount}</div>
              <p className="text-[11px] text-emerald-600 font-semibold">
                {totalReportsCount > 0 ? Math.round((verifiedCount / totalReportsCount) * 100) : 0}% of all reports verified
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resolved Items</span>
                <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{resolvedCount}</div>
              <p className="text-[11px] text-slate-500">
                Successfully claimed & returned
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Users</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{displayUsers.length}</div>
              <p className="text-[11px] text-slate-500">
                Students, faculty & security
              </p>
            </div>
          </div>

          {/* Detailed Status Breakdown & System Health */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Report Status Distribution
              </h3>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    <span>Active Reports ({activeCount})</span>
                    <span>{totalReportsCount > 0 ? Math.round((activeCount / totalReportsCount) * 100) : 0}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${totalReportsCount > 0 ? (activeCount / totalReportsCount) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    <span>Claimed & Resolved ({resolvedCount})</span>
                    <span>{totalReportsCount > 0 ? Math.round((resolvedCount / totalReportsCount) * 100) : 0}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${totalReportsCount > 0 ? (resolvedCount / totalReportsCount) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    <span>Pending Verification ({pendingCount})</span>
                    <span>{totalReportsCount > 0 ? Math.round((pendingCount / totalReportsCount) * 100) : 0}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${totalReportsCount > 0 ? (pendingCount / totalReportsCount) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Security Moderation Checklist
              </h3>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Unverified Lost Reports
                  </span>
                  <span className="font-extrabold px-2.5 py-0.5 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    {lostItems.filter(i => !i.verified).length} pending
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Unverified Found Reports
                  </span>
                  <span className="font-extrabold px-2.5 py-0.5 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    {foundItems.filter(i => !i.verified).length} pending
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Firestore DB Connection
                  </span>
                  <span className="font-extrabold px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Active Online
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2 & 3: LOST AND FOUND REPORTS TABLES */}
      {(activeTab === 'lost' || activeTab === 'found') && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab} reports...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                <option value="all">All Categories</option>
                <option value="Electronics">Electronics</option>
                <option value="Books & Notes">Books & Notes</option>
                <option value="Cards & IDs">Cards & IDs</option>
                <option value="Keys">Keys</option>
                <option value="Bags & Backpacks">Bags & Backpacks</option>
                <option value="Clothing & Shoes">Clothing & Shoes</option>
                <option value="Accessories">Accessories</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="claimed">Claimed</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 border-b border-slate-200 dark:border-slate-800 font-extrabold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Item & Reporter</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Location & Date</th>
                    <th className="p-4">Status & Badge</th>
                    <th className="p-4">Verification</th>
                    <th className="p-4 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                  {(activeTab === 'lost' ? filteredLost : filteredFound).length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-slate-400">
                        No reports found matching your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    (activeTab === 'lost' ? filteredLost : filteredFound).map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        {/* Item Title & Reporter */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.imageUrl || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&q=80&w=250'}
                              alt={item.title}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                            />
                            <div>
                              <Link
                                to={`/item/${item.id}`}
                                className="font-bold text-slate-900 dark:text-white hover:text-blue-600 transition-colors line-clamp-1"
                              >
                                {item.title}
                              </Link>
                              <div className="text-[11px] text-slate-400">
                                Reported by: <strong className="text-slate-600 dark:text-slate-300">{item.contactName}</strong>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">
                          {item.category}
                        </td>

                        {/* Location & Date */}
                        <td className="p-4 space-y-0.5">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">{item.location}</div>
                          <div className="text-[10px] text-slate-400">{item.date}</div>
                        </td>

                        {/* Status dropdown toggle */}
                        <td className="p-4">
                          <select
                            value={item.status}
                            onChange={(e) => updateItemStatus(item.id, e.target.value as any)}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                          >
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="claimed">Claimed</option>
                            <option value="resolved">Resolved</option>
                          </select>
                        </td>

                        {/* Verification Shield */}
                        <td className="p-4">
                          {item.verified ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                              <Clock className="w-3.5 h-3.5" />
                              Unverified
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => toggleVerifyItem(item.id)}
                              title={item.verified ? 'Unmark Verification' : 'Verify Report'}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                item.verified
                                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800'
                                  : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:border-slate-700 hover:bg-emerald-50 hover:text-emerald-600'
                              }`}
                            >
                              <ShieldCheck className="w-4 h-4" />
                            </button>

                            <Link
                              to={`/item/${item.id}`}
                              title="View Details"
                              className="p-1.5 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 hover:text-blue-600 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>

                            <button
                              onClick={() => setDeleteModalItem(item)}
                              title="Delete Inappropriate Report"
                              className="p-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/60 dark:border-red-800 hover:bg-red-600 hover:text-white transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search users by name, email, or student ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="text-xs font-bold text-slate-500">
              Total Campus Users: {displayUsers.length}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 border-b border-slate-200 dark:border-slate-800 font-extrabold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">User Details</th>
                    <th className="p-4">ID & Department</th>
                    <th className="p-4">Contact Phone</th>
                    <th className="p-4">Assigned Role</th>
                    <th className="p-4 text-right">Role Management</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                            <div className="text-[11px] text-slate-400">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 space-y-0.5">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{u.studentId}</div>
                        <div className="text-[10px] text-slate-400">{u.department}</div>
                      </td>

                      <td className="p-4 text-slate-600 dark:text-slate-400 font-mono">
                        {u.phone}
                      </td>

                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                            : u.role === 'security'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {u.role === 'admin' && <ShieldCheck className="w-3 h-3 text-purple-600" />}
                          {u.role}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <select
                          value={u.role}
                          onChange={(e) => updateUserRole(u.id, e.target.value as any)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                        >
                          <option value="student">Student</option>
                          <option value="faculty">Faculty</option>
                          <option value="staff">Staff</option>
                          <option value="security">Security</option>
                          <option value="admin">Administrator</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={!!deleteModalItem}
        onClose={() => setDeleteModalItem(null)}
        title="Delete Report as Administrator"
      >
        {deleteModalItem && (
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/80 text-red-800 dark:text-red-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Are you sure you want to remove this report?</p>
                <p className="text-[11px] opacity-90">
                  This action will delete "{deleteModalItem.title}" and send a notification to reporter {deleteModalItem.contactName}.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Reason for Removal:
              </label>
              <select
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-200"
              >
                <option value="Inappropriate content">Inappropriate / Off-Topic Content</option>
                <option value="Duplicate report">Duplicate Report Entry</option>
                <option value="Spam or fraudulent claim">Spam or Fraudulent Claim</option>
                <option value="Resolved outside portal">Resolved Outside Portal</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteModalItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Confirm Deletion
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
