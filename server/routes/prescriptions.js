import express from 'express';
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

// POST /api/prescriptions/save - Save prescription for a consultation
router.post('/save', (req, res) => {
  const io = req.app.get('io');
  const db = readDb();
  const {
    consultationId,
    medicines,
    notes,
    dietAdvice,
    doctorId,
    doctorName,
    pdfDataUrl
  } = req.body;

  if (!consultationId) {
    return res.status(400).json({ error: 'Consultation ID is required' });
  }

  const consultIndex = (db.consultations || []).findIndex(c => c._id === consultationId);
  if (consultIndex < 0) {
    return res.status(404).json({ error: 'Consultation not found' });
  }

  const prescription = {
    medicines: medicines || [],
    notes: notes || '',
    dietAdvice: dietAdvice || '',
    doctorId: doctorId || 'doc-general-1',
    doctorName: doctorName || 'Dr. Arvind Mehta (MD, AIIMS)',
    pdfUrl: pdfDataUrl || null,
    prescribedAt: new Date().toISOString()
  };

  db.consultations[consultIndex].prescription = prescription;
  db.consultations[consultIndex].consultStatus = 'completed';
  db.consultations[consultIndex].doctorId = prescription.doctorId;
  db.consultations[consultIndex].doctorName = prescription.doctorName;
  db.consultations[consultIndex].updatedAt = new Date().toISOString();

  writeDb(db);

  if (io) {
    io.emit('prescription_created', {
      consultationId,
      prescription,
      patientName: db.consultations[consultIndex].patientName,
      status: 'completed'
    });
  }

  res.json({
    success: true,
    message: 'Prescription saved and consultation marked completed',
    consultation: db.consultations[consultIndex]
  });
});

export default router;
