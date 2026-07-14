import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("UI Error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0E0D0C] text-white p-6">
          <div className="max-w-md text-center">
            <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase mb-4">Something went wrong</p>
            <h1 className="font-forum text-4xl mb-4">We hit a snag</h1>
            <p className="text-white/60 mb-8">
              Please refresh the page. If the problem persists, call us at +88-123-123456.
            </p>
            <button onClick={() => window.location.reload()} className="btn-gold btn-gold-solid">
              <span>Refresh Page</span>
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
