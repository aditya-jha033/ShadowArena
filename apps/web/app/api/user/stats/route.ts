import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get("address");
    if (!address) return new Response("address required", { status: 400 });

    const user = await prisma.user.findUnique({
      where: { walletAddress: address },
      include: {
        matches: {
          include: { match: true },
        },
      },
    });

    if (!user) return Response.json({ matchesPlayed: 0, wins: 0, losses: 0, draws: 0, totalStaked: 0, winRate: 0 });

    const matchesPlayed = user.matches.length;
    const wins = user.matches.filter((m) => m.result === "win").length;
    const losses = user.matches.filter((m) => m.result === "loss").length;
    const draws = user.matches.filter((m) => m.result === "draw").length;
    const winRate = matchesPlayed > 0 ? Math.round((wins / matchesPlayed) * 100) : 0;

    // Sum total staked from stakes table
    const stakes = await prisma.stake.findMany({
      where: { userId: user.id, isPrivate: false },
    });
    const totalStaked = stakes.reduce((sum, s) => sum + Number(s.amount ?? 0), 0);

    return Response.json({ matchesPlayed, wins, losses, draws, winRate, totalStaked });
  } catch (e) {
    console.error("[GET /api/user/stats]", e);
    return new Response("Internal server error", { status: 500 });
  }
}
