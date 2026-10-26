// ============================================================================
// Page 3: Equipment and Sensor Monitoring
// Motor diagnostics, thermodynamics, PT100 temperature curve, load sparklines, sensors
// Notice: Clearly labeled as SIMULATED values.
// ============================================================================

import React from 'react';
import { 
  Cpu, 
  Zap, 
  Thermometer, 
  Activity, 
  Fan, 
  Radio, 
  HandMetal, 
  ShieldAlert, 
  Clock,
  RotateCw
} from 'lucide-react';
import { useScada } from '../context/ScadaContext';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const EquipmentPage: React.FC = () => {
  const { state, dispatch } = useScada();
  const { motor, sensor, diverter, productionHistory, activeFaults, machineState } = state;

  const isOverload = activeFaults.motorOverload || motor.temperatureC >= 80;
  const isEstop = machineState === 'EMERGENCY_STOP' || activeFaults.emergencyStop;

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-black font-mono text-white uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            Equipment & Sensor Telemetry Suite
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Drive motor thermodynamics, photoelectric optoelectronic signals, and pneumatic actuation
          </p>
        </div>

        <span className="text-xs bg-amber-950 border border-amber-600 text-amber-300 px-3 py-1 rounded font-mono font-bold">
          ALL SENSOR & MOTOR VALUES ARE SIMULATED
        </span>
      </div>

      {/* Row 1: Motor & VFD Telemetry Deep-Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Motor Physical Status (Cols 1-5) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
                Drive Motor MTR-01 Specifications
              </h3>
            </div>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
              isOverload ? 'bg-red-950 text-red-300 border border-red-800 alarm-flash' :
              motor.runCommand ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
              'bg-slate-800 text-slate-400'
            }`}>
              {isOverload ? 'OVERLOAD TRIP' : motor.runCommand ? 'ENERGIZED' : 'DE-ENERGIZED'}
            </span>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex justify-between p-2 bg-slate-950 rounded border border-slate-800">
              <span className="text-slate-400">Motor Model:</span>
              <span className="text-slate-200 font-bold">Siemens 1LE1 4-Pole 3-Phase AC</span>
            </div>

            <div className="flex justify-between p-2 bg-slate-950 rounded border border-slate-800">
              <span className="text-slate-400">VFD Inverter Frequency:</span>
              <span className="text-cyan-300 font-bold">{motor.frequencyHz} Hz (Target: {motor.targetSpeedMs} m/s)</span>
            </div>

            <div className="flex justify-between p-2 bg-slate-950 rounded border border-slate-800">
              <span className="text-slate-400">Rotor Angular Speed:</span>
              <span className="text-slate-200 font-bold">{motor.rpm} RPM</span>
            </div>

            <div className="flex justify-between p-2 bg-slate-950 rounded border border-slate-800">
              <span className="text-slate-400">RMS Phase Current:</span>
              <span className={`font-bold ${motor.currentAmps > 14 ? 'text-red-400' : 'text-yellow-400'}`}>
                {motor.currentAmps} A (FLA Rating: 12.5A)
              </span>
            </div>

            <div className="flex justify-between p-2 bg-slate-950 rounded border border-slate-800">
              <span className="text-slate-400">Stator Winding Temperature:</span>
              <span className={`font-bold ${motor.temperatureC > 75 ? 'text-red-400' : 'text-orange-300'}`}>
                {motor.temperatureC}°C (Trip Threshold: {state.settings.motorOverloadThresholdC}°C)
              </span>
            </div>

            <div className="flex justify-between p-2 bg-slate-950 rounded border border-slate-800">
              <span className="text-slate-400">Shaft Mechanical Load:</span>
              <span className="text-slate-200 font-bold">{motor.loadPercent}% of Rated Torque</span>
            </div>

            <div className="flex justify-between p-2 bg-slate-950 rounded border border-slate-800">
              <span className="text-slate-400">Forced Cooling Fan:</span>
              <span className={`font-bold flex items-center gap-1 ${motor.coolingFanRunning ? 'text-emerald-400' : 'text-slate-500'}`}>
                <Fan className={`w-3.5 h-3.5 ${motor.coolingFanRunning ? 'animate-spin' : ''}`} />
                {motor.coolingFanRunning ? 'ACTIVE (>50°C)' : 'STANDBY'}
              </span>
            </div>
          </div>

          <button
            onClick={() => dispatch({ type: 'INJECT_FAULT', fault: 'motorOverload', value: !activeFaults.motorOverload })}
            className="w-full py-2 rounded bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/50 font-mono text-xs font-bold transition-colors cursor-pointer"
          >
            {activeFaults.motorOverload ? 'Clear Overload Condition' : 'Test Motor Overload Trip (>80°C / >15A)'}
          </button>
        </div>

        {/* Live Sparkline Trends (Cols 6-12) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-orange-400" />
                <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
                  Live Thermal & Electrical Load Trends
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                PT100 RTD Sensor Simulation
              </span>
            </div>

            <div className="w-full h-64 bg-slate-950 rounded-lg p-2 border border-slate-800">
              {productionHistory.length < 2 ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 font-mono text-xs">
                  <Activity className="w-8 h-8 text-slate-600 mb-2 animate-pulse" />
                  <span>Gathering motor telemetry points...</span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={productionHistory.slice(-25)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="timeStr" stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} domain={[20, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 12, fontFamily: 'monospace' }}
                    />
                    <Line type="monotone" dataKey="motorTempC" stroke="#f97316" strokeWidth={2} dot={false} name="Motor Temp (°C)" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800 flex justify-between text-[11px] font-mono text-slate-400">
            <span>Thermal Equilibrium: 40°C - 65°C under normal load</span>
            <span className="text-orange-400 font-bold">Trip Threshold: 80°C</span>
          </div>
        </div>

      </div>

      {/* Row 2: Sensors & Actuators Monitoring Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Sensor S-01 Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold font-mono text-white uppercase">
                Sensor Station S-01
              </h3>
            </div>
            <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold ${
              sensor.active ? 'bg-cyan-950 text-cyan-300 border border-cyan-500 led-glow-blue' : 'bg-slate-800 text-slate-400'
            }`}>
              {sensor.active ? 'BEAM BROKEN (1)' : 'BEAM CLEAR (0)'}
            </span>
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-slate-400">
              <span>PLC Tag:</span>
              <span className="text-slate-200 font-bold">{sensor.tag}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Sensor Type:</span>
              <span className="text-slate-200">Retroreflective Photoelectric</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Position on Track:</span>
              <span className="text-slate-200">{sensor.position} mm (35% mark)</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Cumulative Detections:</span>
              <span className="text-cyan-300 font-bold">{sensor.detectionCount} items</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Optical Condition:</span>
              <span className={activeFaults.sensorMalfunction ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                {activeFaults.sensorMalfunction ? 'ERRATIC / DIRTY LENS' : 'CLEAN & ALIGNED'}
              </span>
            </div>
          </div>

          <button
            onClick={() => dispatch({ type: 'INJECT_FAULT', fault: 'sensorMalfunction', value: !activeFaults.sensorMalfunction })}
            className="w-full py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-mono text-[11px] font-semibold transition-colors cursor-pointer"
          >
            {activeFaults.sensorMalfunction ? 'Clear Sensor Error' : 'Simulate Dirty / Erratic Sensor'}
          </button>
        </div>

        {/* Diverter Actuator SOL-01 Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <HandMetal className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold font-mono text-white uppercase">
                Pneumatic Diverter SOL-01
              </h3>
            </div>
            <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold ${
              diverter.actuated ? 'bg-amber-950 text-amber-300 border border-amber-500 led-glow-amber' : 'bg-slate-800 text-slate-400'
            }`}>
              {diverter.actuated ? 'EXTENDED (%QX0.1=1)' : 'RETRACTED (%QX0.1=0)'}
            </span>
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-slate-400">
              <span>PLC Tag:</span>
              <span className="text-slate-200 font-bold">{diverter.tag}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Cylinder Type:</span>
              <span className="text-slate-200">Festo Double-Acting Pneumatic</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Stroke Position:</span>
              <span className="text-amber-300 font-bold">{diverter.positionPercent}% Stroke</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Total Actuation Cycles:</span>
              <span className="text-slate-200 font-bold">{diverter.strokeCount} strokes</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Operating Pressure:</span>
              <span className="text-emerald-400 font-bold">6.2 Bar (Regulated)</span>
            </div>
          </div>

          <button
            onClick={() => dispatch({ type: 'MANUAL_TRIGGER_DIVERTER' })}
            className="w-full py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-600/50 font-mono text-[11px] font-semibold transition-colors cursor-pointer"
          >
            Manual Pneumatic Solenoid Test Stroke
          </button>
        </div>

        {/* E-Stop Loop Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <h3 className="text-xs font-bold font-mono text-white uppercase">
                Emergency Stop Safety Circuit
              </h3>
            </div>
            <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold ${
              isEstop ? 'bg-red-950 text-red-200 border border-red-500 alarm-flash' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
            }`}>
              {isEstop ? 'CIRCUIT OPEN' : 'CIRCUIT CLOSED (OK)'}
            </span>
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Input Tag:</span>
              <span className="text-slate-200 font-bold">%IX0.0_ESTOP</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Safety Relay:</span>
              <span className="text-slate-200">Pilz PNOZ Dual-Channel</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Button Type:</span>
              <span className="text-slate-200">Mushroom Palm Twist-Release</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Response Time:</span>
              <span className="text-emerald-400 font-bold">&lt; 15 ms (Hardwired)</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Interlock State:</span>
              <span className={isEstop ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                {isEstop ? 'TRIPPED - RESTART INHIBITED' : 'HEALTHY'}
              </span>
            </div>
          </div>

          <button
            onClick={() => dispatch({ type: isEstop ? 'RESET_ESTOP_COMMAND' : 'ESTOP_COMMAND' })}
            className={`w-full py-1.5 rounded font-mono text-[11px] font-bold border transition-colors cursor-pointer ${
              isEstop
                ? 'bg-blue-600 hover:bg-blue-500 text-white border-blue-400'
                : 'bg-red-950 hover:bg-red-900 text-red-200 border-red-600'
            }`}
          >
            {isEstop ? 'Reset E-Stop Safety Relay' : 'Actuate Emergency Stop Button'}
          </button>
        </div>

      </div>

    </div>
  );
};
