// ============================================================================
// Mobile Bottom Tab Bar (Phone Navigation < md)
// 4 main navigation tabs with "More" bottom sheet for remaining pages
// Active tab accent: graphite #3B4651
// ============================================================================

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  Bell, 
  MoreHorizontal, 
  X,
  Cpu, 
  BarChart3, 
  FileText, 
  Binary, 
  Settings, 
  Presentation
} from 'lucide-react';
import { useScada } from '../../context/ScadaContext';
import { PageId } from '../../types/scada';

export const BottomTabBar: React.FC = () => {
  const { state, dispatch } = useScada();
  const [showMoreSheet, setShowMoreSheet] = useState<boolean>(false);

  const unackAlarmsCount = state.alarms.filter(a => a.state === 'ACTIVE_UNACK').length;

  const handleSelectPage = (page: PageId) => {
    dispatch({ type: 'SET_PAGE', page });
    setShowMoreSheet(false);
  };

  const moreItems: { id: PageId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'equipment', label: 'Equipment & Sensors', icon: Cpu },
    { id: 'analytics', label: 'Production Analytics', icon: BarChart3 },
    { id: 'events', label: 'Event Historian', icon: FileText },
    { id: 'tags', label: 'PLC Tag Database', icon: Binary },
    { id: 'settings', label: 'System Settings', icon: Settings },
    { id: 'exhibition', label: 'Exhibition & Viva Guide', icon: Presentation },
  ];

  return (
    <>
      {/* Fixed Bottom Tab Bar for Mobile (<md) */}
      <nav 
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#CBD2D9] shadow-xs flex items-center justify-around h-14 pb-[env(safe-area-inset-bottom,0px)]"
      >
        {/* Tab 1: Overview */}
        <button
          onClick={() => handleSelectPage('dashboard')}
          className={`flex-1 h-full flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors cursor-pointer min-h-[44px] ${
            state.currentPage === 'dashboard'
              ? 'text-[#3B4651] font-bold border-t-2 border-[#3B4651]'
              : 'text-[#52606D] hover:text-[#1F2933]'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 shrink-0" />
          <span>Overview</span>
        </button>

        {/* Tab 2: Live Conveyor */}
        <button
          onClick={() => handleSelectPage('simulation')}
          className={`flex-1 h-full flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors cursor-pointer min-h-[44px] ${
            state.currentPage === 'simulation'
              ? 'text-[#3B4651] font-bold border-t-2 border-[#3B4651]'
              : 'text-[#52606D] hover:text-[#1F2933]'
          }`}
        >
          <Activity className="w-5 h-5 shrink-0" />
          <span>Conveyor</span>
        </button>

        {/* Tab 3: Alarms */}
        <button
          onClick={() => handleSelectPage('alarms')}
          className={`flex-1 h-full flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors cursor-pointer relative min-h-[44px] ${
            state.currentPage === 'alarms'
              ? 'text-[#3B4651] font-bold border-t-2 border-[#3B4651]'
              : 'text-[#52606D] hover:text-[#1F2933]'
          }`}
        >
          <div className="relative">
            <Bell className="w-5 h-5 shrink-0" />
            {unackAlarmsCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#C62828] text-white text-[9px] font-bold px-1 rounded-full leading-tight font-tag">
                {unackAlarmsCount}
              </span>
            )}
          </div>
          <span>Alarms</span>
        </button>

        {/* Tab 4: More */}
        <button
          onClick={() => setShowMoreSheet(true)}
          className={`flex-1 h-full flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors cursor-pointer min-h-[44px] ${
            moreItems.some(i => i.id === state.currentPage)
              ? 'text-[#3B4651] font-bold border-t-2 border-[#3B4651]'
              : 'text-[#52606D] hover:text-[#1F2933]'
          }`}
        >
          <MoreHorizontal className="w-5 h-5 shrink-0" />
          <span>More</span>
        </button>
      </nav>

      {/* "More" Bottom Sheet for Mobile */}
      {showMoreSheet && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/40">
          <div 
            className="fixed inset-0"
            onClick={() => setShowMoreSheet(false)}
          />
          <div className="relative bg-white rounded-t-xl border-t border-[#CBD2D9] shadow-lg p-4 space-y-3 z-10 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[#D5DBE1]">
              <span className="text-sm font-bold text-[#1F2933]">Additional SCADA Pages</span>
              <button 
                onClick={() => setShowMoreSheet(false)}
                className="p-1 rounded text-[#52606D] hover:text-[#1F2933] cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {moreItems.map(item => {
                const Icon = item.icon;
                const isSelected = state.currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectPage(item.id)}
                    className={`p-3 rounded-lg border text-left flex items-center gap-2.5 transition-colors cursor-pointer min-h-[48px] ${
                      isSelected
                        ? 'bg-[#3B4651] text-white border-[#3B4651] font-semibold'
                        : 'bg-[#F5F6F8] text-[#1F2933] border-[#D5DBE1] hover:bg-[#ECEFF2]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-[#3B4651]'}`} />
                    <span className="text-xs truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
