# 🗄️ OneHelp — Database Module

> **Assigned Lead:** Ashish  
> **Repository:** [OneHelp](https://github.com/lokeshdokwa/OneHelp)

This folder contains database schemas, migrations, seed data, and offline-first storage architecture for OneHelp.

---

## 🎯 Scope & Responsibilities
1. **Local SQLite Schema:** Encrypted local database for storing user medical dossier, emergency contacts, offline maps metadata, and survival guides.
2. **Cloud Database Schema:** PostgreSQL / Supabase / MongoDB schema for disaster incident logs, hazard pins, and responder registries.
3. **Sync Engine Protocol:** Rules and algorithms for conflict-free synchronization (Last-Write-Wins or CRDTs) when device reconnects.
4. **Seed Datasets:** Pre-bundled Indian emergency helpline directory, state disaster management contacts, and first-aid survival guides.

---

## 📁 Recommended Structure
```
database/
├── schemas/
│   ├── local_sqlite.sql     # SQLite table definitions for mobile app
│   └── cloud_postgres.sql   # Cloud tables for backend server
├── migrations/              # Versioned SQL migrations (e.g. 001_init.sql)
├── seeds/                   # Seed JSON/SQL (helplines, emergency guides)
│   ├── helplines_india.json
│   └── survival_guides.json
└── README.md
```

---

## ⚡ Git Workflow for Database
1. Branch from `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feat/db-<migration-name>
   ```
2. Ensure backward compatibility of schema changes.
3. Commit with: `feat(db): add encrypted medical dossier table schema`
4. Open PR to `develop`.
