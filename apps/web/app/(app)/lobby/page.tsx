"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Swords, Users, Clock, ChevronRight, Shield, Zap, Trophy, Dices, Lock } from "lucide-react";
import { StakeModal } from "@/components/game/StakeModal";
import { toast } from "sonner";
import { PrivateWagerDialog } from "@/components/game/PrivateWagerDialog";

interface OpenTable {
  id: string;
  game: string;
  hostAddress: string;
  stake: string;
  rawStakeAmount: number | null;
  isPrivateStake: boolean;
  stakeContract: string | null;
  createdAt: string;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

export default function LobbyPage() {
  const [tables, setTables] = useState<OpenTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const router = useRouter();

  const loadTables = async () => {
    try {
      const res = await fetch("/api/matches/open", { cache: "no-store" });
      if (res.ok) setTables(await res.json());
    } catch (e) {
      console.error("Failed to load open tables", e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTables();
    const interval = setInterval(loadTables, 10_000);
    return () => clearInterval(interval);
  }, []);

  const [pendingPrivateTable, setPendingPrivateTable] = useState<OpenTable | null>(null);

  const proceedJoin = async (table: OpenTable, amount: number) => {
    try {
      setJoiningId(table.id);
      if (!amount || isNaN(amount)) throw new Error("Invalid stake amount");
      if (!table.stakeContract) throw new Error("Match missing stake contract address");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w1am = (window as any).midnight?.["1am"];
      if (!w1am) throw new Error("1AM Wallet not installed");
      const api = await w1am.connect("preprod");
      const { callMidnightCircuit } = await import("@/lib/midnight/deploy");
      const contractName = table.isPrivateStake ? "stake-pool-private" : "stake-pool";
      const circuitName = table.isPrivateStake ? "stakePrivate" : "stakePlayer2";
      const args = table.isPrivateStake
        ? [BigInt(amount), crypto.getRandomValues(new Uint8Array(32))]
        : [BigInt(amount)];

      const withRetry = async <T,>(operation: () => Promise<T>, retries = 6, delay = 5000): Promise<T> => {
        for (let i = 0; i < retries; i++) {
          try { return await operation(); }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          catch (e: any) {
            if (e.message?.includes("Wallet busy") && i < retries - 1) {
              await new Promise(r => setTimeout(r, delay));
            } else throw e;
          }
        }
        throw new Error("Wallet remained busy for too long.");
      };

      await withRetry(() => callMidnightCircuit(api, contractName, table.stakeContract as string, circuitName, args));
      const addresses = await api.getShieldedAddresses();
      await fetch(`/api/matches/${table.id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: addresses.shieldedCoinPublicKey })
      });
      router.push(`/table/${table.id}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to join table");
    } finally {
      setJoiningId(null);
      setPendingPrivateTable(null);
    }
  };

  const handleJoinMatch = async (table: OpenTable) => {
    if (table.isPrivateStake) {
      setPendingPrivateTable(table);
      return;
    }
    await proceedJoin(table, table.rawStakeAmount!);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#070709]">
      <PrivateWagerDialog 
        open={!!pendingPrivateTable}
        onOpenChange={(open) => !open && setPendingPrivateTable(null)}
        onSubmit={(amt) => pendingPrivateTable && proceedJoin(pendingPrivateTable, amt)}
      />

      {/* Header */}
      <header className="px-6 h-16 flex items-center justify-between border-b border-yellow-500/10 bg-black/40 backdrop-blur-sm sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-yellow-500/15 border border-yellow-500/20 flex items-center justify-center">
            <Swords className="w-4 h-4 text-yellow-400" />
          </div>
          <div>
            <div className="font-black text-base text-white">Lobby</div>
            <div className="text-[10px] text-white/30 font-mono">Find or Create Tables</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400 border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Preprod · Live
        </div>
      </header>

      <main className="flex-1 p-6 lg:p-10 max-w-6xl mx-auto w-full space-y-10">

        {/* ── HERO BANNER ── */}
        <section className="relative rounded-2xl border border-yellow-500/20 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(212,175,55,0.12),transparent_60%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(212,175,55,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,55,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="relative z-10 p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-[10px] font-mono text-yellow-400 uppercase tracking-widest border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 rounded-full">
                <Shield className="w-3 h-3" /> Zero-Knowledge Gaming Arena
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white">Enter the Arena</h1>
              <p className="text-white/40 max-w-md text-sm leading-relaxed">
                Create a private duel, set your stake, and challenge any opponent. Every move is ZK-proven — your cards never touch the chain.
              </p>
              <div className="flex items-center gap-5 pt-1">
                {[
                  { icon: Shield, label: "ZK-Verified", color: "text-yellow-400" },
                  { icon: Zap,    label: "Gas-Free",    color: "text-emerald-400" },
                  { icon: Trophy, label: "Trustless Payout", color: "text-amber-400" },
                ].map(({ icon: Icon, label, color }) => (
                  <div key={label} className="flex items-center gap-1.5 text-xs text-white/40">
                    <Icon className={`w-3.5 h-3.5 ${color}`} />
                    {label}
                  </div>
                ))}
              </div>
            </div>
            <div className="shrink-0">
              <StakeModal gameMode="card_duel" onMatchCreated={loadTables} />
            </div>
          </div>
        </section>

        {/* ── GAME MODES ── */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-black text-white">Game Modes</h2>
            <div className="flex-1 h-px bg-yellow-500/10" />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="group relative rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-transparent hover:border-yellow-500/40 hover:shadow-[0_0_30px_rgba(212,175,55,0.08)] transition-all duration-300 p-5 flex gap-4 cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/15 border border-yellow-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Swords className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-white">High Card Duel</h3>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 rounded-full">● LIVE</span>
                </div>
                <p className="text-xs text-white/40 leading-relaxed">Commit a hidden card. Highest wins the pot. ZK-shuffled deck.</p>
                <div className="flex items-center gap-3 pt-1 text-[10px] text-white/25 font-mono">
                  <span>Min: 100 tDUST</span><span>·</span><span>~2 min/round</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-yellow-500/30 group-hover:text-yellow-400 group-hover:translate-x-0.5 transition-all mt-1 shrink-0" />
            </div>

            <div className="relative rounded-2xl border border-white/[0.05] bg-white/[0.01] p-5 flex gap-4 opacity-50 cursor-not-allowed">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <Dices className="w-6 h-6 text-white/20" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-white/40">Dice Duel</h3>
                  <span className="text-[10px] font-mono text-white/30 border border-white/10 px-2 py-0.5 rounded-full">SOON</span>
                </div>
                <p className="text-xs text-white/25 leading-relaxed">Provably fair on-chain randomness. Coming Q3 2026.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── OPEN TABLES ── */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-black text-white">Open Tables</h2>
            <div className="flex-1 h-px bg-yellow-500/10" />
            <div className="flex items-center gap-1.5 text-[10px] text-white/30 font-mono border border-white/10 px-3 py-1 rounded-full">
              <Users className="w-3 h-3" />
              {loading ? "—" : tables.length} waiting
            </div>
          </div>

          <div className="rounded-2xl border border-yellow-500/10 overflow-hidden bg-black/30 divide-y divide-yellow-500/5">
            {loading && (
              <div className="py-12 text-center">
                <div className="inline-block w-6 h-6 border-2 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin mb-3" />
                <p className="text-white/30 text-sm font-mono">Scanning open tables...</p>
              </div>
            )}

            {!loading && tables.length === 0 && (
              <div className="py-16 text-center">
                <Lock className="w-10 h-10 text-white/10 mx-auto mb-3" />
                <p className="text-white/30 text-sm">No open tables right now.</p>
                <p className="text-white/20 text-xs mt-1">Be the first to deploy a match!</p>
              </div>
            )}

            {!loading && tables.map((table) => (
              <div key={table.id} className="flex items-center justify-between px-5 py-4 hover:bg-yellow-500/[0.03] transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/15 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Swords className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{table.game}</div>
                    <div className="text-xs text-white/25 font-mono">
                      {table.hostAddress.slice(0, 10)}...{table.hostAddress.slice(-6)} · {timeAgo(table.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-black font-mono text-yellow-400">
                      {table.isPrivateStake ? (
                        <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Hidden</span>
                      ) : table.stake}
                    </div>
                    <div className="text-[10px] text-white/25 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" /> Awaiting opponent
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleJoinMatch(table)}
                    disabled={joiningId === table.id}
                    className="bg-gradient-to-r from-yellow-600 to-amber-500 hover:from-yellow-500 hover:to-amber-400 text-black font-black text-xs px-5 shadow-[0_0_15px_rgba(212,175,55,0.2)] hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] transition-all rounded-lg"
                  >
                    {joiningId === table.id ? "Staking..." : "Join Table"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
