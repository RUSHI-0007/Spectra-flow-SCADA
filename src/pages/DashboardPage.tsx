// ============================================================================
// Page 1: Overview Dashboard
// Light Industrial HMI Aesthetic: Calm, neutral, high-contrast, technical
// Accent: graphite #3B4651. Color is reserved strictly for machine state signaling.
// ============================================================================

import React from 'react';
import { 
  Activity, 
  Bell, 
  Cpu, 
  ArrowRight 
} from 'lucide-react';
import { useScada } from '../context/ScadaContext';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { HelpTooltip } from '../components/common/HelpTooltip';

export const DashboardPage: React.FC = () => {
  const { state, dispatch } = useScada();
  const { counters, motor, machineState, alarms, productionHistory } = state;

  const unackAlarms = alarms.filter(a => a.state === 'ACTIVE_UNACK');
  const activeAlarms = alarms.filter(a => a.state === 'ACTIVE_UNACK' || a.state === 'ACTIVE_ACK');

  const formatUptime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const hrs = Math.floor(mins / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs}h ${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-4 md:space-y-5 animate-in fade-in duration-150 w-full">
      
      {/* Page Title & Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#D5DBE1]">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-[#1F2933] flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#3B4651]" />
            Packaging Line Overview Dashboard
          </h1>
          <p className="text-xs text-[#52606D] mt-0.5">
            Supervisory monitoring of conveyor throughput, sorting distribution, and drive telemetry
          </p>
        </div>

        <button
          onClick={() => dispatch({ type: 'SET_PAGE', page: 'simulation' })}
          className="px-3.5 py-2 rounded-lg bg-[#3B4651] hover:bg-[#2D363F] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs min-h-[44px]"
        >
          <span>Open Live Conveyor</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 8 Primary KPI Metric Cards - Dark neutral numbers, state color on badge only */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        
        {/* 1. Status */}
        <div className="bg-white border border-[#D5DBE1] rounded-lg p-3 shadow-xs">
          <div className="text-xs text-[#52606D] flex items-center font-medium">
            <span>Operating Status</span>
            <HelpTooltip term="Machine State" explanation="Current state of the conveyor: Idle, Starting, Running, Stopping, Fault, or Emergency Stop." />
          </div>
          <div className={`text-base md:text-lg font-bold tracking-tight my-1 truncate ${
            machineState === 'RUNNING' ? 'text-[#2E7D32]' :
            machineState === 'STARTING' || machineState === 'STOPPING' ? 'text-[#D98200]' :
            machineState === 'FAULT' || machineState === 'EMERGENCY_STOP' ? 'text-[#C62828]' : 'text-[#6B7785]'
          }`}>
            {machineState === 'RUNNING' ? 'Running' :
             machineState === 'STARTING' ? 'Starting' :
             machineState === 'STOPPING' ? 'Stopping' :
             machineState === 'FAULT' ? 'Fault Trip' :
             machineState === 'EMERGENCY_STOP' ? 'Emergency Stop' : 'Idle'}
          </div>
          <div className="text-[11px] text-[#52606D]">State engine</div>
        </div>

        {/* 2. Total Bottles */}
        <div className="bg-white border border-[#D5DBE1] rounded-lg p-3 shadow-xs">
          <div className="text-xs text-[#52606D] flex items-center font-medium">
            <span>Bottles Fed</span>
            <HelpTooltip term="Total Fed" explanation="Total bottles placed on conveyor since production counters were reset." />
          </div>
          <div className="text-xl md:text-2xl font-bold font-tag text-[#1F2933] tracking-tight my-1">
            {counters.totalInfeed}
          </div>
          <div className="text-[11px] text-[#52606D]">Infeed count</div>
        </div>

        {/* 3. Category A - Olive-grey #6B7A5A */}
        <div className="bg-white border border-[#D5DBE1] rounded-lg p-3 shadow-xs">
          <div className="text-xs text-[#52606D] flex items-center font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#6B7A5A]" />
              Bin A (500ml)
            </span>
            <HelpTooltip term="Bin A" explanation="Clear 500ml bottles that travel straight along the conveyor into Bin A." />
          </div>
          <div className="text-xl md:text-2xl font-bold font-tag text-[#1F2933] tracking-tight my-1">
            {counters.categoryA}
          </div>
          <div className="text-[11px] text-[#52606D]">Straight line</div>
        </div>

        {/* 4. Category B - Amber #B7791F */}
        <div className="bg-white border border-[#D5DBE1] rounded-lg p-3 shadow-xs">
          <div className="text-xs text-[#52606D] flex items-center font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#B7791F]" />
              Bin B (1000ml)
            </span>
            <HelpTooltip term="Bin B" explanation="Amber 1000ml bottles that are pneumatically diverted off the belt into Bin B." />
          </div>
          <div className="text-xl md:text-2xl font-bold font-tag text-[#1F2933] tracking-tight my-1">
            {counters.categoryB}
          </div>
          <div className="text-[11px] text-[#52606D]">Diverted chute</div>
        </div>

        {/* 5. Throughput Rate */}
        <div className="bg-white border border-[#D5DBE1] rounded-lg p-3 shadow-xs">
          <div className="text-xs text-[#52606D] flex items-center font-medium">
            <span>Cycle Rate</span>
            <HelpTooltip term="BPM" explanation="Bottles Per Minute: production cadence based on speed setpoint and feed interval." />
          </div>
          <div className="text-xl md:text-2xl font-bold font-tag text-[#1F2933] tracking-tight my-1">
            {counters.currentBpm} <span className="text-xs font-normal text-[#52606D]">BPM</span>
          </div>
          <div className="text-[11px] text-[#52606D]">Instant rate</div>
        </div>

        {/* 6. Belt Speed (m/s) */}
        <div className="bg-white border border-[#D5DBE1] rounded-lg p-3 shadow-xs">
          <div className="text-xs text-[#52606D] flex items-center font-medium">
            <span>Belt Speed</span>
            <HelpTooltip term="Conveyor Speed" explanation="Current linear belt velocity in meters per second, driven by the VFD." />
          </div>
          <div className="text-xl md:text-2xl font-bold font-tag text-[#1F2933] tracking-tight my-1">
            {motor.actualSpeedMs} <span className="text-xs font-normal text-[#52606D]">m/s</span>
          </div>
          <div className="text-[11px] text-[#52606D] font-tag">{motor.frequencyHz} Hz drive</div>
        </div>

        {/* 7. Active Alarms */}
        <div className={`bg-white border rounded-lg p-3 shadow-xs ${
          unackAlarms.length > 0 ? 'border-[#EF9A9A] bg-[#FFEBEE]' : 'border-[#D5DBE1]'
        }`}>
          <div className={`text-xs flex items-center font-medium ${
            unackAlarms.length > 0 ? 'text-[#C62828]' : 'text-[#52606D]'
          }`}>
            <span>Active Alarms</span>
            <HelpTooltip term="Alarms" explanation="Number of currently active alarm conditions requiring operator attention or acknowledgment." />
          </div>
          <div className={`text-xl md:text-2xl font-bold font-tag tracking-tight my-1 ${
            unackAlarms.length > 0 ? 'text-[#C62828]' : 'text-[#1F2933]'
          }`}>
            {activeAlarms.length}
          </div>
          <div className={`text-[11px] ${unackAlarms.length > 0 ? 'text-[#C62828] font-medium' : 'text-[#52606D]'}`}>
            {unackAlarms.length} unacknowledged
          </div>
        </div>

        {/* 8. Session Utilization */}
        <div className="bg-white border border-[#D5DBE1] rounded-lg p-3 shadow-xs">
          <div className="text-xs text-[#52606D] flex items-center font-medium">
            <span>Utilization</span>
            <HelpTooltip term="Utilization" explanation="Percentage of total operating time that the conveyor was actively running vs stopped or in fault." />
          </div>
          <div className="text-xl md:text-2xl font-bold font-tag text-[#1F2933] tracking-tight my-1">
            {counters.utilizationPercent}%
          </div>
          <div className="text-[11px] text-[#52606D] truncate">Up: {formatUptime(counters.uptimeSeconds)}</div>
        </div>

      </div>

      {/* Row 2: Live Production Chart & Recent Alarms */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5">
        
        {/* Live Production Chart (Cols 1-8) */}
        <div className="lg:col-span-8 bg-white border border-[#D5DBE1] rounded-lg p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#3B4651]" />
                <h3 className="text-xs font-semibold text-[#1F2933]">
                  Live production velocity and throughput
                </h3>
                <HelpTooltip term="Telemetry Trend" explanation="Real-time samples of bottles per minute (BPM) over time as the conveyor runs." />
              </div>
              <span className="text-xs text-[#52606D] bg-[#F5F6F8] px-2 py-0.5 rounded border border-[#CBD2D9] font-tag">
                {productionHistory.length} samples
              </span>
            </div>

            {/* Recharts Area Chart - Technical look, no gradient fills, light grid lines, graphite line */}
            <div className="w-full h-56 sm:h-64 bg-[#F5F6F8] rounded-lg p-2 border border-[#E4E7EB]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={productionHistory.slice(-30)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4E7EB" />
                  <XAxis dataKey="timeStr" stroke="#9AA5B1" tick={{ fontSize: 10, fill: '#52606D' }} />
                  <YAxis stroke="#9AA5B1" tick={{ fontSize: 10, fill: '#52606D' }} domain={[0, 'auto']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD2D9', borderRadius: 8, fontSize: 12, color: '#1F2933', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                    itemStyle={{ color: '#3B4651' }}
                  />
                  <Area type="monotone" dataKey="bpm" stroke="#3B4651" strokeWidth={2} fill="#3B4651" fillOpacity={0.08} name="Throughput (BPM)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-[#D5DBE1] flex flex-wrap justify-between gap-1 text-xs text-[#52606D]">
            <span>Target benchmark: 35 BPM</span>
            <span>Uptime: {formatUptime(counters.uptimeSeconds)} • Downtime: {formatUptime(counters.downtimeSeconds)}</span>
          </div>
        </div>

        {/* Recent Alarms Summary (Cols 9-12) */}
        <div className="lg:col-span-4 bg-white border border-[#D5DBE1] rounded-lg p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#C62828]" />
                <h3 className="text-xs font-semibold text-[#1F2933]">
                  Recent alarms
                </h3>
              </div>
              <button
                onClick={() => dispatch({ type: 'SET_PAGE', page: 'alarms' })}
                className="text-xs text-[#3B4651] hover:underline font-semibold cursor-pointer"
              >
                View all ({alarms.length})
              </button>
            </div>

            {/* Alarms Mini-List */}
            <div className="space-y-2">
              {alarms.length === 0 ? (
                <div className="p-4 bg-[#F5F6F8] rounded-lg border border-[#E4E7EB] text-center text-[#52606D] text-xs">
                  All systems healthy. No active or historical alarms.
                </div>
              ) : (
                alarms.slice(0, 4).map(alarm => (
                  <div
                    key={alarm.id}
                    className={`p-2.5 rounded-lg border text-xs flex flex-col gap-1 ${
                      alarm.state === 'ACTIVE_UNACK'
                        ? 'bg-[#FFEBEE] border-[#EF9A9A] text-[#C62828]'
                        : alarm.state === 'ACTIVE_ACK'
                        ? 'bg-[#FFF8E1] border-[#FFE082] text-[#B7791F]'
                        : 'bg-[#F5F6F8] border-[#E4E7EB] text-[#1F2933]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold font-tag text-xs">{alarm.code} • {alarm.title}</span>
                      <span className="text-[10px] bg-white border border-[#CBD2D9] px-1.5 py-0.5 rounded font-tag">
                        {alarm.severity}
                      </span>
                    </div>
                    <p className="text-[11px] opacity-85 leading-tight">
                      {alarm.description}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-[#D5DBE1] flex justify-between text-xs text-[#52606D]">
            <span>ISA-18.2-inspired alarm lifecycle</span>
            <span>Total alarms: {alarms.length}</span>
          </div>
        </div>

      </div>

      {/* Row 3: Equipment Status Overview Strip */}
      <div className="bg-white border border-[#D5DBE1] rounded-lg p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <Cpu className="w-4 h-4 text-[#3B4651]" />
          <h3 className="text-xs font-semibold text-[#1F2933]">
            Equipment operational health summary
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          
          <div className="p-3 bg-[#F5F6F8] rounded-lg border border-[#E4E7EB] space-y-1.5">
            <div className="text-[#1F2933] font-semibold text-xs">Conveyor Motor MTR-01</div>
            <div className="flex justify-between">
              <span className="text-[#52606D]">Status:</span>
              <span className={motor.runCommand ? 'text-[#2E7D32] font-semibold' : 'text-[#6B7785]'}>
                {motor.runCommand ? 'Running' : 'Stopped'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#52606D]">Temperature:</span>
              <span className={`font-tag ${motor.temperatureC > 75 ? 'text-[#C62828] font-bold' : 'text-[#1F2933]'}`}>
                {motor.temperatureC}°C
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#52606D]">Load / Current:</span>
              <span className="text-[#1F2933] font-tag">{motor.loadPercent}% ({motor.currentAmps}A)</span>
            </div>
          </div>

          <div className="p-3 bg-[#F5F6F8] rounded-lg border border-[#E4E7EB] space-y-1.5">
            <div className="text-[#1F2933] font-semibold text-xs">Sensor Station S-01</div>
            <div className="flex justify-between">
              <span className="text-[#52606D]">Optics:</span>
              <span className={state.activeFaults.sensorMalfunction ? 'text-[#D98200] font-semibold' : 'text-[#2E7D32] font-semibold'}>
                {state.activeFaults.sensorMalfunction ? 'Dirty / Erratic' : 'Nominal'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#52606D]">Beam State:</span>
              <span className={state.sensor.active ? 'text-[#C62828] font-semibold' : 'text-[#6B7785]'}>
                {state.sensor.active ? 'Blocked (Bottle Present)' : 'Clear'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#52606D]">Total Detections:</span>
              <span className="text-[#1F2933] font-tag">{state.sensor.detectionCount}</span>
            </div>
          </div>

          <div className="p-3 bg-[#F5F6F8] rounded-lg border border-[#E4E7EB] space-y-1.5">
            <div className="text-[#1F2933] font-semibold text-xs">Pneumatic Diverter SOL-01</div>
            <div className="flex justify-between">
              <span className="text-[#52606D]">Position:</span>
              <span className="text-[#B7791F] font-tag font-semibold">{state.diverter.positionPercent}% Stroke</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#52606D]">Total Cycles:</span>
              <span className="text-[#1F2933] font-tag">{state.diverter.strokeCount} strokes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#52606D]">Air Pressure:</span>
              <span className="text-[#2E7D32] font-tag">6.2 Bar Regulated</span>
            </div>
          </div>

          <div className="p-3 bg-[#F5F6F8] rounded-lg border border-[#E4E7EB] space-y-1.5">
            <div className="text-[#1F2933] font-semibold text-xs">Safety Interlock Loop</div>
            <div className="flex justify-between">
              <span className="text-[#52606D]">Emergency Stop:</span>
              <span className={state.activeFaults.emergencyStop ? 'text-[#C62828] font-bold' : 'text-[#2E7D32] font-semibold'}>
                {state.activeFaults.emergencyStop ? 'Tripped (Latched)' : 'Healthy'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#52606D]">Jam Sensor:</span>
              <span className={state.activeFaults.jam ? 'text-[#C62828] font-bold' : 'text-[#2E7D32] font-semibold'}>
                {state.activeFaults.jam ? 'Blocked (>3.0s trip)' : 'Clear'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#52606D]">Safety Relay:</span>
              <span className="text-[#2E7D32] font-medium">Modeled: Dual-Channel Armed</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
