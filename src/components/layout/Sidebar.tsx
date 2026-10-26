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
    { id: 'dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
    { id: 'simulation', label: 'Live Conveyor', icon: Activity },
    { id: 'equipment', label: 'Equipment & Sensors', icon: Cpu },
    { id: 'alarms', label: 'Alarm Annunciator', icon: Bell, badge: unackAlarmsCount > 0 ? unackAlarmsCount : undefined },
    { id: 'analytics', label: 'Production Analytics', icon: BarChart3 },
    { id: 'events', label: 'Event Historian', icon: FileText, badge: state.events.length },
    { id: 'tags', label: 'Tag Database (I/O)', icon: Binary },
    { id: 'settings', label: 'System Settings', icon: Settings },
    { id: 'exhibition', label: 'Exhibition & Viva Guide', icon: Presentation, isExhibition: true },
  ];

  return (
    <aside className="w-60 bg-slate-900/95 border-r border-slate-800 flex flex-col justify-between shrink-0 select-none">
      {/* Top Navigation Links */}
      <div className="p-3 space-y-1">
        <div className="px-3 py-1.5 text-xs font-semibold text-slate-400">
          Navigation
        </div>

        {navItems.map(item => {
          const isActive = state.currentPage === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => dispatch({ type: 'SET_PAGE', page: item.id })}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold font-tag ${
                  item.id === 'alarms' && unackAlarmsCount > 0
                    ? 'bg-red-500 text-white animate-pulse'
                    : isActive ? 'bg-blue-700 text-blue-100' : 'bg-slate-800 text-slate-300'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Panel: Auto-Pilot Banner & Key Stats */}
      <div className="p-3 border-t border-slate-800/80 space-y-2">
        {state.autoPilotActive && (
          <div className="p-2.5 bg-blue-950/80 border border-blue-500/50 rounded-lg space-y-1.5">
            <div className="flex items-center gap-2 text-blue-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Auto-Pilot Active</span>
            </div>
            <p className="text-[11px] text-blue-200/80">
              Running automated showcase loop. Any control action pauses.
            </p>
            <button
              onClick={() => dispatch({ type: 'SET_AUTOPILOT', active: false })}
              className="w-full py-1 bg-red-600 hover:bg-red-500 text-white text-xs font-medium rounded flex items-center justify-center gap-1 cursor-pointer transition-colors"
            >
              <StopCircle className="w-3.5 h-3.5" />
              Stop Auto-Pilot
            </button>
          </div>
        )}

        <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 text-xs text-slate-400 space-y-1.5">
          <div className="flex justify-between items-center">
            <span>Cycle Rate</span>
            <span className="text-white font-semibold font-tag">{state.counters.currentBpm} BPM</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Belt Speed</span>
            <span className="text-white font-semibold font-tag">{state.motor.actualSpeedMs} m/s</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Session Utilization</span>
            <span className="text-emerald-400 font-semibold font-tag">{state.counters.utilizationPercent}%</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
