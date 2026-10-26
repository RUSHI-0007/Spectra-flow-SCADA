// ============================================================================
// Confirmation Dialog Modal (Light Industrial Theme)
// Responsive: Full-width bottom sheet on phone (<sm), centered card on sm+
// ============================================================================

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isDangerous?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm Action',
  cancelLabel = 'Cancel',
  isDestructive = true,
  isDangerous,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const isWarningAction = isDangerous !== undefined ? isDangerous : isDestructive;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40">
      <div 
        className="fixed inset-0"
        onClick={onCancel}
      />
      <div className="relative z-10 bg-white border border-[#CBD2D9] rounded-t-xl sm:rounded-lg max-w-md w-full p-5 shadow-lg space-y-4 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              isWarningAction 
                ? 'bg-[#FFEBEE] text-[#C62828] border border-[#EF9A9A]' 
                : 'bg-[#F5F6F8] text-[#3B4651] border border-[#CBD2D9]'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1F2933]">{title}</h3>
              <p className="text-xs text-[#52606D]">Supervisory Action Confirmation</p>
            </div>
          </div>
          <button 
            onClick={onCancel} 
            className="text-[#52606D] hover:text-[#1F2933] p-1.5 rounded transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-[#52606D] leading-relaxed bg-[#F5F6F8] p-3 rounded-lg border border-[#D5DBE1]">
          {message}
        </p>

        <div className="flex justify-end gap-2.5 pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-[#F5F6F8] hover:bg-[#ECEFF2] border border-[#D5DBE1] text-[#1F2933] text-xs font-semibold transition-colors cursor-pointer min-h-[44px]"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer min-h-[44px] text-white ${
              isWarningAction
                ? 'bg-[#C62828] hover:bg-[#B71C1C]'
                : 'bg-[#3B4651] hover:bg-[#2D363F]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
