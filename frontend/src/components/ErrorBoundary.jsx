import React from 'react';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-800 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiAlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            
            <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-3">
              Application Error
            </h1>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
              We encountered an unexpected issue while rendering this view. Our system has logged the error.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button 
                onClick={this.handleReload}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-bold rounded-xl hover:opacity-90 transition"
              >
                <FiRefreshCw className="w-4 h-4" />
                Reload Page
              </button>
              
              <button 
                onClick={this.handleGoHome}
                className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                Return to Safety
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-8 text-left bg-red-50 dark:bg-red-950/30 p-4 rounded-xl overflow-x-auto">
                <p className="text-xs font-mono text-red-600 dark:text-red-400 font-bold mb-2">
                  {this.state.error.toString()}
                </p>
                <pre className="text-[10px] font-mono text-red-500 dark:text-red-300">
                  {this.state.errorInfo?.componentStack}
                </pre>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
