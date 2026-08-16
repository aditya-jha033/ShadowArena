"use client";

import { useEffect, useState } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Swords, Dices, Clock, Trophy, Loader2 } from "lucide-react";
import { StakeModal } from "@/components/game/StakeModal";
import { useWalletStore } from "@/lib/midnight/wallet";
import Link from "next/link";

interface Stats {
  matchesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  totalStaked: number;
}

interface ActivityItem {
  id: string;
  matchId: string;
  game: string;
  result: string;
  amount: string;
  settledAt: string;
  proofTx: string | null;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)} days ago`;
}

export default function DashboardPage() {
  const { walletAddress, isConnected } = useWalletStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!walletAddress) { setLoading(false); return; }

    const load = async () => {
      setLoading(true);
      try {
        const [statsRes, activityRes] = await Promise.all([
          fetch(`/api/user/stats?address=${encodeURIComponent(walletAddress)}`),
          fetch(`/api/user/activity?address=${encodeURIComponent(walletAddress)}`),
        ]);
        if (statsRes.ok) setStats(await statsRes.json());
        if (activityRes.ok) setActivity(await activityRes.json());
      } catch (e) {
        console.error("Failed to load dashboard data", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [walletAddress]);

  const shortAddress = walletAddress
    ? `${walletAddress.substring(0, 8)}...${walletAddress.substring(walletAddress.length - 4)}`
    : null;

  return (
    <div className="flex flex-col min-h-screen pb-12">
      <header className="px-6 h-16 flex items-center border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="font-bold tracking-tight text-xl">Dashboard</div>
        <div className="ml-auto flex items-center gap-4">
          {isConnected && walletAddress && (
            <Badge variant="outline" className="font-mono text-violet-400 border-violet-400/20 bg-violet-400/10">
              {shortAddress}
            </Badge>
          )}
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Preview Network
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 lg:p-12 max-w-7xl mx-auto w-full space-y-12">

        {!isConnected ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center">
            <p className="text-xl font-semibold">Connect your wallet to view your stats</p>
            <p className="text-muted-foreground text-sm">Your match history and balance will appear here once connected.</p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Stats Row */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-card shadow-none">
                <CardHeader className="pb-2">
                  <CardDescription>Matches Played</CardDescription>
                  <CardTitle className="text-3xl font-mono text-primary">
                    {stats?.matchesPlayed ?? 0}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card className="bg-card shadow-none">
                <CardHeader className="pb-2">
                  <CardDescription>Win Rate</CardDescription>
                  <CardTitle className={`text-3xl font-mono ${(stats?.winRate ?? 0) >= 50 ? "text-emerald-400" : "text-muted-foreground"}`}>
                    {stats?.winRate ?? 0}%
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card className="bg-card shadow-none">
                <CardHeader className="pb-2">
                  <CardDescription>Wins / Losses</CardDescription>
                  <CardTitle className="text-3xl font-mono">
                    <span className="text-emerald-400">{stats?.wins ?? 0}</span>
                    <span className="text-muted-foreground mx-1">/</span>
                    <span className="text-red-400">{stats?.losses ?? 0}</span>
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card className="bg-card shadow-none">
                <CardHeader className="pb-2">
                  <CardDescription>Total Staked</CardDescription>
                  <CardTitle className="text-3xl font-mono text-amber-400">
                    {stats?.totalStaked ? stats.totalStaked.toLocaleString() : "0"} <span className="text-sm text-muted-foreground">tDUST</span>
                  </CardTitle>
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
                  <div className="px-6 pb-6">
                    <StakeModal gameMode="card_duel" />
                  </div>
                </Card>

                <Card className="bg-card border-border relative overflow-hidden group opacity-75">
                  <CardHeader>
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-4 text-muted-foreground group-hover:scale-110 transition-transform">
                      <Dices className="w-6 h-6" />
                    </div>
                    <CardTitle>Dice Duel</CardTitle>
                    <CardDescription>Predict the roll, hide your wager.</CardDescription>
                  </CardHeader>
                  <div className="px-6 pb-6">
                    <Button disabled variant="secondary" className="w-full">Coming Soon</Button>
                  </div>
                </Card>
              </div>
            </section>

            {/* Recent Activity */}
            <section className="space-y-6">
              <h2 className="text-2xl font-semibold tracking-tight">Recent Activity</h2>
              <Card className="bg-card shadow-none">
                <div className="divide-y divide-border/50">
                  {activity.length === 0 && (
                    <div className="py-12 text-center text-muted-foreground text-sm">
                      No matches played yet. Create a table to get started!
                    </div>
                  )}
                  {activity.map((a) => (
                    <div key={a.id} className="flex items-center justify-between p-4 sm:p-6 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                          {a.result === "win" ? (
                            <Trophy className="w-5 h-5 text-amber-400" />
                          ) : (
                            <Clock className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{a.game}</div>
                          <div className="text-sm text-muted-foreground">{timeAgo(a.settledAt)}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        {a.proofTx && (
                          <Badge variant="outline" className="hidden sm:inline-flex text-teal-400 border-teal-400/30 bg-teal-400/10">
                            ZK Verified ✓
                          </Badge>
                        )}
                        <Badge variant="outline" className={`hidden sm:inline-flex capitalize ${
                          a.result === "win" ? "text-emerald-400 border-emerald-400/30 bg-emerald-400/10" :
                          a.result === "loss" ? "text-red-400 border-red-400/30 bg-red-400/10" :
                          "text-muted-foreground"
                        }`}>
                          {a.result}
                        </Badge>
                        <div className={`font-mono font-bold text-lg ${
                          a.result === "win" ? "text-emerald-400" :
                          a.result === "loss" ? "text-red-400" :
                          "text-muted-foreground"
                        }`}>
                          {a.amount} tDUST
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
