# ShadowArena — Usage Guide

How to use the running application, plus the test cases that validate its
core flows.

---

## 1. Connecting Your Wallet

1. Install the **1AM wallet** browser extension and switch it to Midnight's
   **preview network**.
2. Open the ShadowArena app and click **Connect Wallet** in the top nav.
3. Approve the connection request in the 1AM wallet popup.
4. Your truncated wallet address now appears in the nav, and you're routed
   into the **Dashboard**.

## 2. Playing a Match (MVP flow, Phase 1+)

1. From the **Dashboard**, use **Quick Play** to pick a game mode (e.g. Card
   Duel).
2. Click **Find Table** to be matched with an opponent, or **Create Table**
   to open a table others can join.
3. Once seated, your hand is dealt and stored privately in your own wallet —
   only you can see your cards; your opponent sees `CardBack` placeholders.
4. On your turn, click a card to play it. The app generates a ZK proof that
   the move is valid against your real hand and submits it to the chain.
5. Watch the **Proof Badge** stream on the side panel — each accepted move
   shows "Move #N verified ✓" as it lands on-chain.
6. When the match ends, a result modal shows the outcome and a link to view
   the win-condition proof on the Midnight explorer.

## 3. Staking (Phase 2+)

1. Before starting a table, open the **Stake Modal** and enter a wager
   amount (validated against your wallet balance and the table minimum).
2. Confirm the stake in your 1AM wallet — funds lock into the stake-pool
   contract for the duration of the match.
3. On a valid win, payout is released automatically by the contract; you'll
   see a payout confirmation toast and updated balance on your Dashboard.
4. If a match times out or ends in a valid draw, stakes are refunded
   automatically per the contract's timeout logic.

## 4. Private Stakes & Multi-Player Tables (Phase 3+)

1. In the Stake Modal, toggle **Private Wager** — your individual stake
   amount will not be visible to spectators or other players; only the
   aggregate pot and payout validity are public.
2. Larger tables (3–6 players) show additional seats on the `TableFelt`, with
   turn order indicated by the active-seat highlight.

## 5. Cosmetic Assets & Marketplace (Phase 4+)

1. Visit **Profile → Inventory** to see owned cosmetic assets (card backs,
   table skins, tournament passes).
2. Use the **Marketplace** tab to buy, sell, or trade assets.
3. Equip a cosmetic from your inventory — it renders immediately on your next
   table (e.g. a custom `CardBack` skin).

## 6. Tournaments (Phase 5+)

1. Visit **Tournaments**, browse open brackets, and pay the entry-pass cost
   (consumes a tokenized entry-pass asset).
2. Follow your progress on the live bracket view; results feed into the
   public leaderboard, with your stake history remaining private unless you
   opt in to share it from **Profile**.

---

## 7. Test Cases

These are the minimum test cases validated in CI (see
`IMPLEMENTATION_PLAN.md` §7 for the full testing strategy). Each includes
setup, action, and expected result.

### Contract Tests

**TC-01 — Valid move produces an accepted proof**
- *Setup:* Player has a hand containing card `7♣`.
- *Action:* Player plays `7♣`.
- *Expected:* Circuit produces a valid proof; move is accepted and appears in
  the public move log.

**TC-02 — Invalid move cannot produce a proof**
- *Setup:* Player's real hand does not contain `A♠`.
- *Action:* Player attempts to play `A♠`.
- *Expected:* Circuit fails to generate a valid proof; the move is rejected
  client-side before any chain submission, and no invalid move ever appears
  on-chain.

**TC-03 — Payout only releases on a verified win-proof**
- *Setup:* Match has ended; Player A attempts to claim payout without a
  corresponding valid win-condition proof.
- *Action:* Submit payout claim.
- *Expected:* Stake-pool contract rejects the claim; funds remain locked
  until a valid win-proof is submitted.

**TC-04 — Private stake amount is not readable by spectators (Phase 3+)**
- *Setup:* Two players stake privately at a table; a third wallet observes
  as a non-participant.
- *Action:* Observer queries the table state.
- *Expected:* Observer can see the match is active and the final payout is
  valid, but cannot recover either player's individual stake amount.

### Frontend Tests

**TC-05 — Wallet connect button reflects connection state**
- *Setup:* No wallet connected.
- *Action:* Click Connect Wallet, approve in mock 1AM provider.
- *Expected:* Button updates to show the truncated wallet address; nav routes
  to Dashboard.

**TC-06 — Stake modal validates wager amount**
- *Setup:* Wallet balance = 40 tokens, table minimum = 10 tokens.
- *Action:* Enter a stake of 50 tokens.
- *Expected:* Inline error "Insufficient balance"; Confirm button disabled.

**TC-07 — Hidden vs. own hand renders correctly**
- *Setup:* Two-seat table, mock game state with Player A's real hand and
  Player B's hidden hand.
- *Action:* Render `TableFelt` as Player A.
- *Expected:* Player A's own cards render face-up with real values; Player
  B's seat renders `CardBack` placeholders only.

### Integration / E2E Tests (Playwright)

**TC-08 — Full match happy path**
- *Setup:* Two browser contexts, each with a funded testnet wallet on
  preview network.
- *Action:* Both connect, join the same table, stake, and play a full match
  to completion.
- *Expected:* Match settles, winner's balance increases by the correct payout
  amount, loser's balance decreases by their stake, and both can view the
  win-condition proof.

**TC-09 — Disconnect mid-turn triggers correct forfeit/timeout handling**
- *Setup:* Active match, Player B mid-turn.
- *Action:* Close Player B's browser context (simulating disconnect) and
  wait past the turn timer.
- *Expected:* Match resolves via timeout rules (forfeit or refund per game
  config), and Player A sees the correct end-of-game result.

Run all suites with:

```bash
# contract tests
cd contracts && npm run test

# frontend unit/integration tests
cd apps/web && npm run test

# E2E (Playwright), once configured
cd apps/web && npx playwright test
```