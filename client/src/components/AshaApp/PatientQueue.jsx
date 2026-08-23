import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { syncEngine } from '../../services/syncEngine.js';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  RefreshCw, 
  Search, 
  User, 
  MapPin, 
  FileText, 
  ArrowUpRight,
  Filter,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export const PatientQueue = ({ onSelectPatient }) => {
  const { consultations, syncStatus, t } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('All');

  // Filter consultations
  const filteredList = consultations.filter(c => {
    const matchesSearch = 
      (c.patientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.patientVillage || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.triageReason || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPriority = filterPriority === 'All' || c.priorityTag === filterPriority;
    return matchesSearch && matchesPriority;
  });

  // Sort priority: Critical -> Routine -> Self-care -> Date
  const priorityWeight = { 'Critical': 3, 'Routine': 2, 'Self-care': 1 };
  const sortedList = [...filteredList].sort((a, b) => {
    const weightA = priorityWeight[a.priorityTag] || 0;
    const weightB = priorityWeight[b.priorityTag] || 0;
    if (weightB !== weightA) return weightB - weightA;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const handleManualSync = () => {
    syncEngine.syncPendingConsultations();
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm">
      {/* Header with Title & Manual Sync */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>{t.patientQueue}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700">
              {sortedList.length} total
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sorted by clinical priority • Sync status verified per case
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const input = document.getElementById('patient-name-input');
              if (input) {
                input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                input.focus();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 border border-emerald-300 dark:border-emerald-800 transition-all shadow-sm"
          >
            <span>➕ New Patient</span>
          </button>

          <button
            onClick={handleManualSync}
            disabled={!syncStatus.isEffectiveOnline || syncStatus.syncState === 'syncing'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
              !syncStatus.isEffectiveOnline
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95'
            }`}
            title="Trigger sync for pending cases"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncStatus.syncState === 'syncing' ? 'animate-spin' : ''}`} />
            <span>{t.syncNow}</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-2.5 mb-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search patient, village or symptom..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['All', 'Critical', 'Routine', 'Self-care'].map((tag) => (
            <button
              key={tag}
              onClick={() => setFilterPriority(tag)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filterPriority === tag
                  ? tag === 'Critical'
                    ? 'bg-red-600 text-white'
                    : tag === 'Routine'
                      ? 'bg-blue-600 text-white'
                      : tag === 'Self-care'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Patient Cards List */}
      {sortedList.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            No consultations match your filter.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedList.map((consult) => {
            const isCritical = consult.priorityTag === 'Critical';
            const isRoutine = consult.priorityTag === 'Routine';
            const isSynced = consult.syncStatus === 'synced';
            const isSyncing = consult.syncStatus === 'queued' || consult.syncStatus === 'syncing';

            return (
              <div
                key={consult._id || consult.localQueueId}
                onClick={() => onSelectPatient(consult)}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md ${
                  isCritical
                    ? 'bg-red-50/60 dark:bg-red-950/40 border-red-400/80 hover:border-red-500'
                    : isRoutine
                      ? 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 hover:border-blue-400'
                      : 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 hover:border-emerald-400'
                }`}
              >
                {/* Top Line: Badges */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  {/* Priority Tag Badge */}
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-2xs ${
                      isCritical
                        ? 'bg-red-600 text-white animate-pulse'
                        : isRoutine
                          ? 'bg-blue-600 text-white'
                          : 'bg-emerald-600 text-white'
                    }`}>
                      {isCritical && <AlertTriangle className="w-3 h-3" />}
                      {isRoutine && <Clock className="w-3 h-3" />}
                      {!isCritical && !isRoutine && <CheckCircle2 className="w-3 h-3" />}
                      <span>{consult.priorityTag}</span>
                    </span>

                    {consult.consultStatus === 'completed' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                        Rx Prescribed
                      </span>
                    )}
                  </div>

                  {/* Sync Status Badge */}
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 border shadow-2xs ${
                    isSynced
                      ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                      : isSyncing
                        ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                        : 'bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300 border-red-300 dark:border-red-800'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      isSynced ? 'bg-emerald-500' : isSyncing ? 'bg-amber-500 animate-ping' : 'bg-red-500'
                    }`} />
                    <span>
                      {isSynced ? '🟢 Synced' : isSyncing ? '🟡 Syncing' : '🔴 Offline-only'}
                    </span>
                  </span>
                </div>

                {/* Patient Info */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{consult.patientName}</span>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        ({consult.patientAge}y, {consult.patientGender})
                      </span>
                    </h4>

                    <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {consult.patientVillage || 'Rural Center'}
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(consult.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Triage Reason */}
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-2 bg-white/80 dark:bg-slate-900/60 p-2 rounded-lg border border-black/5 dark:border-white/5">
                      <span className="font-bold text-slate-900 dark:text-white">Reason:</span> {consult.triageReason}
                    </p>
                  </div>

                  <div className="flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 self-center">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
