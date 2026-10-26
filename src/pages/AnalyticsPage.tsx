// ============================================================================
// Page 5: Production Analytics & Statistical Process Control
// Real simulation charts: velocity over time, Cat A vs B, downtime, fault Pareto
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

  // Category A vs B Data for Bar Chart
  const categoryData = [
    { name: 'Bin A (500ml Clear)', count: counters.categoryA, fill: '#10b981' },
    { name: 'Bin B (1000ml Amber)', count: counters.categoryB, fill: '#f59e0b' },
    { name: 'Defect / Scrapped', count: counters.rejectedCount, fill: '#ef4444' },
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
    <div className="space-y-5 animate-in fade-in duration-150 w-full">
      
      {/* Header & Export Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            Production Analytics &amp; Statistical Quality Control
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Throughput velocity trends, bottle classification ratios, and downtime Pareto distribution
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Time range filter */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
            {(['5m', '15m', 'session', 'all'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeFilter(tf)}
                className={`px-3 py-1 rounded-md transition-colors uppercase font-medium cursor-pointer ${
                  timeFilter === tf ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <button
            onClick={() => exportProductionRecordsCsv(productionHistory)}
            disabled={productionHistory.length === 0}
            className="px-3.5 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            Export Telemetry CSV
          </button>
        </div>
      </div>

      {/* Row 1: KPI Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 flex items-center">
            <span>Session Utilization</span>
            <HelpTooltip term="Session Utilization" explanation="Percentage of elapsed operating time during which the belt drive was in RUNNING state." />
          </div>
          <div className="text-3xl font-bold font-tag text-emerald-400 my-1">{counters.utilizationPercent}%</div>
          <div className="text-[11px] text-slate-500">Uptime: {Math.round(counters.uptimeSeconds)}s • Down: {Math.round(counters.downtimeSeconds)}s</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-emerald-400/90 flex items-center">
            <span>Yield Quality Rate</span>
            <HelpTooltip term="Yield Rate" explanation="Percentage of sorted bottles that were defect-free." />
          </div>
          <div className="text-3xl font-bold font-tag text-emerald-300 my-1">
            {totalSorted > 0 ? (100 - parseFloat(scrapRate)).toFixed(1) : '100.0'}%
          </div>
          <div className="text-[11px] text-slate-500">Good: {totalSorted} • Defect: {counters.rejectedCount}</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 flex items-center">
            <span>Cycle Velocity</span>
            <HelpTooltip term="Throughput Velocity" explanation="Instantaneous bottles per minute based on current linear belt speed." />
          </div>
          <div className="text-3xl font-bold font-tag text-blue-300 my-1">{counters.currentBpm} <span className="text-sm font-normal text-slate-400">BPM</span></div>
          <div className="text-[11px] text-slate-500">Target benchmark: 35 BPM</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-rose-400/90 flex items-center">
            <span>Defect Scrap Rate</span>
            <HelpTooltip term="Scrap Rate" explanation="Percentage of bottles identified with defective fills, missing caps, or deformities." />
          </div>
          <div className="text-3xl font-bold font-tag text-rose-400 my-1">{scrapRate}%</div>
          <div className="text-[11px] text-slate-500">{counters.rejectedCount} rejected bottles</div>
        </div>

      </div>

      {/* Row 2: Production Over Time Area Chart */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-semibold text-white">
              Production velocity and throughput over time
            </h3>
            <HelpTooltip term="Velocity Trend" explanation="Plotted real-time throughput in BPM. Accumulates live data while conveyor is running." />
          </div>
          <span className="text-xs text-slate-400 font-tag">
            {filteredHistory.length} Telemetry Records
          </span>
        </div>

        <div className="w-full h-72 bg-slate-950 rounded-xl p-2 border border-slate-800/80">
          {filteredHistory.length === 0 ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-xs">
              <TrendingUp className="w-8 h-8 text-slate-600 mb-2 animate-pulse" />
              <span>No telemetry data points in this window. Run conveyor to accumulate data.</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={filteredHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="analyticsBpmGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="timeStr" stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 12 }}
                />
                <Area type="monotone" dataKey="bpm" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#analyticsBpmGrad)" name="Rate (BPM)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Row 3: A vs B Distribution & Fault Pareto */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Category A vs B Breakdown (Cols 1-6) */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-semibold text-white">
                Category sorting distribution
              </h3>
              <HelpTooltip term="Category Distribution" explanation="Breakdown of sorted bottles between Bin A (Clear 500ml), Bin B (Amber 1000ml), and scrap defects." />
            </div>
            <span className="text-xs text-slate-400 font-tag">Total: {totalSorted} items</span>
          </div>

          <div className="w-full h-56 bg-slate-950 rounded-xl p-2 border border-slate-800/80">
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 12 }}
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
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-400" />
              <h3 className="text-xs font-semibold text-white">
                Fault pareto breakdown by failure code
              </h3>
              <HelpTooltip term="Pareto Chart" explanation="Ranks failure codes by frequency of occurrence to identify top root causes." />
            </div>
            <span className="text-xs text-slate-400 font-tag">{alarms.length} Total Trips</span>
          </div>

          <div className="w-full h-56 bg-slate-950 rounded-xl p-2 border border-slate-800/80">
            {alarms.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                <CheckCircle2 className="w-7 h-7 text-emerald-500/60 mb-2" />
                <span>Zero system faults recorded. Operating at 100% reliability.</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={faultData} layout="vertical" margin={{ top: 10, right: 20, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis type="category" dataKey="name" stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} width={140} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 12 }}
                  />
                  <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} minPointSize={8} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
