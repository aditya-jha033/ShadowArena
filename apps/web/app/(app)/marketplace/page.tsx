"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Package, Loader2, ShoppingBag } from "lucide-react";
import { useWalletStore } from "@/lib/midnight/wallet";
import { toast } from "sonner";

interface Listing {
  id: string;
  assetId: string;
  name: string;
  type: string;
  imageUrl: string;
  description: string;
  price: number;
  sellerAddress: string;
}

const TYPE_COLORS: Record<string, string> = {
  card_back: "text-violet-400 border-violet-400/20 bg-violet-400/10",
  table_skin: "text-teal-400 border-teal-400/20 bg-teal-400/10",
  entry_pass: "text-amber-400 border-amber-400/20 bg-amber-400/10",
};

const TYPE_LABELS: Record<string, string> = {
  card_back: "Card Back",
  table_skin: "Table Skin",
  entry_pass: "Tournament Pass",
};

export default function MarketplacePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const { walletAddress, isConnected } = useWalletStore();

  useEffect(() => {
    fetch("/api/marketplace")
      .then((r) => r.json())
      .then(setListings)
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, []);

  const handlePurchase = (item: Listing) => {
    if (!isConnected) {
      toast.error("Connect your wallet first");
      return;
    }
    // TODO: wire to on-chain asset transfer once contracts are deployed
    toast.info("On-chain purchase coming soon", {
      description: `${item.name} will be purchasable once contracts are deployed on Midnight Preview.`,
    });
  };

  return (
    <div className="flex flex-col min-h-screen pb-12">
      <header className="px-6 h-16 flex items-center border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="font-bold tracking-tight text-xl flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-violet-400" />
          Marketplace
        </div>
        {isConnected && walletAddress && (
          <div className="ml-auto">
            <Badge variant="outline" className="font-mono text-violet-400 border-violet-400/20 bg-violet-400/10">
              {walletAddress.substring(0, 8)}...{walletAddress.substring(walletAddress.length - 4)}
            </Badge>
          </div>
        )}
      </header>

      <main className="flex-1 p-6 lg:p-12 max-w-7xl mx-auto w-full space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trade Cosmetics</h1>
          <p className="text-muted-foreground mt-1">Buy and sell tokenized Midnight assets.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center rounded-2xl border border-white/[0.07] py-20">
            <ShoppingBag className="w-12 h-12 text-muted-foreground/30" />
            <p className="text-xl font-semibold">No listings yet</p>
            <p className="text-muted-foreground text-sm max-w-sm">
              The marketplace is open but empty. Cosmetic assets will appear here once players list them after contract deployment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((item) => {
              const colorCls = TYPE_COLORS[item.type] ?? "text-muted-foreground border-white/10";
              const typeLabel = TYPE_LABELS[item.type] ?? item.type;
              return (
                <Card key={item.id} className="bg-card border-border hover:border-violet-500/40 transition-all duration-300 overflow-hidden group">
                  {/* Asset thumbnail */}
                  <div className="h-40 w-full bg-white/[0.03] flex items-center justify-center border-b border-white/[0.06] group-hover:bg-white/[0.05] transition-colors">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <Package className="w-12 h-12 text-muted-foreground/20" />
                    )}
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <CardTitle className="text-base">{item.name}</CardTitle>
                        <CardDescription className="mt-0.5">{item.description}</CardDescription>
                      </div>
                      <Badge variant="outline" className={`shrink-0 text-[10px] font-mono ${colorCls}`}>
                        {typeLabel}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground font-mono text-xs">Seller: {item.sellerAddress}</span>
                      <span className="font-mono font-bold text-amber-400">{item.price.toLocaleString()} tDUST</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full bg-violet-600 hover:bg-violet-500 text-white"
                      onClick={() => handlePurchase(item)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Purchase Asset
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
