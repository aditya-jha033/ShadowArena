import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const wallet = searchParams.get("wallet");
    if (!wallet) return Response.json({ error: "Wallet required" }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { walletAddress: wallet },
    });

    if (!user) return Response.json([]);

    // Fetch settled matches where this user played
    const matches = await prisma.matchPlayer.findMany({
      where: {
        userId: user.id,
        match: { status: "settled" },
      },
      include: {
        match: {
          include: {
            stakes: true,
            players: { include: { user: true } },
          },
        },
      },
      orderBy: { match: { settledAt: "desc" } },
      take: 20,
    });

    const history = matches.map((mp) => {
      const match = mp.match;
      const opponentPlayer = match.players.find((p) => p.userId !== user.id);
      const opponentAddress = opponentPlayer?.user?.walletAddress ?? "AI Opponent";
      const shortOp = opponentAddress.length > 12
        ? `${opponentAddress.substring(0, 6)}...${opponentAddress.substring(opponentAddress.length - 4)}`
        : opponentAddress;

      const userStake = match.stakes.find((s) => s.userId === user.id);
      const isPrivate = userStake?.isPrivate ?? false;
      const stakeLabel = userStake 
        ? (isPrivate ? "Private Stake" : `${Number(userStake.amount).toLocaleString()} tDUST`) 
        : "No Stake";

      const won = mp.result === "win";
      const draw = mp.result === "draw";
      
      let amountDelta: string | null = null;
      if (userStake && !isPrivate) {
        if (won) amountDelta = `+${Number(userStake.amount) * 2} tDUST`; // Winner takes pot
        else if (draw) amountDelta = `+${Number(userStake.amount)} tDUST`; // Refund
        else amountDelta = `-${Number(userStake.amount)} tDUST`; // Lost
      } else if (userStake && isPrivate) {
        amountDelta = won ? "+ Won Pot" : (draw ? "Refunded" : "- Lost Stake");
      }

      return {
        id: match.id,
        date: match.settledAt ?? match.createdAt,
        opponent: shortOp,
        result: mp.result,
        myCard: mp.committedValue ?? "Unknown",
        opCard: opponentPlayer?.committedValue ?? "Unknown",
        stake: stakeLabel,
        delta: amountDelta,
        moveContract: match.moveContract,
      };
    });

    return Response.json(history);
  } catch (e) {
    console.error("[GET /api/matches/history]", e);
    return new Response("Internal server error", { status: 500 });
  }
}
