// ============================================================================
// Page 7: Tag Database & PLC I/O Table (Light Industrial HMI Theme)
// Displays live updating SCADA tags and memory registers
// Neutral cards, monospace addresses, stacked mobile cards
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
    <div className="space-y-4 md:space-y-5 animate-in fade-in duration-150 w-full">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#D5DBE1]">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-[#1F2933] flex items-center gap-2">
            <Binary className="w-5 h-5 text-[#3B4651]" />
            PLC Memory Tag Database &amp; I/O Mapping
          </h1>
          <p className="text-xs text-[#52606D] mt-0.5">
            IEC 61131-3 register addresses • Live driver memory polling table
          </p>
        </div>

        <span className="text-xs bg-white border border-[#D5DBE1] text-[#52606D] px-3 py-1 rounded-lg font-medium shadow-xs">
          Simulated PLC Registers
        </span>
      </div>

      {/* Info Callout explaining SCADA concepts */}
      <div className="bg-white border border-[#D5DBE1] rounded-lg p-3.5 sm:p-4 shadow-xs flex items-start gap-3">
        <Info className="w-5 h-5 text-[#3B4651] shrink-0 mt-0.5" />
        <div className="text-xs text-[#52606D] leading-relaxed space-y-1">
          <strong className="text-[#1F2933] block font-semibold">
            SCADA Automation Concept: Tag-Based Architecture
          </strong>
          <p>
            In industrial automation, HMI graphics communicate through a standardized <strong>Tag Database</strong>. Digital inputs (<span className="text-[#3B4651] font-tag font-bold">%IX</span>), digital outputs (<span className="text-[#2E7D32] font-tag font-bold">%QX</span>), and analog memory registers (<span className="text-[#B7791F] font-tag font-bold">%MD, %MW</span>) represent the physical device states.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-[#D5DBE1] p-3 rounded-lg shadow-xs">
        
        {/* Direction Filter (Horizontally scrollable chips on mobile) */}
        <div className="flex items-center gap-1 text-xs overflow-x-auto pb-1 max-w-full">
          <span className="text-[#52606D] mr-1.5 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            Channel Type:
          </span>
          {(['ALL', 'INPUT', 'OUTPUT', 'INTERNAL'] as const).map(dir => (
            <button
              key={dir}
              onClick={() => setDirectionFilter(dir)}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer shrink-0 min-h-[36px] ${
                directionFilter === dir
                  ? 'bg-[#3B4651] text-white font-semibold'
                  : 'text-[#52606D] hover:text-[#1F2933] hover:bg-[#E2E6EA]'
              }`}
            >
              {dir}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative flex-1 sm:max-w-xs min-w-[200px]">
          <Search className="w-4 h-4 text-[#9AA5B1] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tags or addresses..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#F5F6F8] border border-[#D5DBE1] rounded-lg text-xs text-[#1F2933] placeholder:text-[#9AA5B1] focus:outline-hidden focus:border-[#3B4651] transition-colors min-h-[36px]"
          />
        </div>

      </div>

      {/* Mobile Stacked Cards (<md) */}
      <div className="md:hidden space-y-2.5">
        {filteredTags.length === 0 ? (
          <div className="bg-white border border-[#D5DBE1] rounded-lg p-6 text-center text-[#52606D] text-xs">
            No PLC tags match your query.
          </div>
        ) : (
          filteredTags.map(tag => {
            const isBool = tag.type === 'BOOL';
            const boolActive = tag.value === true || tag.value === 1;

            return (
              <div 
                key={tag.name}
                className="bg-white border border-[#D5DBE1] rounded-lg p-3 text-xs space-y-1.5 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-tag text-[#3B4651] font-bold text-xs">{tag.address}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] bg-[#F5F6F8] px-1.5 py-0.5 rounded text-[#52606D] border border-[#E4E7EB] font-tag">
                      {tag.type}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      tag.direction === 'INPUT' ? 'bg-[#F5F6F8] text-[#3B4651] border border-[#D5DBE1]' :
                      tag.direction === 'OUTPUT' ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7]' :
                      'bg-[#E2E6EA] text-[#52606D]'
                    }`}>
                      {tag.direction}
                    </span>
                  </div>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <span className="font-tag text-[#1F2933] font-semibold">{tag.name}</span>
                  <div className="font-tag font-bold">
                    {isBool ? (
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] ${
                        boolActive
                          ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7]'
                          : 'bg-[#E2E6EA] text-[#6B7785]'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${boolActive ? 'bg-[#2E7D32]' : 'bg-[#6B7785]'}`}></span>
                        {boolActive ? '1' : '0'}
                      </span>
                    ) : (
                      <span className="text-[#1F2933]">
                        {typeof tag.value === 'number' ? tag.value.toFixed(1) : String(tag.value)}
                        {tag.unit && <span className="text-[#52606D] font-normal ml-0.5">{tag.unit}</span>}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-[11px] text-[#52606D] pt-1 border-t border-[#E4E7EB]">
                  {tag.description}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop/Tablet Tags Table (hidden on mobile md+) */}
      <div className="hidden md:block bg-white border border-[#D5DBE1] rounded-lg overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F5F6F8] border-b border-[#D5DBE1] text-[#52606D] text-[11px] uppercase">
            <tr>
              <th className="py-2.5 px-3">PLC Address</th>
              <th className="py-2.5 px-3">Tag Identifier</th>
              <th className="py-2.5 px-3">Data Type</th>
              <th className="py-2.5 px-3">I/O Direction</th>
              <th className="py-2.5 px-3">Live Value</th>
              <th className="py-2.5 px-3">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E4E7EB] font-sans">
            {filteredTags.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[#52606D]">
                  No PLC tags match your query.
                </td>
              </tr>
            ) : (
              filteredTags.map(tag => {
                const isBool = tag.type === 'BOOL';
                const boolActive = tag.value === true || tag.value === 1;

                return (
                  <tr key={tag.name} className="hover:bg-[#F5F6F8] transition-colors">
                    <td className="py-2.5 px-3 font-tag text-[#3B4651] font-bold whitespace-nowrap">
                      {tag.address}
                    </td>

                    <td className="py-2.5 px-3 font-tag text-[#1F2933] font-semibold whitespace-nowrap">
                      {tag.name}
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="text-[10px] bg-[#F5F6F8] px-1.5 py-0.5 rounded text-[#52606D] font-tag border border-[#E4E7EB]">
                        {tag.type}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        tag.direction === 'INPUT' ? 'bg-[#F5F6F8] text-[#3B4651] border border-[#D5DBE1]' :
                        tag.direction === 'OUTPUT' ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7]' :
                        'bg-[#E2E6EA] text-[#52606D]'
                      }`}>
                        {tag.direction}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 font-tag font-bold whitespace-nowrap">
                      {isBool ? (
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] ${
                          boolActive
                            ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7]'
                            : 'bg-[#E2E6EA] text-[#6B7785]'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${boolActive ? 'bg-[#2E7D32]' : 'bg-[#6B7785]'}`}></span>
                          {boolActive ? 'TRUE (1)' : 'FALSE (0)'}
                        </span>
                      ) : (
                        <span className="text-[#1F2933] text-xs">
                          {typeof tag.value === 'number' ? tag.value.toFixed(1) : String(tag.value)}
                          {tag.unit && <span className="text-[#52606D] font-normal ml-1 text-[11px]">{tag.unit}</span>}
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-[#52606D] text-xs">
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
