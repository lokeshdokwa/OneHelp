# 🖥️ OneHelp — Backend Module

> **Assigned Lead:** Meehan  
> **Repository:** [OneHelp](https://github.com/lokeshdokwa/OneHelp)

This folder contains the backend server, API gateway, emergency services dispatch integrations, and cloud sync services.

---

## 🎯 Scope & Responsibilities
1. **Emergency Relay API:** Ingest distress signals when cellular/internet is restored.
2. **First Responder Dashboard:** WebSocket / REST endpoints for ambulance and police coordinates.
3. **SMS Gateway:** Twilio / Gupshup / Fast2SMS webhook integration for sending SMS alerts to emergency contacts.
4. **Offline Sync Endpoint:** Delta-sync for hazard zones, road closures, and shelter availability.

---

## 📁 Recommended Structure
```
backend/
├── src/
│   ├── controllers/      # Route controllers (SOS, Auth, Sync, Hazards)
│   ├── services/         # SMS service, Geofencing, Push notifications
│   ├── routes/           # Express/FastAPI route definitions
│   ├── models/           # Data models matching database schema
│   └── app.js (or .py)   # Server entry point
├── tests/                # API endpoint tests
├── .env.example          # Environment variable template (PORT, DB_URL, API_KEYS)
├── package.json          # Or requirements.txt / go.mod
└── README.md
```

---

## ⚡ Git Workflow for Backend
1. Branch from `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feat/backend-<feature-name>
   ```
2. Commit with conventional commit messages: `feat(backend): implement SOS webhook handler`
3. Test locally and open a PR targeting `develop`.
