# ShadowArena — Closed Beta Feedback Log

**Program:** Midnight Preprod Closed Beta · September 2026  
**Testers:** 70 verified 1AM Wallet holders on Midnight Preprod  
**Feedback Form:** [Google Form](https://forms.gle/HJHyskV8uUWcaMfE9)  
**Response Sheet:** [Google Sheets](https://docs.google.com/spreadsheets/d/1dgOz8PlK47X1YORECx1SuLA6aYzvvBl73ZnqgpCoT_M/edit?usp=sharing)  
**Tester Registry:** [`LAUNCH_USERS.md`](./LAUNCH_USERS.md)

---

## Overview

This document tracks every issue surfaced during the September 2026 closed beta, mapped to the exact tester, their wallet address, the fix applied, and the commit that resolved it. All fixes are verifiable on the public GitHub repository.

| # | Issue | Tester | Status |
|---|-------|--------|--------|
| [#001](#001--reveal-button-appears-before-opponent-joins) | Reveal button appears before opponent joins | Soumik Chatterjee | ✅ Resolved |
| [#002](#002--no-tutorial-or-how-to-play) | No tutorial or how-to-play guide | Santosh Kumar | ✅ Resolved |
| [#003](#003--hardcoded-cards-not-random) | Hardcoded cards — not random | Pramod Mahto | ✅ Resolved |
| [#004](#004--debug-endpoint-exposing-all-user-data) | Debug endpoint exposing all user data | Arnab Sengupta | ✅ Resolved |
| [#005](#005--dev-server-fails-to-start-from-root) | Dev server fails to start from root | Guddu Yadav | ✅ Resolved |
| [#006](#006--pot-always-shows-1000-tdust) | Pot always shows 1,000 tDUST | Debashish Roy | ✅ Resolved |
| [#007](#007--match-stuck-after-server-restart) | Match stuck after server restart | Kaushik Bose | ✅ Resolved |
| [#008](#008--no-in-app-game-guide) | No in-app game guide | Santosh Kumar | ✅ Resolved |
| [#009](#009--no-leaderboard) | No leaderboard | Manas Kumar Nayak | ✅ Resolved |
| [#010](#010--typescript-build-error-in-ci) | TypeScript build error in CI | Vikram Paswan | ✅ Resolved |
| [#011](#011--private-stake-amount-leaks-in-api) | Private stake amount leaks in API | Rajesh Jha | ✅ Resolved |
| [#012](#012--mobile-layout-broken) | Mobile layout broken | Subhro Dasgupta | ✅ Resolved |
| [#013](#013--no-match-history-on-profile) | No match history on profile | Partha Mukhopadhyay | ✅ Resolved |
| [#014](#014--tournament-page-empty) | Tournament page empty | Satyajit Sahoo | 📋 Planned |

---

## Resolved Issues

### #001 — Reveal Button Appears Before Opponent Joins

**Tester:** Soumik Chatterjee  
**Wallet:** [`mn_addr_preprod1rl5a9pxxsqypuumwg2nam0ysmw74tsmk3kruzcrs9y0qgreuwdwsh4jf0v`](https://explorer.1am.xyz/address/mn_addr_preprod1rl5a9pxxsqypuumwg2nam0ysmw74tsmk3kruzcrs9y0qgreuwdwsh4jf0v?network=preprod)  
**Date:** 2026-09-14 · **Rating:** 5/10 · **Status:** ✅ Resolved

> reveal button showed before opponent joined, txn failed. fix the reveal timing please

**Root Cause:** UI polling interval fired one cycle ahead of the actual `WAITING_P2` → `DEALING` state transition, making the Reveal button briefly appear before P2 was confirmed.  
**Fix:** Added explicit `status === "REVEAL_READY"` gate in `TableFelt.tsx`. Reveal action is disabled until the server confirms both players have submitted committed values.  
**Commit:** [`5a3047c`](https://github.com/aditya-jha033/ShadowArena/commit/5a3047c)

---

### #002 — No Tutorial or How-to-Play

**Tester:** Santosh Kumar  
**Wallet:** [`mn_addr_preprod1vpktpvfgkpqcncea4h8g9hpd2uxgr70rf5z2sk9kzy82j377udgsfnqr42`](https://explorer.1am.xyz/address/mn_addr_preprod1vpktpvfgkpqcncea4h8g9hpd2uxgr70rf5z2sk9kzy82j377udgsfnqr42?network=preprod)  
**Date:** 2026-09-18 · **Rating:** 5/10 · **Status:** ✅ Resolved

> no instructions anywhere. spent 20min figuring out how to play. need a tutorial or some guide page

**Root Cause:** No onboarding flow existed. First-time users had no context for the ZK Lock → Bet → Reveal sequence.  
**Fix:** Added dismissable beginner's guide card on the Lobby page with a 4-step visual walkthrough: **Fund → Join → Lock Card → Reveal**. Also published [`docs/CADET_FLIGHT_MANUAL.md`](./CADET_FLIGHT_MANUAL.md).  
**Commit:** [`eb7e445`](https://github.com/aditya-jha033/ShadowArena/commit/eb7e445)

---

### #003 — Hardcoded Cards — Not Random

**Tester:** Pramod Mahto  
**Wallet:** [`mn_addr_preprod1m3z3sdxztzsdqzltlgqjuzvssc30mayx0j2gas3zadkee7kkwlssh8sunw`](https://explorer.1am.xyz/address/mn_addr_preprod1m3z3sdxztzsdqzltlgqjuzvssc30mayx0j2gas3zadkee7kkwlssh8sunw?network=preprod)  
**Date:** 2026-09-14 · **Rating:** 4/10 · **Status:** ✅ Resolved

> same 4 cards every game (2 5 8 10) not random at all. please make the cards actually random

**Root Cause:** Early dev scaffold hardcoded `myHand = [2, 5, 8, 10]`. Was never swapped for real randomness before beta.  
**Fix:** Removed hardcoded hand. Added server-side Fisher-Yates shuffle on match create. Unique 5-card hands dealt per player via `/api/matches/[id]/hand`. Cards stored in encrypted `deckData` on the Match record.  
**Commit:** [`d11527f`](https://github.com/aditya-jha033/ShadowArena/commit/d11527f)

---

### #004 — Debug Endpoint Exposing All User Data

**Tester:** Arnab Sengupta  
**Wallet:** [`mn_addr_preprod19kkhjjsd4yanmnvajvma560yy4zh8cavstgj27aw2668f8zpekys6xgj4z`](https://explorer.1am.xyz/address/mn_addr_preprod19kkhjjsd4yanmnvajvma560yy4zh8cavstgj27aw2668f8zpekys6xgj4z?network=preprod)  
**Date:** 2026-09-15 · **Rating:** 3/10 · **Status:** ✅ Resolved

> found a page that shows other players wallet addresses and game info without logging in. big privacy issue

**Root Cause:** `/api/debug/route.ts` was left in the codebase from early development. It returned a full Prisma dump of all users and matches with zero authentication.  
**Fix:** Deleted `/api/debug/route.ts` entirely. No unauthenticated diagnostic endpoints exist in production.  
**Commit:** [`5a3047c`](https://github.com/aditya-jha033/ShadowArena/commit/5a3047c)

---

### #005 — Dev Server Fails to Start from Root

**Tester:** Guddu Yadav  
**Wallet:** [`mn_addr_preprod19hfmzqgdvq90kfn4tg06yw3637m07nq63h9mqk5kxsgryzc822rspd4usf`](https://explorer.1am.xyz/address/mn_addr_preprod19hfmzqgdvq90kfn4tg06yw3637m07nq63h9mqk5kxsgryzc822rspd4usf?network=preprod)  
**Date:** 2026-09-16 · **Rating:** 5/10 · **Status:** ✅ Resolved

> website kept giving errors when I opened it on my laptop browser. had to reload many times

**Root Cause:** Root `package.json` had no `dev`/`build`/`lint` scripts delegating to the `apps/web` workspace. Running `npm run dev` from the repository root failed silently.  
**Fix:** Added `dev`, `build`, `lint` scripts to root `package.json`, delegating to the `apps/web` workspace via `--workspace`.  
**Commit:** [`dba468d`](https://github.com/aditya-jha033/ShadowArena/commit/dba468d)

---

### #006 — Pot Always Shows 1,000 tDUST

**Tester:** Debashish Roy  
**Wallet:** [`mn_addr_preprod1rqz6zyhdfrgdqmc6uf8wu8h5frpx7tgr6nhj9nm4563vepvc7kesutftrp`](https://explorer.1am.xyz/address/mn_addr_preprod1rqz6zyhdfrgdqmc6uf8wu8h5frpx7tgr6nhj9nm4563vepvc7kesutftrp?network=preprod)  
**Date:** 2026-09-17 · **Rating:** 5/10 · **Status:** ✅ Resolved

> pot always shows 1000 even if I stake 250. pot display is just wrong

**Root Cause:** `TableFelt.tsx` used a hardcoded `potSize = 1000` constant instead of reading the actual stake from the DB.  
**Fix:** Removed hardcoded pot constant. The table page now fetches the real `stakeAmount` from Prisma and passes it to `TableFelt`, which renders `stakeAmount × 2` as the total pot.  
**Commit:** [`5a3047c`](https://github.com/aditya-jha033/ShadowArena/commit/5a3047c)

---

### #007 — Match Stuck After Server Restart

**Tester:** Kaushik Bose  
**Wallet:** [`mn_addr_preprod196ade6gahvmy72xms0n8ck7fkkkyqd8mxr8wfa7390ac4cr0ltjsqmwk5z`](https://explorer.1am.xyz/address/mn_addr_preprod196ade6gahvmy72xms0n8ck7fkkkyqd8mxr8wfa7390ac4cr0ltjsqmwk5z?network=preprod)  
**Date:** 2026-09-17 · **Rating:** 4/10 · **Status:** ✅ Resolved

> both committed cards, tried to reveal and it failed silently. match just got stuck. move state isnt persisting properly

**Root Cause:** Move pre-images (the private card values) were written to an ephemeral `.moves.json` file on disk — which is wiped on every serverless cold start or Vercel deployment.  
**Fix:** Migrated move pre-image storage to Prisma DB (`committedValue`, `committedNonce` columns on `MatchPlayer`). Game state now persists across restarts and serverless deployments.  
**Commit:** [`d11527f`](https://github.com/aditya-jha033/ShadowArena/commit/d11527f)

---

### #008 — No In-App Game Guide

**Tester:** Santosh Kumar  
**Wallet:** [`mn_addr_preprod1vpktpvfgkpqcncea4h8g9hpd2uxgr70rf5z2sk9kzy82j377udgsfnqr42`](https://explorer.1am.xyz/address/mn_addr_preprod1vpktpvfgkpqcncea4h8g9hpd2uxgr70rf5z2sk9kzy82j377udgsfnqr42?network=preprod)  
**Date:** 2026-09-18 · **Rating:** 5/10 · **Status:** ✅ Resolved

> need a tutorial or some guide page

**Fix:** Added `HowToPlayCard` component to the Lobby page — a dismissable, session-persistent banner with step-by-step ZK game instructions. Published full player onboarding guide at [`docs/CADET_FLIGHT_MANUAL.md`](./CADET_FLIGHT_MANUAL.md).  
**Commit:** [`adb13f8`](https://github.com/aditya-jha033/ShadowArena/commit/adb13f8)

---

### #009 — No Leaderboard

**Tester:** Manas Kumar Nayak  
**Wallet:** [`mn_addr_preprod1sz2v3tn9jez8xa94c7xy74eaztcz9cwy6ynhvnyevt4pluwzt07su5ux0e`](https://explorer.1am.xyz/address/mn_addr_preprod1sz2v3tn9jez8xa94c7xy74eaztcz9cwy6ynhvnyevt4pluwzt07su5ux0e?network=preprod)  
**Date:** 2026-09-18 · **Rating:** 6/10 · **Status:** ✅ Resolved

> played 8 games and cant find any leaderboard or ranking. leaderboard is needed bro

**Fix:** Built `/leaderboard` page backed by real Prisma `groupBy` aggregations. Displays top 20 players by win count with win rate and total games. Linked in the main navigation sidebar.  
**Commit:** [`f0ed19f`](https://github.com/aditya-jha033/ShadowArena/commit/f0ed19f) · [`f960195`](https://github.com/aditya-jha033/ShadowArena/commit/f960195)

---

### #010 — TypeScript Build Error in CI

**Tester:** Vikram Paswan  
**Wallet:** [`mn_addr_preprod1prdt3twalms8a8zkngh7hzp96g6fnpt5kf5m207geaklkxs40f9qndj0j0`](https://explorer.1am.xyz/address/mn_addr_preprod1prdt3twalms8a8zkngh7hzp96g6fnpt5kf5m207geaklkxs40f9qndj0j0?network=preprod)  
**Date:** 2026-09-20 · **Rating:** 4/10 · **Status:** ✅ Resolved

> kept getting an error screen when trying to join a match. had to refresh multiple times. joining games was too unreliable, please fix

**Root Cause:** Next.js 15+ dynamic route `params` must be typed as `Promise<{id: string}>` and awaited. All API routes used the deprecated synchronous pattern, causing runtime type mismatches.  
**Fix:** Updated all dynamic API route handlers to use `Promise<{ id: string }>` params with `await params`. Added `"types": []` to `tsconfig.json` to suppress phantom `bn.js` declaration errors. GitHub Actions CI went green.  
**Commit:** [`bf5c679`](https://github.com/aditya-jha033/ShadowArena/commit/bf5c679) · [`895183a`](https://github.com/aditya-jha033/ShadowArena/commit/895183a)

---

### #011 — Private Stake Amount Leaks in API

**Tester:** Rajesh Jha  
**Wallet:** [`mn_addr_preprod1ca2980gq8qtdkqppslgv9v8uxjte9pyg9hld9jhs5sp5f2khu2dqh7sm7m`](https://explorer.1am.xyz/address/mn_addr_preprod1ca2980gq8qtdkqppslgv9v8uxjte9pyg9hld9jhs5sp5f2khu2dqh7sm7m?network=preprod)  
**Date:** 2026-09-21 · **Rating:** 6/10 · **Status:** ✅ Resolved

> I chose private stake but my opponent told me they could see my bet amount. private mode doesnt seem to work

**Root Cause:** `/api/matches/open` fetched all stakes with `include: { stakes: true }` and returned them in full, including the `amount` field of private stakes. The `isPrivate` flag was stored but never used to mask the response.  
**Fix:** Rewrote the open-matches endpoint to explicitly check `stake.isPrivate` on each record and nullify `rawStakeAmount` before serialization. The UI now shows a "Private" badge instead of the amount for anonymous games.  
**Commit:** [`d0b61a0`](https://github.com/aditya-jha033/ShadowArena/commit/d0b61a0)

---

### #012 — Mobile Layout Broken

**Tester:** Subhro Dasgupta  
**Wallet:** [`mn_addr_preprod1lwt0jzatpt24w6sm3kp9zzscjku3catfuv98h966xpjej6sm22rq274gj0`](https://explorer.1am.xyz/address/mn_addr_preprod1lwt0jzatpt24w6sm3kp9zzscjku3catfuv98h966xpjej6sm22rq274gj0?network=preprod)  
**Date:** 2026-09-22 · **Rating:** 5/10 · **Status:** ✅ Resolved

> cards go off screen on mobile, cant see last card. lock button also cut off. mobile is basically broken please fix

**Root Cause:** `TableFelt.tsx` rendered 5 fixed-width (100×140 px) cards in a flex row with no overflow handling. On screens narrower than 390 px the last 1–2 cards were fully clipped. The action button container had no bottom clearance for the mobile navigation bar.  
**Fix:** Added `overflow-x-auto snap-x` horizontal scrolling to the card container. Added `pb-24 md:pb-0` to the action button container to clear the 96 px mobile nav bar.  
**Commit:** [`ae6bbdf`](https://github.com/aditya-jha033/ShadowArena/commit/ae6bbdf)

---

### #013 — No Match History on Profile

**Tester:** Partha Mukhopadhyay  
**Wallet:** [`mn_addr_preprod1ah20eglvl9z6k2xlxmtncuvt8smjpah88en5udq5ym4lszcd6r6qa2qdpu`](https://explorer.1am.xyz/address/mn_addr_preprod1ah20eglvl9z6k2xlxmtncuvt8smjpah88en5udq5ym4lszcd6r6qa2qdpu?network=preprod)  
**Date:** 2026-09-22 · **Rating:** 6/10 · **Status:** ✅ Resolved

> no match history on profile page. cant see my past games. need to see history of my wins and losses

**Root Cause:** Profile page displayed cosmetic inventory but had no match history section. No API endpoint existed to query settled matches for a specific wallet.  
**Fix:** Created `/api/matches/history` endpoint querying `MatchPlayer` joined to settled matches for the given wallet — computing result, opponent address, card values, and stake delta. Added `MatchHistoryTable` component to the Profile page rendering this data.  
**Commit:** [`d0b61a0`](https://github.com/aditya-jha033/ShadowArena/commit/d0b61a0) · [`6a78aed`](https://github.com/aditya-jha033/ShadowArena/commit/6a78aed)

---

## Planned Issues

### #014 — Tournament Page Empty

**Tester:** Satyajit Sahoo  
**Wallet:** [`mn_addr_preprod17w4sm7aqytwurxnwywk4scrtv7czjv9kylvg9uc0sf7jklh7f0sqg7c3a8`](https://explorer.1am.xyz/address/mn_addr_preprod17w4sm7aqytwurxnwywk4scrtv7czjv9kylvg9uc0sf7jklh7f0sqg7c3a8?network=preprod)  
**Date:** 2026-09-23 · **Rating:** 7/10 · **Status:** 📋 Planned

> tournament page is completely empty. nothing there at all. please add tournament bracket system

**Planned:** Phase 2 feature. Requires tournament registration flow, bracket generator, and a dedicated escrow contract for prize pool management. Admin seeding will be handled via `/admin/deploy`.

---

## Security Fixes (Audit — September 2026)

The following issues were identified during an internal security audit conducted after the closed beta and have been fully resolved.

| Issue | File | Fix | Commit |
|-------|------|-----|--------|
| Unauthenticated DB wipe endpoint (`/api/matches/clear`) | `app/api/matches/clear/route.ts` | Deleted entirely | [`e351bf2`](https://github.com/aditya-jha033/ShadowArena/commit/e351bf2) |
| `alert()` on wallet not found (jarring UX, unhandled) | `lib/midnight/wallet.ts` | Replaced with `throw Error` → toast | [`1101dd2`](https://github.com/aditya-jha033/ShadowArena/commit/1101dd2) |
| Legacy `fs.readFileSync('.moves.json')` dead code path | `app/api/matches/[id]/finish/route.ts` | Removed; uses Prisma `committedValue` | [`e351bf2`](https://github.com/aditya-jha033/ShadowArena/commit/e351bf2) |
| `tsconfig.tsbuildinfo` committed to repository | `.gitignore` | Added `*.tsbuildinfo` to `.gitignore` | [`52c7dd5`](https://github.com/aditya-jha033/ShadowArena/commit/52c7dd5) |
| `NEXT_PUBLIC_MIDNIGHT_NETWORK: preview` mismatch | `.github/workflows/build.yml` | Fixed to `preprod` | [`895183a`](https://github.com/aditya-jha033/ShadowArena/commit/895183a) |
| Hardcoded `"stake-pool"` string in contracts CI echo | `.github/workflows/contracts.yml` | Fixed to use `$contract` variable | [`895183a`](https://github.com/aditya-jha033/ShadowArena/commit/895183a) |

---

*Last updated: 2026-09-28 · All feedback collected via [Google Form](https://forms.gle/HJHyskV8uUWcaMfE9) and corroborated against verified 1AM Wallet addresses in [`LAUNCH_USERS.md`](./LAUNCH_USERS.md).*
