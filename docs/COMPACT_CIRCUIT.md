# Compact Circuit Logic

Shadow Arena relies on Zero-Knowledge proofs compiled from Midnight's `Compact` language.

## High Card Duel

For the High Card MVP, we use two separate smart contracts to bypass array size limitations:
1. `stake-pool`: Manages the locked tDUST and pays out the winner.
2. `move-validity`: A purely functional ZK circuit that validates card commitments.

### The Flow
1. **Commitment**: Player selects a card locally (e.g. `5`). The local 1AM wallet generates a random 32-byte nonce. The wallet computes `hash(card + nonce)` and submits this cryptographic commitment to the chain. The opponent cannot see the card.
2. **Reveal**: Both players submit their raw card value and their secret nonce. The contract hashes them on-chain and verifies they match the original commitments.
3. **Evaluation**: The contract compares `Card 1` and `Card 2` and determines the winner.
4. **Payout**: The winner calls `claim()` on the `stake-pool` contract, providing the verified state from `move-validity`.

### Private Stakes
For private wagers, the stake amount itself is hashed with a nonce. The contract verifies both players committed to the exact same hash before locking the funds. The public never knows if a match was played for 10 tDUST or 10,000 tDUST.
