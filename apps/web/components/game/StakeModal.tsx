"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Coins, Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useWalletStore } from "@/lib/midnight/wallet";

interface StakeModalProps {
  gameMode: string;
  onMatchCreated?: () => void;
}

export function StakeModal({ gameMode, onMatchCreated }: StakeModalProps) {
  const [stake, setStake] = useState<string>("100");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { walletAddress, isConnected } = useWalletStore();

  const handleStake = async () => {
    if (!isConnected || !walletAddress) {
      toast.error("Wallet not connected", {
        description: "Please connect your 1AM Wallet first.",
      });
      return;
    }

    const amount = Number(stake);
    if (amount <= 0 || isNaN(amount)) {
      toast.error("Invalid stake amount");
      return;
    }

    // Read the deployed contract address from localStorage
    let stakePoolAddress = "";
    try {
      const saved = localStorage.getItem('shadowarena:deployedContracts');
      if (saved) stakePoolAddress = JSON.parse(saved)["stake-pool"];
    } catch {}

    if (!stakePoolAddress) {
      toast.error("Contract not deployed", {
        description: "Please ask the admin to deploy the Stake Pool contract first.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Send transaction to Midnight Network
      toast.info("Check your 1AM Wallet to approve the stake transaction...");
      const w1am = (window as any).midnight?.["1am"];
      const api = await w1am.connect("preview");
      
      const { callMidnightCircuit } = await import("@/lib/midnight/deploy");
      // stakePlayer1 requires a BigInt amount
      await callMidnightCircuit(api, "stake-pool", stakePoolAddress, "stakePlayer1", [BigInt(amount)]);

      // 2. If successful, record the match in the database
      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress,
          gameMode,
          stakeAmount: amount,
          isPrivate,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to create match in database");
      }

      const { matchId } = await res.json();

      toast.success(isPrivate ? "Private table created!" : `Table created with ${stake} tDUST stake!`, {
        description: "Waiting for an opponent to join...",
      });

      setOpen(false);
      onMatchCreated?.();
      router.push(`/table/${matchId}`);
    } catch (e: any) {
      console.error("Failed to create match", e);
      toast.error("Failed to create table", {
        description: e.message ?? "Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" />}>
        Find Match
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card border-border">
        <DialogHeader>
          <DialogTitle>Enter the Arena</DialogTitle>
          <DialogDescription>
            Lock your wager into the ZK smart contract. The winner takes the pot.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="stake" className="text-right text-muted-foreground">
              Wager
            </Label>
            <div className="col-span-3 relative">
              <Coins className="absolute left-3 top-2.5 h-4 w-4 text-amber-400" />
              <Input
                id="stake"
                type="number"
                min={100}
                value={stake}
                onChange={(e) => setStake(e.target.value)}
                className="pl-9 font-mono bg-background border-border"
              />
              <span className="absolute right-3 top-2.5 text-sm text-muted-foreground font-mono">
                tDUST
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 mb-2">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <Label htmlFor="private-mode" className="text-foreground">Private Wager</Label>
            </div>
            <Switch
              id="private-mode"
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
              className="data-[state=checked]:bg-primary"
            />
          </div>

          {!isConnected && (
            <div className="text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-2">
              ⚠ Connect your wallet before creating a table.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={handleStake}
            disabled={isSubmitting || !isConnected || Number(stake) < 100}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating table...</>
            ) : (
              `Lock ${stake} tDUST & Play`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
