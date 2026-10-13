import React, { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled UI error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200/80 shadow-xl p-6 sm:p-8 text-center animate-fade-in">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-sm">
              <AlertTriangle className="w-7 h-7" />
            </div>
            
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 font-display">
              Something went wrong
            </h1>
            
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              An unexpected interface issue occurred. You can reload the page to refresh data or return safely to the home screen.
            </p>

            {this.state.error?.message && (
              <div className="mb-6 p-3 bg-slate-100 rounded-xl text-left text-xs font-mono text-slate-700 overflow-x-auto max-h-32 border border-slate-200/70">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </button>
              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                Return to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
