import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Mission Control Error caught by Boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-[200px] flex items-center justify-center p-6 bg-space-950 text-primary font-mono select-none">
          <div className="max-w-md w-full glass-panel-solid p-6 rounded-2xl border border-red-500/50 shadow-2xl flex flex-col items-center text-center gap-3">
            <div className="p-3 bg-red-500/20 text-red-400 rounded-full border border-red-500/40">
              <AlertTriangle className="w-7 h-7 animate-pulse" />
            </div>
            
            <h3 className="font-display font-bold text-sm text-red-400 tracking-wider">
              TELEMETRY SUBSYSTEM RECALIBRATION
            </h3>

            <p className="text-xs text-space-300 leading-relaxed">
              A temporary telemetry rendering exception was caught and isolated safely.
            </p>

            {this.state.error?.message && (
              <div className="w-full bg-space-900/80 p-2 rounded-lg border border-space-800 text-[11px] text-red-300 font-mono text-left overflow-x-auto max-h-20">
                {this.state.error.message}
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="mt-2 px-4 py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>RECALIBRATE SUBSYSTEM</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
