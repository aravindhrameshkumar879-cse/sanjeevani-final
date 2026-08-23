import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { 
  Heart, 
  Flame, 
  Wind, 
  Thermometer, 
  Activity, 
  CheckSquare, 
  Square,
  AlertTriangle,
  Stethoscope
} from 'lucide-react';

export const SymptomForm = ({ symptoms, onChange, vitals, onVitalsChange }) => {
  const { t } = useApp();

  const handleToggle = (field) => {
    const updated = {
      ...symptoms,
      [field]: !symptoms[field]
    };

    // If minorAche is checked, uncheck red flags
    if (field === 'minorAche' && !symptoms.minorAche) {
      updated.chestPain = false;
      updated.sweating = false;
      updated.breathingDifficulty = false;
      updated.fever = false;
      updated.feverDays = 0;
    }

    // If any red flag checked, uncheck minorAche
    if (['chestPain', 'sweating', 'breathingDifficulty', 'fever'].includes(field) && updated[field]) {
      updated.minorAche = false;
    }

    onChange(updated);
  };

  const handleFeverDaysChange = (val) => {
    const days = parseInt(val, 10) || 0;
    onChange({
      ...symptoms,
      fever: days > 0,
      feverDays: days,
      minorAche: false
    });
  };

  const handleVitalChange = (field, val) => {
    onVitalsChange({
      ...vitals,
      [field]: val
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
          <Stethoscope className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            2. {t.symptomsTitle}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Structured intake • Pure on-device clinical rules trigger below
          </p>
        </div>
      </div>

      {/* Structured Symptom Buttons / Toggles with Large Touch Targets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        {/* Chest Pain */}
        <button
          type="button"
          onClick={() => handleToggle('chestPain')}
          className={`p-3.5 rounded-xl border-2 text-left flex items-center justify-between transition-all touch-target ${
            symptoms.chestPain
              ? 'bg-red-50 dark:bg-red-950/60 border-red-500 text-red-900 dark:text-red-100 shadow-sm'
              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <Heart className={`w-5 h-5 ${symptoms.chestPain ? 'text-red-600 fill-red-500 animate-pulse' : 'text-slate-400'}`} />
            <div>
              <div className="text-sm font-bold">{t.chestPain}</div>
              <span className="text-[11px] text-red-600 dark:text-red-400 font-semibold">Red Flag for ACS</span>
            </div>
          </div>
          {symptoms.chestPain ? (
            <CheckSquare className="w-5 h-5 text-red-600" />
          ) : (
            <Square className="w-5 h-5 text-slate-400" />
          )}
        </button>

        {/* Sweating */}
        <button
          type="button"
          onClick={() => handleToggle('sweating')}
          className={`p-3.5 rounded-xl border-2 text-left flex items-center justify-between transition-all touch-target ${
            symptoms.sweating
              ? 'bg-red-50 dark:bg-red-950/60 border-red-500 text-red-900 dark:text-red-100 shadow-sm'
              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <Flame className={`w-5 h-5 ${symptoms.sweating ? 'text-red-600 fill-red-500' : 'text-slate-400'}`} />
            <div>
              <div className="text-sm font-bold">{t.sweating}</div>
              <span className="text-[11px] text-red-600 dark:text-red-400 font-semibold">Cold Perspiration</span>
            </div>
          </div>
          {symptoms.sweating ? (
            <CheckSquare className="w-5 h-5 text-red-600" />
          ) : (
            <Square className="w-5 h-5 text-slate-400" />
          )}
        </button>

        {/* Breathing Difficulty */}
        <button
          type="button"
          onClick={() => handleToggle('breathingDifficulty')}
          className={`p-3.5 rounded-xl border-2 text-left flex items-center justify-between transition-all touch-target ${
            symptoms.breathingDifficulty
              ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 text-amber-900 dark:text-amber-100 shadow-sm'
              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <Wind className={`w-5 h-5 ${symptoms.breathingDifficulty ? 'text-amber-600' : 'text-slate-400'}`} />
            <div>
              <div className="text-sm font-bold">{t.breathingDiff}</div>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">Dyspnea / Choking</span>
            </div>
          </div>
          {symptoms.breathingDifficulty ? (
            <CheckSquare className="w-5 h-5 text-amber-600" />
          ) : (
            <Square className="w-5 h-5 text-slate-400" />
          )}
        </button>

        {/* Cough */}
        <button
          type="button"
          onClick={() => handleToggle('cough')}
          className={`p-3.5 rounded-xl border-2 text-left flex items-center justify-between transition-all touch-target ${
            symptoms.cough
              ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-900 dark:text-blue-100 shadow-sm'
              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <Activity className={`w-5 h-5 ${symptoms.cough ? 'text-blue-600' : 'text-slate-400'}`} />
            <div>
              <div className="text-sm font-bold">{t.cough}</div>
              <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">Dry / Productive</span>
            </div>
          </div>
          {symptoms.cough ? (
            <CheckSquare className="w-5 h-5 text-blue-600" />
          ) : (
            <Square className="w-5 h-5 text-slate-400" />
          )}
        </button>
      </div>

      {/* Fever & Fever Duration Slider (Important for Triage Rule 2: Fever > 3 days) */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 mb-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Thermometer className={`w-5 h-5 ${symptoms.fever ? 'text-orange-600' : 'text-slate-400'}`} />
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {t.fever} / {t.feverDays}:
            </span>
          </div>
          <span className={`text-sm font-bold px-3 py-1 rounded-lg ${
            symptoms.feverDays > 3 
              ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800 animate-pulse'
              : symptoms.feverDays > 0
                ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
          }`}>
            {symptoms.feverDays > 0 ? `${symptoms.feverDays} Day${symptoms.feverDays > 1 ? 's' : ''}` : 'No Fever'}
            {symptoms.feverDays > 3 && ' (CRITICAL RED FLAG)'}
          </span>
        </div>

        <input
          type="range"
          id="fever-days-slider"
          min="0"
          max="10"
          step="1"
          value={symptoms.feverDays || 0}
          onChange={(e) => handleFeverDaysChange(e.target.value)}
          className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
        />

        <div className="flex justify-between text-[11px] text-slate-400 mt-1">
          <span>0 (None)</span>
          <span>1-3 Days (Routine)</span>
          <span className="text-red-600 font-bold">&gt;3 Days (Critical)</span>
          <span>10+ Days</span>
        </div>
      </div>

      {/* Minor-Ache-Only Toggle (For Rule 4: Mild cold / minor ache / no fever => Self-care) */}
      <button
        type="button"
        onClick={() => handleToggle('minorAche')}
        className={`w-full p-3.5 rounded-xl border-2 text-left flex items-center justify-between transition-all touch-target mb-5 ${
          symptoms.minorAche
            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-100 shadow-sm'
            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
            CARE
          </div>
          <div>
            <div className="text-sm font-bold">{t.minorAche}</div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              No fever, no red flags (Self-care protocol)
            </span>
          </div>
        </div>
        {symptoms.minorAche ? (
          <CheckSquare className="w-5 h-5 text-emerald-600" />
        ) : (
          <Square className="w-5 h-5 text-slate-400" />
        )}
      </button>

      {/* Vitals Record Section */}
      <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
        <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider">
          {t.vitals}:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div>
            <label className="block text-[11px] text-slate-500 mb-1">{t.bp}</label>
            <input
              type="text"
              value={vitals.bp || '120/80'}
              onChange={(e) => handleVitalChange('bp', e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-500 mb-1">{t.pulse}</label>
            <input
              type="text"
              value={vitals.pulse || '76'}
              onChange={(e) => handleVitalChange('pulse', e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-500 mb-1">{t.spo2}</label>
            <input
              type="text"
              value={vitals.spo2 || '98%'}
              onChange={(e) => handleVitalChange('spo2', e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-500 mb-1">{t.temp}</label>
            <input
              type="text"
              value={vitals.temp || '98.6°F'}
              onChange={(e) => handleVitalChange('temp', e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
