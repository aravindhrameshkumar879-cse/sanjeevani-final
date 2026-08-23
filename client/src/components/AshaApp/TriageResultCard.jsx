import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { calculateTriage } from '../../utils/triageEngine.js';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  ShieldAlert, 
  Save, 
  ArrowRight, 
  Activity,
  Layers
} from 'lucide-react';

export const TriageResultCard = ({ patientData, symptoms, onSaveOffline }) => {
  const { t } = useApp();

  // Compute pure on-device triage directly
  const triage = calculateTriage({
    age: patientData.age,
    chestPain: symptoms.chestPain,
    sweating: symptoms.sweating,
    breathingDifficulty: symptoms.breathingDifficulty,
    fever: symptoms.fever,
    feverDays: symptoms.feverDays,
    cough: symptoms.cough,
    minorAche: symptoms.minorAche
  });

  const isFormValid = patientData.name && patientData.name.trim().length > 0;

  return (
    <div className={`rounded-2xl border-2 p-5 shadow-lg transition-all ${
      triage.tag === 'Critical'
        ? 'bg-red-50/90 dark:bg-red-950/70 border-red-500 text-red-950 dark:text-red-100 glow-critical'
        : triage.tag === 'Routine'
          ? 'bg-blue-50/90 dark:bg-blue-950/70 border-blue-500 text-blue-950 dark:text-blue-100'
          : 'bg-emerald-50/90 dark:bg-emerald-950/70 border-emerald-500 text-emerald-950 dark:text-emerald-100'
    }`}>
      {/* Triage Badge Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-black/10 dark:border-white/10">
        <div className="flex items-center gap-2.5">
          <div className={`p-2.5 rounded-xl text-white ${
            triage.tag === 'Critical' ? 'bg-red-600 animate-pulse' : triage.tag === 'Routine' ? 'bg-blue-600' : 'bg-emerald-600'
          }`}>
            {triage.tag === 'Critical' && <AlertTriangle className="w-6 h-6" />}
            {triage.tag === 'Routine' && <Clock className="w-6 h-6" />}
            {triage.tag === 'Self-care' && <CheckCircle2 className="w-6 h-6" />}
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider block opacity-75">
              {t.triageResult}
            </span>
            <div className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
              <span>{triage.tag}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-black/10 dark:bg-white/10">
                Score: {triage.urgencyScore}/100
              </span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
            {triage.ruleId}
          </span>
        </div>
      </div>

      {/* Decision Table Breakdown / Matched Rule Reason */}
      <div className="space-y-3 mb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider block opacity-80 mb-1">
            Clinical Rule Triggered:
          </span>
          <p className="text-sm font-semibold bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-black/10 dark:border-white/10 shadow-2xs">
            {triage.reason}
          </p>
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider block opacity-80 mb-1">
            Protocol & Action Advice:
          </span>
          <div className="text-xs font-medium bg-white/60 dark:bg-slate-900/60 p-3 rounded-xl border border-black/10 dark:border-white/10">
            {triage.actionAdvice}
          </div>
        </div>
      </div>

      {/* Primary Action Button: Save Case Offline */}
      <button
        type="button"
        onClick={() => onSaveOffline(triage)}
        disabled={!isFormValid}
        id="btn-save-case-offline"
        className={`w-full py-4 px-6 rounded-xl font-black text-base flex items-center justify-center gap-2 shadow-lg transition-all transform active:scale-98 touch-target ${
          !isFormValid
            ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
            : triage.tag === 'Critical'
              ? 'bg-red-600 hover:bg-red-700 text-white ring-4 ring-red-500/30 animate-pulse'
              : triage.tag === 'Routine'
                ? 'bg-blue-600 hover:bg-blue-700 text-white ring-4 ring-blue-500/30'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white ring-4 ring-emerald-500/30'
        }`}
      >
        <Save className="w-5 h-5" />
        <span>{t.saveLocally}</span>
        <ArrowRight className="w-5 h-5 ml-1" />
      </button>

      {!isFormValid && (
        <p className="text-center text-xs text-red-600 dark:text-red-400 mt-2 font-medium">
          * Please enter patient name at top to save record.
        </p>
      )}
    </div>
  );
};
