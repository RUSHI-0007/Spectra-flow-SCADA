// ============================================================================
// React Error Boundary Component
// Prevents any component runtime fault from blanking the control room screen
// ============================================================================

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('SCADA UI Runtime Error caught by boundary:', error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-slate-900 border-2 border-red-500 rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-950 border border-red-500 flex items-center justify-center">
                <AlertOctagon className="w-6 h-6 text-red-400 animate-pulse" />
              </div>
              <div>
                <h2 className="text-base font-bold font-mono text-white">HMI UI COMPONENT FAULT</h2>
                <p className="text-xs text-red-300 font-mono">Isolated by SCADA Fault-Tolerant Boundary</p>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded border border-slate-800 text-xs font-mono text-slate-300 break-words">
              {this.state.error?.message || 'Unexpected UI rendering exception occurred.'}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono font-bold text-xs rounded transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Recover Interface
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
