// ============================================================================
// Collapsible Presenter Panel for Viva & Exhibition
// Responsive: Bottom sheet on phone (<md), side slide-out drawer on md+
// Accent: graphite #3B4651
// ============================================================================

import React, { useState } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  HelpCircle, 
  Play, 
  AlertTriangle, 
  Flame, 
  Radio, 
  ShieldAlert, 
  CheckCircle2, 
  BookOpen,
  X
} from 'lucide-react';
import { useScada } from '../../context/ScadaContext';
import { PRESENTER_TALKING_POINTS } from '../../simulation/scenarioRunner';

export const PresenterPanel: React.FC = () => {
  const { state, dispatch } = useScada();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const pointsData = PRESENTER_TALKING_POINTS[state.currentPage] || PRESENTER_TALKING_POINTS.simulation;

  // 1-Click Scenario Handlers
  const handleScenarioNormal = () => {
    dispatch({ type: 'CLEAR_ALL_FAULTS' });
    dispatch({ type: 'RESET_FAULT_COMMAND' });
    dispatch({ type: 'START_COMMAND' });
  };

  const handleScenarioJam = () => {
    dispatch({ type: 'INJECT_FAULT', fault: 'jam', value: true });
  };

  const handleScenarioOverload = () => {
    dispatch({ type: 'INJECT_FAULT', fault: 'motorOverload', value: true });
  };

  const handleScenarioSensorFault = () => {
    dispatch({ type: 'INJECT_FAULT', fault: 'sensorMalfunction', value: true });
  };

  const handleScenarioEstop = () => {
    dispatch({ type: 'ESTOP_COMMAND' });
  };

  const handleScenarioRecovery = () => {
    dispatch({ type: 'RESET_ESTOP_COMMAND' });
    dispatch({ type: 'CLEAR_ALL_FAULTS' });
    dispatch({ type: 'RESET_FAULT_COMMAND' });
    dispatch({ type: 'ACKNOWLEDGE_ALL_ALARMS' });
  };

  return (
    <>
      {/* Desktop / Tablet Slideout Drawer (md+) */}
      <div className={`hidden md:flex fixed right-0 top-14 bottom-0 z-40 transition-all duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-[360px]'
      }`}>
        {/* Tab toggle button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="self-center -ml-10 bg-white hover:bg-[#F5F6F8] text-[#3B4651] border-l border-y border-[#CBD2D9] p-2.5 rounded-l-lg shadow-xs cursor-pointer flex items-center justify-center transition-colors min-h-[44px] min-w-[44px]"
          title="Toggle Presenter Notes & Scenarios"
        >
          {isOpen ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>

        {/* Main Panel Content */}
        <div className="w-[360px] bg-white border-l border-[#CBD2D9] p-4 shadow-lg flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#D5DBE1]">
              <BookOpen className="w-4 h-4 text-[#3B4651]" />
              <h3 className="text-xs font-bold text-[#1F2933]">
                Presenter Notes &amp; Viva Prep
              </h3>
            </div>

            {/* Current Page Talking Points */}
            <div className="bg-[#F5F6F8] p-3 rounded-lg border border-[#D5DBE1] space-y-2">
              <div className="text-xs font-bold text-[#3B4651]">
                {pointsData.title} Talking Points
              </div>
              <ul className="space-y-1.5 text-[#52606D] text-xs leading-relaxed">
                {pointsData.points.map((pt, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-[#3B4651] font-bold">•</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Viva Q&A Snippet */}
            {pointsData.vivaQuestions.length > 0 && (
              <div className="bg-[#F5F6F8] p-3 rounded-lg border border-[#D5DBE1] space-y-2">
                <div className="text-xs font-semibold text-[#D98200] flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Likely Examiner Question:</span>
                </div>
                <p className="text-xs text-[#1F2933] font-medium italic">
                  "{pointsData.vivaQuestions[0].q}"
                </p>
                <div className="text-xs text-[#52606D] leading-relaxed bg-white p-2.5 rounded border border-[#D5DBE1]">
                  <strong className="text-[#2E7D32] font-semibold">Answer:</strong> {pointsData.vivaQuestions[0].a}
                </div>
              </div>
            )}

            {/* 1-Click Demonstration Scenarios */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-[#52606D]">
                One-Click Demo Scenarios
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                <button
                  onClick={handleScenarioNormal}
                  className="p-2.5 rounded-lg bg-[#E8F5E9] hover:bg-[#C8E6C9] text-[#2E7D32] border border-[#A5D6A7] flex items-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
                >
                  <Play className="w-3.5 h-3.5 text-[#2E7D32]" />
                  <span>Normal Run</span>
                </button>

                <button
                  onClick={handleScenarioJam}
                  className="p-2.5 rounded-lg bg-[#FFF8E1] hover:bg-[#FFECB3] text-[#D98200] border border-[#FFE082] flex items-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-[#D98200]" />
                  <span>Conveyor Jam</span>
                </button>

                <button
                  onClick={handleScenarioOverload}
                  className="p-2.5 rounded-lg bg-[#FFF8E1] hover:bg-[#FFECB3] text-[#D98200] border border-[#FFE082] flex items-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
                >
                  <Flame className="w-3.5 h-3.5 text-[#D98200]" />
                  <span>Motor Overload</span>
                </button>

                <button
                  onClick={handleScenarioSensorFault}
                  className="p-2.5 rounded-lg bg-[#F5F6F8] hover:bg-[#ECEFF2] text-[#52606D] border border-[#D5DBE1] flex items-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
                >
                  <Radio className="w-3.5 h-3.5 text-[#52606D]" />
                  <span>Sensor Fault</span>
                </button>

                <button
                  onClick={handleScenarioEstop}
                  className="p-2.5 rounded-lg bg-[#FFEBEE] hover:bg-[#FFCDD2] text-[#C62828] border border-[#EF9A9A] flex items-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-[#C62828]" />
                  <span>Emergency Stop</span>
                </button>

                <button
                  onClick={handleScenarioRecovery}
                  className="p-2.5 rounded-lg bg-white hover:bg-[#ECEFF2] text-[#3B4651] border border-[#3B4651] flex items-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3B4651]" />
                  <span>Full Recovery</span>
                </button>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#D5DBE1] text-[11px] text-[#52606D] text-center">
            SCADA Conveyor Simulator • Presenter Notes
          </div>
        </div>
      </div>

      {/* Mobile Floating Presenter Notes Trigger & Bottom Sheet (<md) */}
      <div className="md:hidden">
        <button
          onClick={() => setIsOpen(true)}
          className="fixed right-3 bottom-16 z-30 p-2.5 bg-[#3B4651] text-white rounded-full shadow-md flex items-center justify-center min-w-[44px] min-h-[44px]"
          title="Presenter Viva Notes"
        >
          <BookOpen className="w-5 h-5" />
        </button>

        {isOpen && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40">
            <div 
              className="fixed inset-0"
              onClick={() => setIsOpen(false)}
            />
            <div className="relative bg-white rounded-t-xl border-t border-[#CBD2D9] shadow-lg p-4 space-y-4 z-10 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-[#D5DBE1]">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#3B4651]" />
                  <span className="text-sm font-bold text-[#1F2933]">Presenter Notes &amp; Scenarios</span>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded text-[#52606D] hover:text-[#1F2933] min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Talking points */}
              <div className="bg-[#F5F6F8] p-3 rounded-lg border border-[#D5DBE1] space-y-1.5">
                <span className="text-xs font-bold text-[#3B4651] block">{pointsData.title} Talking Points</span>
                <ul className="space-y-1 text-xs text-[#52606D]">
                  {pointsData.points.map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-[#3B4651] font-bold">•</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Scenarios */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#52606D] block">1-Click Test Scenarios</span>
                <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                  <button
                    onClick={() => { handleScenarioNormal(); setIsOpen(false); }}
                    className="p-2.5 rounded-lg bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7] flex items-center gap-1.5 min-h-[44px]"
                  >
                    <Play className="w-3.5 h-3.5 text-[#2E7D32]" />
                    <span>Normal Run</span>
                  </button>
                  <button
                    onClick={() => { handleScenarioJam(); setIsOpen(false); }}
                    className="p-2.5 rounded-lg bg-[#FFF8E1] text-[#D98200] border border-[#FFE082] flex items-center gap-1.5 min-h-[44px]"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-[#D98200]" />
                    <span>Conveyor Jam</span>
                  </button>
                  <button
                    onClick={() => { handleScenarioEstop(); setIsOpen(false); }}
                    className="p-2.5 rounded-lg bg-[#FFEBEE] text-[#C62828] border border-[#EF9A9A] flex items-center gap-1.5 min-h-[44px]"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-[#C62828]" />
                    <span>Emergency Stop</span>
                  </button>
                  <button
                    onClick={() => { handleScenarioRecovery(); setIsOpen(false); }}
                    className="p-2.5 rounded-lg bg-white text-[#3B4651] border border-[#3B4651] flex items-center gap-1.5 min-h-[44px]"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#3B4651]" />
                    <span>Full Recovery</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
