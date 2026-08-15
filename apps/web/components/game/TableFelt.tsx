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

  const myHand = [2, 5, 8, 10]; // Example hand for MVP
  const opponentsCount = players - 1;

  const handleCommit = () => {
    if (selectedCard !== null) {
      setHasCommitted(true);
      // Here we would wire up Midnight.js to submit the ZK proof of the commitment
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
                disabled={selectedCard === null}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Commit Move
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
