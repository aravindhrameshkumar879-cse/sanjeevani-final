import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { generatePrescriptionPdf } from '../../utils/pdfGenerator.js';
import { generateAutomatedPrescription } from '../../utils/aiPrescribeEngine.js';
import { voiceAssistant } from '../../services/voiceAssistant.js';
import { 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  Download, 
  Volume2, 
  VolumeX,
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Heart, 
  Sparkles,
  QrCode,
  Pill,
  Sun,
  Moon,
  Coffee,
  HelpCircle,
  Eye,
  Printer,
  X
} from 'lucide-react';

export const PatientPortal = () => {
  const { currentUser, consultations, language, t } = useApp();
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState('');

  // Filter consultations matching this patient
  const patientConsults = consultations.filter(c => 
    (currentUser?.name && c.patientName?.toLowerCase().includes(currentUser.name.toLowerCase())) ||
    (currentUser?.phone && c.patientPhone === currentUser.phone) ||
    c.patientId === currentUser?._id
  );

  // Default to first consultation or fallback
  const activeConsultation = patientConsults.length > 0 ? patientConsults[0] : (consultations[0] || {
    patientName: currentUser?.name || 'Rameshwar Prasad',
    patientAge: currentUser?.age || 52,
    patientGender: currentUser?.gender || 'Male',
    patientVillage: currentUser?.village || 'Rampur Khurd',
    patientPhone: currentUser?.phone || '9876543210',
    patientAbhaId: currentUser?.abhaId || '91-4829-1029-4820',
    priorityTag: 'Routine',
    triageReason: 'Routine tele-consultation enrollment for primary care',
    symptoms: { text: 'Primary healthcare consultation' }
  });

  // Calculate default ICMR medicines if prescription is not manually saved yet
  const autoRegimen = generateAutomatedPrescription({
    age: activeConsultation.patientAge,
    gender: activeConsultation.patientGender,
    symptoms: activeConsultation.symptoms || {},
    priorityTag: activeConsultation.priorityTag || 'Routine',
    triageReason: activeConsultation.triageReason || ''
  });

  const effectivePrescription = activeConsultation.prescription?.medicines?.length > 0 
    ? activeConsultation.prescription 
    : {
        medicines: autoRegimen.medicines,
        notes: autoRegimen.notes,
        dietAdvice: autoRegimen.dietAdvice
      };

  const handleDownloadPdf = () => {
    try {
      const result = generatePrescriptionPdf({
        consultation: activeConsultation,
        prescription: effectivePrescription,
        doctorName: activeConsultation.doctorName || 'Dr. Arvind Mehta (MD, AIIMS New Delhi)'
      });

      setDownloadSuccessToast('✓ e-Prescription PDF downloaded successfully!');
      setTimeout(() => setDownloadSuccessToast(''), 4000);
    } catch (err) {
      console.error('PDF error:', err);
    }
  };

  const handleVoiceReadout = () => {
    if (isPlayingAudio) {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingAudio(false);
      return;
    }

    const meds = effectivePrescription.medicines || [];
    let readoutText = '';

    if (language === 'hi') {
      readoutText = `नमस्ते ${activeConsultation.patientName} जी। डॉक्टर द्वारा दी गई दवाएं इस प्रकार हैं: `;
      meds.forEach((m, idx) => {
        readoutText += `दवा नंबर ${idx + 1}: ${m.name}, खुराक: ${m.dosage}, समय: ${m.frequency}। ${m.instructions || ''}। `;
      });
      if (effectivePrescription.dietAdvice) {
        readoutText += `सावधानी और खानपान: ${effectivePrescription.dietAdvice}। `;
      }
      readoutText += `किसी भी परेशानी में अपनी आशा कार्यकर्ता पूजा शर्मा से तुरंत संपर्क करें।`;
    } else if (language === 'ta') {
      readoutText = `வணக்கம் ${activeConsultation.patientName} அவர்களே. மருத்துவர் பரிந்துரைத்த மருந்துகள்: `;
      meds.forEach((m, idx) => {
        readoutText += `மருந்து ${idx + 1}: ${m.name}, அளவு: ${m.dosage}, நேரம்: ${m.frequency}। `;
      });
    } else {
      readoutText = `Hello ${activeConsultation.patientName}. Here are your prescribed medicines: `;
      meds.forEach((m, idx) => {
        readoutText += `Medicine ${idx + 1}: ${m.name}, dosage: ${m.dosage}, frequency: ${m.frequency}, ${m.instructions || ''}. `;
      });
      readoutText += `Please consult your ASHA worker Pooja Sharma if you feel any discomfort.`;
    }

    setIsPlayingAudio(true);
    voiceAssistant.speakText(readoutText, language);

    setTimeout(() => {
      setIsPlayingAudio(false);
    }, 15000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {downloadSuccessToast && (
        <div className="fixed top-20 right-5 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-black animate-fade-in">
          <CheckCircle2 className="w-5 h-5" />
          <span>{downloadSuccessToast}</span>
        </div>
      )}

      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 rounded-3xl p-5 sm:p-7 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-white/20 rounded-full inline-block backdrop-blur-sm">
              Ayushman Bharat Digital Health (ABDM Verified)
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              {currentUser?.name || 'Rameshwar Prasad'}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs opacity-90">
              <span>{currentUser?.age || 52} Years • {currentUser?.gender || 'Male'}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {currentUser?.village || 'Rampur Khurd'}
              </span>
              <span>•</span>
              <span className="font-mono font-bold bg-black/20 px-2 py-0.5 rounded">
                ABHA: {currentUser?.abhaId || '91-4829-1029-4820'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl backdrop-blur-md border border-white/20">
            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center p-1 text-slate-900 shadow-inner">
              <QrCode className="w-full h-full text-slate-800" />
            </div>
            <div className="text-xs">
              <span className="font-bold block text-white">Digital Health QR</span>
              <span className="opacity-75 block text-[11px]">Scan at PHC / Pharmacy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Case Status Stepper */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Current Clinical Case Status
          </h3>

          {/* Quick PDF Download Button in Status Bar */}
          <button
            onClick={handleDownloadPdf}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download e-Prescription PDF</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Step 1 */}
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>1. Field Intake</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Recorded by ASHA Worker (Pooja Sharma)
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>2. On-Device Triage</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Tag: <span className="font-bold text-red-600 dark:text-red-400">{activeConsultation?.priorityTag || 'Routine'}</span>
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>3. Synced with PHC</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Transmitted to Medical Officer
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-300 dark:border-purple-800 text-purple-900 dark:text-purple-200 text-xs">
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <CheckCircle2 className="w-4 h-4 text-purple-600" />
              <span>4. e-Prescription</span>
            </div>
            <p className="text-[11px] opacity-80">
              Ready for Download & Pharmacy
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: e-Prescription & Medicine Timings (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <span>Doctor's Official e-Prescription</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Prescribing Physician: <span className="font-bold text-slate-800 dark:text-slate-200">{activeConsultation?.doctorName || 'Dr. Arvind Mehta (MD, AIIMS)'}</span>
                </p>
              </div>

              {/* Action Buttons: Voice readout, View Modal, PDF download */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleVoiceReadout}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                    isPlayingAudio
                      ? 'bg-amber-600 text-white animate-pulse'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  <span>{isPlayingAudio ? 'Stop Voice' : '🗣️ Listen in Audio'}</span>
                </button>

                <button
                  onClick={() => setShowViewModal(true)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Details</span>
                </button>

                <button
                  onClick={handleDownloadPdf}
                  id="btn-patient-download-pdf"
                  className="px-4 py-2 rounded-xl text-xs font-black bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>

            {/* Medicines List */}
            <div className="space-y-4">
              <div className="space-y-3">
                {effectivePrescription.medicines?.map((med, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2 hover:border-purple-300 dark:hover:border-purple-800 transition-all"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-black text-xs">
                          #{index + 1}
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                            {med.name}
                          </h4>
                          <span className="text-xs text-slate-500 font-semibold">
                            Dosage: {med.dosage}
                          </span>
                        </div>
                      </div>

                      {/* Frequency Pill */}
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                          {med.frequency}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          {med.duration}
                        </span>
                      </div>
                    </div>

                    {/* Instructions */}
                    {med.instructions && (
                      <div className="text-xs bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">Directions:</span>
                        <span>{med.instructions}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Doctor Notes & Diet */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-xs">
                  <span className="font-bold block text-amber-900 dark:text-amber-200 mb-1">
                    Doctor Clinical Notes:
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 font-medium">
                    {effectivePrescription.notes || 'Routine follow-up in 3 days.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-xs">
                  <span className="font-bold block text-emerald-900 dark:text-emerald-200 mb-1">
                    Dietary & Home Advice:
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 font-medium">
                    {effectivePrescription.dietAdvice || 'Drink boiled warm water, take adequate rest.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Assigned ASHA Worker & Helplines (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Assigned ASHA Worker Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Your Village ASHA Care Worker
            </h3>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white text-xl shadow-md">
                👩‍⚕️
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Pooja Sharma
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  ASHA ID: ASHA-UP-4829
                </p>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                  Rampur Khurd Sub-Centre
                </span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="tel:9812345678"
                className="w-full py-2.5 px-4 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call ASHA Worker (+91 98123 45678)</span>
              </a>
            </div>
          </div>

          {/* Emergency Helplines */}
          <div className="bg-red-50 dark:bg-red-950/40 rounded-3xl border border-red-200 dark:border-red-800/80 p-5 space-y-2 text-xs">
            <h3 className="font-bold text-red-900 dark:text-red-200 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>National Rural Health Helplines</span>
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-[11px]">
              Free 24x7 Government emergency services:
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="bg-white dark:bg-slate-900 p-2 rounded-xl text-center font-bold text-red-600">
                108 (Ambulance)
              </div>
              <div className="bg-white dark:bg-slate-900 p-2 rounded-xl text-center font-bold text-blue-600">
                104 (Health Helpline)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: View Prescription on Screen */}
      {showViewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-purple-700 to-indigo-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                <h3 className="font-bold text-sm sm:text-base">Official Digital e-Prescription</h3>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-slate-800 dark:text-slate-200 text-xs">
              <div className="border-b pb-3 border-slate-200 dark:border-slate-700 flex justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {activeConsultation.doctorName || 'Dr. Arvind Mehta (MD, AIIMS)'}
                  </h4>
                  <p className="text-slate-500">MCI Reg: 48291-MH • Primary Health Centre (PHC)</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 dark:text-white">{activeConsultation.patientName}</span>
                  <p className="text-slate-500">{activeConsultation.patientAge}y, {activeConsultation.patientGender} • {activeConsultation.patientVillage}</p>
                </div>
              </div>

              {/* Medicine Table */}
              <div className="space-y-2">
                <h5 className="font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
                  ℞ Prescribed Medicines:
                </h5>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 border rounded-xl overflow-hidden border-slate-200 dark:border-slate-700">
                  {effectivePrescription.medicines?.map((m, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/60 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{m.name}</div>
                        <div className="text-[11px] text-slate-500">{m.instructions}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-purple-600">{m.dosage}</div>
                        <div className="text-[11px] text-slate-500">{m.frequency} ({m.duration})</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200 dark:border-amber-800">
                <strong>Clinical Notes:</strong> {effectivePrescription.notes}
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <strong>Diet Advice:</strong> {effectivePrescription.dietAdvice}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => { setShowViewModal(false); handleDownloadPdf(); }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
