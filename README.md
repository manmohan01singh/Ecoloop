# 🔄 Circuvio — Circular Electronics Economy Platform

> **Formerly EcoLoop.** Circuvio is an open-source, full-stack platform that turns dead or unwanted electronics into circular value: repair, refurbish, rehome, or recycle — guided by AI, secured by a tamper-proof device passport, and powered by a community of certified repair professionals.

[![Backend Tests](https://img.shields.io/badge/backend%20e2e-46%2F46%20passing-brightgreen)](#testing)
[![Mobile Tests](https://img.shields.io/badge/mobile%20unit-97%2F97%20passing-brightgreen)](#testing)
[![Rescue Engine Tests](https://img.shields.io/badge/rescue%20engine-15%2F15%20passing-brightgreen)](#testing)
[![TypeScript](https://img.shields.io/badge/TypeScript-0%20errors-blue)](#testing)

---

## Table of Contents

1. [What is Circuvio?](#what-is-circuvio)
2. [Architecture Overview](#architecture-overview)
3. [Tech Stack](#tech-stack)
4. [Feature Status](#feature-status)
5. [Local Development Setup](#local-development-setup)
6. [Environment Variables](#environment-variables)
7. [Running Tests](#running-tests)
8. [Known Issues & Roadmap](#known-issues--roadmap)
9. [Contributing](#contributing)
10. [License](#license)

---

## What is Circuvio?

Circuvio solves the global e-waste crisis at the individual level. Instead of throwing away a broken phone or a dusty laptop, the user:

1. **Scans / registers** the device → a SHA-256 Device Passport is created.
2. **Runs the Rescue Engine** → multi-criteria AI optimizer surfaces the best circular pathway (repair / resell / rehome / recycle).
3. **Gets competitive repair quotes** from certified local providers in under 24 h.
4. **Tracks the full lifecycle** on-chain-style via an immutable evidence ledger.
5. **Earns Circuvio Impact Points** and shares a verifiable Proof of Rescue certificate.

The platform has three sub-products that share one backend:

| Sub-product | Primary audience | Port |
|---|---|---|
| **Mobile / Expo app** (`mobile/`) | End users (citizens, consumers) | 8081 (web bundle) |
| **Web admin / community app** (`src/`) | Admins, moderators, repair pros, businesses | 5173 |
| **REST API backend** (`backend/`) | Both frontends + third-party integrations | 5001 |

---

## Architecture Overview

```
┌────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                            │
│                                                                │
│  ┌──────────────────────────┐  ┌─────────────────────────────┐│
│  │  Mobile App (Expo/RN)    │  │  Web App (React + Vite)     ││
│  │  mobile/  →  :8081       │  │  src/    →  :5173           ││
│  │                          │  │                             ││
│  │  • Home (Apple HIG)      │  │  • Admin Dashboard          ││
│  │  • Rescue Engine         │  │  • Moderator Queue          ││
│  │  • Device Passport       │  │  • Community Posts          ││
│  │  • Community (X-style)   │  │  • Repair Marketplace       ││
│  │  • Explore / Marketplace │  │  • Public Profiles          ││
│  │  • Post Device           │  │  • Role Application         ││
│  └────────────┬─────────────┘  └──────────────┬──────────────┘│
└───────────────┼──────────────────────────────┼────────────────┘
                │  HTTPS / REST (JWT)           │  HTTPS / REST (JWT)
                ▼                              ▼
┌────────────────────────────────────────────────────────────────┐
│                      BACKEND LAYER  :5001                      │
│                                                                │
│  Express.js  →  Routes  →  Controllers  →  Sequelize ORM       │
│                                                                │
│  Auth (JWT + bcrypt)  │  Role RBAC (8 roles)  │  Rate limiting │
│  Multer file uploads  │  Winston logging       │  Helmet CSP    │
│                                                                │
│  ┌──────────────────────┐   ┌────────────────────────────┐    │
│  │  SQLite (dev)        │   │  PostgreSQL (prod target)  │    │
│  │  backend/ecoloop.db  │   │  DATABASE_URL env var      │    │
│  └──────────────────────┘   └────────────────────────────┘    │
│                                                                │
│  ┌──────────────────────┐   ┌────────────────────────────┐    │
│  │  Redis (optional)    │   │  Cloudinary (file uploads) │    │
│  │  REDIS_URL env var   │   │  CLOUDINARY_* env vars     │    │
│  │  ⚠️  not connected   │   │  ⚠️  not wired end-to-end  │    │
│  └──────────────────────┘   └────────────────────────────┘    │
│                                                                │
│  ┌──────────────────────────────────────────────────────┐     │
│  │  Supabase JS client  (real-time & device passport)   │     │
│  │  @supabase/supabase-js  ⚠️  not configured in prod   │     │
│  └──────────────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────────┘
```

**Data flow — happy path:**
```
User opens mobile app
  → AuthModal (JWT login / register)
  → HomeScreen (Apple HIG layout, Dynamic Island beacon)
  → Taps "Rescue Engine" CTA
  → Multi-criteria optimizer scores 5 pathways
  → User selects "Repair" pathway
  → Backend creates RepairTicket
  → Repair providers receive ticket, submit quotes
  → Customer accepts quote (atomic, other quotes voided)
  → Private in-ticket messaging begins (6 s polling)
  → On completion → Device Passport updated → Proof of Rescue issued
```

---

## Tech Stack

### Mobile App (`mobile/`)

| Layer | Technology |
|---|---|
| Framework | React Native 0.86 + Expo SDK 57 |
| Language | TypeScript 6.0 |
| Navigation | Custom tab bar (AppTabBar) |
| State | React `useState` / `useReducer` / local context |
| Storage | `@react-native-async-storage/async-storage` |
| Icons | `@expo/vector-icons` + `lucide-react-native` |
| HTTP | `fetch` (native) |
| Real-time DB | `@supabase/supabase-js` (configured, not live) |
| Image picker | `expo-image-picker` |
| Testing | Node built-in `--test` runner + TSX |

### Web App (`src/`)

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Build tool | Vite 8 |
| Language | JavaScript (JSX) |
| Styling | Tailwind CSS 4 |
| Routing | React Router DOM 7 |
| State | Zustand 5 |
| Charts | Recharts 3 |
| Animations | Framer Motion 13 |
| HTTP | Axios |
| Linter | Oxlint |

### Backend (`backend/`)

| Layer | Technology |
|---|---|
| Runtime | Node.js (ESM modules) |
| Framework | Express 4 |
| ORM | Sequelize 6 |
| Database | SQLite (dev) / PostgreSQL (prod target) |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Validation | express-validator |
| File uploads | Multer + Cloudinary SDK |
| Caching | Redis (configured, not connected) |
| Logging | Winston |
| Security | Helmet, express-rate-limit, CORS |
| AI | @google/generative-ai (Gemini) |
| Testing | Node built-in `--test` runner |

---

## Feature Status

### ✅ Working — Verified with tests

#### Authentication & Role System
- ✅ Secure JWT email/password auth (register → verify → login)
- ✅ **8 roles**: `guest`, `user`, `repair_provider`, `recycler`, `business`, `organization`, `moderator`, `admin`
- ✅ Public registration sanitizer **forces `role: user`** — no role escalation possible from the API
- ✅ Professional application workflow: `Draft → Pending → Approved / Rejected / Info Requested`
- ✅ Admin & moderator review queue with full JSONB audit trail
- ✅ 1-tap persona switcher in AuthModal (Citizen, Repair Pro, Recycler, Business, Admin)

#### Mobile App — Home Screen (Apple HIG / Cupertino)
- ✅ Dynamic Island–style beacon with live status pulse
- ✅ Rescue Engine hero CTA with animated gradient
- ✅ iOS-style Valuation Terminal (real-time device valuation display)
- ✅ 6-step Circular Lifecycle Visual (animated progress ring)

#### Rescue Engine (Decision AI)
- ✅ **5 circular pathways**: Repair · Sell · Trade-in · Refurbish · Recycle
- ✅ Multi-criteria optimizer: Money / Convenience / Lifespan / Environment / Balanced modes
- ✅ Real-time pathway scoring with weighted preference sliders
- ✅ Safety Matrix: **battery swelling lockout** forces certified recycling — no override
- ✅ Proof of Rescue certificate (SHA-256 hash generated, URL mocked — see issues)
- ✅ **15/15 unit tests pass** for the decision engine

#### Device Passport
- ✅ SHA-256 device passport hash generated client-side
- ✅ 3-tier evidence ledger (self-reported / provider-verified / AI-assessed)
- ✅ Device Truth Report with condition scoring

#### Community (Twitter/X-style)
- ✅ For You / Following / Repair Help feeds
- ✅ @repair specialist broadcast posts
- ✅ Community posts, voting (upvote/downvote), bookmarks, follows
- ✅ Public profiles at `/u/:username` with PII exclusion (email never exposed)

#### Repair Marketplace
- ✅ Competitive repair quoting — providers submit quotes independently (quote isolation)
- ✅ Atomic quote acceptance — accepting one quote voids all others in a single transaction
- ✅ Private in-ticket messaging between customer and selected provider (6 s polling)
- ✅ Curated marketplace filtered to certified refurbished devices only

#### Backend Infrastructure
- ✅ **46/46 E2E backend tests pass**
- ✅ **97/97 mobile unit tests pass**
- ✅ TypeScript: 0 errors
- ✅ Vite production build: 0 errors
- ✅ Oxlint: 0 fatal errors (342 style warnings — see issues)
- ✅ Docker Compose config for containerised deployment
- ✅ nginx reverse-proxy config included

---

### ❌ Not Working / Broken / Incomplete

#### Database & Persistence
- ❌ **SQLite → PostgreSQL migration not done**: The backend runs on SQLite in development. `backend/ecoloop.sqlite` is a local file. Production requires a real PostgreSQL instance — `DATABASE_URL` / `DB_HOST` / `DB_USER` / `DB_PASSWORD` env vars must be set.
- ❌ **Supabase not configured**: `@supabase/supabase-js` is installed in the mobile app but `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` are not set to live values. Real-time Device Passport persistence, live partner bids, and transaction history all fall back to local/mock state.

#### Caching & Sessions
- ❌ **Redis not connected**: `backend/src/config/redis.js` contains configuration but no Redis server is running in development. All caching and session features that depend on Redis are silently skipped.

#### File Uploads
- ❌ **Cloudinary not wired end-to-end**: Cloudinary credentials are in `.env` and the Cloudinary SDK is installed, but the mobile `PostDeviceModal` uses local/mock state for images — actual binary uploads to Cloudinary are not triggered in the current codebase.

#### Real-time Communication
- ❌ **No WebSockets / SSE**: Private repair messaging uses a 6-second HTTP polling loop. Socket.io or Server-Sent Events real-time upgrade is not implemented.

#### Specific Features (Scaffolded, Not Complete)
- ❌ **Device Futures Exchange**: The exchange marketplace where providers bid on a submitted device profile is scaffolded in the Rescue Engine UI, but provider-side submission forms are not fully wired to a persistent backend exchange table.
- ❌ **Proof of Rescue public URL resolver**: The certificate generates a hash and a mock URL (`https://circuvio.social/proof/:rescueId`) but the actual public-facing endpoint / resolver does not exist.
- ❌ **Email notifications**: Application approval / rejection state changes are stored in the DB but no email transport (SendGrid, Nodemailer, etc.) is configured.

#### Auth & OAuth
- ❌ **No OAuth / social login**: Only email + password JWT auth is implemented. Google, GitHub, Apple OAuth providers are not wired.

#### Native Mobile Builds
- ❌ **Expo native build untested**: The app runs as a web bundle only (`npx expo start --web`). Native Xcode (iOS) and Android Studio builds have not been tested or signed.

#### Deployment
- ❌ **No CI/CD pipeline**: No GitHub Actions, no Railway / Render / Vercel config. Deployment must be done manually.
- ❌ **No production Dockerfile for the full stack**: `Dockerfile.frontend` and `backend/Dockerfile` exist individually but the `docker-compose.yml` still references placeholder environment variables.

#### Code Quality
- 🚧 **342 lint warnings**: Unused imports and `setState` inside `useEffect` across 181 files. Not blocking, but should be addressed before a production release.

---

## Local Development Setup

### Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | ≥ 20 LTS | Required for all three services |
| npm | ≥ 10 | Comes with Node |
| Git | any | For cloning |
| SQLite | built-in | Backend uses `sqlite3` npm package — no install needed |
| Redis | optional | Skipped silently if not running |

### 1. Clone the repo

```bash
git clone https://github.com/manmohan01singh/Ecoloop.git
cd Ecoloop
```

### 2. Backend

```bash
cd backend
cp .env.example .env        # copy example env file
# Edit .env — see Environment Variables section below
npm install
npm run dev                 # starts on http://localhost:5001
```

Seed the database with demo users (all 8 roles):

```bash
node create-all-role-accounts.js
```

### 3. Web App (Admin / Community)

```bash
# from repo root
npm install
npm run dev                 # starts on http://localhost:5173
```

### 4. Mobile App (Primary User UI)

```bash
cd mobile
npm install
npx expo start --web        # starts on http://localhost:8081
```

> For native iOS/Android, run `npx expo start --ios` or `npx expo start --android` (requires Xcode / Android Studio — **untested**).

### One-click start (Windows)

```bat
START_ECOLOOP.bat
```

This batch file starts all three services in separate terminal windows.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | ✅ | `development` or `production` |
| `PORT` | ✅ | API port — default `5001` |
| `JWT_SECRET` | ✅ | Secret key for JWT signing — use a long random string |
| `JWT_EXPIRES_IN` | ✅ | Token TTL e.g. `7d` |
| `DATABASE_URL` | prod only | Full PostgreSQL connection string (overrides individual DB_* vars) |
| `DB_HOST` | prod only | PostgreSQL host |
| `DB_PORT` | prod only | PostgreSQL port (default 5432) |
| `DB_NAME` | prod only | Database name |
| `DB_USER` | prod only | Database user |
| `DB_PASSWORD` | prod only | Database password |
| `REDIS_URL` | optional | Redis connection string — features degrade gracefully if absent |
| `CLOUDINARY_CLOUD_NAME` | optional | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | optional | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | optional | Cloudinary API secret |
| `GEMINI_API_KEY` | optional | Google Gemini API key (AI features) |
| `FRONTEND_URL` | ✅ | CORS allowed origin e.g. `http://localhost:5173` |

### Web App (root `.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | ✅ | Backend API base URL e.g. `http://localhost:5001/api` |
| `VITE_PROXY_TARGET` | optional | Vite dev proxy target — defaults to `http://localhost:5001` |

### Mobile App (`mobile/.env`)

| Variable | Required | Description |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | ✅ | Backend API base URL |
| `EXPO_PUBLIC_SUPABASE_URL` | optional | Supabase project URL (real-time features) |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | optional | Supabase anonymous key |

---

## Running Tests

### Backend E2E (46 tests)

```bash
cd backend
npm test
# → node --test tests/circuvio_e2e.test.mjs
# Expected: 46/46 passing
```

### Mobile Unit Tests (97 tests)

```bash
cd mobile
npm test
# → tsx -r ./test-register.cjs --test "src/**/*.test.ts"
# Expected: 97/97 passing
```

### Rescue Engine Unit Tests (15 tests)

```bash
cd mobile
npm test -- --test-name-pattern "RescueEngine"
# Expected: 15/15 passing
```

### TypeScript Check

```bash
cd mobile
npm run typecheck
# Expected: 0 errors
```

### Vite Production Build

```bash
# from repo root
npm run build
# Expected: 0 errors
```

### Linter

```bash
# from repo root
npm run lint
# Expected: 0 fatal errors, ~342 style warnings
```

---

## Known Issues & Roadmap

### P0 — Must fix before any production deployment

| # | Issue | Fix |
|---|---|---|
| 1 | SQLite in production | Provision a PostgreSQL instance (Supabase / Railway / Render). Set `DATABASE_URL` in backend env. Run `npm run seed`. |
| 2 | No Redis server | Deploy a Redis instance (Upstash free tier works). Set `REDIS_URL`. |
| 3 | Supabase not configured | Create a Supabase project, add `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` to mobile env. |
| 4 | No CI/CD pipeline | Add GitHub Actions workflow for test → build → deploy. |

### P1 — High priority

| # | Issue | Fix |
|---|---|---|
| 5 | Cloudinary uploads not wired | Complete the `PostDeviceModal` upload flow: read the file blob from `expo-image-picker` result and POST as `multipart/form-data` to backend `/api/upload`. |
| 6 | No email notifications | Integrate Nodemailer (SMTP) or SendGrid SDK. Fire emails on application approval/rejection events. |
| 7 | Real-time messaging is polling | Replace 6 s `setInterval` in repair messaging with Socket.io or SSE. |
| 8 | Proof of Rescue URL resolver | Build a public `GET /proof/:rescueId` endpoint that returns the certificate page. |

### P2 — Medium priority

| # | Issue | Fix |
|---|---|---|
| 9 | Device Futures Exchange backend | Create an `Exchange` table and provider bid routes. Wire the Rescue Engine "Device Futures" pathway to submit to this table. |
| 10 | OAuth / social login | Integrate Passport.js with Google and/or GitHub OAuth strategy. |
| 11 | Native iOS / Android builds | Test Expo EAS build for both platforms. Fix any RN-specific rendering issues. |
| 12 | 342 lint warnings | Run `npm run lint -- --fix` and resolve remaining `setState-in-effect` patterns. |
| 13 | Dockerfile polish | Update `docker-compose.yml` with actual env var values / secrets management (Docker secrets or GitHub Actions secrets). |

---

## Project Structure

```
Ecoloop/
├── backend/                  # Node.js + Express + Sequelize REST API
│   ├── src/
│   │   ├── app.js            # Express app factory
│   │   ├── server.js         # HTTP server entry point
│   │   ├── config/           # DB, Redis, env, Cloudinary config
│   │   ├── controllers/      # Route handlers (auth, repair, posts, etc.)
│   │   ├── middleware/        # JWT auth guard, upload, rate limiting
│   │   ├── models/           # Sequelize models (User, Post, RepairTicket, etc.)
│   │   ├── routes/           # Express router definitions
│   │   ├── services/         # Business logic (email, AI, etc.)
│   │   └── utils/            # Logger, helpers
│   └── tests/
│       └── circuvio_e2e.test.mjs  # 46 E2E tests
│
├── mobile/                   # React Native / Expo primary app
│   ├── App.tsx               # Root navigator
│   ├── src/
│   │   ├── design-system/    # Color tokens, typography
│   │   ├── features/
│   │   │   ├── auth/         # AuthModal, login/register flows
│   │   │   ├── community/    # Twitter/X-style feed
│   │   │   ├── decision/     # Rescue Engine (5 pathways, optimizer)
│   │   │   ├── explore/      # Marketplace & device browse
│   │   │   ├── home/         # Apple HIG home screen
│   │   │   ├── passport/     # Device Passport & Safe Handover modal
│   │   │   ├── post/         # Post a device (multi-step wizard)
│   │   │   └── profile/      # User profile screen
│   │   └── services/
│   │       ├── auth/         # JWT token management
│   │       ├── database/     # Supabase / workspace repositories
│   │       └── storage/      # AsyncStorage persistence
│   └── src/**/*.test.ts      # 97 unit tests
│
├── src/                      # React + Vite web admin / community app
│   ├── pages/                # All web pages (Admin, Moderator, Community, etc.)
│   ├── components/           # Shared UI components
│   ├── services/             # API service layer
│   └── context/              # Zustand auth store
│
├── supabase/                 # Supabase schema migrations (not yet applied)
├── docs/                     # Additional documentation
├── docker-compose.yml        # Multi-service Docker Compose
├── Dockerfile.frontend       # Frontend Docker image
├── nginx.conf                # Nginx reverse proxy config
├── vite.config.js            # Vite config (proxy → :5001)
└── START_ECOLOOP.bat         # Windows one-click start script
```

---

## Demo Accounts

After running `node backend/create-all-role-accounts.js`, these accounts are available:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@circuvio.com` | `Admin@1234` |
| Moderator | `moderator@circuvio.com` | `Mod@1234` |
| Repair Provider | `repair@circuvio.com` | `Repair@1234` |
| Recycler | `recycler@circuvio.com` | `Recycle@1234` |
| Business | `business@circuvio.com` | `Business@1234` |
| Organization | `org@circuvio.com` | `Org@1234` |
| User | `user@circuvio.com` | `User@1234` |

> ⚠️ **Change all passwords before any public deployment.**

---

## Contributing

1. Fork the repository and create a feature branch: `git checkout -b feat/your-feature`
2. Make your changes following the existing code style.
3. Run **all three test suites** and ensure they pass before opening a PR.
4. Open a Pull Request with a clear description of what you changed and why.
5. One of the maintainers will review within 48 hours.

Please do **not** commit `.env` files, `node_modules/`, or SQLite database files.

---

## License

MIT — see [`mobile/LICENSE`](mobile/LICENSE) for full text.

---

*Built with ❤️ by Team Jai Mahakaal. Rebranded from EcoLoop → Circuvio.*
