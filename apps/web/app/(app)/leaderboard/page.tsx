import { prisma } from "@/lib/prisma";
import { Trophy, Swords, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

async function getLeaderboard() {
  // Count wins per user from settled matches
  const wins = await prisma.matchPlayer.groupBy({
    by: ["userId"],
    where: { result: "win" },
    _count: { result: true },
    orderBy: { _count: { result: "desc" } },
    take: 20,
  });

  // Get all play counts per user
  const plays = await prisma.matchPlayer.groupBy({
    by: ["userId"],
    _count: { id: true },
  });

  const playsMap = Object.fromEntries(plays.map((p) => [p.userId, p._count.id]));

  // Fetch wallet addresses
  const userIds = wins.map((w) => w.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, walletAddress: true },
  });
  const userMap = Object.fromEntries(users.map((u) => [u.id, u.walletAddress]));

  return wins.map((w, i) => {
    const addr = userMap[w.userId] ?? "Unknown";
    const shortAddr = addr.length > 16 ? `${addr.slice(0, 10)}...${addr.slice(-6)}` : addr;
    const totalPlays = playsMap[w.userId] ?? 0;
    const winCount = w._count.result;
    const winRate = totalPlays > 0 ? Math.round((winCount / totalPlays) * 100) : 0;
    return { rank: i + 1, address: shortAddr, wins: winCount, played: totalPlays, winRate };
  });
}

export default async function LeaderboardPage() {
  const rows = await getLeaderboard();

  return (
    <div className="flex flex-col min-h-screen pb-12">
      <header className="px-6 h-16 flex items-center border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="font-bold tracking-tight text-xl flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          Leaderboard
        </div>
        <div className="ml-auto text-xs font-mono text-muted-foreground">
          Live · Preprod Network
        </div>
      </header>

      <main className="flex-1 p-6 lg:p-12 max-w-4xl mx-auto w-full space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Top Players</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Ranked by wins on Midnight Preprod. All matches are ZK-verified on-chain.
          </p>
        </div>

        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center rounded-2xl border border-white/[0.07] py-20">
            <Swords className="w-12 h-12 text-muted-foreground/30" />
            <p className="text-xl font-semibold">No matches settled yet</p>
            <p className="text-muted-foreground text-sm max-w-sm">
              The leaderboard will populate once matches are completed on the Preprod network.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/[0.07] overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[48px_1fr_80px_80px_80px] gap-4 px-6 py-3 bg-white/[0.03] border-b border-white/[0.06] text-xs text-muted-foreground font-mono uppercase tracking-wider">
              <span className="text-center">#</span>
              <span>Player</span>
              <span className="text-right">Wins</span>
              <span className="text-right">Played</span>
              <span className="text-right flex items-center justify-end gap-1">
                <TrendingUp className="w-3 h-3" /> Win%
              </span>
            </div>

            {rows.map((row) => (
              <div
                key={row.rank}
                className="grid grid-cols-[48px_1fr_80px_80px_80px] gap-4 px-6 py-4 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors items-center"
              >
                {/* Rank badge */}
                <div className="flex items-center justify-center">
                  {row.rank <= 3 ? (
                    <span className={`text-lg font-black ${row.rank === 1 ? "text-yellow-400" : row.rank === 2 ? "text-gray-300" : "text-amber-600"}`}>
                      {row.rank === 1 ? "🥇" : row.rank === 2 ? "🥈" : "🥉"}
                    </span>
                  ) : (
                    <span className="text-muted-foreground font-mono text-sm">{row.rank}</span>
                  )}
                </div>

                {/* Address */}
                <span className="font-mono text-sm text-foreground/90">{row.address}</span>

                {/* Wins */}
                <span className="text-right font-black text-emerald-400 font-mono">{row.wins}</span>

                {/* Played */}
                <span className="text-right text-muted-foreground font-mono text-sm">{row.played}</span>

                {/* Win rate */}
                <span className={`text-right font-mono text-sm font-bold ${row.winRate >= 60 ? "text-emerald-400" : row.winRate >= 40 ? "text-amber-400" : "text-muted-foreground"}`}>
                  {row.winRate}%
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
