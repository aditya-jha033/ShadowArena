"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (amount: number) => void;
}

export function PrivateWagerDialog({ open, onOpenChange, onSubmit }: Props) {
  const [amount, setAmount] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Number(amount);
    if (!isNaN(parsed) && parsed > 0) {
      onSubmit(parsed);
      setAmount("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#070709] border-yellow-500/20 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-yellow-400">Join Private Wager</DialogTitle>
          <DialogDescription className="text-white/50">
            This table uses a hidden stake. Enter the agreed tDUST amount to match Player 1.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-white/80">tDUST Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:border-yellow-500/50 outline-none"
              placeholder="e.g. 500"
              min="1"
              required
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-white/10 text-white hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-yellow-500 text-black hover:bg-yellow-400 font-bold"
            >
              Join Table
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
