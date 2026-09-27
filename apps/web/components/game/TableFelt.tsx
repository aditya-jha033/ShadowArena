"use client";

import { useState, useEffect, useCallback } from "react";
import { PlayingCard } from "./PlayingCard";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useWalletStore } from "@/lib/midnight/wallet";
import { Loader2, Lock, Clock, CheckCircle2, Trophy, Handshake } from "lucide-react";

type GamePhase =
  | "WAITING_P2"       // P1 waiting for opponent to join the table
  | "DEALING"          // Fetching hand from server
  | "SELECT_CARD"      // Player picks a card from their hand
  | "WAITING_COMMIT"   // Player locked in — waiting for opponent to also commit
  | "REVEAL_READY"     // Both committed — either player can trigger reveal
  | "SETTLED";         // Match over — result shown

function cardLabel(v: number) {
  if (v === 11) return "J";
  if (v === 12) return "Q";
  if (v === 13) return "K";
  if (v === 14) return "A";
  return String(v);
}

export function TableFelt({
  matchId,
  cardBackSkin,
  contractAddress,
  stakeAmount,
  matchStatus,
}: {
  matchId: string;
  cardBackSkin?: string;
  contractAddress?: string;
  stakeAmount?: number;
  matchStatus?: string;
}) {
  const { walletAddress } = useWalletStore();

  const [phase, setPhase] = useState<GamePhase>(matchStatus === "active" ? "DEALING" : "WAITING_P2");
  const [myHand, setMyHand] = useState<number[]>([]);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [opponentCard, setOpponentCard] = useState<number | null>(null);
  const [myCard, setMyCard] = useState<number | null>(null);
  const [result, setResult] = useState<"win" | "loss" | "draw" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pot] = useState(stakeAmount ? stakeAmount * 2 : 0);

  // Fetch hand from server (each player gets only their own cards)
  const fetchHand = useCallback(async () => {
    if (!walletAddress) return;
    try {
      const res = await fetch(`/api/matches/${matchId}/hand?wallet=${walletAddress}`);
      if (res.status === 202) {
        // Hand not dealt yet — still waiting for P2 to join
        return;
      }
      if (!res.ok) return;
      const data = await res.json();
      setMyHand(data.hand);
      if (data.hasCommitted) {
        setPhase("WAITING_COMMIT");
      } else {
        setPhase("SELECT_CARD");
      }
    } catch {
      // silent
    }
  }, [walletAddress, matchId]);

  // Poll match status until P2 joins (WAITING_P2 → DEALING)
  useEffect(() => {
    if (phase !== "WAITING_P2") return;
    const poll = async () => {
      const res = await fetch(`/api/matches/${matchId}/status`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.isFull) {
        setPhase("DEALING");
      }
    };
    poll();
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [phase, matchId]);

  // When phase becomes DEALING, fetch the hand
  useEffect(() => {
    if (phase === "DEALING") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchHand();
    }
  }, [phase, fetchHand]);

  // Poll move state while WAITING_COMMIT — both committed → REVEAL_READY
  useEffect(() => {
    if (phase !== "WAITING_COMMIT") return;
    const poll = async () => {
      const res = await fetch(`/api/matches/${matchId}/moves`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.p1 && data.p2) {
        setPhase("REVEAL_READY");
      }
    };
    poll();
    const interval = setInterval(poll, 4000);
    return () => clearInterval(interval);
  }, [phase, matchId]);

  const withRetry = async <T,>(operation: () => Promise<T>, retries = 6, delay = 5000): Promise<T> => {
    for (let i = 0; i < retries; i++) {
      try {
        return await operation();
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "";
        if (msg.includes("Wallet busy") && i < retries - 1) {
          await new Promise(r => setTimeout(r, delay));
        } else {
          throw e;
        }
      }
    }
    throw new Error("Wallet remained busy for too long.");
  };

  const handleCommit = async () => {
    if (selectedCard === null) {
      toast.error("Please select a card first.");
      return;
    }
    if (!contractAddress) {
      toast.error("Game contract address is missing. Please recreate the table.");
      return;
    }
    if (!walletAddress) {
      toast.error("Wallet not connected.");
      return;
    }

    setIsSubmitting(true);
    toast.info("Generating ZK Proof... Check 1AM Wallet", { id: "commit-toast", duration: Infinity });

    try {
      const w1am = (window as { midnight?: { "1am"?: unknown } }).midnight?.["1am"] as {
        connect: (n: string) => Promise<unknown>;
      } | undefined;
      if (!w1am) throw new Error("1AM Wallet not found. Install it from the Chrome Web Store.");

      const api = await w1am.connect("preprod");
      const { callMidnightCircuit } = await import("@/lib/midnight/deploy");
      const { pureCircuits } = await import("@/lib/midnight/contracts/move-validity/contract");

      // Generate real cryptographic 32-byte nonce
      const myNonce = new Uint8Array(32);
      crypto.getRandomValues(myNonce);

      // Compute ZK commitment locally using the compiled pure circuit
      const commitment = pureCircuits.makeCommitment(BigInt(selectedCard), myNonce);

      // Determine player seat from backend
      const stateRes = await fetch(`/api/matches/${matchId}/moves`);
      const stateData = await stateRes.json();
      const playerRole = stateData.p1 ? "p2" : "p1";

      const circuitName = playerRole === "p1" ? "joinPlayer1" : "joinPlayer2";
      let txHash = "";

      try {
        txHash = await withRetry(() =>
          callMidnightCircuit(api as Parameters<typeof callMidnightCircuit>[0], "move-validity", contractAddress, circuitName, [commitment])
        );
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "";
        if (msg.includes("is undefined for contract state")) {
          throw new Error("Wrong contract address! Paste the 'move-validity' contract address, not the stake pool.");
        }
        if (msg.includes("Not waiting") || msg.includes("failed assert")) {
          throw new Error("This table's contract is already locked. Go to the Lobby and create a new table.");
        }
        throw e;
      }

      // Store pre-image in DB so opponent can fetch for the reveal
      await fetch(`/api/matches/${matchId}/moves`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress, value: selectedCard, nonce: Array.from(myNonce) }),
      });

      setMyCard(selectedCard);
      setPhase("WAITING_COMMIT");
      toast.success("Card locked on Midnight! ✓", {
        id: "commit-toast",
        description: `Card ${cardLabel(selectedCard)} committed. Tx: ${txHash.slice(0, 10)}...${txHash.slice(-8)}`,
        duration: 8000,
        action: {
          label: "Verify on Explorer",
          onClick: () => window.open(`https://preprod.midnightexplorer.com/transactions/${txHash}`, "_blank", "noopener,noreferrer"),
        },
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      toast.error("Failed to commit move", { id: "commit-toast", description: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReveal = async () => {
    if (!contractAddress || !walletAddress) return;
    setIsSubmitting(true);
    toast.info("Fetching pre-images and executing ZK Reveal...", { id: "reveal-toast" });

    try {
      const res = await fetch(`/api/matches/${matchId}/moves`);
      const moves = await res.json();

      if (!moves.p1 || !moves.p2) {
        throw new Error("Both players must commit before revealing.");
      }

      const p1Nonce = new Uint8Array(moves.p1.nonce);
      const p2Nonce = new Uint8Array(moves.p2.nonce);
      const p1Value = BigInt(moves.p1.value);
      const p2Value = BigInt(moves.p2.value);

      const w1am = (window as { midnight?: { "1am"?: unknown } }).midnight?.["1am"] as {
        connect: (n: string) => Promise<unknown>;
      } | undefined;
      if (!w1am) throw new Error("1AM Wallet not found.");
      const api = await w1am.connect("preprod");
      const { callMidnightCircuit } = await import("@/lib/midnight/deploy");

      // Execute the real reveal circuit — smart contract verifies both ZK commitments
      // and automatically pays out to the winner (or refunds on draw)
      await withRetry(() =>
        callMidnightCircuit(api as Parameters<typeof callMidnightCircuit>[0], "move-validity", contractAddress, "reveal", [p1Value, p1Nonce, p2Value, p2Nonce])
      );

      // Determine result locally for display
      const myCommittedCard = myCard ?? selectedCard!;
      const isP1 = moves.p1.value === myCommittedCard;
      const opCard = isP1 ? moves.p2.value : moves.p1.value;
      setOpponentCard(opCard);

      let resultStr: "win" | "loss" | "draw" = "loss";
      if (myCommittedCard > opCard) resultStr = "win";
      else if (myCommittedCard === opCard) resultStr = "draw";
      setResult(resultStr);
      setPhase("SETTLED");

      const msg =
        resultStr === "win"
          ? `You Win! +${pot} tDUST`
          : resultStr === "draw"
          ? "Draw — stakes refunded"
          : "Opponent wins!";
      toast.success(msg, { id: "reveal-toast", duration: 10000 });

      await fetch(`/api/matches/${matchId}/finish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress, result: resultStr }),
        keepalive: true,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to reveal on-chain.";
      if (msg.includes("Not in reveal state")) {
        // Opponent already settled — pull result from API
        const movesRes = await fetch(`/api/matches/${matchId}/moves`);
        const moves = await movesRes.json();
        if (moves.p1 && moves.p2) {
          const myCommittedCard = myCard ?? selectedCard!;
          const isP1 = moves.p1.value === myCommittedCard;
          const opCard = isP1 ? moves.p2.value : moves.p1.value;
          setOpponentCard(opCard);
          let resultStr: "win" | "loss" | "draw" = "loss";
          if (myCommittedCard > opCard) resultStr = "win";
          else if (myCommittedCard === opCard) resultStr = "draw";
          setResult(resultStr);
          setPhase("SETTLED");
          const summary = resultStr === "win" ? `You Win! +${pot} tDUST` : resultStr === "draw" ? "Draw — refunded" : "Opponent wins!";
          toast.success(summary, { id: "reveal-toast" });
          await fetch(`/api/matches/${matchId}/finish`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ walletAddress, result: resultStr }),
            keepalive: true,
          });
        }
        return;
      }
      toast.error(msg, { id: "reveal-toast" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Phase-specific overlays ───────────────────────────────────────────────

  const renderCenter = () => {
    if (phase === "WAITING_P2") {
      return (
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
            <Clock className="w-7 h-7 text-yellow-400 animate-pulse" />
          </div>
          <p className="text-white/60 text-sm font-medium">Waiting for opponent to join...</p>
          <p className="text-white/30 text-xs font-mono">Share the table link to invite a challenger</p>
        </div>
      );
    }
    if (phase === "DEALING") {
      return (
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
          <p className="text-white/50 text-sm">Dealing your hand...</p>
        </div>
      );
    }
    if (phase === "WAITING_COMMIT") {
      return (
        <div className="flex flex-col items-center gap-3 text-center">
          <Lock className="w-7 h-7 text-emerald-400" />
          <p className="text-emerald-400/80 text-sm font-medium">Your card is locked ✓</p>
          <p className="text-white/30 text-xs font-mono">Waiting for opponent to commit...</p>
        </div>
      );
    }
    if (phase === "SETTLED" && result) {
      const icon = result === "win" ? <Trophy className="w-8 h-8 text-yellow-400" /> : result === "draw" ? <Handshake className="w-8 h-8 text-blue-400" /> : <CheckCircle2 className="w-8 h-8 text-red-400/60" />;
      const label = result === "win" ? `You Win! +${pot} tDUST` : result === "draw" ? "Draw — Refunded" : "Opponent Wins";
      const color = result === "win" ? "text-yellow-400" : result === "draw" ? "text-blue-400" : "text-red-400/70";
      return (
        <div className="flex flex-col items-center gap-2 text-center">
          {icon}
          <p className={`font-black text-lg uppercase tracking-widest ${color}`}>{label}</p>
        </div>
      );
    }
    // Default pot display
    return (
      <div className="flex flex-col items-center">
        <span className="text-xs text-yellow-500/70 font-mono tracking-widest uppercase mb-1">Total Pot</span>
        <span className="text-2xl font-black text-yellow-500 tracking-tighter">
          {pot > 0 ? pot.toLocaleString() : "—"}
        </span>
        <span className="text-[10px] text-yellow-500/50 uppercase mt-1">tDUST</span>
      </div>
    );
  };

  const renderActionButton = () => {
    if (phase === "WAITING_P2" || phase === "DEALING") return null;

    if (phase === "SELECT_CARD") {
      return (
        <Button
          size="lg"
          onClick={handleCommit}
          disabled={isSubmitting || selectedCard === null}
          className="rounded-full px-10 py-3 bg-gradient-to-r from-yellow-600 to-amber-500 hover:from-yellow-500 hover:to-amber-400 text-black font-black text-base shadow-[0_0_30px_rgba(212,175,55,0.5)] hover:shadow-[0_0_40px_rgba(212,175,55,0.7)] transition-all disabled:opacity-40 disabled:shadow-none border-2 border-yellow-400/50"
        >
          {isSubmitting ? "⚙️ Generating Proof..." : selectedCard ? `🔒 Lock in ${cardLabel(selectedCard)}` : "🃏 Select a Card"}
        </Button>
      );
    }

    if (phase === "WAITING_COMMIT") {
      return (
        <div className="px-8 py-3 rounded-full bg-emerald-900/40 border border-emerald-500/30 text-emerald-400/80 font-bold text-sm flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Waiting for opponent...
        </div>
      );
    }

    if (phase === "REVEAL_READY") {
      return (
        <Button
          size="lg"
          onClick={handleReveal}
          disabled={isSubmitting}
          className="rounded-full px-10 py-3 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-black text-base shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:shadow-[0_0_40px_rgba(16,185,129,0.7)] transition-all border-2 border-emerald-400/50"
        >
          {isSubmitting ? "⚙️ Verifying ZK Proof..." : "⚡ Reveal & Settle"}
        </Button>
      );
    }

    if (phase === "SETTLED") {
      return (
        <div className="px-8 py-3 rounded-full bg-black/80 border-2 border-yellow-500/50 text-yellow-400 font-black tracking-widest uppercase text-sm shadow-[0_0_20px_rgba(212,175,55,0.3)]">
          ✓ Match Settled On-Chain
        </div>
      );
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-6rem)] md:h-[calc(100vh-8rem)] flex items-center justify-center p-2 md:p-4 overflow-hidden bg-background">
      {/* Table outer edge */}
      <div className="relative w-full max-w-5xl h-full max-h-[800px] min-h-[600px] rounded-[100px] md:rounded-[200px] border-[12px] md:border-[16px] border-[#2A1610] bg-black shadow-[0_30px_60px_rgba(0,0,0,0.8),inset_0_10px_20px_rgba(0,0,0,0.5)] flex items-center justify-center p-3 md:p-6">
        {/* Felt */}
        <div className="relative w-full h-full rounded-[90px] md:rounded-[180px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-800 to-emerald-950 shadow-[inset_0_0_80px_rgba(0,0,0,0.9)] border border-emerald-700/30 flex flex-col items-center justify-between py-8 px-4 overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/black-felt.png')]" />

          {/* Opponent area */}
          <div className="relative z-20 flex flex-col items-center gap-3">
            <div className="px-6 py-1.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-sm text-sm text-white/70 font-medium">
              Opponent
            </div>
            <div className="scale-90">
              <PlayingCard
                isHidden={phase !== "SETTLED"}
                value={phase === "SETTLED" && opponentCard !== null ? opponentCard : undefined}
                skin={cardBackSkin}
              />
            </div>
          </div>

          {/* Center */}
          <div className="relative z-30 flex flex-col items-center">
            <div className="relative flex items-center justify-center w-28 h-28 md:w-36 md:h-36 rounded-full border border-yellow-500/20 bg-black/40 shadow-[0_0_30px_rgba(212,175,55,0.15)] backdrop-blur-md">
              <div className="absolute inset-0 rounded-full border border-yellow-500/10 animate-[spin_10s_linear_infinite]" />
              <div className="relative z-10">
                {renderCenter()}
              </div>
            </div>
          </div>

          {/* Player area */}
          <div className="relative z-40 flex flex-col items-center gap-3 w-full">
            {/* Action button */}
            <div className="flex items-center justify-center">
              {renderActionButton()}
            </div>

            {/* Hand — only shown once dealt */}
            {myHand.length > 0 && (
              <div className="flex items-center justify-center gap-2 md:gap-3">
                {myHand.map((cardValue) => (
                  <div
                    key={cardValue}
                    className={phase === "SELECT_CARD" ? "cursor-pointer" : "opacity-50 pointer-events-none"}
                  >
                    <PlayingCard
                      value={cardValue}
                      isSelected={selectedCard === cardValue}
                      onClick={() => phase === "SELECT_CARD" && setSelectedCard(cardValue)}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Player tag */}
            <div className="px-4 py-1.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-sm text-xs md:text-sm text-white/90 font-bold flex items-center gap-2 shadow-lg">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              You ({walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "Connecting..."})
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
