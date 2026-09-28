# 📡 OneHelp — Connectivity & Mesh Module

> **Assigned Lead:** Aman  
> **Repository:** [OneHelp](https://github.com/lokeshdokwa/OneHelp)

This folder contains low-level offline communication protocols, Bluetooth Low Energy (BLE) Mesh networking, WiFi-Direct, and compressed SMS fallback engines.

---

## 🎯 Scope & Responsibilities
1. **BLE Mesh Ad-Hoc Network:**
   - Multi-hop SOS packet forwarding without cellular or internet.
   - Low-power advertising and background scanning.
   - De-duplication via unique packet IDs and TTL (Time-To-Live) decrements.
2. **WiFi-Direct / Multipeer Bridge:**
   - High-bandwidth P2P sharing of photo/audio evidence between victims and rescue teams within 100 meters.
3. **Compressed SMS Fallback:**
   - Base64 / binary bit-packing of GPS coordinates + Emergency Type + Blood Group into a single 140-character SMS payload.
4. **Satellite Bridge / LoRa (Optional SIH Innovation):**
   - Protocol definitions for external hardware dongles or LoRa transceivers.

---

## 📁 Recommended Structure
```
connectivity/
├── ble_mesh/
│   ├── packet_spec.md       # Binary packet structure (Header, UUID, TTL, Payload)
│   ├── advertiser.ts        # BLE advertisement broadcaster
│   └── scanner.ts           # Background BLE receiver & forwarder
├── wifi_direct/             # High-bandwidth peer-to-peer evidence transfer
├── sms_encoder/             # Compact SMS payload builder & parser
└── README.md
```

---

## ⚡ Git Workflow for Connectivity
1. Branch from `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feat/conn-<feature-name>
   ```
2. Test protocol parsing and TTL bounds.
3. Commit with: `feat(conn): implement 16-byte compressed SOS payload encoder`
4. Open PR to `develop`.
