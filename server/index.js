import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import syncRouter from './routes/sync.js';
import patientsRouter from './routes/patients.js';
import consultationsRouter from './routes/consultations.js';
import prescriptionsRouter from './routes/prescriptions.js';
import aiPrescribeRouter from './routes/aiPrescribe.js';

const app = express();
const server = http.createServer(app);

// Configure Socket.io with CORS for live telemedicine dashboard and WebRTC signaling
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Safely catch any malformed JSON bodies without crashing
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON payload provided' });
  }
  next();
});

// Request logger
app.use((req, res, next) => {
  if (req.url.startsWith('/api')) {
    console.log(`[API] ${req.method} ${req.url}`);
  }
  next();
});

// Auth Route for ASHA and Doctor roles
app.post('/api/auth/login', (req, res) => {
  const { phone, role = 'asha', password } = req.body || {};
  res.json({
    success: true,
    token: `jwt-sanjeevani-${role}-${Date.now()}`,
    user: {
      id: role === 'doctor' ? 'doc-mehta-1' : 'asha-pooja-1',
      name: role === 'doctor' ? 'Dr. Arvind Mehta (MD)' : 'Pooja Sharma (ASHA)',
      role: role || 'asha',
      phone: phone || '+91 98765 43210',
      facility: role === 'doctor' ? 'PHC Tele-Hub' : 'Rampur Sub-Centre'
    }
  });
});

// API Routes
app.use('/api', syncRouter);
app.use('/api/patients', patientsRouter);
app.use('/api/consultations', consultationsRouter);
app.use('/api/prescriptions', prescriptionsRouter);
app.use('/api/ai-prescribe', aiPrescribeRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'SanjeevaniConnect Telemedicine Backend',
    timestamp: new Date().toISOString(),
    webrtcSignaling: 'active',
    syncEngine: 'active'
  });
});

// WebRTC Signaling & Real-time Consultation Room Management
const activeRooms = new Map();

io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  // Join Telemedicine Consult Room (Audio / Video consult between ASHA & Doctor)
  socket.on('join_room', ({ roomId, role, userName }) => {
    socket.join(roomId);
    if (!activeRooms.has(roomId)) {
      activeRooms.set(roomId, new Set());
    }
    activeRooms.get(roomId).add(socket.id);
    console.log(`[Socket.io] User ${userName || socket.id} (${role}) joined room ${roomId}`);

    socket.to(roomId).emit('user_joined_room', {
      peerId: socket.id,
      role,
      userName,
      timestamp: new Date().toISOString()
    });
  });

  // WebRTC Offer
  socket.on('webrtc_offer', ({ roomId, offer, senderName, role }) => {
    socket.to(roomId).emit('webrtc_offer', {
      senderId: socket.id,
      offer,
      senderName,
      role
    });
  });

  // WebRTC Answer
  socket.on('webrtc_answer', ({ roomId, answer }) => {
    socket.to(roomId).emit('webrtc_answer', {
      senderId: socket.id,
      answer
    });
  });

  // WebRTC ICE Candidate
  socket.on('webrtc_ice_candidate', ({ roomId, candidate }) => {
    socket.to(roomId).emit('webrtc_ice_candidate', {
      senderId: socket.id,
      candidate
    });
  });

  // Low bandwidth Audio-only toggle
  socket.on('toggle_media_mode', ({ roomId, isAudioOnly, senderName }) => {
    socket.to(roomId).emit('peer_media_mode_changed', {
      senderId: socket.id,
      isAudioOnly,
      senderName
    });
  });

  // End Call
  socket.on('leave_room', ({ roomId, userName }) => {
    socket.leave(roomId);
    if (activeRooms.has(roomId)) {
      activeRooms.get(roomId).delete(socket.id);
      if (activeRooms.get(roomId).size === 0) activeRooms.delete(roomId);
    }
    socket.to(roomId).emit('user_left_room', {
      peerId: socket.id,
      userName
    });
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    for (const [roomId, members] of activeRooms.entries()) {
      if (members.has(socket.id)) {
        members.delete(socket.id);
        socket.to(roomId).emit('user_left_room', { peerId: socket.id });
        if (members.size === 0) activeRooms.delete(roomId);
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🚀 SanjeevaniConnect Telemedicine Backend Running`);
  console.log(`📍 Port: http://localhost:${PORT}`);
  console.log(`📡 Socket.io & WebRTC Signaling active`);
  console.log(`===================================================`);
});
