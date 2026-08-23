import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Search, 
  Video, 
  FileText, 
  Phone, 
  MapPin, 
  User, 
  Activity, 
  ChevronRight,
  Filter,
  Sparkles,
  Wifi
} from 'lucide-react';

export const LivePriorityQueue = ({ onOpenCase, onStartVideoConsult }) => {
  const { consultations, t } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Filter list
  const filtered = consultations.filter(c => {
    const matchesSearch = 
      (c.patientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.patientVillage || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.triageReason || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPriority = priorityFilter === 'All' || c.priorityTag === priorityFilter;
    const matchesStatus = statusFilter === 'All' || c.consultStatus === statusFilter;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  // Sort priority: Critical first, then Routine, then Self-care, then by newest date
  const priorityWeight = { 'Critical': 3, 'Routine': 2, 'Self-care': 1 };
  const sorted = [...filtered].sort((a, b) => {
    const weightA = priorityWeight[a.priorityTag] || 0;
    const weightB = priorityWeight[b.priorityTag] || 0;
    if (weightB !== weightA) return weightB - weightA;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm">
      {/* Header with Real-Time Socket.io Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              {t.doctorQueueTitle}
            </h2>
            <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>LIVE SYNC</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time incoming field cases from ASHA workers • Prioritized by clinical risk
          </p>
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Showing <span className="font-bold text-slate-900 dark:text-white">{sorted.length}</span> patient cases
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-5">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.searchPlaceholderDoctor || "Search by patient name, village, or symptoms..."}
            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Priority Tabs */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['All', 'Critical', 'Routine', 'Self-care'].map((p) => {
            const label = p === 'All' 
              ? (t.filterAll || 'All Cases') 
              : p === 'Critical' 
                ? (t.filterCritical || 'Critical') 
                : p === 'Routine' 
                  ? (t.filterRoutine || 'Routine') 
                  : (t.filterSelfCare || 'Self-care');

            return (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  priorityFilter === p
                    ? p === 'Critical'
                      ? 'bg-red-600 text-white shadow-sm'
                      : p === 'Routine'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : p === 'Self-care'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Consultations Table / Card List */}
      {sorted.length === 0 ? (
        <div className="p-12 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
          <Activity className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            No consultations found in this queue.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((item) => {
            const isCritical = item.priorityTag === 'Critical';
            const isRoutine = item.priorityTag === 'Routine';
            const isPrescribed = item.consultStatus === 'completed';

            return (
              <div
                key={item._id}
                className={`p-4 sm:p-5 rounded-2xl border-2 transition-all hover:shadow-lg ${
                  isCritical
                    ? 'bg-red-50/70 dark:bg-red-950/40 border-red-400/80 dark:border-red-800 glow-critical'
                    : isRoutine
                      ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800'
                      : 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Column: Priority, Patient details & Triage reason */}
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Priority Tag */}
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-2xs ${
                        isCritical
                          ? 'bg-red-600 text-white animate-pulse'
                          : isRoutine
                            ? 'bg-blue-600 text-white'
                            : 'bg-emerald-600 text-white'
                      }`}>
                        {isCritical && <AlertTriangle className="w-3.5 h-3.5" />}
                        {isRoutine && <Clock className="w-3.5 h-3.5" />}
                        {!isCritical && !isRoutine && <CheckCircle2 className="w-3.5 h-3.5" />}
                        <span>{item.priorityTag}</span>
                      </span>

                      {/* Status */}
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                        isPrescribed
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                      }`}>
                        {isPrescribed ? '✓ Prescribed & Closed' : 'Pending Doctor Review'}
                      </span>

                      {/* Time */}
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Synced: {new Date(item.syncedAt || item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Patient Name & Demographics */}
                    <div className="flex flex-wrap items-baseline gap-2">
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">
                        {item.patientName}
                      </h3>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {item.patientAge} Yrs • {item.patientGender}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">•</span>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {item.patientVillage || 'Rural Center'}
                      </span>
                    </div>

                    {/* Triage Decision Reasoning */}
                    <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-black/10 dark:border-white/10 text-xs">
                      <span className="font-bold text-slate-900 dark:text-white">On-Device Triage Trigger: </span>
                      <span className="text-slate-700 dark:text-slate-300">{item.triageReason}</span>
                    </div>

                    {/* Voice Spoken Note if available */}
                    {item.symptoms?.voiceTranscript && (
                      <div className="text-xs text-emerald-800 dark:text-emerald-300 italic flex items-center gap-1.5">
                        <span>🗣️ Spoken in Vernacular:</span>
                        <span className="truncate max-w-lg">"{item.symptoms.voiceTranscript}"</span>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Vitals Pill & Actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-3 flex-shrink-0">
                    {/* Vitals Summary */}
                    {item.symptoms?.vitals && (
                      <div className="flex items-center gap-2 text-xs font-bold bg-white/90 dark:bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                        <span className="text-slate-500">BP: {item.symptoms.vitals.bp}</span>
                        <span>•</span>
                        <span className="text-slate-500">SpO2: {item.symptoms.vitals.spo2}</span>
                        <span>•</span>
                        <span className="text-slate-500">Pulse: {item.symptoms.vitals.pulse}</span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {/* Video Consult Button */}
                      <button
                        onClick={() => onStartVideoConsult(item)}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                        title="Start WebRTC Video Consult with ASHA worker"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>{t.startVideoBtn || 'Teleconsult'}</span>
                      </button>

                      {/* Review & Prescribe Button */}
                      <button
                        onClick={() => onOpenCase(item)}
                        className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-all active:scale-95 ${
                          isCritical
                            ? 'bg-red-600 hover:bg-red-700 text-white ring-2 ring-red-400/40'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{isPrescribed ? (t.viewDetails || 'View Prescription') : (t.prescribeBtn || 'Review & Prescribe')}</span>
                      </button>
                    </div>
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
