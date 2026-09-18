"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Swords, Dices, Clock, Trophy, Loader2, Shield, Lock, TrendingUp, Wallet } from "lucide-react";
import { StakeModal } from "@/components/game/StakeModal";
import { useWalletStore } from "@/lib/midnight/wallet";
import { toast } from "sonner";

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
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function DashboardPage() {
  const { walletAddress, isConnected, connect } = useWalletStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
      } catch {
        toast.error("Failed to load dashboard data");
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
    <div className="flex flex-col min-h-screen bg-[#070709]">

      {/* Header */}
      <header className="px-6 h-16 flex items-center justify-between border-b border-yellow-500/10 bg-black/40 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-yellow-500/15 border border-yellow-500/20 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-yellow-400" />
          </div>
          <div>
            <div className="font-black text-base text-white">Dashboard</div>
            <div className="text-[10px] text-white/30 font-mono">Your Arena Stats</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isConnected && walletAddress && (
            <Badge className="font-mono text-yellow-400 border-yellow-500/30 bg-yellow-500/10 text-xs">
              {shortAddress}
            </Badge>
          )}
          <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400 border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Preprod · Live
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-10">

        {/* Not connected */}
        {!isConnected ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
            <div className="w-20 h-20 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
              <Wallet className="w-10 h-10 text-yellow-500/60" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white mb-2">Connect Your Wallet</h2>
              <p className="text-white/40 text-sm max-w-sm">Your match history, win rate, and tDUST balance will appear here once you connect your 1AM Wallet.</p>
            </div>
            <Button
              onClick={connect}
              className="bg-gradient-to-r from-yellow-600 to-amber-500 hover:from-yellow-500 hover:to-amber-400 text-black font-black px-8 h-12 rounded-xl shadow-[0_0_30px_rgba(212,175,55,0.3)]"
            >
              Connect 1AM Wallet
            </Button>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center min-h-[60vh] gap-3 flex-col">
            <Loader2 className="w-8 h-8 animate-spin text-yellow-500/50" />
            <span className="text-white/30 text-sm font-mono">Loading your stats...</span>
          </div>
        ) : (
          <>
            {/* ── STATS ROW ── */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: "Matches Played",
                  value: stats?.matchesPlayed ?? 0,
                  suffix: "",
                  color: "text-white",
                  border: "border-white/10",
                  bg: "from-white/5 to-transparent",
                  icon: Swords,
                  iconColor: "text-white/40",
                },
                {
                  label: "Win Rate",
                  value: `${stats?.winRate ?? 0}%`,
                  suffix: "",
                  color: (stats?.winRate ?? 0) >= 50 ? "text-emerald-400" : "text-red-400",
                  border: "border-emerald-500/20",
                  bg: "from-emerald-500/10 to-transparent",
                  icon: TrendingUp,
                  iconColor: "text-emerald-400",
                },
                {
                  label: "Wins / Losses",
                  value: `${stats?.wins ?? 0} / ${stats?.losses ?? 0}`,
                  suffix: "",
                  color: "text-white",
                  border: "border-yellow-500/10",
                  bg: "from-yellow-500/5 to-transparent",
                  icon: Trophy,
                  iconColor: "text-yellow-400",
                },
                {
                  label: "Total Staked",
                  value: stats?.totalStaked ? stats.totalStaked.toLocaleString() : "0",
                  suffix: "tDUST",
                  color: "text-yellow-400",
                  border: "border-yellow-500/20",
                  bg: "from-yellow-500/10 to-transparent",
                  icon: Shield,
                  iconColor: "text-yellow-400",
                },
              ].map((s) => (
                <div key={s.label} className={`relative rounded-2xl border ${s.border} bg-gradient-to-br ${s.bg} p-5 overflow-hidden group hover:scale-[1.01] transition-all`}>
                  <div className="absolute top-3 right-3">
                    <s.icon className={`w-5 h-5 ${s.iconColor} opacity-40`} />
                  </div>
                  <div className="text-[10px] text-white/30 uppercase tracking-widest font-mono mb-2">{s.label}</div>
                  <div className={`text-3xl font-black font-mono ${s.color} leading-tight`}>
                    {s.value}
                    {s.suffix && <span className="text-sm text-white/30 ml-1 font-normal">{s.suffix}</span>}
                  </div>
                </div>
              ))}
            </section>

            {/* ── QUICK PLAY ── */}
            <section className="space-y-5">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-black tracking-tight text-white">Quick Play</h2>
                <div className="flex-1 h-px bg-yellow-500/10" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Card Duel - LIVE */}
                <div className="group relative rounded-2xl border border-yellow-500/25 bg-gradient-to-br from-yellow-500/8 to-emerald-900/10 overflow-hidden hover:border-yellow-500/50 hover:shadow-[0_0_40px_rgba(212,175,55,0.1)] transition-all duration-300">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(212,175,55,0.07),transparent_60%)]" />
                  <div className="relative p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-yellow-500/15 border border-yellow-500/25 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Swords className="w-6 h-6 text-yellow-400" />
                      </div>
                      <div className="text-[10px] font-mono font-bold text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 rounded-full">● LIVE</div>
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white mb-1">High Card Duel</h3>
                      <p className="text-sm text-white/40">Commit a hidden card. Highest card wins the pot. Every move ZK-proven on Midnight.</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {["ZK-Shuffled", "100+ tDUST", "~2 min"].map(t => (
                        <span key={t} className="text-[10px] font-mono text-yellow-500/50 border border-yellow-500/15 rounded px-2 py-0.5">{t}</span>
                      ))}
                    </div>
                    <StakeModal gameMode="card_duel" />
                  </div>
                </div>

                {/* Dice Duel - SOON */}
                <div className="relative rounded-2xl border border-white/[0.05] bg-white/[0.02] overflow-hidden opacity-50 cursor-not-allowed">
                  <div className="relative p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
                        <Dices className="w-6 h-6 text-white/20" />
                      </div>
                      <div className="text-[10px] font-mono font-bold text-white/30 border border-white/10 px-2 py-1 rounded-full">COMING SOON</div>
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white/40 mb-1">Dice Duel</h3>
                      <p className="text-sm text-white/25">Predict the hidden roll. Provably fair on-chain randomness.</p>
                    </div>
                    <Button disabled className="w-full bg-white/5 text-white/20 cursor-not-allowed rounded-xl">Coming Q3 2026</Button>
                  </div>
                </div>
              </div>
            </section>

            {/* ── RECENT ACTIVITY ── */}
            <section className="space-y-5">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-black tracking-tight text-white">Recent Activity</h2>
                <div className="flex-1 h-px bg-yellow-500/10" />
                <span className="text-[10px] font-mono text-white/25 border border-white/10 px-2 py-1 rounded">{activity.length} matches</span>
              </div>

              <div className="rounded-2xl border border-yellow-500/10 overflow-hidden bg-black/30 divide-y divide-yellow-500/5">
                {activity.length === 0 && (
                  <div className="py-16 text-center">
                    <Lock className="w-10 h-10 text-white/10 mx-auto mb-3" />
                    <p className="text-white/30 text-sm">No matches yet. Your ZK-proven history will appear here.</p>
                  </div>
                )}
                {activity.map((a) => (
                  <div key={a.id} className="flex items-center justify-between px-5 py-4 hover:bg-yellow-500/[0.03] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                        a.result === "win"
                          ? "bg-emerald-500/10 border-emerald-500/20"
                          : a.result === "loss"
                          ? "bg-red-500/10 border-red-500/20"
                          : "bg-white/5 border-white/10"
                      }`}>
                        {a.result === "win"
                          ? <Trophy className="w-5 h-5 text-yellow-400" />
                          : <Clock className="w-5 h-5 text-white/30" />
                        }
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{a.game}</div>
                        <div className="text-xs text-white/30 font-mono">{timeAgo(a.settledAt)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {a.proofTx && (
                        <span className="hidden sm:block text-[10px] font-mono text-emerald-400 border border-emerald-500/20 bg-emerald-500/5 px-2 py-1 rounded-full">
                          ZK Verified ✓
                        </span>
                      )}
                      <Badge className={`capitalize text-xs font-bold ${
                        a.result === "win" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" :
                        a.result === "loss" ? "bg-red-500/15 text-red-400 border-red-500/20" :
                        "bg-white/5 text-white/40 border-white/10"
                      }`}>
                        {a.result}
                      </Badge>
                      <div className={`font-black font-mono text-base min-w-[80px] text-right ${
                        a.result === "win" ? "text-yellow-400" :
                        a.result === "loss" ? "text-red-400" :
                        "text-white/30"
                      }`}>
                        {a.result === "win" ? "+" : ""}{a.amount} <span className="text-[10px] text-white/20 font-normal">tDUST</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
