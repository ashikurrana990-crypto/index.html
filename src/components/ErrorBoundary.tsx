import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      let errorMessage = 'An unexpected error occurred.';
      let isFirebaseError = false;

      try {
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error && parsed.operationType) {
            errorMessage = `Database Error: ${parsed.error} during ${parsed.operationType} on ${parsed.path || 'unknown path'}`;
            isFirebaseError = true;
          }
        }
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100 p-8 md:p-12 text-center space-y-8 border border-gray-100">
            <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto">
              <AlertTriangle size={40} />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-display font-black text-gray-900">Something went wrong</h1>
              <p className="text-gray-500 text-sm leading-relaxed">
                {isFirebaseError ? 'We encountered a problem with the database connection.' : 'The application encountered an unexpected error.'}
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl text-left">
              <p className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">Error Details</p>
              <p className="text-sm text-gray-600 font-medium break-words">
                {errorMessage}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center justify-center space-x-2 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-colors"
              >
                <RefreshCcw size={18} />
                <span>Retry</span>
              </button>
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center space-x-2 py-4 bg-white border border-gray-200 text-gray-900 rounded-2xl font-bold hover:bg-gray-50 transition-colors"
              >
                <Home size={18} />
                <span>Home</span>
              </button>
            </div>
            
            <p className="text-xs text-gray-400">
              If the problem persists, please contact support or check your internet connection.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
