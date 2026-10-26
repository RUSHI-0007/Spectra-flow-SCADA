// ============================================================================
// Page 1: Overview Dashboard
// Clean, calm, modern "control room" look that guests and non-technical people
// can understand at a glance.
// ============================================================================

import React from 'react';
import { 
  Activity, 
  Layers, 
  CheckCircle2, 
  Archive, 
  Bell, 
  Gauge, 
  Cpu,
  ArrowRight
} from 'lucide-react';
import { useScada } from '../context/ScadaContext';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { HelpTooltip } from '../components/common/HelpTooltip';

export const DashboardPage: React.FC = () => {
  const { state, dispatch } = useScada();
  const { counters, motor, machineState, alarms, productionHistory } = state;

  const totalSorted = counters.categoryA + counters.categoryB;
  const unackAlarms = alarms.filter(a => a.state === 'ACTIVE_UNACK');
  const activeAlarms = alarms.filter(a => a.state === 'ACTIVE_UNACK' || a.state === 'ACTIVE_ACK');

  const formatUptime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const hrs = Math.floor(mins / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs}h ${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150 w-full">
      
      {/* Page Title & Status Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            Packaging Line Overview Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Supervisory monitoring of conveyor throughput, sorting distribution, and drive telemetry
          </p>
        </div>

        <button
          onClick={() => dispatch({ type: 'SET_PAGE', page: 'simulation' })}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
        >
          <span>Open Live Conveyor</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 8 Primary KPI Metric Cards - Readable from 2-3 meters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        
        {/* 1. Status */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 relative overflow-hidden shadow-sm">
          <div className="text-xs text-slate-400 flex items-center">
            <span>Operating Status</span>
            <HelpTooltip term="Machine State" explanation="Current state of the conveyor: Idle, Starting, Running, Stopping, Fault, or Emergency Stop." />
          </div>
          <div className={`text-lg font-bold tracking-tight my-1 truncate ${
            machineState === 'RUNNING' ? 'text-emerald-400' :
            machineState === 'STARTING' || machineState === 'STOPPING' ? 'text-amber-300' :
            machineState === 'FAULT' || machineState === 'EMERGENCY_STOP' ? 'text-red-400' : 'text-slate-300'
          }`}>
            {machineState === 'RUNNING' ? 'Running' :
             machineState === 'STARTING' ? 'Starting' :
             machineState === 'STOPPING' ? 'Stopping' :
             machineState === 'FAULT' ? 'Fault Trip' :
             machineState === 'EMERGENCY_STOP' ? 'Emergency Stop' : 'Idle'}
          </div>
          <div className="text-[11px] text-slate-500">State engine</div>
          <div className={`absolute top-0 left-0 right-0 h-0.5 ${
            machineState === 'RUNNING' ? 'bg-emerald-500' : 'bg-slate-700'
          }`} />
        </div>

        {/* 2. Total Bottles */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 relative overflow-hidden shadow-sm">
          <div className="text-xs text-slate-400 flex items-center">
            <span>Bottles Fed</span>
            <HelpTooltip term="Total Fed" explanation="Total bottles placed on conveyor since production counters were reset." />
          </div>
          <div className="text-2xl font-bold font-tag text-white tracking-tight my-1">
            {counters.totalInfeed}
          </div>
          <div className="text-[11px] text-slate-500">Infeed count</div>
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500" />
        </div>

        {/* 3. Category A */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 relative overflow-hidden shadow-sm">
          <div className="text-xs text-emerald-400/90 flex items-center">
            <span>Bin A (500ml)</span>
            <HelpTooltip term="Bin A" explanation="Clear 500ml bottles that travel straight along the conveyor into Bin A." />
          </div>
          <div className="text-2xl font-bold font-tag text-emerald-300 tracking-tight my-1">
            {counters.categoryA}
          </div>
          <div className="text-[11px] text-slate-500">Straight line</div>
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-500" />
        </div>

        {/* 4. Category B */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 relative overflow-hidden shadow-sm">
          <div className="text-xs text-amber-400/90 flex items-center">
            <span>Bin B (1000ml)</span>
            <HelpTooltip term="Bin B" explanation="Amber 1000ml bottles that are pneumatically diverted off the belt into Bin B." />
          </div>
          <div className="text-2xl font-bold font-tag text-amber-300 tracking-tight my-1">
            {counters.categoryB}
          </div>
          <div className="text-[11px] text-slate-500">Diverted chute</div>
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-amber-500" />
        </div>

        {/* 5. Throughput Rate */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 relative overflow-hidden shadow-sm">
          <div className="text-xs text-slate-400 flex items-center">
            <span>Cycle Rate</span>
            <HelpTooltip term="BPM" explanation="Bottles Per Minute: production cadence based on speed setpoint and feed interval." />
          </div>
          <div className="text-2xl font-bold font-tag text-blue-300 tracking-tight my-1">
            {counters.currentBpm} <span className="text-xs font-normal text-slate-400">BPM</span>
          </div>
          <div className="text-[11px] text-slate-500">Instant rate</div>
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500" />
        </div>

        {/* 6. Belt Speed (m/s) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 relative overflow-hidden shadow-sm">
          <div className="text-xs text-slate-400 flex items-center">
            <span>Belt Speed</span>
            <HelpTooltip term="Conveyor Speed" explanation="Current linear belt velocity in meters per second, driven by the VFD." />
          </div>
          <div className="text-2xl font-bold font-tag text-slate-200 tracking-tight my-1">
            {motor.actualSpeedMs} <span className="text-xs font-normal text-slate-400">m/s</span>
          </div>
          <div className="text-[11px] text-slate-500 font-tag">{motor.frequencyHz} Hz drive</div>
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500" />
        </div>

        {/* 7. Active Alarms */}
        <div className={`bg-slate-900/90 border rounded-xl p-3.5 relative overflow-hidden shadow-sm ${
          unackAlarms.length > 0 ? 'border-red-500/80 bg-red-950/20' : 'border-slate-800'
        }`}>
          <div className="text-xs text-red-400/90 flex items-center">
            <span>Active Alarms</span>
            <HelpTooltip term="Alarms" explanation="Number of currently active alarm conditions requiring operator attention or acknowledgment." />
          </div>
          <div className={`text-2xl font-bold font-tag tracking-tight my-1 ${
            unackAlarms.length > 0 ? 'text-red-400 animate-pulse' : 'text-slate-300'
          }`}>
            {activeAlarms.length}
          </div>
          <div className="text-[11px] text-slate-500">{unackAlarms.length} unacknowledged</div>
          <div className={`absolute top-0 left-0 right-0 h-0.5 ${
            unackAlarms.length > 0 ? 'bg-red-500' : 'bg-slate-700'
          }`} />
        </div>

        {/* 8. Session Utilization */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 relative overflow-hidden shadow-sm">
          <div className="text-xs text-slate-400 flex items-center">
            <span>Session Utilization</span>
            <HelpTooltip term="Utilization" explanation="Percentage of total operating time that the conveyor was actively running vs stopped or in fault." />
          </div>
          <div className="text-2xl font-bold font-tag text-emerald-400 tracking-tight my-1">
            {counters.utilizationPercent}%
          </div>
          <div className="text-[11px] text-slate-500">Uptime: {formatUptime(counters.uptimeSeconds)}</div>
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-500" />
        </div>

      </div>

      {/* Row 2: Live Production Chart & Recent Alarms */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Live Production Chart (Cols 1-8) */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-semibold text-white">
                  Live production velocity and throughput
                </h3>
                <HelpTooltip term="Telemetry Trend" explanation="Real-time samples of bottles per minute (BPM) over time as the conveyor runs." />
              </div>
              <span className="text-xs text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 font-tag">
                {productionHistory.length} samples
              </span>
            </div>

            {/* Recharts Area Chart with explicit height */}
            <div className="w-full h-64 bg-slate-950 rounded-xl p-2 border border-slate-800/80">
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={productionHistory.slice(-30)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="bpmFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="timeStr" stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} domain={[0, 'auto']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 12 }}
                    itemStyle={{ color: '#60a5fa' }}
                  />
                  <Area type="monotone" dataKey="bpm" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#bpmFill)" name="Throughput (BPM)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800 flex justify-between text-xs text-slate-400">
            <span>Target benchmark: 35 BPM</span>
            <span>Uptime: {formatUptime(counters.uptimeSeconds)} • Downtime: {formatUptime(counters.downtimeSeconds)}</span>
          </div>
        </div>

        {/* Recent Alarms Summary (Cols 9-12) */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-red-400" />
                <h3 className="text-xs font-semibold text-white">
                  Recent alarms
                </h3>
              </div>
              <button
                onClick={() => dispatch({ type: 'SET_PAGE', page: 'alarms' })}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
              >
                View all ({alarms.length})
              </button>
            </div>

            {/* Alarms Mini-List */}
            <div className="space-y-2">
              {alarms.length === 0 ? (
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center text-slate-400 text-xs">
                  All systems healthy. No active or historical alarms.
                </div>
              ) : (
                alarms.slice(0, 4).map(alarm => (
                  <div
                    key={alarm.id}
                    className={`p-2.5 rounded-lg border text-xs flex flex-col gap-1 ${
                      alarm.state === 'ACTIVE_UNACK'
                        ? 'bg-red-950/60 border-red-500/80 text-red-200'
                        : alarm.state === 'ACTIVE_ACK'
                        ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                        : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white font-tag text-xs">{alarm.code} • {alarm.title}</span>
                      <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded font-tag">
                        {alarm.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      {alarm.description}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800 flex justify-between text-xs text-slate-400">
            <span>ISA-18.2-inspired alarm lifecycle</span>
            <span>Total alarms: {alarms.length}</span>
          </div>
        </div>

      </div>

      {/* Row 3: Equipment Status Overview Strip */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <Cpu className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-semibold text-white">
            Equipment operational health summary
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
            <div className="text-slate-300 font-semibold text-xs">Conveyor Motor MTR-01</div>
            <div className="flex justify-between">
              <span className="text-slate-400">Status:</span>
              <span className={motor.runCommand ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                {motor.runCommand ? 'Running' : 'Stopped'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Temperature:</span>
              <span className={`font-tag ${motor.temperatureC > 75 ? 'text-red-400 font-bold' : 'text-slate-200'}`}>
                {motor.temperatureC}°C
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Load / Current:</span>
              <span className="text-slate-200 font-tag">{motor.loadPercent}% ({motor.currentAmps}A)</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
            <div className="text-slate-300 font-semibold text-xs">Sensor Station S-01</div>
            <div className="flex justify-between">
              <span className="text-slate-400">Optics:</span>
              <span className={state.activeFaults.sensorMalfunction ? 'text-amber-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                {state.activeFaults.sensorMalfunction ? 'Dirty / Erratic' : 'Nominal'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Beam State:</span>
              <span className={state.sensor.active ? 'text-blue-400 font-semibold' : 'text-slate-400'}>
                {state.sensor.active ? 'Blocked (Bottle Present)' : 'Clear'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Detections:</span>
              <span className="text-slate-200 font-tag">{state.sensor.detectionCount}</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
            <div className="text-slate-300 font-semibold text-xs">Pneumatic Diverter SOL-01</div>
            <div className="flex justify-between">
              <span className="text-slate-400">Position:</span>
              <span className="text-amber-300 font-tag font-semibold">{state.diverter.positionPercent}% Stroke</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Cycles:</span>
              <span className="text-slate-200 font-tag">{state.diverter.strokeCount} strokes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Air Pressure:</span>
              <span className="text-emerald-400 font-tag">6.2 Bar Regulated</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
            <div className="text-slate-300 font-semibold text-xs">Safety Interlock Loop</div>
            <div className="flex justify-between">
              <span className="text-slate-400">Emergency Stop:</span>
              <span className={state.activeFaults.emergencyStop ? 'text-red-400 font-bold' : 'text-emerald-400 font-semibold'}>
                {state.activeFaults.emergencyStop ? 'Tripped (Latched)' : 'Healthy'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Jam Sensor:</span>
              <span className={state.activeFaults.jam ? 'text-red-400 font-bold' : 'text-emerald-400 font-semibold'}>
                {state.activeFaults.jam ? 'Blocked (>3.0s trip)' : 'Clear'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Safety Relay:</span>
              <span className="text-emerald-400 font-medium">Modeled: Dual-Channel Armed</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
