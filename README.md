# 🌿 SanjeevaniConnect (संजीवनी कनेक्ट)
### Offline-First Telemedicine & Triage Platform for Rural India & ASHA Field Workers

> **Core Philosophy**: Every critical feature — patient registration, vernacular voice intake, and clinical triage — executes with **ZERO internet connectivity** on the ASHA worker's device. When cellular connectivity is restored (even intermittently), data auto-syncs to the Primary Health Centre (PHC) Doctor Dashboard in real time.

---

## 🚀 Key Features

1. **Deterministic On-Device Triage Decision Table (Pure JS Engine)**
   - Operates 100% locally with zero external network or model dependencies:
     | Clinical Condition | Triage Tag | Action Protocol |
     |---|---|---|
     | **Chest pain + sweating + age > 40** | 🔴 **Critical** | Immediate Emergency: Suspected ACS, Loading dose, 108 Ambulance alert |
     | **Difficulty breathing OR fever > 3 days** | 🔴 **Critical** | High Priority: Respiratory distress / prolonged fever, SpO2 monitoring |
     | **Fever (<3 days) + cough, no other red flags** | 🔵 **Routine** | Routine Clinical Review: Antipyretic, tele-consultation queue |
     | **Mild cold / minor ache / no fever** | 🟢 **Self-care** | Home Care & Rest: Hydration, steam, ASHA 48h follow-up |

2. **Multilingual Voice Assistant for Illiterate Rural Patients**
   - Supports **11 Indian Languages**: Hindi (हिन्दी), Tamil (தமிழ்), Telugu (తెలుగు), Bengali (বাংলা), Marathi (मराठी), Gujarati (ગુજરાતી), Kannada (ಕನ್ನಡ), Malayalam (മലയാളം), Punjabi (ਪੰਜਾਬੀ), Odia (ଓଡ଼ିଆ), and English.
   - Built with Web Speech Recognition (`webkitSpeechRecognition` / native voice) + rule-based clinical NLP keyword extraction.
   - Illiterate patients simply tap the large microphone and speak their distress in their mother tongue; the assistant transcribes their speech and auto-fills the clinical symptom intake form.
   - Speaks confirmation prompts back in their native language using SpeechSynthesis.

3. **Guaranteed Local-First Storage & 3-State Sync Queue**
   - Local device storage is the source of truth. Every write hits device memory before any network attempt.
   - Visual Sync Status Badges:
     - 🔴 **Offline-Only**: Case recorded in zero-signal zone; held in device queue.
     - 🟡 **Syncing**: Cellular connectivity detected, pushing batched payload to PHC Cloud.
     - 🟢 **Synced**: Acknowledged by PHC server with cloud timestamp.
   - Built-in **"Airplane Mode Simulator"** toggle for judges/reviewers to test zero-connectivity flows with one click.

4. **Doctor Tele-Consultation Web Portal**
   - Real-time priority queue updated live via **Socket.io** (no manual refreshing).
   - **Urgent Critical Alarm & Flash Modal**: Triggers immediate audio chime and alert banner whenever a `Critical` patient arrives.
   - **WebRTC Teleconsultation**: Live peer-to-peer audio/video calling with low-bandwidth **Audio-Only fallback mode** for 2G rural village networks.
   - **Automated ICMR/NLEM Medical Prescription**: Auto-generates evidence-based generic drug formulations (dosage, frequency, duration, instructions), allows doctor edits, and exports a high-resolution e-Prescription PDF with digital signature stamp and mock ABHA ID (`jspdf`).

5. **Aesthetics & Themes**
   - High-contrast sunlight mode with large touch targets for outdoor ASHA field visits.
   - Modern Dark theme with sleek glassmorphic panels for doctor clinic night duties.

---

## 🛠️ Technology Stack

- **Client**: React 18, Vite, Tailwind CSS, Lucide Icons, jsPDF, Web Speech API, Socket.io-client, IndexedDB/LocalStorage.
- **Backend Server**: Node.js, Express, Socket.io, WebRTC Signaling Engine, Persistent JSON/SQLite Store.

---

## 📦 Setup & Running Locally

### Step 1: Start the Backend Server (Port 5000)
```bash
cd sanjeevani-connect/server
npm install
npm start
```

### Step 2: Start the Web Client (Port 5173)
```bash
cd sanjeevani-connect/client
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 🧪 End-to-End Demo Script (Proving the Offline-to-Sync Flow)

1. **Test Offline-First Zero Internet Recording**:
   - In the top bar of the ASHA app, click the **"🔴 Airplane Mode (Zero Net)"** button to simulate zero connectivity.
   - Tap one of the **Quick 1-Click Test Scenarios** (e.g. *"Rule 1: Chest Pain + Sweating (>40y)"*).
   - Notice the Triage Result instantly calculates on-device: **`Critical (Score: 100/100)`** with exact rule reasoning.
   - Click **"Save Case Offline"**.
   - Notice the case is saved instantly to the device and displays the **`🔴 Offline-only`** badge in the priority queue.

2. **Test Vernacular Voice Assistant**:
   - Switch language to **हिन्दी (Hindi)** or **தமிழ் (Tamil)** using the language selector.
   - Tap the large **"Tap & Speak"** microphone button.
   - Speak your medical problem (or click a sample phrase like *"सीने में बहुत तेज दर्द और भारीपन है, पसीना छूट रहा है"*).
   - Watch the voice assistant transcribe in real-time, extract the symptoms into the checklist, and speak back confirmation!

3. **Test Automatic Background Sync on Signal Restoration**:
   - Turn OFF Airplane Mode by clicking **"🌐 Online"**.
   - Watch the sync badge instantly transition: **`🔴 Offline-only` → `🟡 Syncing...` → `🟢 Synced to PHC`**.

4. **Test Real-Time Doctor Portal & Urgent Critical Alert**:
   - Switch role to **👨‍⚕️ Doctor Dashboard** in the top bar.
   - Notice the Critical patient is pinned at the very top of the live queue with pulsing red urgency indicator.
   - A high-priority **🚨 Critical Emergency Alert Modal** pops up with audio chime.
   - Click **"Review & Prescribe"** to view the automated ICMR/NLEM medication formulation.
   - Click **"Download Prescription PDF"** to generate the official printable e-Prescription.
   - Click **"Teleconsult"** to launch the WebRTC video consult with low-bandwidth audio-only toggle.
