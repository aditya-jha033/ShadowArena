"use client";

import { useEffect, useState } from "react";
import { Copy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function MatchStatusBanner({ matchId }: { matchId: string }) {
  const [playerCount, setPlayerCount] = useState<number | null>(null);
  const [isFull, setIsFull] = useState(false);
  const [status, setStatus] = useState<string>("pending");

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`/api/matches/${matchId}/status`);
        if (res.ok) {
          const data = await res.json();
          setPlayerCount(data.playerCount);
          setIsFull(data.isFull);
          setStatus(data.status);
        }
      } catch {
        // Silent catch for polling
      }
    };

    poll();
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [matchId]);

  const copyLink = () => {
    const url = `${window.location.origin}/lobby`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied! Send it to your opponent.");
  };

  if (isFull || status === "settled") return null;

  return (
    <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3 text-sm text-yellow-400">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="font-bold">Waiting for opponent...</span>
        <span className="text-yellow-500/60 font-mono">({playerCount || 1}/2 Players Joined)</span>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={copyLink}
        className="border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/10 hover:text-yellow-300 gap-2 h-8"
      >
        <Copy className="w-3.5 h-3.5" />
        Copy Lobby Link
      </Button>
    </div>
  );
}
