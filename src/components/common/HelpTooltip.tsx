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
      <HelpCircle className="w-3.5 h-3.5 text-[#6B7785] group-hover:text-[#1F2933] transition-colors" />
      {isOpen && (
        <span 
          role="tooltip"
          className={`absolute z-50 w-56 p-2.5 bg-white text-[#1F2933] text-xs rounded-lg shadow-md border border-[#D5DBE1] pointer-events-none leading-relaxed transition-all ${placementClasses}`}
        >
          <span className="block font-bold text-[#3B4651] text-[11px] mb-0.5">
            {term}
          </span>
          <span className="text-[#52606D] text-[11px] block">
            {explanation}
          </span>
        </span>
      )}
    </span>
  );
};
