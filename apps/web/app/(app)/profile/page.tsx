import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, ShieldCheck, Box, RefreshCw } from "lucide-react";

export default function ProfilePage() {
  const inventory = [
    { id: 1, name: "Neon Violet Deck", type: "Card Back", isEquipped: true, image: "bg-primary/20" },
    { id: 2, name: "Midnight Onyx Felt", type: "Table Skin", isEquipped: false, image: "bg-card" },
    { id: 3, name: "Gold Entry Pass", type: "Tournament Pass", isEquipped: false, image: "bg-accent-gold/20" },
  ];

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
                <Wallet className="w-5 h-5 text-secondary" />
                Wallet Connection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-mono text-muted-foreground">0x1AM...39F2</div>
              <div className="mt-2 text-sm text-success flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> Connected & Verified
              </div>
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
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" /> Sync On-Chain
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {inventory.map((item) => (
              <Card key={item.id} className={`bg-card overflow-hidden transition-all ${item.isEquipped ? 'border-primary ring-1 ring-primary' : 'border-border'}`}>
                <div className={`h-32 w-full flex items-center justify-center ${item.image}`}>
                  <Box className="w-12 h-12 opacity-50" />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <CardDescription>{item.type}</CardDescription>
                </CardHeader>
                <CardFooter className="flex gap-2">
                  <Button 
                    variant={item.isEquipped ? "secondary" : "default"} 
                    className="flex-1"
                    disabled={item.isEquipped}
                  >
                    {item.isEquipped ? "Equipped ✓" : "Equip"}
                  </Button>
                  <Button variant="outline" className="flex-1">Sell</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
