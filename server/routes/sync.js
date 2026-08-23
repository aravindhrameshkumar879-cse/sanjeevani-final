import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { evaluateTriage } from '../services/triageRules.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../data/db.json');

const router = express.Router();

function readDb() {
  try {
    const raw = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading db:', err);
    return { patients: [], consultations: [], syncLogs: [] };
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing db:', err);
  }
}

// POST /api/consultations/sync - Main sync endpoint for ASHA app offline queue
router.post('/consultations/sync', (req, res) => {
  const io = req.app.get('io');
  const payload = req.body;
  const items = Array.isArray(payload) ? payload : [payload];

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'No consultation data provided for sync' });
  }

  const db = readDb();
  const syncedItems = [];
  const criticalAlerts = [];

  for (const item of items) {
    if (!item) continue;

    // Check if patient exists or create/update patient
    let patient = db.patients.find(p => p._id === item.patientId || (p.phone && p.phone === item.patientPhone));
    if (!patient) {
      patient = {
        _id: item.patientId || `pat-${uuidv4().slice(0, 8)}`,
        name: item.patientName || 'Unknown Patient',
        age: Number(item.patientAge) || 30,
        gender: item.patientGender || 'Other',
        phone: item.patientPhone || '',
        village: item.patientVillage || 'Rural Center',
        abhaId: item.patientAbhaId || `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
        createdBy: item.createdBy || 'ASHA-Field-Worker',
        createdAt: item.createdAt || new Date().toISOString()
      };
      db.patients.push(patient);
    }

    // Evaluate server-side triage for validation
    const symptoms = item.symptoms || {};
    const evaluated = evaluateTriage({
      age: patient.age,
      chestPain: symptoms.chestPain,
      sweating: symptoms.sweating,
      breathingDifficulty: symptoms.breathingDifficulty,
      fever: symptoms.fever,
      feverDays: symptoms.feverDays,
      cough: symptoms.cough,
      minorAche: symptoms.minorAche
    });

    const priorityTag = item.priorityTag || evaluated.tag;
    const triageReason = item.triageReason || evaluated.reason;

    // Check if consultation exists
    const existingIndex = db.consultations.findIndex(c => c._id === item._id || (c.patientId === patient._id && c.createdAt === item.createdAt));
    
    const syncedConsultation = {
      _id: item._id || `cons-${uuidv4().slice(0, 8)}`,
      localQueueId: item.localQueueId || item._id,
      patientId: patient._id,
      patientName: patient.name,
      patientAge: patient.age,
      patientGender: patient.gender,
      patientVillage: patient.village,
      patientPhone: patient.phone,
      patientAbhaId: patient.abhaId,
      symptoms: {
        text: symptoms.text || '',
        voiceTranscript: symptoms.voiceTranscript || '',
        duration: symptoms.duration || '1 day',
        fever: Boolean(symptoms.fever),
        feverDays: Number(symptoms.feverDays) || 0,
        cough: Boolean(symptoms.cough),
        chestPain: Boolean(symptoms.chestPain),
        sweating: Boolean(symptoms.sweating),
        breathingDifficulty: Boolean(symptoms.breathingDifficulty),
        minorAche: Boolean(symptoms.minorAche),
        vitals: symptoms.vitals || {
          bp: '120/80',
          pulse: '76',
          spo2: '98%',
          temp: '98.6°F'
        }
      },
      priorityTag,
      triageReason,
      urgencyScore: evaluated.urgencyScore,
      actionAdvice: evaluated.actionAdvice,
      syncStatus: 'synced',
      createdAt: item.createdAt || new Date().toISOString(),
      syncedAt: new Date().toISOString(),
      createdBy: item.createdBy || 'ASHA Worker',
      doctorId: item.doctorId || null,
      doctorName: item.doctorName || null,
      consultStatus: item.consultStatus || 'pending',
      prescription: item.prescription || null
    };

    if (existingIndex >= 0) {
      db.consultations[existingIndex] = { ...db.consultations[existingIndex], ...syncedConsultation };
    } else {
      db.consultations.unshift(syncedConsultation);
    }

    syncedItems.push(syncedConsultation);

    // If Critical, prepare urgent doctor alert
    if (priorityTag === 'Critical') {
      criticalAlerts.push(syncedConsultation);
    }
  }

  // Log sync activity
  const syncLog = {
    id: `sync-${uuidv4().slice(0, 8)}`,
    syncedCount: syncedItems.length,
    timestamp: new Date().toISOString(),
    items: syncedItems.map(s => ({ id: s._id, patient: s.patientName, priority: s.priorityTag }))
  };
  db.syncLogs.unshift(syncLog);
  if (db.syncLogs.length > 50) db.syncLogs = db.syncLogs.slice(0, 50);

  writeDb(db);

  // Broadcast via Socket.io in real-time
  if (io) {
    // 1. Send synced batch to doctor queue
    io.emit('batch_synced', {
      syncedCount: syncedItems.length,
      items: syncedItems,
      timestamp: new Date().toISOString()
    });

    // 2. Trigger high priority Critical Doctor Alert if any critical patient exists
    criticalAlerts.forEach(criticalCase => {
      io.emit('critical_patient_alert', {
        caseId: criticalCase._id,
        patientName: criticalCase.patientName,
        patientAge: criticalCase.patientAge,
        patientVillage: criticalCase.patientVillage,
        triageReason: criticalCase.triageReason,
        symptoms: criticalCase.symptoms,
        priorityTag: 'Critical',
        createdAt: criticalCase.createdAt,
        message: `🚨 CRITICAL ALERT: ${criticalCase.patientName} (${criticalCase.patientAge}y, ${criticalCase.patientVillage}) flagged as CRITICAL: ${criticalCase.triageReason}`
      });
    });
  }

  return res.json({
    success: true,
    message: `Successfully synced ${syncedItems.length} consultation(s)`,
    syncedCount: syncedItems.length,
    serverTime: new Date().toISOString(),
    syncedItems
  });
});

export default router;
