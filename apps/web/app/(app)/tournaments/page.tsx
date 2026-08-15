import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Clock, Flame } from "lucide-react";

export default function TournamentsPage() {
  return (
    <div className="flex flex-col min-h-screen pb-12">
      <header className="px-6 h-16 flex items-center border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="font-bold tracking-tight text-xl flex items-center gap-2">
          <Trophy className="w-5 h-5 text-accent-gold" />
          Tournaments
        </div>
      </header>
      
      <main className="flex-1 p-6 lg:p-12 max-w-7xl mx-auto w-full space-y-8">
        <section className="relative w-full rounded-2xl overflow-hidden border border-accent-gold/20 bg-card">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent-gold/10 via-background to-background" />
          <div className="relative z-10 p-8 lg:p-12 flex flex-col items-center text-center space-y-4">
            <Badge variant="outline" className="font-mono text-accent-gold border-accent-gold/50 bg-accent-gold/10 mb-2">
              <Flame className="w-3 h-3 mr-2" /> Live Now
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Neon Nights Championship</h1>
            <p className="text-muted-foreground max-w-xl text-lg">
              The biggest Midnight preview network tournament. Compete for the 50,000 tDUST prize pool. 5% Rake Fee applies.
            </p>
            <div className="flex items-center gap-8 pt-4 pb-6 font-mono">
              <div className="flex flex-col items-center">
                <span className="text-sm text-muted-foreground">Prize Pool</span>
                <span className="text-2xl text-accent-gold font-bold">50,000 tDUST</span>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="flex flex-col items-center">
                <span className="text-sm text-muted-foreground">Entry Fee</span>
                <span className="text-2xl font-bold">1,000 tDUST</span>
              </div>
            </div>
            <Button size="lg" className="bg-accent-gold hover:bg-accent-gold/90 text-background px-12 text-lg font-bold">
              Consume Entry Pass & Join
            </Button>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
          <Card className="col-span-1 lg:col-span-2 bg-card border-border">
            <CardHeader>
              <CardTitle>Live Bracket</CardTitle>
              <CardDescription>Round of 16 currently underway</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center min-h-[300px]">
              <div className="text-muted-foreground flex flex-col items-center gap-2">
                <Trophy className="w-8 h-8 opacity-20" />
                Bracket Visualization Placeholder
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Leaderboard</CardTitle>
              <CardDescription>Top ranked players</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { rank: 1, player: "0x4A...22F", score: "14,500" },
                  { rank: 2, player: "0x11...9B3", score: "12,200" },
                  { rank: 3, player: "0x8C...1A7", score: "9,800" },
                  { rank: 4, player: "0x2F...4D9", score: "7,500" },
                  { rank: 5, player: "0x9E...88C", score: "6,200" },
                ].map((row) => (
                  <div key={row.rank} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`font-mono text-sm font-bold ${row.rank <= 3 ? 'text-accent-gold' : 'text-muted-foreground'}`}>
                        #{row.rank}
                      </div>
                      <div className="font-mono text-sm">{row.player}</div>
                    </div>
                    <div className="font-mono text-sm font-bold">{row.score}</div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="w-full text-xs text-muted-foreground">View Full Rankings</Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
