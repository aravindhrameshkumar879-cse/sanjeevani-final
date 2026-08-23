import React, { createContext, useContext, useState, useEffect } from 'react';
import { syncEngine } from '../services/syncEngine.js';
import { LocalStorageService } from '../services/storage.js';
import { TRANSLATIONS } from '../i18n/languages.js';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Active Role: 'asha' (Field Mobile App), 'doctor' (Doctor Dashboard), or 'patient' (Patient Portal)
  const [role, setRole] = useState(() => {
    return localStorage.getItem('sanjeevani_role') || 'doctor';
  });

  // Current Logged In User
  const [currentUser, setCurrentUser] = useState(() => {
    const raw = localStorage.getItem('sanjeevani_user');
    if (raw) {
      try { return JSON.parse(raw); } catch (e) {}
    }
    return {
      _id: 'doc-1',
      role: 'doctor',
      name: 'Dr. Arvind Mehta (MD, AIIMS)',
      phone: '9876543210',
      hospitalId: 'AIIMS-Rampur-Hub'
    };
  });

  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Theme: 'light' or 'dark'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('sanjeevani_theme') || 'light';
  });

  // Language: 'en', 'hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa', 'or'
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('sanjeevani_lang') || 'hi';
  });

  // Sync Engine State
  const [syncStatus, setSyncStatus] = useState(syncEngine.getStatus());

  // Critical Alerts list for Doctor Dashboard
  const [criticalAlerts, setCriticalAlerts] = useState([]);
  const [activeAlertModal, setActiveAlertModal] = useState(null);

  // Active Consultations stored locally
  const [consultations, setConsultations] = useState(() => LocalStorageService.getConsultations());
  const [patients, setPatients] = useState(() => LocalStorageService.getPatients());

  // Persist role & user
  useEffect(() => {
    localStorage.setItem('sanjeevani_role', role);
  }, [role]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('sanjeevani_user', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  // Apply theme class to document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    localStorage.setItem('sanjeevani_theme', theme);
  }, [theme]);

  // Persist language
  useEffect(() => {
    localStorage.setItem('sanjeevani_lang', language);
  }, [language]);

  // Subscribe to SyncEngine changes
  useEffect(() => {
    const unsubscribe = syncEngine.subscribe((status) => {
      setSyncStatus(status);
      setConsultations(LocalStorageService.getConsultations());
      setPatients(LocalStorageService.getPatients());
    });
    return unsubscribe;
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const login = (user, selectedRole) => {
    setCurrentUser(user);
    setRole(selectedRole || user.role || 'doctor');
    setShowLoginModal(false);
  };

  const logout = () => {
    setShowLoginModal(true);
  };

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const refreshData = () => {
    setConsultations(LocalStorageService.getConsultations());
    setPatients(LocalStorageService.getPatients());
  };

  const triggerCriticalAlert = (alertData) => {
    setCriticalAlerts(prev => [alertData, ...prev]);
    setActiveAlertModal(alertData);
    
    // Play alert sound if audio context available
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.warn('Audio alert error:', e);
    }
  };

  return (
    <AppContext.Provider value={{
      role,
      setRole,
      currentUser,
      setCurrentUser,
      showLoginModal,
      setShowLoginModal,
      login,
      logout,
      theme,
      toggleTheme,
      language,
      setLanguage,
      syncStatus,
      t,
      consultations,
      patients,
      refreshData,
      criticalAlerts,
      activeAlertModal,
      setActiveAlertModal,
      triggerCriticalAlert
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
