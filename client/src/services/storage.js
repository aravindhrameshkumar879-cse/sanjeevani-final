/**
 * SanjeevaniConnect Offline-First Local Storage Engine
 * 
 * Guarantees that EVERY write operation hits on-device storage first.
 * Zero-internet connectivity is the fundamental design constraint.
 */

const STORAGE_KEYS = {
  PATIENTS: 'sanjeevani_local_patients',
  CONSULTATIONS: 'sanjeevani_local_consultations',
  SYNC_QUEUE: 'sanjeevani_offline_sync_queue',
  APP_SETTINGS: 'sanjeevani_app_settings'
};

// Seed fallback data for initial demo experience if storage is empty
const INITIAL_PATIENTS = [
  {
    _id: 'pat-seed-001',
    name: 'Rameshwar Prasad',
    age: 52,
    gender: 'Male',
    phone: '+91 98765 43210',
    village: 'Rampur Khurd',
    abhaId: '91-4829-1029-4820',
    createdBy: 'ASHA-Pooja-Sharma',
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    _id: 'pat-seed-002',
    name: 'Sunita Devi',
    age: 34,
    gender: 'Female',
    phone: '+91 98123 76543',
    village: 'Sundarpur',
    abhaId: '91-3091-8841-7712',
    createdBy: 'ASHA-Pooja-Sharma',
    createdAt: new Date(Date.now() - 7200000).toISOString()
  }
];

const INITIAL_CONSULTATIONS = [
  {
    _id: 'cons-seed-001',
    localQueueId: 'cons-seed-001',
    patientId: 'pat-seed-001',
    patientName: 'Rameshwar Prasad',
    patientAge: 52,
    patientGender: 'Male',
    patientVillage: 'Rampur Khurd',
    patientPhone: '+91 98765 43210',
    patientAbhaId: '91-4829-1029-4820',
    symptoms: {
      text: 'Severe retrosternal chest pain with profuse cold sweating for 2 hours.',
      voiceTranscript: 'सीने में बहुत भारीपन और दर्द है, बहुत पसीना आ रहा है और सांस लेने में भी तकलीफ है।',
      duration: '2 hours',
      feverDays: 0,
      chestPain: true,
      sweating: true,
      breathingDifficulty: true,
      fever: false,
      cough: false,
      minorAche: false,
      vitals: { bp: '150/95', pulse: '104', spo2: '94%', temp: '98.4°F' }
    },
    priorityTag: 'Critical',
    triageReason: 'Chest pain + sweating + age > 40 (52y); Difficulty breathing present',
    urgencyScore: 100,
    actionAdvice: 'IMMEDIATE EMERGENCY: Keep patient at rest, prepare loading dose, alert PHC Doctor and call 108 Ambulance.',
    syncStatus: 'synced',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    syncedAt: new Date(Date.now() - 3500000).toISOString(),
    createdBy: 'ASHA-Pooja-Sharma',
    doctorId: 'doc-1',
    doctorName: 'Dr. Arvind Mehta (MD, AIIMS)',
    consultStatus: 'in-progress',
    prescription: {
      medicines: [
        { name: 'Tab Aspirin', dosage: '325 mg', frequency: 'Stat chew', duration: '1 dose', instructions: 'Emergency antiplatelet' },
        { name: 'Tab Clopidogrel', dosage: '300 mg', frequency: 'Stat', duration: '1 dose', instructions: 'Loading dose' },
        { name: 'Tab Sorbitrate', dosage: '5 mg', frequency: 'Sublingual stat', duration: '1 dose', instructions: 'Under tongue for chest pain' }
      ],
      notes: 'URGENT: Suspected Acute Coronary Syndrome. Immediate 108 transfer to District Hospital.',
      dietAdvice: 'Strict NPO. Bed rest.',
      pdfUrl: null
    }
  },
  {
    _id: 'cons-seed-002',
    localQueueId: 'cons-seed-002',
    patientId: 'pat-seed-002',
    patientName: 'Sunita Devi',
    patientAge: 34,
    patientGender: 'Female',
    patientVillage: 'Sundarpur',
    patientPhone: '+91 98123 76543',
    patientAbhaId: '91-3091-8841-7712',
    symptoms: {
      text: 'Persistent high fever for 4 days with dry cough and chills.',
      voiceTranscript: 'चार दिन से लगातार तेज बुखार आ रहा है और खांसी भी है।',
      duration: '4 days',
      feverDays: 4,
      chestPain: false,
      sweating: false,
      breathingDifficulty: false,
      fever: true,
      cough: true,
      minorAche: false,
      vitals: { bp: '118/76', pulse: '88', spo2: '98%', temp: '102.2°F' }
    },
    priorityTag: 'Critical',
    triageReason: 'Fever duration > 3 days (4 days)',
    urgencyScore: 85,
    actionAdvice: 'HIGH PRIORITY: Monitor SpO2 and vitals, arrange expedited Doctor tele-consultation.',
    syncStatus: 'synced',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    syncedAt: new Date(Date.now() - 7100000).toISOString(),
    createdBy: 'ASHA-Pooja-Sharma',
    doctorId: null,
    doctorName: null,
    consultStatus: 'pending',
    prescription: null
  }
];

