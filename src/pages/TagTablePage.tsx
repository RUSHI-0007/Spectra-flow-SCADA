// ============================================================================
// Page 7: Tag Database & PLC I/O Table
// Displays live updating SCADA tags and memory registers
// ============================================================================

import React, { useState } from 'react';
import { 
  Binary, 
  Search, 
  Filter, 
  Info 
} from 'lucide-react';
import { useScada } from '../context/ScadaContext';
import { TagDatabase } from '../simulation/tagDatabase';
import { TagDirection } from '../types/scada';
import { HelpTooltip } from '../components/common/HelpTooltip';

export const TagTablePage: React.FC = () => {
  const { state } = useScada();
  const { machineState, motor, sensor, diverter, counters, activeFaults } = state;

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [directionFilter, setDirectionFilter] = useState<'ALL' | TagDirection>('ALL');

  const tags = TagDatabase.generateTags(
    machineState,
    motor,
    sensor,
    diverter,
    counters,
    activeFaults
  );

  const filteredTags = tags.filter(tag => {
    const matchesDir = directionFilter === 'ALL' || tag.direction === directionFilter;
    const matchesSearch = 
      tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tag.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tag.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDir && matchesSearch;
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-150 w-full">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Binary className="w-5 h-5 text-blue-500" />
            PLC Memory Tag Database &amp; I/O Mapping
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            IEC 61131-3 register addresses • Live driver memory polling table
          </p>
        </div>

        <span className="text-xs bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1 rounded-lg font-medium">
          Simulated PLC Registers
        </span>
      </div>

      {/* Info Callout explaining SCADA concepts */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed space-y-1">
          <strong className="text-white block font-semibold">
            SCADA Automation Concept: Tag-Based Architecture
          </strong>
          <p>
            In industrial automation, HMI graphics communicate through a standardized <strong>Tag Database</strong>. Digital inputs (<span className="text-blue-300 font-tag">%IX</span>), digital outputs (<span className="text-emerald-300 font-tag">%QX</span>), and analog memory registers (<span className="text-amber-300 font-tag">%MD, %MW</span>) represent the physical device states.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3 rounded-xl shadow-md">
        
        {/* Direction Filter */}
        <div className="flex flex-wrap items-center gap-1 text-xs">
          <span className="text-slate-400 mr-1.5 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Channel Type:
          </span>
          {(['ALL', 'INPUT', 'OUTPUT', 'INTERNAL'] as const).map(dir => (
            <button
              key={dir}
              onClick={() => setDirectionFilter(dir)}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                directionFilter === dir
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {dir}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative flex-1 sm:max-w-xs min-w-[200px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tags or addresses..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500 transition-colors"
          />
        </div>

      </div>

      {/* Tags Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 text-[11px] uppercase">
            <tr>
              <th className="py-2.5 px-3">PLC Address</th>
              <th className="py-2.5 px-3">Tag Identifier</th>
              <th className="py-2.5 px-3">Data Type</th>
              <th className="py-2.5 px-3">I/O Direction</th>
              <th className="py-2.5 px-3">Live Value</th>
              <th className="py-2.5 px-3">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {filteredTags.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  No PLC tags match your query.
                </td>
              </tr>
            ) : (
              filteredTags.map(tag => {
                const isBool = tag.type === 'BOOL';
                const boolActive = tag.value === true || tag.value === 1;

                return (
                  <tr key={tag.name} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-tag text-blue-400 font-bold whitespace-nowrap">
                      {tag.address}
                    </td>

                    <td className="py-2.5 px-3 font-tag text-slate-200 font-semibold whitespace-nowrap">
                      {tag.name}
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-tag">
                        {tag.type}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        tag.direction === 'INPUT' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                        tag.direction === 'OUTPUT' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {tag.direction}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 font-tag font-bold whitespace-nowrap">
                      {isBool ? (
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] ${
                          boolActive
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-slate-800 text-slate-500'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${boolActive ? 'bg-emerald-400' : 'bg-slate-600'}`}></span>
                          {boolActive ? 'TRUE (1)' : 'FALSE (0)'}
                        </span>
                      ) : (
                        <span className="text-white text-xs">
                          {typeof tag.value === 'number' ? tag.value.toFixed(1) : String(tag.value)}
                          {tag.unit && <span className="text-slate-400 font-normal ml-1 text-[11px]">{tag.unit}</span>}
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-slate-400 text-xs">
                      {tag.description}
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
