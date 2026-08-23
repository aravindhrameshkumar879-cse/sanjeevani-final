import React from 'react';
import { 
  Zap, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Flame, 
  Wind, 
  Heart,
  Thermometer
} from 'lucide-react';

export const DemoScenarios = ({ onLoadScenario }) => {
  const scenarios = [
    {
      id: 'sc-1',
      title: 'Rule 1: Chest Pain + Sweating (>40y)',
      expectedTag: 'Critical',
      patient: {
        name: 'Ramesh Kumar',
        age: 52,
        gender: 'Male',
        phone: '+91 98765 12345',
        village: 'Rampur Khurd',
        abhaId: '91-4829-1029-4820'
      },
      symptoms: {
        text: 'Severe crushing chest pain and profuse cold sweating for 2 hours.',
        voiceTranscript: 'सीने में बहुत तेज दर्द और भारीपन है, पसीना छूट रहा है।',
        chestPain: true,
        sweating: true,
        breathingDifficulty: true,
        fever: false,
        feverDays: 0,
        cough: false,
        minorAche: false,
        vitals: { bp: '150/95', pulse: '104', spo2: '93%', temp: '98.4°F' }
      }
    },
    {
      id: 'sc-2',
      title: 'Rule 2: 4-Day High Fever (>3 days)',
      expectedTag: 'Critical',
      patient: {
        name: 'Sunita Devi',
        age: 34,
        gender: 'Female',
        phone: '+91 98123 45678',
        village: 'Sundarpur',
        abhaId: '91-3091-8841-7712'
      },
      symptoms: {
        text: 'Continuous high fever for 4 days with dry cough and chills.',
        voiceTranscript: 'चार दिन से लगातार तेज बुखार आ रहा है और खांसी भी है।',
        chestPain: false,
        sweating: false,
        breathingDifficulty: false,
        fever: true,
        feverDays: 4,
        cough: true,
        minorAche: false,
        vitals: { bp: '118/76', pulse: '88', spo2: '98%', temp: '102.4°F' }
      }
    },
    {
      id: 'sc-3',
      title: 'Rule 3: 2-Day Fever + Cough (Routine)',
      expectedTag: 'Routine',
      patient: {
        name: 'Amit Patel',
        age: 29,
        gender: 'Male',
        phone: '+91 97654 88123',
        village: 'Kalyanpur',
        abhaId: '91-8812-4401-9923'
      },
      symptoms: {
        text: 'Mild fever for 2 days and dry cough without breathing distress.',
        voiceTranscript: 'दो दिन से हल्का बुखार और खांसी है।',
        chestPain: false,
        sweating: false,
        breathingDifficulty: false,
        fever: true,
        feverDays: 2,
        cough: true,
        minorAche: false,
        vitals: { bp: '122/80', pulse: '78', spo2: '99%', temp: '99.8°F' }
      }
    },
    {
      id: 'sc-4',
      title: 'Rule 4: Minor Body Ache / Mild Cold (Self-Care)',
      expectedTag: 'Self-care',
      patient: {
        name: 'Geeta Bai',
        age: 26,
        gender: 'Female',
        phone: '+91 96543 21098',
        village: 'Bhimtal Ghat',
        abhaId: '91-6623-1190-3344'
      },
      symptoms: {
        text: 'Minor fatigue and mild headache after harvesting, no fever.',
        voiceTranscript: 'सुबह से हल्का बदन दर्द है, बुखार नहीं है।',
        chestPain: false,
        sweating: false,
        breathingDifficulty: false,
        fever: false,
        feverDays: 0,
        cough: false,
        minorAche: true,
        vitals: { bp: '120/80', pulse: '72', spo2: '99%', temp: '98.6°F' }
      }
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm mb-6">
      <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Quick 1-Click Triage Rule Test Scenarios:
          </span>
        </div>
        <span className="text-[11px] text-slate-400">Loads instant patient profile</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {scenarios.map((sc) => (
          <button
            key={sc.id}
            type="button"
            onClick={() => onLoadScenario(sc.patient, sc.symptoms)}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-all hover:border-emerald-500 group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                sc.expectedTag === 'Critical' 
                  ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300' 
                  : sc.expectedTag === 'Routine'
                    ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                    : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
              }`}>
                {sc.expectedTag}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {sc.patient.age}y {sc.patient.gender[0]}
              </span>
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 truncate">
              {sc.patient.name}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {sc.title}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
