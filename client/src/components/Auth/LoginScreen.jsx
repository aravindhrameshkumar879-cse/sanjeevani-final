import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { LocalStorageService } from '../../services/storage.js';
import { INDIAN_LANGUAGES } from '../../i18n/languages.js';
import { 
  Activity, 
  User, 
  Users,
  Building2, 
  Stethoscope, 
  UserCheck, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Globe, 
  FileText, 
  Download, 
  Radio, 
  ShieldCheck, 
  Phone, 
  X,
  HeartPulse,
  UserPlus
} from 'lucide-react';

export const LoginScreen = ({ onLoginSuccess, onClose }) => {
  const { language, setLanguage, t, login, refreshData, setRole, setCurrentUser } = useApp();
  const [selectedStaffSubRole, setSelectedStaffSubRole] = useState(null); // null | 'doctor' | 'asha'
  const [activeModal, setActiveModal] = useState(null); // null | 'patient-login' | 'staff-choice' | 'patient-register' | 'doctor-register' | 'asha-register'
  
  // Registration / Custom Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '9876543210',
    age: '48',
    gender: 'Female',
    village: 'Rampur Khurd',
    // Doctor Registration Fields
    doctorName: '',
    doctorQualification: 'MD (Internal Medicine), AIIMS',
    doctorSpecialization: 'General Medicine & Critical Triage',
    doctorHospital: 'Rampur Primary Health Centre Tele-Hub',
    doctorMci: 'MCI-2024-88492',
    doctorPhone: '9876543210',
    // ASHA Registration Fields
    ashaName: '',
    ashaVillage: 'Rampur Khurd Sub-Centre',
    ashaDistrict: 'Varanasi, Uttar Pradesh',
    ashaId: 'ASHA-UP-5829',
    ashaPhone: '9812345678'
  });

  const handleRegisterNewDoctor = (e) => {
    if (e) e.preventDefault();
    const newDoctor = {
      _id: `doc-${Date.now()}`,
      role: 'doctor',
      name: formData.doctorName ? (formData.doctorName.startsWith('Dr.') ? formData.doctorName : `Dr. ${formData.doctorName}`) : 'Dr. Arvind Mehta (MD, AIIMS)',
      qualification: formData.doctorQualification || 'MD (Medicine)',
      specialization: formData.doctorSpecialization || 'General Medicine & Triage',
      hospitalId: formData.doctorHospital || 'Primary Health Centre Tele-Hub',
      mciNumber: formData.doctorMci || 'MCI-2024-88492',
      phone: formData.doctorPhone || '9876543210',
      avatar: '👨‍⚕️'
    };

    localStorage.setItem('sanjeevani_user', JSON.stringify(newDoctor));
    localStorage.setItem('sanjeevani_role', 'doctor');
    login(newDoctor, 'doctor');
    refreshData();
    if (onLoginSuccess) onLoginSuccess(newDoctor, 'doctor');
    if (onClose) onClose();
  };

  const handleRegisterNewAsha = (e) => {
    if (e) e.preventDefault();
    const newAsha = {
      _id: `asha-${Date.now()}`,
      role: 'asha',
      name: formData.ashaName || 'Pooja Sharma (ASHA Worker)',
      village: formData.ashaVillage || 'Rampur Khurd Sub-Centre',
      district: formData.ashaDistrict || 'Varanasi, Uttar Pradesh',
      ashaId: formData.ashaId || `ASHA-UP-${Math.floor(1000 + Math.random() * 9000)}`,
      phone: formData.ashaPhone || '9812345678',
      avatar: '👩‍⚕️'
    };

    localStorage.setItem('sanjeevani_user', JSON.stringify(newAsha));
    localStorage.setItem('sanjeevani_role', 'asha');
    login(newAsha, 'asha');
    refreshData();
    if (onLoginSuccess) onLoginSuccess(newAsha, 'asha');
    if (onClose) onClose();
  };

  const handlePatientContinue = () => {
    const patientUser = {
      _id: 'pat-seed-001',
      role: 'patient',
      name: 'Rameshwar Prasad',
      phone: '9876543210',
      age: 52,
      gender: 'Male',
      village: 'Rampur Khurd',
      abhaId: '91-4829-1029-4820',
      avatar: '👤'
    };
    login(patientUser, 'patient');
    refreshData();
    if (onLoginSuccess) onLoginSuccess(patientUser, 'patient');
    if (onClose) onClose();
  };

  const handleStaffChoice = (subRole) => {
    if (subRole === 'doctor') {
      const doctorUser = {
        _id: 'doc-1',
        role: 'doctor',
        name: 'Dr. Arvind Mehta (MD, AIIMS)',
        phone: '9876543210',
        hospitalId: 'AIIMS-Rampur-Hub',
        specialization: 'Internal Medicine & Critical Triage',
        avatar: '👨‍⚕️'
      };
      login(doctorUser, 'doctor');
      refreshData();
      if (onLoginSuccess) onLoginSuccess(doctorUser, 'doctor');
      if (onClose) onClose();
    } else if (subRole === 'asha') {
      const ashaUser = {
        _id: 'asha-1',
        role: 'asha',
        name: 'Pooja Sharma (ASHA Worker)',
        phone: '9812345678',
        village: 'Rampur Khurd Sub-Centre',
        ashaId: 'ASHA-UP-4829',
        avatar: '👩‍⚕️'
      };
      login(ashaUser, 'asha');
      refreshData();
      if (onLoginSuccess) onLoginSuccess(ashaUser, 'asha');
      if (onClose) onClose();
    }
  };

  const handleRegisterNewPatient = (e) => {
    if (e) e.preventDefault();
    const newPatient = {
      _id: `pat-${Date.now()}`,
      role: 'patient',
      name: formData.name || 'New Patient',
      phone: formData.phone || '9876500000',
      age: Number(formData.age) || 35,
      gender: formData.gender || 'Female',
      village: formData.village || 'Rampur Khurd',
      abhaId: `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      avatar: '👤'
    };

    LocalStorageService.savePatient(newPatient);
    LocalStorageService.saveConsultation({
      patientId: newPatient._id,
      patientName: newPatient.name,
      patientAge: newPatient.age,
      patientGender: newPatient.gender,
      patientVillage: newPatient.village,
      patientPhone: newPatient.phone,
      patientAbhaId: newPatient.abhaId,
      symptoms: {
        text: 'Patient enrolled in SanjeevaniConnect Telemedicine Network',
        duration: 'Recent onset',
        fever: false,
        cough: false,
        chestPain: false,
        sweating: false,
        breathingDifficulty: false,
        minorAche: false
      },
      priorityTag: 'Routine',
      triageReason: 'Routine tele-consultation enrollment for primary care',
      urgencyScore: 40,
      actionAdvice: 'Patient in queue for PHC Medical Officer assessment.',
      syncStatus: 'synced',
      createdBy: 'Patient-Portal-Self'
    });

    login(newPatient, 'patient');
    refreshData();
    if (onLoginSuccess) onLoginSuccess(newPatient, 'patient');
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#080d1a] text-slate-100 overflow-y-auto selection:bg-cyan-500 selection:text-slate-950 font-sans">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[300px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Navbar */}
      <nav className="relative z-10 w-full px-6 sm:px-10 py-5 flex items-center justify-between border-b border-slate-800/60 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-400 flex items-center justify-center text-slate-950 shadow-lg shadow-cyan-500/20 font-black">
            <Activity className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-lg font-black tracking-tight flex items-center">
            <span className="text-white">Sanjeevani</span>
            <span className="text-cyan-400">Connect</span>
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          {/* Status Dot */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>System Online</span>
          </div>

          {/* Language Selector */}
          <div className="hidden sm:flex items-center bg-slate-900/80 rounded-xl p-1 border border-slate-800">
            <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-300 focus:outline-none pr-1 cursor-pointer"
            >
              {INDIAN_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} className="bg-slate-900 text-white">
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* Close button if modal dismissable */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Close and view portal"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </nav>

      {/* Main Hero & Role Selection Container */}
      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-16 flex flex-col items-center justify-center space-y-12">
        {/* Center Hero Logo & Title */}
        <div className="text-center space-y-4 max-w-2xl mx-auto flex flex-col items-center">
          {/* Center Glowing Icon */}
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center text-slate-950 shadow-2xl shadow-cyan-500/30 mb-2 transform hover:scale-105 transition-all">
            <Activity className="w-11 h-11 stroke-[2.5]" />
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight flex items-center justify-center gap-1">
            <span className="text-white">Sanjeevani</span>
            <span className="text-cyan-400">Connect</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 font-medium leading-relaxed max-w-xl mx-auto">
            Offline-first rural telemedicine & clinical triage network — bridging every village to specialist care.
          </p>

          {/* Metric Stats Badges */}
          <div className="grid grid-cols-3 gap-6 sm:gap-12 pt-4 border-t border-slate-800/80 w-full max-w-lg">
            <div>
              <div className="text-xl sm:text-2xl font-black text-cyan-400">2,400+</div>
              <div className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">Villages Covered</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-white">1.2L+</div>
              <div className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">Lives Impacted</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-cyan-400">340</div>
              <div className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">Doctors Online</div>
            </div>
          </div>
        </div>

        {/* SELECT YOUR ROLE TO CONTINUE Section */}
        <div className="w-full space-y-5">
          <div className="text-center">
            <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500">
              Select Your Role to Continue
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* ================= CARD 1: I'M A PATIENT ================= */}
            <div className="group bg-gradient-to-b from-slate-900/90 to-slate-950/90 hover:from-slate-850 hover:to-slate-900 rounded-3xl border border-slate-800/80 hover:border-cyan-500/50 p-6 sm:p-8 flex flex-col justify-between space-y-6 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10 relative overflow-hidden">
              {/* Card Header Icon & Info */}
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600/30 to-indigo-600/30 border border-blue-500/30 flex items-center justify-center text-orange-400 shadow-inner">
                  <Users className="w-7 h-7 text-amber-400" />
                </div>

                <div>
                  <h3 className="text-2xl font-extrabold text-white group-hover:text-cyan-300 transition-colors">
                    I'm a Patient
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                    View your health records, prescriptions, and consult history. Register for a new visit.
                  </p>
                </div>

                {/* Feature Tags */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-800/80 text-cyan-300 border border-slate-700/60">
                    View Records
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-800/80 text-cyan-300 border border-slate-700/60">
                    Download Rx
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-800/80 text-cyan-300 border border-slate-700/60">
                    Consult History
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={handlePatientContinue}
                  className="w-full py-3.5 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 group-hover:shadow-blue-500/25"
                >
                  <span>Continue as Patient</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveModal('patient-register')}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 border border-slate-800"
                >
                  <UserPlus className="w-3.5 h-3.5 text-cyan-400" />
                  <span>➕ Register New Patient Profile</span>
                </button>
              </div>
            </div>

            {/* ================= CARD 2: I'M HEALTHCARE STAFF ================= */}
            <div className="group bg-gradient-to-b from-slate-900/90 to-slate-950/90 hover:from-slate-850 hover:to-slate-900 rounded-3xl border border-slate-800/80 hover:border-cyan-500/50 p-6 sm:p-8 flex flex-col justify-between space-y-6 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10 relative overflow-hidden">
              {/* Card Header Icon & Info */}
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-600/30 to-cyan-600/30 border border-cyan-500/30 flex items-center justify-center text-pink-400 shadow-inner">
                  <Building2 className="w-7 h-7 text-pink-400" />
                </div>

                <div>
                  <h3 className="text-2xl font-extrabold text-white group-hover:text-cyan-300 transition-colors">
                    I'm Healthcare Staff
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                    ASHA field workers and Doctors — access your clinical portal, queue, and telemedicine tools.
                  </p>
                </div>

                {/* Feature Tags */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-800/80 text-cyan-300 border border-slate-700/60">
                    ASHA Worker
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-800/80 text-cyan-300 border border-slate-700/60">
                    Doctor / CMO
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-800/80 text-cyan-300 border border-slate-700/60">
                    Tele-Medicine
                  </span>
                </div>
              </div>

              {/* Sub-Role Selector for Staff */}
              <div className="pt-2 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleStaffChoice('doctor')}
                    className="py-3 px-3.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-98"
                  >
                    <Stethoscope className="w-4 h-4" />
                    <span>👨‍⚕️ Doctor Portal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStaffChoice('asha')}
                    className="py-3 px-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-98"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>👩‍⚕️ ASHA App</span>
                  </button>
                </div>

                {/* Staff Registration Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setActiveModal('doctor-register')}
                    className="py-2.5 px-3 bg-slate-900 hover:bg-slate-850 text-cyan-400 hover:text-cyan-300 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 border border-cyan-900/60"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>➕ Register Doctor</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveModal('asha-register')}
                    className="py-2.5 px-3 bg-slate-900 hover:bg-slate-850 text-emerald-400 hover:text-emerald-300 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 border border-emerald-900/60"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>➕ Register ASHA</span>
                  </button>
                </div>

                <div className="text-center pt-1">
                  <span className="text-[11px] text-slate-500 font-semibold">
                    1-Click Direct Access or Register New Staff Profile
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL: Register New Patient */}
      {activeModal === 'patient-register' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-700 p-6 shadow-2xl space-y-5 relative text-slate-100">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Register New Patient Profile</h3>
                <p className="text-xs text-slate-400">Creates digital health record & ABHA ID</p>
              </div>
            </div>

            <form onSubmit={handleRegisterNewPatient} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Kavita Devi"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm font-semibold text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="e.g. 48"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Village / Ward</label>
                  <input
                    type="text"
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    placeholder="e.g. Rampur Khurd"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl text-sm shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all"
              >
                <span>Save Patient & Open Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Register New Doctor */}
      {activeModal === 'doctor-register' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 w-full max-w-lg rounded-3xl border border-cyan-800/80 p-6 shadow-2xl space-y-5 relative text-slate-100">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Register Medical Officer / Doctor</h3>
                <p className="text-xs text-slate-400">Join PHC Rural Tele-Hub Network</p>
              </div>
            </div>

            <form onSubmit={handleRegisterNewDoctor} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Doctor Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.doctorName}
                  onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                  placeholder="e.g. Dr. Rajesh Verma"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm font-semibold text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Medical Degree / Qualification</label>
                  <input
                    type="text"
                    value={formData.doctorQualification}
                    onChange={(e) => setFormData({ ...formData, doctorQualification: e.target.value })}
                    placeholder="MD (Medicine), MBBS"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">MCI / NMC Reg. No.</label>
                  <input
                    type="text"
                    value={formData.doctorMci}
                    onChange={(e) => setFormData({ ...formData, doctorMci: e.target.value })}
                    placeholder="MCI-2024-88492"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Specialization Area</label>
                <input
                  type="text"
                  value={formData.doctorSpecialization}
                  onChange={(e) => setFormData({ ...formData, doctorSpecialization: e.target.value })}
                  placeholder="Internal Medicine & Emergency Triage"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Assigned PHC / Hub</label>
                  <input
                    type="text"
                    value={formData.doctorHospital}
                    onChange={(e) => setFormData({ ...formData, doctorHospital: e.target.value })}
                    placeholder="Rampur PHC Tele-Hub"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={formData.doctorPhone}
                    onChange={(e) => setFormData({ ...formData, doctorPhone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-xl text-sm shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all"
              >
                <span>Authorize & Launch Doctor Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Register New ASHA Worker */}
      {activeModal === 'asha-register' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 w-full max-w-lg rounded-3xl border border-emerald-800/80 p-6 shadow-2xl space-y-5 relative text-slate-100">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Register ASHA Field Worker</h3>
                <p className="text-xs text-slate-400">Initialize village offline triage station</p>
              </div>
            </div>

            <form onSubmit={handleRegisterNewAsha} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  ASHA Worker Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.ashaName}
                  onChange={(e) => setFormData({ ...formData, ashaName: e.target.value })}
                  placeholder="e.g. Pooja Sharma"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm font-semibold text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Village / Sub-Centre</label>
                  <input
                    type="text"
                    value={formData.ashaVillage}
                    onChange={(e) => setFormData({ ...formData, ashaVillage: e.target.value })}
                    placeholder="Rampur Khurd Sub-Centre"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">District / State</label>
                  <input
                    type="text"
                    value={formData.ashaDistrict}
                    onChange={(e) => setFormData({ ...formData, ashaDistrict: e.target.value })}
                    placeholder="Varanasi, Uttar Pradesh"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">ASHA ID / Badge Number</label>
                  <input
                    type="text"
                    value={formData.ashaId}
                    onChange={(e) => setFormData({ ...formData, ashaId: e.target.value })}
                    placeholder="ASHA-UP-5829"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.ashaPhone}
                    onChange={(e) => setFormData({ ...formData, ashaPhone: e.target.value })}
                    placeholder="+91 98123 45678"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black rounded-xl text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
              >
                <span>Initialize & Open ASHA Field App</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-xs text-slate-600 border-t border-slate-900">
        <p>🌿 SanjeevaniConnect • Government of India Telemedicine & ASHA Rural Health Initiative</p>
      </footer>
    </div>
  );
};
