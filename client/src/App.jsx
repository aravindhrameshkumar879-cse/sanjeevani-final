import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useApp } from './context/AppContext.jsx';
import { LocalStorageService } from './services/storage.js';
import { syncEngine } from './services/syncEngine.js';
import { calculateTriage } from './utils/triageEngine.js';

// ASHA Components
import { AshaHeader } from './components/AshaApp/AshaHeader.jsx';
import { PatientRegistration } from './components/AshaApp/PatientRegistration.jsx';
import { VoiceSymptomIntake } from './components/AshaApp/VoiceSymptomIntake.jsx';
import { SymptomForm } from './components/AshaApp/SymptomForm.jsx';
import { TriageResultCard } from './components/AshaApp/TriageResultCard.jsx';
import { PatientQueue } from './components/AshaApp/PatientQueue.jsx';
import { PatientDetailModal } from './components/AshaApp/PatientDetailModal.jsx';

// Doctor Components
import { DoctorHeader } from './components/DoctorDashboard/DoctorHeader.jsx';
import { LivePriorityQueue } from './components/DoctorDashboard/LivePriorityQueue.jsx';
import { AutomatedPrescription } from './components/DoctorDashboard/AutomatedPrescription.jsx';
import { WebRtcConsultation } from './components/DoctorDashboard/WebRtcConsultation.jsx';
import { CriticalAlertModal } from './components/DoctorDashboard/CriticalAlertModal.jsx';

// Patient Portal Components
import { PatientHeader } from './components/PatientPortal/PatientHeader.jsx';
import { PatientPortal } from './components/PatientPortal/PatientPortal.jsx';

// Auth Login Modal
import { LoginScreen } from './components/Auth/LoginScreen.jsx';

// Demo Helper
import { DemoScenarios } from './components/DemoScenarios.jsx';

import { 
  UserCheck, 
  Stethoscope, 
  User,
  Sparkles, 
  ShieldCheck, 
  Wifi, 
  WifiOff, 
  CheckCircle2, 
  HelpCircle,
  Activity,
  Heart,
  KeyRound,
  LogIn
} from 'lucide-react';

