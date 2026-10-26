// ============================================================================
// Left Navigation Sidebar
// Seamless navigation across all 9 SCADA pages with alarm count badges
// ============================================================================

import React from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  Cpu, 
  Bell, 
  BarChart3, 
  FileText, 
  Binary, 
  Settings, 
  Presentation,
  StopCircle,
  Sparkles
} from 'lucide-react';
import { useScada } from '../../context/ScadaContext';
import { PageId } from '../../types/scada';

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  isExhibition?: boolean;
}

export const Sidebar: React.FC = () => {
  const { state, dispatch } = useScada();

  const unackAlarmsCount = state.alarms.filter(a => a.state === 'ACTIVE_UNACK').length;

  const navItems: NavItem[] = [
    { id: 'dashboard', label: '1. Overview Dashboard', icon: LayoutDashboard },
    { id: 'simulation', label: '2. Live Conveyor Sim', icon: Activity },
    { id: 'equipment', label: '3. Equipment & Sensors', icon: Cpu },
    { id: 'alarms', label: '4. Alarm Annunciator', icon: Bell, badge: unackAlarmsCount > 0 ? unackAlarmsCount : undefined },
    { id: 'analytics', label: '5. Production Analytics', icon: BarChart3 },
    { id: 'events', label: '6. Event Historian', icon: FileText, badge: state.events.length },
    { id: 'tags', label: '7. Tag Database (I/O)', icon: Binary },
    { id: 'settings', label: '8. System Settings', icon: Settings },
    { id: 'exhibition', label: '9. Exhibition Mode', icon: Presentation, isExhibition: true },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 select-none">
      {/* Top Navigation Links */}
      <div className="p-3 space-y-1">
        <div className="px-3 py-1.5 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
          SCADA Supervisory HMI
        </div>

        {navItems.map(item => {
          const isActive = state.currentPage === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => dispatch({ type: 'SET_PAGE', page: item.id })}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                isActive
                  ? item.isExhibition
                    ? 'bg-gradient-to-r from-purple-900/80 to-indigo-900/80 text-purple-200 border border-purple-500/80 shadow-md shadow-purple-900/30 font-bold'
                    : 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/60 shadow-md shadow-cyan-950/40 font-bold'
                  : item.isExhibition
                  ? 'text-purple-300 hover:bg-purple-950/40 hover:text-white'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${
                  isActive ? (item.isExhibition ? 'text-purple-400' : 'text-cyan-400') : item.isExhibition ? 'text-purple-400' : 'text-slate-400'
                }`} />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold font-mono ${
                  item.id === 'alarms' && unackAlarmsCount > 0
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Panel: Auto-Pilot Banner & Guided Tour Shortcut */}
      <div className="p-3 border-t border-slate-800 space-y-2">
        {state.autoPilotActive && (
          <div className="p-2.5 bg-purple-950/90 border border-purple-500 rounded-lg space-y-1.5 animate-pulse">
            <div className="flex items-center gap-2 text-purple-300 text-xs font-mono font-bold">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>AUTO-PILOT ACTIVE</span>
            </div>
            <p className="text-[10px] text-purple-200/80 font-mono">
              Running automated showcase loop. Any input pauses.
            </p>
            <button
              onClick={() => dispatch({ type: 'SET_AUTOPILOT', active: false })}
              className="w-full py-1 bg-red-600 hover:bg-red-500 text-white text-[10px] font-mono font-bold rounded flex items-center justify-center gap-1 cursor-pointer transition-colors"
            >
              <StopCircle className="w-3.5 h-3.5" />
              STOP AUTO-PILOT
            </button>
          </div>
        )}

        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-400 space-y-1">
          <div className="flex justify-between">
            <span>THROUGHPUT:</span>
            <span className="text-cyan-300 font-bold">{state.counters.currentBpm} BPM</span>
          </div>
          <div className="flex justify-between">
            <span>MOTOR SPEED:</span>
            <span className="text-slate-200 font-bold">{state.motor.actualSpeedMs} m/s</span>
          </div>
          <div className="flex justify-between">
            <span>UTILIZATION:</span>
            <span className="text-emerald-400 font-bold">{state.counters.utilizationPercent}%</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
