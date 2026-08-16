"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Calendar, Flame, Loader2, Clock } from "lucide-react";
import { useWalletStore } from "@/lib/midnight/wallet";
import { toast } from "sonner";

interface Tournament {
  id: string;
  name: string;
  status: string; // "upcoming" | "active" | "completed"
  entryFee: number;
  prizePool: number;
  startsAt: string;
  entryCount: number;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const STATUS_STYLES: Record<string, string> = {
  active:    "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
  upcoming:  "text-amber-400 border-amber-400/30 bg-amber-400/10",
  completed: "text-muted-foreground border-white/10",
};

const STATUS_LABELS: Record<string, string> = {
  active:    "🔴 Live Now",
  upcoming:  "⏳ Upcoming",
  completed: "✓ Completed",
};

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const { isConnected } = useWalletStore();

  useEffect(() => {
    fetch("/api/tournaments")
      .then((r) => r.json())
      .then(setTournaments)
      .catch(() => setTournaments([]))
      .finally(() => setLoading(false));
  }, []);

  const handleJoin = (t: Tournament) => {
    if (!isConnected) {
      toast.error("Connect your wallet first");
      return;
    }
    toast.info("Tournament entry coming soon", {
      description: `Entry for "${t.name}" will be available once contracts are deployed.`,
    });
  };

  const active = tournaments.filter((t) => t.status === "active");
  const upcoming = tournaments.filter((t) => t.status === "upcoming");
  const completed = tournaments.filter((t) => t.status === "completed");

  return (
    <div className="flex flex-col min-h-screen pb-12">
      <header className="px-6 h-16 flex items-center border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="font-bold tracking-tight text-xl flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          Tournaments
        </div>
      </header>

      <main className="flex-1 p-6 lg:p-12 max-w-7xl mx-auto w-full space-y-10">

        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : tournaments.length === 0 ? (
          /* ── Empty state ── */
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
            <div className="w-20 h-20 rounded-full bg-amber-400/10 flex items-center justify-center">
              <Trophy className="w-10 h-10 text-amber-400/40" />
            </div>
            <p className="text-xl font-semibold">No tournaments yet</p>
            <p className="text-muted-foreground text-sm max-w-sm">
              Tournaments will appear here once they are created by the admin. Check back soon!
            </p>
          </div>
        ) : (
          <>
            {/* ── Featured / Active ── */}
            {active.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                  <Flame className="w-4 h-4 text-red-400" /> Live Now
                </h2>
                <div className="grid gap-5 md:grid-cols-2">
                  {active.map((t) => (
                    <div key={t.id} className="relative rounded-2xl border border-amber-400/20 bg-amber-400/[0.04] p-8 overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-400/10 via-transparent to-transparent pointer-events-none" />
                      <div className="relative z-10 space-y-4">
                        <Badge variant="outline" className={`text-[11px] font-mono ${STATUS_STYLES.active}`}>
                          {STATUS_LABELS.active}
                        </Badge>
                        <h3 className="text-2xl font-black tracking-tight">{t.name}</h3>
                        <div className="flex items-center gap-8 font-mono">
                          <div className="flex flex-col">
                            <span className="text-[11px] text-muted-foreground uppercase tracking-wider">Prize Pool</span>
                            <span className="text-2xl text-amber-400 font-bold">{t.prizePool.toLocaleString()} tDUST</span>
                          </div>
                          <div className="w-px h-10 bg-white/[0.08]" />
                          <div className="flex flex-col">
                            <span className="text-[11px] text-muted-foreground uppercase tracking-wider">Entry Fee</span>
                            <span className="text-2xl font-bold">{t.entryFee.toLocaleString()} tDUST</span>
                          </div>
                          <div className="w-px h-10 bg-white/[0.08]" />
                          <div className="flex flex-col">
                            <span className="text-[11px] text-muted-foreground uppercase tracking-wider">Players</span>
                            <span className="text-2xl font-bold flex items-center gap-1">
                              <Users className="w-4 h-4" />{t.entryCount}
                            </span>
                          </div>
                        </div>
                        <Button
                          size="lg"
                          className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-8"
                          onClick={() => handleJoin(t)}
                        >
                          Join Tournament
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ── Upcoming ── */}
            {upcoming.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" /> Upcoming
                </h2>
                <div className="rounded-2xl border border-white/[0.07] overflow-hidden divide-y divide-white/[0.06]">
                  {upcoming.map((t) => (
                    <div key={t.id} className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.03] transition-colors">
                      <div className="space-y-0.5">
                        <div className="font-semibold">{t.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5 font-mono">
                          <Calendar className="w-3 h-3" />
                          {formatDate(t.startsAt)}
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                          <div className="text-sm font-mono font-bold text-amber-400">{t.prizePool.toLocaleString()} tDUST</div>
                          <div className="text-xs text-muted-foreground font-mono">Entry: {t.entryFee.toLocaleString()} tDUST</div>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Users className="w-3.5 h-3.5" /> {t.entryCount}
                        </div>
                        <Button
                          size="sm"
                          className="bg-violet-600 hover:bg-violet-500 text-white"
                          onClick={() => handleJoin(t)}
                        >
                          Register
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ── Completed ── */}
            {completed.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-lg font-semibold tracking-tight text-muted-foreground">Completed</h2>
                <Card className="bg-card shadow-none">
                  <CardContent className="divide-y divide-border/50 p-0">
                    {completed.map((t) => (
                      <div key={t.id} className="flex items-center justify-between px-6 py-4 opacity-60">
                        <div>
                          <div className="font-medium text-sm">{t.name}</div>
                          <div className="text-xs text-muted-foreground font-mono">{formatDate(t.startsAt)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-mono text-muted-foreground">{t.prizePool.toLocaleString()} tDUST pool</div>
                          <div className="text-xs text-muted-foreground">{t.entryCount} players</div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
