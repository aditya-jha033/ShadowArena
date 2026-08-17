"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Swords, Users, Clock, ChevronRight, Shield, Zap, Trophy, Dices } from "lucide-react";
import { StakeModal } from "@/components/game/StakeModal";
import { Badge } from "@/components/ui/badge";

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

export default function LobbyPage() {
  const [tables, setTables] = useState<OpenTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/matches/open", { cache: "no-store" });
        if (res.ok) setTables(await res.json());
      } catch (e) {
        console.error("Failed to load open tables", e);
      } finally {
        setLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 10_000);
    return () => clearInterval(interval);
  }, []);

  const handleJoinMatch = async (table: OpenTable) => {
    try {
      setJoiningId(table.id);
      
      let amount = table.rawStakeAmount;
      if (table.isPrivateStake) {
        const input = window.prompt("This is a Private Wager. Enter the agreed DUST amount to match Player 1:");
        if (!input) return;
        amount = Number(input);
      }

      if (!amount || isNaN(amount)) {
        throw new Error("Invalid stake amount");
      }

      if (!table.stakeContract) {
        throw new Error("Match missing stake contract address");
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w1am = (window as any).midnight?.["1am"];
      if (!w1am) throw new Error("1AM Wallet not installed");

      const api = await w1am.connect("preview");
      const { callMidnightCircuit } = await import("@/lib/midnight/deploy");

      const contractName = table.isPrivateStake ? "stake-pool-private" : "stake-pool";
      const circuitName = table.isPrivateStake ? "stakePrivate" : "stakePlayer2";

      // For private stake, Player 2 needs a dummy nonce too
      const args = table.isPrivateStake 
        ? [BigInt(amount), crypto.getRandomValues(new Uint8Array(32))]
        : [BigInt(amount)];

      const withRetry = async <T,>(operation: () => Promise<T>, retries = 6, delay = 5000): Promise<T> => {
        for (let i = 0; i < retries; i++) {
          try {
            return await operation();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (e: any) {
            if (e.message?.includes("Wallet busy") && i < retries - 1) {
              console.log(`Wallet busy, retrying in ${delay/1000}s...`);
              await new Promise(r => setTimeout(r, delay));
            } else {
              throw e;
            }
          }
        }
        throw new Error("Wallet remained busy for too long.");
      };

      await withRetry(() => callMidnightCircuit(api, contractName, table.stakeContract as string, circuitName, args));

      // Update database so table disappears from open lobby
      const addresses = await api.getShieldedAddresses();
      await fetch(`/api/matches/${table.id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: addresses.shieldedCoinPublicKey })
      });

      // Now navigate to table
      router.push(`/table/${table.id}`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Failed to join table");
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-20 md:pb-8">
      {/* Header */}
      <header className="px-6 h-16 flex items-center justify-between border-b border-white/[0.06] bg-black/20 backdrop-blur-sm sticky top-14 md:top-0 z-40">
        <div className="flex items-center gap-3">
          <Swords className="w-5 h-5 text-violet-400" />
          <span className="font-bold tracking-tight text-xl">Lobby</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Preview Network · Live
        </div>
      </header>

      <main className="flex-1 p-6 lg:p-10 max-w-6xl mx-auto w-full space-y-10">

        {/* Hero CTA */}
        <section className="relative rounded-2xl border border-violet-500/20 bg-violet-500/5 p-8 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-violet-600/15 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold tracking-tight">Enter the Arena</h1>
              <p className="text-muted-foreground max-w-md">
                Create a private duel table, set your stake, and challenge any opponent.
                Every move is ZK-proven on Midnight Network.
              </p>
              <div className="flex items-center gap-4 pt-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Shield className="w-3.5 h-3.5 text-violet-400" /> ZK-Verified
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> Dust-Free
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Trophy className="w-3.5 h-3.5 text-teal-400" /> Instant Payout
                </div>
              </div>
            </div>
            <div className="shrink-0">
              <StakeModal gameMode="card_duel" onMatchCreated={() => {
                // Refresh tables after creating a new one
                fetch("/api/matches/open").then(r => r.json()).then(setTables);
              }} />
            </div>
          </div>
        </section>

        {/* Game mode cards */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">Choose Game Mode</h2>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="group relative rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:border-violet-500/30 hover:bg-violet-500/[0.04] transition-all duration-300 p-6 flex gap-5">
              <div className="w-12 h-12 rounded-xl bg-violet-600/15 border border-violet-500/20 flex items-center justify-center shrink-0">
                <Swords className="w-6 h-6 text-violet-400" />
              </div>
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">High Card Duel</h3>
                  <Badge className="text-[10px] bg-emerald-500/15 text-emerald-400 border-emerald-500/20">Live</Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Commit a hidden card. Highest card wins the entire pot. Shuffle is proven fair by ZK circuit.
                </p>
                <div className="flex items-center gap-3 pt-2 text-xs text-muted-foreground font-mono">
                  <span>Min: 100 tDUST</span>
                  <span>·</span>
                  <span>~2 min/round</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all mt-1 shrink-0" />
            </div>

            <div className="relative rounded-2xl border border-white/[0.06] bg-white/[0.01] p-6 flex gap-5 opacity-60 cursor-not-allowed">
              <div className="w-12 h-12 rounded-xl bg-teal-600/10 border border-teal-500/15 flex items-center justify-center shrink-0">
                <Dices className="w-6 h-6 text-teal-400/50" />
              </div>
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">Dice Duel</h3>
                  <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-500/30">Soon</Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Predict the hidden roll. Lock in your wager privately. Provably fair on-chain randomness.
                </p>
                <div className="text-xs text-muted-foreground font-mono pt-2">Coming Q3 2026</div>
              </div>
            </div>
          </div>
        </section>

        {/* Live open tables from DB */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Open Tables</h2>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="w-3.5 h-3.5" />
              {loading ? "—" : tables.length} waiting
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.07] overflow-hidden divide-y divide-white/[0.06]">
            {loading && (
              <div className="py-12 text-center text-muted-foreground text-sm animate-pulse">
                Loading open tables...
              </div>
            )}

            {!loading && tables.length === 0 && (
              <div className="py-16 text-center text-muted-foreground text-sm">
                No open tables right now. Be the first to create one!
              </div>
            )}

            {!loading && tables.map((table) => (
              <div key={table.id} className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.03] transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-lg bg-violet-600/15 border border-violet-500/15 flex items-center justify-center">
                    <Swords className="w-4 h-4 text-violet-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{table.game}</div>
                    <div className="text-xs text-muted-foreground font-mono">Host: {table.hostAddress}</div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-mono font-bold text-amber-400">
                      {table.isPrivateStake ? "🔒 Hidden" : table.stake}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3" /> Waiting for opponent
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-violet-600 hover:bg-violet-500 text-white text-xs px-4"
                    onClick={() => handleJoinMatch(table)}
                    disabled={joiningId === table.id}
                  >
                    {joiningId === table.id ? "Staking..." : "Join"}
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
