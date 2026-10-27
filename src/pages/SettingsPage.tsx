// ============================================================================
// Page 8: SCADA System & Simulation Settings (Light Industrial HMI Theme)
// Configuration of physics parameters, thresholds, stop modes, operator profile
// Light neutral cards, graphite accent #3B4651, clean range sliders
// ============================================================================

import React, { useState } from 'react';
import { 
  Settings, 
  Sliders, 
  RotateCcw, 
  ShieldAlert, 
  Volume2, 
  VolumeX, 
  User, 
  Save, 
  CheckCircle2 
} from 'lucide-react';
import { useScada, DEFAULT_SETTINGS } from '../context/ScadaContext';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

export const SettingsPage: React.FC = () => {
  const { state, dispatch } = useScada();
  const { settings } = state;

  const [formSettings, setFormSettings] = useState(settings);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'UPDATE_SETTINGS', settings: formSettings });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-4 md:space-y-5 animate-in fade-in duration-150 w-full">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#D5DBE1]">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-[#1F2933] flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#3B4651]" />
            System Configuration &amp; Simulation Parameters
          </h1>
          <p className="text-xs text-[#52606D] mt-0.5">
            Adjust physical thresholds, infeed cadences, safety timeouts, and operator settings
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E8F5E9] border border-[#A5D6A7] text-[#2E7D32] text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings Saved Successfully</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-4 md:space-y-5">
        
        {/* Section 1: Conveyor Motion & Physics */}
        <div className="bg-white border border-[#D5DBE1] rounded-lg p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#D5DBE1] pb-2">
            <Sliders className="w-4 h-4 text-[#3B4651]" />
            <h3 className="text-xs font-semibold text-[#1F2933]">
              1. Conveyor drive and kinematic limits
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 text-xs">
            
            {/* Nominal Speed */}
            <div className="space-y-1.5">
              <label className="text-[#1F2933] font-medium block">
                Nominal Speed Setpoint: <span className="text-[#3B4651] font-tag font-bold">{formSettings.nominalSpeedMs} m/s</span>
              </label>
              <input
                type="range"
                min="0.2"
                max="2.0"
                step="0.1"
                value={formSettings.nominalSpeedMs}
                onChange={e => setFormSettings({ ...formSettings, nominalSpeedMs: parseFloat(e.target.value) })}
                className="w-full cursor-pointer h-2 bg-[#D5DBE1] rounded min-h-[32px]"
              />
              <span className="text-[11px] text-[#52606D] block">Operating velocity under nominal load (0.2 to 2.0 m/s).</span>
            </div>

            {/* Infeed Cadence */}
            <div className="space-y-1.5">
              <label className="text-[#1F2933] font-medium block">
                Bottle Feed Interval: <span className="text-[#3B4651] font-tag font-bold">{formSettings.bottleSpawnIntervalSec} s</span>
              </label>
              <input
                type="range"
                min="0.8"
                max="4.0"
                step="0.1"
                value={formSettings.bottleSpawnIntervalSec}
                onChange={e => setFormSettings({ ...formSettings, bottleSpawnIntervalSec: parseFloat(e.target.value) })}
                className="w-full cursor-pointer h-2 bg-[#D5DBE1] rounded min-h-[32px]"
              />
              <span className="text-[11px] text-[#52606D] block">Seconds between consecutive bottle spawns onto infeed belt.</span>
            </div>

            {/* Category A Ratio */}
            <div className="space-y-1.5">
              <label className="text-[#1F2933] font-medium block">
                Category A Ratio (500ml Clear): <span className="text-[#6B7A5A] font-tag font-bold">{formSettings.categoryARatioPercent}%</span>
              </label>
              <input
                type="range"
                min="10"
                max="90"
                step="5"
                value={formSettings.categoryARatioPercent}
                onChange={e => setFormSettings({ ...formSettings, categoryARatioPercent: parseInt(e.target.value) })}
                className="w-full cursor-pointer h-2 bg-[#D5DBE1] rounded min-h-[32px]"
              />
              <span className="text-[11px] text-[#52606D] block">Proportion of Category A bottles vs Category B (1000ml Amber).</span>
            </div>

            {/* Defect Probability */}
            <div className="space-y-1.5">
              <label className="text-[#1F2933] font-medium block">
                Defect Probability Rate: <span className="text-[#C62828] font-tag font-bold">{formSettings.defectProbabilityPercent}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="20"
                step="1"
                value={formSettings.defectProbabilityPercent}
                onChange={e => setFormSettings({ ...formSettings, defectProbabilityPercent: parseInt(e.target.value) })}
                className="w-full cursor-pointer h-2 bg-[#D5DBE1] rounded min-h-[32px]"
              />
              <span className="text-[11px] text-[#52606D] block">Configurable defect rate (0-20%, default 5%) routed to reject bin.</span>
            </div>

            {/* Batch Target (0 = Off) */}
            <div className="space-y-1.5 md:col-span-2 pt-2 border-t border-[#D5DBE1]">
              <label className="text-[#1F2933] font-medium block">
                Batch Production Target: <span className="text-[#3B4651] font-tag font-bold">{formSettings.batchTarget === 0 ? '0 (Off - Continuous Run)' : `${formSettings.batchTarget} bottles`}</span>
              </label>
              <input
                type="range"
                min="0"
                max="200"
                step="5"
                value={formSettings.batchTarget}
                onChange={e => setFormSettings({ ...formSettings, batchTarget: parseInt(e.target.value) })}
                className="w-full cursor-pointer h-2 bg-[#D5DBE1] rounded min-h-[32px]"
              />
              <span className="text-[11px] text-[#52606D] block">Conveyor performs a normal stop and logs "Batch complete" when packed count reaches this target (0 = off).</span>
            </div>

          </div>
        </div>

        {/* Section 2: Safety Interlocks & Thresholds */}
        <div className="bg-white border border-[#D5DBE1] rounded-lg p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#D5DBE1] pb-2">
            <ShieldAlert className="w-4 h-4 text-[#D98200]" />
            <h3 className="text-xs font-semibold text-[#1F2933]">
              2. Safety protection and interlock thresholds
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 text-xs">
            
            {/* Jam Timeout */}
            <div className="space-y-1.5">
              <label className="text-[#1F2933] font-medium block">
                Conveyor Jam Optical Timeout: <span className="text-[#D98200] font-tag font-bold">{formSettings.jamTimeoutSec} s</span>
              </label>
              <input
                type="range"
                min="1.0"
                max="6.0"
                step="0.5"
                value={formSettings.jamTimeoutSec}
                onChange={e => setFormSettings({ ...formSettings, jamTimeoutSec: parseFloat(e.target.value) })}
                className="w-full cursor-pointer h-2 bg-[#D5DBE1] rounded min-h-[32px]"
              />
              <span className="text-[11px] text-[#52606D] block">Seconds sensor beam may be continuously broken before automatic trip.</span>
            </div>

            {/* Thermal Overload Limit */}
            <div className="space-y-1.5">
              <label className="text-[#1F2933] font-medium block">
                Motor Overload Thermal Trip: <span className="text-[#C62828] font-tag font-bold">{formSettings.motorOverloadThresholdC}°C</span>
              </label>
              <input
                type="range"
                min="65"
                max="95"
                step="1"
                value={formSettings.motorOverloadThresholdC}
                onChange={e => setFormSettings({ ...formSettings, motorOverloadThresholdC: parseInt(e.target.value) })}
                className="w-full cursor-pointer h-2 bg-[#D5DBE1] rounded min-h-[32px]"
              />
              <span className="text-[11px] text-[#52606D] block">Stator temperature threshold that triggers immediate thermal interlock trip.</span>
            </div>

            {/* Normal Stop Mode */}
            <div className="space-y-1.5">
              <label className="text-[#1F2933] font-medium block">Normal Stop Sequence Behavior:</label>
              <div className="grid grid-cols-2 gap-2">
                {(['DRAIN', 'PAUSE'] as const).map(mode => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setFormSettings({ ...formSettings, stopMode: mode })}
                    className={`py-2 px-3 rounded-lg font-semibold border transition-colors cursor-pointer min-h-[44px] ${
                      formSettings.stopMode === mode
                        ? 'bg-[#3B4651] text-white border-[#3B4651] shadow-xs'
                        : 'bg-white border-[#D5DBE1] text-[#1F2933] hover:bg-[#F5F6F8]'
                    }`}
                  >
                    {mode === 'DRAIN' ? 'Drain Line (Clear Belt)' : 'Controlled Deceleration'}
                  </button>
                ))}
              </div>
            </div>

            {/* Audio Alarm Sound */}
            <div className="space-y-1.5">
              <label className="text-[#1F2933] font-medium block">Audible Siren Feedback:</label>
              <button
                type="button"
                onClick={() => setFormSettings({ ...formSettings, audioMuted: !formSettings.audioMuted })}
                className={`w-full py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors min-h-[44px] ${
                  formSettings.audioMuted
                    ? 'bg-[#F5F6F8] border-[#D5DBE1] text-[#9AA5B1]'
                    : 'bg-white border-[#3B4651] text-[#3B4651]'
                }`}
              >
                {formSettings.audioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>{formSettings.audioMuted ? 'Muted (Silent)' : 'Audible Synthesizer Active'}</span>
              </button>
            </div>

          </div>
        </div>

        {/* Section 3: Operator Meta */}
        <div className="bg-white border border-[#D5DBE1] rounded-lg p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#D5DBE1] pb-2">
            <User className="w-4 h-4 text-[#3B4651]" />
            <h3 className="text-xs font-semibold text-[#1F2933]">
              3. Operator station and shift metadata
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 text-xs">
            <div className="space-y-1.5">
              <label className="text-[#1F2933] font-medium block">Operator Display Name:</label>
              <input
                type="text"
                value={formSettings.operatorName}
                onChange={e => setFormSettings({ ...formSettings, operatorName: e.target.value })}
                className="w-full px-3 py-2 bg-[#F5F6F8] border border-[#D5DBE1] rounded-lg text-[#1F2933] focus:outline-hidden focus:border-[#3B4651] min-h-[44px]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[#1F2933] font-medium block">Production Shift:</label>
              <input
                type="text"
                value={formSettings.shiftName}
                onChange={e => setFormSettings({ ...formSettings, shiftName: e.target.value })}
                className="w-full px-3 py-2 bg-[#F5F6F8] border border-[#D5DBE1] rounded-lg text-[#1F2933] focus:outline-hidden focus:border-[#3B4651] min-h-[44px]"
              />
            </div>
          </div>
        </div>

        {/* Form Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2 bg-white hover:bg-[#FFEBEE] text-[#C62828] border border-[#EF9A9A] rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer min-h-[44px]"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Demo &amp; Clear Local Storage
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 bg-[#3B4651] hover:bg-[#2D363F] text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer min-h-[44px]"
          >
            <Save className="w-4 h-4" />
            Save &amp; Apply Configuration
          </button>
        </div>

      </form>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        title="Reset Entire Demo State"
        message="This action will clear all local storage, reset all counters, clear the audit trail, and restore default initial simulation parameters. Continue?"
        confirmLabel="Reset Everything"
        isDangerous={true}
        onConfirm={() => {
          localStorage.removeItem('scada_sim_store_v1');
          dispatch({ type: 'RESET_DEMO' });
          setFormSettings(DEFAULT_SETTINGS);
          setShowResetConfirm(false);
        }}
        onCancel={() => setShowResetConfirm(false)}
      />

    </div>
  );
};
