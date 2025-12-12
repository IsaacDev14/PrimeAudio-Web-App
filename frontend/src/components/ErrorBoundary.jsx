import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-900 text-white p-10 font-sans">
          <h1 className="text-3xl font-bold mb-4">Something went wrong.</h1>
          <div className="bg-black/50 p-6 rounded-lg overflow-auto">
            <h2 className="text-xl font-bold text-red-400 mb-2">{this.state.error && this.state.error.toString()}</h2>
            <pre className="text-sm text-gray-300">
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 bg-white text-red-900 px-6 py-2 rounded-lg font-bold"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
