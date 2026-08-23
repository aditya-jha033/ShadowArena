"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useWalletStore } from "@/lib/midnight/wallet";
import { Wallet, ChevronDown } from "lucide-react";

export function WalletConnectButton() {
  const { isConnected, isConnecting, walletAddress, connect, disconnect } = useWalletStore();
  // Fix hydration mismatch: don't render connected state on server
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <Button className="bg-gradient-to-r from-yellow-600 to-amber-500 text-black font-bold rounded-xl opacity-50 cursor-not-allowed" disabled>
        <Wallet className="w-4 h-4 mr-2" />
        Connect Wallet
      </Button>
    );
  }

  if (isConnected && walletAddress) {
    const displayAddress = `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`;
    return (
      <Button
        variant="outline"
        onClick={disconnect}
        className="font-mono border-yellow-500/30 bg-yellow-500/10 text-yellow-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all gap-2"
      >
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        {displayAddress}
        <ChevronDown className="w-3 h-3 opacity-50" />
      </Button>
    );
  }

  return (
    <Button
      onClick={connect}
      disabled={isConnecting}
      className="bg-gradient-to-r from-yellow-600 to-amber-500 hover:from-yellow-500 hover:to-amber-400 text-black font-bold rounded-xl gap-2 shadow-[0_0_20px_rgba(212,175,55,0.25)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all"
    >
      <Wallet className="w-4 h-4" />
      {isConnecting ? "Connecting..." : "Connect 1AM Wallet"}
    </Button>
  );
}
