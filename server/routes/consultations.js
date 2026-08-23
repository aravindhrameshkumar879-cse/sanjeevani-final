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

// GET /api/consultations
router.get('/', (req, res) => {
  const db = readDb();
  const priority = req.query.priority;
  const status = req.query.status;
  const search = (req.query.search || '').toLowerCase();

  let consults = db.consultations || [];

  if (priority && priority !== 'All') {
    consults = consults.filter(c => c.priorityTag.toLowerCase() === priority.toLowerCase());
  }

  if (status && status !== 'All') {
    consults = consults.filter(c => c.consultStatus.toLowerCase() === status.toLowerCase());
  }

  if (search) {
    consults = consults.filter(c => 
      c.patientName.toLowerCase().includes(search) || 
      (c.patientVillage && c.patientVillage.toLowerCase().includes(search)) ||
      (c.triageReason && c.triageReason.toLowerCase().includes(search))
    );
  }

  // Sort: Critical first, then Routine, then Self-care, then by date descending
  const priorityWeight = { 'Critical': 3, 'Routine': 2, 'Self-care': 1 };
  consults.sort((a, b) => {
    const weightA = priorityWeight[a.priorityTag] || 0;
    const weightB = priorityWeight[b.priorityTag] || 0;
    if (weightB !== weightA) return weightB - weightA;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  res.json({ success: true, count: consults.length, consultations: consults });
});

// GET /api/consultations/:id
router.get('/:id', (req, res) => {
  const db = readDb();
  const consult = (db.consultations || []).find(c => c._id === req.params.id);
  if (!consult) return res.status(404).json({ error: 'Consultation not found' });
  res.json({ success: true, consultation: consult });
});

// PUT /api/consultations/:id/status
router.put('/:id/status', (req, res) => {
  const io = req.app.get('io');
  const db = readDb();
  const { consultStatus, doctorId, doctorName } = req.body;

  const consultIndex = (db.consultations || []).findIndex(c => c._id === req.params.id);
  if (consultIndex < 0) return res.status(404).json({ error: 'Consultation not found' });

  db.consultations[consultIndex].consultStatus = consultStatus || db.consultations[consultIndex].consultStatus;
  if (doctorId) db.consultations[consultIndex].doctorId = doctorId;
  if (doctorName) db.consultations[consultIndex].doctorName = doctorName;
  db.consultations[consultIndex].updatedAt = new Date().toISOString();

  writeDb(db);

  if (io) {
    io.emit('consultation_updated', db.consultations[consultIndex]);
  }

  res.json({ success: true, consultation: db.consultations[consultIndex] });
});

export default router;
