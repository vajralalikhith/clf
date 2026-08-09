import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shadow-lg border border-red-200 dark:border-red-900">
            <AlertOctagon className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-md">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Something went wrong
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              An unexpected error occurred in this section of the application.
            </p>
            {this.state.error && (
              <div className="p-3 mt-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-red-600 dark:text-red-400 text-left overflow-x-auto">
                {this.state.error.message}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try Again
            </button>
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm"
            >
              <Home className="w-3.5 h-3.5" />
              Return Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
