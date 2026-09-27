/**
 * Midnight Contract Bridge Layer — ShadowArena
 *
 * Two Compact circuits are deployed on Midnight Preprod Network:
 *
 *   stake-pool.compact
 *     → Escrow for both players' tDUST stakes
 *     → Circuits: stakePlayer1(), stakePlayer2(), stakePrivate(), refund(), payout()
 *
 *   move-validity.compact
 *     → ZK commitment scheme for the card game
 *     → Circuits: joinPlayer1(commitment), joinPlayer2(commitment), reveal(p1Val, p1Nonce, p2Val, p2Nonce)
 *     → Pure circuit: makeCommitment(value, nonce) — run locally in the browser
 *     → The contract determines the winner by comparing revealed values.
 *       Winner receives 2× the staked amount automatically.
 *       On a draw (equal values), both players are refunded.
 *
 * All real circuit calls go through: lib/midnight/deploy.ts → callMidnightCircuit()
 * The 1AM Wallet (window.midnight["1am"]) handles ZK proof generation locally.
 */

export interface GameContractState {
  state: "WAITING_P1" | "WAITING_P2" | "REVEAL" | "FINISHED";
  p1Address: string | null;
  p2Address: string | null;
  winnerAddress: string | null;
  isDraw: boolean;
}
