// ============================================================================
// Operator Controls & Simulation Panel (Light Industrial HMI Theme)
// Real industrial HMI styling: White card, #F5F6F8 sub-panels, dark text,
// graphite accents, flat safety buttons, no glows or gradients.
// ============================================================================

import React from 'react';
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
  const { machineState, operationMode, activeFaults, settings } = state;

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
    <div className="bg-white border border-[#D5DBE1] rounded-lg p-3 sm:p-5 shadow-xs select-none">
      
      {/* Title */}
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[#D5DBE1]">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#3B4651]" />
          <h3 className="text-sm font-bold text-[#1F2933]">
            Operator Console &amp; Process Adjustments
          </h3>
          <HelpTooltip 
            term="Operator Console" 
            explanation="Allows direct supervisory control over conveyor drive, operation mode, target speed, and fault injection." 
          />
        </div>
        <div className="text-xs text-[#52606D]">
          Station: <strong className="text-[#1F2933] font-tag">CONV-CTRL-01</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
        
        {/* SECTION 1: PRIMARY SAFETY PUSHBUTTONS (Cols 1-4) */}
        <div className="lg:col-span-4 bg-[#F5F6F8] p-3 sm:p-4 rounded-lg border border-[#D5DBE1] flex flex-col justify-between">
          <div className="text-xs font-bold text-[#1F2933] mb-2.5 flex items-center justify-between">
            <span>Primary Safety Drives</span>
            <span className="text-[10px] text-[#52606D] font-tag">24V DC Relays</span>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-2">
            {/* GREEN START BUTTON */}
            <button
              onClick={handleStart}
              disabled={isRunning || isEstop || isFault}
              className={`h-14 sm:h-16 rounded-lg flex flex-col items-center justify-center gap-1 font-bold text-xs transition-colors select-none min-h-[48px] ${
                isRunning || isEstop || isFault
                  ? 'bg-[#E2E6EA] text-[#9AA5B1] border border-[#CBD2D9] cursor-not-allowed opacity-60'
                  : 'bg-[#2E7D32] hover:bg-[#256628] text-white cursor-pointer active:bg-[#1B5E20]'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start</span>
            </button>

            {/* AMBER NORMAL STOP BUTTON */}
            <button
              onClick={handleStop}
              disabled={!isRunning}
              className={`h-14 sm:h-16 rounded-lg flex flex-col items-center justify-center gap-1 font-bold text-xs transition-colors select-none min-h-[48px] ${
                !isRunning
                  ? 'bg-[#E2E6EA] text-[#9AA5B1] border border-[#CBD2D9] cursor-not-allowed opacity-60'
                  : 'bg-[#D98200] hover:bg-[#B86E00] text-white cursor-pointer active:bg-[#965A00]'
              }`}
            >
              <Square className="w-4 h-4 fill-current" />
              <span>Normal Stop</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* BIG RED E-STOP - the only big red element */}
            {isEstop ? (
              <button
                onClick={handleResetEstop}
                className="h-14 sm:h-16 rounded-lg bg-[#C62828] hover:bg-[#B71C1C] text-white font-bold text-xs flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors border-2 border-white min-h-[48px]"
              >
                <RotateCw className="w-4 h-4 text-white" />
                <span className="truncate">Release E-Stop</span>
              </button>
            ) : (
              <button
                onClick={handleEstop}
                className="h-14 sm:h-16 rounded-lg bg-[#C62828] hover:bg-[#B71C1C] text-white font-bold text-xs flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors min-h-[48px]"
              >
                <ShieldAlert className="w-5 h-5 text-white" />
                <span>E-STOP</span>
              </button>
            )}

            {/* OUTLINED GRAPHITE FAULT RESET BUTTON */}
            <button
              onClick={handleResetFault}
              className="h-14 sm:h-16 rounded-lg bg-white hover:bg-[#ECEFF2] border-2 border-[#3B4651] text-[#3B4651] font-bold text-xs flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors min-h-[48px]"
            >
              <RotateCcw className="w-4 h-4 text-[#3B4651]" />
              <span>Fault Reset</span>
            </button>
          </div>
        </div>

        {/* SECTION 2: SPEED & INFEED SLIDERS (Cols 5-8) */}
        <div className="lg:col-span-4 bg-[#F5F6F8] p-3 sm:p-4 rounded-lg border border-[#D5DBE1] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-[#1F2933]">Operation Mode:</span>
              {/* Neutral grey pill with dark text: Auto = graphite filled, Manual = outlined */}
              <button
                onClick={handleToggleMode}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer min-h-[36px] ${
                  operationMode === 'AUTO'
                    ? 'bg-[#3B4651] text-white border border-[#3B4651]'
                    : 'bg-white text-[#1F2933] border border-[#3B4651]'
                }`}
              >
                {operationMode === 'AUTO' ? 'Auto Mode' : 'Manual Mode'}
              </button>
            </div>

            {/* Conveyor Speed Slider */}
            <div className="space-y-1 mb-2.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#52606D]">Conveyor belt speed:</span>
                <span className="text-[#1F2933] font-bold font-tag">{settings.nominalSpeedMs.toFixed(1)} m/s</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="2.0"
                step="0.1"
                value={settings.nominalSpeedMs}
                onChange={e => handleSpeedChange(parseFloat(e.target.value))}
                className="w-full cursor-pointer h-2 bg-[#D5DBE1] rounded min-h-[32px]"
              />
              <div className="flex justify-between text-[10px] text-[#52606D] font-tag">
                <span>0.2 m/s</span>
                <span>1.0 m/s nominal</span>
                <span>2.0 m/s</span>
              </div>
            </div>

            {/* Infeed Interval Slider */}
            <div className="space-y-1 mb-2">
              <div className="flex justify-between text-xs">
                <span className="text-[#52606D]">Bottle feed interval:</span>
                <span className="text-[#1F2933] font-bold font-tag">{settings.bottleSpawnIntervalSec.toFixed(1)}s</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="3.5"
                step="0.1"
                value={settings.bottleSpawnIntervalSec}
                onChange={e => handleIntervalChange(parseFloat(e.target.value))}
                className="w-full cursor-pointer h-2 bg-[#D5DBE1] rounded min-h-[32px]"
              />
              <div className="flex justify-between text-[10px] text-[#52606D] font-tag">
                <span>0.8s fast</span>
                <span>1.8s nominal</span>
                <span>3.5s slow</span>
              </div>
            </div>
          </div>

          {/* Quick Manual Actions */}
          <div className="pt-2 border-t border-[#D5DBE1] flex gap-2">
            <button
              onClick={() => handleSpawnBottle('CATEGORY_A')}
              className="flex-1 py-1.5 bg-white hover:bg-[#F2F5F0] text-[#1F2933] text-xs font-semibold rounded-md border border-[#D5DBE1] transition-colors flex items-center justify-center gap-1 cursor-pointer min-h-[44px]"
            >
              <Plus className="w-3.5 h-3.5 text-[#6B7A5A]" />
              <span>Feed A</span>
            </button>
            <button
              onClick={() => handleSpawnBottle('CATEGORY_B')}
              className="flex-1 py-1.5 bg-white hover:bg-[#FDF6E9] text-[#1F2933] text-xs font-semibold rounded-md border border-[#D5DBE1] transition-colors flex items-center justify-center gap-1 cursor-pointer min-h-[44px]"
            >
              <Plus className="w-3.5 h-3.5 text-[#B7791F]" />
              <span>Feed B</span>
            </button>
            <button
              onClick={handleTriggerDiverter}
              className="py-1.5 px-2.5 bg-white hover:bg-[#ECEFF2] text-[#3B4651] text-xs font-semibold rounded-md border border-[#D5DBE1] transition-colors cursor-pointer min-h-[44px]"
              title="Test diverter pneumatic stroke"
            >
              Test Arm
            </button>
          </div>
        </div>

        {/* SECTION 3: FAULT INJECTION TESTING (Cols 9-12) */}
        <div className="lg:col-span-4 bg-[#F5F6F8] p-3 sm:p-4 rounded-lg border border-[#D5DBE1] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-[#1F2933]">Fault Injection Scenarios:</span>
              <HelpTooltip 
                term="Fault Injection" 
                explanation="Simulates physical field hardware failures to test safety interlocks." 
              />
            </div>

            {/* White/grey rows, OFF/ON shown as small grey/amber badges */}
            <div className="space-y-2">
              {/* Fault 1: Conveyor Jam */}
              <button
                onClick={() => dispatch({ type: 'INJECT_FAULT', fault: 'jam', value: !activeFaults.jam })}
                className="w-full p-2.5 rounded-lg border bg-white border-[#D5DBE1] hover:border-[#9AA5B1] text-xs font-medium flex items-center justify-between transition-colors cursor-pointer min-h-[44px]"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`w-4 h-4 ${activeFaults.jam ? 'text-[#D98200]' : 'text-[#6B7785]'}`} />
                  <span className="text-[#1F2933]">Conveyor Jam (ALM-101)</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded font-tag font-bold ${
                  activeFaults.jam 
                    ? 'bg-[#FFF8E1] text-[#D98200] border border-[#FFE082]' 
                    : 'bg-[#E2E6EA] text-[#6B7785]'
                }`}>
                  {activeFaults.jam ? 'ON' : 'OFF'}
                </span>
              </button>

              {/* Fault 2: Motor Overload */}
              <button
                onClick={() => dispatch({ type: 'INJECT_FAULT', fault: 'motorOverload', value: !activeFaults.motorOverload })}
                className="w-full p-2.5 rounded-lg border bg-white border-[#D5DBE1] hover:border-[#9AA5B1] text-xs font-medium flex items-center justify-between transition-colors cursor-pointer min-h-[44px]"
              >
                <div className="flex items-center gap-2">
                  <Flame className={`w-4 h-4 ${activeFaults.motorOverload ? 'text-[#D98200]' : 'text-[#6B7785]'}`} />
                  <span className="text-[#1F2933]">Motor Overload (ALM-102)</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded font-tag font-bold ${
                  activeFaults.motorOverload 
                    ? 'bg-[#FFF8E1] text-[#D98200] border border-[#FFE082]' 
                    : 'bg-[#E2E6EA] text-[#6B7785]'
                }`}>
                  {activeFaults.motorOverload ? 'ON' : 'OFF'}
                </span>
              </button>

              {/* Fault 3: Optical Sensor Malfunction */}
              <button
                onClick={() => dispatch({ type: 'INJECT_FAULT', fault: 'sensorMalfunction', value: !activeFaults.sensorMalfunction })}
                className="w-full p-2.5 rounded-lg border bg-white border-[#D5DBE1] hover:border-[#9AA5B1] text-xs font-medium flex items-center justify-between transition-colors cursor-pointer min-h-[44px]"
              >
                <div className="flex items-center gap-2">
                  <Radio className={`w-4 h-4 ${activeFaults.sensorMalfunction ? 'text-[#D98200]' : 'text-[#6B7785]'}`} />
                  <span className="text-[#1F2933]">Sensor Lens Dirty (ALM-201)</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded font-tag font-bold ${
                  activeFaults.sensorMalfunction 
                    ? 'bg-[#FFF8E1] text-[#D98200] border border-[#FFE082]' 
                    : 'bg-[#E2E6EA] text-[#6B7785]'
                }`}>
                  {activeFaults.sensorMalfunction ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-[#52606D] text-center">
            Protective interlocks trip motor automatically.
          </div>
        </div>

      </div>
    </div>
  );
};
