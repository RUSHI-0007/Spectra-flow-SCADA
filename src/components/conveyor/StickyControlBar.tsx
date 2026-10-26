// ============================================================================
// Sticky Control Bar (Light Industrial HMI Theme)
// Flat industrial pushbuttons:
// Start = solid green #2E7D32, Stop = amber #D98200, E-STOP = solid red #C62828,
// Reset = outlined graphite #3B4651 (no dark navy)
// Mode pill: Auto = graphite filled, Manual = outlined
// ============================================================================

import React, { useState } from 'react';
import { 
  Play, 
  Square, 
  RotateCcw, 
  ShieldAlert, 
  RotateCw, 
  Plus, 
  SlidersHorizontal,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { useScada } from '../../context/ScadaContext';

export const StickyControlBar: React.FC = () => {
  const { state, dispatch } = useScada();
  const { machineState, operationMode, activeFaults, motor } = state;
  const [showSecondaryDrawer, setShowSecondaryDrawer] = useState<boolean>(false);

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
    <>
      {/* Secondary Controls Mobile Drawer (<md) */}
      {showSecondaryDrawer && (
        <div className="md:hidden fixed bottom-[120px] left-0 right-0 z-30 bg-[#F5F6F8] border-t border-[#CBD2D9] p-3 shadow-md flex items-center justify-between gap-2">
          <button
            onClick={handleToggleMode}
            className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] ${
              operationMode === 'AUTO'
                ? 'bg-[#3B4651] border-[#3B4651] text-white'
                : 'bg-white border-[#3B4651] text-[#1F2933]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Mode: {operationMode}</span>
          </button>

          <button
            onClick={handleSpawnBottle}
            className="flex-1 py-2.5 px-3 rounded-lg text-xs font-semibold bg-white border border-[#D5DBE1] text-[#1F2933] hover:bg-[#ECEFF2] flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
          >
            <Plus className="w-3.5 h-3.5 text-[#3B4651]" />
            <span>Feed Bottle</span>
          </button>
        </div>
      )}

      {/* Main Sticky Operator Control Bar */}
      {/* On phone: sits above bottom-14 (BottomTabBar height); on md+: sits on bottom-0 */}
      <div className="fixed bottom-14 md:bottom-0 left-0 right-0 z-30 bg-white border-t border-[#CBD2D9] px-2 sm:px-4 md:px-6 py-2 md:py-2.5 shadow-xs">
        <div className="w-full flex items-center justify-between gap-1.5 sm:gap-3">
          
          {/* Left on md+: Quick Live Machine Status */}
          <div className="hidden lg:flex items-center gap-3 text-xs">
            <div className="flex items-center gap-2 bg-[#F5F6F8] px-3 py-1.5 rounded-lg border border-[#D5DBE1]">
              <span className={`w-2.5 h-2.5 rounded-full ${
                isRunning ? 'bg-[#2E7D32]' :
                machineState === 'STARTING' || machineState === 'STOPPING' ? 'bg-[#D98200]' :
                isEstop || isFault ? 'bg-[#C62828]' : 'bg-[#6B7785]'
              }`} />
              <span className="font-semibold text-[#1F2933]">
                {machineState === 'RUNNING' ? 'Running' :
                 machineState === 'STARTING' ? 'Starting' :
                 machineState === 'STOPPING' ? 'Stopping' :
                 machineState === 'FAULT' ? 'Fault Trip' :
                 machineState === 'EMERGENCY_STOP' ? 'Emergency Stop' : 'Standby (Idle)'}
              </span>
            </div>

            <div className="text-[#52606D]">
              Speed: <span className="text-[#1F2933] font-semibold font-tag">{motor.actualSpeedMs} m/s</span>
            </div>

            <div className="text-[#52606D]">
              Rate: <span className="text-[#1F2933] font-semibold font-tag">{state.counters.currentBpm} BPM</span>
            </div>
          </div>

          {/* Center: Primary Operator Buttons (Start, Stop, E-STOP, Reset) */}
          {/* Min 48px height on phone, full flat industrial design */}
          <div className="flex items-center justify-between sm:justify-center gap-1.5 sm:gap-3 flex-1 lg:flex-none">
            
            {/* 1. Start Button (Solid Green #2E7D32) */}
            <button
              onClick={handleStart}
              disabled={isRunning || isEstop || isFault}
              className={`flex-1 sm:flex-none px-3 sm:px-6 py-2.5 sm:py-2.5 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors select-none min-h-[48px] cursor-pointer ${
                isRunning || isEstop || isFault
                  ? 'bg-[#E2E6EA] text-[#9AA5B1] border border-[#CBD2D9] cursor-not-allowed opacity-60'
                  : 'bg-[#2E7D32] hover:bg-[#256628] text-white active:bg-[#1B5E20]'
              }`}
            >
              <Play className="w-4 h-4 fill-current shrink-0" />
              <span>Start</span>
            </button>

            {/* 2. Stop Button (Solid Amber #D98200) */}
            <button
              onClick={handleStop}
              disabled={!isRunning}
              className={`flex-1 sm:flex-none px-3 sm:px-5 py-2.5 sm:py-2.5 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors select-none min-h-[48px] cursor-pointer ${
                !isRunning
                  ? 'bg-[#E2E6EA] text-[#9AA5B1] border border-[#CBD2D9] cursor-not-allowed opacity-60'
                  : 'bg-[#D98200] hover:bg-[#B86E00] text-white active:bg-[#965A00]'
              }`}
            >
              <Square className="w-4 h-4 fill-current shrink-0" />
              <span>Stop</span>
            </button>

            {/* 3. EMERGENCY STOP (Solid Red #C62828 - The ONLY big red element on screen) */}
            {isEstop ? (
              <button
                onClick={handleResetEstop}
                className="flex-1 sm:flex-none px-3 sm:px-5 py-2.5 sm:py-2.5 rounded-lg bg-[#C62828] hover:bg-[#B71C1C] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer min-h-[48px] border-2 border-white"
              >
                <RotateCw className="w-4 h-4 shrink-0" />
                <span className="truncate">Release E-Stop</span>
              </button>
            ) : (
              <button
                onClick={handleEstop}
                className="flex-1 sm:flex-none px-3.5 sm:px-7 py-2.5 sm:py-2.5 rounded-lg bg-[#C62828] hover:bg-[#B71C1C] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 min-h-[48px] cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4 shrink-0 text-white" />
                <span>E-STOP</span>
              </button>
            )}

            {/* 4. Reset Button (Outlined graphite #3B4651, not dark navy) */}
            <button
              onClick={handleResetFault}
              className="flex-1 sm:flex-none px-3 sm:px-5 py-2.5 sm:py-2.5 rounded-lg bg-white border-2 border-[#3B4651] text-[#3B4651] hover:bg-[#ECEFF2] font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 min-h-[48px] cursor-pointer transition-colors"
            >
              <RotateCcw className="w-4 h-4 shrink-0" />
              <span>Reset</span>
            </button>

            {/* Mobile Expand Toggle for Secondary Controls (<md) */}
            <button
              onClick={() => setShowSecondaryDrawer(!showSecondaryDrawer)}
              className="md:hidden p-2 rounded-lg border border-[#D5DBE1] bg-[#F5F6F8] text-[#52606D] hover:text-[#1F2933] min-h-[48px] min-w-[44px] flex items-center justify-center cursor-pointer"
              aria-label="Toggle secondary controls"
            >
              {showSecondaryDrawer ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </button>

          </div>

          {/* Right on md+: Secondary Controls (Mode, Feed Bottle) */}
          <div className="hidden md:flex items-center gap-2">
            {/* Neutral grey pill with dark text (Auto = graphite filled, Manual = outlined) */}
            <button
              onClick={handleToggleMode}
              className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 min-h-[44px] ${
                operationMode === 'AUTO'
                  ? 'bg-[#3B4651] border-[#3B4651] text-white'
                  : 'bg-white border-[#3B4651] text-[#1F2933]'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{operationMode === 'AUTO' ? 'Auto Mode' : 'Manual Mode'}</span>
            </button>

            <button
              onClick={handleSpawnBottle}
              className="px-3 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-[#ECEFF2] text-[#1F2933] border border-[#D5DBE1] transition-colors flex items-center gap-1 cursor-pointer min-h-[44px]"
              title="Spawn bottle onto infeed"
            >
              <Plus className="w-3.5 h-3.5 text-[#3B4651]" />
              <span>Feed Bottle</span>
            </button>
          </div>

        </div>
      </div>
    </>
  );
};
