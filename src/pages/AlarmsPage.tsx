// ============================================================================
// Page 4: Alarm Annunciator & Management (Light Industrial HMI Theme)
// ISA-18.2-inspired alarm lifecycle, prioritized safety fault matrix
// Red rows for active faults against calm grey, stacked cards on mobile
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
  const [stateFilter] = useState<string>('ALL');

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
    <div className="space-y-4 md:space-y-5 animate-in fade-in duration-150 w-full">
      
      {/* Header & Global Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#D5DBE1]">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-[#1F2933] flex items-center gap-2">
            <Bell className={`w-5 h-5 text-[#C62828] ${unackCount > 0 ? 'animate-bounce' : ''}`} />
            Alarm Annunciator &amp; Management
          </h1>
          <p className="text-xs text-[#52606D] mt-0.5">
            ISA-18.2-inspired alarm lifecycle • Prioritized safety fault matrix
          </p>
        </div>

        {/* Global Alarm Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => dispatch({ type: 'UPDATE_SETTINGS', settings: { audioMuted: !settings.audioMuted } })}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer min-h-[44px] ${
              settings.audioMuted ? 'bg-[#F5F6F8] text-[#52606D] border-[#D5DBE1]' : 'bg-white text-[#3B4651] border-[#3B4651]'
            }`}
          >
            {settings.audioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            {settings.audioMuted ? 'Buzzer Muted' : 'Audible Siren Armed'}
          </button>

          <button
            onClick={() => dispatch({ type: 'ACKNOWLEDGE_ALL_ALARMS' })}
            disabled={unackCount === 0}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 min-h-[44px] ${
              unackCount > 0
                ? 'bg-[#D98200] hover:bg-[#B86E00] text-white cursor-pointer shadow-xs'
                : 'bg-[#E2E6EA] text-[#9AA5B1] border border-[#CBD2D9] cursor-not-allowed opacity-60'
            }`}
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Acknowledge All ({unackCount})</span>
            <HelpTooltip term="Acknowledge" explanation="Silences the siren and marks the alarm as seen. The machine will not restart until the physical fault is cleared." />
          </button>

          <button
            onClick={handleExportCsv}
            disabled={alarms.length === 0}
            className="px-3 py-1.5 text-xs font-semibold bg-white hover:bg-[#F5F6F8] text-[#1F2933] border border-[#D5DBE1] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer min-h-[44px]"
          >
            <Download className="w-3.5 h-3.5 text-[#3B4651]" />
            Export CSV
          </button>
        </div>
      </div>

      {/* 4 Primary Annunciator Summary Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        
        <div className="bg-white border border-[#D5DBE1] rounded-lg p-3.5 shadow-xs">
          <div className="text-xs text-[#52606D] font-medium">Total Logged Alarms</div>
          <div className="text-2xl md:text-3xl font-bold font-tag text-[#1F2933] mt-1">{alarms.length}</div>
          <div className="text-[11px] text-[#52606D]">Historical buffer</div>
        </div>

        <div className={`bg-white border rounded-lg p-3.5 shadow-xs ${
          criticalCount > 0 ? 'border-[#EF9A9A] bg-[#FFEBEE]' : 'border-[#D5DBE1]'
        }`}>
          <div className={`text-xs font-medium flex items-center justify-between ${criticalCount > 0 ? 'text-[#C62828]' : 'text-[#52606D]'}`}>
            <span>Critical Tripped</span>
            {criticalCount > 0 && <span className="w-2 h-2 rounded-full bg-[#C62828] animate-ping"></span>}
          </div>
          <div className={`text-2xl md:text-3xl font-bold font-tag mt-1 ${criticalCount > 0 ? 'text-[#C62828]' : 'text-[#1F2933]'}`}>
            {criticalCount}
          </div>
          <div className={`text-[11px] ${criticalCount > 0 ? 'text-[#C62828]' : 'text-[#52606D]'}`}>Auto-stop interlocks</div>
        </div>

        <div className={`bg-white border rounded-lg p-3.5 shadow-xs ${
          warningCount > 0 ? 'border-[#FFE082] bg-[#FFF8E1]' : 'border-[#D5DBE1]'
        }`}>
          <div className={`text-xs font-medium ${warningCount > 0 ? 'text-[#D98200]' : 'text-[#52606D]'}`}>Warnings</div>
          <div className={`text-2xl md:text-3xl font-bold font-tag mt-1 ${warningCount > 0 ? 'text-[#D98200]' : 'text-[#1F2933]'}`}>{warningCount}</div>
          <div className={`text-[11px] ${warningCount > 0 ? 'text-[#D98200]' : 'text-[#52606D]'}`}>Supervisory cautions</div>
        </div>

        <div className={`bg-white border rounded-lg p-3.5 shadow-xs ${
          unackCount > 0 ? 'border-[#EF9A9A] bg-[#FFEBEE]' : 'border-[#D5DBE1]'
        }`}>
          <div className={`text-xs flex items-center justify-between ${unackCount > 0 ? 'text-[#C62828]' : 'text-[#52606D]'}`}>
            <span>Unacknowledged</span>
            {unackCount > 0 && <span className="w-2 h-2 rounded-full bg-[#C62828] animate-pulse"></span>}
          </div>
          <div className={`text-2xl md:text-3xl font-bold font-tag mt-1 ${unackCount > 0 ? 'text-[#C62828]' : 'text-[#1F2933]'}`}>{unackCount}</div>
          <div className={`text-[11px] ${unackCount > 0 ? 'text-[#C62828]' : 'text-[#52606D]'}`}>Requires operator sign-off</div>
        </div>

      </div>

      {/* Fault Injection Console for Live Testing */}
      <div className="bg-white border border-[#D5DBE1] rounded-lg p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#D5DBE1]">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#D98200]" />
            <h3 className="text-xs font-semibold text-[#1F2933]">
              Fault injection testing
            </h3>
            <HelpTooltip term="Fault Testing" explanation="Click any tile to inject a hardware failure and observe the automatic interlock trip." />
          </div>
          <span className="text-xs text-[#52606D]">
            Simulates real field hardware failures
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          
          <button
            onClick={() => dispatch({ type: 'INJECT_FAULT', fault: 'jam', value: !activeFaults.jam })}
            className={`p-3 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer min-h-[44px] ${
              activeFaults.jam
                ? 'bg-[#FFEBEE] border-[#EF9A9A] text-[#C62828]'
                : 'bg-[#F5F6F8] border-[#D5DBE1] text-[#1F2933] hover:border-[#9AA5B1]'
            }`}
          >
            <AlertTriangle className="w-5 h-5 text-[#D98200]" />
            <span>1. Conveyor Jam</span>
            <span className="text-[10px] text-[#52606D] font-tag font-normal">{activeFaults.jam ? 'ACTIVE (TRIP)' : 'TEST TRIP'}</span>
          </button>

          <button
            onClick={() => dispatch({ type: 'INJECT_FAULT', fault: 'motorOverload', value: !activeFaults.motorOverload })}
            className={`p-3 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer min-h-[44px] ${
              activeFaults.motorOverload
                ? 'bg-[#FFEBEE] border-[#EF9A9A] text-[#C62828]'
                : 'bg-[#F5F6F8] border-[#D5DBE1] text-[#1F2933] hover:border-[#9AA5B1]'
            }`}
          >
            <Flame className="w-5 h-5 text-[#C62828]" />
            <span>2. Motor Overload</span>
            <span className="text-[10px] text-[#52606D] font-tag font-normal">{activeFaults.motorOverload ? 'ACTIVE (>80°C)' : 'TEST TRIP'}</span>
          </button>

          <button
            onClick={() => dispatch({ type: 'INJECT_FAULT', fault: 'sensorMalfunction', value: !activeFaults.sensorMalfunction })}
            className={`p-3 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer min-h-[44px] ${
              activeFaults.sensorMalfunction
                ? 'bg-[#FFF8E1] border-[#FFE082] text-[#D98200]'
                : 'bg-[#F5F6F8] border-[#D5DBE1] text-[#1F2933] hover:border-[#9AA5B1]'
            }`}
          >
            <Radio className="w-5 h-5 text-[#3B4651]" />
            <span>3. Sensor Error</span>
            <span className="text-[10px] text-[#52606D] font-tag font-normal">{activeFaults.sensorMalfunction ? 'ACTIVE (DIRTY)' : 'TEST TRIP'}</span>
          </button>

          <button
            onClick={() => dispatch({ type: 'INJECT_FAULT', fault: 'productionBacklog', value: !activeFaults.productionBacklog })}
            className={`p-3 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer min-h-[44px] ${
              activeFaults.productionBacklog
                ? 'bg-[#FFF8E1] border-[#FFE082] text-[#D98200]'
                : 'bg-[#F5F6F8] border-[#D5DBE1] text-[#1F2933] hover:border-[#9AA5B1]'
            }`}
          >
            <Layers className="w-5 h-5 text-[#3B4651]" />
            <span>4. Buffer Backlog</span>
            <span className="text-[10px] text-[#52606D] font-tag font-normal">{activeFaults.productionBacklog ? 'ACTIVE' : 'TEST WARNING'}</span>
          </button>

          <button
            onClick={() => dispatch({ type: 'ESTOP_COMMAND' })}
            className="p-3 rounded-lg bg-[#FFEBEE] hover:bg-[#FFCDD2] border border-[#EF9A9A] text-[#C62828] text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer min-h-[44px]"
          >
            <ShieldAlert className="w-5 h-5 text-[#C62828]" />
            <span>5. Emergency Stop</span>
            <span className="text-[10px] text-[#C62828] font-tag font-normal">HARD RELAY TRIP</span>
          </button>

        </div>
      </div>

      {/* Filter Tabs - scrollable chips on mobile */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 text-xs overflow-x-auto pb-1 max-w-full">
          <span className="text-[#52606D] mr-2 shrink-0">Severity:</span>
          {(['ALL', 'CRITICAL', 'MAJOR', 'WARNING', 'INFO'] as const).map(sev => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer shrink-0 min-h-[36px] ${
                severityFilter === sev
                  ? 'bg-[#3B4651] text-white font-semibold'
                  : 'text-[#52606D] hover:text-[#1F2933] hover:bg-[#E2E6EA]'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <button
          onClick={() => dispatch({ type: 'CLEAR_HISTORICAL_ALARMS' })}
          className="text-xs text-[#52606D] hover:text-[#1F2933] flex items-center gap-1 cursor-pointer min-h-[36px]"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear Cleared Alarms
        </button>
      </div>

      {/* Mobile Stacked Cards (<md) */}
      <div className="md:hidden space-y-2.5">
        {filteredAlarms.length === 0 ? (
          <div className="bg-white border border-[#D5DBE1] rounded-lg p-6 text-center text-[#52606D] text-xs">
            <CheckCheck className="w-8 h-8 text-[#2E7D32] mx-auto mb-2" />
            No alarms found matching criteria. Safety systems operational.
          </div>
        ) : (
          filteredAlarms.map(alarm => {
            const isUnack = alarm.state === 'ACTIVE_UNACK';
            const isCrit = alarm.severity === 'CRITICAL';
            const isWarn = alarm.severity === 'WARNING';

            return (
              <div 
                key={alarm.id}
                className={`p-3 rounded-lg border text-xs space-y-2 transition-colors ${
                  isUnack 
                    ? isCrit 
                      ? 'bg-[#FFEBEE] border-[#EF9A9A]' 
                      : 'bg-[#FFF8E1] border-[#FFE082]'
                    : 'bg-white border-[#D5DBE1]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-tag font-semibold ${
                    alarm.state === 'ACTIVE_UNACK' ? 'bg-[#C62828] text-white' :
                    alarm.state === 'ACTIVE_ACK' ? 'bg-[#D98200] text-white' :
                    alarm.state === 'CLEARED_UNACK' ? 'bg-[#3B4651] text-white' :
                    'bg-[#E2E6EA] text-[#52606D]'
                  }`}>
                    {alarm.state}
                  </span>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    isCrit ? 'bg-[#FFEBEE] text-[#C62828] border border-[#EF9A9A]' :
                    isWarn ? 'bg-[#FFF8E1] text-[#D98200] border border-[#FFE082]' :
                    'bg-[#F5F6F8] text-[#52606D] border border-[#D5DBE1]'
                  }`}>
                    {alarm.severity}
                  </span>
                </div>

                <div>
                  <div className="font-bold text-[#1F2933] font-tag">
                    [{alarm.code}] {alarm.title}
                  </div>
                  <div className="text-[11px] text-[#52606D] font-tag mt-0.5">
                    Tag: {alarm.tag} • Time: {new Date(alarm.timestamp).toLocaleTimeString()}
                  </div>
                  <p className="text-xs text-[#52606D] mt-1">
                    {alarm.description}
                  </p>
                </div>

                {isUnack && (
                  <button
                    onClick={() => dispatch({ type: 'ACKNOWLEDGE_ALARM', alarmId: alarm.id })}
                    className="w-full py-2 bg-[#D98200] hover:bg-[#B86E00] text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer min-h-[44px]"
                  >
                    Acknowledge Alarm
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Desktop/Tablet Annunciator Table (hidden on mobile md+) */}
      <div className="hidden md:block bg-white border border-[#D5DBE1] rounded-lg overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F5F6F8] border-b border-[#D5DBE1] text-[#52606D] text-[11px] uppercase">
            <tr>
              <th className="py-2.5 px-3">State</th>
              <th className="py-2.5 px-3">Code &amp; Tag</th>
              <th className="py-2.5 px-3">Severity</th>
              <th className="py-2.5 px-3">Description</th>
              <th className="py-2.5 px-3">Trip Time</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E4E7EB] font-sans">
            {filteredAlarms.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[#52606D]">
                  <CheckCheck className="w-8 h-8 text-[#2E7D32] mx-auto mb-2" />
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
                          ? 'bg-[#FFEBEE] text-[#C62828] font-medium'
                          : 'bg-[#FFF8E1] text-[#D98200] font-medium'
                        : 'hover:bg-[#F5F6F8] text-[#1F2933]'
                    }`}
                  >
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-tag font-semibold ${
                        alarm.state === 'ACTIVE_UNACK' ? 'bg-[#C62828] text-white' :
                        alarm.state === 'ACTIVE_ACK' ? 'bg-[#D98200] text-white' :
                        alarm.state === 'CLEARED_UNACK' ? 'bg-[#3B4651] text-white' :
                        'bg-[#E2E6EA] text-[#52606D]'
                      }`}>
                        {alarm.state}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="font-bold text-[#1F2933] font-tag">[{alarm.code}]</span>
                      <span className="text-[11px] text-[#52606D] font-tag block">{alarm.tag}</span>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        isCrit ? 'bg-[#FFEBEE] text-[#C62828] border border-[#EF9A9A]' :
                        isWarn ? 'bg-[#FFF8E1] text-[#D98200] border border-[#FFE082]' :
                        'bg-[#F5F6F8] text-[#52606D] border border-[#D5DBE1]'
                      }`}>
                        {alarm.severity}
                      </span>
                    </td>

                    <td className="py-2.5 px-3">
                      <strong className="text-[#1F2933] block font-semibold">{alarm.title}</strong>
                      <span className="text-xs text-[#52606D]">{alarm.description}</span>
                    </td>

                    <td className="py-2.5 px-3 text-[#52606D] text-xs font-tag whitespace-nowrap">
                      {new Date(alarm.timestamp).toLocaleTimeString()}
                    </td>

                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      {isUnack ? (
                        <button
                          onClick={() => dispatch({ type: 'ACKNOWLEDGE_ALARM', alarmId: alarm.id })}
                          className="px-3 py-1 bg-[#D98200] hover:bg-[#B86E00] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer min-h-[36px]"
                        >
                          Acknowledge
                        </button>
                      ) : alarm.state === 'CLEARED' ? (
                        <span className="text-xs text-[#2E7D32] font-semibold">Cleared</span>
                      ) : (
                        <span className="text-xs text-[#52606D] font-medium">Acknowledged</span>
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
