// ============================================================================
// Operator Notification Toast Banner (Light Industrial Theme)
// ============================================================================

import React from 'react';
import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

interface ToastBannerProps {
  toast: { message: string; type: 'info' | 'warn' | 'error'; id: number } | null;
  onDismiss: () => void;
}

export const ToastBanner: React.FC<ToastBannerProps> = ({ toast, onDismiss }) => {
  if (!toast) return null;

  const getStyle = () => {
    switch (toast.type) {
      case 'error':
        return 'bg-[#FFEBEE] border-[#EF9A9A] text-[#C62828] shadow-xs';
      case 'warn':
        return 'bg-[#FFF8E1] border-[#FFE082] text-[#B7791F] shadow-xs';
      case 'info':
        return 'bg-[#F5F6F8] border-[#CBD2D9] text-[#3B4651] shadow-xs';
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'error':
        return <AlertCircle className="w-5 h-5 text-[#C62828] shrink-0" />;
      case 'warn':
        return <AlertTriangle className="w-5 h-5 text-[#D98200] shrink-0" />;
      case 'info':
        return <Info className="w-5 h-5 text-[#3B4651] shrink-0" />;
    }
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-3 md:right-6 left-3 sm:left-auto z-50 max-w-md w-auto sm:w-full">
      <div className={`p-3.5 rounded-lg border flex items-start gap-3 bg-white ${getStyle()}`}>
        {getIcon()}
        <div className="flex-1 text-xs leading-relaxed">
          <span className="font-bold block text-[10px] uppercase tracking-wider mb-0.5">
            {toast.type === 'error' ? 'Safety Interlock Notice' : toast.type === 'warn' ? 'Supervisory Warning' : 'System Notice'}
          </span>
          <span className="text-[#1F2933] font-medium">{toast.message}</span>
        </div>
        <button
          onClick={onDismiss}
          className="text-[#52606D] hover:text-[#1F2933] p-1 rounded transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
