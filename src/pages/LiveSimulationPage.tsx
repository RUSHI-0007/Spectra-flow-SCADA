// ============================================================================
// Page 2: Live Conveyor Simulation (Hero Exhibition Page)
// Light Industrial HMI Theme
// Palette tokens: graphite #3B4651, olive #6B7A5A, amber #B7791F
// ============================================================================

import React from 'react';
import { ConveyorCanvas } from '../components/conveyor/ConveyorCanvas';
import { PlcStatusStrip } from '../components/conveyor/PlcStatusStrip';
import { ManualControls } from '../components/conveyor/ManualControls';
import { StickyControlBar } from '../components/conveyor/StickyControlBar';
import { useScada } from '../context/ScadaContext';
import { Activity, Gauge, Layers, CheckCircle2, Archive } from 'lucide-react';
import { HelpTooltip } from '../components/common/HelpTooltip';

export const LiveSimulationPage: React.FC = () => {
  const { state } = useScada();
  const { counters } = state;

  return (
    <div className="space-y-3 sm:space-y-4 w-full">
      
      {/* Page Title & Fast Stats Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-[#D5DBE1]">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#1F2933] flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#3B4651]" />
            Live Conveyor &amp; Bottle Sorting Cell
          </h1>
          <p className="text-xs text-[#52606D] mt-0.5">
            Real-time automated bottle detection, pneumatic diverter sorting, and drive diagnostics
          </p>
        </div>

        {/* Quick Readout Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="bg-white px-3 py-1.5 rounded-lg border border-[#D5DBE1] flex items-center gap-2 shadow-xs">
            <Layers className="w-4 h-4 text-[#3B4651]" />
            <span className="text-[#52606D]">Total fed:</span>
            <span className="text-[#1F2933] font-bold font-tag text-sm">{counters.totalInfeed}</span>
            <HelpTooltip 
              term="Total Bottles Fed" 
              explanation="Total number of bottles introduced onto the conveyor infeed since line start." 
            />
          </div>

          <div className="bg-[#F2F5F0] px-3 py-1.5 rounded-lg border border-[#CCD5C5] flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-[#6B7A5A]" />
            <span className="text-[#52606D]">Bin A (500ml):</span>
            <span className="text-[#1F2933] font-bold font-tag text-sm">{counters.categoryA}</span>
          </div>

          <div className="bg-[#FDF6E9] px-3 py-1.5 rounded-lg border border-[#E8D4B4] flex items-center gap-2 shadow-xs">
            <Archive className="w-4 h-4 text-[#B7791F]" />
            <span className="text-[#52606D]">Bin B (1000ml):</span>
            <span className="text-[#1F2933] font-bold font-tag text-sm">{counters.categoryB}</span>
          </div>

          <div className="bg-white px-3 py-1.5 rounded-lg border border-[#D5DBE1] flex items-center gap-2 shadow-xs">
            <Gauge className="w-4 h-4 text-[#3B4651]" />
            <span className="text-[#52606D]">Rate:</span>
            <span className="text-[#1F2933] font-bold font-tag text-sm">{counters.currentBpm} BPM</span>
            <HelpTooltip 
              term="Throughput Rate (BPM)" 
              explanation="Bottles Per Minute: production rate calculated from current belt velocity." 
            />
          </div>
        </div>
      </div>

      {/* 1. PLC Hardware Status Strip */}
      <PlcStatusStrip />

      {/* 2. Interactive Conveyor Canvas (Hero) */}
      <ConveyorCanvas />

      {/* 3. Operator Control Console & Fault Injection Panel */}
      <ManualControls />

      {/* 4. Sticky Bottom Control Bar */}
      <StickyControlBar />

    </div>
  );
};
