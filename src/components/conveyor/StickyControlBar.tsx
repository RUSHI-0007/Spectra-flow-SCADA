import React from 'react';
import { 
  Play, 
  Square, 
  RotateCcw, 
  ShieldAlert, 
  RotateCw, 
  Plus, 
  SlidersHorizontal 
} from 'lucide-react';
import { useScada } from '../../context/ScadaContext';
import { HelpTooltip } from '../common/HelpTooltip';

export const StickyControlBar: React.FC = () => {
  const { state, dispatch } = useScada();
  const { machineState, operationMode, activeFaults, motor } = state;

  const isRunning = machineState === 'RUNNING';
  const isEstop = machineState === 'EMERGENCY_STOP' || activeFaults.emergencyStop;
  const isFault = machineState === 'FAULT' || Object.values(activeFaults).some(Boolean);

  const handleStart = () => {
    dispatch({ type: 'START_COMMAND' });
  };

  const handleStop = () => {
    dispatch({ type: 'STOP_COMMAND' });
  };

  const handleEstop = () => {
    dispatch({ type: 'ESTOP_COMMAND' });
  };

  const handleResetEstop = () => {
    dispatch({ type: 'RESET_ESTOP_COMMAND' });
  };

  const handleResetFault = () => {
    dispatch({ type: 'RESET_FAULT_COMMAND' });
  };

  const handleToggleMode = () => {
    const nextMode = operationMode === 'AUTO' ? 'MANUAL' : 'AUTO';
    dispatch({ type: 'SET_OP_MODE', mode: nextMode });
  };

  const handleSpawnBottle = () => {
    dispatch({ type: 'SPAWN_MANUAL_BOTTLE' });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800/90 px-4 sm:px-6 py-3 shadow-2xl">
      <div className="w-full flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Quick Status Summary */}
        <div className="hidden md:flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className={`w-2.5 h-2.5 rounded-full ${
              isRunning ? 'bg-emerald-400 animate-pulse' :
              machineState === 'STARTING' || machineState === 'STOPPING' ? 'bg-amber-400' :
              isEstop || isFault ? 'bg-red-500 animate-ping' : 'bg-slate-500'
            }`} />
            <span className="font-semibold text-white">
              {machineState === 'RUNNING' ? 'Running' :
               machineState === 'STARTING' ? 'Starting' :
               machineState === 'STOPPING' ? 'Stopping' :
               machineState === 'FAULT' ? 'Fault Trip' :
               machineState === 'EMERGENCY_STOP' ? 'Emergency Stop' : 'Standby (Idle)'}
            </span>
          </div>

          <div className="text-slate-400">
            Speed: <span className="text-white font-semibold font-tag">{motor.actualSpeedMs} m/s</span>
          </div>

          <div className="text-slate-400">
            Rate: <span className="text-white font-semibold font-tag">{state.counters.currentBpm} BPM</span>
          </div>
        </div>

        {/* Center: 4 Primary Operator Action Pushbuttons */}
        <div className="flex items-center gap-2.5 sm:gap-3 mx-auto md:mx-0">
          
          {/* Green START Button */}
          <button
            onClick={handleStart}
            disabled={isRunning || isEstop || isFault}
            className={`px-5 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md select-none ${
              isRunning
                ? 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed opacity-50'
                : isEstop || isFault
                ? 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white border border-emerald-400/50 shadow-emerald-950/50 cursor-pointer'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start</span>
          </button>

          {/* Normal STOP Button */}
          <button
            onClick={handleStop}
            disabled={!isRunning}
            className={`px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md select-none ${
              !isRunning
                ? 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed opacity-50'
                : 'bg-amber-600 hover:bg-amber-500 active:scale-95 text-white border border-amber-400/50 shadow-amber-950/50 cursor-pointer'
            }`}
          >
            <Square className="w-4 h-4 fill-current" />
            <span>Stop</span>
          </button>

          {/* EMERGENCY STOP (MUSHROOM) */}
          {isEstop ? (
            <button
              onClick={handleResetEstop}
              className="px-4 sm:px-5 py-2.5 rounded-xl bg-red-950 hover:bg-red-900 border-2 border-red-500 text-red-200 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg cursor-pointer transition-all animate-pulse"
            >
              <RotateCw className="w-4 h-4 animate-spin text-red-300" />
              <span>Twist to Reset E-Stop</span>
            </button>
          ) : (
            <button
              onClick={handleEstop}
              className="px-5 sm:px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 border border-red-400 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-red-950/60 cursor-pointer transition-all"
            >
              <ShieldAlert className="w-4 h-4 text-white" />
              <span>E-Stop</span>
            </button>
          )}

          {/* BLUE FAULT RESET BUTTON */}
          <button
            onClick={handleResetFault}
            className="px-4 sm:px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 border border-blue-400/50 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md cursor-pointer transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Fault</span>
          </button>

        </div>

        {/* Right: Mode Switch & Spawn Bottle Button */}
        <div className="flex items-center gap-2">
          
          <button
            onClick={handleToggleMode}
            className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
              operationMode === 'AUTO'
                ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                : 'bg-amber-600/20 border-amber-500/50 text-amber-300'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{operationMode === 'AUTO' ? 'Auto Mode' : 'Manual Mode'}</span>
          </button>

          <button
            onClick={handleSpawnBottle}
            className="px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
            title="Spawn a bottle onto infeed"
          >
            <Plus className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Feed Bottle</span>
          </button>

        </div>

      </div>
    </div>
  );
};
