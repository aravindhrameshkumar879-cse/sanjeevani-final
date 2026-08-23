import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Mock User Database
let USERS = [
  {
    _id: 'doc-1',
    role: 'doctor',
    name: 'Dr. Arvind Mehta (MD, AIIMS)',
    phone: '9876543210',
    email: 'dr.mehta@sanjeevani.health',
    hospitalId: 'AIIMS-Rampur-Hub',
    specialization: 'Internal Medicine & Critical Triage',
    regNumber: 'MCI-2014-98421',
    avatar: '👨‍⚕️'
  },
  {
    _id: 'asha-1',
    role: 'asha',
    name: 'Pooja Sharma (ASHA Worker)',
    phone: '9812345678',
    village: 'Rampur Khurd Sub-Centre',
    ashaId: 'ASHA-UP-4829',
    centerName: 'Rampur Primary Sub-Centre',
    avatar: '👩‍⚕️'
  },
  {
    _id: 'pat-seed-001',
    role: 'patient',
    name: 'Rameshwar Prasad',
    phone: '9876543210',
    age: 52,
    gender: 'Male',
    village: 'Rampur Khurd',
    abhaId: '91-4829-1029-4820',
    avatar: '👤'
  },
  {
    _id: 'pat-seed-002',
    role: 'patient',
    name: 'Sunita Devi',
    phone: '9812376543',
    age: 34,
    gender: 'Female',
    village: 'Sundarpur',
    abhaId: '91-3091-8841-7712',
    avatar: '👤'
  }
];

// POST /api/auth/register - Register a new Doctor, Patient, or ASHA Worker
router.post('/register', (req, res) => {
  const { role, name, phone, age, gender, village, specialization, hospitalId, regNumber, ashaId } = req.body;

  if (!role || !name) {
    return res.status(400).json({ error: 'Role and Name are required for registration' });
  }

  let newUser = null;

  if (role === 'doctor') {
    newUser = {
      _id: `doc-${uuidv4().slice(0, 8)}`,
      role: 'doctor',
      name: name.startsWith('Dr.') ? name : `Dr. ${name}`,
      phone: phone || '9876500000',
      email: `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@sanjeevani.health`,
      hospitalId: hospitalId || 'PHC-District-Hospital',
      specialization: specialization || 'General Medicine & Rural Health',
      regNumber: regNumber || `MCI-2024-${Math.floor(10000 + Math.random() * 90000)}`,
      avatar: '👨‍⚕️',
      createdAt: new Date().toISOString()
    };
  } else if (role === 'patient') {
    newUser = {
      _id: `pat-${uuidv4().slice(0, 8)}`,
      role: 'patient',
      name,
      phone: phone || '',
      age: Number(age) || 35,
      gender: gender || 'Other',
      village: village || 'Rampur Khurd',
      abhaId: `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      avatar: '👤',
      createdAt: new Date().toISOString()
    };
  } else if (role === 'asha') {
    newUser = {
      _id: `asha-${uuidv4().slice(0, 8)}`,
      role: 'asha',
      name,
      phone: phone || '',
      village: village || 'Rampur Sub-Centre',
      ashaId: ashaId || `ASHA-UP-${Math.floor(1000 + Math.random() * 9000)}`,
      centerName: `${village || 'Rampur'} Primary Health Sub-Centre`,
      avatar: '👩‍⚕️',
      createdAt: new Date().toISOString()
    };
  } else {
    return res.status(400).json({ error: 'Invalid role specified' });
  }

  USERS.unshift(newUser);

  return res.json({
    success: true,
    token: `token-${role}-${Date.now()}`,
    user: newUser,
    message: `Account created successfully for ${newUser.name}`
  });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { role, identifier, password, pin } = req.body;

  if (!role) {
    return res.status(400).json({ error: 'Role is required (doctor, asha, or patient)' });
  }

  // Doctor login
  if (role === 'doctor') {
    const doctor = USERS.find(u => u.role === 'doctor' && (u.phone === identifier || !identifier || u.name.includes(identifier))) || USERS.find(u => u.role === 'doctor');
    return res.json({
      success: true,
      token: `token-doc-${Date.now()}`,
      user: doctor,
      message: `Welcome ${doctor.name}`
    });
  }

  // ASHA Worker login
  if (role === 'asha') {
    const asha = USERS.find(u => u.role === 'asha' && (u.phone === identifier || !identifier)) || USERS.find(u => u.role === 'asha');
    return res.json({
      success: true,
      token: `token-asha-${Date.now()}`,
      user: asha,
      message: `Welcome ${asha.name}`
    });
  }

  // Patient login
  if (role === 'patient') {
    let patient = USERS.find(u => u.role === 'patient' && (u.phone === identifier || u.abhaId === identifier || u._id === identifier));
    
    if (!patient) {
      patient = {
        _id: `pat-${Date.now()}`,
        role: 'patient',
        name: req.body.name || 'Citizen Patient',
        phone: identifier || '9876543210',
        age: req.body.age || 40,
        gender: req.body.gender || 'Other',
        village: req.body.village || 'Rampur Khurd',
        abhaId: `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
        avatar: '👤'
      };
      USERS.push(patient);
    }

    return res.json({
      success: true,
      token: `token-patient-${Date.now()}`,
      user: patient,
      message: `Welcome ${patient.name}`
    });
  }

  return res.status(400).json({ error: 'Invalid login role specified' });
});

// GET /api/auth/users - List available demo profiles
router.get('/users', (req, res) => {
  res.json({
    users: USERS
  });
});

export default router;
