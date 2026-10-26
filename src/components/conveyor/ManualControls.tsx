// ============================================================================
// Operator Controls & Simulation Panel
// Clean, calm, modern industrial control room layout
// ============================================================================

import React, { useState } from 'react';
import { 
  Play, 
  Square, 
  RotateCcw, 
  Sliders, 
  ShieldAlert, 
  RotateCw,
  AlertTriangle,
  Flame,
  Radio,
  Plus
} from 'lucide-react';
import { useScada } from '../../context/ScadaContext';
import { HelpTooltip } from '../common/HelpTooltip';

export const ManualControls: React.FC = () => {
  const { state, dispatch } = useScada();
  const { machineState, operationMode, activeFaults, settings, motor } = state;

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

  const handleSpeedChange = (val: number) => {
    dispatch({ type: 'UPDATE_SETTINGS', settings: { nominalSpeedMs: val } });
  };

  const handleIntervalChange = (val: number) => {
    dispatch({ type: 'UPDATE_SETTINGS', settings: { bottleSpawnIntervalSec: val } });
  };

  const handleSpawnBottle = (category?: 'CATEGORY_A' | 'CATEGORY_B') => {
    dispatch({ type: 'SPAWN_MANUAL_BOTTLE', category });
  };

  const handleTriggerDiverter = () => {
    dispatch({ type: 'MANUAL_TRIGGER_DIVERTER' });
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-4 sm:p-5 shadow-xl select-none">
      
      {/* Title */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-white">
            Operator Console &amp; Process Adjustments
          </h3>
          <HelpTooltip 
            term="Operator Console" 
            explanation="Allows direct supervisory control over conveyor drive, operation mode, target speed, and fault injection." 
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Station: <strong className="text-slate-200 font-tag">CONV-CTRL-01</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* SECTION 1: PRIMARY SAFETY PUSHBUTTONS (Cols 1-4) */}
        <div className="lg:col-span-4 bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="text-xs font-semibold text-slate-300 mb-3 flex items-center justify-between">
            <span>Primary Safety Drives</span>
            <span className="text-[10px] text-slate-500 font-tag">24V DC Relays</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* GREEN START BUTTON */}
            <button
              onClick={handleStart}
              disabled={isRunning || isEstop || isFault}
              className={`h-16 rounded-xl flex flex-col items-center justify-center gap-1 font-semibold text-xs transition-all shadow-md select-none ${
                isRunning
                  ? 'bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                  : isEstop || isFault
                  ? 'bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 active:scale-95 border border-emerald-400/60 text-white cursor-pointer'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start</span>
            </button>

            {/* YELLOW NORMAL STOP BUTTON */}
            <button
              onClick={handleStop}
              disabled={!isRunning}
              className={`h-16 rounded-xl flex flex-col items-center justify-center gap-1 font-semibold text-xs transition-all shadow-md select-none ${
                !isRunning
                  ? 'bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                  : 'bg-amber-600 hover:bg-amber-500 active:scale-95 border border-amber-400/60 text-white cursor-pointer'
              }`}
            >
              <Square className="w-4 h-4 fill-current" />
              <span>Normal Stop</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* BIG RED MUSHROOM EMERGENCY STOP */}
            {isEstop ? (
              <button
                onClick={handleResetEstop}
                className="h-16 rounded-xl bg-red-950 border-2 border-red-500 text-red-200 font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-lg cursor-pointer transition-all animate-pulse"
              >
                <RotateCw className="w-4 h-4 text-red-300 animate-spin" />
                <span>Twist to Reset</span>
              </button>
            ) : (
              <button
                onClick={handleEstop}
                className="h-16 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 border border-red-400 text-white font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-lg shadow-red-950/50 cursor-pointer transition-all"
              >
                <ShieldAlert className="w-5 h-5 text-white" />
                <span>E-Stop (Palm)</span>
              </button>
            )}

            {/* BLUE FAULT RESET BUTTON */}
            <button
              onClick={handleResetFault}
              className="h-16 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 border border-blue-500/50 text-blue-200 font-semibold text-xs flex flex-col items-center justify-center gap-1 shadow cursor-pointer transition-all"
            >
              <RotateCcw className="w-4 h-4 text-blue-400" />
              <span>Fault Reset</span>
            </button>
          </div>
        </div>

        {/* SECTION 2: SPEED & INFEED SLIDERS (Cols 5-8) */}
        <div className="lg:col-span-4 bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-300">Operation Mode:</span>
              <button
                onClick={handleToggleMode}
                className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                  operationMode === 'AUTO'
                    ? 'bg-blue-600/20 text-blue-300 border-blue-500/50'
                    : 'bg-amber-600/20 text-amber-300 border-amber-500/50'
                }`}
              >
                {operationMode === 'AUTO' ? 'Automatic Mode' : 'Manual Mode'}
              </button>
            </div>

            {/* Conveyor Speed Slider */}
            <div className="space-y-1 mb-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Conveyor belt speed:</span>
                <span className="text-white font-semibold font-tag">{settings.nominalSpeedMs.toFixed(1)} m/s</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="2.0"
                step="0.1"
                value={settings.nominalSpeedMs}
                onChange={e => handleSpeedChange(parseFloat(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-tag">
                <span>0.2 m/s</span>
                <span>1.0 m/s nominal</span>
                <span>2.0 m/s</span>
              </div>
            </div>

            {/* Infeed Interval Slider */}
            <div className="space-y-1 mb-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Bottle feed interval:</span>
                <span className="text-white font-semibold font-tag">{settings.bottleSpawnIntervalSec.toFixed(1)}s</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="3.5"
                step="0.1"
                value={settings.bottleSpawnIntervalSec}
                onChange={e => handleIntervalChange(parseFloat(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-tag">
                <span>0.8s fast</span>
                <span>1.8s nominal</span>
                <span>3.5s slow</span>
              </div>
            </div>
          </div>

          {/* Quick Manual Actions */}
          <div className="pt-2 border-t border-slate-800/80 flex gap-2">
            <button
              onClick={() => handleSpawnBottle('CATEGORY_A')}
              className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>Feed Cat A</span>
            </button>
            <button
              onClick={() => handleSpawnBottle('CATEGORY_B')}
              className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>Feed Cat B</span>
            </button>
            <button
              onClick={handleTriggerDiverter}
              className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-medium rounded-lg border border-slate-700 transition-colors cursor-pointer"
              title="Test diverter pneumatic stroke"
            >
              Test Diverter
            </button>
          </div>
        </div>

        {/* SECTION 3: FAULT INJECTION TESTING (Cols 9-12) */}
        <div className="lg:col-span-4 bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-300">Fault Injection Scenarios:</span>
              <HelpTooltip 
                term="Fault Injection" 
                explanation="Allows examiners to test protective interlocks by simulating real conveyor jams, motor thermal overloads, and sensor failures." 
              />
            </div>

            <div className="space-y-2">
              {/* Fault 1: Conveyor Jam */}
              <button
                onClick={() => dispatch({ type: 'INJECT_FAULT', fault: 'jam', value: !activeFaults.jam })}
                className={`w-full p-2.5 rounded-lg border text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                  activeFaults.jam
                    ? 'bg-red-950/80 border-red-500 text-red-200 font-semibold'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`w-4 h-4 ${activeFaults.jam ? 'text-red-400' : 'text-slate-400'}`} />
                  <span>Conveyor Jam (ALM-101)</span>
                </div>
                <span className={`text-[11px] font-tag ${activeFaults.jam ? 'text-red-300 font-bold' : 'text-slate-500'}`}>
                  {activeFaults.jam ? 'ACTIVE' : 'OFF'}
                </span>
              </button>

              {/* Fault 2: Motor Overload */}
              <button
                onClick={() => dispatch({ type: 'INJECT_FAULT', fault: 'motorOverload', value: !activeFaults.motorOverload })}
                className={`w-full p-2.5 rounded-lg border text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                  activeFaults.motorOverload
                    ? 'bg-red-950/80 border-red-500 text-red-200 font-semibold'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Flame className={`w-4 h-4 ${activeFaults.motorOverload ? 'text-red-400' : 'text-slate-400'}`} />
                  <span>Motor Overload (ALM-102)</span>
                </div>
                <span className={`text-[11px] font-tag ${activeFaults.motorOverload ? 'text-red-300 font-bold' : 'text-slate-500'}`}>
                  {activeFaults.motorOverload ? 'ACTIVE' : 'OFF'}
                </span>
              </button>

              {/* Fault 3: Optical Sensor Malfunction */}
              <button
                onClick={() => dispatch({ type: 'INJECT_FAULT', fault: 'sensorMalfunction', value: !activeFaults.sensorMalfunction })}
                className={`w-full p-2.5 rounded-lg border text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                  activeFaults.sensorMalfunction
                    ? 'bg-amber-950/80 border-amber-500 text-amber-200 font-semibold'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Radio className={`w-4 h-4 ${activeFaults.sensorMalfunction ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>Sensor Malfunction (ALM-201)</span>
                </div>
                <span className={`text-[11px] font-tag ${activeFaults.sensorMalfunction ? 'text-amber-300 font-bold' : 'text-slate-500'}`}>
                  {activeFaults.sensorMalfunction ? 'ACTIVE' : 'OFF'}
                </span>
              </button>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-400 text-center">
            Max 1 fault condition trips protective interlock safely.
          </div>
        </div>

      </div>
    </div>
  );
};
