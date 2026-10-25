# 🛡️ GateKeeper AI — Accessible Apartment Visitor Management System

> Production-ready, full-stack Apartment Visitor Management System engineered with **Accessibility-First Design for Non-Literate and Semi-Literate Security Guards**, real-time multi-device synchronization via Firebase Firestore (with zero-configuration LocalStorage & `BroadcastChannel` fallback), and static deployment compatibility for GitHub Pages, Vercel, and Firebase Hosting.

---

## 🌟 Key Innovations & Accessibility Features

### 👁️ High-Contrast Audio-Visual Decision Cards (Guard Dashboard)
Specially engineered for non-literate and low-literate guards who may struggle with reading small textual notifications:
- **GREEN CARD (`APPROVED`)**: Giant green card with massive checkmark icon, large photo, huge flat code (e.g., `A-101` in 48px high-contrast typography), and prominent label: *"GREEN: ALLOW ENTRY / हरी बत्ती: अंदर जाने दें"*.
- **RED CARD (`DENIED`)**: High-contrast pulsating red card with large stop icon, denial reason badge, and prominent warning: *"RED: STOP / लाल बत्ती: रोकना है, अंदर मत जाने दें"*.
- **YELLOW CARD (`PENDING`)**: Pulsating amber card indicating resident response is awaited: *"YELLOW: WAIT AT GATE / पीली बत्ती: इंतज़ार करवाएं"*.
- **BLUE CARD (`INSIDE`)**: Indicates visitor is currently on premises with a 1-tap exit button.

### 🔊 Text-to-Speech (TTS) Voice Engine & Web Audio Synthesizer
- **Voice Guidance**: Dedicated `🔊 SUNO / सुनो` audio button on every visitor card. Speaks clear, natural announcements via the browser's Web Speech API.
- **Languages Supported**:
  - **Bilingual (Hinglish/Indian Context)**: *"GREEN LIGHT! हरी बत्ती! Allow entry for Ramesh to Flat A-101. Entry Approved!"*
  - **Pure Hindi (हिन्दी)**: *"हरी बत्ती! हरी बत्ती! रमेश को फ्लैट A-101 में जाने दें।"*
  - **English**: *"GREEN LIGHT! Allow entry for Ramesh to Flat A-101."*
- **Auto-Announce Mode**: Hands-free auditory alerts as soon as a resident taps approve or deny.
- **Hardware-Synthesized Chimes**: Built with Web Audio API (zero external `.mp3` dependencies, works 100% offline):
  - **Approval Chime**: Uplifting ascending major triad (C5 $\rightarrow$ E5 $\rightarrow$ G5).
  - **Denial Buzzer**: Dual low-frequency 160Hz warning buzzer.
  - **Doorbell Ding-Dong**: 660Hz $\rightarrow$ 520Hz chime on new visitor arrival.

### 🔢 1-Tap Quick Actions & Numeric OTP Pad
- Giant **"PASS INSIDE / अंदर भेजें"** button.
- Giant **"EXIT RECORDED / बाहर निकले"** button.
- **Quick OTP Keypad**: Large-target touch keypad (0–9) allowing guards to verify delivery drivers (Amazon, Swiggy, Zomato) or pre-approved visitors by entering their 4-digit code in seconds.

---

## 📱 Three Core User Roles & Interfaces

| Role | Target Device | Key Features |
|---|---|---|
| **1. Visitor Kiosk & Pass** | Tablet at Gate | Purpose selection, Flat selector, Web Camera API photo capture, live Digital Gate Pass, and **📲 SEND WHATSAPP TO RESIDENT** button. |
| **2. Resident Portal** | Resident Mobile | Real-time notification feed, 1-tap **APPROVE** (confetti burst + chime), 1-tap **DENY**, and **SEND PASS** for guests. |
| **3. Security Guard Desk** | Guard Device | Audio-visual high-contrast cards, TTS speech engine (Telugu, Hindi, English), 1-tap entry & exit recording, and **📲 SEND WHATSAPP** dispatch. |
| **4. WhatsApp Quick-Approve** | WhatsApp Mobile Link | Standalone route (`/#/quick-approve?id=...&action=...`) enabling instant 1-tap resident approvals directly from WhatsApp. |
| **5. Society Admin Panel** | Management Console | Configure blocks, flats directory, floors, guards, society identity, and export logs to JSON. |

---

## 📲 100% Free WhatsApp Deep Link Approval Flow (`wa.me`)

No expensive third-party WhatsApp Business API required! GateKeeper AI generates direct WhatsApp Web Deep Links (`https://wa.me/`):

