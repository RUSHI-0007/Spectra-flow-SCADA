// ============================================================================
// Operator Notification Toast Banner
// Displays feedback for blocked operations, safety interlocks, and state changes
// ============================================================================

import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

interface ToastBannerProps {
  toast: { message: string; type: 'info' | 'warn' | 'error'; id: number } | null;
  onDismiss: () => void;
}

export const ToastBanner: React.FC<ToastBannerProps> = ({ toast, onDismiss }) => {
  if (!toast) return null;

  const getStyle = () => {
    switch (toast.type) {
      case 'error':
        return 'bg-red-950/95 border-red-500 text-red-200 shadow-red-950/50 led-glow-red';
      case 'warn':
        return 'bg-amber-950/95 border-amber-500 text-amber-200 shadow-amber-950/50 led-glow-amber';
      case 'info':
        return 'bg-cyan-950/95 border-cyan-500 text-cyan-200 shadow-cyan-950/50 led-glow-blue';
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />;
      case 'warn':
        return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
      case 'info':
        return <Info className="w-5 h-5 text-cyan-400 shrink-0" />;
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-in slide-in-from-bottom-5 duration-200">
      <div className={`p-3.5 rounded-lg border-2 shadow-2xl flex items-start gap-3 backdrop-blur-md ${getStyle()}`}>
        {getIcon()}
        <div className="flex-1 font-mono text-xs leading-relaxed">
          <span className="font-bold uppercase tracking-wider block text-[10px] opacity-80 mb-0.5">
            {toast.type === 'error' ? 'SAFETY INTERLOCK NOTICE' : toast.type === 'warn' ? 'SUPERVISORY WARNING' : 'SYSTEM STATUS'}
          </span>
          {toast.message}
        </div>
        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
