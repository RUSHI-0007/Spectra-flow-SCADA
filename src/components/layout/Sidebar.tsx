// ============================================================================
// Left Navigation Sidebar (Light Industrial HMI Theme)
// Responsive: Hidden on phone (<md), icon-only on tablet (md), full on desktop (lg)
// Selected item: graphite #3B4651 with white text
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
    <aside className="hidden md:flex md:w-16 lg:w-60 bg-[#E2E6EA] border-r border-[#CBD2D9] flex-col justify-between shrink-0 select-none transition-all duration-200">
      {/* Top Navigation Links */}
      <div className="p-2 lg:p-3 space-y-1">
        <div className="hidden lg:block px-3 py-1.5 text-[11px] font-bold text-[#52606D] uppercase tracking-wider">
          Navigation
        </div>

        {navItems.map(item => {
          const isActive = state.currentPage === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => dispatch({ type: 'SET_PAGE', page: item.id })}
              title={item.label}
              className={`w-full flex items-center justify-center lg:justify-between px-2.5 lg:px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer min-h-[44px] ${
                isActive
                  ? 'bg-[#3B4651] text-white font-semibold shadow-xs'
                  : 'text-[#1F2933] hover:bg-[#D5DBE1] hover:text-[#1F2933]'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#52606D]'}`} />
                <span className="hidden lg:inline truncate">{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold font-tag ${
                  item.id === 'alarms' && unackAlarmsCount > 0
                    ? 'bg-[#C62828] text-white'
                    : isActive 
                    ? 'bg-[#2D363F] text-white hidden lg:inline' 
                    : 'bg-[#CBD2D9] text-[#1F2933] hidden lg:inline'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Panel: Auto-Pilot Banner & Quick Status */}
      <div className="p-2 lg:p-3 border-t border-[#CBD2D9] space-y-2">
        {state.autoPilotActive && (
          <div className="p-2 bg-[#F5F6F8] border border-[#CBD2D9] rounded-lg space-y-1 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-1.5 text-[#3B4651] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#3B4651]" />
              <span className="hidden lg:inline">Auto-Pilot Active</span>
            </div>
            <p className="hidden lg:block text-[11px] text-[#52606D]">
              Autonomous demo cycle running.
            </p>
            <button
              onClick={() => dispatch({ type: 'SET_AUTOPILOT', active: false })}
              className="w-full py-1 bg-[#C62828] hover:bg-[#B71C1C] text-white text-[11px] font-medium rounded cursor-pointer transition-colors"
            >
              <span className="hidden lg:inline">Stop Auto-Pilot</span>
              <StopCircle className="w-4 h-4 mx-auto lg:hidden" />
            </button>
          </div>
        )}

        <div className="hidden lg:block bg-white p-2.5 rounded-lg border border-[#D5DBE1] text-xs text-[#52606D] space-y-1.5">
          <div className="flex justify-between items-center">
            <span>Cycle Rate</span>
            <span className="text-[#1F2933] font-semibold font-tag">{state.counters.currentBpm} BPM</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Belt Speed</span>
            <span className="text-[#1F2933] font-semibold font-tag">{state.motor.actualSpeedMs} m/s</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Session Utilization</span>
            <span className="text-[#2E7D32] font-semibold font-tag">{state.counters.utilizationPercent}%</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
