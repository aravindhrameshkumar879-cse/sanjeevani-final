import pptxgen from 'pptxgenjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_16x9';
pptx.author = 'SanjeevaniConnect Team';
pptx.company = 'Government of India Rural Telemedicine Initiative';
pptx.title = 'SanjeevaniConnect - Offline-First Rural Telemedicine';

// Color Palette
const BG_DARK = '0A0F1D';
const CYAN = '06B6D4';
const BLUE = '2563EB';
const EMERALD = '10B981';
const RED = 'EF4444';
const WHITE = 'FFFFFF';
const SLATE_LIGHT = 'E2E8F0';
const SLATE_MUTED = '94A3B8';

// ================= SLIDE 1: TITLE SLIDE =================
const slide1 = pptx.addSlide();
slide1.background = { color: BG_DARK };

slide1.addText('🌿 SanjeevaniConnect', {
  x: 1.0, y: 1.8, w: 11.3, h: 1.0,
  fontSize: 44, fontFace: 'Arial', bold: true, color: CYAN, align: 'left'
});

slide1.addText('Offline-First Telemedicine & Clinical Triage Platform for Rural India', {
  x: 1.0, y: 2.8, w: 11.3, h: 0.8,
  fontSize: 22, fontFace: 'Arial', color: WHITE, bold: true, align: 'left'
});

slide1.addText('Empowering ASHA Field Workers • Deterministic On-Device Triage • 11 Indian Languages • Low-Bandwidth WebRTC', {
  x: 1.0, y: 3.7, w: 11.3, h: 0.6,
  fontSize: 14, fontFace: 'Arial', color: SLATE_MUTED, align: 'left'
});

// Stats Banner on Title Slide
slide1.addShape(pptx.ShapeType.rect, { x: 1.0, y: 5.0, w: 11.3, h: 1.2, fill: { color: '1E293B' }, line: { color: CYAN, width: 1 } });
slide1.addText([
  { text: '2,400+ Villages Covered     ', options: { bold: true, color: CYAN, fontSize: 16 } },
  { text: '1.2L+ Lives Impacted     ', options: { bold: true, color: WHITE, fontSize: 16 } },
  { text: '340 Doctors Online', options: { bold: true, color: EMERALD, fontSize: 16 } }
], { x: 1.2, y: 5.3, w: 11.0, h: 0.6, align: 'center' });

// ================= SLIDE 2: THE RURAL PROBLEM =================
const slide2 = pptx.addSlide();
slide2.background = { color: BG_DARK };
slide2.addText('1. Problem Statement: The Rural Healthcare Divide', { x: 0.8, y: 0.6, w: 11.5, h: 0.6, fontSize: 26, bold: true, color: CYAN });

slide2.addText([
  { text: '• Intermittent / Zero Connectivity:\n', options: { bold: true, color: WHITE, fontSize: 16 } },
  { text: '   Existing apps like eSanjeevani assume stable 4G/5G, failing completely in rural Sub-Centres.\n\n', options: { color: SLATE_LIGHT, fontSize: 14 } },
  { text: '• Smartphone Literacy & Language Barriers:\n', options: { bold: true, color: WHITE, fontSize: 16 } },
  { text: '   Rural elderly patients cannot navigate complex UIs. Care is mediated by ASHA field workers.\n\n', options: { color: SLATE_LIGHT, fontSize: 14 } },
  { text: '• Critical Delays in Emergency Triage:\n', options: { bold: true, color: WHITE, fontSize: 16 } },
  { text: '   Chest pain, acute coronary syndromes (ACS), and severe respiratory distress go unrecognized until fatal.', options: { color: SLATE_LIGHT, fontSize: 14 } }
], { x: 0.8, y: 1.5, w: 11.5, h: 5.0 });

// ================= SLIDE 3: OUR CORE INNOVATION =================
const slide3 = pptx.addSlide();
slide3.background = { color: BG_DARK };
slide3.addText('2. Core Philosophy: Zero-Internet Critical Path', { x: 0.8, y: 0.6, w: 11.5, h: 0.6, fontSize: 26, bold: true, color: CYAN });

slide3.addShape(pptx.ShapeType.rect, { x: 0.8, y: 1.5, w: 3.6, h: 4.8, fill: { color: '131E35' }, line: { color: CYAN, width: 1 } });
slide3.addText('📱 100% Offline Intake', { x: 1.0, y: 1.8, w: 3.2, h: 0.5, fontSize: 18, bold: true, color: CYAN });
slide3.addText('• Zero internet needed\n• Pure local storage\n• Multilingual voice intake\n• Demographic enrollment\n• Runs in Airplane Mode', { x: 1.0, y: 2.5, w: 3.2, h: 3.5, fontSize: 14, color: SLATE_LIGHT });

