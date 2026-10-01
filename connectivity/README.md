# Emergency Communication and Connectivity Fallback Layer

## Overview
This module implements the **Emergency Communication & Connectivity Fallback Layer** for OneHelp.
It manages distress message delivery across 4 fallback channels:

$$\text{Internet (REST HTTP)} \longrightarrow \text{SMS / Cellular} \longrightarrow \text{Bluetooth P2P Mesh Relay} \longrightarrow \text{Local Storage Queue}$$

---

## 🏗️ Architecture Components

- `src/services/emergencyPacket.js`: Standardized Emergency Packet data model, states (`PENDING`, `SENDING`, `DELIVERED`, `RELAYED`, `QUEUED`, `FAILED`), and duplicate hash generator.
- `src/services/connectivityDetector.js`: Real-time detector for Internet (`navigator.onLine`), SMS availability, Bluetooth support, and peer count; provides state subscription callbacks.
- `src/services/transports/httpTransport.js`: Primary Internet REST API transport (`/v1/sos/dispatch`).
- `src/services/transports/smsTransport.js`: Cellular SMS fallback transport using trusted family contacts (`Rajesh Sharma`, `112 ERSS`).
- `src/services/transports/bleTransport.js`: Bluetooth P2P Relay transport with **Duplicate Packet Protection** (`seenMessageIds` deduplication cache) and hop count limit tracking.
- `src/services/offlineQueue.js`: Persistent local storage queue manager (`localStorage`/IndexedDB) with SQLite schema contract.
- `src/services/communicationManager.js`: Central controller managing the fallback decision hierarchy and automatic queue retry loop upon network reconnection.
- `src/services/__tests__/communicationManager.test.js`: Automated 8-test unit test suite.
- `src/services/__tests__/runTests.js`: CLI test runner.

---

## 🧪 How to Run Automated Unit Tests

Inside the `connectivity` folder or project root:
```bash
node src/services/__tests__/runTests.js
```

All 8 tests verify:
1. Internet available → HTTP Transport (`DELIVERED`)
2. Internet unavailable + SMS available → SMS Transport (`DELIVERED`)
3. Internet/SMS unavailable + Bluetooth available → Bluetooth P2P Relay (`RELAYED`)
4. All channels unavailable → Enqueues to Local Storage Queue (`QUEUED`)
5. Connectivity restoration → Automatically retries & drains queued distress alerts
6. Duplicate packet rejection → Prevents infinite relay loops across mesh nodes

---

## 📱 How to Run Interactive Phone Preview

```bash
npm install
npm run dev
```

Open `http://<your-local-ip>:3000` on your mobile phone browser to test real-time fallback channel switching (`ONLINE`, `SMS ONLY`, `MESH`, `OFFLINE`).
