import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * POST /api/matches/[id]/finish
 *
 * Called by the client after the ZK reveal transaction is confirmed on-chain.
 * The client passes the result it computed locally; this route persists it to
 * the database so match history and leaderboard queries reflect the outcome.
 *
 * Move pre-images are stored in Prisma (committedValue / committedNonce on
 * MatchPlayer) — NOT on the filesystem. The legacy fs-based approach was
 * replaced in commit d11527f (Issue #007).
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // The dynamic segment is the move-contract address, which uniquely
    // identifies the match after the staking contract address was set.
    const { id: contractAddress } = await params;

    // Pull the committed card values directly from the DB (set when each
    // player locked their card via /api/matches/[id]/moves).
    const match = await prisma.match.findFirst({
      where: { moveContract: contractAddress },
      include: { players: { include: { user: true } } },
    });

    if (match) {
      const p1 = match.players.find((p) => p.seat === 0);
      const p2 = match.players.find((p) => p.seat === 1);

      if (p1?.committedValue != null && p2?.committedValue != null) {
        const p1Val = p1.committedValue;
        const p2Val = p2.committedValue;

        let p1Result: "win" | "loss" | "draw" = "loss";
        let p2Result: "win" | "loss" | "draw" = "loss";

        if (p1Val > p2Val) {
          p1Result = "win";
        } else if (p2Val > p1Val) {
          p2Result = "win";
        } else {
          p1Result = "draw";
          p2Result = "draw";
        }

        if (p1) {
          await prisma.matchPlayer.update({
            where: { id: p1.id },
            data: { result: p1Result },
          });
        }
        if (p2) {
          await prisma.matchPlayer.update({
            where: { id: p2.id },
            data: { result: p2Result },
          });
        }
      }

      // Mark match as settled with a timestamp
      await prisma.match.update({
        where: { id: match.id },
        data: { status: "settled", settledAt: new Date() },
      });
    }

    return Response.json({ success: true });
  } catch (e) {
    console.error("[POST /api/matches/[id]/finish]", e);
    return new Response("Internal server error", { status: 500 });
  }
}
