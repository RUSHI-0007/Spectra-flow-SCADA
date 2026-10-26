// ============================================================================
// Page 6: Event Historian & Sequence of Events (SOE) Audit Trail
// Persistent event log of operator actions, state transitions, and trip logs
// Light Industrial HMI: graphite accents, stacked mobile cards, clear typography
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
    <div className="space-y-4 md:space-y-5 animate-in fade-in duration-150 w-full">
      
      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#D5DBE1]">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-[#1F2933] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#3B4651]" />
            Sequence of Events (SOE) Audit Trail
          </h1>
          <p className="text-xs text-[#52606D] mt-0.5">
            Persistent event log of operator actions, state transitions, and protective trip logs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportEventLogsCsv(filteredEvents)}
            disabled={filteredEvents.length === 0}
            className="px-3.5 py-1.5 text-xs font-semibold bg-white hover:bg-[#F5F6F8] text-[#1F2933] border border-[#D5DBE1] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer min-h-[44px]"
          >
            <Download className="w-3.5 h-3.5 text-[#3B4651]" />
            Export CSV
          </button>

          <button
            onClick={() => setShowClearConfirm(true)}
            disabled={events.length === 0}
            className="px-3.5 py-1.5 text-xs font-semibold bg-white hover:bg-[#FFEBEE] text-[#C62828] border border-[#EF9A9A] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer min-h-[44px]"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Log
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-[#D5DBE1] p-3 rounded-lg shadow-xs">
        
        {/* Type Filter Buttons (Horizontally scrollable chips on mobile) */}
        <div className="flex items-center gap-1 text-xs overflow-x-auto pb-1 max-w-full">
          <span className="text-[#52606D] mr-1.5 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            Category:
          </span>
          {['ALL', 'STATE_CHANGE', 'OPERATOR_ACTION', 'FAULT', 'ALARM', 'SORTING', 'SYSTEM'].map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer shrink-0 min-h-[36px] ${
                filterType === t
                  ? 'bg-[#3B4651] text-white font-semibold'
                  : 'text-[#52606D] hover:text-[#1F2933] hover:bg-[#E2E6EA]'
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

        {/* Search Field */}
        <div className="relative flex-1 sm:max-w-xs min-w-[200px]">
          <Search className="w-4 h-4 text-[#9AA5B1] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search logs or sources..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#F5F6F8] border border-[#D5DBE1] rounded-lg text-xs text-[#1F2933] placeholder:text-[#9AA5B1] focus:outline-hidden focus:border-[#3B4651] transition-colors min-h-[36px]"
          />
        </div>

      </div>

      {/* Mobile Stacked Cards (<md) */}
      <div className="md:hidden space-y-2.5">
        {filteredEvents.length === 0 ? (
          <div className="bg-white border border-[#D5DBE1] rounded-lg p-6 text-center text-[#52606D] text-xs">
            No logged events match the active search/filter.
          </div>
        ) : (
          filteredEvents.map(evt => {
            const isFault = evt.type === 'FAULT';
            const isAlarm = evt.type === 'ALARM';
            const isSorting = evt.type === 'SORTING';
            const isStateChange = evt.type === 'STATE_CHANGE';

            return (
              <div 
                key={evt.id}
                className="bg-white border border-[#D5DBE1] rounded-lg p-3 text-xs space-y-1.5 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#52606D] font-tag">{evt.timeStr}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    isFault
                      ? 'bg-[#FFEBEE] text-[#C62828] border border-[#EF9A9A]'
                      : isAlarm
                      ? 'bg-[#FFF8E1] text-[#D98200] border border-[#FFE082]'
                      : isSorting
                      ? 'bg-[#F2F5F0] text-[#6B7A5A] border border-[#CCD5C5]'
                      : isStateChange
                      ? 'bg-[#F5F6F8] text-[#3B4651] border border-[#D5DBE1]'
                      : 'bg-[#E2E6EA] text-[#52606D]'
                  }`}>
                    {evt.type}
                  </span>
                </div>

                <div className="text-[#1F2933] font-medium">
                  {evt.description}
                </div>

                <div className="flex justify-between text-[11px] text-[#52606D] font-tag pt-1 border-t border-[#E4E7EB]">
                  <span>Src: {evt.source}</span>
                  <span>User: {evt.operator}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop/Tablet Events Table (hidden on mobile md+) */}
      <div className="hidden md:block bg-white border border-[#D5DBE1] rounded-lg overflow-hidden shadow-xs max-h-[500px] overflow-y-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F5F6F8] border-b border-[#D5DBE1] text-[#52606D] text-[11px] uppercase sticky top-0 z-10">
            <tr>
              <th className="py-2.5 px-3">Timestamp</th>
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-3">Source Channel</th>
              <th className="py-2.5 px-3">Description</th>
              <th className="py-2.5 px-3 text-right">User / Engine</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E4E7EB] font-sans">
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-[#52606D]">
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
                  <tr key={evt.id} className="hover:bg-[#F5F6F8] transition-colors">
                    <td className="py-2.5 px-3 text-[#52606D] font-tag whitespace-nowrap text-xs">
                      {evt.timeStr}
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        isFault
                          ? 'bg-[#FFEBEE] text-[#C62828] border border-[#EF9A9A]'
                          : isAlarm
                          ? 'bg-[#FFF8E1] text-[#D98200] border border-[#FFE082]'
                          : isSorting
                          ? 'bg-[#F2F5F0] text-[#6B7A5A] border border-[#CCD5C5]'
                          : isStateChange
                          ? 'bg-[#F5F6F8] text-[#3B4651] border border-[#D5DBE1]'
                          : 'bg-[#E2E6EA] text-[#52606D]'
                      }`}>
                        {evt.type}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-[#1F2933] font-tag text-xs whitespace-nowrap">
                      {evt.source}
                    </td>

                    <td className="py-2.5 px-3 text-[#1F2933]">
                      {evt.description}
                    </td>

                    <td className="py-2.5 px-3 text-right text-[#52606D] text-xs whitespace-nowrap">
                      {evt.operator}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Clear Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        title="Clear Sequence of Events (SOE) Log?"
        message="This will purge all historical event log records in the memory buffer. This action is irreversible."
        confirmLabel="Purge Event Log"
        isDangerous={true}
        onConfirm={() => {
          dispatch({ type: 'CLEAR_HISTORICAL_ALARMS' });
          setShowClearConfirm(false);
        }}
        onCancel={() => setShowClearConfirm(false)}
      />

    </div>
  );
};