1. **Automatic Directory Phone Lookup**: When a visitor registers for Flat `A-101`, the system retrieves the resident's phone number mapped in the society directory.
2. **One-Tap Dispatch Button**:
   - The guard or kiosk taps **`📲 SEND WHATSAPP TO RESIDENT`**.
   - Opens `https://wa.me/<RESIDENT_PHONE>?text=<URL_ENCODED_MESSAGE>` in WhatsApp.
3. **Pre-Formatted WhatsApp Text**:
```
🚪 *GATEKEEPER VISIT ALERT*
*Flat:* A-101
*Visitor:* Ramesh Kumar (Amazon Delivery)
*Phone:* 9876543210
*Vehicle:* TS 09 AB 4589
---------------------------------------------------
Please tap one of the links below to decide:

✅ *APPROVE ENTRY:*
https://<domain>/#/quick-approve?id=vis_123&action=APPROVED

❌ *DENY ENTRY:*
https://<domain>/#/quick-approve?id=vis_123&action=DENIED
---------------------------------------------------
_GateKeeper AI • Automated Community Access_
```
4. **Instant Action Route (`/#/quick-approve`)**:
   - When the resident taps either link in WhatsApp, the page instantly updates Firestore/LocalStorage, triggers confetti/chimes, and turns the Gate Kiosk/Guard screen **GREEN** with voice announcement in real time!

---

## 🔄 Dual-Engine Synchronization

GateKeeper AI operates in two modes:

1. **Firebase Firestore Cloud Mode**:
   - Multi-device real-time sync across distant phones, tablets, and computers using Firestore `onSnapshot`.
   - Configurable via `.env` or in-app via the **Cloud Sync Settings** modal (`⚙️`).
2. **Offline LocalStorage + `BroadcastChannel` Mode**:
   - Zero setup required out of the box!
   - Instant real-time multi-tab and multi-window sync across different browser windows via `BroadcastChannel('gatekeeper_sync_channel')`.

---

## 🗄️ Database Schema (`visitors` Collection)

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier (e.g., `vis_1739...`) |
| `visitorName` | `string` | Full name of the visitor |
| `phone` | `string` | Contact phone number |
| `flatNumber` | `string` | Destination flat (e.g., `A-101`, `B-204`) |
| `purpose` | `string` | `'delivery' \| 'guest' \| 'service' \| 'maintenance'` |
| `purposeLabel` | `string` | Human-readable label (e.g., `Amazon Delivery`) |
| `vehicleNumber`| `string` | Optional license plate (e.g., `MH 12 AB 4589`) |
| `photoUrl` | `string` | Base64 data URL or storage image link |
| `status` | `string` | `'PENDING' \| 'APPROVED' \| 'DENIED' \| 'INSIDE' \| 'EXITED'` |
| `timestamp` | `string` | ISO timestamp of arrival |
| `otp` | `string` | 4-digit verification passcode |
| `deniedReason` | `string` | Reason if status is `DENIED` |
| `notes` | `string` | Optional notes |

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

> **💡 Multi-Device / Multi-Tab Testing Tip:**
> Open two browser windows side-by-side:
> - **Window 1**: Select **Kiosk** or **Resident App**.
> - **Window 2**: Select **Guard Dashboard**.
> Submit a visitor in Window 1 and watch Window 2 instantly announce the arrival with audio and visual cues!

### 3. Build for Production
```bash
npm run build
```
Creates an optimized static bundle in `/dist` with asset paths configured for GitHub Pages (`base: './'`).

---

## 🌐 GitHub Pages Deployment

This repository includes a pre-configured GitHub Actions workflow in `.github/workflows/deploy.yml`.

### One-Click GitHub Pages Setup:
1. Push your repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: GateKeeper AI"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```
2. In your GitHub repository:
   - Go to **Settings** $\rightarrow$ **Pages**.
   - Under **Build and deployment** $\rightarrow$ **Source**, choose **GitHub Actions**.
3. Every push to `main` will automatically build and publish the application to `https://<your-username>.github.io/<repo-name>/`.

---

## 🔑 Firebase Configuration (Optional)

Create a `.env` file based on `.env.example`:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```
*(Or simply open the in-app Settings modal `⚙️` to enter credentials without rebuilding!)*

---

## 🧪 Quality & Verification
- **ES Modules & Strict React 18**: Verified 0 bundling errors.
- **E2E Lifecycle Test Suite**: Run `node test-suite.js` to verify all 6 state transitions and OTP verification.
- **Static Asset Verification**: Run `node verify.js` to verify static file generation and relative path integrity.
