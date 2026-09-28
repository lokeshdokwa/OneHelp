# 🛡️ OneHelp — Offline-First Emergency Response Platform

[![CI Status](https://github.com/lokeshdokwa/OneHelp/actions/workflows/ci.yml/badge.svg)](https://github.com/lokeshdokwa/OneHelp/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React Native](https://img.shields.io/badge/React_Native-0.86-61DAFB?logo=react&logoColor=black)](https://reactnative.dev)
[![Expo](https://img.shields.io/badge/Expo-~57.0-000020?logo=expo&logoColor=white)](https://expo.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![SIH 2026](https://img.shields.io/badge/Smart_India_Hackathon-2026-orange)](https://www.sih.gov.in)

> **OneHelp** is an offline-first, zero-network emergency response and disaster mitigation mobile platform built for **Smart India Hackathon 2026**.  
> Designed to ensure communication, tracking, triaging, and distress signalling continue uninterrupted even when cellular towers and power grids fail.

---

## 🏗️ Architecture & Monorepo Structure

OneHelp follows a modular monorepo architecture separating concerns cleanly across 4 core domains:

```
OneHelp/
├── .github/                   # Workflows, Issue & PR templates, CODEOWNERS
│   ├── ISSUE_TEMPLATE/        # Bug report, Feature request, Task cards
│   ├── workflows/ci.yml       # Automated CI typecheck & lint
│   ├── CODEOWNERS             # Reviewer assignment per module
│   └── pull_request_template.md
├── frontend/                  # React Native (Expo) Mobile Application
│   ├── src/screens/           # SOS, Guides, Maps, Mesh, Helplines
│   ├── src/components/        # Reusable UI & Sensor triggers
│   ├── src/services/          # Local business logic & stores
│   └── package.json           # Frontend dependencies
├── backend/                   # Emergency Cloud Relay & Dispatch Server
│   ├── src/                   # REST/WebSocket APIs, SMS gateway bridges
│   └── README.md              # Backend setup and documentation
├── database/                  # SQLite & Offline Storage Schemas
│   ├── schemas/               # Tables, Indexes, and Relational models
│   ├── migrations/            # Versioned migration scripts
│   └── README.md              # Database documentation
├── connectivity/              # Low-level Offline Protocol Modules
│   ├── ble_mesh/              # Bluetooth Low Energy multi-hop routing
│   ├── wifi_direct/           # P2P High-bandwidth file/evidence sharing
│   ├── sms_bridge/            # Compressed SMS fallback encoder
│   └── README.md              # Connectivity specifications
├── CONTRIBUTING.md            # Team Git workflow, PR rules & cheat sheet
└── README.md                  # Project root documentation
```

---

## 👥 Team & Domain Ownership

| Domain | Assigned Lead | Folder | Key Focus Areas |
| :--- | :--- | :--- | :--- |
| **Frontend** | **Abhishek** | [`frontend/`](./frontend) | Emergency UI/UX, Shake/Volume SOS triggers, Siren, Maps, Fast interaction |
| **Backend** | **Meezab** | [`backend/`](./backend) | Cloud fallback API, WebSocket dispatch board, First-responder relay |
| **Database** | **Ashish** | [`database/`](./database) | Offline SQLite, Encrypted Medical Dossiers, Fast helpline queries |
| **Connectivity** | **Aman** | [`connectivity/`](./connectivity) | BLE Mesh ad-hoc routing, WiFi-Direct P2P, Compressed SMS payloads |
| **Repo & DevOps** | **Lokesh** | Root / All | Git Flow, Branch Protection, CI/CD, Merges, Code Reviews |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v20 or higher
- **npm**: v10 or higher
- **Expo Go App**: Installed on physical Android or iOS device (recommended for testing sensors)

### 1. Clone the Repository
```bash
git clone https://github.com/lokeshdokwa/OneHelp.git
cd OneHelp
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm start
```
- Press `a` in the terminal for Android Emulator or scan the QR code with **Expo Go**.

### 3. Type Checking
```bash
cd frontend
npx tsc --noEmit
```

---

## 🌿 Git & Collaboration Workflow

We strictly follow a structured Git Workflow to ensure stability and seamless teamwork:

- **`main`**: Production & Final Hackathon Demo branch (Protected, never push directly).
- **`develop`**: Daily integration branch. All feature branches merge here via Pull Request.
- **`feat/<module>-<task>`**: Individual feature branches.

👉 **MANDATORY READING:** Every team member must read the complete workflow in [CONTRIBUTING.md](./CONTRIBUTING.md) before pushing code!

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
