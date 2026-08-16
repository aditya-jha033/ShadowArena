import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get("address");
    if (!address) return new Response("address required", { status: 400 });

    const user = await prisma.user.findUnique({ where: { walletAddress: address } });
    if (!user) return Response.json([]);

    const matchPlayers = await prisma.matchPlayer.findMany({
      where: { userId: user.id },
      include: {
        match: {
          include: {
            stakes: { where: { userId: user.id } },
            payouts: { where: { userId: user.id } },
            moves: { take: 1, orderBy: { createdAt: "asc" } },
          },
        },
      },
      orderBy: { match: { createdAt: "desc" } },
      take: 10,
    });

    const activity = matchPlayers.map((mp) => {
      const stake = mp.match.stakes[0];
      const payout = mp.match.payouts[0];
      const stakeAmount = Number(stake?.amount ?? 0);
      const payoutAmount = Number(payout?.amount ?? 0);

      let amountDisplay = "—";
      if (mp.result === "win") amountDisplay = `+${payoutAmount - stakeAmount}`;
      else if (mp.result === "loss") amountDisplay = `-${stakeAmount}`;
      else if (mp.result === "draw") amountDisplay = "+0";

      return {
        id: mp.id,
        matchId: mp.matchId,
        game: mp.match.gameType === "card_duel" ? "High Card Duel" : mp.match.gameType,
        result: mp.result ?? "pending",
        amount: amountDisplay,
        settledAt: mp.match.settledAt ?? mp.match.createdAt,
        proofTx: mp.match.moves[0]?.proofTx ?? null,
      };
    });

    return Response.json(activity);
  } catch (e) {
    console.error("[GET /api/user/activity]", e);
    return new Response("Internal server error", { status: 500 });
  }
}
