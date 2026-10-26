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
      return 'bg-slate-800 border-slate-700 text-slate-500 shadow-none';
    }
    switch (color) {
      case 'green':
        return `bg-emerald-500 border-emerald-300 text-white led-glow-green ${flashing ? 'animate-pulse' : ''}`;
      case 'amber':
        return `bg-amber-500 border-amber-300 text-slate-950 led-glow-amber ${flashing ? 'animate-pulse' : ''}`;
      case 'red':
        return `bg-red-500 border-red-300 text-white led-glow-red ${flashing ? 'alarm-flash' : ''}`;
      case 'blue':
        return `bg-cyan-500 border-cyan-300 text-slate-950 led-glow-blue ${flashing ? 'animate-pulse' : ''}`;
    }
  };

  return (
    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-slate-950 border border-slate-800 select-none">
      <div className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${getColorStyles()}`} />
      <div className="flex flex-col">
        <span className={`text-[11px] font-mono font-bold leading-tight ${active ? 'text-slate-100' : 'text-slate-500'}`}>
          {label}
        </span>
        {tag && (
          <span className="text-[9px] font-mono text-slate-600 leading-tight">
            {tag}
          </span>
        )}
      </div>
    </div>
  );
};
