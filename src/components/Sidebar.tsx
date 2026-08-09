import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  PlusCircle,
  ShieldCheck,
  FileText,
  User,
  Home,
  Tag,
  PhoneCall,
  MapPin,
  X,
  Sparkles,
  MessageSquare,
  Bot
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from './SearchBar';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { items, user, isAdmin } = useApp();
  const navigate = useNavigate();

  const activeItemsCount = items.filter(i => i.status === 'active').length;
  const claimedCount = items.filter(i => i.status === 'claimed').length;

  const handleCategoryClick = (category: string) => {
    navigate(`/search?category=${encodeURIComponent(category)}`);
    onClose();
  };

  const navItems = [
    { label: 'Home Page', path: '/', icon: Home },
    { label: 'Overview Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Search & Browse', path: '/search', icon: Search },
    { label: 'AI Campus Assistant', path: '/ai-assistant', icon: Bot },
    { label: 'Report Lost Item', path: '/report-lost', icon: PlusCircle, highlight: 'lost' },
    { label: 'Report Found Item', path: '/report-found', icon: ShieldCheck, highlight: 'found' },
  ];

  if (user) {
    navItems.push(
      { label: 'Chat & Messenger', path: '/chat', icon: MessageSquare, highlight: '' },
      { label: 'My Submitted Reports', path: '/my-reports', icon: FileText, highlight: '' },
      { label: 'My Account & Profile', path: '/profile', icon: User, highlight: '' }
    );
  }

  if (isAdmin) {
    navItems.push(
      { label: 'Admin Dashboard', path: '/admin', icon: ShieldCheck, highlight: 'admin' }
    );
  }

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 left-0 z-40 h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-6 overflow-y-auto">
          {/* Mobile Drawer Header */}
          <div className="flex items-center justify-between lg:hidden pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-white text-sm">
              Navigation Menu
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Navigation */}
          <div>
            <span className="px-3 text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
              Main Menu
            </span>
            <nav className="mt-2 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50 shadow-xs'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Category Shortcuts */}
          <div>
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                Browse Categories
              </span>
              <Tag className="w-3 h-3 text-slate-400" />
            </div>
            <div className="space-y-1">
              {CATEGORIES.slice(0, 6).map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center justify-between"
                >
                  <span className="truncate">{cat}</span>
                  <span className="text-[10px] text-slate-400">
                    {items.filter(i => i.category === cat && i.status === 'active').length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Campus Quick Stats Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Campus Success Rate</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <div className="font-bold text-slate-900 dark:text-white text-base">
                  {activeItemsCount}
                </div>
                <div className="text-[10px] text-slate-400">Active Listing</div>
              </div>
              <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <div className="font-bold text-emerald-600 dark:text-emerald-400 text-base">
                  {claimedCount}
                </div>
                <div className="text-[10px] text-slate-400">Reunited</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info inside sidebar */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
            <PhoneCall className="w-3.5 h-3.5 text-blue-500" />
            <span>Campus Security Office</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Student Union Rm 104 • (555) 000-1122
          </p>
        </div>
      </aside>
    </>
  );
};
