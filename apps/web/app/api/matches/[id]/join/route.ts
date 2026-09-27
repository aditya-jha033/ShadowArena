import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { walletAddress } = await req.json();

    if (!walletAddress) {
      return new Response("walletAddress is required", { status: 400 });
    }

    const user = await prisma.user.upsert({
      where: { walletAddress },
      update: {},
      create: { walletAddress },
    });

    // Fetch the match + its pre-shuffled deck
    const match = await prisma.match.findUnique({
      where: { id },
      include: { players: true },
    });

    if (!match) return new Response("Match not found", { status: 404 });
    if (match.status !== "pending") return new Response("Match is not open", { status: 409 });

    // Deal 5 unique cards to each player from the pre-shuffled deck
    const deck = (match.deckData as number[]) ?? [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
    const p1Hand = deck.slice(0, 5);
    const p2Hand = deck.slice(5, 10);

    // Update P1's hand + add P2 + set match to active — all in one transaction
    await prisma.$transaction([
      // Give P1 their hand
      prisma.matchPlayer.updateMany({
        where: { matchId: id, seat: 0 },
        data: { hand: p1Hand },
      }),
      // Add P2 with their hand
      prisma.matchPlayer.create({
        data: { matchId: id, userId: user.id, seat: 1, hand: p2Hand },
      }),
      // Seat P2
      prisma.tableSeat.updateMany({
        where: { matchId: id, seatIndex: 1 },
        data: { userId: user.id },
      }),
      // Set match active
      prisma.match.update({
        where: { id },
        data: { status: "active" },
      }),
    ]);

    return Response.json({ success: true });
  } catch (e) {
    console.error("[POST /api/matches/[id]/join]", e);
    return new Response("Internal server error", { status: 500 });
  }
}
