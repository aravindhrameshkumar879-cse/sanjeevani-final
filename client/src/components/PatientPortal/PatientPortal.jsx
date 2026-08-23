import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { generatePrescriptionPdf } from '../../utils/pdfGenerator.js';
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
  HelpCircle
} from 'lucide-react';

export const PatientPortal = () => {
  const { currentUser, consultations, language, t } = useApp();
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Filter consultations matching this patient
  const patientConsults = consultations.filter(c => 
    (currentUser?.name && c.patientName?.toLowerCase().includes(currentUser.name.toLowerCase())) ||
    (currentUser?.phone && c.patientPhone === currentUser.phone) ||
    c.patientId === currentUser?._id
  );

  // Default to first consultation or latest consultation
  const activeConsultation = patientConsults.length > 0 ? patientConsults[0] : consultations[0];
  const hasPrescription = Boolean(activeConsultation?.prescription && activeConsultation.prescription.medicines?.length > 0);

  const handleDownloadPdf = () => {
    if (!activeConsultation?.prescription) return;
    generatePrescriptionPdf({
      consultation: activeConsultation,
      prescription: activeConsultation.prescription,
      doctorName: activeConsultation.doctorName || 'Dr. Arvind Mehta (MD, AIIMS)'
    });
  };

  const handleVoiceReadout = () => {
    if (!hasPrescription) return;

    if (isPlayingAudio) {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingAudio(false);
      return;
    }

    const meds = activeConsultation.prescription.medicines || [];
    let readoutText = '';

    if (language === 'hi') {
      readoutText = `नमस्ते ${activeConsultation.patientName} जी। डॉक्टर द्वारा दी गई दवाएं इस प्रकार हैं: `;
      meds.forEach((m, idx) => {
        readoutText += `दवा नंबर ${idx + 1}: ${m.name}, खुराक: ${m.dosage}, समय: ${m.frequency}। ${m.instructions}। `;
      });
      if (activeConsultation.prescription.dietAdvice) {
        readoutText += `सावधानी और खानपान: ${activeConsultation.prescription.dietAdvice}। `;
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
        readoutText += `Medicine ${idx + 1}: ${m.name}, dosage: ${m.dosage}, frequency: ${m.frequency}, ${m.instructions}. `;
      });
      readoutText += `Please consult your ASHA worker Pooja Sharma if you feel any discomfort.`;
    }

    setIsPlayingAudio(true);
    voiceAssistant.speakText(readoutText, language);

    // Auto reset state after speaking duration
    setTimeout(() => {
      setIsPlayingAudio(false);
    }, 15000);
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 rounded-3xl p-5 sm:p-7 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-white/20 rounded-full inline-block backdrop-blur-sm">
              Ayushman Bharat Digital Health (ABDM Mock)
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
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
          Current Clinical Case Status
        </h3>

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
              Tag: <span className="font-bold text-red-600 dark:text-red-400">{activeConsultation?.priorityTag || 'Critical'}</span>
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
          <div className={`p-3 rounded-xl border text-xs ${
            hasPrescription
              ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-300 dark:border-purple-800 text-purple-900 dark:text-purple-200'
              : 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 animate-pulse'
          }`}>
            <div className="flex items-center gap-1.5 font-bold mb-1">
              {hasPrescription ? <CheckCircle2 className="w-4 h-4 text-purple-600" /> : <Clock className="w-4 h-4 text-amber-600" />}
              <span>4. e-Prescription</span>
            </div>
            <p className="text-[11px] opacity-80">
              {hasPrescription ? 'Issued by Dr. Arvind Mehta' : 'Under Doctor Review'}
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

              {/* Action Buttons: Voice readout & PDF download */}
              {hasPrescription && (
                <div className="flex items-center gap-2">
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
                    onClick={handleDownloadPdf}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF</span>
                  </button>
                </div>
              )}
            </div>

            {/* Medicines List */}
            {hasPrescription ? (
              <div className="space-y-4">
                <div className="space-y-3">
                  {activeConsultation.prescription.medicines?.map((med, index) => (
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
                      {activeConsultation.prescription.notes || 'Routine follow-up in 3 days.'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-xs">
                    <span className="font-bold block text-emerald-900 dark:text-emerald-200 mb-1">
                      Dietary & Home Advice:
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 font-medium">
                      {activeConsultation.prescription.dietAdvice || 'Drink boiled warm water, take adequate rest.'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <Clock className="w-8 h-8 text-amber-500 mx-auto mb-2 animate-spin" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Prescription is being generated
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  The PHC Medical Officer has received your case and is reviewing your symptoms.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Assigned ASHA Worker & Past History (4 cols) */}
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
    </div>
  );
};
