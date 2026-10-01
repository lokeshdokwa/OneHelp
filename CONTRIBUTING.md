# 🤝 OneHelp — Team Git & Version Control Guidelines

> **Smart India Hackathon 2026** | Emergency Offline-First Response Platform  
> **Repository Owner & Version Control Lead:** @lokeshdokwa  
> Ye document humari 4-member team ke liye official Git & Collaboration Handbook hai. Sabhi members ko ye workflow follow karna mandatory hai taaki code overwrite na ho, merge conflicts na aayein aur demo day par humara code 100% stable rahe.

---

## 👥 1. Team Structure & Module Ownership

Monorepo architecture follow kar rahe hain. Har member apne designated module ka owner hai:

| Member | Role | Assigned Directory | Responsibilities |
| :--- | :--- | :--- | :--- |
| **Abhishek** | Frontend Lead | `frontend/` | React Native (Expo) UI, Screens, Navigation, Audio/Camera sensors |
| **Meezab** | Backend Lead | `backend/` | API Server, Relay endpoints, Cloud sync, Webhooks |
| **Ashish** | AI / ML Lead | `ai/` | On-device ML models, Voice stress analysis, Gunshot/scream audio detection |
| **Aman** | Connectivity Lead | `connectivity/` | BLE Mesh network, WiFi-Direct, SMS Fallback, Satellite bridges |
| **Lokesh** | Repo & DevOps Lead | `*` / Architecture | Version Control, Branch protection, PR Reviews, CI/CD & Merges |

> ⚠️ **Golden Rule:** Kisi doosre member ke folder (`frontend/`, `backend/`, etc.) me direct changes tabhi karein jab unse pehle discuss ho gaya ho.

---

## 🌿 2. Branching Strategy

Hum **GitHub Flow + Integration Branch (`develop`)** model use karenge.

```
       [feat/frontend-login]  ───┐ (PR + Review)
                                  ▼
main ◄─────── develop ◄─────── [develop updated]
 (Stable)   (Daily Work)          ▲
                                  │ (PR + Review)
       [feat/connectivity-ble] ───┘
```

### 📌 Branch Types:
1. **`main` (Production / Stable Release):**
   - Sirf 100% tested aur stable code yahan hota hai.
   - **KOI BHI MEMBER IS PAR DIRECT PUSH NAHI KAREGA.** (Branch protected hai).
   - Sirf `develop` se PR ke through merge hoga (Final Hackathon Demo ke waqt).

2. **`develop` (Active Development Hub):**
   - Humara daily base branch.
   - Sabhi feature branches `develop` se niklengi aur `develop` me hi merge hongi.
   - Ye branch hamesha working state me honi chahiye.

3. **Feature Branches (`feat/...`):**
   - Har naya task ya screen nayi feature branch me banega.
   - Naming convention:
     - Frontend: `feat/frontend-<task-name>` (e.g. `feat/frontend-sos-button`)
     - Backend: `feat/backend-<task-name>` (e.g. `feat/backend-auth-jwt`)
     - AI / ML: `feat/ai-<task-name>` (e.g. `feat/ai-voice-stress`)
     - Connectivity: `feat/conn-<task-name>` (e.g. `feat/conn-ble-advertiser`)

4. **Bugfix Branches (`fix/...`):**
   - Bug fix ke liye: `fix/<module>-<bug-name>` (e.g. `fix/frontend-map-crash`)

---

## 🚀 3. Daily Step-by-Step Workflow (Roz Ka Kaam Kaise Karein)

Har developer ko apna kaam start karne se lekar merge karne tak ye 7 steps follow karne hain:

### Step 1: Latest Code Pull Karo (Start of Day / Task)
Hamesha kaam shuru karne se pehle `develop` branch ko update karo:
```bash
git checkout develop
git pull origin develop
```

### Step 2: Nayi Feature Branch Banao
Apne feature ke liye fresh branch banao:
```bash
git checkout -b feat/frontend-emergency-screen
```

### Step 3: Apne Folder me Code Likho & Test Karo
- Apne assigned folder (`frontend/`, `backend/`, etc.) me kaam karo.
- Frontend developers TypeScript typecheck zaroor run karein:
  ```bash
  cd frontend
  npx tsc --noEmit
  ```

### Step 4: Meaningful Commit Karo
Hamesha clear commit message likho (details neeche Section 4 me hai):
```bash
git add .
git commit -m "feat(frontend): add emergency countdown animation and sound"
```

