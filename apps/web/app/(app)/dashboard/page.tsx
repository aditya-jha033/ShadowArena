import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Swords, Dices, Clock, Trophy } from "lucide-react";
import { StakeModal } from "@/components/game/StakeModal";

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen pb-12">
      <header className="px-6 h-16 flex items-center border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="font-bold tracking-tight text-xl">Dashboard</div>
        <div className="ml-auto flex items-center gap-4">
          <Badge variant="outline" className="font-mono text-accent-gold border-accent-gold/20 bg-accent-gold/10">
            1,420 tDUST
          </Badge>
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            Preview Network
          </div>
        </div>
      </header>
      
      <main className="flex-1 p-6 lg:p-12 max-w-7xl mx-auto w-full space-y-12">
        {/* Stats Row */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-card shadow-none">
            <CardHeader className="pb-2">
              <CardDescription>Available Balance</CardDescription>
              <CardTitle className="text-3xl font-mono text-accent-gold">1,420 tDUST</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-card shadow-none">
            <CardHeader className="pb-2">
              <CardDescription>Total Staked</CardDescription>
              <CardTitle className="text-3xl font-mono">24,500</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-card shadow-none">
            <CardHeader className="pb-2">
              <CardDescription>Win Rate</CardDescription>
              <CardTitle className="text-3xl font-mono text-success">68%</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-card shadow-none">
            <CardHeader className="pb-2">
              <CardDescription>Matches Played</CardDescription>
              <CardTitle className="text-3xl font-mono text-primary">142</CardTitle>
            </CardHeader>
          </Card>
        </section>

        {/* Quick Play */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Quick Play</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-card border-primary/20 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
              <CardHeader>
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                  <Swords className="w-6 h-6" />
                </div>
                <CardTitle>High Card Duel</CardTitle>
                <CardDescription>Commit a hidden card. Highest card wins the pot.</CardDescription>
              </CardHeader>
              <CardContent>
                <StakeModal gameMode="card_duel" />
              </CardContent>
            </Card>

            <Card className="bg-card border-border relative overflow-hidden group opacity-75">
              <CardHeader>
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-4 text-muted-foreground group-hover:scale-110 transition-transform">
                  <Dices className="w-6 h-6" />
                </div>
                <CardTitle>Dice Duel</CardTitle>
                <CardDescription>Predict the roll, hide your wager.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button disabled variant="secondary" className="w-full">Coming Soon</Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Recent Activity</h2>
          <Card className="bg-card shadow-none">
            <div className="divide-y divide-border/50">
              {[
                { type: "Win", amount: "+ 500", game: "High Card Duel", time: "2 mins ago", verified: true },
                { type: "Loss", amount: "- 250", game: "High Card Duel", time: "1 hr ago", verified: true },
                { type: "Draw", amount: "+ 0", game: "High Card Duel", time: "3 hrs ago", verified: true },
              ].map((activity, i) => (
                <div key={i} className="flex items-center justify-between p-4 sm:p-6 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                      {activity.type === "Win" ? <Trophy className="w-5 h-5 text-accent-gold" /> : <Clock className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="font-medium">{activity.game}</div>
                      <div className="text-sm text-muted-foreground">{activity.time}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    {activity.verified && (
                      <Badge variant="outline" className="hidden sm:inline-flex text-secondary border-secondary/30 bg-secondary/10">
                        Verified ✓
                      </Badge>
                    )}
                    <div className={`font-mono font-bold text-lg ${activity.type === "Win" ? "text-success" : activity.type === "Loss" ? "text-destructive" : "text-muted-foreground"}`}>
                      {activity.amount}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
}
