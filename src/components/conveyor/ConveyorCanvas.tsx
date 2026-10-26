// ============================================================================
// Animated SVG / React Conveyor Simulation Canvas (Hero Component)
// Left-to-right animated belt, motor, sensors, diverter, bins, and bottles
// Notice: All sensor detections and motor physics are SIMULATED.
// ============================================================================

import React from 'react';
import { 
  RotateCw, 
  AlertTriangle, 
  ShieldAlert, 
  Layers, 
  Archive, 
  CheckCircle2, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useScada } from '../../context/ScadaContext';

export const ConveyorCanvas: React.FC = () => {
  const { state, dispatch } = useScada();
  const { bottles, motor, sensor, diverter, machineState, activeFaults, counters } = state;

  const isRunning = machineState === 'RUNNING';
  const beltSpeed = motor.actualSpeedMs; // m/s
  const isJammed = activeFaults.jam;
  const isEstop = machineState === 'EMERGENCY_STOP' || activeFaults.emergencyStop;
  const isOverload = activeFaults.motorOverload || motor.temperatureC >= 80;

  // Belt animation duration based on speed (higher speed = faster animation)
  const animDuration = beltSpeed > 0 ? `${Math.max(0.15, 1.2 / beltSpeed)}s` : '0s';

  return (
    <div className="relative w-full bg-slate-950 rounded-xl border border-slate-800 p-4 overflow-hidden shadow-2xl select-none">
      
      {/* Top Banner & Scale Legend */}
      <div className="flex flex-wrap items-center justify-between pb-3 mb-2 border-b border-slate-800/80 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="font-bold text-slate-100 uppercase tracking-wider">
            Live Automation Track • Line #4 Conveyor & Sorting Cell
          </span>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
            SIMULATED TELEMETRY
          </span>
        </div>

        <div className="flex items-center gap-3 text-slate-400 text-[11px]">
          <span>Speed: <strong className="text-cyan-300">{motor.actualSpeedMs} m/s</strong> ({motor.frequencyHz} Hz)</span>
          <span>Bottles on Belt: <strong className="text-white">{bottles.length}</strong></span>
        </div>
      </div>

      {/* Main Track Visualization Graphic (Height: 380px) */}
      <div className="relative w-full h-[360px] bg-slate-900/60 rounded-lg border border-slate-800/80 overflow-hidden tech-grid">
        
        {/* Overhead Station Labels */}
        <div className="absolute top-2 left-0 right-0 h-8 px-6 flex justify-between pointer-events-none text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>INFEED FEEDER (x=0)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span>SENSOR S-01 (x=350)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>DIVERTER PUSHER (x=650)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>BIN A DISCHARGE (x=950)</span>
          </div>
        </div>

        {/* 1. MOTOR & VFD DRIVE UNIT (Left Side, x = ~2%) */}
        <div className={`absolute left-3 top-[105px] w-24 h-32 rounded-lg bg-gradient-to-b from-slate-800 to-slate-900 border-2 transition-all z-20 flex flex-col items-center justify-between p-2 shadow-2xl ${
          isOverload
            ? 'border-red-500 alarm-flash led-glow-red'
            : isRunning
            ? 'border-cyan-500/80 shadow-cyan-500/20'
            : 'border-slate-700'
        }`}>
          <div className="w-full flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="font-bold text-slate-300">MTR-01</span>
            <span className={`w-2 h-2 rounded-full ${isRunning && beltSpeed > 0 ? 'bg-emerald-400 led-glow-green' : 'bg-slate-600'}`}></span>
          </div>

          {/* Stator Fan */}
          <div className="relative w-12 h-12 rounded-full bg-slate-950 border border-slate-700 flex items-center justify-center overflow-hidden">
            <RotateCw 
              className={`w-8 h-8 text-cyan-400 transition-all ${
                isRunning && beltSpeed > 0 ? 'animate-spin' : ''
              }`}
              style={{
                animationDuration: beltSpeed > 0 ? `${Math.max(0.2, 1.8 / beltSpeed)}s` : '0s'
              }}
            />
          </div>

          <div className="w-full text-center font-mono text-[9px] leading-tight space-y-0.5">
            <div className="text-cyan-300 font-bold">{motor.rpm} RPM</div>
            <div className={motor.temperatureC > 75 ? 'text-red-400 font-bold' : 'text-slate-400'}>
              {motor.temperatureC}°C
            </div>
          </div>
        </div>

        {/* 2. CONVEYOR BELT (y = 135px to 215px) */}
        <div className="absolute left-28 right-8 top-[140px] h-[75px] bg-slate-950 border-t-4 border-b-4 border-slate-700 rounded-sm shadow-inner z-10">
          
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
          <div className="absolute -top-2 left-0 right-0 h-2 bg-gradient-to-r from-slate-600 via-slate-400 to-slate-600 border border-slate-700 rounded-t-sm" />
          <div className="absolute -bottom-2 left-0 right-0 h-2 bg-gradient-to-r from-slate-600 via-slate-400 to-slate-600 border border-slate-700 rounded-b-sm" />

          {/* End Drive Drums / Rollers */}
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-4 h-16 rounded-sm bg-gradient-to-r from-slate-400 to-slate-700 border border-slate-500 shadow" />
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-4 h-16 rounded-sm bg-gradient-to-r from-slate-700 to-slate-400 border border-slate-500 shadow" />

          {/* Chevrons indicating travel direction */}
          <div className="absolute inset-0 flex items-center justify-around pointer-events-none opacity-20">
            {[...Array(6)].map((_, i) => (
              <ChevronRight key={i} className="w-8 h-8 text-cyan-400" />
            ))}
          </div>

          {/* BOTTLES TRAVELING ON CONVEYOR */}
          {bottles.map(bottle => {
            const leftPct = (bottle.position / 1000) * 100;
            const isCatA = bottle.category === 'CATEGORY_A';
            const isDefect = bottle.defect !== 'NONE';

            // When diverted, bottle moves down towards Bin B
            const topOffset = bottle.diverted ? 95 : 8;

            return (
              <div
                key={bottle.id}
                className="absolute transition-all duration-100 z-20 pointer-events-none"
                style={{
                  left: `${leftPct}%`,
                  top: `${topOffset}px`,
                  opacity: bottle.sorted && bottle.position >= 940 ? 0.2 : 1,
                  transform: 'translateX(-50%)',
                }}
              >
                <div className="relative flex flex-col items-center">
                  {/* Bottle Cap */}
                  <div
                    className={`w-3 h-2 rounded-t-sm shadow-sm ${
                      !bottle.hasCap
                        ? 'border border-red-500/80 bg-transparent'
                        : isCatA
                        ? 'bg-emerald-500 border border-emerald-400'
                        : 'bg-amber-400 border border-amber-300'
                    }`}
                  />

                  {/* Bottle Neck */}
                  <div 
                    className={`w-2.5 h-3 border-x ${
                      isCatA ? 'bg-cyan-200/40 border-cyan-400/60' : 'bg-amber-900/60 border-amber-700'
                    } ${bottle.defect === 'DEFORMED' ? 'rotate-12 translate-x-0.5' : ''}`}
                  />

                  {/* Bottle Body */}
                  <div
                    className={`relative rounded-b-md border shadow-md flex flex-col justify-end overflow-hidden ${
                      isCatA
                        ? 'w-6 h-12 bg-cyan-100/20 border-cyan-400/50 backdrop-blur-xs'
                        : 'w-7 h-14 bg-amber-950/80 border-amber-600/60'
                    }`}
                  >
                    {/* Liquid fill volume */}
                    <div
                      className={`w-full transition-all ${isCatA ? 'bg-cyan-400/60' : 'bg-amber-500/70'}`}
                      style={{ height: `${bottle.fillLevelPercent}%` }}
                    />

                    {/* Label */}
                    <div className="absolute top-4 left-0.5 right-0.5 h-4 bg-slate-100/90 rounded-xs flex items-center justify-center text-[7px] font-bold text-slate-800 uppercase">
                      {isCatA ? 'CAT A' : 'CAT B'}
                    </div>

                    {/* Defect Alert dot */}
                    {isDefect && (
                      <div className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-red-500 border border-white animate-ping" />
                    )}
                  </div>

                  {/* Jam alert above bottle if jammed */}
                  {bottle.isJammed && (
                    <div className="absolute -top-6 bg-red-600 text-white text-[9px] font-bold px-1 rounded shadow animate-bounce">
                      JAM
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. OPTICAL SENSOR S-01 (at x = 35% ~ position 350) */}
        <div 
          className="absolute left-[37%] top-[115px] flex flex-col items-center z-30 group"
          title="Photoelectric Inspection Sensor S-01 (%IX0.1)"
        >
          <div className="text-[9px] font-mono font-bold text-slate-400 mb-0.5 group-hover:text-cyan-400">
            S-01 ({sensor.detectionCount})
          </div>
          {/* Emitter head */}
          <div className={`w-3.5 h-4 rounded-sm border ${
            sensor.active ? 'bg-cyan-400 border-white led-glow-blue' : 'bg-slate-700 border-slate-600'
          }`} />
          
          {/* Optical Laser Beam crossing belt */}
          <div className={`w-0.5 h-[80px] my-0.5 transition-all ${
            sensor.active 
              ? 'bg-cyan-300 shadow-[0_0_10px_#38bdf8] w-1' 
              : 'bg-red-500/40 shadow-[0_0_4px_#ef4444]'
          }`} />

          {/* Receiver head */}
          <div className={`w-3.5 h-4 rounded-sm border ${
            sensor.active ? 'bg-cyan-400 border-white led-glow-blue' : 'bg-slate-700 border-slate-600'
          }`} />
        </div>

        {/* 4. DIVERTER SOLENOID ARM (at x = 65% ~ position 650) */}
        <div className="absolute left-[66%] top-[85px] z-30 flex flex-col items-center">
          <div className="text-[9px] font-mono text-amber-400 font-bold mb-0.5">
            DIVERTER ({diverter.strokeCount})
          </div>

          {/* Pneumatic Cylinder Body */}
          <div className="relative w-8 h-12 bg-slate-800 border border-slate-600 rounded-sm shadow flex flex-col items-center justify-start p-1">
            <span className="text-[7px] text-slate-400 font-mono">%QX0.1</span>
            
            {/* Moving Piston Rod */}
            <div 
              className="w-2.5 bg-gradient-to-b from-slate-200 to-slate-400 rounded-b border border-slate-300 shadow transition-all duration-75"
              style={{
                height: `${12 + (diverter.positionPercent * 0.45)}px`
              }}
            >
              {/* Diverter Paddle Face */}
              <div className="w-7 h-2.5 -ml-2.2 mt-auto bg-amber-500 border border-amber-300 rounded-xs shadow" />
            </div>
          </div>
        </div>

        {/* 5. DESTINATION SORTING BINS (Bottom) */}

        {/* BIN B: CATEGORY B (Diverted at x = 65%) */}
        <div className="absolute left-[61%] bottom-2 w-36 h-32 bg-slate-900 border-2 border-amber-500/70 rounded-lg p-2.5 shadow-xl flex flex-col justify-between z-20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-amber-400">BIN B (CATEGORY B)</span>
            <div className="w-2 h-2 rounded-full bg-amber-400 led-glow-amber" />
          </div>
          <div className="text-[9px] text-slate-400 font-mono">Diverted Chute (1000ml Amber)</div>

          <div className="bg-amber-950/70 border border-amber-800 rounded p-1.5 text-center">
            <div className="text-2xl font-black text-amber-300 font-mono">{counters.categoryB}</div>
            <div className="text-[9px] text-amber-400/80 font-mono">Sorted Bottles</div>
          </div>

          <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
            <div className="bg-amber-400 h-full" style={{ width: `${Math.min(100, (counters.categoryB % 50) * 2)}%` }} />
          </div>
        </div>

        {/* BIN A: CATEGORY A (Straight-Through Discharge at x = 94%) */}
        <div className="absolute right-3 bottom-2 w-36 h-32 bg-slate-900 border-2 border-emerald-500/70 rounded-lg p-2.5 shadow-xl flex flex-col justify-between z-20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-emerald-400">BIN A (CATEGORY A)</span>
            <div className="w-2 h-2 rounded-full bg-emerald-400 led-glow-green" />
          </div>
          <div className="text-[9px] text-slate-400 font-mono">Direct Discharge (500ml Clear)</div>

          <div className="bg-emerald-950/70 border border-emerald-800 rounded p-1.5 text-center">
            <div className="text-2xl font-black text-emerald-300 font-mono">{counters.categoryA}</div>
            <div className="text-[9px] text-emerald-400/80 font-mono">Packed Bottles</div>
          </div>

          <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
            <div className="bg-emerald-400 h-full" style={{ width: `${Math.min(100, (counters.categoryA % 50) * 2)}%` }} />
          </div>
        </div>

        {/* EMERGENCY STOP TRIPPED OVERLAY */}
        {isEstop && (
          <div className="absolute inset-0 bg-red-950/85 backdrop-blur-xs flex flex-col items-center justify-center z-40 p-6 text-center animate-in fade-in duration-100">
            <ShieldAlert className="w-16 h-16 text-rose-400 animate-bounce mb-2" />
            <h3 className="text-xl font-black text-white font-mono tracking-widest uppercase">
              EMERGENCY STOP SAFETY INTERLOCK ACTIVE
            </h3>
            <p className="text-xs text-rose-200 font-mono max-w-md mt-1">
              Safety circuit de-energized via PB-01. All drives frozen. Twist E-Stop knob to release, then press Start.
            </p>
            <button
              onClick={() => dispatch({ type: 'RESET_ESTOP_COMMAND' })}
              className="mt-4 px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs rounded-lg shadow-xl cursor-pointer"
            >
              TWIST TO RELEASE & RESET E-STOP
            </button>
          </div>
        )}

        {/* CONVEYOR JAM OVERLAY */}
        {isJammed && !isEstop && (
          <div className="absolute left-1/4 right-1/4 top-1/2 -translate-y-1/2 bg-red-950/95 border-2 border-red-500 p-4 rounded-xl shadow-2xl flex items-center justify-between z-40 alarm-flash">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-400 animate-bounce" />
              <div>
                <div className="text-sm font-black text-white font-mono">CONVEYOR JAM DETECTED (ALM-101)</div>
                <div className="text-xs text-red-200 font-mono">Optical sensor blocked &gt; 3.0s. Motor drive stopped automatically.</div>
              </div>
            </div>
            <button
              onClick={() => {
                dispatch({ type: 'INJECT_FAULT', fault: 'jam', value: false });
                dispatch({ type: 'RESET_FAULT_COMMAND' });
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs rounded-lg shadow cursor-pointer"
            >
              CLEAR & RESET
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
