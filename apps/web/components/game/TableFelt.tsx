"use client";

import { useState } from "react";
import { PlayingCard } from "./PlayingCard";
import { Button } from "@/components/ui/button";

import { toast } from "sonner";
import { useWalletStore } from "@/lib/midnight/wallet";

export function TableFelt({ 
  players = 4,
  tableSkin = "from-secondary/5",
  cardBackSkin,
  contractAddress,
}: { 
  players?: number;
  tableSkin?: string;
  cardBackSkin?: string;
  contractAddress?: string;
}) {
  const [hasCommitted, setHasCommitted] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [opponentCard, setOpponentCard] = useState<number | null>(null);
  const { walletAddress } = useWalletStore();

  const [selectedCard, setSelectedCard] = useState<number | null>(null);

  const myHand = [2, 5, 8, 10]; // Example hand for MVP
  const opponentsCount = players - 1;

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
      
      const api = await w1am.connect("preview");
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
          onClick: () => window.open(`https://preview.midnightexplorer.com/transactions/${txHash}`, "_blank", "noopener,noreferrer"),
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
      const api = await w1am.connect("preview");
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
    <div className="flex flex-col flex-1 items-center justify-between p-8 bg-background relative overflow-hidden">
      {/* Table Background Texture with Equipped Skin */}
      <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] ${tableSkin} via-background to-background pointer-events-none`} />

      {/* Opponents Area - Scaled for multiplayer */}
      <div className="flex w-full justify-around items-center px-4 lg:px-24 z-10 pt-4">
        {Array.from({ length: opponentsCount }).map((_, i) => (
          <div key={i} className="flex flex-col items-center space-y-2">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              Seat {i + 2}
            </div>
            <div className="flex -space-x-12 scale-75">
              <PlayingCard isHidden={!isRevealed} value={isRevealed && opponentCard !== null ? opponentCard : undefined} skin={cardBackSkin} />
            </div>
            {hasCommitted && !isRevealed && (
              <div className="text-xs text-primary font-mono bg-primary/10 px-2 py-1 rounded-full border border-primary/20">
                Committed ✓
              </div>
            )}
            {isRevealed && opponentCard !== null && (
              <div className={`text-xs font-bold font-mono px-2 py-1 ${(selectedCard && selectedCard < opponentCard) ? "text-amber-400" : "text-muted-foreground"}`}>
                {selectedCard && selectedCard < opponentCard ? `WINNER (${opponentCard})` : `LOSER (${opponentCard})`}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Center Table (Pot / Action) */}
      <div className="flex flex-col items-center justify-center z-10 my-12">
        <div className="w-64 h-64 rounded-full border border-border/30 bg-card/20 flex flex-col items-center justify-center backdrop-blur-sm relative">
          <div className="absolute inset-0 rounded-full border border-primary/10 animate-ping opacity-20 pointer-events-none" />
          {hasCommitted ? (
            isRevealed && opponentCard !== null ? (
              <div className="text-center space-y-4 relative z-10">
                <div className={`text-xl font-bold ${(selectedCard && selectedCard > opponentCard) ? "text-amber-400" : "text-red-400"}`}>
                  {(selectedCard && selectedCard > opponentCard) ? "YOU WIN" : "YOU LOSE"}
                </div>
                <div className="text-sm text-muted-foreground">Pot has been settled on-chain.</div>
              </div>
            ) : (
              <div className="text-center space-y-4 relative z-10">
                <div className="text-lg font-medium text-secondary">Commitment Verified ✓</div>
                <div className="text-sm text-muted-foreground">Waiting for opponent...</div>
                <Button 
                  onClick={handleReveal} 
                  disabled={isSubmitting}
                  variant="outline"
                  className="mt-4 border-violet-500/50 hover:bg-violet-500/10"
                >
                  {isSubmitting ? "Revealing..." : "Reveal Cards"}
                </Button>
              </div>
            )
          ) : (
            <div className="text-center space-y-4 relative z-10">
              <div className="text-lg font-medium text-muted-foreground">Select a card to play</div>
              <Button 
                onClick={handleCommit} 
                disabled={selectedCard === null || isSubmitting}
                className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[140px]"
              >
                {isSubmitting ? "Generating Proof..." : "Commit Move"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Player Area (Hand Tray) */}
      <div className="flex flex-col items-center space-y-4 z-10">
        <div className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Your Hand</div>
        <div className="flex gap-4">
          {myHand.map((val, idx) => (
            <PlayingCard
              key={idx}
              value={val}
              isSelected={selectedCard === val}
              onClick={() => !hasCommitted && setSelectedCard(val)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
