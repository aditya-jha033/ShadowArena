# System Architecture

## Tech Stack
- **Frontend**: Next.js 14 (App Router), React, TailwindCSS, Lucide Icons, Sonner.
- **Backend/API**: Next.js Serverless Functions.
- **Database**: PostgreSQL (via Prisma ORM).
- **Web3 / ZK**: Midnight Network (Preprod), 1AM Wallet Extension, Compact Smart Contracts.

## Data Models (Prisma)
- `User`: Registered via 1AM wallet connect. Tracks match history and asset ownership.
- `Match`: Represents a game instance. Tracks status (`pending`, `active`, `settled`), stake amounts, and deployed contract addresses.
- `MatchPlayer`: The bridge between `User` and `Match`. Tracks seating and win/loss results.
- `MatchMove`: Records on-chain tx references for player moves.
- `AssetOwnership`: Links users to cosmetic assets (Phase 2).
- `Feedback`: Global user feedback loop.

## The Edge
All ZK proof generation happens **client-side** in the user's 1AM wallet extension. Our Next.js backend strictly handles matchmaking, lobby state, and aggregate statistics. No secret nonces or card values ever touch the Next.js server.
