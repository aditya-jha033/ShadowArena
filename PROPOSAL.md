# ShadowArena — Project Proposal

**Hidden-Information Gaming with Verifiable Stakes on Midnight**

---

## 1. Summary

ShadowArena is a decentralized gaming platform that makes true hidden-information
gameplay possible on-chain — card games, dice, bluffing games, and fog-of-war
strategy games — by keeping each player's private state (hand, rolls, hidden
units) local and encrypted, while every move is accompanied by a zero-knowledge
proof of validity. Wagers and payouts settle through Compact smart contracts on
Midnight, with the option to keep individual stake sizes private from
spectators and other players.

## 2. Problem Statement

Blockchains are transparent by default. Most popular game genres depend on
hidden information to function:

- A card game where opponents can see your hand isn't a card game.
- A strategy game with visible fog-of-war units isn't strategic.
- A betting table where every stake is public exposes players to targeting
  based on visible wealth or win/loss history.

Existing "provably fair" gambling dApps solve this by trusting a centralized
server with hidden state — which defeats the purpose of decentralization — or
by avoiding hidden-information genres entirely. There is no widely-adopted,
fully decentralized platform that supports real hidden game state **and** real
financial stakes with cryptographic fairness guarantees.

## 3. Proposed Solution

ShadowArena uses Midnight's Compact language to build ZK circuits that prove
game-move validity without revealing the underlying private state:

- A played card was genuinely in the player's hand.
- A move followed the game's rules.
- A shuffle or deal was fair and unbiased.
- A declared win condition is actually true, given hidden state that stays hidden.

Stakes are held in a Compact stake-pool contract. Payout to the winner is
proven correct on-chain; spectators see that the game was fair without
necessarily seeing either player's cards or bet size.

## 4. Unique Selling Points

| USP | Why it matters |
|---|---|
| True hidden-information gameplay on-chain | Almost no existing blockchain game offers this without a trusted server |
| Provably fair, no trusted dealer | Shuffle, deal, and move validity all proven via ZK circuits |
| Private stakes | Bet sizes and win/loss history can stay confidential, protecting players from targeting |
| Cheat-proof by construction | An invalid move simply cannot produce a valid proof |

## 5. Monetization Model

1. **Rake / table fee** — a small percentage taken from each game's stake pool,
   the same model used by poker platforms and casinos today.
2. **Tokenized in-game assets** — cosmetic cards, skins, and tournament entry
   passes that can be bought, sold, or wagered as tokenized assets within the
   ecosystem (introduced in Phase 4).

## 6. Real-World Example Flow

1. Two players sit down for a private card game, staking 50 tokens each.
2. Hands are dealt and stored privately in each player's own wallet; neither
   can see the other's cards.
3. Each move (play a card, fold, raise) is submitted with a ZK proof that it's
   valid given the player's real hidden hand — without revealing that hand.
4. At the end, the winning hand is proven valid and the contract distributes
   payout automatically.
5. The loser can verify they lost fairly without ever seeing the winner's
   cards. If the table is configured for private wagers, spectators never
   learn either player's exact stake.

## 7. Architecture Overview

```
Player A / Player B → private game state (hand, rolls) stored locally, never shared
        │
        ▼
   Each Move → Compact circuit proves move validity against private state
        │
        ▼
   Midnight Chain → verifies move proofs, updates public game log
        │                        (moves valid, no hidden data exposed)
        ▼
   Stake Pool Contract → holds wagers, releases payout once win-condition proof verifies
        │
        ▼
   Spectators / Public → see game outcome and payout validity,
                          not hands or (optionally) stake sizes
```

## 8. Phase Roadmap (Summary)

| Phase | Deliverable |
|---|---|
| 1 | MVP: single hidden-info game (card duel / dice-guess), 2 players, no real stakes |
| 2 | Real token staking with automatic proven payout |
| 3 | Private bet sizing + 3–6 player tables |
| 4 | Tokenized in-game assets (cosmetics, tournament passes) |
| 5 | Tournament mode, leaderboards, rake-based revenue live at market launch |

See `SETUP.md` for setup instructions.

## 9. Ask to the Midnight Team

We'd welcome guidance on circuit design for turn-based hidden-state games and
shuffle/deal fairness proofs specifically, and would like to pilot a simple
two-player game on testnet as a first proof of concept.