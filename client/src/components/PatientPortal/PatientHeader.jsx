import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { INDIAN_LANGUAGES } from '../../i18n/languages.js';
import { 
  User, 
  Sun, 
  Moon, 
  Globe, 
  LogOut, 
  ShieldCheck, 
  FileText, 
  HeartHandshake,
  QrCode
} from 'lucide-react';

export const PatientHeader = ({ onLogout }) => {
  const { currentUser, theme, toggleTheme, language, setLanguage, t } = useApp();

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Branding & Patient Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md">
            <User className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                {t.appTitle}
              </h1>
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                PATIENT PORTAL
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Welcome, <span className="font-bold text-slate-800 dark:text-slate-200">{currentUser?.name || 'Rameshwar Prasad'}</span> • Rampur Khurd
            </p>
          </div>
        </div>

        {/* Action Controls: ABHA pill, Language, Theme, Logout */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* ABHA ID Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-mono font-bold shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>ABHA: {currentUser?.abhaId || '91-4829-1029-4820'}</span>
          </div>

          {/* Multi-Language Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
            <Globe className="w-3.5 h-3.5 text-slate-500 ml-1.5 mr-1" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none pr-1 cursor-pointer"
            >
              {INDIAN_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                  {l.name} ({l.englishName})
                </option>
              ))}
            </select>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200 dark:border-slate-700"
            title="Toggle theme"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Logout / Switch Role */}
          <button
            onClick={onLogout}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all border border-slate-200 dark:border-slate-700"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-500" />
            <span>Switch Role</span>
          </button>
        </div>
      </div>
    </header>
  );
};
