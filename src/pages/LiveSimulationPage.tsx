// ============================================================================
// Page 2: Live Conveyor Simulation (Hero Exhibition Page)
// Main interactive canvas, PLC status strip, and physical operator console
// ============================================================================

import React from 'react';
import { ConveyorCanvas } from '../components/conveyor/ConveyorCanvas';
import { PlcStatusStrip } from '../components/conveyor/PlcStatusStrip';
import { ManualControls } from '../components/conveyor/ManualControls';
import { useScada } from '../context/ScadaContext';
import { Activity, Gauge, Layers, CheckCircle2, Archive, AlertOctagon } from 'lucide-react';

export const LiveSimulationPage: React.FC = () => {
  const { state } = useScada();
  const { counters, motor } = state;

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      
      {/* Page Title & Fast Stats Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-black font-mono text-white uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            Live Conveyor & Bottle Sorting Cell
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Direct drive VFD simulation with non-contact optical inspection and pneumatic sorting
          </p>
        </div>

        {/* Quick Readout Badges */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="bg-slate-900 px-3 py-1 rounded border border-slate-800 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-400">Total:</span>
            <span className="text-white font-bold">{counters.totalInfeed}</span>
          </div>

          <div className="bg-slate-900 px-3 py-1 rounded border border-slate-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">Bin A:</span>
            <span className="text-emerald-300 font-bold">{counters.categoryA}</span>
          </div>

          <div className="bg-slate-900 px-3 py-1 rounded border border-slate-800 flex items-center gap-1.5">
            <Archive className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Bin B:</span>
            <span className="text-amber-300 font-bold">{counters.categoryB}</span>
          </div>

          <div className="bg-slate-900 px-3 py-1 rounded border border-slate-800 flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">BPM:</span>
            <span className="text-cyan-300 font-bold">{counters.currentBpm}</span>
          </div>
        </div>
      </div>

      {/* 1. PLC Hardware Status Strip */}
      <PlcStatusStrip />

      {/* 2. Interactive Animated SVG / React Conveyor Canvas */}
      <ConveyorCanvas />

      {/* 3. Operator Control Console & Fault Injection Panel */}
      <ManualControls />

    </div>
  );
};
