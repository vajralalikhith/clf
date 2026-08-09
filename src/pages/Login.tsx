import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Compass, Mail, Lock, LogIn, ShieldCheck, UserCheck, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/Modal';

export const Login: React.FC = () => {
  const { loginWithEmail, loginWithGoogle, sendPasswordReset, login } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Forgot password state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      await loginWithEmail(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      let message = 'Failed to sign in. Please check your credentials.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        message = 'Invalid email or password. Please try again.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Please enter a valid campus email address.';
      } else if (err.message) {
        message = err.message;
      }
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      await loginWithGoogle();
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setErrorMessage(err.message || 'Google Sign-In failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;

    setResetLoading(true);
    try {
      await sendPasswordReset(resetEmail);
      setResetSuccess(true);
    } catch (err: any) {
      console.error('Password reset error:', err);
      alert(err.message || 'Failed to send reset link.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail: string, demoName: string) => {
    login(demoEmail, demoName);
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-200/80 dark:border-slate-800 space-y-6"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mb-1">
            <Compass className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Campus Single Sign-On
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sign in with your university credentials (.edu) or Google Account
          </p>
        </div>

        {/* Error banner */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 flex items-start gap-2 text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Campus Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@campus.edu"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setResetEmail(email);
                  setResetSuccess(false);
                  setShowForgotModal(true);
                }}
                className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In to Portal</span>
              </>
            )}
          </button>
        </form>

        {/* Google Sign-In Option */}
        <div className="space-y-3">
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">
              Or continue with
            </span>
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2.5 shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign In with Google</span>
          </button>
        </div>

        {/* Demo Fast Logins */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2">
          <p className="text-[11px] font-semibold text-slate-400 text-center uppercase tracking-wider">
            Fast Demo Access
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDemoLogin('arivera@campus.edu', 'Alex Rivera')}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] font-medium text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-500" />
              <span>As Student</span>
            </button>
            <button
              onClick={() => handleDemoLogin('security@campus.edu', 'Officer Miller')}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] font-medium text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>As Security</span>
            </button>
          </div>
        </div>

        {/* Footer link to Register */}
        <div className="text-center text-xs text-slate-500">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            Register here
          </Link>
        </div>
      </motion.div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        title="Reset Your Campus Password"
      >
        {!resetSuccess ? (
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Enter your registered campus email address and we will send you instructions to reset your password.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Campus Email
              </label>
              <input
                type="email"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="student@campus.edu"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={resetLoading}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5"
              >
                {resetLoading ? 'Sending...' : 'Send Reset Email'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 text-center py-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Email Sent!</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                A password reset link was dispatched to <span className="font-semibold">{resetEmail}</span>.
              </p>
            </div>
            <button
              onClick={() => setShowForgotModal(false)}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 mt-2"
            >
              Back to Login
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};
