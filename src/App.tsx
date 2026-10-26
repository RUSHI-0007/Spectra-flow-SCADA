// ============================================================================
// Spectra-Flow SCADA Main Application Shell
// Industrial Automation HMI & Conveyor Sorting Simulator
// ============================================================================

import React, { useEffect } from 'react';
import { ScadaProvider, useScada } from './context/ScadaContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { TopStatusBar } from './components/layout/TopStatusBar';
import { Sidebar } from './components/layout/Sidebar';
import { ToastBanner } from './components/layout/ToastBanner';
import { PresenterPanel } from './components/layout/PresenterPanel';
import { GuidedTourBanner } from './components/exhibition/GuidedTourBanner';

import { DashboardPage } from './pages/DashboardPage';
import { LiveSimulationPage } from './pages/LiveSimulationPage';
import { EquipmentPage } from './pages/EquipmentPage';
import { AlarmsPage } from './pages/AlarmsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { EventLogPage } from './pages/EventLogPage';
import { TagTablePage } from './pages/TagTablePage';
import { SettingsPage } from './pages/SettingsPage';
import { ExhibitionPage } from './pages/ExhibitionPage';

const ScadaAppContent: React.FC = () => {
  const { state, dispatch } = useScada();
  const { currentPage, isKioskMode, activeToast, machineState } = state;

  // Global Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not intercept if user is typing in an input field
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') {
        return;
      }

      // Space = Toggle Start / Stop
      if (e.code === 'Space') {
        e.preventDefault();
        if (machineState === 'RUNNING') {
          dispatch({ type: 'STOP_COMMAND' });
        } else if (machineState === 'IDLE') {
          dispatch({ type: 'START_COMMAND' });
        }
      }

      // E = Emergency Stop
      if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        dispatch({ type: 'ESTOP_COMMAND' });
      }

      // A = Acknowledge All Alarms
      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        dispatch({ type: 'ACKNOWLEDGE_ALL_ALARMS' });
      }

      // F = Toggle Fullscreen
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [machineState, dispatch]);

  // Page Routing Switch
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'simulation':
        return <LiveSimulationPage />;
      case 'equipment':
        return <EquipmentPage />;
      case 'alarms':
        return <AlarmsPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'events':
        return <EventLogPage />;
      case 'tags':
        return <TagTablePage />;
      case 'settings':
        return <SettingsPage />;
      case 'exhibition':
        return <ExhibitionPage />;
      default:
        return <LiveSimulationPage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-x-hidden">
      
      {/* 1. Control Room Top Status Bar */}
      <TopStatusBar />

      {/* 2. Main Body with Navigation & Viewport */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar Navigation (collapsible in Kiosk mode) */}
        {!isKioskMode && <Sidebar />}

        {/* Scrollable Page Content Area - Full Width */}
        <main className="flex-1 p-3 md:p-5 overflow-y-auto max-h-[calc(100vh-50px)]">
          <div className="w-full pb-28">
            {renderCurrentPage()}
          </div>
        </main>

        {/* 3. Presenter Drawer with Viva Talking Points */}
        <PresenterPanel />

      </div>

      {/* 4. Guided Tour Floating Interactive Banner */}
      <GuidedTourBanner />

      {/* 5. Feedback Toast for Blocked Operations / Alarms */}
      <ToastBanner
        toast={activeToast}
        onDismiss={() => dispatch({ type: 'CLEAR_TOAST' })}
      />

    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <ScadaProvider>
        <ScadaAppContent />
      </ScadaProvider>
    </ErrorBoundary>
  );
}
