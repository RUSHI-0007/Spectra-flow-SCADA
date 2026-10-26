import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface HelpTooltipProps {
  term: string;
  explanation: string;
  placement?: 'top' | 'bottom' | 'right' | 'left';
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({ 
  term, 
  explanation, 
  placement = 'top' 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const placementClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  }[placement];

  return (
    <span 
      className="relative inline-flex items-center ml-1 align-middle group cursor-help"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onClick={(e) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
      }}
    >
      <HelpCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400 transition-colors" />
      {isOpen && (
        <span 
          role="tooltip"
          className={`absolute z-50 w-56 p-2.5 bg-slate-900 text-slate-200 text-xs rounded-lg shadow-xl border border-slate-700/80 pointer-events-none leading-relaxed transition-all ${placementClasses}`}
        >
          <span className="block font-semibold text-blue-400 text-[11px] mb-0.5">
            {term}
          </span>
          <span className="text-slate-300 text-[11px]">
            {explanation}
          </span>
        </span>
      )}
    </span>
  );
};
