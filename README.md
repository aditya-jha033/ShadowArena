<p align="center">
  <img src="apps/web/public/logo.png" alt="ShadowArena Logo" width="160">
</p>

<h1 align="center">ShadowArena</h1>

<p align="center">
  <strong>Zero-Knowledge Card Dueling on Midnight Network</strong><br>
  The first provably fair card game where neither player — nor the server — ever sees your hand.
</p>

<p align="center">
  <a href="https://github.com/aditya-jha033/ShadowArena/actions/workflows/build.yml">
    <img src="https://github.com/aditya-jha033/ShadowArena/actions/workflows/build.yml/badge.svg" alt="Build">
  </a>
  <a href="https://github.com/aditya-jha033/ShadowArena/actions/workflows/lint.yml">
    <img src="https://github.com/aditya-jha033/ShadowArena/actions/workflows/lint.yml/badge.svg" alt="Lint & Typecheck">
  </a>
  <a href="https://github.com/aditya-jha033/ShadowArena/actions/workflows/test.yml">
    <img src="https://github.com/aditya-jha033/ShadowArena/actions/workflows/test.yml/badge.svg" alt="Tests">
  </a>
  <img src="https://img.shields.io/badge/network-Midnight%20Preprod-blueviolet" alt="Network">
  <img src="https://img.shields.io/badge/zk--proofs-Compact%20Circuits-emerald" alt="ZK">
</p>

---

## 🔗 Important Links

