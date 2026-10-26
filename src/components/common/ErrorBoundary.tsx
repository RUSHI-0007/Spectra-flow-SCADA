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
        <div className="min-h-screen bg-[#EEF0F2] text-[#1F2933] flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-white border-2 border-[#C62828] rounded-lg p-6 shadow-md space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#FFEBEE] border border-[#EF9A9A] flex items-center justify-center">
                <AlertOctagon className="w-6 h-6 text-[#C62828]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#1F2933]">HMI UI Component Fault</h2>
                <p className="text-xs text-[#C62828]">Isolated by SCADA Fault-Tolerant Boundary</p>
              </div>
            </div>

            <div className="p-3 bg-[#F5F6F8] rounded border border-[#D5DBE1] text-xs font-tag text-[#1F2933] break-words">
              {this.state.error?.message || 'Unexpected UI rendering exception occurred.'}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="px-4 py-2 bg-[#3B4651] hover:bg-[#2D363F] text-white font-tag font-bold text-xs rounded transition-colors flex items-center gap-1.5 cursor-pointer min-h-[44px]"
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
