// ============================================================================
// Page 8: SCADA System & Simulation Settings
// Configuration of physics parameters, thresholds, stop modes, operator profile
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
import { StopMode } from '../types/scada';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { HelpTooltip } from '../components/common/HelpTooltip';

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
    <div className="space-y-5 animate-in fade-in duration-150 w-full">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-500" />
            System Configuration &amp; Simulation Parameters
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Adjust physical thresholds, infeed cadences, safety timeouts, and operator settings
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-500 text-emerald-300 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings Saved Successfully</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        
        {/* Section 1: Conveyor Motion & Physics */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <Sliders className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-semibold text-white">
              1. Conveyor drive and kinematic limits
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            
            {/* Nominal Speed */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium block">
                Nominal Speed Setpoint: <span className="text-blue-400 font-tag font-bold">{formSettings.nominalSpeedMs} m/s</span>
              </label>
              <input
                type="range"
                min="0.2"
                max="2.0"
                step="0.1"
                value={formSettings.nominalSpeedMs}
                onChange={e => setFormSettings({ ...formSettings, nominalSpeedMs: parseFloat(e.target.value) })}
                className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded"
              />
              <span className="text-[11px] text-slate-500 block">Operating velocity under nominal load (0.2 to 2.0 m/s).</span>
            </div>

            {/* Infeed Cadence */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium block">
                Bottle Feed Interval: <span className="text-blue-400 font-tag font-bold">{formSettings.bottleSpawnIntervalSec} s</span>
              </label>
              <input
                type="range"
                min="0.8"
                max="4.0"
                step="0.1"
                value={formSettings.bottleSpawnIntervalSec}
                onChange={e => setFormSettings({ ...formSettings, bottleSpawnIntervalSec: parseFloat(e.target.value) })}
                className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded"
              />
              <span className="text-[11px] text-slate-500 block">Seconds between consecutive bottle spawns onto infeed belt.</span>
            </div>

            {/* Category A Ratio */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium block">
                Category A Ratio (500ml Clear): <span className="text-emerald-400 font-tag font-bold">{formSettings.categoryARatioPercent}%</span>
              </label>
              <input
                type="range"
                min="10"
                max="90"
                step="5"
                value={formSettings.categoryARatioPercent}
                onChange={e => setFormSettings({ ...formSettings, categoryARatioPercent: parseInt(e.target.value) })}
                className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded"
              />
              <span className="text-[11px] text-slate-500 block">Proportion of Category A bottles vs Category B (1000ml Amber).</span>
            </div>

            {/* Defect Probability */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium block">
                Defect Probability Rate: <span className="text-rose-400 font-tag font-bold">{formSettings.defectProbabilityPercent}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="25"
                step="1"
                value={formSettings.defectProbabilityPercent}
                onChange={e => setFormSettings({ ...formSettings, defectProbabilityPercent: parseInt(e.target.value) })}
                className="w-full accent-rose-500 cursor-pointer h-1.5 bg-slate-800 rounded"
              />
              <span className="text-[11px] text-slate-500 block">Frequency of flawed fills, missing caps, or deformities.</span>
            </div>

          </div>
        </div>

        {/* Section 2: Safety Interlocks & Thresholds */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-semibold text-white">
              2. Safety protection and interlock thresholds
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            
            {/* Jam Timeout */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium block">
                Conveyor Jam Optical Timeout: <span className="text-amber-400 font-tag font-bold">{formSettings.jamTimeoutSec} s</span>
              </label>
              <input
                type="range"
                min="1.0"
                max="6.0"
                step="0.5"
                value={formSettings.jamTimeoutSec}
                onChange={e => setFormSettings({ ...formSettings, jamTimeoutSec: parseFloat(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded"
              />
              <span className="text-[11px] text-slate-500 block">Seconds sensor beam may be continuously broken before automatic trip.</span>
            </div>

            {/* Thermal Overload Limit */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium block">
                Motor Overload Thermal Trip: <span className="text-red-400 font-tag font-bold">{formSettings.motorOverloadThresholdC}°C</span>
              </label>
              <input
                type="range"
                min="65"
                max="95"
                step="1"
                value={formSettings.motorOverloadThresholdC}
                onChange={e => setFormSettings({ ...formSettings, motorOverloadThresholdC: parseInt(e.target.value) })}
                className="w-full accent-red-500 cursor-pointer h-1.5 bg-slate-800 rounded"
              />
              <span className="text-[11px] text-slate-500 block">Stator temperature threshold that triggers immediate thermal interlock trip.</span>
            </div>

            {/* Normal Stop Mode */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium block">Normal Stop Sequence Behavior:</label>
              <div className="grid grid-cols-2 gap-2">
                {(['DRAIN', 'PAUSE'] as const).map(mode => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setFormSettings({ ...formSettings, stopMode: mode })}
                    className={`py-2 px-3 rounded-lg font-semibold border transition-colors cursor-pointer ${
                      formSettings.stopMode === mode
                        ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {mode === 'DRAIN' ? 'Drain Line (Clear Belt)' : 'Controlled Deceleration'}
                  </button>
                ))}
              </div>
            </div>

            {/* Audio Alarm Sound */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium block">Audible Siren Feedback:</label>
              <button
                type="button"
                onClick={() => setFormSettings({ ...formSettings, audioMuted: !formSettings.audioMuted })}
                className={`w-full py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                  formSettings.audioMuted
                    ? 'bg-slate-950 border-slate-800 text-slate-400'
                    : 'bg-blue-950 border-blue-500 text-blue-300'
                }`}
              >
                {formSettings.audioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>{formSettings.audioMuted ? 'Muted (Silent)' : 'Audible Synthesizer Active'}</span>
              </button>
            </div>

          </div>
        </div>

        {/* Section 3: Operator Meta */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <User className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-semibold text-white">
              3. Operator station and shift metadata
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium block">Operator Display Name:</label>
              <input
                type="text"
                value={formSettings.operatorName}
                onChange={e => setFormSettings({ ...formSettings, operatorName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium block">Production Shift:</label>
              <input
                type="text"
                value={formSettings.shiftName}
                onChange={e => setFormSettings({ ...formSettings, shiftName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Form Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2 bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Demo &amp; Clear Local Storage
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
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
        isDestructive={true}
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