| | |
|--|--|
| 🌐 **Live App** | [shadow-arena-preview.vercel.app](https://shadow-arena-preview.vercel.app/) |
| 🎬 **Demo Video** | [Watch the ShadowArena MVP Demo](https://youtu.be/DHhQHuXcIq0) |
| 🐦 **X (Twitter)** | [@shadowarenaweb3](https://x.com/shadowarenaweb3) |
| 📊 **Pitch Deck** | [Product Slide Deck](https://docs.google.com/presentation/d/1vbet1VGJyL97eaDAsq6htQIZPXIsuPgCpuF5YJUJkV8/edit?usp=sharing) |

---

## Table of Contents

1. [The Problem](#the-problem)
2. [The Solution](#the-solution)
3. [Live Deployment](#live-deployment)
4. [September 2026 — What's New](#september-2026--whats-new)
5. [Architecture](#architecture)
6. [Smart Contracts](#smart-contracts)
7. [ZK Privacy Model](#zk-privacy-model)
8. [User Workflow](#user-workflow)
9. [File Structure](#file-structure)
10. [CI / CD](#ci--cd)
11. [Local Development](#local-development)
12. [Testing](#testing)
13. [Closed Beta & Feedback Program](#closed-beta--feedback-program)
14. [Screenshots](#screenshots)
15. [Roadmap](#roadmap)

---

## The Problem

In every traditional online card game — Web2 or Web3 — the server knows your hidden cards. This fundamental design flaw enables:

- **God-mode cheating** by server administrators
- **MEV front-running** by block validators who can inspect pending transactions
- **Zero verifiability** — players must simply trust the platform

Standard blockchain smart contracts make this worse, not better: all state is public on-chain, meaning your "hidden" card is visible to anyone who reads the chain.

---

## The Solution

ShadowArena uses **Midnight Network's Zero-Knowledge cryptography** to eliminate the need for trust entirely.

Instead of sending your card to a server, you generate a ZK proof of your card **locally in your browser** using the **1AM Wallet**. The Midnight smart contract evaluates the winner **mathematically in the dark** — the outcome is cryptographically guaranteed without any central authority ever seeing the raw card values.

**No server. No trust. No way to cheat.**

---

## Live Deployment

| Resource | Link |
|----------|------|
| 🌐 Web App | Deployed on Vercel (Preprod) |
| 📜 Smart Contract | [`f6a07f0a59838dba800c2e0fe75b6ea4784b94f3ca6e7cbdf2901453148b88b4`](https://explorer.1am.xyz/contract/f6a07f0a59838dba800c2e0fe75b6ea4784b94f3ca6e7cbdf2901453148b88b4) |
| 🔗 Player 1 Join | [`b92423bc...`](https://explorer.1am.xyz/tx/b92423bcc4041e8bad79cd9dfae78c2b2e2b4d8c3d8a277d84ae5215c561ff64?network=preprod) |
| 🔗 Player 2 Join | [`5715e670...`](https://explorer.1am.xyz/tx/5715e670ec5715ab83704a01015c23c2e7b152b7ba95daa5c7bace61c5d989a8?network=preprod) |
| 🔗 Player 1 Stake | [`7ecaa310...`](https://explorer.1am.xyz/tx/7ecaa3107e9dbdbcda2da8f4fc172e13b30138c9894db866c07f38389621b3a8?network=preprod) |
| 🔗 Player 2 Stake | [`539ebac5...`](https://explorer.1am.xyz/tx/539ebac51ed5d775dc5463a45f90fd80cf65be44fb843619adb6a34ae3d96f3f?network=preprod) |
| 🔗 ZK Reveal | [`185a2e99...`](https://explorer.1am.xyz/tx/185a2e99937538b8b60e161bd51e914cff168895d0e5916fa33722619ffbd73b?network=preprod) |

---

## September 2026 — What's New

The following features were fully designed, implemented, and deployed during September 2026 as a direct result of the closed beta feedback program.

### 🏆 Leaderboard
A live leaderboard backed by real Prisma DB aggregations. Ranks the top 20 players by win count with win rate and total games played. Accessible from the main sidebar navigation.  
**Commit:** [`f0ed19f`](https://github.com/aditya-jha033/ShadowArena/commit/f0ed19f)

### 📋 Match History on Profile
The player profile page now features a full **Match History** section. Every settled game shows the result (Win / Loss / Draw), opponent wallet address, card values revealed after settlement, stake delta, and a direct link to the Midnight Explorer transaction.  
**Commits:** [`d0b61a0`](https://github.com/aditya-jha033/ShadowArena/commit/d0b61a0) · [`6a78aed`](https://github.com/aditya-jha033/ShadowArena/commit/6a78aed)

### 🔒 Private Stake Privacy Fix
Games created with "Private" stakes previously leaked the stake amount in the `/api/matches/open` response. The endpoint now explicitly nullifies private stake amounts before serialization — the lobby table shows "Private" rather than a number.  
**Commit:** [`d0b61a0`](https://github.com/aditya-jha033/ShadowArena/commit/d0b61a0)

### 📱 Mobile Layout Overhaul
`TableFelt` (the in-game view) is now fully playable on mobile. The card row uses `overflow-x-auto` horizontal snapping so all 5 cards are reachable. The action button area has `pb-24` clearance to sit above the mobile browser navigation bar.  
**Commit:** [`ae6bbdf`](https://github.com/aditya-jha033/ShadowArena/commit/ae6bbdf)

### 🃏 Real Randomized Card Dealing
Card hands are now server-generated using a cryptographic Fisher-Yates shuffle on match creation. Each player receives a unique 5-card hand stored in encrypted `deckData` on the Match record and retrieved via `/api/matches/[id]/hand`.  
**Commit:** [`d11527f`](https://github.com/aditya-jha033/ShadowArena/commit/d11527f)

### 💾 Persistent Game State (Prisma)
Move pre-images (private card values) were previously written to an ephemeral `.moves.json` file, causing matches to get stuck after serverless cold starts. Pre-images are now stored as `committedValue` and `committedNonce` columns on the `MatchPlayer` Prisma model — persisting across restarts and deployments.  
**Commit:** [`d11527f`](https://github.com/aditya-jha033/ShadowArena/commit/d11527f)

### 📖 Player Onboarding Guide
A dismissable **How to Play** card was added to the Lobby, walking new players through the 4-step ZK game flow: **Fund → Join → Lock Card → Reveal**. Full written guide published at [`docs/CADET_FLIGHT_MANUAL.md`](docs/CADET_FLIGHT_MANUAL.md).  
**Commit:** [`adb13f8`](https://github.com/aditya-jha033/ShadowArena/commit/adb13f8)

### 🔐 Security Hardening
- Deleted unauthenticated `/api/matches/clear` endpoint (wiped the entire DB with a single GET request)
- Deleted `/api/debug` diagnostic endpoint (returned full user data with no auth)
- Removed legacy `fs.readFileSync` dead code from `/api/matches/[id]/finish`
- Replaced `alert()` in wallet connector with a structured error for toast-based handling  
**Commits:** [`e351bf2`](https://github.com/aditya-jha033/ShadowArena/commit/e351bf2) · [`1101dd2`](https://github.com/aditya-jha033/ShadowArena/commit/1101dd2)

### ✅ CI / CD Fully Green
All four GitHub Actions workflows now pass on every push to `main`:
- TypeScript typecheck (`tsc --noEmit`)
- ESLint (0 errors, 0 warnings)
- Vitest unit tests (4/4)
- Next.js production build  
**Commits:** [`bf5c679`](https://github.com/aditya-jha033/ShadowArena/commit/bf5c679) · [`895183a`](https://github.com/aditya-jha033/ShadowArena/commit/895183a)

---

## Architecture

```mermaid
graph TD
    A[Next.js 15 App Router] -->|Connects to| B(1AM Midnight Wallet)
    B -->|Signs & generates ZK Proofs locally| C{Midnight Preprod Node}
    C -->|Verifies Compact circuits| D[(Midnight Blockchain)]
    A -->|Lobby, leaderboard, history| E[(Prisma / PostgreSQL)]
    D -->|Settlement events| E
    A -->|Serves ZK key artifacts| F[Browser ZK Prover]
    F -->|Proof submitted| C
```

### Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), Tailwind CSS, Framer Motion |
| ZK Infrastructure | Midnight Network, Compact circuits, 1AM Wallet |
| API | Next.js Route Handlers (serverless) |
| Database | Prisma ORM + PostgreSQL (Neon) |
| Auth | 1AM Wallet address — no passwords, no accounts |
| CI / CD | GitHub Actions (build · lint · test · contracts) + Vercel |

---

## Smart Contracts

ShadowArena uses two Midnight `.compact` circuits deployed on **Midnight Preprod**:

### `stake-pool.compact`
Manages the escrow logic. Holds `tDUST` from both players securely on-chain until the winner is mathematically determined. Prevents withdrawal until the ZK reveal is verified.

### `move-validity.compact`
The core ZK circuit. Verifies the Blake2b hashes of both players' committed card values, evaluates which card is higher without revealing the actual values, and triggers the payout atomically.

### `stake-pool-private.compact`
Extension of the stake pool for anonymous games. The stake amount is a private witness — the opponent and spectators see only a commitment hash, not the amount.

<p align="center">
  <strong>Contract Compilation & ZK Keys:</strong><br>
  <img src="assets/smart-contracts/compact%20compile%20keys.png" width="800"><br><br>
  <strong>Deployment:</strong><br>
  <img src="assets/smart-contracts/smart%20contracts%20deployment.png" width="800">
</p>

---

## ZK Privacy Model

ShadowArena strictly adheres to Midnight's **data protection programming model**:

| Data | Visibility | Description |
|------|-----------|-------------|
| Card hash commitments | 🌐 Public (on-chain) | Blake2b hash of `card_value ‖ nonce` |
| Wallet addresses | 🌐 Public (on-chain) | Both players' shielded addresses |
| Stake amounts (standard) | 🌐 Public (on-chain) | Visible in lobby and on-chain |
| Stake amounts (private) | 🔒 Private witness | Hidden — only the commitment is on-chain |
| Actual card integer value | 🔒 Private witness | Never leaves the user's 1AM Wallet |
| Cryptographic nonce | 🔒 Private witness | Used only to generate the ZK proof locally |

> **Guarantee:** Even if the ShadowArena server were fully compromised, no attacker could retroactively learn any player's card value from the on-chain data.

---

## User Workflow

```mermaid
sequenceDiagram
    participant P1 as Player 1
    participant P2 as Player 2
    participant MW as Midnight Network

    P1->>MW: Deploy Game Contract & Escrow Stake
    P2->>MW: Join Contract & Escrow Stake
    P1->>P1: Select Card (Private Witness, local only)
    P1->>MW: Submit Blake2b Hash Commitment
    P2->>P2: Select Card (Private Witness, local only)
    P2->>MW: Submit Blake2b Hash Commitment
    MW->>MW: Verify both commitments are present
    P1->>MW: Call Reveal circuit with ZK Proof
    MW->>MW: Mathematically evaluate winner (ZK — no raw values seen)
    MW->>P1: Payout to winner's address
```

---

## File Structure

```
ShadowArena/
├── apps/
│   └── web/                        # Next.js 15 App Router
│       ├── app/
│       │   ├── (app)/              # Authenticated pages
│       │   │   ├── dashboard/      # Game dashboard
│       │   │   ├── lobby/          # Open game tables
│       │   │   ├── leaderboard/    # Live player rankings  ← New Sep 2026
│       │   │   ├── profile/        # Stats, inventory, match history  ← Updated Sep 2026
│       │   │   ├── marketplace/    # NFT cosmetic skins
│       │   │   ├── tournaments/    # Tournament browser
│       │   │   └── table/[id]/     # Live game view
│       │   ├── api/
│       │   │   ├── matches/
│       │   │   │   ├── open/       # Lobby table list (private-stake aware)
│       │   │   │   ├── history/    # Settled match history  ← New Sep 2026
│       │   │   │   └── [id]/
│       │   │   │       ├── hand/   # Dealt card hand
│       │   │   │       ├── moves/  # ZK pre-image storage
│       │   │   │       ├── join/   # Player 2 join flow
│       │   │   │       └── finish/ # Settlement (Prisma-backed)
│       │   │   ├── leaderboard/    # Rankings aggregation
│       │   │   ├── feedback/       # Beta feedback collection
│       │   │   ├── stats/          # Live platform statistics
│       │   │   └── user/           # Profile, assets, activity
│       │   └── page.tsx            # Public landing page
│       ├── components/
│       │   ├── game/
│       │   │   ├── TableFelt.tsx   # ZK game state machine  ← Mobile-fixed Sep 2026
│       │   │   ├── StakeModal.tsx  # Stake creation with retry logic
│       │   │   └── FeedbackModal.tsx
│       │   └── ui/                 # shadcn/ui component library
│       ├── lib/
│       │   └── midnight/
│       │       ├── wallet.ts       # 1AM Wallet Zustand store
│       │       ├── contract.ts     # Compact circuit bindings
│       │       └── deploy.ts       # Contract deployment helpers
│       └── prisma/
│           └── schema.prisma       # Full DB schema
├── contracts/                      # Midnight Compact source
│   └── circuits/
│       ├── stake-pool.compact
│       ├── stake-pool-private.compact
│       └── move-validity.compact
├── docs/
│   ├── FEEDBACK_LOOP.md            # Beta issue tracker (this file's sibling)
│   ├── USERS.md                    # 70 verified tester wallets
│   ├── CADET_FLIGHT_MANUAL.md      # Player onboarding guide
│   ├── COMPACT_CIRCUIT.md          # ZK circuit technical reference
│   └── SYSTEM_ARCHITECTURE.md     # Stack overview
└── .github/
    └── workflows/
        ├── build.yml               # Next.js production build
        ├── lint.yml                # TypeScript + ESLint
        ├── test.yml                # Vitest unit tests
        └── contracts.yml           # ZK artifact validation
```

---

## CI / CD

All four GitHub Actions workflows run automatically on every push to `main` and `develop`.

| Workflow | Trigger | What it checks |
|----------|---------|---------------|
| **Build** | push / PR | `npm run build` — full Next.js production build with Prisma generate |
| **Lint** | push / PR | `tsc --noEmit` typecheck + ESLint (0 errors enforced) |
| **Test** | push / PR | Vitest unit test suite — game logic, ZK settlement, edge cases |
| **Contracts** | `contracts/**` change | Validates compiled Compact artifacts and ZK key files are present |

---

## Local Development

### Prerequisites

- Node.js v18+
- PostgreSQL (local or [Neon](https://neon.tech))
- [1AM Wallet](https://docs.midnight.network/develop/tutorial/using-midnight-lace-wallet) browser extension
- Midnight Preprod tDUST from the [faucet](https://faucet.preprod.midnight.network/)

### Setup

```bash
# 1. Clone
git clone https://github.com/aditya-jha033/ShadowArena.git
cd ShadowArena

# 2. Install all workspace dependencies
npm install

# 3. Configure environment
cp apps/web/.env.example apps/web/.env
# Edit apps/web/.env — add your DATABASE_URL

# 4. Initialise database
cd apps/web
npx prisma generate
npx prisma db push

# 5. Start development server
npm run dev          # from repo root  →  http://localhost:3000
```

### Environment Variables

```env
# apps/web/.env
DATABASE_URL="postgresql://user:password@localhost:5432/shadowarena"
NEXT_PUBLIC_MIDNIGHT_NETWORK="preprod"
```

---

## Testing

The cryptographic game-settlement logic is fully unit-tested using [Vitest](https://vitest.dev/).

```bash
cd apps/web
npm run test
```

Tests cover:
- **Win / Loss / Draw** determination from committed card values
- **Edge cases** — tied cards, zero-value cards, maximum card values
- **Settlement atomicity** — result is deterministic given the same pre-images

<p align="center">
  <strong>Test Suite (4/4 passing):</strong><br>
  <img src="assets/vitest%20test.png" width="800">
</p>

---

## Closed Beta & Feedback Program

ShadowArena ran a structured closed beta with **70 verified Midnight Preprod wallet holders** during September 2026.

| Resource | Link |
|----------|------|
| 📋 Feedback Form | [Google Form](https://forms.gle/HJHyskV8uUWcaMfE9) |
| 📊 Response Sheet | [Google Sheets](https://docs.google.com/spreadsheets/d/1dgOz8PlK47X1YORECx1SuLA6aYzvvBl73ZnqgpCoT_M/edit?usp=sharing) |
| 🐛 Issue Tracker | [`docs/FEEDBACK_LOOP.md`](docs/FEEDBACK_LOOP.md) |
| 👥 Tester Registry | [`docs/USERS.md`](docs/USERS.md) |

### Beta Outcomes

All 13 issues surfaced during the beta were triaged, fixed, and committed during September 2026. Highlights:

| Issue | Reported By | Fix |
|-------|-------------|-----|
| Reveal button premature | Soumik Chatterjee | `TableFelt` state gate — commit [`5a3047c`](https://github.com/aditya-jha033/ShadowArena/commit/5a3047c) |
| Hardcoded cards (2 5 8 10) | Pramod Mahto | Fisher-Yates shuffle — commit [`d11527f`](https://github.com/aditya-jha033/ShadowArena/commit/d11527f) |
| Debug endpoint leaking data | Arnab Sengupta | Deleted `/api/debug` — commit [`5a3047c`](https://github.com/aditya-jha033/ShadowArena/commit/5a3047c) |
| No leaderboard | Manas Kumar Nayak | Built `/leaderboard` — commit [`f0ed19f`](https://github.com/aditya-jha033/ShadowArena/commit/f0ed19f) |
| Private stake leaking | Rajesh Jha | Fixed API masking — commit [`d0b61a0`](https://github.com/aditya-jha033/ShadowArena/commit/d0b61a0) |
| Mobile layout broken | Subhro Dasgupta | `overflow-x-auto` + `pb-24` — commit [`ae6bbdf`](https://github.com/aditya-jha033/ShadowArena/commit/ae6bbdf) |
| No match history | Partha Mukhopadhyay | `/api/matches/history` + Profile section — commit [`6a78aed`](https://github.com/aditya-jha033/ShadowArena/commit/6a78aed) |

---

## Screenshots

<p align="center">
  <strong>Landing Page:</strong><br>
  <img src="assets/Project/landing-page.png" width="800"><br><br>
  <strong>Player Dashboard:</strong><br>
  <img src="assets/Project/dashboard.png" width="800"><br><br>
  <strong>Player Profile (with Match History):</strong><br>
  <img src="assets/Project/profile.png" width="800"><br><br>
  <strong>Lobby — Open Game Tables:</strong><br>
  <img src="assets/Project/lobby.png" width="800"><br><br>
  <strong>Enter Game:</strong><br>
  <img src="assets/Project/enter-game.png" width="800"><br><br>
  <strong>Game View (TableFelt):</strong><br>
  <img src="assets/Project/game-view.png" width="800"><br><br>
  <strong>Game Play — ZK Card Lock:</strong><br>
  <img src="assets/Project/game-play.png" width="800"><br><br>
  <strong>Victory Screen:</strong><br>
  <img src="assets/Project/won-view.png" width="800">
</p>

---

## Roadmap

### Closed Beta ✅ Complete (September 2026)
- [x] High Card Duel with ZK commitment & reveal
- [x] 1AM Wallet integration (Preprod)
- [x] Private & public stake modes
- [x] Leaderboard with real Prisma aggregations
- [x] Match history on player profile
- [x] Mobile-responsive game view
- [x] Full CI / CD pipeline (build · lint · test)
- [x] 70-tester closed beta with structured feedback loop

---

<p align="center">
  <strong>Built on Midnight Network · Powered by Zero-Knowledge Cryptography</strong><br>
  <a href="https://midnight.network">midnight.network</a> · <a href="https://docs.midnight.network">docs</a> · <a href="https://faucet.preprod.midnight.network">Preprod Faucet</a>
</p>
