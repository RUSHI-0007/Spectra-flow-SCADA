// ============================================================================
// Page 5: Production Analytics & Statistical Process Control
// Real simulation charts: velocity over time, Cat A vs B, downtime, fault Pareto
// Light Industrial HMI: graphite line, olive/amber categories, light grid #E4E7EB, no gradients
// ============================================================================

import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart as PieIcon, 
  Download, 
  CheckCircle2, 
  AlertOctagon 
} from 'lucide-react';
import { useScada } from '../context/ScadaContext';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { exportProductionRecordsCsv } from '../utils/csvExport';
import { HelpTooltip } from '../components/common/HelpTooltip';

export const AnalyticsPage: React.FC = () => {
  const { state } = useScada();
  const { counters, productionHistory, alarms } = state;

  const [timeFilter, setTimeFilter] = useState<'5m' | '15m' | 'session' | 'all'>('session');

  // Filter history based on selected time window
  const getFilteredHistory = () => {
    if (productionHistory.length === 0) return [];
    const now = Date.now();
    switch (timeFilter) {
      case '5m':
        return productionHistory.filter(r => now - r.timestamp <= 5 * 60 * 1000);
      case '15m':
        return productionHistory.filter(r => now - r.timestamp <= 15 * 60 * 1000);
      case 'session':
        return productionHistory.slice(-50);
      case 'all':
      default:
        return productionHistory;
    }
  };

  const filteredHistory = getFilteredHistory();

  // Category A vs B Data for Bar Chart: Olive-grey #6B7A5A and Amber #B7791F
  const categoryData = [
    { name: 'Bin A (500ml Clear)', count: counters.categoryA, fill: '#6B7A5A' },
    { name: 'Bin B (1000ml Amber)', count: counters.categoryB, fill: '#B7791F' },
    { name: 'Defect / Scrapped', count: counters.rejectedCount, fill: '#C62828' },
  ];

  // Fault Frequency by type
  const faultCounts: Record<string, number> = {
    'Conveyor Jam (ALM-101)': 0,
    'Motor Overload (ALM-102)': 0,
    'Sensor Fault (ALM-201)': 0,
    'Emergency Stop (ALM-100)': 0,
  };

  alarms.forEach(a => {
    if (a.code === 'ALM-101') faultCounts['Conveyor Jam (ALM-101)']++;
    else if (a.code === 'ALM-102') faultCounts['Motor Overload (ALM-102)']++;
    else if (a.code === 'ALM-201') faultCounts['Sensor Fault (ALM-201)']++;
    else if (a.code === 'ALM-100') faultCounts['Emergency Stop (ALM-100)']++;
  });

  const faultData = Object.entries(faultCounts).map(([name, count]) => ({
    name,
    count,
  }));

  const totalSorted = counters.categoryA + counters.categoryB;
  const scrapRate = totalSorted > 0 ? ((counters.rejectedCount / totalSorted) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-4 md:space-y-5 animate-in fade-in duration-150 w-full">
      
      {/* Header & Export Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#D5DBE1]">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-[#1F2933] flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#3B4651]" />
            Production Analytics &amp; Statistical Quality Control
          </h1>
          <p className="text-xs text-[#52606D] mt-0.5">
            Throughput velocity trends, bottle classification ratios, and downtime Pareto distribution
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Time range filter */}
          <div className="flex items-center bg-white border border-[#D5DBE1] rounded-lg p-0.5 text-xs">
            {(['5m', '15m', 'session', 'all'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeFilter(tf)}
                className={`px-3 py-1 rounded-md transition-colors uppercase font-medium cursor-pointer min-h-[36px] ${
                  timeFilter === tf ? 'bg-[#3B4651] text-white font-semibold' : 'text-[#52606D] hover:text-[#1F2933]'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <button
            onClick={() => exportProductionRecordsCsv(productionHistory)}
            disabled={productionHistory.length === 0}
            className="px-3.5 py-1.5 text-xs font-semibold bg-white hover:bg-[#F5F6F8] text-[#1F2933] border border-[#D5DBE1] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer min-h-[44px]"
          >
            <Download className="w-3.5 h-3.5 text-[#3B4651]" />
            Export Telemetry CSV
          </button>
        </div>
      </div>

      {/* Row 1: KPI Summary Metrics - Dark neutral numbers */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        
        <div className="bg-white border border-[#D5DBE1] rounded-lg p-3.5 shadow-xs">
          <div className="text-xs text-[#52606D] flex items-center font-medium">
            <span>Session Utilization</span>
            <HelpTooltip term="Session Utilization" explanation="Percentage of elapsed operating time during which the belt drive was in RUNNING state." />
          </div>
          <div className="text-2xl md:text-3xl font-bold font-tag text-[#1F2933] my-1">{counters.utilizationPercent}%</div>
          <div className="text-[11px] text-[#52606D]">Uptime: {Math.round(counters.uptimeSeconds)}s • Down: {Math.round(counters.downtimeSeconds)}s</div>
        </div>

        <div className="bg-white border border-[#D5DBE1] rounded-lg p-3.5 shadow-xs">
          <div className="text-xs text-[#52606D] flex items-center font-medium">
            <span>Yield Quality Rate</span>
            <HelpTooltip term="Yield Rate" explanation="Percentage of sorted bottles that were defect-free." />
          </div>
          <div className="text-2xl md:text-3xl font-bold font-tag text-[#1F2933] my-1">
            {totalSorted > 0 ? (100 - parseFloat(scrapRate)).toFixed(1) : '100.0'}%
          </div>
          <div className="text-[11px] text-[#52606D]">Good: {totalSorted} • Defect: {counters.rejectedCount}</div>
        </div>

        <div className="bg-white border border-[#D5DBE1] rounded-lg p-3.5 shadow-xs">
          <div className="text-xs text-[#52606D] flex items-center font-medium">
            <span>Cycle Velocity</span>
            <HelpTooltip term="Throughput Velocity" explanation="Instantaneous bottles per minute based on current linear belt speed." />
          </div>
          <div className="text-2xl md:text-3xl font-bold font-tag text-[#1F2933] my-1">{counters.currentBpm} <span className="text-sm font-normal text-[#52606D]">BPM</span></div>
          <div className="text-[11px] text-[#52606D]">Target benchmark: 35 BPM</div>
        </div>

        <div className="bg-white border border-[#D5DBE1] rounded-lg p-3.5 shadow-xs">
          <div className="text-xs text-[#52606D] flex items-center font-medium">
            <span>Defect Scrap Rate</span>
            <HelpTooltip term="Scrap Rate" explanation="Percentage of bottles identified with defective fills, missing caps, or deformities." />
          </div>
          <div className="text-2xl md:text-3xl font-bold font-tag text-[#1F2933] my-1">{scrapRate}%</div>
          <div className="text-[11px] text-[#52606D]">{counters.rejectedCount} rejected bottles</div>
        </div>

      </div>

      {/* Row 2: Production Over Time Area Chart */}
      <div className="bg-white border border-[#D5DBE1] rounded-lg p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#D5DBE1] pb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#3B4651]" />
            <h3 className="text-xs font-semibold text-[#1F2933]">
              Production velocity and throughput over time
            </h3>
            <HelpTooltip term="Velocity Trend" explanation="Plotted real-time throughput in BPM. Accumulates live data while conveyor is running." />
          </div>
          <span className="text-xs text-[#52606D] font-tag bg-[#F5F6F8] px-2 py-0.5 rounded border border-[#E4E7EB]">
            {filteredHistory.length} Telemetry Records
          </span>
        </div>

        {/* Clean technical AreaChart: graphite line, light grid, NO gradient fills */}
        <div className="w-full h-56 sm:h-72 bg-[#F5F6F8] rounded-lg p-2 border border-[#E4E7EB]">
          {filteredHistory.length === 0 ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-[#52606D] text-xs">
              <TrendingUp className="w-8 h-8 text-[#9AA5B1] mb-2" />
              <span>No telemetry data points in this window. Run conveyor to accumulate data.</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E7EB" />
                <XAxis dataKey="timeStr" stroke="#9AA5B1" tick={{ fontSize: 10, fill: '#52606D' }} />
                <YAxis stroke="#9AA5B1" tick={{ fontSize: 10, fill: '#52606D' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD2D9', borderRadius: 8, fontSize: 12, color: '#1F2933', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                />
                <Area type="monotone" dataKey="bpm" stroke="#3B4651" strokeWidth={2} fill="#3B4651" fillOpacity={0.08} name="Rate (BPM)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Row 3: A vs B Distribution & Fault Pareto */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5">
        
        {/* Category A vs B Breakdown (Cols 1-6) */}
        <div className="lg:col-span-6 bg-white border border-[#D5DBE1] rounded-lg p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#D5DBE1] pb-2">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-[#3B4651]" />
              <h3 className="text-xs font-semibold text-[#1F2933]">
                Category sorting distribution
              </h3>
              <HelpTooltip term="Category Distribution" explanation="Breakdown of sorted bottles between Bin A (Clear 500ml), Bin B (Amber 1000ml), and scrap defects." />
            </div>
            <span className="text-xs text-[#52606D] font-tag">Total: {totalSorted} items</span>
          </div>

          <div className="w-full h-52 sm:h-56 bg-[#F5F6F8] rounded-lg p-2 border border-[#E4E7EB]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E7EB" />
                <XAxis dataKey="name" stroke="#9AA5B1" tick={{ fontSize: 10, fill: '#52606D' }} />
                <YAxis stroke="#9AA5B1" tick={{ fontSize: 10, fill: '#52606D' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD2D9', borderRadius: 8, fontSize: 12, color: '#1F2933', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} minPointSize={6}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fault Frequency Pareto (Cols 7-12) */}
        <div className="lg:col-span-6 bg-white border border-[#D5DBE1] rounded-lg p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#D5DBE1] pb-2">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-[#C62828]" />
              <h3 className="text-xs font-semibold text-[#1F2933]">
                Fault pareto breakdown by failure code
              </h3>
              <HelpTooltip term="Pareto Chart" explanation="Ranks failure codes by frequency of occurrence to identify top root causes." />
            </div>
            <span className="text-xs text-[#52606D] font-tag">{alarms.length} Total Trips</span>
          </div>

          <div className="w-full h-52 sm:h-56 bg-[#F5F6F8] rounded-lg p-2 border border-[#E4E7EB]">
            {alarms.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-[#52606D] text-xs">
                <CheckCircle2 className="w-7 h-7 text-[#2E7D32] mb-2" />
                <span>Zero system faults recorded. Operating at 100% reliability.</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={faultData} layout="vertical" margin={{ top: 10, right: 20, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4E7EB" />
                  <XAxis type="number" stroke="#9AA5B1" tick={{ fontSize: 10, fill: '#52606D' }} />
                  <YAxis type="category" dataKey="name" stroke="#9AA5B1" tick={{ fontSize: 10, fill: '#52606D' }} width={140} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD2D9', borderRadius: 8, fontSize: 12, color: '#1F2933', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                  />
                  <Bar dataKey="count" fill="#C62828" radius={[0, 4, 4, 0]} minPointSize={8} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
