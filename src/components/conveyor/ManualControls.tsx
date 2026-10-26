// ============================================================================
// Operator HMI Console & Manual Controls
// Physical pushbuttons, speed sliders, mode toggle, and fault injection
// ============================================================================

import React, { useState } from 'react';
import { 
  Play, 
  Square, 
  RotateCcw, 
  Sliders, 
  Zap, 
  ShieldAlert, 
  Sparkles, 
  HandMetal, 
  AlertTriangle,
  Flame,
  Radio,
  RotateCw
} from 'lucide-react';
import { useScada } from '../../context/ScadaContext';
import { ConfirmDialog } from '../common/ConfirmDialog';

export const ManualControls: React.FC = () => {
  const { state, dispatch } = useScada();
  const { machineState, operationMode, activeFaults, settings, motor } = state;

  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

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

  const handleRatioChange = (val: number) => {
    dispatch({ type: 'UPDATE_SETTINGS', settings: { categoryARatioPercent: val } });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl select-none">
      
      {/* Title */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
            Operator Console & supervisory Controls
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
          <span>STATION:</span>
          <span className="text-slate-200 font-bold bg-slate-800 px-2 py-0.5 rounded">CONV-CTRL-01</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* SECTION 1: PRIMARY INDUSTRIAL BUTTONS (Cols 1-4) */}
        <div className="lg:col-span-5 bg-slate-950 p-3.5 rounded-lg border border-slate-800 flex flex-col justify-between">
          <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Primary Safety Drives</span>
            <span className="text-[9px] text-slate-500">24V DC RELAY COILS</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* GREEN START BUTTON */}
            <button
              onClick={handleStart}
              disabled={isRunning || isEstop || isFault}
              className={`h-20 rounded-lg flex flex-col items-center justify-center gap-1 font-mono font-bold text-xs transition-all shadow-lg select-none ${
                isRunning
                  ? 'bg-emerald-950/40 border-2 border-emerald-500/30 text-emerald-500 opacity-60 cursor-not-allowed'
                  : isEstop || isFault
                  ? 'bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 active:scale-95 border-2 border-emerald-400 text-white shadow-emerald-600/30 led-glow-green cursor-pointer'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-emerald-700/80 border border-emerald-400 flex items-center justify-center">
                <Play className="w-4 h-4 text-white fill-white ml-0.5" />
              </div>
              <span>START (I)</span>
            </button>

            {/* YELLOW NORMAL STOP BUTTON */}
            <button
              onClick={handleStop}
              disabled={!isRunning}
              className={`h-20 rounded-lg flex flex-col items-center justify-center gap-1 font-mono font-bold text-xs transition-all shadow-lg select-none ${
                !isRunning
                  ? 'bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed opacity-60'
                  : 'bg-amber-600 hover:bg-amber-500 active:scale-95 border-2 border-amber-400 text-white shadow-amber-600/30 led-glow-amber cursor-pointer'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-amber-700/80 border border-amber-400 flex items-center justify-center">
                <Square className="w-4 h-4 text-white fill-white" />
              </div>
              <span>NORMAL STOP (O)</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* BIG RED MUSHROOM EMERGENCY STOP */}
            {isEstop ? (
              <button
                onClick={handleResetEstop}
                className="h-20 rounded-lg bg-red-950 border-2 border-red-500 text-red-200 font-mono font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-lg cursor-pointer alarm-flash"
              >
                <RotateCw className="w-5 h-5 text-red-400 animate-spin" />
                <span>TWIST TO RELEASE</span>
                <span className="text-[8px] text-red-300 font-normal">E-STOP LATCHED</span>
              </button>
            ) : (
              <button
                onClick={handleEstop}
                className="h-20 rounded-lg bg-red-600 hover:bg-red-500 active:scale-95 border-4 border-yellow-400 text-white font-mono font-extrabold text-xs flex flex-col items-center justify-center gap-1 shadow-xl shadow-red-700/40 led-glow-red cursor-pointer"
              >
                <ShieldAlert className="w-6 h-6 text-white" />
                <span>E-STOP (PALM)</span>
                <span className="text-[8px] text-yellow-200">SAFETY HARD TRIP</span>
              </button>
            )}

            {/* BLUE FAULT RESET BUTTON */}
            <button
              onClick={handleResetFault}
              className="h-20 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 border-2 border-blue-500/60 text-blue-200 font-mono font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-md cursor-pointer transition-all"
            >
              <RotateCcw className="w-5 h-5 text-blue-400" />
              <span>FAULT RESET</span>
              <span className="text-[8px] text-slate-400 font-normal">CLEAR RELAYS</span>
            </button>
          </div>
        </div>

        {/* SECTION 2: MODE & PROCESS SLIDERS (Cols 5-8) */}
        <div className="lg:col-span-4 bg-slate-950 p-3.5 rounded-lg border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase">Operation Mode:</span>
              <button
                onClick={handleToggleMode}
                className={`px-3 py-1 text-xs font-mono font-black rounded border transition-all cursor-pointer ${
                  operationMode === 'AUTO'
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/30'
                    : 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/30'
                }`}
              >
                {operationMode} MODE
              </button>
            </div>

            {/* Conveyor Speed Slider */}
            <div className="space-y-1 mb-2.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Target Speed Setpoint:</span>
                <span className="text-cyan-300 font-bold">{settings.nominalSpeedMs.toFixed(1)} m/s</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="2.0"
                step="0.1"
                value={settings.nominalSpeedMs}
                onChange={e => handleSpeedChange(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded"
              />
              <div className="flex justify-between text-[9px] font-mono text-slate-500">
                <span>0.2 m/s (Creep)</span>
                <span>1.0 m/s (Nominal)</span>
                <span>2.0 m/s (Max)</span>
              </div>
            </div>

            {/* Infeed Interval Slider */}
            <div className="space-y-1 mb-2.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Infeed Cadence:</span>
                <span className="text-purple-300 font-bold">{settings.bottleSpawnIntervalSec.toFixed(1)}s / bottle</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="3.5"
                step="0.1"
                value={settings.bottleSpawnIntervalSec}
                onChange={e => handleIntervalChange(parseFloat(e.target.value))}
                className="w-full accent-purple-400 cursor-pointer h-1.5 bg-slate-800 rounded"
              />
            </div>

            {/* A/B Category Distribution Ratio */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Category A/B Ratio:</span>
                <span className="text-emerald-400 font-bold">{settings.categoryARatioPercent}% Cat A / {100 - settings.categoryARatioPercent}% Cat B</span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                step="5"
                value={settings.categoryARatioPercent}
                onChange={e => handleRatioChange(parseInt(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-slate-800 rounded"
              />
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800 flex justify-between text-[10px] font-mono text-slate-400">
            <span>Stop Mode: <strong className="text-slate-200">{settings.stopMode}</strong></span>
            <span>VFD Freq: <strong className="text-cyan-300">{motor.frequencyHz} Hz</strong></span>
          </div>
        </div>

        {/* SECTION 3: MANUAL ACTIONS & FAULT INJECTION (Cols 9-12) */}
        <div className="lg:col-span-3 bg-slate-950 p-3.5 rounded-lg border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
              Manual Interventions & Testing
            </div>

            {/* Manual Actuator Triggers */}
            <div className="space-y-2 mb-3">
              <button
                onClick={() => dispatch({ type: 'SPAWN_MANUAL_BOTTLE' })}
                className="w-full py-1.5 px-3 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 font-mono text-xs font-bold rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                + Feed Single Bottle
              </button>

              <button
                onClick={() => dispatch({ type: 'MANUAL_TRIGGER_DIVERTER' })}
                disabled={operationMode === 'AUTO'}
                className={`w-full py-1.5 px-3 font-mono text-xs font-bold rounded flex items-center justify-center gap-1.5 transition-colors ${
                  operationMode === 'MANUAL'
                    ? 'bg-amber-950/90 hover:bg-amber-900 border border-amber-600 text-amber-200 cursor-pointer'
                    : 'bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed'
                }`}
                title={operationMode === 'AUTO' ? 'Switch to MANUAL mode to actuate diverter manually' : ''}
              >
                <HandMetal className="w-3.5 h-3.5 text-amber-400" />
                Actuate Diverter Arm
              </button>
            </div>

            {/* Fault Simulation Buttons */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Inject Safety Fault:</span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => dispatch({ type: 'INJECT_FAULT', fault: 'jam', value: !activeFaults.jam })}
                  className={`py-1 px-2 rounded font-mono text-[10px] font-bold border transition-colors cursor-pointer ${
                    activeFaults.jam
                      ? 'bg-red-950 border-red-500 text-red-200 alarm-flash'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {activeFaults.jam ? 'Clear Jam' : 'Inject Jam'}
                </button>

                <button
                  onClick={() => dispatch({ type: 'INJECT_FAULT', fault: 'motorOverload', value: !activeFaults.motorOverload })}
                  className={`py-1 px-2 rounded font-mono text-[10px] font-bold border transition-colors cursor-pointer ${
                    activeFaults.motorOverload
                      ? 'bg-red-950 border-red-500 text-red-200 alarm-flash'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {activeFaults.motorOverload ? 'Clear Overload' : 'Trip Overload'}
                </button>
              </div>
            </div>
          </div>

          {/* Reset Counters */}
          <div className="mt-3 pt-2 border-t border-slate-800">
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full py-1 text-[10px] font-mono text-slate-500 hover:text-red-400 transition-colors cursor-pointer text-center"
            >
              Reset Shift Counters...
            </button>
          </div>
        </div>

      </div>

      {/* Confirmation Dialog for Reset Counters */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        title="Reset Shift Production Counters"
        message="This action will clear all Category A, Category B, and total infeed counters back to 0. Are you sure you wish to proceed?"
        confirmLabel="Reset Counters"
        isDestructive={true}
        onConfirm={() => {
          dispatch({ type: 'RESET_COUNTERS' });
          setShowResetConfirm(false);
        }}
        onCancel={() => setShowResetConfirm(false)}
      />

    </div>
  );
};
