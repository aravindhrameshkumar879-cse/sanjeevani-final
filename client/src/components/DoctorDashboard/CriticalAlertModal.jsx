import React from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  X, 
  Video, 
  FileText, 
  MapPin, 
  Heart, 
  Activity 
} from 'lucide-react';

export const CriticalAlertModal = ({ alertData, onClose, onReviewCase, onStartConsult }) => {
  if (!alertData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border-4 border-red-600 shadow-2xl overflow-hidden glow-critical animate-pulse-fast">
        {/* Urgent Header */}
        <div className="p-5 bg-red-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white text-red-600 shadow-md">
              <ShieldAlert className="w-8 h-8 animate-bounce" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-widest bg-red-800 px-2.5 py-0.5 rounded-full">
                EMERGENCY ALERT
              </span>
              <h3 className="text-xl font-black mt-0.5">Critical Patient Synced!</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-red-700 hover:bg-red-800 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-slate-800 dark:text-slate-200">
          <div className="bg-red-50 dark:bg-red-950/60 p-4 rounded-2xl border border-red-200 dark:border-red-800">
            <div className="flex items-baseline justify-between">
              <h4 className="text-lg font-black text-slate-900 dark:text-white">
                {alertData.patientName || 'Rural Patient'}
              </h4>
              <span className="text-xs font-bold text-red-700 dark:text-red-300">
                {alertData.patientAge} Years • {alertData.patientVillage || 'Field Location'}
              </span>
            </div>

            <div className="mt-2 text-xs font-bold text-red-800 dark:text-red-300 bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-red-300 dark:border-red-800">
              🚨 Triage Rule Flag: {alertData.triageReason || 'Acute Coronary / Respiratory Emergency'}
            </div>
          </div>

          {/* Vitals Summary */}
          {alertData.symptoms?.vitals && (
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <span className="text-slate-400 block text-[10px]">BP</span>
                <span className="font-bold">{alertData.symptoms.vitals.bp}</span>
              </div>
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <span className="text-slate-400 block text-[10px]">SpO2</span>
                <span className="font-bold text-emerald-500">{alertData.symptoms.vitals.spo2}</span>
              </div>
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <span className="text-slate-400 block text-[10px]">Pulse</span>
                <span className="font-bold">{alertData.symptoms.vitals.pulse} bpm</span>
              </div>
            </div>
          )}

          <p className="text-xs text-slate-500 dark:text-slate-400">
            This case was triaged as Critical on the ASHA worker's device and immediately prioritized upon sync.
          </p>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => {
                onClose();
                onStartConsult(alertData);
              }}
              className="py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
            >
              <Video className="w-4 h-4" />
              <span>Immediate Consult</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onReviewCase(alertData);
              }}
              className="py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
            >
              <FileText className="w-4 h-4" />
              <span>Review & Prescribe</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
