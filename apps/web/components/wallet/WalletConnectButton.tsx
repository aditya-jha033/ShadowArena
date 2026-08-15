"use client";

import { Button } from "@/components/ui/button";
import { useWalletStore } from "@/lib/midnight/wallet";
import { Wallet } from "lucide-react";

export function WalletConnectButton() {
  const { isConnected, isConnecting, walletAddress, connect, disconnect } = useWalletStore();

  if (isConnected && walletAddress) {
    const displayAddress = `${walletAddress.substring(0, 8)}...${walletAddress.substring(walletAddress.length - 4)}`;
    
    return (
      <Button 
        variant="outline" 
        onClick={disconnect}
        className="font-mono bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary/20 hover:text-secondary"
      >
        <Wallet className="w-4 h-4 mr-2" />
        {displayAddress}
      </Button>
    );
  }

  return (
    <Button 
      onClick={connect} 
      disabled={isConnecting}
      className="bg-primary text-primary-foreground hover:bg-primary/90"
    >
      <Wallet className="w-4 h-4 mr-2" />
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
}
