# OneHelp - Offline-First Emergency Response Mobile App
## Implementation Plan & Definition of Done Tracker

### Phase 1: Foundation and Core SOS
- [x] 1. Project setup (Expo Dev Client, TS strict mode, dependencies, themes, atomic components, navigation, i18n EN+HI, permission rationale)
- [x] 2. Local SQLite database (schema for contacts, medical profile, settings, SOS log, offline queue, hazards, evidence files)
- [x] 3. Home Screen (large SOS button with 3s hold countdown ring & cancel, live connectivity badge [Online / SMS-only / Offline], last known location, quick actions)
- [x] 4. Trusted Contacts (full CRUD persisted in SQLite, emergency relationship/priority)
- [x] 5. Medical Profile (name, age, blood group, allergies, conditions, notes, emergency contact info, persisted in SQLite)
- [x] 6. SOS Engine (`src/services/sos.ts`: fallback chain Internet [API] -> SMS [contacts + Google Maps link] -> BLE relay -> local queue retry. SOS Active Screen with live step progress)
- [x] 7. GPS location provider with graceful permission handling & last-known-location fallback
- [x] 8. Shake to SOS (accelerometer sensor, toggle in settings, adjustable sensitivity)
- [x] 9. Duress PIN (normal PIN cancels SOS, duress PIN triggers fake "SOS Cancelled" UI while emergency silently broadcasts)
- [x] 10. Offline Guides (searchable bundled disaster & first aid guides: earthquake, flood, fire, cardiac arrest, CPR, bleeding, choking, snake bite, heatstroke, road accident, drowning, lightning)
- [x] 11. Emergency Helplines Directory (112, 100, 101, 102, 108, 1091, 1098, 1930, etc.) with tap-to-call
- [x] 12. Settings Screen (duress PIN, language, Senior Mode [high contrast, enlarged font, simplified layout], theme, detector toggles)

### Phase 2: Safety Tools
- [x] 13. Fake Call (realistic incoming call screen, custom caller name/number, delay timer, ringtone/vibration)
- [x] 14. Siren Alarm (loud multi-frequency alarm toggle with max volume override where allowed)
- [x] 15. Morse SOS (camera flashlight strobe and full-screen flashing high-intensity SOS pattern `... --- ...`)
- [x] 16. Voice SOS (continuous keyword listening for "help", "bachao", "SOS" in English/Hindi triggering SOS countdown)
- [x] 17. Audio Evidence (auto-record during active SOS, encrypted local storage, in-app playback and sharing)
- [x] 18. Low-Bandwidth Emergency Chat (peer-to-peer / SMS / relay text chat with queued offline resilience)

### Phase 3: Offline Maps and Hazards
- [x] 19. MapLibre / Offline Map viewer (interactive map, current location marker, offline region tile management & caching)
- [x] 20. Crowdsourced Hazard Reporting (hazard type, photo, geo-location, local storage, map geofence overlays, local geofence alert notification)
- [x] 21. Live Responder Tracking Screen (service polling API + realistic local simulator moving responder marker towards victim)

### Phase 4: Mesh and AI
- [x] 22. Bluetooth Mesh / P2P Relay (BLE advertising & scanning, SOS packet propagation with TTL & duplicate check, nearby node count & relayed alert history)
- [x] 23. Voice-Stress Detection (real-time microphone audio amplitude/pitch variance monitoring with adjustable sensitivity and auto-SOS countdown)
- [x] 24. Gunshot / Glass-Break Acoustic Detection (sound impulse spike & high-frequency acoustic analysis with cancel window and test trigger mode)
- [x] 25. Lost-Child Face Matching (register missing child photo, scan camera/gallery, compute face embedding similarity metric with match score offline)
- [x] 26. Sign-Language / Silent Video Relay (in-app quick video recording, attachment to SOS packet, offline queue)
- [x] 27. Ambulance Green Corridor (destination routing, generate critical transit alert payload, broadcast via BLE + API)
- [x] 28. Encrypted Medical Dossier (AES/SecureStore encryption, PIN access gate, offline emergency QR code generator & camera scanner)
- [x] 29. Satellite Bridge / Compact Emergency Bulletin (<160 char dense payload encoder/decoder ready for SMS or satellite modems)

### Phase 5: Polish & Handoff
- [x] 30. Developer Test Panel (integrated into Settings to test shake, gunshot, offline state, BLE packet, voice stress, etc.)
- [x] 31. Empty, loading & error states on every screen, accessibility labels, smooth micro-interactions
- [x] 32. Architecture Handoff (`API_CONTRACT.md`, comprehensive `README.md`, zero-error TypeScript validation)