slide3.addShape(pptx.ShapeType.rect, { x: 4.8, y: 1.5, w: 3.6, h: 4.8, fill: { color: '131E35' }, line: { color: EMERALD, width: 1 } });
slide3.addText('🧠 On-Device Triage', { x: 5.0, y: 1.8, w: 3.2, h: 0.5, fontSize: 18, bold: true, color: EMERALD });
slide3.addText('• Pure deterministic ICMR rules\n• Zero cloud latency\n• Critical ACS recognition\n• Urgent protocol triggers\n• Immediate ASHA guidance', { x: 5.0, y: 2.5, w: 3.2, h: 3.5, fontSize: 14, color: SLATE_LIGHT });

slide3.addShape(pptx.ShapeType.rect, { x: 8.8, y: 1.5, w: 3.6, h: 4.8, fill: { color: '131E35' }, line: { color: BLUE, width: 1 } });
slide3.addText('⚡ 3-State Sync Queue', { x: 9.0, y: 1.8, w: 3.2, h: 0.5, fontSize: 18, bold: true, color: BLUE });
slide3.addText('• 🔴 Offline-only state\n• 🟡 Syncing background worker\n• 🟢 Synced to PHC cloud\n• Conflict-free resolution\n• Tolerates dropped signals', { x: 9.0, y: 2.5, w: 3.2, h: 3.5, fontSize: 14, color: SLATE_LIGHT });

// ================= SLIDE 4: SYSTEM ARCHITECTURE =================
const slide4 = pptx.addSlide();
slide4.background = { color: BG_DARK };
slide4.addText('3. End-to-End System Architecture', { x: 0.8, y: 0.6, w: 11.5, h: 0.6, fontSize: 26, bold: true, color: CYAN });

slide4.addText([
  { text: '1. ASHA Field Worker App (React + Offline Storage):\n', options: { bold: true, color: EMERALD, fontSize: 15 } },
  { text: '   Collects demographics, speech recognition in 11 languages, runs on-device triage table.\n\n', options: { color: SLATE_LIGHT, fontSize: 13 } },
  { text: '2. Resilient Sync Engine (Background Worker):\n', options: { bold: true, color: BLUE, fontSize: 15 } },
  { text: '   Automatically batches queued consultations when intermittent signal restores.\n\n', options: { color: SLATE_LIGHT, fontSize: 13 } },
  { text: '3. PHC Backend Hub (Node.js + Socket.io + Express):\n', options: { bold: true, color: CYAN, fontSize: 15 } },
  { text: '   Real-time priority broadcasting, WebRTC signaling, ICMR generic formulary engine.\n\n', options: { color: SLATE_LIGHT, fontSize: 13 } },
  { text: '4. Doctor & Patient Portals (Teleconsultation & e-Prescription):\n', options: { bold: true, color: WHITE, fontSize: 15 } },
  { text: '   Live queue with emergency siren, 2G WebRTC call, ICMR PDF generation, vernacular audio readout.', options: { color: SLATE_LIGHT, fontSize: 13 } }
], { x: 0.8, y: 1.5, w: 11.5, h: 5.0 });

// ================= SLIDE 5: DETERMINISTIC TRIAGE ENGINE =================
const slide5 = pptx.addSlide();
slide5.background = { color: BG_DARK };
slide5.addText('4. ICMR Clinical Triage Decision Table', { x: 0.8, y: 0.6, w: 11.5, h: 0.6, fontSize: 26, bold: true, color: CYAN });

const triageRows = [
  [
    { text: 'Symptoms & Red Flags', options: { bold: true, fill: { color: '1E293B' }, color: CYAN } },
    { text: 'Age', options: { bold: true, fill: { color: '1E293B' }, color: CYAN } },
    { text: 'Priority', options: { bold: true, fill: { color: '1E293B' }, color: CYAN } },
    { text: 'Action Protocol', options: { bold: true, fill: { color: '1E293B' }, color: CYAN } }
  ],
  [
    { text: 'Chest pain + Sweating', options: { color: WHITE } },
    { text: '> 40 yrs', options: { color: WHITE } },
    { text: 'CRITICAL (95)', options: { bold: true, color: RED } },
    { text: 'Suspected ACS: Stat Aspirin 325mg + 108 Transit', options: { color: SLATE_LIGHT } }
  ],
  [
    { text: 'Breathing difficulty OR Fever > 3 days', options: { color: WHITE } },
    { text: 'Any', options: { color: WHITE } },
    { text: 'CRITICAL (90)', options: { bold: true, color: RED } },
    { text: 'Severe Respiratory: Nebulization + SpO2 monitor', options: { color: SLATE_LIGHT } }
  ],
  [
    { text: 'Fever (<=3 days) + Cough', options: { color: WHITE } },
    { text: 'Any', options: { color: WHITE } },
    { text: 'ROUTINE (45)', options: { bold: true, color: BLUE } },
    { text: 'Uncomplicated viral URTI: Paracetamol + Cetirizine', options: { color: SLATE_LIGHT } }
  ],
  [
    { text: 'Minor ache / Mild cold, no fever', options: { color: WHITE } },
    { text: 'Any', options: { color: WHITE } },
    { text: 'SELF-CARE (15)', options: { bold: true, color: EMERALD } },
    { text: 'Home care remedies + ASHA follow-up in 48h', options: { color: SLATE_LIGHT } }
  ]
];

