// ============================================================================
// Industrial Status Lamp & Indicator (Light Industrial Theme)
// Colors strictly for machine state: Running #2E7D32, Warning #D98200,
// Fault #C62828, or Graphite #3B4651 active indicators. No neon.
// ============================================================================

import React from 'react';

interface StatusLampProps {
  label: string;
  active: boolean;
  color?: 'green' | 'amber' | 'red' | 'graphite';
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
      return 'bg-[#CBD2D9] border-[#9AA5B1]';
    }
    switch (color) {
      case 'green':
        return `bg-[#2E7D32] border-[#1B5E20] ${flashing ? 'opacity-75 animate-pulse' : ''}`;
      case 'amber':
        return `bg-[#D98200] border-[#965A00] ${flashing ? 'opacity-75 animate-pulse' : ''}`;
      case 'red':
        return `bg-[#C62828] border-[#B71C1C] ${flashing ? 'opacity-75 animate-pulse' : ''}`;
      case 'graphite':
      default:
        return `bg-[#3B4651] border-[#1F2933] ${flashing ? 'opacity-75 animate-pulse' : ''}`;
    }
  };

  return (
    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white border border-[#D5DBE1] select-none shadow-xs">
      <div className={`w-3 h-3 rounded-full border transition-all shrink-0 ${getColorStyles()}`} />
      <div className="flex flex-col truncate">
        <span className={`text-xs font-semibold leading-tight truncate ${active ? 'text-[#1F2933]' : 'text-[#52606D]'}`}>
          {label}
        </span>
        {tag && (
          <span className="text-[10px] font-tag text-[#52606D] leading-tight truncate">
            {tag}
          </span>
        )}
      </div>
    </div>
  );
};
