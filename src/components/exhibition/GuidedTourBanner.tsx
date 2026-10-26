// ============================================================================
// Guided Tour Floating Banner (Light Industrial Theme)
// Accent: graphite #3B4651
// ============================================================================

import React from 'react';
import { ArrowRight, ArrowLeft, X, Sparkles } from 'lucide-react';
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
    <div className="fixed bottom-20 md:bottom-24 left-1/2 -translate-x-1/2 z-50 max-w-2xl w-[94%]">
      <div className="bg-white border border-[#CBD2D9] rounded-lg p-3.5 sm:p-4 shadow-lg space-y-2.5 select-none">
        
        {/* Banner Top */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-[#3B4651] text-white font-bold text-xs flex items-center justify-center shrink-0">
              {guidedTourStep}
            </span>
            <span className="text-xs font-bold text-[#1F2933] truncate">
              Step {guidedTourStep} of {GUIDED_DEMO_STEPS.length}: {currentStep.title}
            </span>
          </div>
          <button
            onClick={handleClose}
            className="text-[#52606D] hover:text-[#1F2933] p-1 rounded transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Content */}
        <div className="space-y-1.5 text-xs">
          <div className="p-2.5 bg-[#F5F6F8] rounded-md border border-[#D5DBE1] text-[#3B4651] font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#3B4651] shrink-0" />
            <span>Action: {currentStep.instruction}</span>
          </div>

          <div className="text-xs text-[#52606D] leading-relaxed">
            <strong className="text-[#1F2933] font-semibold">Talking point:</strong> {currentStep.evaluatorTalkingPoint}
          </div>
        </div>

        {/* Step Navigation Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-[#D5DBE1]">
          <button
            onClick={handlePrev}
            disabled={isFirst}
            className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer min-h-[36px] ${
              isFirst ? 'text-[#9AA5B1] cursor-not-allowed' : 'text-[#1F2933] hover:bg-[#E2E6EA] bg-[#F5F6F8] border border-[#D5DBE1]'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>

          <div className="hidden sm:flex items-center gap-1">
            {GUIDED_DEMO_STEPS.map((s) => (
              <span
                key={s.stepIndex}
                className={`h-1.5 rounded-full transition-all ${
                  s.stepIndex === guidedTourStep ? 'bg-[#3B4651] w-4' : 'bg-[#CBD2D9] w-1.5'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="px-4 py-1.5 rounded bg-[#3B4651] hover:bg-[#2D363F] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer min-h-[36px]"
          >
            <span>{isLast ? 'Complete Tour' : 'Next Step'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
