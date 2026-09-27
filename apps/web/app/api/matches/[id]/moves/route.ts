import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * POST /api/matches/[id]/moves
 * Called after a player's on-chain commit tx is confirmed.
 * Stores the card value + nonce pre-image so the opponent can fetch them for the reveal step.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { walletAddress, value, nonce } = await req.json();

    if (!walletAddress || value === undefined || !nonce) {
      return new Response("walletAddress, value and nonce are required", { status: 400 });
    }

    // Find the MatchPlayer record for this wallet + match
    const user = await prisma.user.findUnique({ where: { walletAddress } });
    if (!user) return new Response("User not found", { status: 404 });

    const player = await prisma.matchPlayer.findFirst({
      where: { matchId: id, userId: user.id },
    });
    if (!player) return new Response("Player not in this match", { status: 403 });

    // Store commit pre-image (value + nonce) in the DB
    await prisma.matchPlayer.update({
      where: { id: player.id },
      data: {
        committedValue: Number(value),
        committedNonce: Array.isArray(nonce) ? nonce : Array.from(Object.values(nonce)),
      },
    });

    return Response.json({ success: true });
  } catch (e) {
    console.error("[POST /api/matches/[id]/moves]", e);
    return new Response("Internal server error", { status: 500 });
  }
}

/**
 * GET /api/matches/[id]/moves
 * Returns both players' commit pre-images once both have committed.
 * Keyed by seat: { p1: { value, nonce }, p2: { value, nonce } } or partial.
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const players = await prisma.matchPlayer.findMany({
      where: { matchId: id },
      orderBy: { seat: "asc" },
    });

    const result: Record<string, { value: number; nonce: number[] } | null> = {
      p1: null,
      p2: null,
    };

    for (const p of players) {
      const key = p.seat === 0 ? "p1" : "p2";
      if (p.committedValue !== null && p.committedNonce !== null) {
        result[key] = {
          value: p.committedValue,
          nonce: p.committedNonce as number[],
        };
      }
    }

    return Response.json(result);
  } catch (e) {
    console.error("[GET /api/matches/[id]/moves]", e);
    return new Response("Internal server error", { status: 500 });
  }
}
