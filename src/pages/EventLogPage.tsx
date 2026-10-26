// ============================================================================
// Page 6: Event Historian & Sequence of Events (SOE) Audit Trail
// Persistent event log of operator actions, state transitions, and trip logs
// ============================================================================

import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Trash2, 
  Search, 
  Filter
} from 'lucide-react';
import { useScada } from '../context/ScadaContext';
import { exportEventLogsCsv } from '../utils/csvExport';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { HelpTooltip } from '../components/common/HelpTooltip';

export const EventLogPage: React.FC = () => {
  const { state, dispatch } = useScada();
  const { events } = state;

  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

  const filteredEvents = events.filter(e => {
    const matchesType = filterType === 'ALL' || e.type === filterType;
    const matchesSearch = 
      e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.operator.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-150 w-full">
      
      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            Sequence of Events (SOE) Audit Trail
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Persistent event log of operator actions, state transitions, and protective trip logs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportEventLogsCsv(filteredEvents)}
            disabled={filteredEvents.length === 0}
            className="px-3.5 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            Export CSV
          </button>

          <button
            onClick={() => setShowClearConfirm(true)}
            disabled={events.length === 0}
            className="px-3.5 py-1.5 text-xs font-semibold bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Log
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3 rounded-xl shadow-md">
        
        {/* Type Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1 text-xs">
          <span className="text-slate-400 mr-1.5 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Category:
          </span>
          {['ALL', 'STATE_CHANGE', 'OPERATOR_ACTION', 'FAULT', 'ALARM', 'SORTING', 'SYSTEM'].map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                filterType === t
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {t === 'ALL' ? 'All' :
               t === 'STATE_CHANGE' ? 'State Changes' :
               t === 'OPERATOR_ACTION' ? 'Operator' :
               t === 'FAULT' ? 'Faults' :
               t === 'ALARM' ? 'Alarms' :
               t === 'SORTING' ? 'Sorting' : 'System'}
            </button>
          ))}
        </div>

        {/* Search Field (Generous unclipped width) */}
        <div className="relative flex-1 sm:max-w-xs min-w-[220px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search logs or sources..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500 transition-colors"
          />
        </div>

      </div>

      {/* Events Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl max-h-[500px] overflow-y-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 text-[11px] uppercase sticky top-0 z-10">
            <tr>
              <th className="py-2.5 px-3">Timestamp</th>
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-3">Source Channel</th>
              <th className="py-2.5 px-3">Description</th>
              <th className="py-2.5 px-3 text-right">User / Engine</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-500">
                  No logged events match the active search/filter.
                </td>
              </tr>
            ) : (
              filteredEvents.map(evt => {
                const isFault = evt.type === 'FAULT';
                const isAlarm = evt.type === 'ALARM';
                const isSorting = evt.type === 'SORTING';
                const isStateChange = evt.type === 'STATE_CHANGE';

                return (
                  <tr key={evt.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 text-slate-400 font-tag whitespace-nowrap text-xs">
                      {evt.timeStr}
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        isFault
                          ? 'bg-red-950 text-red-300 border border-red-800'
                          : isAlarm
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : isSorting
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : isStateChange
                          ? 'bg-blue-950 text-blue-300 border border-blue-800'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {evt.type}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-slate-300 font-tag text-xs whitespace-nowrap">
                      {evt.source}
                    </td>

                    <td className="py-2.5 px-3 text-slate-200">
                      {evt.description}
                    </td>

                    <td className="py-2.5 px-3 text-right text-slate-400 text-xs whitespace-nowrap">
                      {evt.operator}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Confirmation Dialog for Clearing Event Log */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        title="Clear Event Log History"
        message="Are you sure you want to purge all sequence of events records from memory?"
        confirmLabel="Purge Log"
        onConfirm={() => {
          dispatch({ type: 'CLEAR_EVENT_LOG' });
          setShowClearConfirm(false);
        }}
        onCancel={() => setShowClearConfirm(false)}
      />

    </div>
  );
};