### Step 5: Push Karne se Pehle Develop se Sync Karo
Agar aapke kaam karte waqt kisi aur ne `develop` me code merge kar diya hai, toh pehle use apne branch me merge karke verify karo:
```bash
git checkout develop
git pull origin develop
git checkout feat/frontend-emergency-screen
git merge develop
```
*(Agar koi conflict aaye, toh use fix karein — Section 6 dekhein).*

### Step 6: Apni Branch GitHub par Push Karo
```bash
git push -u origin feat/frontend-emergency-screen
```

### Step 7: GitHub par Pull Request (PR) Banao
1. GitHub repo par jao: https://github.com/lokeshdokwa/OneHelp
2. **"Compare & pull request"** button par click karo.
3. **Base branch:** `develop` select karo (NOT `main`).
4. PR template fill karo:
   - What changed?
   - How was it tested?
   - Attach screenshots/screen recording (Frontend UI ke liye).
5. Reviewer me **@lokeshdokwa** ya relevant team member ko add karo.
6. Approval milne aur CI pass hone ke baad PR **"Squash and Merge"** hogi.
7. Merge hone ke baad local branch delete kar lo:
   ```bash
   git checkout develop
   git pull origin develop
   git branch -d feat/frontend-emergency-screen
   ```

---

## 💬 4. Commit Message Standard (Conventional Commits)

Messy commit messages jaise `"fix"`, `"update"`, `"asdf"`, `"done"` strictly **BANNED** hain.  
Hamesha standard format use karo:

```
<type>(<scope>): <short description in present tense>
```

### Types:
- `feat`: Naya feature ya UI component (e.g. `feat(frontend): add offline survival guides tab`)
- `fix`: Bug fix (e.g. `fix(connectivity): handle bluetooth disabled state gracefully`)
- `refactor`: Code reorganize karna bina behavior badle (e.g. `refactor(backend): modularize auth middleware`)
- `docs`: Documentation ya README update (e.g. `docs: add BLE protocol specs`)
- `style`: Formatting, missing semi-colons (no code logic change)
- `test`: Tests add karna ya update karna
- `chore`: Build scripts, packages, config changes (e.g. `chore(frontend): update expo dependencies`)

---

## ⚔️ 5. Merge Conflicts Kaise Handle Karein (Bina Ghabraye)

Merge conflict tab aata hai jab do log ek hi file ki same line ko modify kar dete hain.

### Simple 4-Step Resolution:
1. **Develop pull karo aur apni branch me merge karo:**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout your-feature-branch
   git merge develop
   ```
2. **VS Code / IDE me Conflict dekhein:**
   VS Code aapko conflict dikhayega:
   - `<<<<<<< HEAD` (Aapka change)
   - `=======`
   - `>>>>>>> develop` (Dusre teammate ka change)
3. **Sahi code select karo:**
   VS Code ke buttons use karo:
   - `Accept Current Change` (apna rakhna hai)
   - `Accept Incoming Change` (develop ka rakhna hai)
   - `Accept Both Changes` (dono chahiye)
   - Ya dono ko manually merge karke clean karo.
4. **Test karke commit karo:**
   ```bash
   git add <resolved-file>
   git commit -m "fix(merge): resolve conflict with develop"
   git push origin your-feature-branch
   ```

---

## 🛡️ 6. Golden Rules (Sabhi Members ke liye Must)

1. ❌ **Never push directly to `main` or `develop`.** Hamesha PR ke through aao.
2. ❌ **Never use `git push --force`** on `main` or `develop`. Isse teammates ka kaam delete ho sakta hai.
3. ❌ **Never commit sensitive files.** API keys, passwords, Firebase service keys, `.env` files kabhi git me mat daalo. (Use `.env.example`).
4. ❌ **Never commit `node_modules/` or build folders.** Check `.gitignore` before committing.
5. ✅ **Always run tests / typecheck locally** before creating a PR (`npx tsc --noEmit`).
6. ✅ **Communicate with teammates** jab bhi shared files (jaise API contracts, shared constants ya types) badal rahe ho.

---

## ⚡ 7. Quick Git Cheat Sheet

| Action | Command |
| :--- | :--- |
| Check current branch & status | `git status` |
| Switch to develop & pull | `git checkout develop && git pull origin develop` |
| Create new feature branch | `git checkout -b feat/<name>` |
| View changes before committing | `git diff` |
| Stage all changes | `git add .` |
| Commit with message | `git commit -m "feat(module): description"` |
| Push feature branch to GitHub | `git push -u origin feat/<name>` |
| Stash temporary unfinished work | `git stash` |
| Re-apply stashed work | `git stash pop` |
| Discard uncommitted changes | `git restore .` |
| Delete local branch after merge | `git branch -d feat/<name>` |
