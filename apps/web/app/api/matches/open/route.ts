import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Fetch all pending (open) matches that only have 1 seat filled
    const matches = await prisma.match.findMany({
      where: { status: "pending" },
      include: {
        players: { include: { user: true } },
        stakes: true, // Fetch all stakes to check privacy flag explicitly
      },
      orderBy: { createdAt: "desc" },
    });

    const openTables = matches
      .filter((m) => m.players.length === 1) // Only 1 player seated = open for opponent
      .map((m) => {
        const host = m.players[0]?.user;
        const stake = m.stakes[0];
        const isPrivate = stake?.isPrivate ?? false;
        
        const addr = host?.walletAddress ?? "Unknown";
        const shortAddr = addr.length > 12
          ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
          : addr;

        const displayAmount = (stake && !isPrivate) ? Number(stake.amount) : null;

        return {
          id: m.id,
          game: m.gameType === "card_duel" ? "High Card Duel" : m.gameType,
          hostAddress: shortAddr,
          stake: displayAmount ? `${displayAmount.toLocaleString()} tDUST` : (isPrivate ? "Private" : "No Stake"),
          rawStakeAmount: displayAmount,
          isPrivateStake: isPrivate,
          stakeContract: m.stakeContract,
          createdAt: m.createdAt,
        };
      });

    return Response.json(openTables);
  } catch (e) {
    console.error("[GET /api/matches/open]", e);
    return new Response("Internal server error", { status: 500 });
  }
}
