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

    // Update match to add player 2 and set status to active
    await prisma.match.update({
      where: { id },
      data: {
        status: "active",
        players: {
          create: { userId: user.id, seat: 1 },
        },
        seats: {
          updateMany: {
            where: { seatIndex: 1 },
            data: { userId: user.id },
          },
        },
      },
    });

    return Response.json({ success: true });
  } catch (e) {
    console.error("[POST /api/matches/[id]/join]", e);
    return new Response("Internal server error", { status: 500 });
  }
}
