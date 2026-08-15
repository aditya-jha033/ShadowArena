import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";

export default function MarketplacePage() {
  const listings = [
    { id: 1, name: "Crimson Silk Deck", type: "Card Back", price: "450 tDUST", seller: "0x12...99A1", image: "bg-red-500/20" },
    { id: 2, name: "Holographic Table", type: "Table Skin", price: "1200 tDUST", seller: "0xAB...44F0", image: "bg-blue-500/20" },
    { id: 3, name: "Gold Entry Pass", type: "Tournament Pass", price: "2500 tDUST", seller: "0x33...88B2", image: "bg-accent-gold/20" },
  ];

  return (
    <div className="flex flex-col min-h-screen pb-12">
      <header className="px-6 h-16 flex items-center border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="font-bold tracking-tight text-xl flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-primary" />
          Marketplace
        </div>
      </header>
      
      <main className="flex-1 p-6 lg:p-12 max-w-7xl mx-auto w-full space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Trade Cosmetics</h1>
            <p className="text-muted-foreground mt-1">Buy and sell tokenized Midnight assets.</p>
          </div>
          <Badge variant="outline" className="font-mono text-accent-gold border-accent-gold/20 bg-accent-gold/10 text-base py-1">
            Balance: 1,420 tDUST
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {listings.map((item) => (
            <Card key={item.id} className="bg-card border-border hover:border-primary/50 transition-colors">
              <div className={`h-40 w-full flex items-center justify-center ${item.image}`} />
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <CardDescription>{item.type}</CardDescription>
                  </div>
                  <Badge variant="secondary" className="font-mono bg-secondary/10 text-secondary">{item.price}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">Seller: <span className="font-mono">{item.seller}</span></div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-primary hover:bg-primary/90">Purchase Asset</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
