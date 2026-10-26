// ============================================================================
// Page 9: Exhibition (Demo) Mode (Light Industrial HMI Theme)
// Guided Demo Tour, Auto-Pilot Showcase, Viva Evaluator Preparation, Kiosk Mode
// Calm neutral cards, graphite accent #3B4651, no glows or neon
// ============================================================================

import React, { useState, useEffect } from 'react';
import { 
  Presentation, 
  Sparkles, 
  Play, 
  RotateCcw, 
  Maximize, 
  StopCircle, 
  HelpCircle, 
  Compass, 
  FileCheck 
} from 'lucide-react';
import { useScada } from '../context/ScadaContext';
import { GUIDED_DEMO_STEPS } from '../simulation/scenarioRunner';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

export const ExhibitionPage: React.FC = () => {
  const { state, dispatch } = useScada();
  const { guidedTourActive, guidedTourStep, autoPilotActive, settings } = state;

  const [autoAdvance, setAutoAdvance] = useState<boolean>(true);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  // Guided demo current step
  const currentStep = GUIDED_DEMO_STEPS.find(s => s.stepIndex === guidedTourStep) || GUIDED_DEMO_STEPS[0];

  // Auto-advance timer for guided tour
  useEffect(() => {
    if (!guidedTourActive || !autoAdvance) return;

    const timer = setTimeout(() => {
      if (guidedTourStep < GUIDED_DEMO_STEPS.length) {
        dispatch({ type: 'SET_GUIDED_TOUR', active: true, step: guidedTourStep + 1 });
      } else {
        dispatch({ type: 'SET_GUIDED_TOUR', active: false });
        dispatch({
          type: 'SHOW_TOAST',
          message: 'Guided demonstration tour completed. System ready for examiner questions.',
          toastType: 'info',
        });
      }
    }, currentStep.autoAdvanceDelaySec * 1000);

    return () => clearTimeout(timer);
  }, [guidedTourActive, guidedTourStep, autoAdvance, currentStep.autoAdvanceDelaySec, dispatch]);

  // Auto-Pilot loop simulation effect
  useEffect(() => {
    if (!autoPilotActive) return;

    let subStep = 0;
    const interval = setInterval(() => {
      subStep = (subStep + 1) % 6;
      switch (subStep) {
        case 0:
          dispatch({ type: 'START_COMMAND' });
          break;
        case 1:
          dispatch({ type: 'SPAWN_MANUAL_BOTTLE' });
          break;
        case 2:
          dispatch({ type: 'INJECT_FAULT', fault: 'jam', value: true });
          break;
        case 3:
          dispatch({ type: 'ACKNOWLEDGE_ALL_ALARMS' });
          break;
        case 4:
          dispatch({ type: 'INJECT_FAULT', fault: 'jam', value: false });
          dispatch({ type: 'RESET_FAULT_COMMAND' });
          break;
        case 5:
          dispatch({ type: 'START_COMMAND' });
          break;
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [autoPilotActive, dispatch]);

  const handleStartGuidedDemo = () => {
    dispatch({ type: 'SET_GUIDED_TOUR', active: true, step: 1 });
    dispatch({ type: 'SET_PAGE', page: 'simulation' });
    dispatch({
      type: 'SHOW_TOAST',
      message: 'Guided tour started. Follow the step-by-step instructions at top of screen.',
      toastType: 'info',
    });
  };

  const handleStartAutoPilot = () => {
    dispatch({ type: 'SET_AUTOPILOT', active: true });
    dispatch({ type: 'SET_PAGE', page: 'simulation' });
    dispatch({
      type: 'SHOW_TOAST',
      message: 'Auto-pilot showcase started. The conveyor will run an autonomous loop.',
      toastType: 'info',
    });
  };

  return (
    <div className="space-y-4 md:space-y-5 animate-in fade-in duration-150 w-full">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#D5DBE1]">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-[#1F2933] flex items-center gap-2">
            <Presentation className="w-5 h-5 text-[#3B4651]" />
            Exhibition and Presentation Suite
          </h1>
          <p className="text-xs text-[#52606D] mt-0.5">
            Demonstration modes, guided examiner tour, and technical reference notes
          </p>
        </div>

        <div className="flex items-center gap-2">
          {autoPilotActive ? (
            <button
              onClick={() => dispatch({ type: 'SET_AUTOPILOT', active: false })}
              className="px-4 py-2 bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs font-semibold rounded-lg flex items-center gap-2 shadow-xs cursor-pointer transition-colors min-h-[44px]"
            >
              <StopCircle className="w-4 h-4" />
              Stop auto-pilot
            </button>
          ) : (
            <button
              onClick={handleStartAutoPilot}
              className="px-4 py-2 bg-[#3B4651] hover:bg-[#2D363F] text-white text-xs font-semibold rounded-lg flex items-center gap-2 shadow-xs cursor-pointer transition-colors min-h-[44px]"
            >
              <Sparkles className="w-4 h-4" />
              Start auto-pilot showcase
            </button>
          )}

          <button
            onClick={() => dispatch({ type: 'TOGGLE_KIOSK' })}
            className="px-3.5 py-2 bg-white hover:bg-[#F5F6F8] text-[#1F2933] border border-[#D5DBE1] rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors min-h-[44px]"
          >
            <Maximize className="w-3.5 h-3.5 text-[#52606D]" />
            Toggle kiosk mode
          </button>
        </div>
      </div>

      {/* Row 1: The Two Main Exhibition Modes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
        
        {/* Card 1: Guided Demo Tour */}
        <div className="bg-white border border-[#D5DBE1] rounded-lg p-4 sm:p-5 shadow-xs space-y-4 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#F5F6F8] border border-[#D5DBE1] flex items-center justify-center">
                <Compass className="w-5 h-5 text-[#3B4651]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#1F2933]">
                  Guided examiner demonstration
                </h3>
                <p className="text-xs text-[#52606D]">
                  11-step interactive narrative for evaluators
                </p>
              </div>
            </div>
            {guidedTourActive && (
              <span className="text-[11px] bg-[#3B4651] text-white px-2 py-0.5 rounded font-medium">
                Step {guidedTourStep} of 11
              </span>
            )}
          </div>

          <p className="text-xs text-[#52606D] leading-relaxed bg-[#F5F6F8] p-3.5 rounded-lg border border-[#E4E7EB]">
            Guides you or an evaluator step-by-step: starts the conveyor, demonstrates optical sensor detection, shows pneumatic sorting, simulates a bottle jam with auto-stop, walks through alarm acknowledgment, resets the fault safely, and reviews analytics.
          </p>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <label className="flex items-center gap-2 text-xs text-[#52606D] cursor-pointer">
              <input
                type="checkbox"
                checked={autoAdvance}
                onChange={e => setAutoAdvance(e.target.checked)}
                className="w-4 h-4 accent-[#3B4651] rounded"
              />
              <span>Auto-advance steps ({currentStep.autoAdvanceDelaySec}s)</span>
            </label>

            <button
              onClick={handleStartGuidedDemo}
              className="px-4 py-2 bg-[#3B4651] hover:bg-[#2D363F] text-white font-medium text-xs rounded-lg flex items-center gap-2 shadow-xs cursor-pointer transition-colors min-h-[44px]"
            >
              <Play className="w-4 h-4 fill-white" />
              Launch guided tour
            </button>
          </div>
        </div>

        {/* Card 2: Auto-Pilot Showcase Loop */}
        <div className="bg-white border border-[#D5DBE1] rounded-lg p-4 sm:p-5 shadow-xs space-y-4 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#F5F6F8] border border-[#D5DBE1] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#3B4651]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#1F2933]">
                  Auto-pilot showcase loop
                </h3>
                <p className="text-xs text-[#52606D]">
                  Autonomous self-running loop for exhibition displays
                </p>
              </div>
            </div>
            {autoPilotActive && (
              <span className="text-[11px] bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7] px-2 py-0.5 rounded font-medium">
                Active loop
              </span>
            )}
          </div>

          <p className="text-xs text-[#52606D] leading-relaxed bg-[#F5F6F8] p-3.5 rounded-lg border border-[#E4E7EB]">
            Keeps the screen active during breaks. Runs an autonomous cycle: starts the conveyor, feeds bottles, sorts into bins, injects a jam fault to show alarm response, clears the fault, and resumes. Any operator control will safely take over.
          </p>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <span className="text-xs text-[#52606D]">
              Simulation speed: <strong className="text-[#1F2933] font-tag">{settings.simulationMultiplier}x</strong>
            </span>

            {autoPilotActive ? (
              <button
                onClick={() => dispatch({ type: 'SET_AUTOPILOT', active: false })}
                className="px-4 py-2 bg-[#C62828] hover:bg-[#B71C1C] text-white font-medium text-xs rounded-lg flex items-center gap-2 shadow-xs cursor-pointer transition-colors min-h-[44px]"
              >
                <StopCircle className="w-4 h-4" />
                Stop auto-pilot
              </button>
            ) : (
              <button
                onClick={handleStartAutoPilot}
                className="px-4 py-2 bg-[#3B4651] hover:bg-[#2D363F] text-white font-medium text-xs rounded-lg flex items-center gap-2 shadow-xs cursor-pointer transition-colors min-h-[44px]"
              >
                <Play className="w-4 h-4 fill-white" />
                Start auto-pilot
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Row 2: Comprehensive Viva Evaluator Q&A Sheet */}
      <div className="bg-white border border-[#D5DBE1] rounded-lg p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#D5DBE1] pb-2">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[#3B4651]" />
            <h3 className="text-sm font-semibold text-[#1F2933]">
              Anticipated viva examination questions and answers
            </h3>
          </div>
          <span className="text-xs text-[#52606D]">
            Quick reference for project evaluation
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          
          <div className="p-3.5 bg-[#F5F6F8] rounded-lg border border-[#E4E7EB] space-y-1.5">
            <strong className="text-[#1F2933] block font-semibold">
              Q1: What is the architectural difference between SCADA and a PLC?
            </strong>
            <p className="text-[#52606D] leading-relaxed text-xs">
              <strong>Answer:</strong> The PLC (Programmable Logic Controller) executes deterministic real-time control logic in milliseconds (driving motors and reading optical beams). SCADA (Supervisory Control and Data Acquisition) sits above the PLC, providing human-machine visualization, alarm management, historical data logging, and supervisory control across the plant.
            </p>
          </div>

          <div className="p-3.5 bg-[#F5F6F8] rounded-lg border border-[#E4E7EB] space-y-1.5">
            <strong className="text-[#1F2933] block font-semibold">
              Q2: Explain the ISA-18.2 alarm lifecycle used in this system.
            </strong>
            <p className="text-[#52606D] leading-relaxed text-xs">
              <strong>Answer:</strong> ANSI/ISA-18.2 defines that when a hazard (such as a conveyor jam or motor overload) occurs, the alarm enters <em>Active Unacknowledged</em> (audible alert and visual indication). The operator acknowledges it, which silences the alert. Acknowledging does not restart the conveyor; the physical fault must be cleared and a manual reset performed.
            </p>
          </div>

          <div className="p-3.5 bg-[#F5F6F8] rounded-lg border border-[#E4E7EB] space-y-1.5">
            <strong className="text-[#1F2933] block font-semibold">
              Q3: Why does fault reset return to Idle instead of immediately restarting?
            </strong>
            <p className="text-[#52606D] leading-relaxed text-xs">
              <strong>Answer:</strong> This is a standard industrial safety practice (ISO 13849 / OSHA). A fault reset clears the safety interlock and readies the system. Automatically restarting conveyor motion while maintenance staff may be clearing bottles could cause injury. A deliberate Start button press is always required.
            </p>
          </div>

          <div className="p-3.5 bg-[#F5F6F8] rounded-lg border border-[#E4E7EB] space-y-1.5">
            <strong className="text-[#1F2933] block font-semibold">
              Q4: How does the software maintain smooth performance in the browser?
            </strong>
            <p className="text-[#52606D] leading-relaxed text-xs">
              <strong>Answer:</strong> The simulation physics engine runs on a fixed 50ms interval independent of UI renders. It detects when the browser tab is hidden to save power, caps log buffers to prevent memory growth (last 1,000 events, last 300 telemetry points), and uses React state isolation to prevent unnecessary re-renders.
            </p>
          </div>

        </div>
      </div>

      {/* Row 3: Exhibition Day Checklist */}
      <div className="bg-white border border-[#D5DBE1] rounded-lg p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 border-b border-[#D5DBE1] pb-2">
          <FileCheck className="w-4 h-4 text-[#3B4651]" />
          <h3 className="text-sm font-semibold text-[#1F2933]">
            Exhibition day checklist
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-[#F5F6F8] rounded-lg border border-[#E4E7EB]">
            <div className="font-semibold text-[#1F2933] mb-1">1. Screen setup</div>
            <p className="text-[#52606D]">Press <kbd className="text-[#1F2933] bg-white border border-[#CBD2D9] px-1 rounded font-tag">F</kbd> or click Fullscreen. Adjust zoom so numbers are legible from 2 to 3 meters.</p>
          </div>

          <div className="p-3 bg-[#F5F6F8] rounded-lg border border-[#E4E7EB]">
            <div className="font-semibold text-[#1F2933] mb-1">2. Audio check</div>
            <p className="text-[#52606D]">Click the horn icon in the top bar to mute if the room is quiet, or keep unmuted for audible siren demonstration.</p>
          </div>

          <div className="p-3 bg-[#F5F6F8] rounded-lg border border-[#E4E7EB]">
            <div className="font-semibold text-[#1F2933] mb-1">3. Clean state</div>
            <p className="text-[#52606D]">Click "Reset demo data" below before new examiners arrive to start fresh from 0 bottles.</p>
          </div>

          <div className="p-3 bg-[#F5F6F8] rounded-lg border border-[#E4E7EB]">
            <div className="font-semibold text-[#1F2933] mb-1">4. Standby mode</div>
            <p className="text-[#52606D]">When away from the station, start the auto-pilot showcase loop so guests see an active demonstration.</p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2 bg-white hover:bg-[#FFEBEE] text-[#C62828] border border-[#EF9A9A] rounded-lg text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer min-h-[44px]"
          >
            <RotateCcw className="w-4 h-4" />
            Reset demo data to default
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        title="Reset demo data"
        message="This will clear all local storage, reset all bottle counters to zero, clear the event log, and restore default initial simulation parameters. Proceed?"
        confirmLabel="Reset everything"
        isDangerous={true}
        onConfirm={() => {
          localStorage.removeItem('scada_sim_store_v1');
          dispatch({ type: 'RESET_DEMO' });
          setShowResetConfirm(false);
        }}
        onCancel={() => setShowResetConfirm(false)}
      />

    </div>
  );
};
