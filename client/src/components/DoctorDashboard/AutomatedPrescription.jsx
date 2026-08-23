import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { generatePrescriptionPdf } from '../../utils/pdfGenerator.js';
import { generateAutomatedPrescription } from '../../utils/aiPrescribeEngine.js';
import { LocalStorageService } from '../../services/storage.js';
import { 
  FileText, 
  Sparkles, 
  Plus, 
  Trash2, 
  Download, 
  Save, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Clock, 
  Share2, 
  X,
  Stethoscope
} from 'lucide-react';

export const AutomatedPrescription = ({ consultation, onClose, onPrescriptionSaved }) => {
  const { t, refreshData } = useApp();
  const [medicines, setMedicines] = useState([]);
  const [notes, setNotes] = useState('');
  const [dietAdvice, setDietAdvice] = useState('');
  const [warnings, setWarnings] = useState([]);
  const [regimenType, setRegimenType] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [pdfGenerated, setPdfGenerated] = useState(false);

  // Generate automated clinical recommendation on mount or load existing prescription
  useEffect(() => {
    if (consultation.prescription && consultation.prescription.medicines?.length > 0) {
      // Existing prescription
      setMedicines(consultation.prescription.medicines);
      setNotes(consultation.prescription.notes || '');
      setDietAdvice(consultation.prescription.dietAdvice || '');
    } else {
      // Fetch AI/Formulary automated regimen
      fetchAutoPrescription();
    }
  }, [consultation]);

  const fetchAutoPrescription = async () => {
    // 1. Instant on-device computation (zero latency offline guarantee)
    const localRec = generateAutomatedPrescription({
      age: consultation.patientAge,
      gender: consultation.patientGender,
      symptoms: consultation.symptoms,
      priorityTag: consultation.priorityTag,
      triageReason: consultation.triageReason
    });

    if (localRec) {
      setMedicines(localRec.medicines || []);
      setNotes(localRec.notes || '');
      setDietAdvice(localRec.dietAdvice || '');
      setWarnings(localRec.warnings || []);
      setRegimenType(localRec.regimenType || '');
    }

    // 2. Fetch from backend API if online for server-side updates
    try {
      const res = await fetch('/api/ai-prescribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age: consultation.patientAge,
          gender: consultation.patientGender,
          symptoms: consultation.symptoms,
          priorityTag: consultation.priorityTag,
          triageReason: consultation.triageReason
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.recommendation) {
          setMedicines(data.recommendation.medicines || []);
          setNotes(data.recommendation.notes || '');
          setDietAdvice(data.recommendation.dietAdvice || '');
          setWarnings(data.recommendation.warnings || []);
          setRegimenType(data.recommendation.regimenType || '');
        }
      }
    } catch (err) {
      console.warn('Auto prescribe API fallback:', err);
    }
  };

  const handleAddMedicine = () => {
    setMedicines(prev => [
      ...prev,
      {
        name: 'Tab. Paracetamol',
        dosage: '650 mg',
        frequency: 'TDS (Thrice daily)',
        duration: '3 days',
        instructions: 'After food with water'
      }
    ]);
  };

  const handleRemoveMedicine = (index) => {
    setMedicines(prev => prev.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index, field, value) => {
    setMedicines(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSaveAndPrescribe = async () => {
    setIsSaving(true);
    const doctorName = 'Dr. Arvind Mehta (MD, AIIMS New Delhi)';

    const prescriptionPayload = {
      medicines,
      notes,
      dietAdvice,
      doctorId: 'doc-mehta-1',
      doctorName,
      prescribedAt: new Date().toISOString()
    };

    // 1. Update on-device local storage first (offline-first guarantee)
    LocalStorageService.updateSyncStatus(consultation._id, 'synced', {
      prescription: prescriptionPayload,
      consultStatus: 'completed'
    });

    // 2. Push to backend if reachable
    try {
      await fetch('/api/prescriptions/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consultationId: consultation._id,
          medicines,
          notes,
          dietAdvice,
          doctorId: 'doc-mehta-1',
          doctorName
        })
      });
    } catch (e) {
      console.warn('Backend prescription sync deferred:', e);
    }

    setIsSaving(false);
    refreshData();

    // 3. Generate PDF
    handleDownloadPdf();

    if (onPrescriptionSaved) {
      onPrescriptionSaved({
        ...consultation,
        prescription: prescriptionPayload,
        consultStatus: 'completed'
      });
    }
  };

  const handleDownloadPdf = () => {
    const dataUrl = generatePrescriptionPdf({
      consultation,
      prescription: { medicines, notes, dietAdvice },
      doctorName: 'Dr. Arvind Mehta (MD, Cardiology)'
    });
    setPdfGenerated(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-700 to-emerald-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/20">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 bg-white/20 rounded-full">
                  Telemedicine e-Prescription
                </span>
                <span className="text-xs font-semibold opacity-90">
                  Patient: {consultation.patientName} ({consultation.patientAge}y, {consultation.patientGender})
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black">
                {consultation.priorityTag === 'Critical' ? '🚨 Emergency Clinical Treatment Protocol' : 'Clinical Prescription Formulation'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-slate-800 dark:text-slate-200">
          {/* Automated Formulary Regimen Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-300 dark:border-emerald-800 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs">
              <div className="font-bold text-emerald-900 dark:text-emerald-200">
                ICMR & NLEM Automated Recommendation: {regimenType || 'Standard Clinical Formulary'}
              </div>
              <p className="text-emerald-700 dark:text-emerald-300 mt-0.5">
                Regimen auto-suggested based on patient age ({consultation.patientAge}y) and triage status ({consultation.priorityTag}: {consultation.triageReason}). Doctor can edit dosages below.
              </p>
            </div>
          </div>

          {/* Critical Warnings if any */}
          {warnings.length > 0 && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-800 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-red-800 dark:text-red-300">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>CLINICAL RED FLAG WARNING:</span>
              </div>
              {warnings.map((w, idx) => (
                <p key={idx} className="text-xs text-red-700 dark:text-red-400 font-medium pl-5">
                  • {w}
                </p>
              ))}
            </div>
          )}

          {/* Medicines List Table / Form */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Prescribed Medications (Generic Formulations)</span>
              </h4>
              <button
                type="button"
                onClick={handleAddMedicine}
                className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold flex items-center gap-1 border border-slate-200 dark:border-slate-700"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Medicine</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {medicines.map((med, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs items-center"
                >
                  <div className="sm:col-span-4">
                    <label className="text-[10px] text-slate-400 block mb-0.5">Medicine Name</label>
                    <input
                      type="text"
                      value={med.name}
                      onChange={(e) => handleMedicineChange(idx, 'name', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-slate-400 block mb-0.5">Dosage</label>
                    <input
                      type="text"
                      value={med.dosage}
                      onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-slate-400 block mb-0.5">Frequency</label>
                    <input
                      type="text"
                      value={med.frequency}
                      onChange={(e) => handleMedicineChange(idx, 'frequency', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-slate-400 block mb-0.5">Duration</label>
                    <input
                      type="text"
                      value={med.duration}
                      onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="sm:col-span-2 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveMedicine(idx)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/60 rounded-lg transition-colors"
                      title="Remove medicine"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="sm:col-span-12">
                    <input
                      type="text"
                      placeholder="Instructions (e.g. Chew immediately / Take after food)"
                      value={med.instructions || ''}
                      onChange={(e) => handleMedicineChange(idx, 'instructions', e.target.value)}
                      className="w-full px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] text-slate-600 dark:text-slate-300"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Doctor Clinical Notes & Dietary Advice */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Clinical Examination Notes & Investigations:
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Diagnostic impressions, emergency referral notes..."
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Dietary & Home Care Instructions for ASHA / Patient:
              </label>
              <textarea
                rows={3}
                value={dietAdvice}
                onChange={(e) => setDietAdvice(e.target.value)}
                placeholder="Hydration, resting position, steam inhalation..."
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Digital MCI / NMC stamp attached to generated PDF</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={handleSaveAndPrescribe}
              disabled={isSaving}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-md transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving & Generating...' : 'Save & Issue e-Prescription'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
