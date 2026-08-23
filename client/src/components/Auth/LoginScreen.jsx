import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { LocalStorageService } from '../../services/storage.js';
import { INDIAN_LANGUAGES } from '../../i18n/languages.js';
import { 
  Stethoscope, 
  UserCheck, 
  User, 
  Lock, 
  Phone, 
  Hash, 
  ArrowRight, 
  ShieldCheck, 
  Radio, 
  Globe, 
  Sparkles,
  CheckCircle2,
  HeartHandshake,
  KeyRound,
  Building2,
  UserPlus,
  X,
  MapPin
} from 'lucide-react';

export const LoginScreen = ({ onLoginSuccess, onClose }) => {
  const { language, setLanguage, t, login, refreshData } = useApp();
  const [activeMode, setActiveMode] = useState('signin'); // 'signin' | 'register'
  const [selectedRole, setSelectedRole] = useState('doctor'); // 'doctor' | 'asha' | 'patient'
  
  // Sign In Form State
  const [identifier, setIdentifier] = useState('9876543210');
  const [password, setPassword] = useState('1234');
  
  // Registration Form State for New Doctor / Patient / ASHA
  const [registerData, setRegisterData] = useState({
    name: '',
    phone: '',
    age: '45',
    gender: 'Male',
    village: 'Rampur Khurd',
    specialization: 'Cardiology & General Medicine',
    hospitalId: 'AIIMS Rural Tele-Hub',
    regNumber: 'MCI-2024-98421',
    ashaId: 'ASHA-UP-4829'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Preset demo accounts for quick 1-click access
  const demoAccounts = [
    {
      role: 'doctor',
      title: 'Doctor / Medical Officer',
      name: 'Dr. Arvind Mehta (MD, AIIMS)',
      phone: '9876543210',
      pass: '1234',
      badge: 'PHC Tele-Hub Doctor',
      color: 'blue',
      icon: Stethoscope,
      description: 'Access live priority triage queue, review incoming cases, conduct WebRTC video/audio consults & issue e-Prescriptions.'
    },
    {
      role: 'asha',
      title: 'ASHA Field Worker',
      name: 'Pooja Sharma (Worker #4829)',
      phone: '9812345678',
      pass: '1234',
      badge: 'Rampur Sub-Centre',
      color: 'emerald',
      icon: UserCheck,
      description: 'Offline-first patient demographic registration, multilingual voice intake & deterministic ICMR triage decision table.'
    },
    {
      role: 'patient',
      title: 'Patient / Citizen Portal',
      name: 'Rameshwar Prasad (Age 52)',
      phone: '9876543210',
      pass: '1234',
      badge: 'ABHA: 91-4829-1029-4820',
      color: 'purple',
      icon: User,
      description: 'View clinical diagnosis status, download official e-Prescription PDF, listen to medicine voice instructions in your language.'
    }
  ];

  const handleRoleSelect = (roleKey) => {
    setSelectedRole(roleKey);
    setErrorMessage('');
    const acc = demoAccounts.find(a => a.role === roleKey);
    if (acc) {
      setIdentifier(acc.phone);
      setPassword(acc.pass);
    }
  };

  const handleSignIn = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: selectedRole,
          identifier,
          password
        })
      });

      if (res.ok) {
        const data = await res.json();
        login(data.user, selectedRole);
        refreshData();
        if (onLoginSuccess) onLoginSuccess(data.user, selectedRole);
        if (onClose) onClose();
      } else {
        fallbackLocalLogin();
      }
    } catch (err) {
      console.warn('Backend login fallback to local session:', err);
      fallbackLocalLogin();
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    if (e) e.preventDefault();
    if (!registerData.name || registerData.name.trim().length === 0) {
      setErrorMessage('Please enter full name');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    const formattedName = selectedRole === 'doctor' && !registerData.name.startsWith('Dr.') 
      ? `Dr. ${registerData.name.trim()}` 
      : registerData.name.trim();

    const payload = {
      role: selectedRole,
      ...registerData,
      name: formattedName
    };

    let userToLogin = null;

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        userToLogin = data.user;
      }
    } catch (err) {
      console.warn('Backend register API deferred to local engine:', err);
    }

    if (!userToLogin) {
      userToLogin = {
        _id: `${selectedRole}-${Date.now()}`,
        role: selectedRole,
        name: formattedName,
        phone: registerData.phone || '9876543210',
        age: Number(registerData.age) || 35,
        gender: registerData.gender || 'Male',
        village: registerData.village || 'Rampur Khurd',
        specialization: registerData.specialization || 'General Medicine',
        hospitalId: registerData.hospitalId || 'AIIMS Rural Tele-Hub',
        abhaId: `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
        avatar: selectedRole === 'doctor' ? '👨‍⚕️' : selectedRole === 'asha' ? '👩‍⚕️' : '👤',
        createdAt: new Date().toISOString()
      };
    }

    // Persist new Patient in Local Storage & create initial record
    if (selectedRole === 'patient') {
      LocalStorageService.savePatient({
        _id: userToLogin._id,
        name: userToLogin.name,
        age: userToLogin.age,
        gender: userToLogin.gender,
        village: userToLogin.village,
        phone: userToLogin.phone,
        abhaId: userToLogin.abhaId,
        createdBy: 'Patient-Portal-Self'
      });

      LocalStorageService.saveConsultation({
        patientId: userToLogin._id,
        patientName: userToLogin.name,
        patientAge: userToLogin.age,
        patientGender: userToLogin.gender,
        patientVillage: userToLogin.village,
        patientPhone: userToLogin.phone,
        patientAbhaId: userToLogin.abhaId,
        symptoms: {
          text: 'Patient profile registered in SanjeevaniConnect Telemedicine Network',
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
        createdBy: 'Patient-Registration'
      });
    }

    setSuccessMessage(`✓ Registered successfully as ${userToLogin.name}!`);
    login(userToLogin, selectedRole);
    refreshData();

    setTimeout(() => {
      setIsLoading(false);
      if (onLoginSuccess) onLoginSuccess(userToLogin, selectedRole);
      if (onClose) onClose();
    }, 500);
  };

  const fallbackLocalLogin = () => {
    const acc = demoAccounts.find(a => a.role === selectedRole) || demoAccounts[0];
    const userObj = {
      _id: `${selectedRole}-user-1`,
      role: selectedRole,
      name: acc.name,
      phone: identifier,
      village: 'Rampur Khurd',
      abhaId: '91-4829-1029-4820'
    };
    login(userObj, selectedRole);
    refreshData();
    if (onLoginSuccess) onLoginSuccess(userObj, selectedRole);
    if (onClose) onClose();
  };

  const currentAccount = demoAccounts.find(a => a.role === selectedRole) || demoAccounts[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto animate-fade-in relative">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white p-5 sm:p-6 border-b border-slate-800 relative">
          {/* Close Button */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Close and continue to App"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pr-8">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500 flex items-center justify-center text-slate-950 shadow-md font-black text-lg">
                SC
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <span>SANJEEVANI CONNECT</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Telemedicine Portal
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  {activeMode === 'signin' ? 'Sign in to access your portal' : 'Register a new Doctor, Patient, or ASHA Worker'}
                </p>
              </div>
            </div>
          </div>

          {/* Mode Switcher: Sign In vs Register New */}
          <div className="flex items-center gap-2 mt-4 bg-slate-800/90 p-1 rounded-xl border border-slate-700 w-fit">
            <button
              type="button"
              onClick={() => { setActiveMode('signin'); setErrorMessage(''); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeMode === 'signin'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🔑 Sign In
            </button>

            <button
              type="button"
              onClick={() => { setActiveMode('register'); setErrorMessage(''); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                activeMode === 'register'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>➕ Register New {selectedRole === 'doctor' ? 'Doctor' : selectedRole === 'patient' ? 'Patient' : 'ASHA'}</span>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* 3-Role Selection Tabs */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
              Select Role:
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {demoAccounts.map((acc) => {
                const IconComponent = acc.icon;
                const isSelected = selectedRole === acc.role;

                return (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleRoleSelect(acc.role)}
                    className={`p-3.5 rounded-2xl border-2 text-center transition-all flex flex-col items-center gap-2 touch-target ${
                      isSelected
                        ? acc.role === 'doctor'
                          ? 'bg-blue-50 dark:bg-blue-950/70 border-blue-600 text-blue-900 dark:text-blue-100 shadow-md ring-2 ring-blue-500/20'
                          : acc.role === 'asha'
                            ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-600 text-emerald-900 dark:text-emerald-100 shadow-md ring-2 ring-emerald-500/20'
                            : 'bg-purple-50 dark:bg-purple-950/70 border-purple-600 text-purple-900 dark:text-purple-100 shadow-md ring-2 ring-purple-500/20'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl text-white ${
                      acc.role === 'doctor' ? 'bg-blue-600' : acc.role === 'asha' ? 'bg-emerald-600' : 'bg-purple-600'
                    }`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                        {acc.title}
                      </div>
                      <span className="text-[10px] opacity-75 font-semibold block mt-0.5">
                        {acc.role === 'doctor' ? 'PHC Doctor' : acc.role === 'asha' ? 'Field Worker' : 'Patient / Family'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* MODE 1: SIGN IN */}
          {activeMode === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {selectedRole === 'patient' ? 'Mobile Number / ABHA ID' : 'Mobile Number / Staff ID'}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. 9876543210"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {selectedRole === 'asha' ? 'Security PIN' : 'Password / OTP'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {errorMessage && (
                <p className="text-xs font-bold text-red-600 dark:text-red-400 text-center">
                  {errorMessage}
                </p>
              )}

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  id="btn-login-submit"
                  className={`w-full py-3.5 px-5 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98 ${
                    selectedRole === 'doctor'
                      ? 'bg-blue-600 hover:bg-blue-700 ring-4 ring-blue-500/20'
                      : selectedRole === 'asha'
                        ? 'bg-emerald-600 hover:bg-emerald-700 ring-4 ring-emerald-500/20'
                        : 'bg-purple-600 hover:bg-purple-700 ring-4 ring-purple-500/20'
                  }`}
                >
                  {isLoading ? (
                    <span>Entering Portal...</span>
                  ) : (
                    <>
                      <span>Enter {currentAccount.title}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* 1-Click Fast Access */}
                <button
                  type="button"
                  onClick={() => handleSignIn()}
                  className="w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5 text-emerald-500" />
                  <span>1-Click Fast Login as {currentAccount.name}</span>
                </button>
              </div>
            </form>
          ) : (
            /* MODE 2: REGISTER NEW DOCTOR / PATIENT / ASHA */
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <UserPlus className="w-4 h-4 flex-shrink-0" />
                <span>
                  Registering a new <strong className="uppercase">{selectedRole}</strong> profile in SanjeevaniConnect
                </span>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                  placeholder={selectedRole === 'doctor' ? 'e.g. Dr. Rajesh Sharma' : 'e.g. Priya Sharma'}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Doctor Specific Fields */}
              {selectedRole === 'doctor' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Medical Specialization
                    </label>
                    <input
                      type="text"
                      value={registerData.specialization}
                      onChange={(e) => setRegisterData({ ...registerData, specialization: e.target.value })}
                      placeholder="e.g. Cardiology / General Medicine"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Hospital / PHC Center
                    </label>
                    <input
                      type="text"
                      value={registerData.hospitalId}
                      onChange={(e) => setRegisterData({ ...registerData, hospitalId: e.target.value })}
                      placeholder="e.g. Rampur Primary Health Centre"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {/* Patient Specific Fields */}
              {selectedRole === 'patient' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Age
                    </label>
                    <input
                      type="number"
                      value={registerData.age}
                      onChange={(e) => setRegisterData({ ...registerData, age: e.target.value })}
                      placeholder="e.g. 45"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Gender
                    </label>
                    <select
                      value={registerData.gender}
                      onChange={(e) => setRegisterData({ ...registerData, gender: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Village / City
                    </label>
                    <input
                      type="text"
                      value={registerData.village}
                      onChange={(e) => setRegisterData({ ...registerData, village: e.target.value })}
                      placeholder="e.g. Rampur Khurd"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={registerData.phone}
                    onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {errorMessage && (
                <p className="text-xs font-bold text-red-600 dark:text-red-400 text-center">
                  {errorMessage}
                </p>
              )}

              {successMessage && (
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 text-center">
                  {successMessage}
                </p>
              )}

              {/* Submit Registration */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3.5 px-5 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98 ${
                    selectedRole === 'doctor'
                      ? 'bg-blue-600 hover:bg-blue-700 ring-4 ring-blue-500/20'
                      : selectedRole === 'asha'
                        ? 'bg-emerald-600 hover:bg-emerald-700 ring-4 ring-emerald-500/20'
                        : 'bg-purple-600 hover:bg-purple-700 ring-4 ring-purple-500/20'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create {selectedRole === 'doctor' ? 'Doctor' : selectedRole === 'patient' ? 'Patient' : 'ASHA'} Account & Enter</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
