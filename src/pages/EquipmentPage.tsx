// ============================================================================
// Page 3: Equipment & Sensor Monitoring
// Motor diagnostics, thermodynamics, PT100 temperature curve, sensors
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
  ShieldAlert
} from 'lucide-react';
import { useScada } from '../context/ScadaContext';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { HelpTooltip } from '../components/common/HelpTooltip';

export const EquipmentPage: React.FC = () => {
  const { state, dispatch } = useScada();
  const { motor, sensor, diverter, productionHistory, activeFaults, machineState } = state;

  const isOverload = activeFaults.motorOverload || motor.temperatureC >= 80;
  const isEstop = machineState === 'EMERGENCY_STOP' || activeFaults.emergencyStop;

  return (
    <div className="space-y-5 animate-in fade-in duration-150 w-full">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-500" />
            Equipment &amp; Sensor Telemetry
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Drive motor thermodynamics, photoelectric optoelectronic signals, and pneumatic actuation
          </p>
        </div>

        <span className="text-xs bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1 rounded-lg font-medium">
          Modeled equipment simulation
        </span>
      </div>

      {/* Row 1: Motor & VFD Telemetry Deep-Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Motor Physical Status (Cols 1-5) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-semibold text-white">
                Drive motor MTR-01
              </h3>
              <HelpTooltip term="VFD Drive" explanation="Variable Frequency Drive controller regulating motor frequency, RPM, and speed setpoints." />
            </div>
            <span className={`text-xs px-2.5 py-0.5 rounded-md font-semibold ${
              isOverload ? 'bg-red-950 text-red-300 border border-red-500' :
              motor.runCommand ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
              'bg-slate-800 text-slate-400'
            }`}>
              {isOverload ? 'Overload Trip' : motor.runCommand ? 'Energized' : 'De-energized'}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800/80">
              <span className="text-slate-400">Motor Model:</span>
              <span className="text-slate-200 font-medium">Modeled: Siemens 1LE1 4-Pole AC</span>
            </div>

            <div className="flex justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800/80">
              <span className="text-slate-400">VFD Inverter Frequency:</span>
              <span className="text-blue-300 font-bold font-tag">{motor.frequencyHz} Hz (Target: {motor.targetSpeedMs} m/s)</span>
            </div>

            <div className="flex justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800/80">
              <span className="text-slate-400">Rotor Angular Speed:</span>
              <span className="text-slate-200 font-bold font-tag">{motor.rpm} RPM</span>
            </div>

            <div className="flex justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800/80">
              <span className="text-slate-400">RMS Phase Current:</span>
              <span className={`font-tag font-bold ${motor.currentAmps > 14 ? 'text-red-400' : 'text-amber-400'}`}>
                {motor.currentAmps} A (Rating: 12.5A)
              </span>
            </div>

            <div className="flex justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800/80">
              <span className="text-slate-400">Winding Temperature:</span>
              <span className={`font-tag font-bold ${motor.temperatureC > 75 ? 'text-red-400' : 'text-slate-200'}`}>
                {motor.temperatureC}°C (Trip: {state.settings.motorOverloadThresholdC}°C)
              </span>
            </div>

            <div className="flex justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800/80">
              <span className="text-slate-400">Mechanical Load:</span>
              <span className="text-slate-200 font-bold font-tag">{motor.loadPercent}% of rated torque</span>
            </div>

            <div className="flex justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800/80">
              <span className="text-slate-400">Cooling Fan:</span>
              <span className={`font-semibold flex items-center gap-1.5 ${motor.coolingFanRunning ? 'text-emerald-400' : 'text-slate-500'}`}>
                <Fan className={`w-3.5 h-3.5 ${motor.coolingFanRunning ? 'animate-spin' : ''}`} />
                {motor.coolingFanRunning ? 'Active (>50°C)' : 'Standby'}
              </span>
            </div>
          </div>

          <button
            onClick={() => dispatch({ type: 'INJECT_FAULT', fault: 'motorOverload', value: !activeFaults.motorOverload })}
            className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            {activeFaults.motorOverload ? 'Clear Overload Condition' : 'Simulate Motor Overload (>80°C)'}
          </button>
        </div>

        {/* Live Sparkline Trends (Cols 6-12) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-semibold text-white">
                  Live thermal and temperature trend
                </h3>
                <HelpTooltip term="PT100 RTD Sensor" explanation="Precision platinum resistance thermometer embedded in the motor stator windings." />
              </div>
              <span className="text-xs text-slate-400 font-tag bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                PT100 Telemetry
              </span>
            </div>

            <div className="w-full h-64 bg-slate-950 rounded-xl p-2 border border-slate-800/80">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={productionHistory.slice(-25)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="timeStr" stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} domain={[20, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 12 }}
                  />
                  <Line type="monotone" dataKey="motorTempC" stroke="#f59e0b" strokeWidth={2} dot={false} name="Motor Temp (°C)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800 flex justify-between text-xs text-slate-400">
            <span>Thermal Equilibrium: 40°C - 65°C under nominal load</span>
            <span className="text-amber-400 font-semibold font-tag">Trip Threshold: 80°C</span>
          </div>
        </div>

      </div>

      {/* Row 2: Sensors & Actuators Monitoring Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Sensor S-01 Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-semibold text-white">
                Optical sensor S-01
              </h3>
            </div>
            <span className={`text-[11px] px-2 py-0.5 rounded-md font-semibold ${
              sensor.active ? 'bg-blue-950 text-blue-300 border border-blue-500' : 'bg-slate-800 text-slate-400'
            }`}>
              {sensor.active ? 'Beam Broken (1)' : 'Beam Clear (0)'}
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>PLC Tag:</span>
              <span className="text-slate-200 font-tag">{sensor.tag}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Sensor Type:</span>
              <span className="text-slate-200">Retroreflective Photoelectric</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Position on Track:</span>
              <span className="text-slate-200 font-tag">{sensor.position} mm (35% mark)</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Cumulative Detections:</span>
              <span className="text-blue-300 font-tag font-bold">{sensor.detectionCount} items</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Optical Condition:</span>
              <span className={activeFaults.sensorMalfunction ? 'text-amber-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                {activeFaults.sensorMalfunction ? 'Dirty / Intermittent' : 'Clean & Aligned'}
              </span>
            </div>
          </div>

          <button
            onClick={() => dispatch({ type: 'INJECT_FAULT', fault: 'sensorMalfunction', value: !activeFaults.sensorMalfunction })}
            className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition-colors cursor-pointer"
          >
            {activeFaults.sensorMalfunction ? 'Clear Sensor Error' : 'Simulate Dirty Lens'}
          </button>
        </div>

        {/* Diverter Actuator SOL-01 Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <HandMetal className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-semibold text-white">
                Pneumatic diverter SOL-01
              </h3>
            </div>
            <span className={`text-[11px] px-2 py-0.5 rounded-md font-semibold ${
              diverter.actuated ? 'bg-amber-950 text-amber-300 border border-amber-500' : 'bg-slate-800 text-slate-400'
            }`}>
              {diverter.actuated ? 'Extended (1)' : 'Retracted (0)'}
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>PLC Tag:</span>
              <span className="text-slate-200 font-tag">{diverter.tag}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Cylinder Type:</span>
              <span className="text-slate-200">Modeled: Festo Double-Acting</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Stroke Position:</span>
              <span className="text-amber-300 font-tag font-bold">{diverter.positionPercent}% Stroke</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Total Actuations:</span>
              <span className="text-slate-200 font-tag">{diverter.strokeCount} strokes</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Regulated Pressure:</span>
              <span className="text-emerald-400 font-tag font-semibold">6.2 Bar</span>
            </div>
          </div>

          <button
            onClick={() => dispatch({ type: 'MANUAL_TRIGGER_DIVERTER' })}
            className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            Test Pneumatic Stroke
          </button>
        </div>

        {/* E-Stop Loop Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <h3 className="text-xs font-semibold text-white">
                Emergency stop circuit
              </h3>
            </div>
            <span className={`text-[11px] px-2 py-0.5 rounded-md font-semibold ${
              isEstop ? 'bg-red-950 text-red-200 border border-red-500' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
            }`}>
              {isEstop ? 'Circuit Open' : 'Circuit Closed (OK)'}
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Input Tag:</span>
              <span className="text-slate-200 font-tag">%IX0.0_ESTOP</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Safety Relay:</span>
              <span className="text-slate-200">Modeled: Pilz PNOZ Dual-Channel</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Button Type:</span>
              <span className="text-slate-200">Mushroom Palm Twist-Release</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Response Time:</span>
              <span className="text-emerald-400 font-tag">&lt; 15 ms</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Interlock State:</span>
              <span className={isEstop ? 'text-red-400 font-bold' : 'text-emerald-400 font-semibold'}>
                {isEstop ? 'Tripped - Restart Inhibited' : 'Healthy'}
              </span>
            </div>
          </div>

          <button
            onClick={() => dispatch({ type: isEstop ? 'RESET_ESTOP_COMMAND' : 'ESTOP_COMMAND' })}
            className={`w-full py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              isEstop
                ? 'bg-blue-600 hover:bg-blue-500 text-white border-blue-400'
                : 'bg-red-950 hover:bg-red-900 text-red-200 border-red-800'
            }`}
          >
            {isEstop ? 'Reset E-Stop Safety Relay' : 'Actuate Emergency Stop Button'}
          </button>
        </div>

      </div>

    </div>
  );
};
