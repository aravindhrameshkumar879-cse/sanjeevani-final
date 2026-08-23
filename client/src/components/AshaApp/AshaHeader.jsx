import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { syncEngine } from '../../services/syncEngine.js';
import { INDIAN_LANGUAGES } from '../../i18n/languages.js';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Sun, 
  Moon, 
  Globe, 
  UserCheck, 
  Radio,
  LogOut
} from 'lucide-react';

export const AshaHeader = ({ onLogout }) => {
  const { syncStatus, theme, toggleTheme, language, setLanguage, t, currentUser } = useApp();

  const handleSyncClick = () => {
    syncEngine.syncPendingConsultations();
  };

  const toggleAirplaneMode = () => {
    syncEngine.toggleSimulatedOffline();
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-sm">
      {/* Top Banner for Offline Status - Highly Visible */}
      <div className={`px-4 py-2 text-xs font-semibold flex items-center justify-between transition-colors ${
        !syncStatus.isEffectiveOnline 
          ? 'bg-amber-500 text-slate-950 font-bold' 
          : syncStatus.unsyncedCount > 0 
            ? 'bg-blue-600 text-white'
            : 'bg-emerald-700 text-white'
      }`}>
        <div className="flex items-center gap-2 max-w-2xl truncate">
          {!syncStatus.isEffectiveOnline ? (
            <>
              <WifiOff className="w-4 h-4 animate-pulse flex-shrink-0" />
              <span>{t.offlineBanner}</span>
            </>
          ) : syncStatus.unsyncedCount > 0 ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin flex-shrink-0" />
              <span>{syncStatus.unsyncedCount} case(s) pending sync • {t.syncBanner}</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>All records synced with Primary Health Centre (PHC) Cloud</span>
            </>
          )}
        </div>

        {/* Offline Simulator Switch for Testers / Judges */}
        <button
          onClick={toggleAirplaneMode}
          id="toggle-offline-simulator"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all shadow-sm ${
            syncStatus.isSimulatedOffline
              ? 'bg-red-700 text-white border border-red-300 animate-pulse'
              : 'bg-white/20 hover:bg-white/30 text-current border border-white/40'
          }`}
          title="Toggle Simulated Zero-Internet Airplane Mode for testing"
        >
          {syncStatus.isSimulatedOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
          <span>{syncStatus.isSimulatedOffline ? '🔴 Airplane Mode (Zero Net)' : '🌐 Online'}</span>
        </button>
      </div>

      {/* Main ASHA Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Branding & Field Worker Profile */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                {t.appTitle}
              </h1>
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                ASHA FIELD
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Worker: <span className="font-medium text-slate-700 dark:text-slate-200">{currentUser?.name || 'Pooja Sharma'}</span> • Rampur Sub-Centre
            </p>
          </div>
        </div>

        {/* Action Controls: Sync Badge, Languages, Theme, Manual Sync */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Sync Status Badge Indicator (Clean, no duplicate dots) */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold shadow-sm ${
            syncStatus.overallBadge === 'offline'
              ? 'bg-red-50 dark:bg-red-950/60 border-red-300 dark:border-red-800 text-red-700 dark:text-red-300'
              : syncStatus.overallBadge === 'syncing'
                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300'
                : 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
          }`}>
            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
              syncStatus.overallBadge === 'offline' 
                ? 'bg-red-600 animate-pulse' 
                : syncStatus.overallBadge === 'syncing' 
                  ? 'bg-amber-500 animate-ping' 
                  : 'bg-emerald-500'
            }`} />
            <span>
              {syncStatus.overallBadge === 'offline' && `Offline Queue (${syncStatus.unsyncedCount})`}
              {syncStatus.overallBadge === 'syncing' && `Syncing to Hub...`}
              {syncStatus.overallBadge === 'synced' && `Synced to PHC`}
            </span>
          </div>

          {/* Manual Sync Button Fallback */}
          <button
            onClick={handleSyncClick}
            disabled={!syncStatus.isEffectiveOnline || syncStatus.syncState === 'syncing'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-all ${
              !syncStatus.isEffectiveOnline
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95'
            }`}
            title="Manual sync fallback"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncStatus.syncState === 'syncing' ? 'animate-spin' : ''}`} />
            <span>{t.syncNow}</span>
          </button>

          {/* Multi-Language Selector (11 Indian Languages) */}
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

          {/* Dark / Light Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200 dark:border-slate-700"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
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
