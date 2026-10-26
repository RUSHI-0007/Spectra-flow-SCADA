// ============================================================================
// Page 3: Equipment & Sensor Monitoring (Light Industrial HMI Theme)
// Motor diagnostics, thermodynamics, PT100 temperature curve, sensors
// Accent: graphite #3B4651, neutral cards, state colors only
// ============================================================================

import React from 'react';
import { 
  Cpu, 
  Zap, 
  Thermometer, 
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
    <div className="space-y-4 md:space-y-5 animate-in fade-in duration-150 w-full">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#D5DBE1]">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-[#1F2933] flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#3B4651]" />
            Equipment &amp; Sensor Telemetry
          </h1>
          <p className="text-xs text-[#52606D] mt-0.5">
            Drive motor thermodynamics, photoelectric optoelectronic signals, and pneumatic actuation
          </p>
        </div>

        <span className="text-xs bg-white border border-[#D5DBE1] text-[#52606D] px-3 py-1 rounded-lg font-medium shadow-xs">
          Modeled equipment simulation
        </span>
      </div>

      {/* Row 1: Motor & VFD Telemetry Deep-Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5">
        
        {/* Motor Physical Status (Cols 1-5) */}
        <div className="lg:col-span-5 bg-white border border-[#D5DBE1] rounded-lg p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#D5DBE1] pb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#3B4651]" />
              <h3 className="text-xs font-semibold text-[#1F2933]">
                Drive motor MTR-01
              </h3>
              <HelpTooltip term="VFD Drive" explanation="Variable Frequency Drive controller regulating motor frequency, RPM, and speed setpoints." />
            </div>
            <span className={`text-xs px-2.5 py-0.5 rounded-md font-semibold ${
              isOverload ? 'bg-[#FFEBEE] text-[#C62828] border border-[#EF9A9A]' :
              motor.runCommand ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7]' :
              'bg-[#F0F2F5] text-[#6B7785] border border-[#CBD2D9]'
            }`}>
              {isOverload ? 'Overload Trip' : motor.runCommand ? 'Energized' : 'De-energized'}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2.5 bg-[#F5F6F8] rounded-lg border border-[#E4E7EB]">
              <span className="text-[#52606D]">Motor Model:</span>
              <span className="text-[#1F2933] font-medium">Modeled: Siemens 1LE1 4-Pole AC</span>
            </div>

            <div className="flex justify-between p-2.5 bg-[#F5F6F8] rounded-lg border border-[#E4E7EB]">
              <span className="text-[#52606D]">VFD Inverter Frequency:</span>
              <span className="text-[#1F2933] font-bold font-tag">{motor.frequencyHz} Hz (Target: {motor.targetSpeedMs} m/s)</span>
            </div>

            <div className="flex justify-between p-2.5 bg-[#F5F6F8] rounded-lg border border-[#E4E7EB]">
              <span className="text-[#52606D]">Rotor Angular Speed:</span>
              <span className="text-[#1F2933] font-bold font-tag">{motor.rpm} RPM</span>
            </div>

            <div className="flex justify-between p-2.5 bg-[#F5F6F8] rounded-lg border border-[#E4E7EB]">
              <span className="text-[#52606D]">RMS Phase Current:</span>
              <span className={`font-tag font-bold ${motor.currentAmps > 14 ? 'text-[#C62828]' : 'text-[#D98200]'}`}>
                {motor.currentAmps} A (Rating: 12.5A)
              </span>
            </div>

            <div className="flex justify-between p-2.5 bg-[#F5F6F8] rounded-lg border border-[#E4E7EB]">
              <span className="text-[#52606D]">Winding Temperature:</span>
              <span className={`font-tag font-bold ${motor.temperatureC > 75 ? 'text-[#C62828]' : 'text-[#1F2933]'}`}>
                {motor.temperatureC}°C (Trip: {state.settings.motorOverloadThresholdC}°C)
              </span>
            </div>

            <div className="flex justify-between p-2.5 bg-[#F5F6F8] rounded-lg border border-[#E4E7EB]">
              <span className="text-[#52606D]">Mechanical Load:</span>
              <span className="text-[#1F2933] font-bold font-tag">{motor.loadPercent}% of rated torque</span>
            </div>

            <div className="flex justify-between p-2.5 bg-[#F5F6F8] rounded-lg border border-[#E4E7EB]">
              <span className="text-[#52606D]">Cooling Fan:</span>
              <span className={`font-semibold flex items-center gap-1.5 ${motor.coolingFanRunning ? 'text-[#2E7D32]' : 'text-[#6B7785]'}`}>
                <Fan className={`w-3.5 h-3.5 ${motor.coolingFanRunning ? 'animate-spin' : ''}`} />
                {motor.coolingFanRunning ? 'Active (>50°C)' : 'Standby'}
              </span>
            </div>
          </div>

          <button
            onClick={() => dispatch({ type: 'INJECT_FAULT', fault: 'motorOverload', value: !activeFaults.motorOverload })}
            className="w-full py-2 rounded-lg bg-white hover:bg-[#F5F6F8] text-[#1F2933] border border-[#D5DBE1] text-xs font-semibold transition-colors cursor-pointer min-h-[44px]"
          >
            {activeFaults.motorOverload ? 'Clear Overload Condition' : 'Simulate Motor Overload (>80°C)'}
          </button>
        </div>

        {/* Live Sparkline Trends (Cols 6-12) */}
        <div className="lg:col-span-7 bg-white border border-[#D5DBE1] rounded-lg p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#D5DBE1] pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-[#D98200]" />
                <h3 className="text-xs font-semibold text-[#1F2933]">
                  Live thermal and temperature trend
                </h3>
                <HelpTooltip term="PT100 RTD Sensor" explanation="Precision platinum resistance thermometer embedded in the motor stator windings." />
              </div>
              <span className="text-xs text-[#52606D] font-tag bg-[#F5F6F8] px-2 py-0.5 rounded border border-[#E4E7EB]">
                PT100 Telemetry
              </span>
            </div>

            {/* Muted line color in graphite #3B4651, light grid lines, no gradient fills */}
            <div className="w-full h-56 sm:h-64 bg-[#F5F6F8] rounded-lg p-2 border border-[#E4E7EB]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={productionHistory.slice(-25)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4E7EB" />
                  <XAxis dataKey="timeStr" stroke="#9AA5B1" tick={{ fontSize: 10, fill: '#52606D' }} />
                  <YAxis stroke="#9AA5B1" tick={{ fontSize: 10, fill: '#52606D' }} domain={[20, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD2D9', borderRadius: 8, fontSize: 12, color: '#1F2933', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                  />
                  <Line type="monotone" dataKey="motorTempC" stroke="#3B4651" strokeWidth={2} dot={false} name="Motor Temp (°C)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-[#D5DBE1] flex flex-wrap justify-between gap-1 text-xs text-[#52606D]">
            <span>Thermal Equilibrium: 40°C - 65°C under nominal load</span>
            <span className="text-[#D98200] font-semibold font-tag">Trip Threshold: 80°C</span>
          </div>
        </div>

      </div>

      {/* Row 2: Sensors & Actuators Monitoring Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        
        {/* Sensor S-01 Card */}
        <div className="bg-white border border-[#D5DBE1] rounded-lg p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#D5DBE1] pb-2">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#3B4651]" />
              <h3 className="text-xs font-semibold text-[#1F2933]">
                Optical sensor S-01
              </h3>
            </div>
            <span className={`text-[11px] px-2 py-0.5 rounded-md font-semibold ${
              sensor.active ? 'bg-[#FFEBEE] text-[#C62828] border border-[#EF9A9A]' : 'bg-[#F0F2F5] text-[#6B7785] border border-[#CBD2D9]'
            }`}>
              {sensor.active ? 'Beam Broken (1)' : 'Beam Clear (0)'}
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-[#52606D]">
              <span>PLC Tag:</span>
              <span className="text-[#1F2933] font-tag">{sensor.tag}</span>
            </div>
            <div className="flex justify-between text-[#52606D]">
              <span>Sensor Type:</span>
              <span className="text-[#1F2933]">Retroreflective Photoelectric</span>
            </div>
            <div className="flex justify-between text-[#52606D]">
              <span>Position on Track:</span>
              <span className="text-[#1F2933] font-tag">{sensor.position} mm (35% mark)</span>
            </div>
            <div className="flex justify-between text-[#52606D]">
              <span>Cumulative Detections:</span>
              <span className="text-[#1F2933] font-tag font-bold">{sensor.detectionCount} items</span>
            </div>
            <div className="flex justify-between text-[#52606D]">
              <span>Optical Condition:</span>
              <span className={activeFaults.sensorMalfunction ? 'text-[#D98200] font-semibold' : 'text-[#2E7D32] font-semibold'}>
                {activeFaults.sensorMalfunction ? 'Dirty / Intermittent' : 'Clean & Aligned'}
              </span>
            </div>
          </div>

          <button
            onClick={() => dispatch({ type: 'INJECT_FAULT', fault: 'sensorMalfunction', value: !activeFaults.sensorMalfunction })}
            className="w-full py-2 rounded-lg bg-white hover:bg-[#F5F6F8] text-[#1F2933] border border-[#D5DBE1] text-xs font-medium transition-colors cursor-pointer min-h-[44px]"
          >
            {activeFaults.sensorMalfunction ? 'Clear Sensor Error' : 'Simulate Dirty Lens'}
          </button>
        </div>

        {/* Diverter Actuator SOL-01 Card */}
        <div className="bg-white border border-[#D5DBE1] rounded-lg p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#D5DBE1] pb-2">
            <div className="flex items-center gap-2">
              <HandMetal className="w-4 h-4 text-[#B7791F]" />
              <h3 className="text-xs font-semibold text-[#1F2933]">
                Pneumatic diverter SOL-01
              </h3>
            </div>
            <span className={`text-[11px] px-2 py-0.5 rounded-md font-semibold ${
              diverter.actuated ? 'bg-[#FDF6E9] text-[#B7791F] border border-[#E8D4B4]' : 'bg-[#F0F2F5] text-[#6B7785] border border-[#CBD2D9]'
            }`}>
              {diverter.actuated ? 'Extended (1)' : 'Retracted (0)'}
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-[#52606D]">
              <span>PLC Tag:</span>
              <span className="text-[#1F2933] font-tag">{diverter.tag}</span>
            </div>
            <div className="flex justify-between text-[#52606D]">
              <span>Cylinder Type:</span>
              <span className="text-[#1F2933]">Modeled: Festo Double-Acting</span>
            </div>
            <div className="flex justify-between text-[#52606D]">
              <span>Stroke Position:</span>
              <span className="text-[#B7791F] font-tag font-bold">{diverter.positionPercent}% Stroke</span>
            </div>
            <div className="flex justify-between text-[#52606D]">
              <span>Total Actuations:</span>
              <span className="text-[#1F2933] font-tag">{diverter.strokeCount} strokes</span>
            </div>
            <div className="flex justify-between text-[#52606D]">
              <span>Regulated Pressure:</span>
              <span className="text-[#2E7D32] font-tag font-semibold">6.2 Bar</span>
            </div>
          </div>

          <button
            onClick={() => dispatch({ type: 'MANUAL_TRIGGER_DIVERTER' })}
            className="w-full py-2 rounded-lg bg-white hover:bg-[#F5F6F8] text-[#3B4651] border border-[#D5DBE1] text-xs font-semibold transition-colors cursor-pointer min-h-[44px]"
          >
            Test Pneumatic Stroke
          </button>
        </div>

        {/* E-Stop Loop Card */}
        <div className="bg-white border border-[#D5DBE1] rounded-lg p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#D5DBE1] pb-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#C62828]" />
              <h3 className="text-xs font-semibold text-[#1F2933]">
                Emergency stop circuit
              </h3>
            </div>
            <span className={`text-[11px] px-2 py-0.5 rounded-md font-semibold ${
              isEstop ? 'bg-[#FFEBEE] text-[#C62828] border border-[#EF9A9A]' : 'bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7]'
            }`}>
              {isEstop ? 'Circuit Open' : 'Circuit Closed (OK)'}
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-[#52606D]">
              <span>Input Tag:</span>
              <span className="text-[#1F2933] font-tag">%IX0.0_ESTOP</span>
            </div>
            <div className="flex justify-between text-[#52606D]">
              <span>Safety Relay:</span>
              <span className="text-[#1F2933]">Modeled: Pilz PNOZ Dual-Channel</span>
            </div>
            <div className="flex justify-between text-[#52606D]">
              <span>Button Type:</span>
              <span className="text-[#1F2933]">Mushroom Palm Twist-Release</span>
            </div>
            <div className="flex justify-between text-[#52606D]">
              <span>Response Time:</span>
              <span className="text-[#2E7D32] font-tag">&lt; 15 ms</span>
            </div>
            <div className="flex justify-between text-[#52606D]">
              <span>Interlock State:</span>
              <span className={isEstop ? 'text-[#C62828] font-bold' : 'text-[#2E7D32] font-semibold'}>
                {isEstop ? 'Tripped - Restart Inhibited' : 'Healthy'}
              </span>
            </div>
          </div>

          <button
            onClick={() => dispatch({ type: isEstop ? 'RESET_ESTOP_COMMAND' : 'ESTOP_COMMAND' })}
            className={`w-full py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer min-h-[44px] ${
              isEstop
                ? 'bg-[#3B4651] hover:bg-[#2D363F] text-white border-[#3B4651]'
                : 'bg-[#FFEBEE] hover:bg-[#FFCDD2] text-[#C62828] border-[#EF9A9A]'
            }`}
          >
            {isEstop ? 'Reset E-Stop Safety Relay' : 'Actuate Emergency Stop Button'}
          </button>
        </div>

      </div>

    </div>
  );
};
