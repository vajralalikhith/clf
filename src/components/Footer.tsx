import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Shield, Heart, MapPin, Mail, Phone } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 transition-colors pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-100 dark:border-slate-800">
          {/* Brand & Mission */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                <Compass className="w-5 h-5" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white text-base">
                Campus <span className="text-blue-600 dark:text-blue-400">Lost&Found</span>
              </span>
            </Link>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Empowering students, faculty, and staff with a streamlined digital hub to safely reconnect misplaced items with their rightful owners.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-bold text-slate-900 dark:text-white tracking-wider">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/search" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Search Lost & Found
                </Link>
              </li>
              <li>
                <Link to="/report-lost" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Report a Lost Item
                </Link>
              </li>
              <li>
                <Link to="/report-found" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Report a Found Item
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Campus Overview Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Safety & Protocol */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-bold text-slate-900 dark:text-white tracking-wider">
              Recovery Guidelines
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Always meet in public campus zones (Student Union/Library).</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                <span>Verify ownership via unique serial numbers or photo IDs.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>Unclaimed high-value electronics go to Security Desk.</span>
              </li>
            </ul>
          </div>

          {/* Security Office Helpdesk */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-bold text-slate-900 dark:text-white tracking-wider">
              Campus Lost & Found Office
            </h4>
            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                <span>Student Union Center, Suite 104</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-blue-500" />
                <span>(555) 000-1122 (Mon–Fri 8am–6pm)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-500" />
                <span>lostandfound@campus.edu</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} Campus Lost & Found System. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" />
            <span>for Students & Faculty</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
