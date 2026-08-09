import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Compass,
  Search,
  PlusCircle,
  Bell,
  Sun,
  Moon,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  FileText,
  ShieldCheck,
  Check,
  LayoutDashboard,
  Sparkles,
  MessageSquare,
  Bot
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const {
    user,
    isAdmin,
    logout,
    darkMode,
    toggleDarkMode,
    notifications,
    unreadChatCount,
    markAllNotificationsRead,
    markNotificationAsRead
  } = useApp();

  const navigate = useNavigate();
  const location = useLocation();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Mobile Menu Trigger & Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2.5 min-h-[44px] min-w-[44px] rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-transform focus:outline-none flex items-center justify-center"
              aria-label="Toggle Navigation Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Compass className="w-6 h-6 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 dark:text-white text-base sm:text-lg leading-tight tracking-tight">
                  Campus<span className="text-blue-600 dark:text-blue-400"> Lost&Found</span>
                </span>
                <span className="text-[10px] uppercase font-semibold text-slate-600 dark:text-slate-400 tracking-wider">
                  Official Network
                </span>
              </div>
            </Link>
          </div>

          {/* Middle Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/70 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
            <Link
              to="/"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                isActive('/')
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Home
            </Link>
            <Link
              to="/dashboard"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                isActive('/dashboard')
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/search"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                isActive('/search')
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Search
            </Link>
            <Link
              to="/match-results"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
                isActive('/match-results')
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              AI Matcher
            </Link>
            <Link
              to="/ai-assistant"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
                isActive('/ai-assistant')
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-blue-500" />
              AI Assistant
            </Link>
            {user && (
              <>
                <Link
                  to="/chat"
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 relative ${
                    isActive('/chat')
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                  <span>Messages</span>
                  {unreadChatCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-white font-extrabold text-[10px] shadow-sm animate-pulse">
                      {unreadChatCount}
                    </span>
                  )}
                </Link>

                <Link
                  to="/my-reports"
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive('/my-reports')
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  My Reports
                </Link>
              </>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  isActive('/admin')
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/60'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                Admin Portal
              </Link>
            )}
          </nav>

          {/* Right Action Icons & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Report Actions */}
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/report-lost"
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/80 border border-amber-200 dark:border-amber-800 transition-colors flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Report Lost
              </Link>
              <Link
                to="/report-found"
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 shadow-sm transition-all flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Report Found
              </Link>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
                title={`Notifications (${unreadCount} unread)`}
                aria-label={`Notifications (${unreadCount} unread)`}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 min-w-5 px-1 items-center justify-center rounded-full bg-red-500 text-[10px] font-extrabold text-white ring-2 ring-white dark:ring-slate-900 animate-pulse shadow-sm">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-3 z-50 overflow-hidden"
                  >
                    <div className="px-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                        Campus Notifications
                      </h4>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllNotificationsRead}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
                        >
                          <Check className="w-3 h-3" /> Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                      {notifications.length === 0 ? (
                        <p className="p-4 text-center text-xs text-slate-500">
                          No notifications yet.
                        </p>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => {
                              markNotificationAsRead(notif.id);
                              if (notif.link) {
                                navigate(notif.link);
                                setShowNotifications(false);
                              }
                            }}
                            className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${
                              !notif.read ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <span className="font-semibold text-slate-900 dark:text-white text-xs">
                                {notif.title}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {notif.timestamp}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                              {notif.message}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Profile Avatar / Auth Buttons */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/30"
                  />
                  <span className="hidden md:inline-block font-semibold text-xs text-slate-800 dark:text-slate-200">
                    {user.name.split(' ')[0]}
                  </span>
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50"
                    >
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                        <p className="font-semibold text-slate-900 dark:text-white text-xs">
                          {user.name}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {user.email}
                        </p>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <UserIcon className="w-4 h-4 text-blue-500" />
                        My Profile
                      </Link>

                      <Link
                        to="/my-reports"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <FileText className="w-4 h-4 text-amber-500" />
                        My Reports
                      </Link>

                      <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                          navigate('/');
                        }}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