export default function App() {
  const { 
    role, 
    setRole, 
    currentUser,
    setCurrentUser,
    showLoginModal,
    setShowLoginModal,
    syncStatus, 
    refreshData, 
    t, 
    activeAlertModal, 
    setActiveAlertModal, 
    triggerCriticalAlert 
  } = useApp();

  // Active form state for ASHA intake
  const [patientData, setPatientData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    phone: '',
    village: 'Rampur Khurd',
    abhaId: '91-4829-1029-4820'
  });

  const [symptoms, setSymptoms] = useState({
    text: '',
    voiceTranscript: '',
    fever: false,
    feverDays: 0,
    cough: false,
    chestPain: false,
    sweating: false,
    breathingDifficulty: false,
    minorAche: false
  });

  const [vitals, setVitals] = useState({
    bp: '120/80',
    pulse: '76',
    spo2: '98%',
    temp: '98.6°F'
  });

  // Modals & Selected Cases
  const [selectedPatientModal, setSelectedPatientModal] = useState(null);
  const [activePrescriptionModal, setActivePrescriptionModal] = useState(null);
  const [activeVideoConsultModal, setActiveVideoConsultModal] = useState(null);
  const [saveBannerMessage, setSaveBannerMessage] = useState('');

  // Socket.io setup for real-time doctor live sync & critical alerts
  useEffect(() => {
    const socket = io('/', {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10
    });

    socket.on('connect', () => {
      console.log('[Socket.io] Connected to server for real-time triage updates');
    });

    socket.on('critical_patient_alert', (alert) => {
      console.log('[Socket.io] 🚨 Critical Alert Received:', alert);
      triggerCriticalAlert(alert);
      refreshData();
    });

    socket.on('batch_synced', (data) => {
      console.log('[Socket.io] Batch synced from field:', data);
      refreshData();
    });

    socket.on('prescription_created', (data) => {
      console.log('[Socket.io] Prescription created:', data);
      refreshData();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Handle Voice Assistant extraction into form
  const handleSymptomsExtracted = (extracted, rawTranscript) => {
    setSymptoms(prev => ({
      ...prev,
      ...extracted,
      voiceTranscript: rawTranscript,
      text: rawTranscript
    }));
  };

  // Load a 1-click test scenario
  const handleLoadScenario = (loadedPatient, loadedSymptoms) => {
    setPatientData(loadedPatient);
    setSymptoms(loadedSymptoms);
    if (loadedSymptoms.vitals) {
      setVitals(loadedSymptoms.vitals);
    }
  };

  // Save case offline (Hits device storage first, full stop)
  const handleSaveOffline = (triageResult) => {
    // 1. Save patient locally
    const savedPatient = LocalStorageService.savePatient(patientData);

    // 2. Save consultation locally (Offline write first)
    const newConsultation = LocalStorageService.saveConsultation({
      patientId: savedPatient._id,
      patientName: savedPatient.name,
      patientAge: savedPatient.age,
      patientGender: savedPatient.gender,
      patientVillage: savedPatient.village,
      patientPhone: savedPatient.phone,
      patientAbhaId: savedPatient.abhaId,
      symptoms: {
        ...symptoms,
        vitals
      },
      priorityTag: triageResult.tag,
      triageReason: triageResult.reason,
      urgencyScore: triageResult.urgencyScore,
      actionAdvice: triageResult.actionAdvice,
      syncStatus: syncStatus.isEffectiveOnline ? 'queued' : 'offline',
      createdBy: 'ASHA-Pooja-Sharma'
    });

    refreshData();

    // Show visual feedback banner
    setSaveBannerMessage(
      `✓ Case for ${savedPatient.name} saved offline! Triage: [ ${triageResult.tag} ]. ${
        syncStatus.isEffectiveOnline ? 'Auto-syncing to PHC Cloud...' : 'Held in local device queue.'
      }`
    );

    // If online, trigger background sync immediately
    if (syncStatus.isEffectiveOnline) {
      syncEngine.syncPendingConsultations();
    }

    // Reset form for next patient
    setTimeout(() => {
      setPatientData({
        name: '',
        age: '',
        gender: 'Male',
        phone: '',
        village: 'Rampur Khurd',
        abhaId: `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`
      });
      setSymptoms({
        text: '',
        voiceTranscript: '',
        fever: false,
        feverDays: 0,
        cough: false,
        chestPain: false,
        sweating: false,
        breathingDifficulty: false,
        minorAche: false
      });
    }, 1500);

    setTimeout(() => {
      setSaveBannerMessage('');
    }, 6000);
  };

  const handleRoleSwitch = (newRole) => {
    setRole(newRole);
    if (newRole === 'doctor') {
      setCurrentUser({
        _id: 'doc-1',
        role: 'doctor',
        name: 'Dr. Arvind Mehta (MD, AIIMS)',
        phone: '9876543210',
        hospitalId: 'AIIMS-Rampur-Hub'
      });
    } else if (newRole === 'asha') {
      setCurrentUser({
        _id: 'asha-1',
        role: 'asha',
        name: 'Pooja Sharma (ASHA Worker)',
        phone: '9812345678',
        village: 'Rampur Khurd Sub-Centre'
      });
    } else if (newRole === 'patient') {
      setCurrentUser({
        _id: 'pat-seed-001',
        role: 'patient',
        name: 'Rameshwar Prasad',
        phone: '9876543210',
        age: 52,
        gender: 'Male',
        village: 'Rampur Khurd',
        abhaId: '91-4829-1029-4820'
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      {/* Top Application Switcher Bar with Separate Portals */}
      <div className="bg-slate-900 text-white px-4 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-emerald-500 flex items-center justify-center font-black text-slate-950 text-xs">
            SC
          </div>
          <span className="font-extrabold tracking-wide text-emerald-400">SANJEEVANI CONNECT</span>
          <span className="text-slate-500 hidden sm:inline">• Offline-First Rural Telemedicine Platform</span>
        </div>

        {/* 3-Role Quick Switcher Bar */}
        <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 gap-1">
          {/* Doctor Portal */}
          <button
            onClick={() => handleRoleSwitch('doctor')}
            id="switch-role-doctor"
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
              role === 'doctor'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>👨‍⚕️ Doctor</span>
          </button>

          {/* ASHA Field App */}
          <button
            onClick={() => handleRoleSwitch('asha')}
            id="switch-role-asha"
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
              role === 'asha'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>👩‍⚕️ ASHA App</span>
          </button>

          {/* Patient Portal */}
          <button
            onClick={() => handleRoleSwitch('patient')}
            id="switch-role-patient"
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
              role === 'patient'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>👤 Patient</span>
          </button>

          {/* Login / Switch Account Modal */}
          <button
            onClick={() => setShowLoginModal(true)}
            id="btn-open-login"
            className="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 font-bold flex items-center gap-1 transition-all border-l border-slate-700 ml-0.5"
            title="Open Dedicated Login Screen"
          >
            <LogIn className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Login / Switch</span>
          </button>
        </div>
      </div>

      {/* Role-Specific Header */}
      {role === 'asha' ? (
        <AshaHeader onLogout={() => setShowLoginModal(true)} />
      ) : role === 'doctor' ? (
        <DoctorHeader onLogout={() => setShowLoginModal(true)} />
      ) : (
        <PatientHeader onLogout={() => setShowLoginModal(true)} />
      )}

      {/* Save Success Banner Notification */}
      {saveBannerMessage && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 text-xs font-bold text-center flex items-center justify-center gap-2 animate-fade-in shadow-md">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{saveBannerMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-6 space-y-6">
        {role === 'asha' ? (
          /* ================= ASHA WORKER VIEW ================= */
          <div className="space-y-6">
            {/* Quick 1-Click Triage Scenarios */}
            <DemoScenarios onLoadScenario={handleLoadScenario} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Intake & Triage (7 cols) */}
              <div className="lg:col-span-7 space-y-5">
                {/* 1. Patient Registration */}
                <PatientRegistration
                  patientData={patientData}
                  onChange={setPatientData}
                  onDirectSave={() => {
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
                    handleSaveOffline(triage);
                  }}
                />

                {/* 2. Voice Symptom Intake (Multilingual Voice Assistant) */}
                <VoiceSymptomIntake
                  onSymptomsExtracted={handleSymptomsExtracted}
                  currentSymptoms={symptoms}
                />

                {/* 3. Structured Symptom Checkboxes & Vitals */}
                <SymptomForm
                  symptoms={symptoms}
                  onChange={setSymptoms}
                  vitals={vitals}
                  onVitalsChange={setVitals}
                />

                {/* 4. On-Device Pure Deterministic Triage Result */}
                <TriageResultCard
                  patientData={patientData}
                  symptoms={symptoms}
                  onSaveOffline={handleSaveOffline}
                />
              </div>

              {/* Right Column: Priority Queue & Sync Monitor (5 cols) */}
              <div className="lg:col-span-5 space-y-5">
                <PatientQueue
                  onSelectPatient={(consult) => setSelectedPatientModal(consult)}
                />
              </div>
            </div>
          </div>
        ) : role === 'doctor' ? (
          /* ================= DOCTOR DASHBOARD VIEW ================= */
          <div className="space-y-6">
            <LivePriorityQueue
              onOpenCase={(consult) => setActivePrescriptionModal(consult)}
              onStartVideoConsult={(consult) => setActiveVideoConsultModal(consult)}
            />
          </div>
        ) : (
          /* ================= PATIENT & FAMILY PORTAL VIEW ================= */
          <div className="space-y-6">
            <PatientPortal />
          </div>
        )}
      </main>

      {/* Modals */}
      {selectedPatientModal && (
        <PatientDetailModal
          consultation={selectedPatientModal}
          onClose={() => setSelectedPatientModal(null)}
          onStartConsultation={(consult) => {
            setSelectedPatientModal(null);
            setActiveVideoConsultModal(consult);
          }}
        />
      )}

      {activePrescriptionModal && (
        <AutomatedPrescription
          consultation={activePrescriptionModal}
          onClose={() => setActivePrescriptionModal(null)}
          onPrescriptionSaved={() => {
            setActivePrescriptionModal(null);
            refreshData();
          }}
        />
      )}

      {activeVideoConsultModal && (
        <WebRtcConsultation
          consultation={activeVideoConsultModal}
          onClose={() => setActiveVideoConsultModal(null)}
          onOpenPrescription={(consult) => {
            setActiveVideoConsultModal(null);
            setActivePrescriptionModal(consult);
          }}
        />
      )}

      {/* Critical Alert Emergency Modal */}
      {activeAlertModal && (
        <CriticalAlertModal
          alertData={activeAlertModal}
          onClose={() => setActiveAlertModal(null)}
          onReviewCase={(consult) => setActivePrescriptionModal(consult)}
          onStartConsult={(consult) => setActiveVideoConsultModal(consult)}
        />
      )}

      {/* Dedicated Login & Role Switcher Modal */}
      {showLoginModal && (
        <LoginScreen
          onLoginSuccess={(user, userRole) => {
            setShowLoginModal(false);
          }}
          onClose={() => setShowLoginModal(false)}
        />
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-4 px-4 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <span>
            🌿 <span className="font-bold text-slate-800 dark:text-slate-200">SanjeevaniConnect</span> • Offline-First Telemedicine for Rural India
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Offline-First Guaranteed</span>
            </span>
            <span>•</span>
            <span>11 Indian Languages</span>
            <span>•</span>
            <span>Doctor & Patient Portals</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
