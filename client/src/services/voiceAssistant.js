/**
 * SanjeevaniConnect Multilingual Voice Assistant & Clinical NLP Engine
 * 
 * Enables illiterate/rural patients to speak their medical complaints in
 * 11 Indian languages. Automatically transcribes speech and extracts structured
 * clinical symptoms, fever duration, and red flags.
 */

import { INDIAN_LANGUAGES } from '../i18n/languages.js';

class VoiceAssistantService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.initSpeechRecognition();
  }

  initSpeechRecognition() {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;
    } else {
      console.warn('Web Speech API is not supported in this browser environment');
    }
  }

  isSupported() {
    return Boolean(this.recognition);
  }

  /**
   * Start listening to patient in their chosen language
   * @param {string} langCode - 'hi', 'ta', 'te', 'en', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa', 'or'
   * @param {object} callbacks - { onStart, onResult, onInterim, onError, onEnd }
   */
  startListening(langCode = 'hi', callbacks = {}) {
    if (!this.recognition) {
      this.initSpeechRecognition();
    }

    if (!this.recognition) {
      if (callbacks.onError) callbacks.onError('Speech recognition not supported in this browser. Please use manual selection.');
      return;
    }

    const langConfig = INDIAN_LANGUAGES.find(l => l.code === langCode) || INDIAN_LANGUAGES[0];
    this.recognition.lang = langConfig.speechCode;

    this.recognition.onstart = () => {
      this.isListening = true;
      if (callbacks.onStart) callbacks.onStart();
    };

    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (interimTranscript && callbacks.onInterim) {
        callbacks.onInterim(interimTranscript);
      }

      if (finalTranscript) {
        // Run NLP entity extraction on transcribed text
        const extracted = this.extractSymptomsFromText(finalTranscript, langCode);
        if (callbacks.onResult) {
          callbacks.onResult({
            rawTranscript: finalTranscript,
            extractedSymptoms: extracted
          });
        }
      }
    };

    this.recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      this.isListening = false;
      if (callbacks.onError) callbacks.onError(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (callbacks.onEnd) callbacks.onEnd();
    };

    try {
      this.recognition.start();
    } catch (e) {
      console.warn('Recognition start failed:', e);
      if (callbacks.onError) callbacks.onError(e.message);
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // Ignore
      }
    }
    this.isListening = false;
  }

  /**
   * Multilingual NLP Rule Extractor
   * Maps vernacular keywords to clinical symptom flags and fever duration.
   */
  extractSymptomsFromText(text, langCode = 'hi') {
    const lower = text.toLowerCase();
    
    // 1. Chest Pain Keywords
    const chestPainPatterns = [
      'chest pain', 'chest heaviness', 'chest tight', 'heart pain', 'angina', 'pressure in chest',
      'सीने में दर्द', 'छाती में दर्द', 'सीना भारी', 'छाती भारी', 'दिल में दर्द',
      'நெஞ்சு வலி', 'நெஞ்சில் வலி', 'மார்பு வலி', 'நெஞ்சு பாரம்',
      'ఛాతీ నొప్పి', 'గుండె నొప్పి', 'ఛాతీలో బరువు',
      'বুকে ব্যথা', 'বুকের ব্যথা', 'বুকে চাপ',
      'छातीत दुखणे', 'छातीत कळ', 'छाती जड',
      'છાતીમાં દુખાવો', 'છાતીમાં ભાર',
      'ಎದೆ ನೋವು', 'ಎದೆಯಲ್ಲಿ ನೋವು', 'ಎದೆ ಬಿಗಿತ',
      'നെഞ്ചുവേദന', 'നെഞ്ചിൽ വേദന', 'നെഞ്ചിടിപ്പ്',
      'ਛਾਤੀ ਦਰਦ', 'ਛਾਤੀ ਵਿੱਚ ਦਰਦ', 'ਛਾਤੀ ਭਾਰੀ',
      'ଛାତି ଯନ୍ତ୍ରଣା', 'ଛାତି ବିନ୍ଧା'
    ];

    // 2. Sweating Keywords
    const sweatingPatterns = [
      'sweating', 'sweat', 'cold sweat', 'perspiration', 'perspiring',
      'पसीना', 'पसीने', 'ठंडा पसीना', 'बहुत पसीना',
      'வியர்வை', 'குளிர்ந்த வியர்வை', 'வியர்க்கிறது',
      'చెమట', 'చల్లని చెమట', 'చెమటలు',
      'ঘাম', 'ঠান্ডা ঘাম', 'প্রচুর ঘাম',
      'घाम', 'थंड घाम', 'खूप घाम',
      'પરસેવો', 'પરસેવો વળે છે',
      'ಬೆವರು', 'ತಣ್ಣನೆಯ ಬೆವರು',
      'വിയർപ്പ്', 'തണുത്ത വിയർപ്പ്',
      'ਮੁੜ੍ਹਕਾ', 'ਪਸੀਨਾ',
      'ଝାଳ', 'ଥଣ୍ଡା ଝାଳ'
    ];

    // 3. Breathing Difficulty Keywords
    const breathingPatterns = [
      'breathing difficulty', 'difficulty breathing', 'shortness of breath', 'breathless', 'dyspnea', 'choking',
      'सांस लेने में दिक्कत', 'सांस फूलना', 'दम घुटना', 'सांस नहीं आ रही', 'सांस की तकलीफ',
      'மூச்சுத் திணறல்', 'மூச்சு வாங்குகிறது', 'மூச்சு விட சிரமம்',
      'శ్వాస ఆడటం లేదు', 'శ్వాస తీసుకోవడంలో ఇబ్బంది', 'ఆయాసం',
      'শ্বাসকষ্ট', 'শ্বাস নিতে কষ্ট', 'দম বন্ধ',
      'श्वास घेण्यास त्रास', 'दम लागणे', 'श्वास कोंडणे',
      'શ્વાસ લેવામાં તકલીફ', 'શ્વાસ ચડવો', 'દમ',
      'ಉಸಿರಾಟದ ತೊಂದರೆ', 'ಉಸಿರು ಕಟ್ಟುವಿಕೆ', 'ಉಬ್ಬಸ',
      'ശ്വാസതടസ്സം', 'ശ്വാസമെടുക്കാൻ പ്രയാസം',
      'ਸਾਹ ਲੈਣ ਵਿੱਚ ਤਕਲੀਫ਼', 'ਸਾਹ ਚੜ੍ਹਨਾ', 'ਦਮ ਘੁੱਟਣਾ',
      'ଶ୍ୱାସକଷ୍ଟ', 'ନିଶ୍ୱାସ ନେବାରେ ଅସୁବିଧା'
    ];

    // 4. Fever Keywords
    const feverPatterns = [
      'fever', 'high temp', 'hot body', 'temperature', 'chills',
      'बुखार', 'तेज बुखार', 'तप रहा है', 'गरम बदन',
      'காய்ச்சல்', 'சுரம்', 'அனல் பறக்கிறது',
      'జ్వరం', 'తీవ్రమైన జ్వరం', 'ఒళ్ళు కాలుతోంది',
      'জ্বর', 'গা গরম', 'তীব্র জ্বর',
      'ताप', 'अंग तापणे', 'खूप ताप',
      'તાવ', 'ધગધગે છે',
      'ಜ್ವರ', 'ಮೈ ಬಿಸಿ',
      'പനി', 'ശരീരം ചൂട്',
      'ਬੁਖਾਰ', 'ਤੇਜ਼ ਬੁਖਾਰ',
      'ଜ୍ୱର', 'ଦେହ ତାତିବା'
    ];

    // 5. Cough Keywords
    const coughPatterns = [
      'cough', 'coughing', 'sore throat', 'dry cough', 'wet cough',
      'खांसी', 'सुखी खांसी', 'खराश', 'गले में दर्द',
      'இருமல்', 'தொண்டை வலி', 'வறட்டு இருமல்',
      'దగ్గు', 'పొడి దగ్గు', 'గొంతు నొప్పి',
      'কাশি', 'শুকনো কাশি', 'গলা ব্যথা',
      'खोकला', 'घसा दुखणे', 'सुका खोकला',
      'ખાંસી', 'ગળામાં દુખાવો', 'સૂકી ખાંસી',
      'ಕೆಮ್ಮು', 'ಗಂಟಲು ನೋವು',
      'ചുമ', 'തൊണ്ടവേദന',
      'ਖੰਘ', 'ਗਲਾ ਖ਼ਰਾਬ',
      'କାଶ', 'ଗଳା ଯନ୍ତ୍ରଣା'
    ];

    // 6. Minor Ache Keywords
    const minorAchePatterns = [
      'body ache', 'muscle pain', 'headache', 'minor ache', 'mild pain', 'cold only', 'sneezing',
      'हल्का दर्द', 'बदन दर्द', 'सिरदर्द', 'सिर में दर्द', 'माथा दर्द', 'हल्की ठंड', 'जुकाम',
      'உடல் வலி', 'தலைவலி', 'லேசான வலி', 'சளி',
      'ఒంటి నొప్పులు', 'తల నొప్పి', 'తేలికపాటి నొప్పి', 'జలుబు',
      'গা ব্যথা', 'মাথা ব্যথা', 'সামান্য ব্যথা', 'সর্দি',
      'अंगदुखी', 'डोकेदुखी', 'हलके दुखणे', 'सर्दी',
      'શરીરનો દુખાવો', 'માથાનો દુખાવો', 'શરદી',
      'ಮೈಕೈ ನೋವು', 'ತಲೆನೋವು', 'ನೆಗಡಿ',
      'ശരീരവേദന', 'തലവേദന', 'ജലദോഷം',
      'ਸਰੀਰ ਦਰਦ', 'ਸਿਰ ਦਰਦ', 'ਜ਼ੁਕਾਮ',
      'ଦେହହାତ ବିନ୍ଧା', 'ମୁଣ୍ଡ ବିନ୍ଧା', 'ଥଣ୍ଡା'
    ];

    // Check matches
    const hasChestPain = chestPainPatterns.some(p => lower.includes(p));
    const hasSweating = sweatingPatterns.some(p => lower.includes(p));
    const hasBreathingDifficulty = breathingPatterns.some(p => lower.includes(p));
    const hasFever = feverPatterns.some(p => lower.includes(p));
    const hasCough = coughPatterns.some(p => lower.includes(p));
    const hasMinorAche = minorAchePatterns.some(p => lower.includes(p));

    // Extract fever duration in days
    let feverDays = 0;
    if (hasFever) {
      // Look for numbers before "day", "दिन", "நாட்கள்", "రోజులు", "দিন", "दिवस", etc.
      const daysMatch = lower.match(/(\d+)\s*(day|days|दिन|روز|நாட்கள்|రోజులు|দিন|दिवस|દિ|ದಿನ|ദിവസം|ਦਿਨ|ଦିନ)/i);
      if (daysMatch) {
        feverDays = parseInt(daysMatch[1], 10);
      } else if (lower.includes('चार दिन') || lower.includes('4 days') || lower.includes('four days') || lower.includes('४ दिवस') || lower.includes('4 நாட்கள்')) {
        feverDays = 4;
      } else if (lower.includes('तीन दिन') || lower.includes('3 days') || lower.includes('three days') || lower.includes('३ दिवस') || lower.includes('3 நாட்கள்')) {
        feverDays = 3;
      } else if (lower.includes('दो दिन') || lower.includes('2 days') || lower.includes('two days') || lower.includes('२ दिवस') || lower.includes('2 நாட்கள்')) {
        feverDays = 2;
      } else if (lower.includes('हफ्ता') || lower.includes('week') || lower.includes('ವಾರ') || lower.includes('வாரம்')) {
        feverDays = 7;
      } else {
        feverDays = 1;
      }
    }

    return {
      chestPain: hasChestPain,
      sweating: hasSweating,
      breathingDifficulty: hasBreathingDifficulty,
      fever: hasFever,
      feverDays: feverDays,
      cough: hasCough,
      minorAche: hasMinorAche && !hasChestPain && !hasBreathingDifficulty && !hasFever,
      confidence: 0.95
    };
  }

  /**
   * Speak clinical feedback back to illiterate patient in their native tongue
   */
  speakText(text, langCode = 'hi') {
    if (!this.synth) return;
    try {
      this.synth.cancel(); // Stop any active speech
      const utterance = new SpeechSynthesisUtterance(text);
      const langConfig = INDIAN_LANGUAGES.find(l => l.code === langCode);
      if (langConfig) {
        utterance.lang = langConfig.speechCode;
      }
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      this.synth.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis failed:', err);
    }
  }
}

export const voiceAssistant = new VoiceAssistantService();
