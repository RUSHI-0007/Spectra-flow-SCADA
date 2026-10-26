// ============================================================================
// Page 4: Alarm Management (ISA-18.2 Standard)
// Annunciator matrix, active/acknowledged/cleared states, filtering, fault injection
// ============================================================================

import React, { useState } from 'react';
import { 
  Bell, 
  AlertOctagon, 
  AlertTriangle, 
  Info, 
  CheckCheck, 
  VolumeX, 
  Volume2, 
  Trash2, 
  Download, 
  Flame, 
  Radio, 
  ShieldAlert, 
  Layers 
} from 'lucide-react';
import { useScada } from '../context/ScadaContext';
import { AlarmSeverity, AlarmLifecycleState } from '../types/scada';
import { exportAlarmHistoryCsv } from '../utils/csvExport';

export const AlarmsPage: React.FC = () => {
  const { state, dispatch } = useScada();
  const { alarms, activeFaults, settings } = state;

  const [severityFilter, setSeverityFilter] = useState<'ALL' | AlarmSeverity>('ALL');
  const [stateFilter, setStateFilter] = useState<'ALL' | AlarmLifecycleState>('ALL');

  const unackCount = alarms.filter(a => a.state === 'ACTIVE_UNACK').length;
  const criticalCount = alarms.filter(a => a.severity === 'CRITICAL' && (a.state === 'ACTIVE_UNACK' || a.state === 'ACTIVE_ACK')).length;
  const warningCount = alarms.filter(a => a.severity === 'WARNING' && (a.state === 'ACTIVE_UNACK' || a.state === 'ACTIVE_ACK')).length;

  const filteredAlarms = alarms.filter(a => {
    const matchesSev = severityFilter === 'ALL' || a.severity === severityFilter;
    const matchesState = stateFilter === 'ALL' || a.state === stateFilter;
    return matchesSev && matchesState;
  });

  const handleExportCsv = () => {
    exportAlarmHistoryCsv(filteredAlarms);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      
      {/* Header & Global Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-black font-mono text-white uppercase tracking-wider flex items-center gap-2">
            <Bell className={`w-5 h-5 text-red-400 ${unackCount > 0 ? 'animate-bounce' : ''}`} />
            ISA-18.2 Industrial Alarm Annunciator & History
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Complies with ANSI/ISA-18.2 & IEC 62682 • Prioritized safety fault matrix
          </p>
        </div>

        {/* Global Alarm Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => dispatch({ type: 'UPDATE_SETTINGS', settings: { audioMuted: !settings.audioMuted } })}
            className={`px-3 py-1.5 text-xs font-mono font-bold rounded border transition-colors flex items-center gap-1.5 cursor-pointer ${
              settings.audioMuted ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-cyan-950 text-cyan-300 border-cyan-600'
            }`}
          >
            {settings.audioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            {settings.audioMuted ? 'Buzzer Muted' : 'Audible Siren Armed'}
          </button>

          <button
            onClick={() => dispatch({ type: 'ACKNOWLEDGE_ALL_ALARMS' })}
            disabled={unackCount === 0}
            className={`px-3 py-1.5 text-xs font-mono font-bold rounded transition-all flex items-center gap-1.5 shadow ${
              unackCount > 0
                ? 'bg-amber-600 hover:bg-amber-500 text-white cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <CheckCheck className="w-3.5 h-3.5" />
            ACK All Alarms ({unackCount})
          </button>

          <button
            onClick={handleExportCsv}
            disabled={alarms.length === 0}
            className="px-3 py-1.5 text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            Export CSV
          </button>
        </div>
      </div>

      {/* 4 Primary Annunciator Summary Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Total Logged Alarms</div>
          <div className="text-2xl font-black font-mono text-white mt-1">{alarms.length}</div>
          <div className="text-[10px] font-mono text-slate-500">Historical Buffer</div>
        </div>

        <div className={`bg-slate-900 border rounded-lg p-3 ${
          criticalCount > 0 ? 'border-red-500/80 bg-red-950/20' : 'border-slate-800'
        }`}>
          <div className="text-[10px] font-mono text-red-400 uppercase flex items-center justify-between">
            <span>Critical Tripped</span>
            {criticalCount > 0 && <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>}
          </div>
          <div className="text-2xl font-black font-mono text-red-400 mt-1">{criticalCount}</div>
          <div className="text-[10px] font-mono text-slate-500">Auto-Stop Interlocks</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
          <div className="text-[10px] font-mono text-amber-400 uppercase">Warning Severity</div>
          <div className="text-2xl font-black font-mono text-amber-300 mt-1">{warningCount}</div>
          <div className="text-[10px] font-mono text-slate-500">Supervisory Cautions</div>
        </div>

        <div className={`bg-slate-900 border rounded-lg p-3 ${
          unackCount > 0 ? 'border-red-500 alarm-flash' : 'border-slate-800'
        }`}>
          <div className="text-[10px] font-mono text-slate-400 uppercase">Unacknowledged</div>
          <div className="text-2xl font-black font-mono text-red-300 mt-1">{unackCount}</div>
          <div className="text-[10px] font-mono text-slate-500">Flashing Annunciator</div>
        </div>

      </div>

      {/* Fault Injection Console for Examiners / Demo */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
              Exhibition Fault Simulator Console (Live Testing)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            Simulates real field hardware failures
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          
          <button
            onClick={() => dispatch({ type: 'INJECT_FAULT', fault: 'jam', value: !activeFaults.jam })}
            className={`p-3 rounded-lg border text-xs font-mono font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
              activeFaults.jam
                ? 'bg-red-950 border-red-500 text-red-200 alarm-flash'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span>1. Conveyor Jam</span>
            <span className="text-[9px] font-normal text-slate-400">{activeFaults.jam ? 'ACTIVE (TRIP)' : 'SIMULATE'}</span>
          </button>

          <button
            onClick={() => dispatch({ type: 'INJECT_FAULT', fault: 'motorOverload', value: !activeFaults.motorOverload })}
            className={`p-3 rounded-lg border text-xs font-mono font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
              activeFaults.motorOverload
                ? 'bg-red-950 border-red-500 text-red-200 alarm-flash'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <Flame className="w-5 h-5 text-rose-400" />
            <span>2. Motor Overload</span>
            <span className="text-[9px] font-normal text-slate-400">{activeFaults.motorOverload ? 'ACTIVE (>80°C)' : 'SIMULATE'}</span>
          </button>

          <button
            onClick={() => dispatch({ type: 'INJECT_FAULT', fault: 'sensorMalfunction', value: !activeFaults.sensorMalfunction })}
            className={`p-3 rounded-lg border text-xs font-mono font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
              activeFaults.sensorMalfunction
                ? 'bg-amber-950 border-amber-500 text-amber-200 animate-pulse'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <Radio className="w-5 h-5 text-purple-400" />
            <span>3. Sensor Malfunction</span>
            <span className="text-[9px] font-normal text-slate-400">{activeFaults.sensorMalfunction ? 'ACTIVE (DIRTY)' : 'SIMULATE'}</span>
          </button>

          <button
            onClick={() => dispatch({ type: 'INJECT_FAULT', fault: 'productionBacklog', value: !activeFaults.productionBacklog })}
            className={`p-3 rounded-lg border text-xs font-mono font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
              activeFaults.productionBacklog
                ? 'bg-amber-950 border-amber-500 text-amber-200 animate-pulse'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <Layers className="w-5 h-5 text-blue-400" />
            <span>4. Buffer Backlog</span>
            <span className="text-[9px] font-normal text-slate-400">{activeFaults.productionBacklog ? 'ACTIVE (>15 BTL)' : 'SIMULATE'}</span>
          </button>

          <button
            onClick={() => dispatch({ type: 'ESTOP_COMMAND' })}
            className="p-3 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-500 text-red-200 text-xs font-mono font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer"
          >
            <ShieldAlert className="w-5 h-5 text-red-400" />
            <span>5. Emergency Stop</span>
            <span className="text-[9px] font-normal text-red-300">TRIP HARD</span>
          </button>

        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-mono text-slate-400 mr-2">Severity:</span>
          {(['ALL', 'CRITICAL', 'MAJOR', 'WARNING', 'INFO'] as const).map(sev => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1 text-xs font-mono rounded font-semibold transition-colors cursor-pointer ${
                severityFilter === sev
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <button
          onClick={() => dispatch({ type: 'CLEAR_HISTORICAL_ALARMS' })}
          className="text-xs font-mono text-slate-500 hover:text-slate-300 flex items-center gap-1 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear Cleared Alarms from View
        </button>
      </div>

      {/* Alarms History & Annunciator Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <table className="w-full text-left font-mono text-xs">
          <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 text-[10px] uppercase">
            <tr>
              <th className="py-2.5 px-3">State</th>
              <th className="py-2.5 px-3">Code & Tag</th>
              <th className="py-2.5 px-3">Severity</th>
              <th className="py-2.5 px-3">Description</th>
              <th className="py-2.5 px-3">Trip Timestamp</th>
              <th className="py-2.5 px-3 text-right">Operator Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredAlarms.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  <CheckCheck className="w-8 h-8 text-emerald-500/50 mx-auto mb-2" />
                  No alarms found matching filter criteria. Safety systems operational.
                </td>
              </tr>
            ) : (
              filteredAlarms.map(alarm => {
                const isUnack = alarm.state === 'ACTIVE_UNACK';
                const isCrit = alarm.severity === 'CRITICAL';
                const isWarn = alarm.severity === 'WARNING';

                return (
                  <tr
                    key={alarm.id}
                    className={`transition-colors ${
                      isUnack
                        ? isCrit
                          ? 'bg-red-950/40 text-red-200'
                          : 'bg-amber-950/30 text-amber-200'
                        : 'hover:bg-slate-800/40 text-slate-300'
                    }`}
                  >
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        alarm.state === 'ACTIVE_UNACK' ? 'bg-red-900 text-white alarm-flash' :
                        alarm.state === 'ACTIVE_ACK' ? 'bg-amber-900/80 text-amber-200' :
                        alarm.state === 'CLEARED_UNACK' ? 'bg-blue-900 text-blue-200 animate-pulse' :
                        'bg-slate-800 text-slate-500'
                      }`}>
                        {alarm.state}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="font-bold text-white">[{alarm.code}]</span>
                      <span className="text-[10px] text-slate-400 block">{alarm.tag}</span>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                        isCrit ? 'bg-red-950 text-red-300 border border-red-800' :
                        isWarn ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        'bg-blue-950 text-blue-300 border border-blue-800'
                      }`}>
                        {alarm.severity}
                      </span>
                    </td>

                    <td className="py-2.5 px-3">
                      <strong className="text-white block font-semibold">{alarm.title}</strong>
                      <span className="text-[11px] text-slate-400">{alarm.description}</span>
                    </td>

                    <td className="py-2.5 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(alarm.timestamp).toLocaleTimeString()}
                    </td>

                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      {isUnack ? (
                        <button
                          onClick={() => dispatch({ type: 'ACKNOWLEDGE_ALARM', alarmId: alarm.id })}
                          className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-bold rounded shadow transition-colors cursor-pointer"
                        >
                          ACK
                        </button>
                      ) : alarm.state === 'CLEARED' ? (
                        <span className="text-[10px] text-emerald-400 font-bold">CLEARED</span>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-bold">ACKNOWLEDGED</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
