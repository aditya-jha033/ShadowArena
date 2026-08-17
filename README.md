<p align="center">
  <img src="apps/web/public/logo.png" width="120" alt="Shadow Arena Logo">
</p>

<h1 align="center">Shadow Arena</h1>

<p align="center">
  <strong>The premium ZK gaming table built on Midnight Network. Cheat-proof by construction. Private by default.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Midnight-Network-blueviolet?style=for-the-badge" alt="Midnight Network">
  <img src="https://img.shields.io/badge/Compact-ZK-black?style=for-the-badge" alt="Compact">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma">
</p>

---

## 🔗 Important Links

- **🎥 YouTube Demo Video:** [Watch the Demo](https://youtu.be/DHhQHuXcIq0)
- **🌐 Live Vercel Deployment:** [Shadow Arena Web](https://shadow-arena-preview.vercel.app/)
- **🐦 X (Twitter) Profile:** [@shadowarenaweb3](https://x.com/shadowarenaweb3)

### Midnight Explorer Links

- **Deployed Contract Address:** [View on 1AM Explorer](https://explorer.1am.xyz/contract/61b3cbc9cc4aad461f57541dbbf7b57b9b2b01b3844a87da3eff71f2e3723add)
- **Player 1 Join TX:** [View Transaction](https://explorer.1am.xyz/tx/91f0ea51d4b9f875f350b800ed40c334af56cfe8d1b1d9f45cfbb5a9fff60853?network=preview)
- **Player 2 Join TX:** [View Transaction](https://explorer.1am.xyz/tx/4d4c0d3cbc7213a876133d352b1368e4dec8a03a7e95c8dbf18914021df699e0?network=preview)
- **Player 1 Stake TX:** [View Transaction](https://explorer.1am.xyz/tx/c96cc4968f58d846f6543f032bc694f1108c2a01518f3f1d1366ce6888e91c33?network=preview)
- **Player 2 Stake TX:** [View Transaction](https://explorer.1am.xyz/tx/7e3c9d11eae4b55c84a9d6aee9d6e30a0ffe95fc369c21d429f836b44535bc32?network=preview)

### 📖 Extended Documentation

- [📄 Project Proposal](PROPOSAL.md)
- [🛠 Detailed Setup Guide](SETUP.md)
- [🎮 Detailed Usage & Testing Guide](USAGE.md)

---

## 💡 The Product Idea

### The Problem
In traditional online card games (whether Web2 or standard Web3), the server or the central smart contract fundamentally knows your hidden cards. This architecture is inherently flawed and leads to catastrophic vulnerabilities: God-mode cheating by server admins, MEV front-running by validators, and a complete lack of verifiable trust for high-stakes games.

### The Solution
Shadow Arena leverages the **Midnight Network's Zero-Knowledge cryptography** to completely eliminate the need for trust. Instead of sending your card to a server, you generate a ZK proof of your card locally in your browser. The Midnight smart contract mathematically settles the pot completely in the dark, ensuring fairness is cryptographically guaranteed without any central authority ever seeing the raw data.

---

## 🔐 Public State vs Private Witness

Shadow Arena strictly adheres to Midnight's data protection programming model:

- **Public State (On-Chain):**
  - The hashed commitments of the playing cards (using Blake2b).
  - The players' wallet addresses and stake amounts.
  - The deterministic state machine transitions (`WAITING` -> `REVEAL` -> `FINISHED`).

- **Private Witness (Local to Browser):**
  - The actual integer value of the playing card (e.g., the number `8`).
  - The raw cryptographic nonce used to salt the hash.
  - *These values never leave the user's local 1AM wallet. They are strictly used to generate the ZK Proof locally, ensuring absolute privacy.*

---

## 📸 Product Screenshots

<p align="center">
  <strong>Landing Page:</strong><br>
  <img src="assets/Project/landing-page.png" width="800"><br><br>
  <strong>Lobby:</strong><br>
  <img src="assets/Project/lobby.png" width="800"><br><br>
  <strong>Enter Arena:</strong><br>
  <img src="assets/Project/enter-arena.png" width="800"><br><br>
  <strong>Match Deployment:</strong><br>
  <img src="assets/Project/match-deploy.png" width="800"><br><br>
  <strong>Victory View:</strong><br>
  <img src="assets/Project/won-view.png" width="800"><br><br>
  <strong>Defeat View:</strong><br>
  <img src="assets/Project/lost-view.png" width="800"><br><br>
  <strong>Player Dashboard:</strong><br>
  <img src="assets/Project/dashboard.png" width="800">
</p>

---

## 📜 Smart Contracts

Shadow Arena utilizes two distinct Midnight `.compact` circuits:

1. **`stake-pool.compact`:** Manages the Escrow logic. It holds the `tDUST` from both players securely on the Midnight Network until the winner is mathematically determined.
2. **`move-validity.compact`:** The core ZK circuit. It verifies the Blake2b hashes of both players' cards, mathematically evaluates which card is higher without revealing the actual values, and triggers the payout.

<p align="center">
  <strong>Compact Compilation & Keys:</strong><br>
  <img src="assets/smart-contracts/compact%20compile%20keys.png" width="800">
</p>

<p align="center">
  <strong>Smart Contract Deployment:</strong><br>
  <img src="assets/smart-contracts/smart%20contracts%20deployment.png" width="800">
</p>

<p align="center">
  <strong>Player 1 & 2 Join Contract TXs:</strong><br>
  <img src="assets/smart-contracts/join%20player1.png" width="400">
  <img src="assets/smart-contracts/join%20player2.png" width="400">
  <br><br>
  <strong>Player 1 & 2 Stake TXs:</strong><br>
  <img src="assets/smart-contracts/stake%20player1.png" width="400">
  <img src="assets/smart-contracts/stake%20player2.png" width="400">
</p>

---

## 🏗 Project Architecture

```mermaid
graph TD;
    A[Next.js Frontend] -->|Connects to| B(1AM Midnight Wallet);
    B -->|Signs & Generates ZK Proofs| C{Midnight Network Node};
    C -->|Verifies Compact Circuits| D[(Midnight Blockchain)];
    A -->|Fetches Lobby Data| E[(Prisma / Neon Database)];
    D -->|State Sync| E;
```

---

## 🔄 User Workflow

```mermaid
sequenceDiagram
    participant Player1
    participant Player2
    participant Midnight
    
    Player1->>Midnight: Deploy Game Contract & Escrow Stake
    Player2->>Midnight: Join Contract & Escrow Stake
    Player1->>Player1: Select Card (Private Witness)
    Player1->>Midnight: Submit Hash Commitment
    Player2->>Player2: Select Card (Private Witness)
    Player2->>Midnight: Submit Hash Commitment
    Midnight->>Midnight: Verify Both Commitments
    Player1->>Midnight: Call 'Reveal' Circuit with Proof
    Midnight->>Midnight: Mathematically Evaluate Winner (ZK)
    Midnight->>Player1: Payout Winner
```

---

## 📂 File Structure

```text
📦 ShadowArena
├── 📂 apps
│   └── 📂 web                # Next.js 16 App Router (Frontend + API Routes)
│       ├── 📂 app            # React Server Components & API
│       ├── 📂 components     # Tailwind UI, TableFelt, Modals
│       └── 📂 lib/midnight   # Midnight.js DApp Connector integration
├── 📂 contracts              # Midnight ZK Circuits
│   ├── move-validity.compact # Game logic and ZK evaluation
│   └── stake-pool.compact    # Escrow and token transfer logic
└── 📂 assets                 # Screenshots and Diagrams
```

---

## 🛠 Local Development Setup

To run Shadow Arena locally on your machine, follow these steps:

### Prerequisites
- Node.js (v18+)
- Prisma CLI
- A PostgreSQL Database (e.g., Neon or local Postgres)
- Midnight 1AM Wallet Extension

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/aditya-jha033/ShadowArena.git
   cd ShadowArena
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file inside `apps/web/` and add your database URL:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/shadowarena"
   ```

4. **Initialize Database:**
   ```bash
   cd apps/web
   npx prisma generate
   npx prisma db push
   ```

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   The app will be running at `http://localhost:3000`.

---

## 🎮 Usage Guide

1. **Wallet Setup:** Ensure the **1AM Wallet** extension is installed in your browser.
2. **Select Network:** Switch your wallet to the **Preview Network**.
3. **Get Test Tokens:** Request `tDUST` from the official [Midnight Faucet](https://faucet.midnight.network/).
4. **Connect & Play:** Open `http://localhost:3000`, click **Connect Wallet**, choose your game mode on the Dashboard, and deploy a match!

---

## 🧪 Testing

The cryptographic game settlement logic is fully unit-tested using Vitest to ensure mathematical determinism and robust edge-case handling.

To run the tests yourself:
```bash
cd apps/web
npm install
npx vitest run
```

<p align="center">
  <strong>Test Suite Passing:</strong><br>
  <img src="assets/vitest%20test.png" width="800">
</p>

---

## 🚀 Future Implementation & Real World Application

The core technology behind Shadow Arena can be expanded far beyond "High Card Duel". 

1. **Fully Decentralized Poker & Blackjack:** By expanding the cryptographic hashing, we can build a fully on-chain Texas Hold'em protocol where card shuffling is achieved through multi-party computation (MPC) and ZK proofs, completely eliminating the need for a centralized casino.
2. **Cosmetic Web3 Economy:** Implementing an NFT-based cosmetic layer where players can win exclusive table felts, custom card backs, and player avatars.
3. **Automated Tournaments:** Escrow smart contracts that manage large tournament brackets with hundreds of players asynchronously.

---

### 🎉 Thanks to Midnight!
A massive thank you to the Midnight Network team for building the infrastructure that makes zero-knowledge decentralized applications accessible and scalable!