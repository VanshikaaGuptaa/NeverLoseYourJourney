# Never Lose Your Journey

## Overview

**Never Lose Your Journey** (aka *Citizen Journey Resilience Layer*) is a hackathon‑style prototype that demonstrates how a high‑stakes government service can survive authentication expirations, network failures, page refreshes, and other common disruptions while preserving the citizen’s progress.

The application implements a realistic multi‑step citizen service portal (Personal Details → Address → Identity → Document Upload → Review → Verification → Submit) with:

- **Autosave** (debounced, encrypted local draft + server‑side draft)
- **Session‑independent journey persistence** – the journey has its own durable identifier separate from the auth session.
- **Offline‑first architecture** using IndexedDB and an operation queue.
- **Idempotent submission** with transaction‑id / idempotency‑key handling.
- **OTP state machine** with clear UI and delayed‑delivery simulation.
- **Developer control panel** to trigger failures (session expiry, network loss, slow server, etc.).
- **Live resilience dashboard** showing authentication, network, sync status, etc.

The prototype is built with a modern, premium UI (dark‑mode ready, glassmorphism, smooth micro‑animations) while remaining completely functional.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, TypeScript, Vite, React Hook Form, Zustand, TanStack Query, IndexedDB (via `idb`), Tailwind‑like custom CSS |
| Backend | Spring Boot (Java 21), PostgreSQL, Redis (optional for session & queue), Spring Security (mock authentication) |
| DevOps | Docker compose for local development |

---

## Quick Start

```bash
# 1. Clone the repo (if not already in the workspace)
# 2. Backend
cd backend
./mvnw clean install
java -jar target/journey-0.0.1-SNAPSHOT.jar

# 3. Frontend
cd ../frontend
npm install
npm run dev  # Vite dev server at http://localhost:5173
```

The app will open automatically; you can log in with the mock credentials `user@example.com` / `password`.

---

## Demo Script (for hackathon judges)
1. **Normal flow** – fill first three steps, watch autosave indicator.
2. Click **"Expire Session"** in the Control Panel → you are redirected to the login screen. After re‑login, the exact step and data are restored.
3. Click **"Disconnect Network"**, continue editing; the dashboard shows **Offline – saved locally**. Re‑connect and observe automatic sync.
4. Press the browser **Back** button → you return to the previous step with data intact.
5. Click **"Submit"**, then trigger **"Fail Next API"** to simulate a timeout. The UI shows *Checking submission status…* and guarantees no duplicate.
6. Open **OTP** step, click **"Delay OTP"**, then wait – the journey remains safe.

---

## Architecture

See [docs/architecture.md](docs/architecture.md).

---

## License

MIT – feel free to adapt for real government projects.
