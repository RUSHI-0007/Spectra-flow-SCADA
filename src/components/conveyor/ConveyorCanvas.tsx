// ============================================================================
// Hero Conveyor Canvas (Light Industrial HMI Theme)
// Clean technical drawing style, proportional responsive scaling,
// neutral distinct Bin A (#6B7A5A olive-grey) & Bin B (#B7791F amber) tones
// Sensor beam & markers: dark grey #6B7785 when idle, red #C62828 when broken.
// ============================================================================

import React from 'react';
import { 
  RotateCw, 
  AlertTriangle, 
  ShieldAlert, 
  ChevronRight
} from 'lucide-react';
import { useScada } from '../../context/ScadaContext';
import { HelpTooltip } from '../common/HelpTooltip';

export const ConveyorCanvas: React.FC = () => {
  const { state, dispatch } = useScada();
  const { bottles, motor, sensor, diverter, machineState, activeFaults, counters } = state;

  const isRunning = machineState === 'RUNNING';
  const beltSpeed = motor.actualSpeedMs;
  const isJammed = activeFaults.jam;
  const isEstop = machineState === 'EMERGENCY_STOP' || activeFaults.emergencyStop;
  const isOverload = activeFaults.motorOverload || motor.temperatureC >= 80;

  // Belt stripe animation duration
  const animDuration = beltSpeed > 0 ? `${Math.max(0.2, 1.2 / beltSpeed)}s` : '0s';

  return (
    <div className="w-full bg-white rounded-lg border border-[#D5DBE1] p-3 sm:p-5 shadow-xs select-none">
      
      {/* Header bar with plain-English labels and key telemetry */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-3 border-b border-[#D5DBE1] text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#3B4651]"></span>
          <span className="font-bold text-[#1F2933] text-sm">
            Live Conveyor &amp; Bottle Classification Line
          </span>
          <HelpTooltip 
            term="Conveyor Sorting Cell" 
            explanation="Automated line where bottles are inspected optically and separated into two destination bins based on size and category." 
          />
        </div>

        <div className="flex items-center gap-3 sm:gap-4 text-xs text-[#52606D]">
          <div>
            Belt speed: <strong className="text-[#1F2933] font-tag font-bold ml-1">{motor.actualSpeedMs} m/s</strong>
          </div>
          <div>
            Bottles on belt: <strong className="text-[#1F2933] font-tag font-bold ml-1">{bottles.length}</strong>
          </div>
        </div>
      </div>

      {/* Main Track Visualization Area: Light technical drawing background */}
      <div className="relative w-full h-[220px] sm:h-[260px] md:h-[300px] bg-[#F5F6F8] rounded-lg border border-[#D5DBE1] overflow-hidden">
        
        {/* Overhead Technical Station Markers */}
        <div className="absolute top-2 left-0 right-0 h-6 px-3 sm:px-6 flex justify-between pointer-events-none text-[11px] text-[#52606D]">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#3B4651]"></span>
            <span className="font-medium hidden sm:inline">1. Infeed</span>
            <span className="font-medium sm:hidden">1. In</span>
          </div>

          <div className="flex items-center gap-1 ml-[8%] sm:ml-[12%]">
            <span className={`w-2 h-2 rounded-full ${sensor.active ? 'bg-[#C62828]' : 'bg-[#6B7785]'}`}></span>
            <span className="font-medium hidden sm:inline">2. Optical Sensor</span>
            <span className="font-medium sm:hidden">2. S-01</span>
            <HelpTooltip 
              term="Sensor S-01 (%IX0.1)" 
              explanation="Retroreflective sensor that detects each bottle as its body breaks the optical beam." 
            />
          </div>

          <div className="flex items-center gap-1 ml-[5%] sm:ml-[8%]">
            <span className="w-2 h-2 rounded-full bg-[#C62828]"></span>
            <span className="font-medium hidden sm:inline">3. Reject Gate</span>
            <span className="font-medium sm:hidden">3. Rej</span>
            <HelpTooltip 
              term="Reject Ejector (%QX0.2)" 
              explanation="Discharges defective (out-of-spec) bottles into the reject bin." 
            />
          </div>

          <div className="flex items-center gap-1 ml-[5%] sm:ml-[8%]">
            <span className={`w-2 h-2 rounded-full ${diverter.actuated ? 'bg-[#B7791F]' : 'bg-[#6B7785]'}`}></span>
            <span className="font-medium hidden sm:inline">4. Diverter Arm</span>
            <span className="font-medium sm:hidden">4. Arm</span>
            <HelpTooltip 
              term="Pneumatic Pusher (%QX0.1)" 
              explanation="Actuates to guide Category B (1000ml Amber) bottles down into Bin B." 
            />
          </div>

          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#6B7A5A]"></span>
            <span className="font-medium hidden sm:inline">5. Bin A Straight</span>
            <span className="font-medium sm:hidden">5. Bin A</span>
          </div>
        </div>

        {/* 1. DRIVE MOTOR (Left Side) - Technical clean style */}
        <div className={`absolute left-2 sm:left-3 top-[65px] sm:top-[75px] md:top-[85px] w-16 sm:w-20 md:w-24 h-24 sm:h-28 rounded-lg bg-white border transition-all z-20 flex flex-col items-center justify-between p-1.5 sm:p-2 shadow-xs ${
          isOverload
            ? 'border-[#C62828] bg-[#FFEBEE]'
            : isRunning
            ? 'border-[#3B4651]'
            : 'border-[#D5DBE1]'
        }`}>
          <div className="w-full flex items-center justify-between text-[10px] sm:text-[11px] text-[#52606D]">
            <span className="font-bold text-[#1F2933] truncate">MTR-01</span>
            <span className={`w-2 h-2 rounded-full shrink-0 ${isRunning && beltSpeed > 0 ? 'bg-[#2E7D32]' : 'bg-[#9AA5B1]'}`}></span>
          </div>

          {/* Stator Fan / Rotor */}
          <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#F5F6F8] border border-[#D5DBE1] flex items-center justify-center overflow-hidden">
            <RotateCw 
              className={`w-5 h-5 sm:w-6 sm:h-6 text-[#3B4651] transition-all ${
                isRunning && beltSpeed > 0 ? 'animate-spin' : ''
              }`}
              style={{
                animationDuration: beltSpeed > 0 ? `${Math.max(0.2, 1.8 / beltSpeed)}s` : '0s'
              }}
            />
          </div>

          <div className="w-full text-center text-[10px] space-y-0.2">
            <div className="text-[#1F2933] font-tag font-bold">{motor.rpm} RPM</div>
            <div className={`font-tag ${motor.temperatureC > 75 ? 'text-[#C62828] font-bold' : 'text-[#52606D]'}`}>
              {motor.temperatureC}°C
            </div>
          </div>
        </div>

        {/* 2. CONVEYOR BELT (Horizontal Track) - Light Technical Grey #9AA5B1 with Dark Rollers */}
        <div className="absolute left-[74px] sm:left-[96px] md:left-[115px] right-2 sm:right-4 top-[85px] sm:top-[100px] md:top-[115px] h-[60px] sm:h-[68px] md:h-[76px] bg-[#9AA5B1] border-y-2 border-[#6B7785] rounded-xs shadow-inner z-10">
          
          {/* Technical belt pattern */}
          <div 
            className={`w-full h-full conveyor-belt-stripes ${
              isRunning && beltSpeed > 0 && !isJammed ? 'conveyor-belt-animated' : ''
            }`}
            style={{
              animationDuration: animDuration
            }}
          />

          {/* Steel Guide Rails */}
          <div className="absolute -top-1.5 left-0 right-0 h-1.5 bg-[#D5DBE1] border-y border-[#9AA5B1]" />
          <div className="absolute -bottom-1.5 left-0 right-0 h-1.5 bg-[#D5DBE1] border-y border-[#9AA5B1]" />

          {/* Heavy Duty End Rollers (#6B7785) */}
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-3 h-12 sm:h-14 rounded-xs bg-[#6B7785] border border-[#52606D] shadow-xs" />
          <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-3 h-12 sm:h-14 rounded-xs bg-[#6B7785] border border-[#52606D] shadow-xs" />

          {/* Travel Direction Subtle Chevrons */}
          <div className="absolute inset-0 flex items-center justify-around pointer-events-none opacity-25">
            {[...Array(6)].map((_, i) => (
              <ChevronRight key={i} className="w-6 h-6 text-[#1F2933]" />
            ))}
          </div>

          {/* BOTTLES TRAVELING ON CONVEYOR: Clean Technical White Bottles */}
          {bottles.map(bottle => {
            const leftPct = (bottle.position / 1000) * 100;
            const isCatA = bottle.category === 'CATEGORY_A';
            const isDefect = bottle.defect !== 'NONE';

            // Top offset on the belt
            const topOffset = bottle.diverted ? 65 : 4;

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
                    className={`w-3 sm:w-3.5 h-1.5 sm:h-2 rounded-t-xs shadow-xs ${
                      !bottle.hasCap
                        ? 'border border-[#C62828] bg-transparent'
                        : isCatA
                        ? 'bg-[#6B7A5A] border border-[#536046]'
                        : 'bg-[#B7791F] border border-[#975A16]'
                    }`}
                  />

                  {/* Bottle Neck */}
                  <div 
                    className={`w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white border-x border-[#9AA5B1] ${
                      bottle.defect === 'DEFORMED' ? 'rotate-12 translate-x-0.5' : ''
                    }`}
                  />

                  {/* Bottle Body: White with subtle technical border */}
                  <div
                    className={`relative rounded-b-sm border shadow-xs flex flex-col justify-end overflow-hidden ${
                      isCatA
                        ? 'w-6 sm:w-7 h-10 sm:h-12 bg-white border-[#6B7A5A]'
                        : 'w-6.5 sm:w-7.5 h-11 sm:h-13 bg-white border-[#B7791F]'
                    }`}
                  >
                    {/* Liquid fill: Subtle neutral fill */}
                    <div
                      className={`w-full transition-all ${
                        isCatA ? 'bg-[#F2F5F0] border-t border-[#6B7A5A]/40' : 'bg-[#FDF6E9] border-t border-[#B7791F]/40'
                      }`}
                      style={{ height: `${bottle.fillLevelPercent}%` }}
                    />

                    {/* Clear Technical Label */}
                    <div 
                      className={`absolute top-2 left-0.5 right-0.5 h-3.5 rounded-xs flex items-center justify-center text-[7px] font-bold text-white tracking-tight ${
                        isCatA ? 'bg-[#6B7A5A]' : 'bg-[#B7791F]'
                      }`}
                    >
                      {isCatA ? 'A 500ml' : 'B 1000ml'}
                    </div>

                    {/* Defect Indicator dot */}
                    {isDefect && (
                      <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-[#C62828]" />
                    )}
                  </div>

                  {/* Jam alert text */}
                  {bottle.isJammed && (
                    <div className="absolute -top-4 bg-[#C62828] text-white text-[8px] font-bold px-1 rounded shadow-xs">
                      JAMMED
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. OPTICAL SENSOR S-01 (at x = 36% mark) */}
        {/* Dark grey #6B7785 when idle, red beam #C62828 only when broken by bottle */}
        <div 
          className="absolute left-[36%] sm:left-[38%] top-[68px] sm:top-[82px] md:top-[96px] flex flex-col items-center z-30"
          title="Photoelectric Sensor S-01"
        >
          <div className="text-[10px] font-bold text-[#1F2933] mb-0.5 flex items-center gap-1 bg-white px-1 rounded border border-[#D5DBE1]">
            <span>S-01</span>
            <span className="font-tag text-[9px] text-[#52606D]">({sensor.detectionCount})</span>
          </div>

          {/* Sensor Emitter: Dark grey when idle, red when bottle breaks it */}
          <div className={`w-3.5 h-2.5 sm:h-3 rounded-xs border ${
            sensor.active ? 'bg-[#C62828] border-[#8E1C1C]' : 'bg-[#6B7785] border-[#52606D]'
          }`} />
          
          {/* Optical Beam crossing the belt: Dark grey dashed/faint when idle, solid red when broken */}
          <div className={`transition-all ${
            sensor.active 
              ? 'bg-[#C62828] w-1 h-[62px] sm:h-[70px] md:h-[78px] my-0.5' 
              : 'bg-[#6B7785]/30 w-0.5 h-[62px] sm:h-[70px] md:h-[78px] my-0.5'
          }`} />

          {/* Sensor Receiver */}
          <div className={`w-3.5 h-2.5 sm:h-3 rounded-xs border ${
            sensor.active ? 'bg-[#C62828] border-[#8E1C1C]' : 'bg-[#6B7785] border-[#52606D]'
          }`} />
        </div>

        {/* 3. REJECT GATE / PNEUMATIC EJECTOR (at x = 50% mark) */}
        <div className="absolute left-[49%] sm:left-[51%] top-[56px] sm:top-[69px] md:top-[81px] z-30 flex flex-col items-center">
          <div className="text-[10px] font-bold text-[#52606D] mb-0.5 flex items-center gap-1 bg-white px-1 rounded border border-[#D5DBE1]">
            <span>Reject</span>
            <span className="font-tag text-[9px] text-[#52606D]">({counters.rejectedCount})</span>
          </div>

          <div className="relative w-6 sm:w-7 h-7 sm:h-9 bg-white border border-[#52606D] rounded-xs shadow-xs flex flex-col items-center justify-start p-1">
            <span className="text-[7px] text-[#52606D] font-tag">%QX0.2</span>
            <div className="w-1.5 h-3 bg-[#6B7785] rounded-b mt-auto" />
          </div>
        </div>

        {/* 4. DIVERTER SOLENOID ARM (at x = 65% mark) */}
        <div className="absolute left-[63%] sm:left-[65%] top-[55px] sm:top-[68px] md:top-[80px] z-30 flex flex-col items-center">
          <div className="text-[10px] font-bold text-[#B7791F] mb-0.5 flex items-center gap-1 bg-white px-1 rounded border border-[#D5DBE1]">
            <span>Diverter</span>
            <span className="font-tag text-[9px] text-[#52606D]">({diverter.strokeCount})</span>
          </div>

          {/* Pneumatic Cylinder */}
          <div className="relative w-7 sm:w-8 h-8 sm:h-10 bg-white border border-[#52606D] rounded-xs shadow-xs flex flex-col items-center justify-start p-1">
            <span className="text-[7px] text-[#52606D] font-tag">%QX0.1</span>
            
            {/* Piston Rod */}
            <div 
              className="w-2 sm:w-2.5 bg-[#D5DBE1] rounded-b border border-[#9AA5B1] transition-all duration-75"
              style={{
                height: `${8 + (diverter.positionPercent * 0.42)}px`
              }}
            >
              {/* Diverter Paddle */}
              <div className="w-6 sm:w-7 h-2.5 -ml-2 sm:-ml-2.2 mt-auto bg-[#B7791F] border border-[#975A16] rounded-xs shadow-xs" />
            </div>
          </div>
        </div>

        {/* 5. DESTINATION BINS on Tablet/Desktop (md+) overlaid inside canvas */}

        {/* REJECT BIN: DEFECTS (at x = 26%) */}
        <div className="hidden md:flex absolute left-[25%] lg:left-[27%] bottom-2.5 w-36 lg:w-44 h-22 lg:h-24 bg-white border border-[#D5DBE1] rounded-lg p-2.5 flex-col justify-between z-20 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C62828]" />
              <span className="text-xs font-bold text-[#1F2933]">
                Reject Bin
              </span>
            </div>
            <span className="text-[10px] text-[#52606D] font-medium">Defects</span>
          </div>

          <div className="flex items-baseline justify-between my-0.5">
            <span className="text-3xl lg:text-4xl font-extrabold text-[#1F2933] font-tag tracking-tight">
              {counters.rejectedCount}
            </span>
            <span className="text-xs text-[#52606D] font-medium">scrapped</span>
          </div>

          <div className="w-full bg-[#D5DBE1] h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-[#C62828] h-full transition-all duration-300" 
              style={{ width: `${Math.min(100, (counters.rejectedCount % 50) * 2)}%` }} 
            />
          </div>
        </div>
        
        {/* BIN B: CATEGORY B (Diverted at x = 65%) */}
        <div className="hidden md:flex absolute left-[49%] lg:left-[51%] bottom-2.5 w-40 lg:w-48 h-22 lg:h-24 bg-[#FDF6E9] border-2 border-[#B7791F] rounded-lg p-2.5 flex-col justify-between z-20 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B7791F]" />
              <span className="text-xs font-bold text-[#B7791F]">
                Bin B (Diverted)
              </span>
            </div>
            <span className="text-[10px] text-[#52606D] font-medium">1000ml Amber</span>
          </div>

          <div className="flex items-baseline justify-between my-0.5">
            <span className="text-3xl lg:text-4xl font-extrabold text-[#1F2933] font-tag tracking-tight">
              {counters.categoryB}
            </span>
            <span className="text-xs text-[#52606D] font-medium">sorted</span>
          </div>

          <div className="w-full bg-[#D5DBE1] h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-[#B7791F] h-full transition-all duration-300" 
              style={{ width: `${Math.min(100, (counters.categoryB % 50) * 2)}%` }} 
            />
          </div>
        </div>

        {/* BIN A: CATEGORY A (Straight Discharge at x = 95%) - Olive-grey #6B7A5A */}
        <div className="hidden md:flex absolute right-2.5 bottom-2.5 w-40 lg:w-48 h-22 lg:h-24 bg-[#F2F5F0] border-2 border-[#6B7A5A] rounded-lg p-2.5 flex-col justify-between z-20 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#6B7A5A]" />
              <span className="text-xs font-bold text-[#6B7A5A]">
                Bin A (Straight)
              </span>
            </div>
            <span className="text-[10px] text-[#52606D] font-medium">500ml Clear</span>
          </div>

          <div className="flex items-baseline justify-between my-0.5">
            <span className="text-3xl lg:text-4xl font-extrabold text-[#1F2933] font-tag tracking-tight">
              {counters.categoryA}
            </span>
            <span className="text-xs text-[#52606D] font-medium">packed</span>
          </div>

          <div className="w-full bg-[#D5DBE1] h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-[#6B7A5A] h-full transition-all duration-300" 
              style={{ width: `${Math.min(100, (counters.categoryA % 50) * 2)}%` }} 
            />
          </div>
        </div>

        {/* EMERGENCY STOP TRIPPED OVERLAY - Flat clean red alert box */}
        {isEstop && (
          <div className="absolute inset-0 bg-[#FFEBEE] border-2 border-[#C62828] flex flex-col items-center justify-center z-40 p-4 text-center">
            <ShieldAlert className="w-10 sm:w-12 h-10 sm:h-12 text-[#C62828] mb-1.5" />
            <h3 className="text-base sm:text-lg font-bold text-[#C62828]">
              Emergency Stop Active
            </h3>
            <p className="text-xs text-[#52606D] max-w-md mt-0.5">
              Safety circuit de-energized. All conveyor motion halted.
            </p>
            <button
              onClick={() => dispatch({ type: 'RESET_ESTOP_COMMAND' })}
              className="mt-3 px-4 py-2 bg-[#C62828] hover:bg-[#B71C1C] text-white font-bold text-xs rounded-md shadow-xs cursor-pointer transition-colors min-h-[44px]"
            >
              Twist &amp; Reset E-Stop
            </button>
          </div>
        )}

        {/* CONVEYOR JAM OVERLAY - Flat clean warning card */}
        {isJammed && !isEstop && (
          <div className="absolute left-3 right-3 sm:left-1/4 sm:right-1/4 top-1/2 -translate-y-1/2 bg-[#FFF8E1] border-2 border-[#D98200] p-3 sm:p-4 rounded-lg shadow-sm flex items-center justify-between gap-2 z-40">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-6 h-6 text-[#D98200] shrink-0" />
              <div>
                <div className="text-xs sm:text-sm font-bold text-[#1F2933]">Conveyor Jam Detected</div>
                <div className="text-[11px] text-[#52606D]">Optical sensor blocked &gt; 3.0s. Motor stopped.</div>
              </div>
            </div>
            <button
              onClick={() => {
                dispatch({ type: 'INJECT_FAULT', fault: 'jam', value: false });
                dispatch({ type: 'RESET_FAULT_COMMAND' });
              }}
              className="px-3 py-2 bg-[#3B4651] hover:bg-[#2D363F] text-white font-bold text-xs rounded-md cursor-pointer transition-colors shrink-0 min-h-[44px]"
            >
              Clear &amp; Reset
            </button>
          </div>
        )}

      </div>

      {/* 5. MOBILE BINS SECTION (<md): Sits cleanly below the belt on phone */}
      <div className="md:hidden grid grid-cols-3 gap-2 mt-3">
        
        {/* Mobile BIN A Card */}
        <div className="bg-[#F2F5F0] border-2 border-[#6B7A5A] rounded-lg p-2 flex flex-col justify-between">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#6B7A5A]" />
            <span className="text-[11px] font-bold text-[#6B7A5A] truncate">Bin A</span>
          </div>
          <span className="text-[9px] text-[#52606D]">500ml Clear</span>
          <div className="flex items-baseline justify-between my-0.5">
            <span className="text-xl font-extrabold text-[#1F2933] font-tag">
              {counters.categoryA}
            </span>
          </div>
          <div className="w-full bg-[#D5DBE1] h-1 rounded-full overflow-hidden">
            <div 
              className="bg-[#6B7A5A] h-full" 
              style={{ width: `${Math.min(100, (counters.categoryA % 50) * 2)}%` }} 
            />
          </div>
        </div>

        {/* Mobile BIN B Card */}
        <div className="bg-[#FDF6E9] border-2 border-[#B7791F] rounded-lg p-2 flex flex-col justify-between">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#B7791F]" />
            <span className="text-[11px] font-bold text-[#B7791F] truncate">Bin B</span>
          </div>
          <span className="text-[9px] text-[#52606D]">1000ml Amber</span>
          <div className="flex items-baseline justify-between my-0.5">
            <span className="text-xl font-extrabold text-[#1F2933] font-tag">
              {counters.categoryB}
            </span>
          </div>
          <div className="w-full bg-[#D5DBE1] h-1 rounded-full overflow-hidden">
            <div 
              className="bg-[#B7791F] h-full" 
              style={{ width: `${Math.min(100, (counters.categoryB % 50) * 2)}%` }} 
            />
          </div>
        </div>

        {/* Mobile REJECT Card */}
        <div className="bg-white border border-[#D5DBE1] rounded-lg p-2 flex flex-col justify-between">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#C62828]" />
            <span className="text-[11px] font-bold text-[#1F2933] truncate">Reject</span>
          </div>
          <span className="text-[9px] text-[#52606D]">Defects</span>
          <div className="flex items-baseline justify-between my-0.5">
            <span className="text-xl font-extrabold text-[#1F2933] font-tag">
              {counters.rejectedCount}
            </span>
          </div>
          <div className="w-full bg-[#D5DBE1] h-1 rounded-full overflow-hidden">
            <div 
              className="bg-[#C62828] h-full" 
              style={{ width: `${Math.min(100, (counters.rejectedCount % 50) * 2)}%` }} 
            />
          </div>
        </div>

      </div>

    </div>
  );
};
