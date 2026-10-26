// ============================================================================
// Page 2: Live Conveyor Simulation (Hero Exhibition Page)
// Clean, calm, modern "control room" look that guests and non-technical people
// can understand at a glance. Full width, large readable bins, sticky controls.
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
  const { counters, motor } = state;

  return (
    <div className="space-y-4 animate-in fade-in duration-150 w-full">
      
      {/* Page Title & Fast Stats Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            Live Conveyor &amp; Bottle Sorting Cell
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time automated bottle detection, pneumatic diverter sorting, and drive diagnostics
          </p>
        </div>

        {/* Quick Readout Badges */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <div className="bg-slate-900 px-3.5 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2 shadow-sm">
            <Layers className="w-4 h-4 text-blue-400" />
            <span className="text-slate-400">Total fed:</span>
            <span className="text-white font-bold font-tag text-sm">{counters.totalInfeed}</span>
            <HelpTooltip 
              term="Total Bottles Fed" 
              explanation="Total number of bottles introduced onto the conveyor infeed since line start." 
            />
          </div>

          <div className="bg-slate-900 px-3.5 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400">Bin A (500ml):</span>
            <span className="text-emerald-300 font-bold font-tag text-sm">{counters.categoryA}</span>
          </div>

          <div className="bg-slate-900 px-3.5 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2 shadow-sm">
            <Archive className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400">Bin B (1000ml):</span>
            <span className="text-amber-300 font-bold font-tag text-sm">{counters.categoryB}</span>
          </div>

          <div className="bg-slate-900 px-3.5 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2 shadow-sm">
            <Gauge className="w-4 h-4 text-blue-400" />
            <span className="text-slate-400">Rate:</span>
            <span className="text-white font-bold font-tag text-sm">{counters.currentBpm} BPM</span>
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

      {/* 4. Sticky Bottom Control Bar (Always visible at 1366x768 and 1920x1080 without scrolling) */}
      <StickyControlBar />

    </div>
  );
};