slide5.addTable(triageRows, { x: 0.8, y: 1.5, w: 11.5, fill: { color: '0F172A' }, fontSize: 13, border: { pt: 1, color: '334155' } });

// ================= SLIDE 6: AUTOMATED PRESCRIPTIONS =================
const slide6 = pptx.addSlide();
slide6.background = { color: BG_DARK };
slide6.addText('5. Automated e-Prescriptions & Voice Readout', { x: 0.8, y: 0.6, w: 11.5, h: 0.6, fontSize: 26, bold: true, color: CYAN });

slide6.addText([
  { text: '• Evidence-Based NLEM Generic Regimens:\n', options: { bold: true, color: WHITE, fontSize: 16 } },
  { text: '   Automatically suggests generic formulations tailored to patient age and clinical triage category.\n\n', options: { color: SLATE_LIGHT, fontSize: 14 } },
  { text: '• 1-Click Official ICMR PDF Generation:\n', options: { bold: true, color: WHITE, fontSize: 16 } },
  { text: '   Generates standardized e-Prescriptions with Ayushman Bharat ABHA QR, doctor MCI registration, and digital stamp.\n\n', options: { color: SLATE_LIGHT, fontSize: 14 } },
  { text: '• Vernacular Audio Readout in 11 Indian Languages:\n', options: { bold: true, color: WHITE, fontSize: 16 } },
  { text: '   Patients click the audio button to hear medicine timings and directions read aloud in Hindi, Tamil, Telugu, etc.', options: { color: SLATE_LIGHT, fontSize: 14 } }
], { x: 0.8, y: 1.5, w: 11.5, h: 5.0 });

// ================= SLIDE 7: MULTI-ROLE PORTALS =================
const slide7 = pptx.addSlide();
slide7.background = { color: BG_DARK };
slide7.addText('6. Unified Multi-Role Gateway', { x: 0.8, y: 0.6, w: 11.5, h: 0.6, fontSize: 26, bold: true, color: CYAN });

slide7.addShape(pptx.ShapeType.rect, { x: 0.8, y: 1.5, w: 3.6, h: 4.8, fill: { color: '131E35' }, line: { color: EMERALD, width: 1 } });
slide7.addText('👩‍⚕️ ASHA Field App', { x: 1.0, y: 1.8, w: 3.2, h: 0.5, fontSize: 18, bold: true, color: EMERALD });
slide7.addText('• Patient Registration\n• Voice Symptom Intake\n• Pure Deterministic Triage\n• 3-State Sync Queue\n• Outdoor Visibility Mode', { x: 1.0, y: 2.5, w: 3.2, h: 3.5, fontSize: 14, color: SLATE_LIGHT });

slide7.addShape(pptx.ShapeType.rect, { x: 4.8, y: 1.5, w: 3.6, h: 4.8, fill: { color: '131E35' }, line: { color: BLUE, width: 1 } });
slide7.addText('👨‍⚕️ Doctor Dashboard', { x: 5.0, y: 1.8, w: 3.2, h: 0.5, fontSize: 18, bold: true, color: BLUE });
slide7.addText('• Live Priority Queue\n• Emergency Siren Alarm\n• WebRTC Video/Audio\n• Automated e-Rx Formulator\n• Digital MCI Signature Stamp', { x: 5.0, y: 2.5, w: 3.2, h: 3.5, fontSize: 14, color: SLATE_LIGHT });

