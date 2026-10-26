// ============================================================================
// Hero Conveyor Canvas
// Clean, modern, calm industrial control room visualization
// Plain English labels, prominent bins, high readability from 2-3 meters
// ============================================================================

import React from 'react';
import { 
  RotateCw, 
  AlertTriangle, 
  ShieldAlert, 
  ChevronRight,
  Radio,
  HandMetal,
  PackageCheck
} from 'lucide-react';
import { useScada } from '../../context/ScadaContext';
import { HelpTooltip } from '../common/HelpTooltip';

export const ConveyorCanvas: React.FC = () => {
  const { state, dispatch } = useScada();
  const { bottles, motor, sensor, diverter, machineState, activeFaults, counters } = state;

  const isRunning = machineState === 'RUNNING';
  const beltSpeed = motor.actualSpeedMs; // m/s
  const isJammed = activeFaults.jam;
  const isEstop = machineState === 'EMERGENCY_STOP' || activeFaults.emergencyStop;
  const isOverload = activeFaults.motorOverload || motor.temperatureC >= 80;

  // Animation duration inversely proportional to speed
  const animDuration = beltSpeed > 0 ? `${Math.max(0.15, 1.2 / beltSpeed)}s` : '0s';

  return (
    <div className="w-full bg-slate-900/90 rounded-xl border border-slate-800/80 p-4 sm:p-5 shadow-xl select-none">
      
      {/* Header bar with plain-English labels and key telemetry */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-800/80 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
          <span className="font-semibold text-slate-100 text-sm">
            Live Conveyor &amp; Bottle Classification Line
          </span>
          <HelpTooltip 
            term="Conveyor Sorting Cell" 
            explanation="Automated line where bottles are inspected optically and separated into two destination bins based on size and color." 
          />
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-400">
          <div>
            Belt speed: <strong className="text-white font-tag text-sm ml-1">{motor.actualSpeedMs} m/s</strong>
          </div>
          <div>
            Bottles on belt: <strong className="text-white font-tag text-sm ml-1">{bottles.length}</strong>
          </div>
        </div>
      </div>

      {/* Main Track Visualization Area */}
      <div className="relative w-full h-[320px] bg-slate-950 rounded-xl border border-slate-800/90 overflow-hidden">
        
        {/* Overhead Station Indicators */}
        <div className="absolute top-2.5 left-0 right-0 h-7 px-8 flex justify-between pointer-events-none text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span className="font-medium text-slate-300">1. Infeed Feeder</span>
          </div>

          <div className="flex items-center gap-1.5 ml-[18%]">
            <span className={`w-2 h-2 rounded-full ${sensor.active ? 'bg-blue-400' : 'bg-slate-500'}`}></span>
            <span className="font-medium text-slate-300">2. Optical Sensor</span>
            <HelpTooltip 
              term="Sensor S-01 (%IX0.1)" 
              explanation="Retroreflective sensor that detects each bottle as its body breaks the optical beam." 
            />
          </div>

          <div className="flex items-center gap-1.5 ml-[16%]">
            <span className={`w-2 h-2 rounded-full ${diverter.actuated ? 'bg-amber-400' : 'bg-slate-500'}`}></span>
            <span className="font-medium text-slate-300">3. Diverter Arm</span>
            <HelpTooltip 
              term="Pneumatic Pusher (%QX0.1)" 
              explanation="Extends to guide Category B (1000ml Amber) bottles down into Bin B." 
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-medium text-slate-300">4. Bin A Discharge</span>
            <HelpTooltip 
              term="Straight Discharge" 
              explanation="Category A (500ml Clear) bottles proceed straight off the belt into Bin A." 
            />
          </div>
        </div>

        {/* 1. DRIVE MOTOR (Left Side) */}
        <div className={`absolute left-3 top-[90px] w-24 h-28 rounded-xl bg-slate-900 border transition-all z-20 flex flex-col items-center justify-between p-2 shadow-lg ${
          isOverload
            ? 'border-red-500'
            : isRunning
            ? 'border-blue-500/60 shadow-blue-950/40'
            : 'border-slate-800'
        }`}>
          <div className="w-full flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-semibold text-slate-200">Motor MTR-01</span>
            <span className={`w-2 h-2 rounded-full ${isRunning && beltSpeed > 0 ? 'bg-emerald-400' : 'bg-slate-600'}`}></span>
          </div>

          {/* Stator Fan */}
          <div className="relative w-10 h-10 rounded-full bg-slate-950 border border-slate-700/80 flex items-center justify-center overflow-hidden">
            <RotateCw 
              className={`w-6 h-6 text-blue-400 transition-all ${
                isRunning && beltSpeed > 0 ? 'animate-spin' : ''
              }`}
              style={{
                animationDuration: beltSpeed > 0 ? `${Math.max(0.2, 1.8 / beltSpeed)}s` : '0s'
              }}
            />
          </div>

          <div className="w-full text-center text-[10px] space-y-0.5">
            <div className="text-white font-tag font-bold">{motor.rpm} RPM</div>
            <div className={`font-tag ${motor.temperatureC > 75 ? 'text-red-400 font-bold' : 'text-slate-400'}`}>
              {motor.temperatureC}°C
            </div>
          </div>
        </div>

        {/* 2. CONVEYOR BELT (Horizontal Track) */}
        <div className="absolute left-30 right-6 top-[115px] h-[72px] bg-slate-950 border-t-2 border-b-2 border-slate-700/80 rounded shadow-inner z-10">
          
          {/* Animated belt stripes following exact speed */}
          <div 
            className={`w-full h-full conveyor-belt-stripes ${
              isRunning && beltSpeed > 0 && !isJammed ? 'conveyor-belt-animated' : ''
            }`}
            style={{
              animationDuration: animDuration
            }}
          />

          {/* Metallic Side Guide Rails */}
          <div className="absolute -top-1.5 left-0 right-0 h-1.5 bg-gradient-to-r from-slate-600 via-slate-400 to-slate-600 border border-slate-700 rounded-t-sm" />
          <div className="absolute -bottom-1.5 left-0 right-0 h-1.5 bg-gradient-to-r from-slate-600 via-slate-400 to-slate-600 border border-slate-700 rounded-b-sm" />

          {/* End Rollers */}
          <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-14 rounded-sm bg-slate-600 border border-slate-500 shadow" />
          <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-14 rounded-sm bg-slate-600 border border-slate-500 shadow" />

          {/* Travel Direction Subtle Chevrons */}
          <div className="absolute inset-0 flex items-center justify-around pointer-events-none opacity-15">
            {[...Array(6)].map((_, i) => (
              <ChevronRight key={i} className="w-7 h-7 text-blue-400" />
            ))}
          </div>

          {/* BOTTLES TRAVELING ON CONVEYOR */}
          {bottles.map(bottle => {
            const leftPct = (bottle.position / 1000) * 100;
            const isCatA = bottle.category === 'CATEGORY_A';
            const isDefect = bottle.defect !== 'NONE';

            // Top offset on the belt
            const topOffset = bottle.diverted ? 80 : 6;

            return (
              <div
                key={bottle.id}
                className="absolute transition-all duration-100 z-20 pointer-events-none"
                style={{
                  left: `${leftPct}%`,
                  top: `${topOffset}px`,
                  opacity: 1,
                  transform: 'translateX(-50%)',
                }}
              >
                <div className="relative flex flex-col items-center">
                  {/* Bottle Cap */}
                  <div
                    className={`w-3.5 h-2 rounded-t-sm shadow-sm ${
                      !bottle.hasCap
                        ? 'border border-red-500 bg-transparent'
                        : isCatA
                        ? 'bg-emerald-500 border border-emerald-400'
                        : 'bg-amber-500 border border-amber-400'
                    }`}
                  />

                  {/* Bottle Neck */}
                  <div 
                    className={`w-2.5 h-2.5 border-x ${
                      isCatA ? 'bg-cyan-100/50 border-cyan-400/60' : 'bg-amber-900/60 border-amber-600'
                    } ${bottle.defect === 'DEFORMED' ? 'rotate-12 translate-x-0.5' : ''}`}
                  />

                  {/* Bottle Body */}
                  <div
                    className={`relative rounded-b-md border shadow-md flex flex-col justify-end overflow-hidden ${
                      isCatA
                        ? 'w-7 h-12 bg-cyan-100/30 border-cyan-400/70'
                        : 'w-7.5 h-13 bg-amber-950/90 border-amber-500/70'
                    }`}
                  >
                    {/* Liquid fill */}
                    <div
                      className={`w-full transition-all ${isCatA ? 'bg-blue-400/70' : 'bg-amber-500/80'}`}
                      style={{ height: `${bottle.fillLevelPercent}%` }}
                    />

                    {/* Clean plain label */}
                    <div className="absolute top-3 left-0.5 right-0.5 h-3.5 bg-slate-900/90 rounded flex items-center justify-center text-[7px] font-bold text-white uppercase tracking-tight">
                      {isCatA ? 'A 500ml' : 'B 1000ml'}
                    </div>

                    {/* Defect Alert badge */}
                    {isDefect && (
                      <div className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-red-500 border border-white" />
                    )}
                  </div>

                  {/* Jam alert text */}
                  {bottle.isJammed && (
                    <div className="absolute -top-5 bg-red-600 text-white text-[8px] font-bold px-1 rounded shadow animate-bounce">
                      JAMMED
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. OPTICAL SENSOR S-01 (at x = 35% mark) */}
        <div 
          className="absolute left-[38%] top-[98px] flex flex-col items-center z-30 group"
          title="Photoelectric Sensor S-01"
        >
          <div className="text-[10px] font-semibold text-slate-300 mb-0.5 flex items-center gap-1">
            <span>S-01</span>
            <span className="font-tag text-[9px] text-slate-400">({sensor.detectionCount})</span>
          </div>

          {/* Sensor Emitter */}
          <div className={`w-3.5 h-3 rounded-sm border ${
            sensor.active ? 'bg-blue-400 border-white shadow-sm' : 'bg-slate-700 border-slate-600'
          }`} />
          
          {/* Optical Beam crossing the belt */}
          <div className={`w-0.5 h-[76px] my-0.5 transition-all ${
            sensor.active 
              ? 'bg-blue-400 shadow-[0_0_8px_#3b82f6] w-1' 
              : 'bg-red-500/40'
          }`} />

          {/* Sensor Receiver */}
          <div className={`w-3.5 h-3 rounded-sm border ${
            sensor.active ? 'bg-blue-400 border-white shadow-sm' : 'bg-slate-700 border-slate-600'
          }`} />
        </div>

        {/* 4. DIVERTER SOLENOID ARM (at x = 65% mark) */}
        <div className="absolute left-[65%] top-[78px] z-30 flex flex-col items-center">
          <div className="text-[10px] font-semibold text-amber-300 mb-0.5 flex items-center gap-1">
            <span>Diverter</span>
            <span className="font-tag text-[9px] text-amber-400/80">({diverter.strokeCount})</span>
          </div>

          {/* Pneumatic Cylinder */}
          <div className="relative w-8 h-10 bg-slate-800 border border-slate-600 rounded-sm shadow flex flex-col items-center justify-start p-1">
            <span className="text-[7px] text-slate-400 font-tag">%QX0.1</span>
            
            {/* Piston Rod */}
            <div 
              className="w-2.5 bg-gradient-to-b from-slate-200 to-slate-400 rounded-b border border-slate-300 shadow transition-all duration-75"
              style={{
                height: `${10 + (diverter.positionPercent * 0.45)}px`
              }}
            >
              {/* Diverter Paddle */}
              <div className="w-7 h-2.5 -ml-2.2 mt-auto bg-amber-500 border border-amber-300 rounded-xs shadow" />
            </div>
          </div>
        </div>

        {/* 5. LARGE CLEAR DESTINATION BINS (Bottom) */}
        
        {/* BIN B: CATEGORY B (Diverted at x = 65%) */}
        <div className="absolute left-[58%] bottom-3 w-48 sm:w-56 h-26 bg-slate-900 border border-amber-500/60 rounded-xl p-3 shadow-lg flex flex-col justify-between z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="text-xs font-bold text-amber-300">
                Bin B (Diverted)
              </span>
            </div>
            <span className="text-[10px] text-slate-400">1000ml Amber</span>
          </div>

          <div className="flex items-baseline justify-between my-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-amber-400 font-tag tracking-tight">
              {counters.categoryB}
            </span>
            <span className="text-xs text-slate-400 font-medium">bottles sorted</span>
          </div>

          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-amber-400 h-full transition-all duration-300" 
              style={{ width: `${Math.min(100, (counters.categoryB % 50) * 2)}%` }} 
            />
          </div>
        </div>

        {/* BIN A: CATEGORY A (Straight Discharge at x = 95%) */}
        <div className="absolute right-4 bottom-3 w-48 sm:w-56 h-26 bg-slate-900 border border-emerald-500/60 rounded-xl p-3 shadow-lg flex flex-col justify-between z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-xs font-bold text-emerald-300">
                Bin A (Straight)
              </span>
            </div>
            <span className="text-[10px] text-slate-400">500ml Clear</span>
          </div>

          <div className="flex items-baseline justify-between my-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-tag tracking-tight">
              {counters.categoryA}
            </span>
            <span className="text-xs text-slate-400 font-medium">bottles packed</span>
          </div>

          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-400 h-full transition-all duration-300" 
              style={{ width: `${Math.min(100, (counters.categoryA % 50) * 2)}%` }} 
            />
          </div>
        </div>

        {/* EMERGENCY STOP TRIPPED OVERLAY */}
        {isEstop && (
          <div className="absolute inset-0 bg-red-950/90 backdrop-blur-xs flex flex-col items-center justify-center z-40 p-6 text-center animate-in fade-in duration-100">
            <ShieldAlert className="w-14 h-14 text-red-400 mb-2" />
            <h3 className="text-lg font-bold text-white tracking-wide">
              Emergency Stop Active
            </h3>
            <p className="text-xs text-red-200 max-w-md mt-1">
              Safety circuit de-energized. All drives are halted. Twist the E-Stop button to reset.
            </p>
            <button
              onClick={() => dispatch({ type: 'RESET_ESTOP_COMMAND' })}
              className="mt-3 px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg shadow-lg cursor-pointer transition-colors"
            >
              Twist &amp; Reset E-Stop
            </button>
          </div>
        )}

        {/* CONVEYOR JAM OVERLAY */}
        {isJammed && !isEstop && (
          <div className="absolute left-1/4 right-1/4 top-1/2 -translate-y-1/2 bg-slate-900 border-2 border-red-500 p-4 rounded-xl shadow-2xl flex items-center justify-between z-40">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-7 h-7 text-red-400 shrink-0" />
              <div>
                <div className="text-sm font-bold text-white">Conveyor Jam Detected</div>
                <div className="text-xs text-slate-300">Optical sensor was blocked for more than 3.0s. Motor stopped safely.</div>
              </div>
            </div>
            <button
              onClick={() => {
                dispatch({ type: 'INJECT_FAULT', fault: 'jam', value: false });
                dispatch({ type: 'RESET_FAULT_COMMAND' });
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg shadow cursor-pointer transition-colors shrink-0"
            >
              Clear &amp; Reset
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
