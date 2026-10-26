// ============================================================================
// Top SCADA Status Bar (Light Industrial HMI Theme)
// Responsive: Compact on phone (<md) with popout menu; full controls on md+
// Turns red when machine is in FAULT or EMERGENCY_STOP
// Accent: graphite #3B4651
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
  AlertTriangle,
  Menu,
  X
} from 'lucide-react';
import { useScada } from '../../context/ScadaContext';

export const TopStatusBar: React.FC = () => {
  const { state, dispatch } = useScada();
  const [clockStr, setClockStr] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState<boolean>(false);
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);

  const isFaulted = state.machineState === 'FAULT' || state.machineState === 'EMERGENCY_STOP';
  const hasUnackAlarms = state.alarms.some(a => a.state === 'ACTIVE_UNACK');
  const isAlarmState = isFaulted || hasUnackAlarms;

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setClockStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
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
      message: `Simulation speed set to ${mult}x.`,
      toastType: 'info',
    });
  };

  const getStatePill = () => {
    switch (state.machineState) {
      case 'RUNNING':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#E8F5E9] border border-[#A5D6A7] text-[#2E7D32] text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#2E7D32]"></span>
            <span>Running</span>
          </div>
        );
      case 'STARTING':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FFF8E1] border border-[#FFE082] text-[#D98200] text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#D98200]"></span>
            <span>Starting</span>
          </div>
        );
      case 'STOPPING':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FFF8E1] border border-[#FFE082] text-[#D98200] text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#D98200]"></span>
            <span>Stopping</span>
          </div>
        );
      case 'FAULT':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FFEBEE] border border-[#EF9A9A] text-[#C62828] text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-[#C62828]"></span>
            <span>Fault</span>
          </div>
        );
      case 'EMERGENCY_STOP':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#C62828] border border-[#B71C1C] text-white text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-white"></span>
            <span>E-Stop</span>
          </div>
        );
      case 'IDLE':
      default:
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F0F2F5] border border-[#CBD2D9] text-[#6B7785] text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#6B7785]"></span>
            <span>Idle</span>
          </div>
        );
    }
  };

  return (
    <>
      <header 
        className={`px-3 md:px-5 py-2 select-none border-b transition-colors duration-150 ${
          isAlarmState 
            ? 'bg-[#C62828] border-[#B71C1C] text-white shadow-xs' 
            : 'bg-white border-[#CBD2D9] text-[#1F2933]'
        }`}
      >
        <div className="flex items-center justify-between gap-2 md:gap-4">
          
          {/* Left: Brand & Machine Status Pill */}
          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded flex items-center justify-center ${
                isAlarmState ? 'bg-white text-[#C62828]' : 'bg-[#3B4651] text-white'
              }`}>
                <Cpu className="w-4 h-4" />
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs md:text-sm font-bold tracking-tight">
                    Conveyor SCADA
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                    isAlarmState ? 'bg-white/20 text-white' : 'bg-[#E2E6EA] text-[#52606D]'
                  }`}>
                    Line 4
                  </span>
                </div>
                <p className={`hidden sm:block text-[11px] ${
                  isAlarmState ? 'text-white/80' : 'text-[#52606D]'
                }`}>
                  Automated bottle sorting
                </p>
              </div>
            </div>

            <div className="ml-1">
              {getStatePill()}
            </div>
          </div>

          {/* Center (Desktop only): Active Alarm or PLC nominal health banner */}
          <div className="hidden lg:flex items-center gap-2">
            {hasUnackAlarms ? (
              <div className="px-3 py-1 rounded bg-[#FFEBEE] border border-[#EF9A9A] text-[#C62828] text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#C62828]" />
                <span>Active Alarm: [{state.alarms[0]?.code}] {state.alarms[0]?.title}</span>
              </div>
            ) : (
              <div className="px-2.5 py-0.5 rounded bg-[#F5F6F8] border border-[#D5DBE1] text-[#52606D] text-xs flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D32]" />
                <span>PLC status OK • Telemetry nominal</span>
              </div>
            )}
          </div>

          {/* Right on Desktop (md+): Speed controls, clock, operator, buttons */}
          <div className="hidden md:flex items-center gap-2 text-xs font-tag">
            
            {/* Speed Multiplier */}
            <div className={`flex items-center rounded border p-0.5 ${
              isAlarmState ? 'bg-white/10 border-white/20' : 'bg-[#F5F6F8] border-[#D5DBE1]'
            }`}>
              <span className="text-[10px] px-1 text-[#52606D]">
                <FastForward className="w-3 h-3 text-[#3B4651]" />
              </span>
              {([1, 2, 5] as const).map(mult => (
                <button
                  key={mult}
                  onClick={() => handleSetSpeedMultiplier(mult)}
                  className={`px-1.5 py-0.5 text-[10px] rounded font-bold transition-colors cursor-pointer ${
                    state.settings.simulationMultiplier === mult
                      ? 'bg-[#3B4651] text-white'
                      : isAlarmState ? 'text-white/80 hover:text-white' : 'text-[#52606D] hover:text-[#1F2933]'
                  }`}
                >
                  {mult}x
                </button>
              ))}
            </div>

            {/* Live Clock */}
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded border text-[11px] ${
              isAlarmState ? 'bg-white/10 border-white/20 text-white' : 'bg-[#F5F6F8] border-[#D5DBE1] text-[#52606D]'
            }`}>
              <Clock className="w-3.5 h-3.5 text-[#52606D]" />
              <span>{clockStr}</span>
            </div>

            {/* Operator Badge */}
            <div className={`hidden lg:flex items-center gap-1.5 px-2 py-1 rounded border text-[11px] ${
              isAlarmState ? 'bg-white/10 border-white/20 text-white' : 'bg-[#F5F6F8] border-[#D5DBE1] text-[#1F2933]'
            }`}>
              <User className="w-3.5 h-3.5 text-[#3B4651]" />
              <span className="truncate max-w-[140px]">{state.settings.operatorName}</span>
            </div>

            {/* Keyboard Shortcuts Hint */}
            <button
              onClick={() => setShowShortcutsModal(true)}
              title="Keyboard Shortcuts"
              className={`p-1.5 rounded border transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center ${
                isAlarmState 
                  ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' 
                  : 'bg-[#F5F6F8] border-[#D5DBE1] text-[#52606D] hover:text-[#1F2933]'
              }`}
            >
              <Keyboard className="w-4 h-4" />
            </button>

            {/* Audio Toggle */}
            <button
              onClick={toggleMute}
              title={state.settings.audioMuted ? 'Unmute Audio' : 'Mute Audio'}
              className={`p-1.5 rounded border transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center ${
                isAlarmState 
                  ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' 
                  : state.settings.audioMuted
                  ? 'bg-[#F5F6F8] border-[#D5DBE1] text-[#9AA5B1]'
                  : 'bg-[#ECEFF2] border-[#3B4651]/50 text-[#3B4651]'
              }`}
            >
              {state.settings.audioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              title="Toggle Fullscreen"
              className={`p-1.5 rounded border transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center ${
                isAlarmState 
                  ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' 
                  : 'bg-[#F5F6F8] border-[#D5DBE1] text-[#52606D] hover:text-[#1F2933]'
              }`}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>

          {/* Right on Phone (<md): Clock + Menu Button */}
          <div className="flex md:hidden items-center gap-1.5">
            <span className={`text-xs font-tag px-1.5 py-0.5 rounded ${
              isAlarmState ? 'text-white' : 'text-[#52606D]'
            }`}>
              {clockStr}
            </span>

            <button
              onClick={() => setShowMobileMenu(true)}
              aria-label="Open Controls Menu"
              className={`p-2 rounded border transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center ${
                isAlarmState 
                  ? 'bg-white/20 border-white/30 text-white' 
                  : 'bg-[#F5F6F8] border-[#D5DBE1] text-[#1F2933]'
              }`}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

        </div>
      </header>

      {/* Phone Collapsible Settings Menu Bottom Sheet */}
      {showMobileMenu && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/40">
          <div 
            className="fixed inset-0"
            onClick={() => setShowMobileMenu(false)}
          />
          <div className="relative bg-white rounded-t-xl border-t border-[#CBD2D9] shadow-lg p-4 space-y-4 z-10 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">
            <div className="flex items-center justify-between pb-2 border-b border-[#D5DBE1]">
              <span className="text-sm font-bold text-[#1F2933]">System Controls & Quick Settings</span>
              <button 
                onClick={() => setShowMobileMenu(false)}
                className="p-1 rounded text-[#52606D] hover:text-[#1F2933] min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Speed Multiplier */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#52606D]">Simulation Speed Multiplier:</label>
              <div className="grid grid-cols-3 gap-2">
                {([1, 2, 5] as const).map(mult => (
                  <button
                    key={mult}
                    onClick={() => {
                      handleSetSpeedMultiplier(mult);
                      setShowMobileMenu(false);
                    }}
                    className={`py-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer min-h-[44px] ${
                      state.settings.simulationMultiplier === mult
                        ? 'bg-[#3B4651] text-white border-[#3B4651]'
                        : 'bg-[#F5F6F8] border-[#D5DBE1] text-[#1F2933]'
                    }`}
                  >
                    {mult}x Normal Speed
                  </button>
                ))}
              </div>
            </div>

            {/* Audio and Fullscreen controls */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  toggleMute();
                }}
                className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 cursor-pointer min-h-[44px] ${
                  state.settings.audioMuted 
                    ? 'bg-[#F5F6F8] border-[#D5DBE1] text-[#9AA5B1]' 
                    : 'bg-[#ECEFF2] border-[#3B4651]/50 text-[#3B4651]'
                }`}
              >
                {state.settings.audioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>{state.settings.audioMuted ? 'Unmute Audio' : 'Audio On'}</span>
              </button>

              <button
                onClick={() => {
                  toggleFullscreen();
                  setShowMobileMenu(false);
                }}
                className="p-2.5 rounded-lg border border-[#D5DBE1] bg-[#F5F6F8] text-[#1F2933] text-xs font-medium flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
              </button>
            </div>

            {/* Operator info */}
            <div className="p-2.5 bg-[#F5F6F8] border border-[#D5DBE1] rounded-lg text-xs text-[#52606D] flex items-center gap-2">
              <User className="w-4 h-4 text-[#3B4651]" />
              <div>
                <span className="font-semibold text-[#1F2933]">{state.settings.operatorName}</span>
                <span className="block text-[11px] text-[#52606D]">{state.settings.shiftName}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Dialog (Desktop / Modal) */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white border border-[#CBD2D9] rounded-lg max-w-md w-full p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#D5DBE1]">
              <h3 className="text-sm font-bold text-[#1F2933] flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-[#3B4651]" />
                Operator Keyboard Shortcuts
              </h3>
              <button 
                onClick={() => setShowShortcutsModal(false)}
                className="text-[#52606D] hover:text-[#1F2933] text-xs cursor-pointer p-1"
              >
                Close [Esc]
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2 bg-[#F5F6F8] rounded border border-[#D5DBE1]">
                <span className="text-[#52606D]">Toggle Start / Stop Conveyor</span>
                <kbd className="px-2 py-0.5 bg-white text-[#1F2933] font-bold rounded border border-[#CBD2D9] font-tag">SPACE</kbd>
              </div>
              <div className="flex justify-between items-center p-2 bg-[#F5F6F8] rounded border border-[#D5DBE1]">
                <span className="text-[#52606D]">Emergency Stop (E-Stop)</span>
                <kbd className="px-2 py-0.5 bg-[#FFEBEE] text-[#C62828] font-bold rounded border border-[#EF9A9A] font-tag">E</kbd>
              </div>
              <div className="flex justify-between items-center p-2 bg-[#F5F6F8] rounded border border-[#D5DBE1]">
                <span className="text-[#52606D]">Acknowledge All Alarms</span>
                <kbd className="px-2 py-0.5 bg-[#FFF8E1] text-[#D98200] font-bold rounded border border-[#FFE082] font-tag">A</kbd>
              </div>
              <div className="flex justify-between items-center p-2 bg-[#F5F6F8] rounded border border-[#D5DBE1]">
                <span className="text-[#52606D]">Toggle Fullscreen Display</span>
                <kbd className="px-2 py-0.5 bg-white text-[#1F2933] font-bold rounded border border-[#CBD2D9] font-tag">F</kbd>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
