// ============================================================================
// Top SCADA Status Bar
// Control room header with system state, clock, telemetry rates, and quick controls
// ============================================================================

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  FastForward, 
  Cpu, 
  User, 
  Keyboard, 
  ShieldCheck, 
  AlertTriangle 
} from 'lucide-react';
import { useScada } from '../../context/ScadaContext';
import { industrialAudio } from '../../utils/audio';

export const TopStatusBar: React.FC = () => {
  const { state, dispatch } = useScada();
  const [clockStr, setClockStr] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState<boolean>(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setClockStr(now.toLocaleTimeString() + ' | ' + now.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }));
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleMute = () => {
    const nextMuted = !state.settings.audioMuted;
    dispatch({ type: 'UPDATE_SETTINGS', settings: { audioMuted: nextMuted } });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleSetSpeedMultiplier = (mult: 1 | 2 | 5) => {
    dispatch({ type: 'UPDATE_SETTINGS', settings: { simulationMultiplier: mult } });
    dispatch({
      type: 'SHOW_TOAST',
      message: `Simulation clock fast-forward set to ${mult}x.`,
      toastType: 'info',
    });
  };

  const getStatePill = () => {
    switch (state.machineState) {
      case 'RUNNING':
        return (
          <div className="flex items-center gap-2 px-3 py-1 rounded bg-emerald-950/80 border border-emerald-500/80 text-emerald-300 font-mono text-xs font-bold tracking-wider led-glow-green">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            RUNNING
          </div>
        );
      case 'STARTING':
        return (
          <div className="flex items-center gap-2 px-3 py-1 rounded bg-cyan-950/80 border border-cyan-500/80 text-cyan-300 font-mono text-xs font-bold tracking-wider">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
            RAMPING UP (STARTING)
          </div>
        );
      case 'STOPPING':
        return (
          <div className="flex items-center gap-2 px-3 py-1 rounded bg-amber-950/80 border border-amber-500/80 text-amber-300 font-mono text-xs font-bold tracking-wider">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
            DECELERATING (STOPPING)
          </div>
        );
      case 'FAULT':
        return (
          <div className="flex items-center gap-2 px-3 py-1 rounded bg-red-950/90 border border-red-500 text-red-200 font-mono text-xs font-bold tracking-wider alarm-flash led-glow-red">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
            PROTECTIVE FAULT
          </div>
        );
      case 'EMERGENCY_STOP':
        return (
          <div className="flex items-center gap-2 px-3 py-1 rounded bg-rose-950 border-2 border-rose-500 text-rose-100 font-mono text-xs font-black tracking-wider alarm-flash led-glow-red">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            EMERGENCY STOPPED
          </div>
        );
      case 'IDLE':
      default:
        return (
          <div className="flex items-center gap-2 px-3 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-slate-500"></span>
            STANDBY (IDLE)
          </div>
        );
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 px-4 py-2 select-none shadow-md">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Brand & Machine Status Pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center shadow-md border border-cyan-400/50">
              <Cpu className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black tracking-widest text-white uppercase font-mono">
                  SPECTRA-FLOW SCADA
                </span>
                <span className="text-[9px] bg-cyan-950 text-cyan-400 border border-cyan-800 px-1 py-0.2 rounded font-mono font-bold">
                  HMI v5.2
                </span>
                <span className="text-[9px] bg-amber-950/80 text-amber-300 border border-amber-700/80 px-1.5 py-0.2 rounded font-mono font-bold">
                  SIMULATED
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                Line #4 Bottling & Packaging Control Suite
              </p>
            </div>
          </div>

          <div className="ml-2">
            {getStatePill()}
          </div>
        </div>

        {/* Center: Live Alarm Quick Banner if active */}
        <div className="hidden lg:flex items-center gap-2">
          {state.alarms.some(a => a.state === 'ACTIVE_UNACK') ? (
            <div className="px-3 py-1 rounded bg-red-950/80 border border-red-500 text-red-200 text-xs font-mono flex items-center gap-2 alarm-flash">
              <AlertTriangle className="w-4 h-4 text-red-400 animate-bounce" />
              <span>ACTIVE UNACK ALARM: [{state.alarms[0].code}] {state.alarms[0].title}</span>
            </div>
          ) : (
            <div className="px-3 py-1 rounded bg-slate-950 border border-slate-800 text-slate-400 text-xs font-mono flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>PLC Health OK • Closed-Loop Telemetry Nominal</span>
            </div>
          )}
        </div>

        {/* Right: Controls, Fast Forward, Clock, Operator */}
        <div className="flex items-center gap-2.5 text-xs font-mono">
          
          {/* Fast-Forward Simulation Multiplier */}
          <div className="hidden sm:flex items-center bg-slate-950 rounded border border-slate-800 p-0.5">
            <span className="text-[10px] text-slate-500 px-1.5 flex items-center gap-0.5">
              <FastForward className="w-3 h-3 text-cyan-400" />
            </span>
            {([1, 2, 5] as const).map(mult => (
              <button
                key={mult}
                onClick={() => handleSetSpeedMultiplier(mult)}
                className={`px-1.5 py-0.5 text-[10px] rounded font-bold transition-colors ${
                  state.settings.simulationMultiplier === mult
                    ? 'bg-cyan-500 text-slate-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {mult}x
              </button>
            ))}
          </div>

          {/* Clock */}
          <div className="hidden xl:flex items-center gap-1.5 text-slate-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800 text-[11px]">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{clockStr}</span>
          </div>

          {/* Operator Badge */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded border border-slate-800 text-slate-300 text-[11px]">
            <User className="w-3.5 h-3.5 text-cyan-400" />
            <span>{state.settings.operatorName}</span>
          </div>

          {/* Keyboard Shortcuts Hint */}
          <button
            onClick={() => setShowShortcutsModal(true)}
            title="View Keyboard Hotkeys"
            className="p-1.5 rounded bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors"
          >
            <Keyboard className="w-4 h-4 text-cyan-400" />
          </button>

          {/* Audio Mute Toggle */}
          <button
            onClick={toggleMute}
            title={state.settings.audioMuted ? 'Unmute Audio' : 'Mute Audio'}
            className={`p-1.5 rounded border transition-all ${
              state.settings.audioMuted
                ? 'bg-slate-800 border-slate-700 text-slate-400'
                : 'bg-cyan-950 border-cyan-500/50 text-cyan-400'
            }`}
          >
            {state.settings.audioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            title="Toggle Fullscreen Mode"
            className="p-1.5 rounded bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-colors"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

        </div>
      </div>

      {/* Keyboard Shortcuts Dialog */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border-2 border-slate-700 rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-cyan-400" />
                OPERATOR KEYBOARD SHORTCUTS
              </h3>
              <button onClick={() => setShowShortcutsModal(false)} className="text-slate-400 hover:text-white text-xs">
                Close [Esc]
              </button>
            </div>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between p-2 bg-slate-950 rounded border border-slate-800">
                <span className="text-slate-400">Toggle Start / Stop Conveyor</span>
                <kbd className="px-2 py-0.5 bg-slate-800 text-cyan-300 font-bold rounded border border-slate-700">SPACE</kbd>
              </div>
              <div className="flex justify-between p-2 bg-slate-950 rounded border border-slate-800">
                <span className="text-slate-400">Emergency Stop (Trip Hard)</span>
                <kbd className="px-2 py-0.5 bg-red-900 text-red-200 font-bold rounded border border-red-700">E</kbd>
              </div>
              <div className="flex justify-between p-2 bg-slate-950 rounded border border-slate-800">
                <span className="text-slate-400">Acknowledge All Alarms</span>
                <kbd className="px-2 py-0.5 bg-slate-800 text-amber-300 font-bold rounded border border-slate-700">A</kbd>
              </div>
              <div className="flex justify-between p-2 bg-slate-950 rounded border border-slate-800">
                <span className="text-slate-400">Toggle Fullscreen Display</span>
                <kbd className="px-2 py-0.5 bg-slate-800 text-slate-200 font-bold rounded border border-slate-700">F</kbd>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
