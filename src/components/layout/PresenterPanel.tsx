// ============================================================================
// Collapsible Presenter Panel for Exhibition & Live Viva
// Features examiner talking points and 1-click test scenarios
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
  BookOpen 
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
    <div className={`fixed right-0 top-16 bottom-0 z-40 flex transition-all duration-300 ${
      isOpen ? 'translate-x-0' : 'translate-x-[360px]'
    }`}>
      {/* Tab toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="self-center -ml-10 bg-slate-800 hover:bg-slate-700 text-cyan-400 border-l border-y border-slate-700 p-2.5 rounded-l-lg shadow-xl cursor-pointer flex items-center justify-center transition-colors"
        title="Toggle Presenter Notes & Scenarios"
      >
        {isOpen ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
      </button>

      {/* Main Panel Content */}
      <div className="w-[360px] bg-slate-900 border-l border-slate-800 p-4 shadow-2xl flex flex-col justify-between overflow-y-auto">
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <BookOpen className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-semibold text-white">
              Presenter notes and viva prep
            </h3>
          </div>

          {/* Current Page Talking Points */}
          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 space-y-2">
            <div className="text-xs font-semibold text-blue-300">
              {pointsData.title} talking points
            </div>
            <ul className="space-y-1.5 text-slate-300 text-xs leading-relaxed">
              {pointsData.points.map((pt, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-blue-400 font-bold">•</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Viva Q&A Snippet */}
          {pointsData.vivaQuestions.length > 0 && (
            <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 space-y-2">
              <div className="text-xs font-medium text-amber-400 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Likely examiner question:</span>
              </div>
              <p className="text-xs text-slate-200 font-medium italic">
                "{pointsData.vivaQuestions[0].q}"
              </p>
              <div className="text-xs text-slate-300 leading-relaxed bg-slate-900 p-2.5 rounded border border-slate-800">
                <strong className="text-emerald-400 font-medium">Answer:</strong> {pointsData.vivaQuestions[0].a}
              </div>
            </div>
          )}

          {/* 1-Click Demonstration Scenarios */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-400">
              One-click demo scenarios
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-medium">
              <button
                onClick={handleScenarioNormal}
                className="p-2.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Play className="w-3 h-3 text-emerald-400" />
                Normal production
              </button>

              <button
                onClick={handleScenarioJam}
                className="p-2.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                Conveyor jam
              </button>

              <button
                onClick={handleScenarioOverload}
                className="p-2.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-rose-300 border border-rose-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Flame className="w-3 h-3 text-rose-400" />
                Motor overload
              </button>

              <button
                onClick={handleScenarioSensorFault}
                className="p-2.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-purple-300 border border-purple-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Radio className="w-3 h-3 text-purple-400" />
                Sensor failure
              </button>

              <button
                onClick={handleScenarioEstop}
                className="p-2.5 rounded-lg bg-red-950/70 hover:bg-red-900/90 text-red-200 border border-red-500/50 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ShieldAlert className="w-3 h-3 text-red-400" />
                Emergency stop
              </button>

              <button
                onClick={handleScenarioRecovery}
                className="p-2.5 rounded-lg bg-blue-950/70 hover:bg-blue-900/90 text-blue-200 border border-blue-500/50 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-3 h-3 text-blue-400" />
                Full recovery
              </button>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 text-center">
          SCADA Conveyor Simulator • Presenter companion
        </div>
      </div>
    </div>
  );
};
