import React, { useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorBoundary } from './components/ErrorBoundary';

// Lazy-loaded pages for bundle size optimization and faster initial loads
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('./pages/Register').then(m => ({ default: m.Register })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const ReportLostItem = lazy(() => import('./pages/ReportLostItem').then(m => ({ default: m.ReportLostItem })));
const ReportFoundItem = lazy(() => import('./pages/ReportFoundItem').then(m => ({ default: m.ReportFoundItem })));
const SearchItems = lazy(() => import('./pages/SearchItems').then(m => ({ default: m.SearchItems })));
const ItemDetails = lazy(() => import('./pages/ItemDetails').then(m => ({ default: m.ItemDetails })));
const MyReports = lazy(() => import('./pages/MyReports').then(m => ({ default: m.MyReports })));
const Profile = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const MatchResults = lazy(() => import('./pages/MatchResults').then(m => ({ default: m.MatchResults })));
const ChatPage = lazy(() => import('./pages/Chat').then(m => ({ default: m.ChatPage })));
const AIAssistantPage = lazy(() => import('./pages/AIAssistant').then(m => ({ default: m.AIAssistantPage })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const NotFound = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));

const PageLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center p-8">
    <LoadingSpinner size="lg" text="Loading campus portal page..." />
  </div>
);

const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toastMessage } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed top-20 right-4 z-50 px-4 py-3 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xl flex items-center gap-2.5 text-xs font-semibold border border-slate-700/50"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Header Navbar */}
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* Body Layout: Sidebar + Main Content Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route
                path="/report-lost"
                element={
                  <ProtectedRoute>
                    <ReportLostItem />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/report-found"
                element={
                  <ProtectedRoute>
                    <ReportFoundItem />
                  </ProtectedRoute>
                }
              />
              <Route path="/search" element={<SearchItems />} />
              <Route path="/item/:id" element={<ItemDetails />} />
              <Route path="/match-results" element={<MatchResults />} />
              <Route path="/match-results/:itemId" element={<MatchResults />} />
              <Route path="/ai-assistant" element={<AIAssistantPage />} />
              <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                    <ChatPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-reports"
                element={
                  <ProtectedRoute>
                    <MyReports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
        </main>
      </div>

      {/* Global Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <AppProvider>
        <AppLayout />
      </AppProvider>
    </Router>
  );
}
