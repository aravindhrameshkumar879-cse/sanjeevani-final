import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { 
  User, 
  Phone, 
  MapPin, 
  Hash, 
  Calendar, 
  Heart, 
  Save, 
  RotateCcw, 
  Sparkles,
  UserPlus,
  CheckCircle2
} from 'lucide-react';

export const PatientRegistration = ({ patientData, onChange, onDirectSave }) => {
  const { t } = useApp();

  const handleChange = (field, value) => {
    onChange({
      ...patientData,
      [field]: value
    });
  };

  const handleClearForm = () => {
    onChange({
      name: '',
      age: '',
      gender: 'Male',
      phone: '',
      village: 'Rampur Khurd',
      abhaId: `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`
    });
  };

  const samplePresets = [
    { name: 'Kavita Devi', age: 48, gender: 'Female', phone: '9876599881', village: 'Rampur Khurd' },
    { name: 'Rameshwar Prasad', age: 52, gender: 'Male', phone: '9876543210', village: 'Rampur Khurd' },
    { name: 'Sunita Devi', age: 34, gender: 'Female', phone: '9812376543', village: 'Sundarpur' },
    { name: 'Mohan Lal', age: 64, gender: 'Male', phone: '9845612345', village: 'Chandrapur' }
  ];

  const handleApplyPreset = (preset) => {
    onChange({
      ...patientData,
      ...preset,
      abhaId: `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`
    });
  };

  const isFormFilled = patientData.name && patientData.name.trim().length > 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>1. {t.registerPatient}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                OFFLINE FORM
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Offline demographic record • Saved directly to phone local storage
            </p>
          </div>
        </div>

        {/* Clear / New Blank Form Button */}
        <button
          type="button"
          onClick={handleClearForm}
          className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors"
          title="Clear form to register a new blank patient"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>New Blank Patient</span>
        </button>
      </div>

      {/* Quick Autofill Sample Presets */}
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
          Quick Preset Samples (1-Click Fill):
        </span>
        <div className="flex flex-wrap gap-1.5">
          {samplePresets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 text-slate-700 dark:text-slate-300 transition-all flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-emerald-500" />
              <span>{p.name} ({p.age}y, {p.gender})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t.patientName} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              id="patient-name-input"
              value={patientData.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g. Kavita Devi"
              required
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Age & Gender */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t.age} <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="patient-age-input"
              value={patientData.age || ''}
              onChange={(e) => handleChange('age', e.target.value)}
              placeholder="e.g. 48"
              min="0"
              max="120"
              required
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t.gender}
            </label>
            <select
              value={patientData.gender || 'Male'}
              onChange={(e) => handleChange('gender', e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
            >
              <option value="Male">{t.male}</option>
              <option value="Female">{t.female}</option>
              <option value="Other">{t.other}</option>
            </select>
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t.phone}
          </label>
          <div className="relative">
            <input
              type="tel"
              value={patientData.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Village */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t.village}
          </label>
          <div className="relative">
            <input
              type="text"
              value={patientData.village || ''}
              onChange={(e) => handleChange('village', e.target.value)}
              placeholder="e.g. Rampur Khurd / Ward 4"
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Simulated ABHA Health ID */}
      <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <Hash className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-slate-600 dark:text-slate-400">{t.abhaMock}:</span>
          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
            {patientData.abhaId || '91-4829-1029-4820'}
          </span>
        </div>
        <span className="text-[10px] text-slate-400 uppercase tracking-wider">Ayushman Bharat ID (Mock)</span>
      </div>

      {/* Direct Register / Save Button */}
      {onDirectSave && (
        <div className="pt-1">
          <button
            type="button"
            onClick={onDirectSave}
            disabled={!isFormFilled}
            id="btn-direct-save-patient"
            className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 ${
              !isFormFilled
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white ring-4 ring-emerald-500/20'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>💾 Save & Register Patient ({patientData.name || 'New Patient'})</span>
          </button>
        </div>
      )}
    </div>
  );
};
