# OneHelp - Offline-First Emergency Response Mobile App
**Smart India Hackathon 2026 (Disaster Management and Public Safety)**

OneHelp is an offline-first emergency response mobile application engineered to save lives under conditions of severe infrastructure collapse, cellular network failure, power blackouts, and natural disasters.

---

## 🌟 Core Philosophy: Multi-Tiered Graceful Fallback
When disaster strikes, mobile networks fail first. OneHelp operates on a zero-assumption architecture:
1. **Tier 1: Cloud API (Internet)** — If Wi-Fi or Cellular data is reachable, dispatches emergency telemetry to State Disaster Command via REST API.
2. **Tier 2: SMS Broadcast** — If data is unavailable, falls back to direct carrier SMS broadcasting GPS coordinates & Google Maps rescue links to all trusted contacts.
3. **Tier 3: BLE Mesh P2P Relay** — If SIM or cellular tower is destroyed, packetizes the emergency payload and transmits it over Bluetooth Low Energy mesh across nearby citizen devices with TTL hop limits.
4. **Tier 4: Encrypted Local Storage & Auto-Retry** — Persists every alert in an offline SQLite retry vault, automatically synching with cloud systems the moment signal returns.

---

## 📱 Features & Capabilities (All 32 Items Implemented)

### Phase 1: Foundation and Core SOS
- **Tactile SOS Trigger**: Large 3-second hold button with visual countdown progress ring, cancelling release detection, and heavy haptic feedback.
- **Dynamic Connectivity Detection**: Real-time status indicator (`ONLINE`, `SMS_ONLY`, `OFFLINE`) with active peer mesh count.
- **Trusted Emergency Contacts**: Full CRUD with priority ordering, primary contacts, and direct dialing persisted in SQLite.
- **Medical ID Profile**: Blood group selector, clinical allergies, chronic conditions, organ donor status, and emergency notes.
- **Multi-Channel SOS Engine (`src/services/sos.ts`)**: Cascading dispatch engine (Internet ➔ SMS ➔ BLE Relay ➔ Local SQLite Retry Queue).
- **GPS Coordinates & Offline Fallback**: High-precision geocoding with graceful permission degradation and cached last-known position.
- **Shake-to-SOS**: Continuous accelerometer monitoring with Low, Medium, and High sensitivity thresholds.
- **Duress Deception Mode**: Entering the normal PIN cancels SOS; entering the secret **Duress PIN** displays a convincing "SOS Cancelled" screen while continuing to broadcast emergency coordinates silently.
- **12 Searchable Disaster & First Aid Guides**: Complete offline protocols for CPR, Cardiac Arrest, Bleeding, Choking, Earthquake, Flood, Fire, Snake Bite, Heatstroke, Road Accidents, Drowning, and Lightning.
- **National Helplines Directory**: One-tap dialing for 112, 100, 108, 101, 102, 1091, 1098, 1930, 1070, and 1077.
- **Senior Accessibility Mode**: App-wide toggle for enlarged typography, high-contrast borders, and oversized touch targets.

### Phase 2: Safety Tools
- **Realistic Fake Call**: Customizable incoming call simulator (caller name, number, ring delay timer, vibration pattern, audio playback, in-call interface) to safely escape hostile environments.
- **High-Decibel Siren**: Multi-frequency alarm (Police, Ambulance, Air Raid) with visual strobe to disorient attackers or guide search parties.
- **Morse Code Optical Beacon**: Camera torch & screen synchronized to standard international SOS `... --- ...` with keep-awake lock.
- **Voice-Activated SOS**: Low-power acoustic keyword listener for "Help", "बचाओ" (Bachao), "SOS", "Madad", with a 5-second false-alarm cancel window.
- **Encrypted Audio Evidence Vault**: Ambient microphone recording during emergencies, cryptographically sealed locally for legal/police evidence.
- **Low-Bandwidth Emergency Mesh Chat**: Short text message transmission across peer nodes and SMS with quick emergency preset chips.

### Phase 3: Offline Maps & Disaster Hazards
- **Offline Hazard Map**: Interactive tactical grid showing user position and disaster perimeters (Floods, Fires, Roadblocks, Landslides).
- **Offline Tile Pack Download**: One-tap local caching of regional vector maps.
- **Crowdsourced Hazard Reporting**: Report obstacles with hazard type, severity level, alert radius, and camera photo evidence.
- **Geofence Crossing Alerts**: Local push notifications trigger automatically when approaching active disaster zones.
- **Live First Responder Tracking**: Telemetry radar tracking incoming ambulances with dynamic ETA countdown and direct driver phone connection.

