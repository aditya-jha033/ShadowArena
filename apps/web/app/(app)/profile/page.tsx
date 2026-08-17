"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, ShieldCheck, Box } from "lucide-react";
import { useWalletStore } from "@/lib/midnight/wallet";

export default function ProfilePage() {
  const { walletAddress, isConnected, disconnect } = useWalletStore();

  const shortAddress = walletAddress
    ? `${walletAddress.substring(0, 10)}...${walletAddress.substring(walletAddress.length - 6)}`
    : null;

  return (
    <div className="flex flex-col min-h-screen pb-12">
      <header className="px-6 h-16 flex items-center border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="font-bold tracking-tight text-xl">Profile & Inventory</div>
      </header>

      <main className="flex-1 p-6 lg:p-12 max-w-7xl mx-auto w-full space-y-12">
        <section className="flex flex-col md:flex-row gap-6">
          <Card className="flex-1 bg-card shadow-none border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-violet-400" />
                Wallet Connection
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isConnected && walletAddress ? (
                <>
                  <div className="text-lg font-mono text-muted-foreground break-all">{shortAddress}</div>
                  <div className="mt-2 text-sm text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" /> Connected & Verified
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 text-red-400 border-red-400/20 hover:bg-red-400/10"
                    onClick={disconnect}
                  >
                    Disconnect Wallet
                  </Button>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No wallet connected. Connect from the sidebar.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="flex-1 bg-card shadow-none border-border">
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Manage your public visibility</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <div>Share Stake History</div>
              <Badge variant="outline">Private by Default</Badge>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">Cosmetic Inventory</h2>
          </div>

          {!isConnected ? (
            <div className="rounded-2xl border border-white/[0.07] py-16 text-center text-muted-foreground text-sm">
              Connect your wallet to see your inventory.
            </div>
          ) : (
            <div className="rounded-2xl border border-white/[0.07] py-16 text-center text-muted-foreground text-sm bg-black/20">
              <Box className="w-10 h-10 mx-auto mb-3 opacity-30" />
              Cosmetic items will be available in Phase 2.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
