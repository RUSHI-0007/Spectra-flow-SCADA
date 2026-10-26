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
    <div className="space-y-5 animate-in fade-in duration-150 max-w-5xl">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-black font-mono text-white uppercase tracking-wider flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            SCADA Configuration & Simulation Parameters
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Adjust physical thresholds, infeed cadences, safety interlock timeouts, and stop modes
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-950 border border-emerald-500 text-emerald-300 font-mono text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings Saved Successfully</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        
        {/* Section 1: Conveyor Motion & Physics */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
              1. Conveyor Drive & Kinematic Limits
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-mono">
            
            {/* Nominal Speed */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold block">
                Nominal Speed Setpoint: <span className="text-cyan-400">{formSettings.nominalSpeedMs} m/s</span>
              </label>
              <input
                type="range"
                min="0.2"
                max="2.5"
                step="0.1"
                value={formSettings.nominalSpeedMs}
                onChange={e => setFormSettings({ ...formSettings, nominalSpeedMs: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-950 rounded"
              />
              <span className="text-[10px] text-slate-500 block">
                Linear conveyor surface velocity (0.2 m/s to 2.5 m/s)
              </span>
            </div>

            {/* Infeed Cadence */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold block">
                Infeed Spawn Cadence: <span className="text-purple-400">{formSettings.bottleSpawnIntervalSec} s</span>
              </label>
              <input
                type="range"
                min="0.8"
                max="4.0"
                step="0.1"
                value={formSettings.bottleSpawnIntervalSec}
                onChange={e => setFormSettings({ ...formSettings, bottleSpawnIntervalSec: parseFloat(e.target.value) })}
                className="w-full accent-purple-400 cursor-pointer h-2 bg-slate-950 rounded"
              />
              <span className="text-[10px] text-slate-500 block">
                Time interval between consecutive infeed bottles
              </span>
            </div>

            {/* Category A Ratio */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold block">
                Category A / B Ratio: <span className="text-emerald-400">{formSettings.categoryARatioPercent}% Cat A</span> / <span className="text-amber-400">{100 - formSettings.categoryARatioPercent}% Cat B</span>
              </label>
              <input
                type="range"
                min="10"
                max="90"
                step="5"
                value={formSettings.categoryARatioPercent}
                onChange={e => setFormSettings({ ...formSettings, categoryARatioPercent: parseInt(e.target.value) })}
                className="w-full accent-emerald-400 cursor-pointer h-2 bg-slate-950 rounded"
              />
              <span className="text-[10px] text-slate-500 block">
                Statistical distribution of 500ml Clear (Cat A) vs 1000ml Amber (Cat B)
              </span>
            </div>

            {/* Normal Stop Mode */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold block">
                Normal Stop Sequence Mode:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['DRAIN', 'PAUSE'] as StopMode[]).map(mode => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setFormSettings({ ...formSettings, stopMode: mode })}
                    className={`py-2 px-3 rounded font-bold border transition-colors cursor-pointer ${
                      formSettings.stopMode === mode
                        ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {mode === 'DRAIN' ? 'DRAIN BELT' : 'PAUSE IN-PLACE'}
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-slate-500 block">
                {formSettings.stopMode === 'DRAIN' ? 'DRAIN: Infeed stops and belt finishes remaining bottles before IDLE.' : 'PAUSE: Conveyor decelerates to a stop immediately.'}
              </span>
            </div>

          </div>
        </div>

        {/* Section 2: Safety Interlocks & Thresholds */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
              2. Safety Protection Interlocks & Trip Thresholds
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-mono">
            
            {/* Motor Overload Temp Limit */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold block">
                Motor Thermal Overload Limit: <span className="text-orange-400">{formSettings.motorOverloadThresholdC}°C</span>
              </label>
              <input
                type="range"
                min="65"
                max="95"
                step="1"
                value={formSettings.motorOverloadThresholdC}
                onChange={e => setFormSettings({ ...formSettings, motorOverloadThresholdC: parseInt(e.target.value) })}
                className="w-full accent-orange-400 cursor-pointer h-2 bg-slate-950 rounded"
              />
              <span className="text-[10px] text-slate-500 block">
                Temperature at which PT100 thermistor trips electronic overload relay (49/51)
              </span>
            </div>

            {/* Jam Timeout */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold block">
                Jam Detection Continuous Block Timeout: <span className="text-red-400">{formSettings.jamTimeoutSec} s</span>
              </label>
              <input
                type="range"
                min="1.5"
                max="6.0"
                step="0.5"
                value={formSettings.jamTimeoutSec}
                onChange={e => setFormSettings({ ...formSettings, jamTimeoutSec: parseFloat(e.target.value) })}
                className="w-full accent-red-400 cursor-pointer h-2 bg-slate-950 rounded"
              />
              <span className="text-[10px] text-slate-500 block">
                Time optical sensor must remain blocked before tripping jam interlock
              </span>
            </div>

            {/* Random Faults Toggle */}
            <div className="space-y-1.5 flex items-center justify-between p-3 bg-slate-950 rounded border border-slate-800">
              <div>
                <span className="text-slate-200 font-bold block">Random Fault Injection</span>
                <span className="text-[10px] text-slate-500">Periodically simulates random field faults</span>
              </div>
              <input
                type="checkbox"
                checked={formSettings.randomFaultsEnabled}
                onChange={e => setFormSettings({ ...formSettings, randomFaultsEnabled: e.target.checked })}
                className="w-5 h-5 accent-cyan-500 cursor-pointer"
              />
            </div>

            {/* Audio Mute */}
            <div className="space-y-1.5 flex items-center justify-between p-3 bg-slate-950 rounded border border-slate-800">
              <div>
                <span className="text-slate-200 font-bold block">Audible Industrial Alarms</span>
                <span className="text-[10px] text-slate-500">Web Audio API synthesized industrial siren</span>
              </div>
              <input
                type="checkbox"
                checked={!formSettings.audioMuted}
                onChange={e => setFormSettings({ ...formSettings, audioMuted: !e.target.checked })}
                className="w-5 h-5 accent-cyan-500 cursor-pointer"
              />
            </div>

          </div>
        </div>

        {/* Section 3: Operator & Shift Configuration */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <User className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
              3. Operator Station & Shift Meta
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-mono">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold block">Operator Display Name:</label>
              <input
                type="text"
                value={formSettings.operatorName}
                onChange={e => setFormSettings({ ...formSettings, operatorName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold block">Current Production Shift:</label>
              <input
                type="text"
                value={formSettings.shiftName}
                onChange={e => setFormSettings({ ...formSettings, shiftName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Form Action Buttons */}
        <div className="flex items-center justify-between pt-3">
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2 bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Demo & Clear Local Storage
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg text-xs font-mono font-black flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Save & Apply Configuration
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
