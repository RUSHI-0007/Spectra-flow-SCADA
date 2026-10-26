// ============================================================================
// Confirmation Dialog Modal for Destructive SCADA Operations
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
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-100">
      <div className="bg-slate-900 border-2 border-slate-700 rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
              isDestructive ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-mono text-white uppercase">{title}</h3>
              <p className="text-[11px] text-slate-400 font-mono">SCADA Supervisory Safety Confirmation</p>
            </div>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-white p-1 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300 font-mono leading-relaxed bg-slate-950 p-3 rounded border border-slate-800">
          {message}
        </p>

        <div className="flex justify-end gap-2.5 pt-2">
          <button
            onClick={onCancel}
            className="px-3.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-semibold transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-3.5 py-1.5 rounded text-xs font-mono font-bold transition-all shadow-md cursor-pointer ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