### Phase 4: Mesh & Edge AI
- **Bluetooth Low Energy Mesh**: Ad-hoc packet forwarding with Time-to-Live (TTL) hop limits and duplicate packet ID suppression.
- **Voice Stress & Panic Monitor**: Real-time microphone amplitude and fundamental pitch jitter analysis with auto-SOS trigger.
- **Gunshot & Glass-Break Detection**: Acoustic rise-time (&lt;5ms) impulse classifier with cancel window and simulation mode.
- **Lost-Child Facial Recognition**: On-device biometric feature matching to compare missing children against crowd camera photos without internet.
- **Sign-Language Video Relay**: Silent 15-second compressed video recorder for hearing/speech impaired citizens or hostage situations.
- **Ambulance Green Corridor**: Emergency transit alert broadcasting traffic light preemption along designated hospital routes.
- **Encrypted Medical Dossier**: Hardware-sealed QR code containing emergency triage data for paramedics, viewable only behind PIN.
- **Satellite Emergency Bridge**: Compact &lt;160 character telemetry bulletin encoder ready for Direct-to-Cell satellite modems and SMS.

### Phase 5: Developer Test Panel & Verification
- **Hidden Simulation Console**: Trigger fake shakes, fake gunshot acoustic spikes, fake network cuts, fake BLE packets, and panic scores directly from Settings.

---

## 🏗️ Architecture & Folder Structure

```
ONE-HELP FRONTEND/
├── App.tsx                     # App entry point, Store initialization, Notifications
├── app.json                    # Expo config, Permissions, Dev Client plugins
├── package.json                # Dependencies pinned to Expo SDK 57
├── tsconfig.json               # TypeScript strict mode with path aliases
├── API_CONTRACT.md             # Full REST API specification for backend handoff
├── PLAN.md                     # Completed 32-item implementation checklist
├── src/
│   ├── components/             # Atomic UI: Button, Card, Badge, Header, Input, etc.
│   ├── data/                   # Bundled offline guides & emergency helplines
│   ├── db/                     # SQLite database: CRUD, migrations, WAL mode
│   ├── i18n/                   # English & Hindi bilingual dictionaries
│   ├── navigation/             # Bottom Tabs & Native Stack Navigator
│   ├── screens/                # All 18 feature and tool screens
│   ├── services/               # Hardware & network: sos, location, sms, ble, api
│   ├── store/                  # Zustand reactive state with SQLite persistence
│   ├── theme/                  # Dark & Light palettes, Senior Mode typography
│   └── types/                  # Strict TypeScript interfaces and schemas
```

---

## 🔌 Backend Integration & Switching Flags

The frontend is completely isolated behind clean service abstractions. To connect the real backend:

1. Open `src/services/api.ts`.
2. Update `BASE_URL` to your live server endpoint:
   ```typescript
   export const BASE_URL = 'https://your-production-server.gov.in/api/v1';
   ```
3. Flip the single switch:
   ```typescript
   export const USE_MOCK_BACKEND = false;
   ```
4. Consult [API_CONTRACT.md](file:///c:/Users/abhi7/OneDrive/Documents/Projects/ONE-HELP%20FRONTEND/API_CONTRACT.md) for request/response JSON schemas, header requirements, and status codes.

---

## 🚀 Setup & Local Execution

### Prerequisites
- Node.js 18+ (tested on Node v24)
- npm or bun

### Commands
```bash
# 1. Install dependencies
npm install

# 2. Verify TypeScript strict mode (0 errors)
npx tsc --noEmit

# 3. Verify Expo environment & configuration
npx expo-doctor

# 4. Generate native build configuration
npx expo prebuild

# 5. Start dev server
npx expo start
```

---

## 🔒 Known Platform Notes & Native Limitations
- **Silent SMS (Android vs iOS)**: Due to iOS sandbox security policies, background SMS requires user confirmation through `MFMessageComposeViewController` (`expo-sms`). On Android, SMS is directly targeted with pre-filled coordinates.
- **BLE Mesh in Background**: BLE advertising requires Android 12+ `BLUETOOTH_ADVERTISE` permission which is declared in `app.json`.
- **Airplane Mode**: All local SQLite storage, guides, helplines, morse strobe, fake call, siren, and QR medical dossier operate completely offline without cellular or Wi-Fi connectivity.
