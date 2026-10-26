// ============================================================================
// Guided Tour Floating Banner
// Persistent overlay guiding the user/examiner through the 11 demonstration steps
// ============================================================================

import React from 'react';
import { Compass, ArrowRight, ArrowLeft, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { useScada } from '../../context/ScadaContext';
import { GUIDED_DEMO_STEPS } from '../../simulation/scenarioRunner';

export const GuidedTourBanner: React.FC = () => {
  const { state, dispatch } = useScada();
  const { guidedTourActive, guidedTourStep } = state;

  if (!guidedTourActive) return null;

  const currentStep = GUIDED_DEMO_STEPS.find(s => s.stepIndex === guidedTourStep) || GUIDED_DEMO_STEPS[0];
  const isFirst = guidedTourStep === 1;
  const isLast = guidedTourStep === GUIDED_DEMO_STEPS.length;

  const handleNext = () => {
    if (isLast) {
      dispatch({ type: 'SET_GUIDED_TOUR', active: false });
    } else {
      const nextStepIndex = guidedTourStep + 1;
      const nextStep = GUIDED_DEMO_STEPS.find(s => s.stepIndex === nextStepIndex);
      dispatch({ type: 'SET_GUIDED_TOUR', active: true, step: nextStepIndex });
      if (nextStep && nextStep.targetPage !== state.currentPage) {
        dispatch({ type: 'SET_PAGE', page: nextStep.targetPage as any });
      }
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      const prevStepIndex = guidedTourStep - 1;
      const prevStep = GUIDED_DEMO_STEPS.find(s => s.stepIndex === prevStepIndex);
      dispatch({ type: 'SET_GUIDED_TOUR', active: true, step: prevStepIndex });
      if (prevStep && prevStep.targetPage !== state.currentPage) {
        dispatch({ type: 'SET_PAGE', page: prevStep.targetPage as any });
      }
    }
  };

  const handleClose = () => {
    dispatch({ type: 'SET_GUIDED_TOUR', active: false });
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-2xl w-[92%] animate-in slide-in-from-bottom-5 duration-200">
      <div className="bg-slate-900/95 border-2 border-cyan-400 rounded-xl p-4 shadow-2xl backdrop-blur-md space-y-3 led-glow-blue select-none">
        
        {/* Banner Top */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 font-mono font-black text-xs flex items-center justify-center">
              {guidedTourStep}
            </span>
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Guided Demo Tour ({guidedTourStep} of {GUIDED_DEMO_STEPS.length}): {currentStep.title}
            </span>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Content */}
        <div className="space-y-1.5 text-xs font-mono">
          <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-cyan-300 font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Action: {currentStep.instruction}</span>
          </div>

          <div className="text-[11px] text-slate-300 pl-1 leading-relaxed">
            <strong className="text-emerald-400">Examiner Talking Point:</strong> {currentStep.evaluatorTalkingPoint}
          </div>
        </div>

        {/* Step Navigation Controls */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-800">
          <button
            onClick={handlePrev}
            disabled={isFirst}
            className={`px-3 py-1 rounded text-xs font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer ${
              isFirst ? 'text-slate-600 cursor-not-allowed' : 'text-slate-300 hover:text-white bg-slate-800'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>

          <div className="flex items-center gap-1">
            {GUIDED_DEMO_STEPS.map((s) => (
              <span
                key={s.stepIndex}
                className={`w-2 h-2 rounded-full transition-all ${
                  s.stepIndex === guidedTourStep ? 'bg-cyan-400 w-4' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="px-4 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-black flex items-center gap-1.5 shadow transition-all cursor-pointer"
          >
            <span>{isLast ? 'Complete Tour' : 'Next Step'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
