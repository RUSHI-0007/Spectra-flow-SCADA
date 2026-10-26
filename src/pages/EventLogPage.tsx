// ============================================================================
// Page 6: SCADA Event Logs & Audit Historian
// 21 CFR Part 11 Electronic Records • Persistent LocalStorage • Search & CSV Export
// ============================================================================

import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Download, 
  Trash2, 
  Filter, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import { useScada } from '../context/ScadaContext';
import { exportEventLogsCsv } from '../utils/csvExport';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

export const EventLogPage: React.FC = () => {
  const { state, dispatch } = useScada();
  const { events } = state;

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('ALL');
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
    <div className="space-y-5 animate-in fade-in duration-150">
      
      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-black font-mono text-white uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            SCADA Sequence of Events (SOE) Audit Trail
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Immutable 21 CFR Part 11 operator actions, state transitions, and protective trip logs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportEventLogsCsv(filteredEvents)}
            disabled={filteredEvents.length === 0}
            className="px-3 py-1.5 text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            Export CSV
          </button>

          <button
            onClick={() => setShowClearConfirm(true)}
            disabled={events.length === 0}
            className="px-3 py-1.5 text-xs font-mono font-bold bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-800 rounded transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Log
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-md">
        
        {/* Type Filter Buttons */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-mono text-slate-400 mr-1.5 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            Type:
          </span>
          {['ALL', 'STATE_CHANGE', 'OPERATOR_ACTION', 'FAULT', 'ALARM', 'SORTING', 'SYSTEM'].map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-2.5 py-1 text-[11px] font-mono rounded font-semibold transition-colors cursor-pointer ${
                filterType === t
                  ? 'bg-cyan-600 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative min-w-[260px]">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search log descriptions or sources..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1 bg-slate-950 border border-slate-800 rounded text-xs font-mono text-slate-200 focus:outline-hidden focus:border-cyan-500"
          />
        </div>

      </div>

      {/* Events Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl max-h-[500px] overflow-y-auto">
        <table className="w-full text-left font-mono text-xs">
          <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 text-[10px] uppercase sticky top-0 z-10">
            <tr>
              <th className="py-2.5 px-3">Timestamp</th>
              <th className="py-2.5 px-3">Event Type</th>
              <th className="py-2.5 px-3">Source Channel</th>
              <th className="py-2.5 px-3">Event Description</th>
              <th className="py-2.5 px-3 text-right">Operator</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-500">
                  <CheckCircle2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  No events found matching current search/filter.
                </td>
              </tr>
            ) : (
              filteredEvents.map(evt => (
                <tr key={evt.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2 px-3 text-slate-400 whitespace-nowrap text-[11px]">
                    {evt.timeStr}
                  </td>
                  <td className="py-2 px-3 whitespace-nowrap">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      evt.type === 'FAULT' ? 'bg-red-950 text-red-300 border border-red-800' :
                      evt.type === 'ALARM' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                      evt.type === 'OPERATOR_ACTION' ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                      evt.type === 'SORTING' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {evt.type}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-cyan-300 font-bold whitespace-nowrap text-[11px]">
                    {evt.source}
                  </td>
                  <td className="py-2 px-3 text-slate-200">
                    {evt.description}
                  </td>
                  <td className="py-2 px-3 text-right text-slate-400 text-[11px] whitespace-nowrap">
                    {evt.operator}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        title="Clear Event Log History"
        message="This action will delete all recorded sequence-of-events history from local storage. Are you sure you wish to clear the audit trail?"
        confirmLabel="Clear Log"
        isDestructive={true}
        onConfirm={() => {
          dispatch({ type: 'CLEAR_EVENT_LOG' });
          setShowClearConfirm(false);
        }}
        onCancel={() => setShowClearConfirm(false)}
      />

    </div>
  );
};
