import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { voiceAssistant } from '../../services/voiceAssistant.js';
import { INDIAN_LANGUAGES } from '../../i18n/languages.js';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  Flame, 
  Activity, 
  Clock, 
  HeartHandshake,
  RotateCcw
} from 'lucide-react';

export const VoiceSymptomIntake = ({ onSymptomsExtracted, currentSymptoms }) => {
  const { language, t } = useApp();
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [extractedData, setExtractedData] = useState(null);
  const [speechError, setSpeechError] = useState('');
  const [hasSpokenFeedback, setHasSpokenFeedback] = useState(false);

  const langConfig = INDIAN_LANGUAGES.find(l => l.code === language) || INDIAN_LANGUAGES[0];

  // Quick sample patient spoken phrases for demonstration
  const sampleVoicePhrases = {
    hi: [
      { label: 'Chest Pain + Sweating (Critical)', text: 'सीने में बहुत तेज दर्द और भारीपन है, ठंडा पसीना छूट रहा है और सांस फूल रही है।' },
      { label: '4-Day High Fever (Critical)', text: 'चार दिन से लगातार तेज बुखार है और सुखी खांसी आ रही है।' },
      { label: '2-Day Routine Fever', text: 'दो दिन से हल्का बुखार और खांसी है।' },
      { label: 'Mild Body Ache (Self-care)', text: 'सुबह से हल्का बदन दर्द और सिरदर्द है, बुखार बिल्कुल नहीं है।' }
    ],
    en: [
      { label: 'Chest Pain + Sweating (Critical)', text: 'Severe chest pain and heavy pressure, cold sweating and difficulty breathing.' },
      { label: '4-Day High Fever (Critical)', text: 'High fever for four days with severe cough and chills.' },
      { label: '2-Day Routine Fever', text: 'Mild fever for two days with slight cough.' },
      { label: 'Mild Body Ache (Self-care)', text: 'Mild body ache and headache from farm work, no fever.' }
    ],
    ta: [
      { label: 'Chest Pain + Sweating (Critical)', text: 'நெஞ்சில் கடுமையான வலி மற்றும் பாரம், குளிர்ந்த வியர்வை மற்றும் மூச்சுத் திணறல் உள்ளது.' },
      { label: '4-Day High Fever (Critical)', text: 'நான்கு நாட்களாக தொடர்ந்து அதிக காய்ச்சல் மற்றும் வறட்டு இருமல் உள்ளது.' },
      { label: 'Mild Body Ache (Self-care)', text: 'லேசான உடல் வலி மற்றும் தலைவலி, காய்ச்சல் இல்லை.' }
    ],
    te: [
      { label: 'Chest Pain + Sweating (Critical)', text: 'ఛాతీలో తీవ్రమైన నొప్పి, చల్లని చెమటలు మరియు శ్వాస తీసుకోవడంలో ఇబ్బందిగా ఉంది.' },
      { label: '4-Day High Fever (Critical)', text: 'నాలుగు రోజులుగా తీవ్రమైన జ్వరం మరియు దగ్గు వస్తోంది.' },
      { label: 'Mild Body Ache (Self-care)', text: 'తేలికపాటి ఒంటి నొప్పులు, జ్వరం లేదు.' }
    ],
    bn: [
      { label: 'Chest Pain + Sweating (Critical)', text: 'বুকে প্রচণ্ড ব্যথা ও চাপ, প্রচুর ঠান্ডা ঘাম হচ্ছে এবং শ্বাসকষ্ট হচ্ছে।' },
      { label: '4-Day High Fever (Critical)', text: 'চার দিন ধরে তীব্র জ্বর এবং শুকনো কাশি হচ্ছে।' }
    ],
    mr: [
      { label: 'Chest Pain + Sweating (Critical)', text: 'छातीत खूप तीव्र कळ आणि जडपणा आहे, थंड घाम येत आहे आणि श्वास घेण्यास त्रास होतोय.' },
      { label: '4-Day High Fever (Critical)', text: 'चार दिवसांपासून सतत ताप आणि खोकला आहे.' }
    ]
  };

  const currentPhrases = sampleVoicePhrases[language] || sampleVoicePhrases.en;

  const toggleMic = () => {
    if (isListening) {
      voiceAssistant.stopListening();
      setIsListening(false);
    } else {
      setSpeechError('');
      setInterimText('');
      voiceAssistant.startListening(language, {
        onStart: () => setIsListening(true),
        onInterim: (text) => setInterimText(text),
        onResult: (result) => {
          setIsListening(false);
          setFinalTranscript(result.rawTranscript);
          setExtractedData(result.extractedSymptoms);
          
          if (onSymptomsExtracted) {
            onSymptomsExtracted(result.extractedSymptoms, result.rawTranscript);
          }

          // Voice confirmation feedback back to patient
          provideVoiceFeedback(result.extractedSymptoms);
        },
        onError: (err) => {
          setIsListening(false);
          setSpeechError(`Microphone notice: ${err}. You can tap preset sample voice inputs below.`);
        },
        onEnd: () => setIsListening(false)
      });
    }
  };

  const handleSimulateSpeech = (phraseText) => {
    setFinalTranscript(phraseText);
    setInterimText('');
    const extracted = voiceAssistant.extractSymptomsFromText(phraseText, language);
    setExtractedData(extracted);
    if (onSymptomsExtracted) {
      onSymptomsExtracted(extracted, phraseText);
    }
    provideVoiceFeedback(extracted);
  };

  const provideVoiceFeedback = (extracted) => {
    let feedbackText = '';
    if (language === 'hi') {
      const parts = [];
      if (extracted.chestPain) parts.push('सीने में दर्द');
      if (extracted.sweating) parts.push('पसीना');
      if (extracted.breathingDifficulty) parts.push('सांस की तकलीफ');
      if (extracted.fever) parts.push(`${extracted.feverDays || 1} दिन का बुखार`);
      if (extracted.cough) parts.push('खांसी');
      if (extracted.minorAche) parts.push('हल्का बदन दर्द');
      feedbackText = `आपके लक्षण दर्ज हो गए हैं: ${parts.join(', ')}।`;
    } else if (language === 'ta') {
      feedbackText = 'உங்கள் மருத்துவ அறிகுறிகள் வெற்றிகரமாக பதிவு செய்யப்பட்டன.';
    } else if (language === 'te') {
      feedbackText = 'మీ లక్షణాలు విజయవంతంగా నమోదు చేయబడ్డాయి.';
    } else {
      feedbackText = 'Voice symptoms captured and auto-filled into triage form.';
    }

    voiceAssistant.speakText(feedbackText, language);
    setHasSpokenFeedback(true);
  };

  return (
    <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-white dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 rounded-2xl border-2 border-emerald-500/30 dark:border-emerald-500/20 p-4 sm:p-5 shadow-lg relative overflow-hidden">
      {/* Background Decorative Accent */}
      <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{t.voiceIntake}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                {langConfig.name}
              </span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              For illiterate or non-tech patients • Speaks & auto-fills clinical form
            </p>
          </div>
        </div>

        {finalTranscript && (
          <button
            onClick={() => {
              setFinalTranscript('');
              setExtractedData(null);
              setInterimText('');
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-colors"
            title="Reset voice input"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Big Touch-Friendly Mic Control */}
      <div className="my-4 flex flex-col items-center justify-center text-center">
        <button
          onClick={toggleMic}
          id="btn-voice-assistant-mic"
          className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex flex-col items-center justify-center transition-all transform active:scale-95 shadow-xl relative ${
            isListening
              ? 'bg-red-600 text-white ring-8 ring-red-400/40 animate-pulse'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white ring-4 ring-emerald-500/20 hover:ring-emerald-500/40'
          }`}
          title="Tap to speak in Indian language"
        >
          {isListening ? (
            <MicOff className="w-8 h-8 sm:w-10 sm:h-10" />
          ) : (
            <Mic className="w-8 h-8 sm:w-10 sm:h-10" />
          )}
          <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">
            {isListening ? 'Stop' : 'Tap & Speak'}
          </span>
        </button>

        {/* Dynamic Voice Waves Animation when listening */}
        {isListening && (
          <div className="flex items-center gap-1.5 mt-4 h-8">
            <span className="w-1.5 bg-red-500 rounded-full animate-voice-bar-1" />
            <span className="w-1.5 bg-red-500 rounded-full animate-voice-bar-2" />
            <span className="w-1.5 bg-red-600 rounded-full animate-voice-bar-3" />
            <span className="w-1.5 bg-red-500 rounded-full animate-voice-bar-4" />
            <span className="w-1.5 bg-red-500 rounded-full animate-voice-bar-5" />
            <span className="w-1.5 bg-red-600 rounded-full animate-voice-bar-2" />
            <span className="w-1.5 bg-red-500 rounded-full animate-voice-bar-4" />
            <span className="text-xs font-bold text-red-600 dark:text-red-400 ml-2 animate-pulse">
              {t.listening} ({langConfig.name})
            </span>
          </div>
        )}

        {!isListening && !finalTranscript && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-sm">
            {t.speakNow}
          </p>
        )}
      </div>

      {/* Interim Live Speech Transcript */}
      {interimText && (
        <div className="bg-white/80 dark:bg-slate-800/80 rounded-xl p-3 border border-emerald-300 dark:border-emerald-700 text-xs italic text-slate-700 dark:text-slate-300 mb-3 animate-pulse">
          🗣️ "{interimText}..."
        </div>
      )}

      {/* Final Captured Transcript & Spoken Auto-Extractor */}
      {finalTranscript && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-3.5 border border-slate-200 dark:border-slate-700 mb-3 shadow-sm">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
              <CheckCircle className="w-4 h-4" />
              <span>Voice Transcribed ({langConfig.name}):</span>
            </div>
            <button
              onClick={() => voiceAssistant.speakText(finalTranscript, language)}
              className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400"
              title="Replay Voice Prompt"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Listen</span>
            </button>
          </div>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
            "{finalTranscript}"
          </p>

          {/* Extracted Clinical Tags */}
          {extractedData && (
            <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                {t.extractedSymptoms}:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {extractedData.chestPain && (
                  <span className="px-2 py-1 rounded-md text-xs font-bold bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Chest Pain (Red Flag)
                  </span>
                )}
                {extractedData.sweating && (
                  <span className="px-2 py-1 rounded-md text-xs font-bold bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800 flex items-center gap-1">
                    <Flame className="w-3 h-3" /> Sweating (Red Flag)
                  </span>
                )}
                {extractedData.breathingDifficulty && (
                  <span className="px-2 py-1 rounded-md text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                    <Activity className="w-3 h-3" /> Breathing Difficulty
                  </span>
                )}
                {extractedData.fever && (
                  <span className="px-2 py-1 rounded-md text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Fever ({extractedData.feverDays || 1} Days)
                  </span>
                )}
                {extractedData.cough && (
                  <span className="px-2 py-1 rounded-md text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                    Cough / Sore throat
                  </span>
                )}
                {extractedData.minorAche && (
                  <span className="px-2 py-1 rounded-md text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                    <HeartHandshake className="w-3 h-3" /> Minor Ache Only
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preset Voice Phrase Buttons for Fast 1-Click Testing */}
      <div className="mt-3 pt-3 border-t border-emerald-200 dark:border-slate-800">
        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">
          ⚡ Or tap a sample patient phrase ({langConfig.name}):
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {currentPhrases.map((phrase, idx) => (
            <button
              key={idx}
              onClick={() => handleSimulateSpeech(phrase.text)}
              className="text-left text-xs p-2 rounded-lg bg-white/70 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-all hover:border-emerald-400 shadow-2xs"
            >
              <div className="font-semibold text-emerald-700 dark:text-emerald-400">{phrase.label}</div>
              <div className="truncate text-slate-500 dark:text-slate-400 text-[11px]">"{phrase.text}"</div>
            </button>
          ))}
        </div>
      </div>

      {speechError && (
        <div className="mt-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{speechError}</span>
        </div>
      )}
    </div>
  );
};
