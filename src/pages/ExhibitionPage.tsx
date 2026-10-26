// ============================================================================
// Page 9: Exhibition (Demo) Mode
// Guided Demo Tour, Auto-Pilot Showcase, Viva Evaluator Preparation, Kiosk Mode
// ============================================================================

import React, { useState, useEffect } from 'react';
import { 
  Presentation, 
  Sparkles, 
  Play, 
  RotateCcw, 
  Maximize, 
  FastForward, 
  CheckCircle2, 
  ArrowRight, 
  StopCircle, 
  HelpCircle, 
  Compass, 
  BookOpen, 
  FileCheck 
} from 'lucide-react';
import { useScada } from '../context/ScadaContext';
import { GUIDED_DEMO_STEPS, PRESENTER_TALKING_POINTS } from '../simulation/scenarioRunner';
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
          message: 'Guided Demonstration tour completed! System ready for examiner questions.',
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
          // Start conveyor
          dispatch({ type: 'START_COMMAND' });
          break;
        case 1:
          // Infeed extra bottle
          dispatch({ type: 'SPAWN_MANUAL_BOTTLE' });
          break;
        case 2:
          // Inject jam fault
          dispatch({ type: 'INJECT_FAULT', fault: 'jam', value: true });
          break;
        case 3:
          // Auto acknowledge alarm
          dispatch({ type: 'ACKNOWLEDGE_ALL_ALARMS' });
          break;
        case 4:
          // Clear jam & reset fault
          dispatch({ type: 'INJECT_FAULT', fault: 'jam', value: false });
          dispatch({ type: 'RESET_FAULT_COMMAND' });
          break;
        case 5:
          // Restart conveyor
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
      message: 'Guided Tour Initiated: Follow the step-by-step floating banner.',
      toastType: 'info',
    });
  };

  const handleStartAutoPilot = () => {
    dispatch({ type: 'SET_AUTOPILOT', active: true });
    dispatch({ type: 'SET_PAGE', page: 'simulation' });
    dispatch({
      type: 'SHOW_TOAST',
      message: 'Auto-Pilot Showcase Started: Conveyor will run autonomous demo loop.',
      toastType: 'info',
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-black font-mono text-white uppercase tracking-wider flex items-center gap-2">
            <Presentation className="w-5 h-5 text-purple-400" />
            Exhibition & College Viva Demonstration Suite
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Autonomous showcase modes, guided examiner tour, and talking points for live presentation
          </p>
        </div>

        <div className="flex items-center gap-2">
          {autoPilotActive ? (
            <button
              onClick={() => dispatch({ type: 'SET_AUTOPILOT', active: false })}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold rounded-lg flex items-center gap-2 shadow-lg animate-pulse cursor-pointer"
            >
              <StopCircle className="w-4 h-4" />
              STOP AUTO-PILOT
            </button>
          ) : (
            <button
              onClick={handleStartAutoPilot}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono text-xs font-bold rounded-lg flex items-center gap-2 shadow-lg shadow-purple-900/30 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-purple-200" />
              Start Auto-Pilot Showcase
            </button>
          )}

          <button
            onClick={() => dispatch({ type: 'TOGGLE_KIOSK' })}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Maximize className="w-3.5 h-3.5 text-cyan-400" />
            Toggle Kiosk Big-Screen
          </button>
        </div>
      </div>

      {/* Row 1: The Two Main Exhibition Modes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Card 1: Guided Demo Tour */}
        <div className="bg-slate-900 border-2 border-cyan-500/60 rounded-xl p-5 shadow-2xl space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-cyan-950 border border-cyan-500 flex items-center justify-center">
                <Compass className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-mono text-white uppercase">
                  1. Guided Examiner Demonstration
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  11-step interactive narrative for external examiners
                </p>
              </div>
            </div>
            {guidedTourActive && (
              <span className="text-[10px] bg-cyan-500 text-slate-950 px-2 py-0.5 rounded font-black font-mono">
                ACTIVE (STEP {guidedTourStep}/11)
              </span>
            )}
          </div>

          <p className="text-xs text-slate-300 font-mono leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800">
            Guides you or an evaluator step-by-step: starts the conveyor, demonstrates photoelectric detection, shows pneumatic diverter sorting, triggers a simulated jam fault with auto-stop, walks through ISA-18.2 acknowledgment, resets the fault without unexpected restarts, and reviews analytics.
          </p>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 text-xs font-mono text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={autoAdvance}
                onChange={e => setAutoAdvance(e.target.checked)}
                className="w-4 h-4 accent-cyan-400"
              />
              <span>Auto-advance steps ({currentStep.autoAdvanceDelaySec}s)</span>
            </label>

            <button
              onClick={handleStartGuidedDemo}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs rounded-lg flex items-center gap-2 shadow cursor-pointer"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              Launch Guided Tour
            </button>
          </div>
          <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-500" />
        </div>

        {/* Card 2: Auto-Pilot Showcase Loop */}
        <div className="bg-slate-900 border-2 border-purple-500/60 rounded-xl p-5 shadow-2xl space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-purple-950 border border-purple-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-mono text-white uppercase">
                  2. Auto-Pilot Showcase Loop
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  Autonomous self-running kiosk loop for exhibition booths
                </p>
              </div>
            </div>
            {autoPilotActive && (
              <span className="text-[10px] bg-purple-500 text-white px-2 py-0.5 rounded font-black font-mono animate-pulse">
                RUNNING LOOP
              </span>
            )}
          </div>

          <p className="text-xs text-slate-300 font-mono leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800">
            Keep your exhibition screen alive even when taking a break! Runs an autonomous continuous cycle: powers up the conveyor, produces bottles, sorts Category A & B, injects a jam fault to show alarm annunciation, clears the fault, and restarts. Any user input safely pauses the loop.
          </p>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-mono text-slate-400">
              Simulation Fast-Forward: <strong className="text-purple-300">{settings.simulationMultiplier}x</strong>
            </span>

            {autoPilotActive ? (
              <button
                onClick={() => dispatch({ type: 'SET_AUTOPILOT', active: false })}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs rounded-lg flex items-center gap-2 shadow cursor-pointer"
              >
                <StopCircle className="w-4 h-4" />
                Stop Auto-Pilot
              </button>
            ) : (
              <button
                onClick={handleStartAutoPilot}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-xs rounded-lg flex items-center gap-2 shadow cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                Start Auto-Pilot
              </button>
            )}
          </div>
          <div className="absolute top-0 left-0 right-0 h-1 bg-purple-500" />
        </div>

      </div>

      {/* Row 2: Comprehensive Viva Evaluator Q&A Sheet */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
              College Viva & External Examiner Anticipated Questions & Answers
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Cheat-Sheet for Final Year Project Defense
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          
          <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
            <strong className="text-cyan-300 block font-bold">
              Q1: What is the architectural difference between SCADA and a PLC?
            </strong>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              <strong>Answer:</strong> The PLC (Programmable Logic Controller) is dedicated real-time hardware executing cyclic ladder logic / structured text in deterministic milliseconds (controlling motors and reading optical beams). SCADA (Supervisory Control and Data Acquisition) sits above the PLC, providing human-machine interfaces (HMI), alarm management, historical data logging, and supervisory control across the entire packaging line.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
            <strong className="text-cyan-300 block font-bold">
              Q2: Explain the ISA-18.2 Alarm Lifecycle used in this project.
            </strong>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              <strong>Answer:</strong> ANSI/ISA-18.2 defines that when a hazardous condition (like a Conveyor Jam or Thermal Overload) occurs, the alarm trips into <em>Active Unacknowledged</em> (audible horn + flashing red). The operator must acknowledge it (becoming <em>Active Acknowledged</em>, silencing the horn). Critically, acknowledging does NOT reset the fault; the physical obstruction must be cleared and a deliberate reset executed.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
            <strong className="text-cyan-300 block font-bold">
              Q3: Why doesn't "Reset Fault" immediately start the conveyor moving?
            </strong>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              <strong>Answer:</strong> This is a mandatory industrial safety standard (OSHA & ISO 13849). A fault reset merely re-energizes safety relays and brings the state machine to IDLE. Silently restarting unexpected motion while technicians might still be near the belt would cause severe injury. A deliberate Start command is always required.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
            <strong className="text-cyan-300 block font-bold">
              Q4: How does the software ensure low CPU use and high reliability?
            </strong>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              <strong>Answer:</strong> The simulation physics tick is strictly decoupled from the UI rendering via a fixed 50ms interval. The loop checks <code>document.hidden</code> to sleep when the browser tab is backgrounded, prevents memory leaks by capping historical arrays (last 1000 events, last 300 telemetry points), and uses a React Error Boundary to prevent crashes.
            </p>
          </div>

        </div>
      </div>

      {/* Row 3: Exhibition Day Checklist */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <FileCheck className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
            Exhibition-Day Operator Checklist
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <div className="font-bold text-white mb-1">1. Screen Setup</div>
            <p className="text-[11px] text-slate-400">Press <kbd className="text-cyan-300 bg-slate-800 px-1 rounded">F</kbd> or click Fullscreen. Adjust zoom so KPIs are visible from 3 meters.</p>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <div className="font-bold text-white mb-1">2. Audio Check</div>
            <p className="text-[11px] text-slate-400">Click mute icon in header if venue is quiet, or keep unmuted for audible siren demonstration.</p>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <div className="font-bold text-white mb-1">3. Clean State</div>
            <p className="text-[11px] text-slate-400">Click "Reset Demo" below before new examiners arrive to start fresh from 0 bottles.</p>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <div className="font-bold text-white mb-1">4. Booth Inactivity</div>
            <p className="text-[11px] text-slate-400">When away from the desk, turn on Auto-Pilot Showcase loop so visitors see movement.</p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2 bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Entire Demo State to Default
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        title="Reset Entire Exhibition Demo State"
        message="This action will clear all local storage, reset all counters, clear the audit trail, and restore default initial simulation parameters. Continue?"
        confirmLabel="Reset Everything"
        isDestructive={true}
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
