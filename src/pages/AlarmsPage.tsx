// ============================================================================
// Page 4: Alarm Annunciator & Management
// ISA-18.2-inspired alarm lifecycle, prioritized safety fault matrix
// ============================================================================

import React, { useState } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Volume2, 
  VolumeX, 
  AlertTriangle, 
  Flame, 
  Radio, 
  Layers, 
  ShieldAlert, 
  Download,
  Trash2
} from 'lucide-react';
import { useScada } from '../context/ScadaContext';
import { exportAlarmHistoryCsv } from '../utils/csvExport';
import { HelpTooltip } from '../components/common/HelpTooltip';

export const AlarmsPage: React.FC = () => {
  const { state, dispatch } = useScada();
  const { alarms, settings, activeFaults } = state;

  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [stateFilter, setStateFilter] = useState<string>('ALL');

  const unackCount = alarms.filter(a => a.state === 'ACTIVE_UNACK').length;
  const criticalCount = alarms.filter(a => a.severity === 'CRITICAL' && a.state.startsWith('ACTIVE')).length;
  const warningCount = alarms.filter(a => a.severity === 'WARNING' && a.state.startsWith('ACTIVE')).length;

  const filteredAlarms = alarms.filter(a => {
    const matchesSev = severityFilter === 'ALL' || a.severity === severityFilter;
    const matchesState = stateFilter === 'ALL' || a.state === stateFilter;
    return matchesSev && matchesState;
  });

  const handleExportCsv = () => {
    exportAlarmHistoryCsv(filteredAlarms);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150 w-full">
      
      {/* Header & Global Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Bell className={`w-5 h-5 text-red-400 ${unackCount > 0 ? 'animate-bounce' : ''}`} />
            Alarm Annunciator &amp; Management
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            ISA-18.2-inspired alarm lifecycle • Prioritized safety fault matrix
          </p>
        </div>

        {/* Global Alarm Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => dispatch({ type: 'UPDATE_SETTINGS', settings: { audioMuted: !settings.audioMuted } })}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
              settings.audioMuted ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-900 text-blue-300 border-blue-500/50'
            }`}
          >
            {settings.audioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            {settings.audioMuted ? 'Buzzer Muted' : 'Audible Siren Armed'}
          </button>

          <button
            onClick={() => dispatch({ type: 'ACKNOWLEDGE_ALL_ALARMS' })}
            disabled={unackCount === 0}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 shadow ${
              unackCount > 0
                ? 'bg-amber-600 hover:bg-amber-500 text-white cursor-pointer'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Acknowledge All ({unackCount})</span>
            <HelpTooltip term="Acknowledge" explanation="Silences the siren and marks the alarm as seen. The machine will not restart until the physical fault is cleared." />
          </button>

          <button
            onClick={handleExportCsv}
            disabled={alarms.length === 0}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            Export CSV
          </button>
        </div>
      </div>

      {/* 4 Primary Annunciator Summary Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Total Logged Alarms</div>
          <div className="text-3xl font-bold font-tag text-white mt-1">{alarms.length}</div>
          <div className="text-[11px] text-slate-500">Historical buffer</div>
        </div>

        <div className={`bg-slate-900/90 border rounded-xl p-4 ${
          criticalCount > 0 ? 'border-red-500/80 bg-red-950/20' : 'border-slate-800'
        }`}>
          <div className="text-xs text-red-400 font-medium flex items-center justify-between">
            <span>Critical Tripped</span>
            {criticalCount > 0 && <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>}
          </div>
          <div className="text-3xl font-bold font-tag text-red-400 mt-1">{criticalCount}</div>
          <div className="text-[11px] text-slate-500">Auto-stop interlocks</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-amber-400 font-medium">Warnings</div>
          <div className="text-3xl font-bold font-tag text-amber-300 mt-1">{warningCount}</div>
          <div className="text-[11px] text-slate-500">Supervisory cautions</div>
        </div>

        <div className={`bg-slate-900/90 border rounded-xl p-4 ${
          unackCount > 0 ? 'border-red-500' : 'border-slate-800'
        }`}>
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Unacknowledged</span>
            {unackCount > 0 && <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>}
          </div>
          <div className="text-3xl font-bold font-tag text-red-300 mt-1">{unackCount}</div>
          <div className="text-[11px] text-slate-500">Requires operator sign-off</div>
        </div>

      </div>

      {/* Fault Injection Console for Live Testing */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-semibold text-white">
              Fault injection testing
            </h3>
            <HelpTooltip term="Fault Testing" explanation="Click any tile to inject a hardware failure and observe the automatic interlock trip." />
          </div>
          <span className="text-xs text-slate-400">
            Simulates real field hardware failures
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          
          <button
            onClick={() => dispatch({ type: 'INJECT_FAULT', fault: 'jam', value: !activeFaults.jam })}
            className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
              activeFaults.jam
                ? 'bg-red-950 border-red-500 text-red-200'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span>1. Conveyor Jam</span>
            <span className="text-[10px] text-slate-400 font-tag font-normal">{activeFaults.jam ? 'ACTIVE (TRIP)' : 'TEST TRIP'}</span>
          </button>

          <button
            onClick={() => dispatch({ type: 'INJECT_FAULT', fault: 'motorOverload', value: !activeFaults.motorOverload })}
            className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
              activeFaults.motorOverload
                ? 'bg-red-950 border-red-500 text-red-200'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <Flame className="w-5 h-5 text-rose-400" />
            <span>2. Motor Overload</span>
            <span className="text-[10px] text-slate-400 font-tag font-normal">{activeFaults.motorOverload ? 'ACTIVE (>80°C)' : 'TEST TRIP'}</span>
          </button>

          <button
            onClick={() => dispatch({ type: 'INJECT_FAULT', fault: 'sensorMalfunction', value: !activeFaults.sensorMalfunction })}
            className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
              activeFaults.sensorMalfunction
                ? 'bg-amber-950 border-amber-500 text-amber-200'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <Radio className="w-5 h-5 text-blue-400" />
            <span>3. Sensor Malfunction</span>
            <span className="text-[10px] text-slate-400 font-tag font-normal">{activeFaults.sensorMalfunction ? 'ACTIVE (DIRTY)' : 'TEST TRIP'}</span>
          </button>

          <button
            onClick={() => dispatch({ type: 'INJECT_FAULT', fault: 'productionBacklog', value: !activeFaults.productionBacklog })}
            className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
              activeFaults.productionBacklog
                ? 'bg-amber-950 border-amber-500 text-amber-200'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <Layers className="w-5 h-5 text-blue-400" />
            <span>4. Buffer Backlog</span>
            <span className="text-[10px] text-slate-400 font-tag font-normal">{activeFaults.productionBacklog ? 'ACTIVE' : 'TEST WARNING'}</span>
          </button>

          <button
            onClick={() => dispatch({ type: 'ESTOP_COMMAND' })}
            className="p-3 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500 text-red-200 text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer"
          >
            <ShieldAlert className="w-5 h-5 text-red-400" />
            <span>5. Emergency Stop</span>
            <span className="text-[10px] text-red-300 font-tag font-normal">HARD RELAY TRIP</span>
          </button>

        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 text-xs">
          <span className="text-slate-400 mr-2">Severity:</span>
          {(['ALL', 'CRITICAL', 'MAJOR', 'WARNING', 'INFO'] as const).map(sev => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                severityFilter === sev
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <button
          onClick={() => dispatch({ type: 'CLEAR_HISTORICAL_ALARMS' })}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear Cleared Alarms
        </button>
      </div>

      {/* Alarms History & Annunciator Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 text-[11px] uppercase">
            <tr>
              <th className="py-2.5 px-3">State</th>
              <th className="py-2.5 px-3">Code &amp; Tag</th>
              <th className="py-2.5 px-3">Severity</th>
              <th className="py-2.5 px-3">Description</th>
              <th className="py-2.5 px-3">Trip Time</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {filteredAlarms.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  <CheckCheck className="w-8 h-8 text-emerald-500/50 mx-auto mb-2" />
                  No alarms found matching criteria. Safety systems operational.
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
                      <span className={`px-2 py-0.5 rounded text-[10px] font-tag font-semibold ${
                        alarm.state === 'ACTIVE_UNACK' ? 'bg-red-900 text-white' :
                        alarm.state === 'ACTIVE_ACK' ? 'bg-amber-900/80 text-amber-200' :
                        alarm.state === 'CLEARED_UNACK' ? 'bg-blue-900 text-blue-200' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {alarm.state}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="font-bold text-white font-tag">[{alarm.code}]</span>
                      <span className="text-[11px] text-slate-400 font-tag block">{alarm.tag}</span>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        isCrit ? 'bg-red-950 text-red-300 border border-red-800' :
                        isWarn ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        'bg-blue-950 text-blue-300 border border-blue-800'
                      }`}>
                        {alarm.severity}
                      </span>
                    </td>

                    <td className="py-2.5 px-3">
                      <strong className="text-white block font-semibold">{alarm.title}</strong>
                      <span className="text-xs text-slate-400">{alarm.description}</span>
                    </td>

                    <td className="py-2.5 px-3 text-slate-400 text-xs font-tag whitespace-nowrap">
                      {new Date(alarm.timestamp).toLocaleTimeString()}
                    </td>

                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      {isUnack ? (
                        <button
                          onClick={() => dispatch({ type: 'ACKNOWLEDGE_ALARM', alarmId: alarm.id })}
                          className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg shadow transition-colors cursor-pointer"
                        >
                          Acknowledge
                        </button>
                      ) : alarm.state === 'CLEARED' ? (
                        <span className="text-xs text-emerald-400 font-semibold">Cleared</span>
                      ) : (
                        <span className="text-xs text-slate-500 font-medium">Acknowledged</span>
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
