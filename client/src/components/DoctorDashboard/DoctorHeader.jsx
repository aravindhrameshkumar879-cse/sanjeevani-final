import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { INDIAN_LANGUAGES } from '../../i18n/languages.js';
import { 
  Stethoscope, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Sun, 
  Moon, 
  Globe, 
  ShieldCheck, 
  Activity,
  Bell,
  LogOut
} from 'lucide-react';

export const DoctorHeader = ({ onLogout }) => {
  const { consultations, criticalAlerts, theme, toggleTheme, language, setLanguage, t, currentUser } = useApp();

  const criticalCount = consultations.filter(c => c.priorityTag === 'Critical').length;
  const routineCount = consultations.filter(c => c.priorityTag === 'Routine').length;
  const completedCount = consultations.filter(c => c.consultStatus === 'completed').length;

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-sm">
      {/* Top Clinical Header Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Branding & Doctor Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                {t.appTitle}
              </h1>
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                DOCTOR PORTAL
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium text-slate-700 dark:text-slate-200">{currentUser?.name || 'Dr. Arvind Mehta (MD, AIIMS)'}</span> • PHC Tele-Hub
            </p>
          </div>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Critical Counter Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-bold shadow-2xs">
            <AlertTriangle className="w-4 h-4 text-red-600 animate-pulse" />
            <span>{criticalCount} Critical</span>
          </div>

          {/* Routine Counter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold shadow-2xs">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>{routineCount} Routine</span>
          </div>

          {/* Completed Counter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{completedCount} Prescribed</span>
          </div>

          {/* Language Selector */}
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

          {/* Switch Role Button */}
          <button
            onClick={onLogout}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all border border-slate-200 dark:border-slate-700"
            title="Switch User Role / Portal"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-500" />
            <span>Switch Role</span>
          </button>
        </div>
      </div>
    </header>
  );
};
