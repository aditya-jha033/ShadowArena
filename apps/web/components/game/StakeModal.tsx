"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Coins, Shield } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function StakeModal({ gameMode }: { gameMode: string }) {
  const [stake, setStake] = useState<string>("100");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleStake = async () => {
    setIsSubmitting(true);
    // Mock interaction with Midnight.js stake-pool contract
    
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(isPrivate ? "Private Stake locked" : "Stake locked securely", {
        description: isPrivate ? `Hidden wager commitment verified on-chain.` : `Wager of ${stake} tDUST verified on-chain.`,
        action: {
          label: "View Tx",
          onClick: () => console.log("View tx..."),
        },
      });
      // Redirect to a dummy table ID
      router.push(`/table/table-id-${Math.floor(Math.random() * 1000)}`);
    }, 1500);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
          Find Match
        </Button>
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
              <Coins className="absolute left-3 top-2.5 h-4 w-4 text-accent-gold" />
              <Input
                id="stake"
                type="number"
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
          
          <div className="flex justify-between items-center text-sm px-4 py-2 bg-muted rounded-md mt-2">
            <span className="text-muted-foreground">Available Balance</span>
            <span className="font-mono text-accent-gold font-medium">1,420 tDUST</span>
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={handleStake} 
            disabled={isSubmitting || Number(stake) <= 0 || Number(stake) > 1420}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? "Locking Stake..." : `Lock ${stake} tDUST & Play`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
