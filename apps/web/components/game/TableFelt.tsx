"use client";

import { useState } from "react";
import { PlayingCard } from "./PlayingCard";
import { Button } from "@/components/ui/button";

import { toast } from "sonner";
import { useWalletStore } from "@/lib/midnight/wallet";

export function TableFelt({ 
  cardBackSkin,
  contractAddress,
}: { 
  cardBackSkin?: string;
  contractAddress?: string;
}) {
  const [hasCommitted, setHasCommitted] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [opponentCard, setOpponentCard] = useState<number | null>(null);
  const { walletAddress } = useWalletStore();

  const [selectedCard, setSelectedCard] = useState<number | null>(null);

  const myHand = [2, 5, 8, 10]; // Example hand for MVP

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCommit = async () => {
    if (selectedCard === null) {
      toast.error("Please select a card first.");
      return;
    }

    setIsSubmitting(true);
    toast.info("Generating ZK Proof for your move... Check 1AM Wallet", { id: "commit-toast", duration: Infinity });

    try {
      if (!contractAddress) {
        throw new Error("Game contract address is missing from the database. Please try recreating the table.");
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w1am = (window as any).midnight?.["1am"];
      if (!w1am) throw new Error("1AM Wallet not found");
      
      const api = await w1am.connect("preprod");
      const { callMidnightCircuit } = await import("@/lib/midnight/deploy");
      const { pureCircuits } = await import("@/lib/midnight/contracts/move-validity/contract");
      
      // Generate a real cryptographic 32-byte nonce
      const myNonce = new Uint8Array(32);
      crypto.getRandomValues(myNonce);

      // Compute the real ZK commitment locally using the exported pure circuit!
      const realCommitment = pureCircuits.makeCommitment(BigInt(selectedCard), myNonce);

      const withRetry = async <T,>(operation: () => Promise<T>, retries = 6, delay = 5000): Promise<T> => {
        for (let i = 0; i < retries; i++) {
          try {
            return await operation();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (e: any) {
            if (e.message?.includes("Wallet busy") && i < retries - 1) {
              console.log(`Wallet busy, retrying in ${delay/1000}s...`);
              await new Promise(r => setTimeout(r, delay));
            } else {
              throw e;
            }
          }
        }
        throw new Error("Wallet remained busy for too long.");
      };

      let txHash = "";
      let playerRole = "p1";
      
      // Determine role based on backend state
      const stateRes = await fetch(`/api/matches/${contractAddress}/moves`);
      const stateData = await stateRes.json();
      
      if (stateData.p1) {
        playerRole = "p2";
      }

      try {
        if (playerRole === "p1") {
          txHash = await withRetry(() => callMidnightCircuit(api, "move-validity", contractAddress, "joinPlayer1", [realCommitment]));
        } else {
          txHash = await withRetry(() => callMidnightCircuit(api, "move-validity", contractAddress, "joinPlayer2", [realCommitment]));
        }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        const msg = e?.message || "";
        if (msg.includes("is undefined for contract state")) {
          throw new Error("You pasted the wrong contract address! Please make sure you paste the 'move-validity' contract address, not the stake pool.");
        }
        if (msg.includes("Not waiting") || msg.includes("failed assert")) {
           throw new Error("This table's smart contract is already locked or finished. Please go to the Lobby and create a new Table!");
        }
        throw e;
      }

      // Save pre-images to the backend so the opponent can fetch them for the reveal step
      await fetch(`/api/matches/${contractAddress}/moves`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ player: playerRole, value: selectedCard, nonce: Array.from(myNonce) }),
      });

      setHasCommitted(true);
      toast.success("Move committed to Midnight network! ✓", {
        id: "commit-toast",
        description: `Card ${selectedCard} locked. Tx: ${txHash.slice(0, 10)}...${txHash.slice(-8)}`,
        duration: 8000,
        action: {
          label: "Verify on Explorer",
          onClick: () => window.open(`https://preprod.midnightexplorer.com/transactions/${txHash}`, "_blank", "noopener,noreferrer"),
        },
      });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to commit move", { id: "commit-toast", description: e?.message || "Unknown error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReveal = async () => {
    setIsSubmitting(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let moves: any = null;
    try {
      toast.info("Fetching opponent's pre-image and executing ZK Reveal...", { id: "reveal-toast" });
      
      const res = await fetch(`/api/matches/${contractAddress}/moves`);
      moves = await res.json();
      
      if (!moves.p1 || !moves.p2) {
        throw new Error("Cannot reveal yet: Both players have not committed to the backend.");
      }

      // Reconstruct nonces from array format
      const p1Nonce = new Uint8Array(moves.p1.nonce);
      const p2Nonce = new Uint8Array(moves.p2.nonce);
      const p1Value = BigInt(moves.p1.value);
      const p2Value = BigInt(moves.p2.value);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w1am = (window as any).midnight?.["1am"];
      const api = await w1am.connect("preprod");
      const { callMidnightCircuit } = await import("@/lib/midnight/deploy");

      const withRetry = async <T,>(operation: () => Promise<T>, retries = 6, delay = 5000): Promise<T> => {
        for (let i = 0; i < retries; i++) {
          try {
            return await operation();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (e: any) {
            if (e.message?.includes("Wallet busy") && i < retries - 1) {
              console.log(`Wallet busy, retrying in ${delay/1000}s...`);
              await new Promise(r => setTimeout(r, delay));
            } else {
              throw e;
            }
          }
        }
        throw new Error("Wallet remained busy for too long.");
      };

      // Execute the REAL reveal smart contract circuit!
      await withRetry(() => callMidnightCircuit(api, "move-validity", contractAddress!, "reveal", [p1Value, p1Nonce, p2Value, p2Nonce]));
      
      setIsRevealed(true);
      
      const myValue = selectedCard!;
      const opValue = moves.p1.value === myValue ? moves.p2.value : moves.p1.value;
      setOpponentCard(opValue);
      let resultStr = "loss";
      if (myValue > opValue) resultStr = "win";
      else if (myValue === opValue) resultStr = "draw";

      toast.success(
        resultStr === "win" ? 'Match finished! You Win!' : resultStr === "draw" ? 'Match finished! It\'s a Draw!' : 'Match finished! Opponent Wins!', 
        { id: "reveal-toast" }
      );
      
      // Tell backend the match is finished so it cleans up the lobby/dashboard
      await fetch(`/api/matches/${contractAddress}/finish`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress, result: resultStr }),
        keepalive: true
      });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      if (e.message?.includes("Not in reveal state")) {
        // The opponent likely already clicked reveal and settled the contract!
        setIsRevealed(true);
        // We still have the moves from the API, so we can show the result locally
        const opponentVal = moves.p1.value === selectedCard ? moves.p2.value : moves.p1.value;
        setOpponentCard(opponentVal);
        const myValue = selectedCard!;
        const opValue = moves.p1.value === myValue ? moves.p2.value : moves.p1.value;
        let resultStr = "loss";
        if (myValue > opValue) resultStr = "win";
        else if (myValue === opValue) resultStr = "draw";

        toast.success(
          resultStr === "win" ? 'Match finished! You Win!' : resultStr === "draw" ? 'Match finished! It\'s a Draw!' : 'Match finished! Opponent Wins!', 
          { id: "reveal-toast" }
        );
        
        // Ensure backend marks it as finished
        await fetch(`/api/matches/${contractAddress}/finish`, { 
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ walletAddress, result: resultStr }),
          keepalive: true
        });
        return;
      }
      toast.error(e.message || "Failed to reveal on-chain.", { id: "reveal-toast" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-6rem)] md:h-[calc(100vh-8rem)] flex items-center justify-center p-2 md:p-4 overflow-hidden bg-background">
      
      {/* The Poker Table Outer Edge (Wood/Leather) */}
      <div className="relative w-full max-w-5xl h-full max-h-[800px] min-h-[600px] rounded-[100px] md:rounded-[200px] border-[12px] md:border-[16px] border-[#2A1610] bg-black shadow-[0_30px_60px_rgba(0,0,0,0.8),inset_0_10px_20px_rgba(0,0,0,0.5)] flex items-center justify-center p-3 md:p-6">
        
        {/* The Table Felt (Emerald Green) — now a flex column grid, no absolute children */}
        <div className="relative w-full h-full rounded-[90px] md:rounded-[180px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-800 to-emerald-950 shadow-[inset_0_0_80px_rgba(0,0,0,0.9)] border border-emerald-700/30 flex flex-col items-center justify-between py-8 px-4 overflow-hidden">
          
          {/* Subtle felt texture */}
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/black-felt.png')]" />

          {/* ── ROW 1: Opponent Area ── */}
          <div className="relative z-20 flex flex-col items-center gap-3">
            <div className="px-6 py-1.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-sm text-sm text-white/70 font-medium">
              Opponent
            </div>
            {hasCommitted ? (
              <div className="scale-90">
                <PlayingCard 
                  isHidden={!isRevealed} 
                  value={opponentCard ?? undefined} 
                  skin={cardBackSkin} 
                />
              </div>
            ) : (
              <div className="w-20 h-28 md:w-24 md:h-36 rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center bg-black/20 text-white/30 text-sm">
                Waiting...
              </div>
            )}
          </div>

          {/* ── ROW 2: Center Pot (middle row, doesn't push other rows) ── */}
          <div className="relative z-30 flex flex-col items-center">
            <div className="relative flex items-center justify-center w-28 h-28 md:w-32 md:h-32 rounded-full border border-yellow-500/20 bg-black/40 shadow-[0_0_30px_rgba(212,175,55,0.15)] backdrop-blur-md">
              <div className="absolute inset-0 rounded-full border border-yellow-500/10 animate-[spin_10s_linear_infinite]" />
              <div className="flex flex-col items-center">
                <span className="text-xs text-yellow-500/70 font-mono tracking-widest uppercase mb-1">Total Pot</span>
                <span className="text-2xl font-black text-yellow-500 tracking-tighter">1,000</span>
                <span className="text-[10px] text-yellow-500/50 uppercase mt-1">tDUST</span>
              </div>
            </div>
          </div>

          {/* ── ROW 3: Player Area ── */}
          <div className="relative z-40 flex flex-col items-center gap-3 w-full">
            
            {/* Action Button — always fully visible in its own row */}
            <div className="flex items-center justify-center">
              {!hasCommitted ? (
                <Button 
                  size="lg" 
                  onClick={handleCommit} 
                  disabled={isSubmitting || selectedCard === null}
                  className="rounded-full px-10 py-3 bg-gradient-to-r from-yellow-600 to-amber-500 hover:from-yellow-500 hover:to-amber-400 text-black font-black text-base shadow-[0_0_30px_rgba(212,175,55,0.5)] hover:shadow-[0_0_40px_rgba(212,175,55,0.7)] transition-all disabled:opacity-40 disabled:shadow-none border-2 border-yellow-400/50"
                >
                  {isSubmitting ? "⚙️ Generating Proof..." : "🔒 Lock in Bet"}
                </Button>
              ) : !isRevealed ? (
                <Button 
                  size="lg"
                  onClick={handleReveal}
                  disabled={isSubmitting}
                  className="rounded-full px-10 py-3 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-black text-base shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:shadow-[0_0_40px_rgba(16,185,129,0.7)] transition-all border-2 border-emerald-400/50"
                >
                  {isSubmitting ? "⚙️ Verifying ZK Proof..." : "⚡ Reveal & Settle"}
                </Button>
              ) : (
                <div className="px-8 py-3 rounded-full bg-black/80 border-2 border-yellow-500/50 text-yellow-400 font-black tracking-widest uppercase text-sm shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                  ✓ Match Settled
                </div>
              )}
            </div>

            {/* Player Cards */}
            <div className="flex items-center justify-center gap-2 md:gap-3">
              {myHand.map((cardValue) => (
                <div key={cardValue} className={!hasCommitted ? "cursor-pointer" : "opacity-50 pointer-events-none"}>
                  <PlayingCard
                    value={cardValue}
                    isSelected={selectedCard === cardValue}
                    onClick={() => !hasCommitted && setSelectedCard(cardValue)}
                  />
                </div>
              ))}
            </div>

            {/* Player Info Tag */}
            <div className="px-4 py-1.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-sm text-xs md:text-sm text-white/90 font-bold flex items-center gap-2 shadow-lg">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              You ({walletAddress ? `${walletAddress.slice(0,6)}...${walletAddress.slice(-4)}` : 'Connecting...'})
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
