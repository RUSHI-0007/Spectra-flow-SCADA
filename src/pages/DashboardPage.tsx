// ============================================================================
// Page 1: Overview Dashboard
// High-level supervisory overview: status cards, live chart, recent alarms, equipment status
// ============================================================================

import React from 'react';
import { 
  Activity, 
  Layers, 
  CheckCircle2, 
  Archive, 
  Zap, 
  Clock, 
  Bell, 
  Percent, 
  Gauge, 
  AlertTriangle,
  Cpu,
  ArrowRight
} from 'lucide-react';
import { useScada } from '../context/ScadaContext';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const DashboardPage: React.FC = () => {
  const { state, dispatch } = useScada();
  const { counters, motor, machineState, alarms, productionHistory, activeFaults } = state;

  const totalSorted = counters.categoryA + counters.categoryB;
  const unackAlarms = alarms.filter(a => a.state === 'ACTIVE_UNACK');
  const activeAlarms = alarms.filter(a => a.state === 'ACTIVE_UNACK' || a.state === 'ACTIVE_ACK');

  const formatUptime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const hrs = Math.floor(mins / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs}h ${mins % 60}m ${secs}s`;
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      
      {/* Page Title & Status Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-black font-mono text-white uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            Packaging Line #4 • SCADA Overview Dashboard
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            High-speed automated bottle classification, sorting, and drive diagnostics
          </p>
        </div>

        <button
          onClick={() => dispatch({ type: 'SET_PAGE', page: 'simulation' })}
          className="px-3.5 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 font-mono text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
        >
          <span>Open Live Simulation</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 8 Primary KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        
        {/* 1. Status */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 relative overflow-hidden shadow-sm">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Line Status</div>
          <div className={`text-base font-black font-mono tracking-tight my-1 truncate ${
            machineState === 'RUNNING' ? 'text-emerald-400' :
            machineState === 'STARTING' || machineState === 'STOPPING' ? 'text-amber-300' :
            machineState === 'FAULT' || machineState === 'EMERGENCY_STOP' ? 'text-red-400' : 'text-slate-300'
          }`}>
            {machineState}
          </div>
          <div className="text-[10px] font-mono text-slate-500">State Engine</div>
          <div className={`absolute top-0 left-0 right-0 h-0.5 ${
            machineState === 'RUNNING' ? 'bg-emerald-500' : 'bg-slate-700'
          }`} />
        </div>

        {/* 2. Total Bottles */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 relative overflow-hidden shadow-sm">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Total Bottles</div>
          <div className="text-xl font-black font-mono text-white tracking-tight my-1">
            {counters.totalInfeed}
          </div>
          <div className="text-[10px] font-mono text-slate-500">Feed Count</div>
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500" />
        </div>

        {/* 3. Category A */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 relative overflow-hidden shadow-sm">
          <div className="text-[10px] font-mono text-emerald-400 uppercase">Cat A (500ml)</div>
          <div className="text-xl font-black font-mono text-emerald-300 tracking-tight my-1">
            {counters.categoryA}
          </div>
          <div className="text-[10px] font-mono text-slate-500">Straight Line</div>
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-500" />
        </div>

        {/* 4. Category B */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 relative overflow-hidden shadow-sm">
          <div className="text-[10px] font-mono text-amber-400 uppercase">Cat B (1000ml)</div>
          <div className="text-xl font-black font-mono text-amber-300 tracking-tight my-1">
            {counters.categoryB}
          </div>
          <div className="text-[10px] font-mono text-slate-500">Diverted Bin</div>
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-amber-500" />
        </div>

        {/* 5. Throughput Rate */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 relative overflow-hidden shadow-sm">
          <div className="text-[10px] font-mono text-cyan-400 uppercase">Velocity</div>
          <div className="text-xl font-black font-mono text-cyan-300 tracking-tight my-1">
            {counters.currentBpm} <span className="text-xs text-slate-400 font-normal">BPM</span>
          </div>
          <div className="text-[10px] font-mono text-slate-500">Throughput</div>
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-cyan-500" />
        </div>

        {/* 6. Belt Speed (m/s) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 relative overflow-hidden shadow-sm">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Belt Speed</div>
          <div className="text-xl font-black font-mono text-slate-200 tracking-tight my-1">
            {motor.actualSpeedMs} <span className="text-xs text-slate-400 font-normal">m/s</span>
          </div>
          <div className="text-[10px] font-mono text-slate-500">{motor.frequencyHz} Hz VFD</div>
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-indigo-500" />
        </div>

        {/* 7. Active Alarms */}
        <div className={`bg-slate-900/90 border rounded-lg p-3 relative overflow-hidden shadow-sm ${
          unackAlarms.length > 0 ? 'border-red-500/80 bg-red-950/20' : 'border-slate-800'
        }`}>
          <div className="text-[10px] font-mono text-red-400 uppercase">Active Alarms</div>
          <div className={`text-xl font-black font-mono tracking-tight my-1 ${
            unackAlarms.length > 0 ? 'text-red-400 animate-pulse' : 'text-slate-300'
          }`}>
            {activeAlarms.length}
          </div>
          <div className="text-[10px] font-mono text-slate-500">{unackAlarms.length} Unacked</div>
          <div className={`absolute top-0 left-0 right-0 h-0.5 ${
            unackAlarms.length > 0 ? 'bg-red-500' : 'bg-slate-700'
          }`} />
        </div>

        {/* 8. Machine Utilization */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 relative overflow-hidden shadow-sm">
          <div className="text-[10px] font-mono text-purple-400 uppercase">Utilization</div>
          <div className="text-xl font-black font-mono text-purple-300 tracking-tight my-1">
            {counters.utilizationPercent}%
          </div>
          <div className="text-[10px] font-mono text-slate-500">{formatUptime(counters.uptimeSeconds)}</div>
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-purple-500" />
        </div>

      </div>

      {/* Row 2: Live Production Chart & Recent Alarms */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Live Production Chart (Cols 1-8) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
                  Live Production Telemetry (BPM vs Speed)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                Rolling Buffer: {productionHistory.length} Samples
              </span>
            </div>

            {/* Recharts Area Chart */}
            <div className="w-full h-64 bg-slate-950 rounded-lg p-2 border border-slate-800">
              {productionHistory.length < 2 ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 font-mono text-xs">
                  <Activity className="w-8 h-8 text-slate-600 mb-2 animate-pulse" />
                  <span>Conveyor running. Gathering live telemetry data points...</span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={productionHistory.slice(-30)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="bpmFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.5}/>
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="timeStr" stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} domain={[0, 'auto']} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 12, fontFamily: 'monospace' }}
                      itemStyle={{ color: '#38bdf8' }}
                    />
                    <Area type="monotone" dataKey="bpm" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#bpmFill)" name="Throughput (BPM)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800 flex justify-between text-[11px] font-mono text-slate-400">
            <span>Operational Target: 35 BPM</span>
            <span>Uptime: {formatUptime(counters.uptimeSeconds)} • Downtime: {formatUptime(counters.downtimeSeconds)}</span>
          </div>
        </div>

        {/* Recent Alarms Summary (Cols 9-12) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-red-400" />
                <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
                  Active Alarm Matrix
                </h3>
              </div>
              <button
                onClick={() => dispatch({ type: 'SET_PAGE', page: 'alarms' })}
                className="text-[10px] font-mono text-cyan-400 hover:underline"
              >
                View All →
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {activeAlarms.length === 0 ? (
                <div className="p-8 text-center text-slate-500 font-mono text-xs bg-slate-950 rounded-lg border border-slate-800">
                  <CheckCircle2 className="w-7 h-7 text-emerald-500/60 mx-auto mb-2" />
                  No active alarms. Safety loops normal.
                </div>
              ) : (
                activeAlarms.slice(0, 4).map(alarm => (
                  <div
                    key={alarm.id}
                    className={`p-2.5 rounded-lg border text-xs font-mono space-y-1 ${
                      alarm.state === 'ACTIVE_UNACK'
                        ? 'bg-red-950/70 border-red-500 text-red-200 alarm-flash'
                        : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold">[{alarm.code}] {alarm.title}</span>
                      <span className="text-[9px] bg-red-900 text-white px-1.5 py-0.2 rounded font-bold uppercase">
                        {alarm.severity}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      {alarm.description}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800 flex justify-between text-[10px] font-mono text-slate-400">
            <span>ISA-18.2 Protocol Active</span>
            <span>Total Alarms: {alarms.length}</span>
          </div>
        </div>

      </div>

      {/* Row 3: Equipment Status Overview Strip */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
            Equipment Operational Health Summary
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
          
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
            <div className="text-slate-400 font-bold uppercase text-[10px]">Drive Motor MTR-01</div>
            <div className="flex justify-between">
              <span className="text-slate-400">Status:</span>
              <span className={motor.runCommand ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                {motor.runCommand ? 'RUNNING' : 'STOPPED'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Temperature:</span>
              <span className={motor.temperatureC > 75 ? 'text-red-400 font-bold' : 'text-slate-200'}>
                {motor.temperatureC}°C
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Load / Current:</span>
              <span className="text-slate-200 font-bold">{motor.loadPercent}% ({motor.currentAmps}A)</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
            <div className="text-slate-400 font-bold uppercase text-[10px]">Sensor Station S-01</div>
            <div className="flex justify-between">
              <span className="text-slate-400">Optics:</span>
              <span className={state.activeFaults.sensorMalfunction ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                {state.activeFaults.sensorMalfunction ? 'DIRTY / INTERMITTENT' : 'NOMINAL'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Beam State:</span>
              <span className={state.sensor.active ? 'text-cyan-400 font-bold' : 'text-slate-400'}>
                {state.sensor.active ? 'BLOCKED (BOTTLE PRESENT)' : 'CLEAR'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Detections:</span>
              <span className="text-slate-200 font-bold">{state.sensor.detectionCount}</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
            <div className="text-slate-400 font-bold uppercase text-[10px]">Pneumatic Diverter SOL-01</div>
            <div className="flex justify-between">
              <span className="text-slate-400">Cylinder Position:</span>
              <span className="text-amber-300 font-bold">{state.diverter.positionPercent}% Stroke</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Cycles:</span>
              <span className="text-slate-200 font-bold">{state.diverter.strokeCount} strokes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Pneumatic Supply:</span>
              <span className="text-emerald-400 font-bold">6.2 Bar (Regulated)</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
            <div className="text-slate-400 font-bold uppercase text-[10px]">Safety Interlock Loop</div>
            <div className="flex justify-between">
              <span className="text-slate-400">E-Stop PB-01:</span>
              <span className={state.activeFaults.emergencyStop ? 'text-red-400 font-black' : 'text-emerald-400 font-bold'}>
                {state.activeFaults.emergencyStop ? 'DEPRESSED (LATCHED)' : 'CLOSED (HEALTHY)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Jam Photocell:</span>
              <span className={state.activeFaults.jam ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                {state.activeFaults.jam ? 'BLOCKED (>3.0s TRIP)' : 'CLEAR'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Safety Relay:</span>
              <span className="text-emerald-400 font-bold">PILZ Dual-Channel Armed</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