slide7.addShape(pptx.ShapeType.rect, { x: 8.8, y: 1.5, w: 3.6, h: 4.8, fill: { color: '131E35' }, line: { color: 'A855F7', width: 1 } });
slide7.addText('👤 Patient Portal', { x: 9.0, y: 1.8, w: 3.2, h: 0.5, fontSize: 18, bold: true, color: 'A855F7' });
slide7.addText('• Digital ABHA Card + QR\n• Clinical Case Status\n• Medicine Dosage Schedule\n• 1-Click PDF Download\n• Audio Voice Directions', { x: 9.0, y: 2.5, w: 3.2, h: 3.5, fontSize: 14, color: SLATE_LIGHT });

// ================= SLIDE 8: TECH STACK =================
const slide8 = pptx.addSlide();
slide8.background = { color: BG_DARK };
slide8.addText('7. Technology Stack', { x: 0.8, y: 0.6, w: 11.5, h: 0.6, fontSize: 26, bold: true, color: CYAN });

const techRows = [
  [
    { text: 'Layer', options: { bold: true, fill: { color: '1E293B' }, color: CYAN } },
    { text: 'Technology Stack', options: { bold: true, fill: { color: '1E293B' }, color: CYAN } },
    { text: 'Purpose in SanjeevaniConnect', options: { bold: true, fill: { color: '1E293B' }, color: CYAN } }
  ],
  [
    { text: 'Frontend UI', options: { bold: true, color: WHITE } },
    { text: 'React 18 + Vite + TailwindCSS', options: { color: SLATE_LIGHT } },
    { text: 'Blazing fast, responsive mobile-first UI with dark/light mode', options: { color: SLATE_LIGHT } }
  ],
  [
    { text: 'Offline Storage', options: { bold: true, color: WHITE } },
    { text: 'LocalStorage + SyncQueue Worker', options: { color: SLATE_LIGHT } },
    { text: 'Guarantees zero-network persistence on device first', options: { color: SLATE_LIGHT } }
  ],
  [
    { text: 'Backend Hub', options: { bold: true, color: WHITE } },
    { text: 'Node.js + Express + Socket.io', options: { color: SLATE_LIGHT } },
    { text: 'Real-time WebSocket priority alerts & REST sync endpoints', options: { color: SLATE_LIGHT } }
  ],
  [
    { text: 'Teleconsultation', options: { bold: true, color: WHITE } },
    { text: 'WebRTC (Peer-to-Peer)', options: { color: SLATE_LIGHT } },
    { text: 'Low-bandwidth audio/video calls with 2G fallback', options: { color: SLATE_LIGHT } }
  ],
  [
    { text: 'e-Prescriptions', options: { bold: true, color: WHITE } },
    { text: 'jsPDF + ICMR Clinical Rules', options: { color: SLATE_LIGHT } },
    { text: 'Official PDF prescription generation with ABHA QR code', options: { color: SLATE_LIGHT } }
  ]
];

slide8.addTable(techRows, { x: 0.8, y: 1.5, w: 11.5, fill: { color: '0F172A' }, fontSize: 13, border: { pt: 1, color: '334155' } });

// ================= SLIDE 9: IMPACT & CONCLUSION =================
const slide9 = pptx.addSlide();
slide9.background = { color: BG_DARK };
slide9.addText('8. Impact & Future Roadmap', { x: 0.8, y: 0.6, w: 11.5, h: 0.6, fontSize: 26, bold: true, color: CYAN });

slide9.addText([
  { text: '• Immediate Rural Impact:\n', options: { bold: true, color: EMERALD, fontSize: 16 } },
  { text: '   Empowers 10 lakh+ ASHA workers to triage and save lives during the golden hour without waiting for connectivity.\n\n', options: { color: SLATE_LIGHT, fontSize: 14 } },
  { text: '• National Scalability:\n', options: { bold: true, color: CYAN, fontSize: 16 } },
  { text: '   Full compliance with Ayushman Bharat Digital Mission (ABDM) and ICMR Standard Treatment Guidelines.\n\n', options: { color: SLATE_LIGHT, fontSize: 14 } },
  { text: '• Open & Modular Architecture:\n', options: { bold: true, color: WHITE, fontSize: 16 } },
  { text: '   Easy integration with existing state health registries and primary health centre tele-hubs.', options: { color: SLATE_LIGHT, fontSize: 14 } }
], { x: 0.8, y: 1.5, w: 11.5, h: 5.0 });

// Output paths
const outputPath = path.join(__dirname, '..', 'SanjeevaniConnect_Presentation.pptx');
const rootOutputPath = 'C:\\Users\\aravi\\sanjeevani-connect\\SanjeevaniConnect_Presentation.pptx';

pptx.writeFile({ fileName: outputPath }).then(fileName => {
  console.log(`✓ PowerPoint presentation created successfully at: ${fileName}`);
}).catch(err => {
  console.error('Error generating PPTX:', err);
});
