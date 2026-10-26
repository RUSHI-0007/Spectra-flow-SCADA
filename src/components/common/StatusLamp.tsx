// ============================================================================
// Industrial Status Lamp & Indicator
// ============================================================================

import React from 'react';

interface StatusLampProps {
  label: string;
  active: boolean;
  color?: 'green' | 'amber' | 'red' | 'blue';
  tag?: string;
  flashing?: boolean;
}

export const StatusLamp: React.FC<StatusLampProps> = ({
  label,
  active,
  color = 'green',
  tag,
  flashing = false,
}) => {
  const getColorStyles = () => {
    if (!active) {
      return 'bg-slate-800 border-slate-700/80 text-slate-500';
    }
    switch (color) {
      case 'green':
        return `bg-emerald-500 border-emerald-400 text-white ${flashing ? 'animate-pulse' : ''}`;
      case 'amber':
        return `bg-amber-500 border-amber-300 text-slate-950 ${flashing ? 'animate-pulse' : ''}`;
      case 'red':
        return `bg-red-500 border-red-300 text-white ${flashing ? 'animate-pulse' : ''}`;
      case 'blue':
        return `bg-blue-500 border-blue-300 text-white ${flashing ? 'animate-pulse' : ''}`;
    }
  };

  return (
    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800/80 select-none">
      <div className={`w-3 h-3 rounded-full border transition-all ${getColorStyles()}`} />
      <div className="flex flex-col">
        <span className={`text-xs font-semibold leading-tight ${active ? 'text-slate-100' : 'text-slate-400'}`}>
          {label}
        </span>
        {tag && (
          <span className="text-[10px] font-tag text-slate-500 leading-tight">
            {tag}
          </span>
        )}
      </div>
    </div>
  );
};
