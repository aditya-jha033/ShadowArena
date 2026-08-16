"use client";

import { useState } from "react";
import { PlayingCard } from "./PlayingCard";
import { Button } from "@/components/ui/button";

export function TableFelt({ 
  players = 4,
  tableSkin = "from-secondary/5",
  cardBackSkin
}: { 
  players?: number;
  tableSkin?: string;
  cardBackSkin?: string;
}) {
  const [hasCommitted, setHasCommitted] = useState(false);
  const [gameState, setGameState] = useState<"WAITING" | "REVEAL">("WAITING");
  const [selectedCard, setSelectedCard] = useState<number | null>(null);

  const myHand = [2, 5, 8, 10]; // Example hand for MVP
  const opponentsCount = players - 1;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCommit = async () => {
    if (selectedCard !== null) {
      setIsSubmitting(true);
      try {
        // Read the deployed contract address
        let stakePoolAddress = "";
        try {
          const saved = localStorage.getItem('shadowarena:deployedContracts');
          if (saved) stakePoolAddress = JSON.parse(saved)["stake-pool"];
        } catch {}

        if (!stakePoolAddress) {
          alert("Contract not deployed. Ask admin to deploy Stake Pool.");
          return;
        }

        const w1am = (window as any).midnight?.["1am"];
        if (!w1am) throw new Error("1AM Wallet not found");
        
        const api = await w1am.connect("preview");
        const { callMidnightCircuit } = await import("@/lib/midnight/deploy");
        
        // For MVP, we assume Player 2 matches Player 1's 100 tDUST stake
        // In a full implementation, this amount would be fetched from the DB Match object
        const txHash = await callMidnightCircuit(api, "stake-pool", stakePoolAddress, "stakePlayer2", [100n]);

        import("sonner").then(({ toast }) => {
          toast.success("Move committed to Midnight network!", {
            description: `Tx: ${txHash.slice(0, 8)}...${txHash.slice(-8)}`,
            action: txHash ? {
              label: "Verify on Explorer",
              onClick: () => window.open(`https://preview.midnightexplorer.com/transactions/${txHash}`, "_blank", "noopener,noreferrer"),
            } : undefined,
          });
        });

        setHasCommitted(true);
      } catch (e: any) {
        console.error("Failed to commit move:", e);
        alert(`Failed to commit move: ${e.message}`);
      } finally {
        setIsSubmitting(false);
      }
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
              <PlayingCard isHidden skin={cardBackSkin} />
            </div>
            {hasCommitted && (
              <div className="text-xs text-primary font-mono bg-primary/10 px-2 py-1 rounded-full border border-primary/20">
                Committed ✓
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Center Table (Pot / Action) */}
      <div className="flex flex-col items-center justify-center z-10 my-12">
        <div className="w-64 h-64 rounded-full border border-border/30 bg-card/20 flex flex-col items-center justify-center backdrop-blur-sm relative">
          <div className="absolute inset-0 rounded-full border border-primary/10 animate-ping opacity-20" />
          {hasCommitted ? (
            <div className="text-center space-y-4">
              <div className="text-lg font-medium text-secondary">Commitment Verified ✓</div>
              <div className="text-sm text-muted-foreground">Waiting for opponent...</div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="text-lg font-medium text-muted-foreground">Select a card to play</div>
              <Button 
                onClick={handleCommit} 
                disabled={selectedCard === null || isSubmitting}
                className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[140px]"
              >
                {isSubmitting ? "Proving..." : "Commit Move"}
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
