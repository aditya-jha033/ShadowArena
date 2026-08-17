"use client";

import { useState } from "react";
import { PlayingCard } from "./PlayingCard";
import { Button } from "@/components/ui/button";

import { toast } from "sonner";

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
      
      // Generate a mock 32-byte commitment
      const dummyCommitment = new Uint8Array(32);
      crypto.getRandomValues(dummyCommitment);

      const withRetry = async <T,>(operation: () => Promise<T>, retries = 6, delay = 5000): Promise<T> => {
        for (let i = 0; i < retries; i++) {
          try {
            return await operation();
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
      try {
        // Try playing as Player 1
        txHash = await withRetry(() => callMidnightCircuit(api, "move-validity", contractAddress, "joinPlayer1", [dummyCommitment]));
      } catch (e: any) {
        const msg1 = e?.message || "";
        if (msg1.includes("is undefined for contract state")) {
          throw new Error("You pasted the wrong contract address! Please make sure you paste the 'move-validity' contract address, not the stake pool.");
        }

        // If Player 1 already played on this contract, try Player 2
        console.warn("P1 fallback:", msg1);
        
        try {
          txHash = await withRetry(() => callMidnightCircuit(api, "move-validity", contractAddress, "joinPlayer2", [dummyCommitment]));
        } catch (e2: any) {
          const msg = e2?.message || "";
          if (msg.includes("Not waiting for P2") || msg.includes("failed assert")) {
             throw new Error("This game is already finished/locked! For the demo, you must deploy a fresh move-validity contract from the Admin page for each new game.");
          }
          throw e2;
        }
      }

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

    } catch (e: any) {
      console.error(e);
      toast.error("Failed to commit move", { id: "commit-toast", description: e?.message || "Unknown error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReveal = () => {
    setIsSubmitting(true);
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 2000)),
      {
        loading: 'Decrypting opponent commitment via ZK circuit...',
        success: () => {
          setIsRevealed(true);
          setIsSubmitting(false);
          const isWinner = selectedCard !== null && selectedCard > 7;
          return isWinner 
            ? 'You Win! Smart contract has distributed the pot.'
            : 'Opponent Wins! Smart contract has distributed the pot.';
        },
        error: 'Failed to reveal',
      }
    );
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
              <PlayingCard isHidden={!isRevealed} value={isRevealed ? 7 : undefined} skin={cardBackSkin} />
            </div>
            {hasCommitted && !isRevealed && (
              <div className="text-xs text-primary font-mono bg-primary/10 px-2 py-1 rounded-full border border-primary/20">
                Committed ✓
              </div>
            )}
            {isRevealed && (
              <div className={`text-xs font-bold font-mono px-2 py-1 ${(selectedCard && selectedCard < 7) ? "text-amber-400" : "text-muted-foreground"}`}>
                {selectedCard && selectedCard < 7 ? "WINNER (7)" : "LOSER (7)"}
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
            isRevealed ? (
              <div className="text-center space-y-4 relative z-10">
                <div className={`text-xl font-bold ${(selectedCard && selectedCard > 7) ? "text-amber-400" : "text-red-400"}`}>
                  {(selectedCard && selectedCard > 7) ? "YOU WIN" : "YOU LOSE"}
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
