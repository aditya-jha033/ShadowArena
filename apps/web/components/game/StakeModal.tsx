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

    setIsSubmitting(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w1am = (window as any).midnight?.["1am"];
      if (!w1am) throw new Error("1AM Wallet not installed");

      const api = await w1am.connect("preview");
      const { deployMidnightContract, callMidnightCircuit } = await import("@/lib/midnight/deploy");

      const contractName = isPrivate ? "stake-pool-private" : "stake-pool";
      
      const withRetry = async <T,>(operation: () => Promise<T>, retries = 6, delay = 5000): Promise<T> => {
        for (let i = 0; i < retries; i++) {
          try {
            return await operation();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (e: any) {
            const msg = e.message || String(e);
            if ((msg.includes("Wallet busy") || msg.includes("Duplicate request") || msg.includes("pending")) && i < retries - 1) {
              console.log(`Wallet busy/duplicate, retrying in ${delay/1000}s...`);
              await new Promise(r => setTimeout(r, delay));
            } else {
              throw e;
            }
          }
        }
        throw new Error("Wallet remained busy for too long.");
      };

      toast.info("Deploying Stake Contract... (1/3)\nPlease check your 1AM wallet.", { id: "stake-toast", duration: Infinity });
      const stakeDeployRes = await withRetry(() => deployMidnightContract(api, contractName));
      const stakeContractAddress = stakeDeployRes.address;
      
      toast.info("Syncing Wallet state... please wait 8s", { id: "stake-toast", duration: Infinity });
      await new Promise(r => setTimeout(r, 8000));

      toast.info("Deploying Game Contract... (2/3)\nPlease check your 1AM wallet.", { id: "stake-toast", duration: Infinity });
      const moveDeployRes = await withRetry(() => deployMidnightContract(api, "move-validity"));
      const moveContractAddress = moveDeployRes.address;

      toast.info("Syncing Wallet state... please wait 8s", { id: "stake-toast", duration: Infinity });
      await new Promise(r => setTimeout(r, 8000));

      toast.info("Committing Stake... (3/3)\nPlease check your 1AM wallet.", { id: "stake-toast", duration: Infinity });
      
      let txHash = "";
      if (isPrivate) {
        const dummyNonce = new Uint8Array(32);
        crypto.getRandomValues(dummyNonce);
        txHash = await withRetry(() => callMidnightCircuit(api, contractName, stakeContractAddress, "stakePrivate", [BigInt(amount), dummyNonce]));
      } else {
        txHash = await withRetry(() => callMidnightCircuit(api, contractName, stakeContractAddress, "stakePlayer1", [BigInt(amount)]));
      }

      toast.success("Match created and staked successfully! ✓", { id: "stake-toast" });

      // 2. If successful, record the match in the database
      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress,
          gameMode,
          stakeAmount: amount,
          isPrivate,
          stakeContractAddress,
          moveContractAddress
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to create match in database");
      }

      const { matchId } = await res.json();

      toast.success(isPrivate ? "Private table created!" : `Table created with ${stake} tDUST stake!`, {
        description: `Tx: ${txHash.slice(0, 8)}...${txHash.slice(-8)}. Waiting for opponent...`,
        action: txHash ? {
          label: "Verify on Explorer",
          onClick: () => window.open(`https://preview.midnightexplorer.com/transactions/${txHash}`, "_blank", "noopener,noreferrer"),
        } : undefined,
      });

      setOpen(false);
      onMatchCreated?.();
      router.push(`/table/${matchId}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
