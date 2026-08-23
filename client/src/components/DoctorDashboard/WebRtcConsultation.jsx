import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Wifi, 
  Signal, 
  Activity, 
  User, 
  AlertTriangle, 
  FileText,
  Volume2,
  VolumeX,
  Radio
} from 'lucide-react';

export const WebRtcConsultation = ({ consultation, onClose, onOpenPrescription }) => {
  const [isAudioOnly, setIsAudioOnly] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [connectionQuality, setConnectionQuality] = useState('Poor (Rural 2G/3G)');

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Timer for active call
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleAudioOnly = () => {
    setIsAudioOnly(prev => !prev);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-900 w-full max-w-5xl rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col h-[90vh]">
        {/* Call Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base">
                  Live Tele-Consult: {consultation.patientName} ({consultation.patientAge}y, {consultation.patientVillage})
                </h3>
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  consultation.priorityTag === 'Critical' ? 'bg-red-600' : 'bg-blue-600'
                }`}>
                  {consultation.priorityTag}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Connected with ASHA Field Worker (Pooja Sharma) • Duration: <span className="font-mono text-emerald-400">{formatDuration(callDuration)}</span>
              </p>
            </div>
          </div>

          {/* Bandwidth / Audio-only toggle banner */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleAudioOnly}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                isAudioOnly 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
              title="Toggle Audio-Only mode for poor rural bandwidth"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>{isAudioOnly ? 'Audio-Only Mode (Active)' : 'Low-Bandwidth Mode'}</span>
            </button>
          </div>
        </div>

        {/* Video Canvas & Consult Stage */}
        <div className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-hidden">
          {/* Main Video Screen (Patient/ASHA Feed) */}
          <div className="lg:col-span-2 relative bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center justify-center overflow-hidden shadow-inner">
            {isAudioOnly ? (
              /* Audio-Only Visualizer Mode */
              <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="w-24 h-24 rounded-full bg-emerald-600/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 relative">
                  <User className="w-12 h-12" />
                  <span className="absolute inset-0 rounded-full border border-emerald-400 animate-ping opacity-30" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">{consultation.patientName}</h4>
                  <p className="text-xs text-slate-400">Audio Teleconsultation Active • Optimized for 2G Village Signal</p>
                </div>
                {/* Simulated Audio Waves */}
                <div className="flex items-center gap-1 h-8">
                  <span className="w-1 bg-emerald-500 rounded-full animate-voice-bar-1" />
                  <span className="w-1 bg-emerald-500 rounded-full animate-voice-bar-2" />
                  <span className="w-1 bg-emerald-400 rounded-full animate-voice-bar-3" />
                  <span className="w-1 bg-emerald-500 rounded-full animate-voice-bar-4" />
                  <span className="w-1 bg-emerald-500 rounded-full animate-voice-bar-5" />
                  <span className="w-1 bg-emerald-400 rounded-full animate-voice-bar-2" />
                  <span className="w-1 bg-emerald-500 rounded-full animate-voice-bar-3" />
                </div>
              </div>
            ) : (
              /* Simulated HD Video Stream */
              <div className="w-full h-full relative flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-28 h-28 rounded-full bg-slate-800 border-4 border-slate-700 flex items-center justify-center text-slate-400">
                    <User className="w-14 h-14" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white">{consultation.patientName} (Field Feed)</span>
                    <p className="text-xs text-slate-400">ASHA Phone Camera Active</p>
                  </div>
                </div>

                {/* Picture-in-Picture Local Doctor Stream */}
                <div className="absolute bottom-4 right-4 w-32 h-24 bg-slate-800 rounded-xl border-2 border-slate-600 flex flex-col items-center justify-center shadow-lg overflow-hidden">
                  <span className="text-[10px] font-bold text-slate-300">Dr. Arvind Mehta</span>
                  <span className="text-[9px] text-emerald-400 font-semibold">Your Camera (HD)</span>
                </div>
              </div>
            )}

            {/* Quality Pill */}
            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-300 flex items-center gap-1.5 border border-white/10">
              <Signal className="w-3 h-3 text-amber-400" />
              <span>{connectionQuality}</span>
            </div>
          </div>

          {/* Right Sidebar: Clinical Summary & Real-Time Prescription Trigger */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 flex flex-col justify-between overflow-y-auto space-y-3 text-xs text-slate-300">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                  Clinical Case Summary
                </span>
                <span className="font-mono text-emerald-400">{consultation.patientAbhaId}</span>
              </div>

              {/* Triage & Red Flags */}
              <div className={`p-2.5 rounded-xl border ${
                consultation.priorityTag === 'Critical' 
                  ? 'bg-red-950/60 border-red-800 text-red-200' 
                  : 'bg-blue-950/60 border-blue-800 text-blue-200'
              }`}>
                <div className="font-bold mb-0.5">Triage: {consultation.priorityTag}</div>
                <div className="text-[11px] opacity-90">{consultation.triageReason}</div>
              </div>

              {/* Symptoms Checklist */}
              <div className="space-y-1 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Symptoms Reported:</span>
                <div className="text-slate-200">
                  {consultation.symptoms?.chestPain && '• Chest Pain / Pressure (Red flag)'}<br/>
                  {consultation.symptoms?.sweating && '• Profuse Sweating'}<br/>
                  {consultation.symptoms?.breathingDifficulty && '• Breathing Difficulty'}<br/>
                  {consultation.symptoms?.fever && `• Fever (${consultation.symptoms.feverDays} Days)`}<br/>
                  {consultation.symptoms?.cough && '• Cough'}
                </div>
              </div>

              {/* Vitals */}
              {consultation.symptoms?.vitals && (
                <div className="grid grid-cols-2 gap-2 text-center text-[11px]">
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[9px]">BP</span>
                    <span className="font-bold text-white">{consultation.symptoms.vitals.bp}</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[9px]">SpO2</span>
                    <span className="font-bold text-emerald-400">{consultation.symptoms.vitals.spo2}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Action inside Call */}
            <div className="pt-3 border-t border-slate-800">
              <button
                onClick={() => {
                  onClose();
                  onOpenPrescription(consultation);
                }}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-md transition-all"
              >
                <FileText className="w-4 h-4" />
                <span>Open e-Prescription</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Call Control Bar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-center gap-4">
          <button
            onClick={() => setIsMuted(prev => !prev)}
            className={`p-3.5 rounded-full text-white transition-all ${
              isMuted ? 'bg-red-600' : 'bg-slate-800 hover:bg-slate-700'
            }`}
            title="Mute / Unmute"
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setIsVideoOff(prev => !prev)}
            className={`p-3.5 rounded-full text-white transition-all ${
              isVideoOff ? 'bg-red-600' : 'bg-slate-800 hover:bg-slate-700'
            }`}
            title="Camera On / Off"
          >
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>

          <button
            onClick={onClose}
            className="px-6 py-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-2 shadow-lg transition-all"
          >
            <PhoneOff className="w-5 h-5" />
            <span>End Call</span>
          </button>
        </div>
      </div>
    </div>
  );
};
