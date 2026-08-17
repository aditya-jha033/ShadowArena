# ShadowArena — Setup Guide

Exact commands to bootstrap the project locally: Next.js + TypeScript +
shadcn/ui frontend, Prisma + Neon database, and Midnight contract tooling.

> Prerequisites: Node.js 20+, npm (or pnpm), Git, a Neon account, a Midnight
> preview-network RPC endpoint, and the 1AM wallet browser extension.

---

## 1. Scaffold the Monorepo

```bash
mkdir shadowarena && cd shadowarena
npm init -y
mkdir -p apps contracts .github/workflows
```

Set up workspaces in the root `package.json`:

```json
{
  "name": "shadowarena",
  "private": true,
  "workspaces": ["apps/*", "contracts"]
}
```

(Optional but recommended) add Turborepo for task orchestration:

```bash
npm install turbo --save-dev -w
```

---

## 2. Create the Next.js + TypeScript App

```bash
cd apps
npx create-next-app@latest web \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=false \
  --import-alias "@/*"
cd web
```

---

## 3. Install shadcn/ui

```bash
npx shadcn@latest init
```

When prompted:
- Style: **New York**
- Base color: **Neutral** (we'll override with custom CSS variables — see
  `IMPLEMENTATION_PLAN.md` §3.2 for the exact color tokens)
- CSS variables: **Yes**

Install the core components used across the app:

```bash
npx shadcn@latest add button card dialog dropdown-menu avatar badge tabs \
  table toast skeleton separator tooltip sheet form input progress sonner
```

Then paste the color tokens from `IMPLEMENTATION_PLAN.md` §3.2 into
`app/globals.css`, and the typography scale into `tailwind.config.ts`.

---

## 4. Install Supporting Frontend Packages

```bash
npm install zustand framer-motion lucide-react
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

---

## 5. Set Up Prisma + Neon

1. Create a project and database at https://neon.tech and copy both the
   pooled (`DATABASE_URL`) and direct (`DIRECT_URL`) connection strings.
2. Install Prisma:

```bash
npm install prisma --save-dev
npm install @prisma/client
npx prisma init
```

3. In `.env`:

```
DATABASE_URL="postgresql://<user>:<password>@<neon-host>/<db>?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://<user>:<password>@<neon-host>/<db>?sslmode=require"
```

4. Paste the schema from `IMPLEMENTATION_PLAN.md` §6.2 into
   `prisma/schema.prisma`, using both `url` and `directUrl` as shown there.
5. Run the first migration:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

6. (Recommended) Install the **Vercel–Neon integration** from the Vercel
   dashboard so preview deployments automatically get their own Neon branch
   and connection strings injected as env vars.

---

## 6. Set Up Midnight Contracts (`contracts/`)

```bash
cd ../../contracts
npm init -y
npm install --save-dev @midnight-ntwrk/compact-compiler
npm install @midnight-ntwrk/midnight-js @midnight-ntwrk/wallet
```

Project layout:

```
contracts/
├── circuits/
│   ├── move-validity.compact
│   ├── shuffle-deal.compact
│   └── stake-pool.compact
├── tests/
└── package.json
```

`package.json` scripts:

```json
{
  "scripts": {
    "compact:compile": "compactc compile circuits/ dist/",
    "test": "vitest run",
    "deploy:preview": "node scripts/deploy.js --network preview"
  }
}
```

Compile:

```bash
npm run compact:compile
```

---

## 7. Connect the 1AM Wallet in the Frontend

```bash
cd ../apps/web
npm install @midnight-ntwrk/midnight-js @midnight-ntwrk/dapp-connector-api
```

In `.env.local`:

```
NEXT_PUBLIC_MIDNIGHT_NETWORK=preview
MIDNIGHT_PREVIEW_RPC="<your Midnight preview RPC endpoint>"
NEXT_PUBLIC_1AM_WALLET_APP_ID="<your registered app id>"
```

Implement `components/wallet/WalletConnectButton.tsx` to request a connection
from the 1AM wallet provider injected into `window` by the browser extension,
following Midnight.js's dapp-connector pattern.

---

## 8. Run Locally

```bash
# from apps/web
npm run dev
```

Visit `http://localhost:3000`. Connect the 1AM wallet extension (make sure
it's set to Midnight's **preview** network) to test wallet flows against
locally-deployed or preview-deployed contracts.

---

## 9. Deploy Contracts to Preview Network

```bash
cd contracts
npm run deploy:preview
```

Copy the resulting contract addresses into
`apps/web/lib/midnight/addresses.ts`.

---

## 10. Deploy the Frontend to Vercel

```bash
npm install -g vercel
cd apps/web
vercel link
vercel env add DATABASE_URL
vercel env add DIRECT_URL
vercel env add MIDNIGHT_PREVIEW_RPC
vercel env add NEXT_PUBLIC_MIDNIGHT_NETWORK
vercel env add NEXT_PUBLIC_1AM_WALLET_APP_ID
vercel --prod
```

Or simply connect the GitHub repo in the Vercel dashboard (root directory:
`apps/web`) — this gives you automatic PR preview deployments plus production
deploys on merge to `main`, matching the CI/CD flow in
`IMPLEMENTATION_PLAN.md` §8.

---

## 11. Wire Up CI/CD

Copy the two workflow files from `IMPLEMENTATION_PLAN.md` §8.1–8.2 into
`.github/workflows/frontend-ci.yml` and `.github/workflows/contracts-ci.yml`,
then add the following repository secrets in GitHub → Settings → Secrets:

- `NEON_DATABASE_URL`
- `NEON_DIRECT_URL`
- `MIDNIGHT_PREVIEW_RPC`
- `MIDNIGHT_DEPLOYER_KEY`

---

## 12. Run the Tests

```bash
# frontend unit/integration tests
cd apps/web
npm run test

# contract circuit tests
cd ../../contracts
npm run test
```

See `USAGE.md` for the specific test cases and expected results.