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
          <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Running
          </div>
        );
      case 'STARTING':
        return (
          <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-amber-950/70 border border-amber-500/50 text-amber-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            Starting up
          </div>
        );
      case 'STOPPING':
        return (
          <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-amber-950/70 border border-amber-500/50 text-amber-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            Stopping
          </div>
        );
      case 'FAULT':
        return (
          <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-red-950/80 border border-red-500 text-red-200 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            Fault trip
          </div>
        );
      case 'EMERGENCY_STOP':
        return (
          <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-red-950 border border-red-500 text-red-100 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-red-400"></span>
            Emergency stop
          </div>
        );
      case 'IDLE':
      default:
        return (
          <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            Idle
          </div>
        );
    }
  };

  return (
    <header className="bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 select-none shadow-sm backdrop-blur-xs">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Brand & Machine Status Pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
              <Cpu className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight text-white">
                  Conveyor SCADA
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-medium">
                  Line 4
                </span>
                <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-800/50 px-1.5 py-0.5 rounded font-medium">
                  Simulated
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Automated bottle sorting and monitoring
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
