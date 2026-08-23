import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../data/db.json');

const router = express.Router();

function readDb() {
  try {
    const raw = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return { patients: [], consultations: [], syncLogs: [] };
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(err);
  }
}

// GET /api/patients
router.get('/', (req, res) => {
  const db = readDb();
  const search = (req.query.search || '').toLowerCase();
  const village = req.query.village;

  let patients = db.patients || [];
  if (search) {
    patients = patients.filter(p => 
      p.name.toLowerCase().includes(search) || 
      (p.phone && p.phone.includes(search)) ||
      (p.village && p.village.toLowerCase().includes(search))
    );
  }
  if (village) {
    patients = patients.filter(p => p.village === village);
  }

  res.json({ success: true, count: patients.length, patients });
});

// GET /api/patients/:id
router.get('/:id', (req, res) => {
  const db = readDb();
  const patient = (db.patients || []).find(p => p._id === req.params.id);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });
  const consults = (db.consultations || []).filter(c => c.patientId === patient._id);
  res.json({ success: true, patient, consultations: consults });
});

// POST /api/patients
router.post('/', (req, res) => {
  const db = readDb();
  const { name, age, gender, phone, village, abhaId, createdBy } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Patient name is required' });
  }

  const newPatient = {
    _id: `pat-${uuidv4().slice(0, 8)}`,
    name,
    age: Number(age) || 0,
    gender: gender || 'Other',
    phone: phone || '',
    village: village || 'Rural Center',
    abhaId: abhaId || `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
    createdBy: createdBy || 'ASHA Worker',
    createdAt: new Date().toISOString()
  };

  db.patients.unshift(newPatient);
  writeDb(db);

  res.status(201).json({ success: true, patient: newPatient });
});

export default router;
