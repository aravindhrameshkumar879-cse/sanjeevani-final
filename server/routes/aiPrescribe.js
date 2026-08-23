import express from 'express';
import { generateAutomatedPrescription } from '../services/aiPrescribeEngine.js';

const router = express.Router();

// POST /api/ai-prescribe
router.post('/', (req, res) => {
  const { age, gender, symptoms, priorityTag, triageReason } = req.body;

  try {
    const rxRecommendation = generateAutomatedPrescription({
      age: Number(age) || 30,
      gender: gender || 'Male',
      symptoms: symptoms || {},
      priorityTag: priorityTag || 'Routine',
      triageReason: triageReason || ''
    });

    res.json({
      success: true,
      recommendation: rxRecommendation
    });
  } catch (err) {
    console.error('Error generating auto-prescription:', err);
    res.status(500).json({ error: 'Failed to generate automated prescription', details: err.message });
  }
});

export default router;
