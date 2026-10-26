// ============================================================================
// Page 7: Tag Database & PLC I/O Table
// Displays live updating SCADA tags, memory registers (%IX, %QX, %MD, %MW)
// Notice: Educational presentation of simulator state; labeled as SIMULATED.
// ============================================================================

import React, { useState } from 'react';
import { 
  Binary, 
  Search, 
  Filter, 
  Cpu, 
  RefreshCw, 
  CheckCircle2, 
  Info 
} from 'lucide-react';
import { useScada } from '../context/ScadaContext';
import { TagDatabase } from '../simulation/tagDatabase';
import { TagDirection, TagType } from '../types/scada';

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
    <div className="space-y-5 animate-in fade-in duration-150">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-black font-mono text-white uppercase tracking-wider flex items-center gap-2">
            <Binary className="w-5 h-5 text-cyan-400" />
            PLC Memory Tag Database & I/O Mapping
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            IEC 61131-3 Register Addresses • Live Polling & Driver Memory Image
          </p>
        </div>

        <span className="text-xs bg-amber-950 border border-amber-600 text-amber-300 px-3 py-1 rounded font-mono font-bold">
          SIMULATED PLC REGISTERS
        </span>
      </div>

      {/* Info Callout explaining SCADA concepts for evaluators */}
      <div className="bg-slate-900 border border-cyan-500/40 rounded-xl p-4 shadow-xl flex items-start gap-3">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs font-mono text-slate-300 leading-relaxed space-y-1">
          <strong className="text-white block font-bold">
            SCADA Automation Architecture Concept: Tag-Based Decoupling
          </strong>
          <p>
            In industrial SCADA/HMI platforms (such as Wonderware InTouch, Ignition, WinCC), graphics and business logic never communicate with raw hardware pins directly. Instead, an OPC UA / Modbus driver continuously scans PLC registers into a named <strong>Tag Database</strong>. Digital inputs (<code className="text-cyan-300">%IX</code>), outputs (<code className="text-emerald-300">%QX</code>), and analog memory registers (<code className="text-amber-300">%MD, %MW</code>) map directly to equipment parameters.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-md">
        
        {/* Direction Filter */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-mono text-slate-400 mr-1.5 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            I/O Channel:
          </span>
          {(['ALL', 'INPUT', 'OUTPUT', 'INTERNAL'] as const).map(dir => (
            <button
              key={dir}
              onClick={() => setDirectionFilter(dir)}
              className={`px-2.5 py-1 text-[11px] font-mono rounded font-semibold transition-colors cursor-pointer ${
                directionFilter === dir
                  ? 'bg-cyan-600 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {dir}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative min-w-[260px]">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tag name, address (%IX), or description..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1 bg-slate-950 border border-slate-800 rounded text-xs font-mono text-slate-200 focus:outline-hidden focus:border-cyan-500"
          />
        </div>

      </div>

      {/* Live Tags Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <table className="w-full text-left font-mono text-xs">
          <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 text-[10px] uppercase">
            <tr>
              <th className="py-2.5 px-3">Tag Identifier</th>
              <th className="py-2.5 px-3">PLC Address</th>
              <th className="py-2.5 px-3">Data Type</th>
              <th className="py-2.5 px-3">Direction</th>
              <th className="py-2.5 px-3">Current Value (Live)</th>
              <th className="py-2.5 px-3">Description & Engineering Units</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredTags.map(tag => {
              const isBool = tag.type === 'BOOL';
              const boolVal = tag.value as boolean;

              return (
                <tr key={tag.name} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-cyan-300">
                    {tag.name}
                  </td>

                  <td className="py-2.5 px-3 text-slate-300 font-bold">
                    <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-[11px]">
                      {tag.address}
                    </span>
                  </td>

                  <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                    {tag.type}
                  </td>

                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                      tag.direction === 'INPUT' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                      tag.direction === 'OUTPUT' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                      'bg-purple-950 text-purple-300 border border-purple-800'
                    }`}>
                      {tag.direction}
                    </span>
                  </td>

                  <td className="py-2.5 px-3 font-bold">
                    {isBool ? (
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] ${
                        boolVal
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500 led-glow-green'
                          : 'bg-slate-950 text-slate-500 border border-slate-800'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${boolVal ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                        {boolVal ? 'TRUE (1)' : 'FALSE (0)'}
                      </span>
                    ) : (
                      <span className="text-white text-sm">
                        {String(tag.value)} {tag.unit && <span className="text-xs text-slate-400 font-normal">{tag.unit}</span>}
                      </span>
                    )}
                  </td>

                  <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                    {tag.description}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
};