// Helper to generate UUID-like IDs on device with zero dependencies
function generateLocalId(prefix = 'loc') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
}

export const LocalStorageService = {
  // Get all patients stored on local device
  getPatients() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PATIENTS);
      if (!raw) {
        localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(INITIAL_PATIENTS));
        return INITIAL_PATIENTS;
      }
      return JSON.parse(raw);
    } catch (e) {
      console.warn('LocalStorage error reading patients:', e);
      return INITIAL_PATIENTS;
    }
  },

  // Save patient locally on device (offline-first)
  savePatient(patientData) {
    const patients = this.getPatients();
    const newPatient = {
      _id: patientData._id || generateLocalId('pat'),
      name: patientData.name || 'Patient',
      age: Number(patientData.age) || 0,
      gender: patientData.gender || 'Other',
      phone: patientData.phone || '',
      village: patientData.village || 'Rural Center',
      abhaId: patientData.abhaId || `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      createdBy: patientData.createdBy || 'ASHA-Pooja-Sharma',
      createdAt: patientData.createdAt || new Date().toISOString()
    };

    const existingIndex = patients.findIndex(p => p._id === newPatient._id);
    if (existingIndex >= 0) {
      patients[existingIndex] = newPatient;
    } else {
      patients.unshift(newPatient);
    }

    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
    return newPatient;
  },

  // Get all consultations stored on device
  getConsultations() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CONSULTATIONS);
      if (!raw) {
        localStorage.setItem(STORAGE_KEYS.CONSULTATIONS, JSON.stringify(INITIAL_CONSULTATIONS));
        return INITIAL_CONSULTATIONS;
      }
      return JSON.parse(raw);
    } catch (e) {
      console.warn('LocalStorage error reading consultations:', e);
      return INITIAL_CONSULTATIONS;
    }
  },

  // Save consultation locally on device (Guaranteed offline write first)
  saveConsultation(consultData) {
    const consultations = this.getConsultations();
    const localId = consultData._id || generateLocalId('cons');

    const newConsultation = {
      _id: localId,
      localQueueId: localId,
      patientId: consultData.patientId,
      patientName: consultData.patientName,
      patientAge: Number(consultData.patientAge),
      patientGender: consultData.patientGender,
      patientVillage: consultData.patientVillage,
      patientPhone: consultData.patientPhone,
      patientAbhaId: consultData.patientAbhaId,
      symptoms: consultData.symptoms || {},
      priorityTag: consultData.priorityTag || 'Routine',
      triageReason: consultData.triageReason || '',
      urgencyScore: consultData.urgencyScore || 50,
      actionAdvice: consultData.actionAdvice || '',
      // Status starts as offline or whatever is passed
      syncStatus: consultData.syncStatus || 'offline',
      createdAt: consultData.createdAt || new Date().toISOString(),
      syncedAt: consultData.syncedAt || null,
      createdBy: consultData.createdBy || 'ASHA-Pooja-Sharma',
      doctorId: consultData.doctorId || null,
      doctorName: consultData.doctorName || null,
      consultStatus: consultData.consultStatus || 'pending',
      prescription: consultData.prescription || null
    };

    const existingIndex = consultations.findIndex(c => c._id === localId);
    if (existingIndex >= 0) {
      consultations[existingIndex] = { ...consultations[existingIndex], ...newConsultation };
    } else {
      consultations.unshift(newConsultation);
    }

    localStorage.setItem(STORAGE_KEYS.CONSULTATIONS, JSON.stringify(consultations));
    return newConsultation;
  },

  // Get items needing background sync (status === 'offline' or 'queued')
  getUnsyncedConsultations() {
    const all = this.getConsultations();
    return all.filter(c => c.syncStatus === 'offline' || c.syncStatus === 'queued');
  },

  // Mark an item as synced or update sync state
  updateSyncStatus(localId, status, cloudUpdates = {}) {
    const consultations = this.getConsultations();
    const index = consultations.findIndex(c => c._id === localId || c.localQueueId === localId);
    if (index >= 0) {
      consultations[index].syncStatus = status;
      if (status === 'synced') {
        consultations[index].syncedAt = new Date().toISOString();
      }
      if (cloudUpdates._id) {
        consultations[index].cloudId = cloudUpdates._id;
      }
      if (cloudUpdates.prescription) {
        consultations[index].prescription = cloudUpdates.prescription;
        consultations[index].consultStatus = 'completed';
      }
      localStorage.setItem(STORAGE_KEYS.CONSULTATIONS, JSON.stringify(consultations));
      return consultations[index];
    }
    return null;
  },

  // Replace all consultations (e.g. after full sync reconciliation)
  setAllConsultations(consultationsList) {
    localStorage.setItem(STORAGE_KEYS.CONSULTATIONS, JSON.stringify(consultationsList));
  },

  // Reset demo data
  resetToDemo() {
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(INITIAL_PATIENTS));
    localStorage.setItem(STORAGE_KEYS.CONSULTATIONS, JSON.stringify(INITIAL_CONSULTATIONS));
  }
};
