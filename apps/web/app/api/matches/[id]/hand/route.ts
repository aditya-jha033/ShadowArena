import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/matches/[id]/hand?wallet=mn_addr_preprod1...
 * Returns ONLY the requesting player's 5-card hand for this match.
 * The opponent's hand is never included — enforced server-side.
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const url = new URL(req.url);
    const walletAddress = url.searchParams.get("wallet");

    if (!walletAddress) {
      return new Response("wallet query param required", { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { walletAddress } });
    if (!user) return new Response("User not found", { status: 404 });

    const player = await prisma.matchPlayer.findFirst({
      where: { matchId: id, userId: user.id },
    });

    if (!player) return new Response("You are not in this match", { status: 403 });
    if (!player.hand) return new Response("Hand not dealt yet — waiting for opponent to join", { status: 202 });

    return Response.json({
      hand: player.hand as number[],
      seat: player.seat,
      hasCommitted: player.committedValue !== null,
    });
  } catch (e) {
    console.error("[GET /api/matches/[id]/hand]", e);
    return new Response("Internal server error", { status: 500 });
  }
}
