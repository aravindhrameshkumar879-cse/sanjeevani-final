import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { syncEngine } from '../../services/syncEngine.js';
import { generatePrescriptionPdf } from '../../utils/pdfGenerator.js';
import { 
  X, 
  User, 
  MapPin, 
  Phone, 
  Hash, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  RefreshCw, 
  Download, 
  FileText, 
  Heart, 
  Activity, 
  Volume2,
  Stethoscope
} from 'lucide-react';

export const PatientDetailModal = ({ consultation, onClose, onStartConsultation }) => {
  const { syncStatus, t } = useApp();

  if (!consultation) return null;

  const isCritical = consultation.priorityTag === 'Critical';
  const isRoutine = consultation.priorityTag === 'Routine';
  const isSynced = consultation.syncStatus === 'synced';

  const handleSyncThisCase = () => {
    syncEngine.syncPendingConsultations();
  };

  const handleDownloadPrescription = () => {
    if (!consultation.prescription) return;
    generatePrescriptionPdf({
      consultation,
      prescription: consultation.prescription,
      doctorName: consultation.doctorName || 'Dr. Arvind Mehta (MD)'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className={`p-4 sm:p-5 flex items-center justify-between text-white ${
          isCritical ? 'bg-red-600' : isRoutine ? 'bg-blue-600' : 'bg-emerald-600'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/20">
              {isCritical && <AlertTriangle className="w-6 h-6 animate-pulse" />}
              {isRoutine && <Clock className="w-6 h-6" />}
              {!isCritical && !isRoutine && <CheckCircle2 className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 bg-black/20 rounded-full">
                  {consultation.priorityTag}
                </span>
                <span className="text-xs font-semibold opacity-90">
                  Case #{consultation._id?.slice(-6) || 'LOCAL'}
                </span>
              </div>
              <h3 className="text-xl font-black">{consultation.patientName}</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-slate-800 dark:text-slate-200">
          {/* Sync Status Banner */}
          <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs font-bold ${
            isSynced
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300'
          }`}>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isSynced ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
              <span>
                {isSynced
                  ? `Synced with PHC Hub (${new Date(consultation.syncedAt || consultation.createdAt).toLocaleTimeString()})`
                  : 'Stored locally in device memory (Offline-only)'}
              </span>
            </div>

            {!isSynced && (
              <button
                onClick={handleSyncThisCase}
                disabled={!syncStatus.isEffectiveOnline}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold flex items-center gap-1 shadow-2xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sync Now</span>
              </button>
            )}
          </div>

          {/* Patient Details & ABHA */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Age & Gender</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {consultation.patientAge}y / {consultation.patientGender}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Village / Ward</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {consultation.patientVillage || 'Rampur Khurd'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Phone</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {consultation.patientPhone || 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">ABHA ID (Mock)</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {consultation.patientAbhaId || '91-4829-1029-4820'}
              </span>
            </div>
          </div>

          {/* Triage Decision Table Breakdown */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              On-Device Triage Decision Logic:
            </h4>
            <p className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              {consultation.triageReason}
            </p>
            <div className="text-xs bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
              <span className="font-bold">Protocol Advice:</span> {consultation.actionAdvice || 'Standard primary care follow-up.'}
            </div>
          </div>

          {/* Symptoms & Spoken Voice Transcript */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Clinical Symptoms & Voice Transcript:
            </h4>
            {consultation.symptoms?.voiceTranscript && (
              <div className="p-3 bg-emerald-50/80 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs italic text-slate-800 dark:text-slate-200">
                🗣️ "{consultation.symptoms.voiceTranscript}"
              </div>
            )}
            
            <div className="flex flex-wrap gap-2 pt-1">
              {consultation.symptoms?.chestPain && (
                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800">
                  Chest Pain (Red Flag)
                </span>
              )}
              {consultation.symptoms?.sweating && (
                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800">
                  Sweating
                </span>
              )}
              {consultation.symptoms?.breathingDifficulty && (
                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  Breathing Difficulty
                </span>
              )}
              {consultation.symptoms?.fever && (
                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                  Fever ({consultation.symptoms.feverDays || 1} Days)
                </span>
              )}
              {consultation.symptoms?.cough && (
                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                  Cough
                </span>
              )}
              {consultation.symptoms?.minorAche && (
                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  Minor Body Ache
                </span>
              )}
            </div>
          </div>

          {/* Vitals */}
          {consultation.symptoms?.vitals && (
            <div className="grid grid-cols-4 gap-2 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-center text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">BP</span>
                <span className="font-bold">{consultation.symptoms.vitals.bp || '120/80'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">PULSE</span>
                <span className="font-bold">{consultation.symptoms.vitals.pulse || '76'} bpm</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">SpO2</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{consultation.symptoms.vitals.spo2 || '98%'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">TEMP</span>
                <span className="font-bold">{consultation.symptoms.vitals.temp || '98.6°F'}</span>
              </div>
            </div>
          )}

          {/* Prescription section if prescribed */}
          {consultation.prescription && (
            <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-xs text-purple-900 dark:text-purple-200">
                  <FileText className="w-4 h-4 text-purple-600" />
                  <span>Prescription issued by {consultation.doctorName || 'PHC Medical Officer'}</span>
                </div>
                <button
                  onClick={handleDownloadPrescription}
                  className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>

              <div className="space-y-1.5 pt-1">
                {consultation.prescription.medicines?.map((med, idx) => (
                  <div key={idx} className="text-xs bg-white dark:bg-slate-900 p-2 rounded-lg border border-purple-200/60 dark:border-purple-800/60 flex justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{med.name} ({med.dosage})</span>
                    <span className="text-slate-500">{med.frequency} • {med.duration}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
