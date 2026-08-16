import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { walletAddress, gameMode, stakeAmount, isPrivate } = await req.json();

    if (!walletAddress || !gameMode) {
      return new Response("walletAddress and gameMode are required", { status: 400 });
    }

    // Ensure user exists
    const user = await prisma.user.upsert({
      where: { walletAddress },
      update: {},
      create: { walletAddress },
    });

    // Create the match
    const match = await prisma.match.create({
      data: {
        gameType: gameMode,
        status: "pending",
        players: {
          create: { userId: user.id, seat: 0 },
        },
        seats: {
          create: [
            { seatIndex: 0, userId: user.id, isReady: false },
            { seatIndex: 1, userId: null, isReady: false },
          ],
        },
        ...(stakeAmount && {
          stakes: {
            create: {
              userId: user.id,
              amount: isPrivate ? undefined : stakeAmount,
              isPrivate: isPrivate ?? false,
              txRef: "pending", // Will be updated when on-chain tx is confirmed
            },
          },
        }),
      },
    });

    return Response.json({ matchId: match.id });
  } catch (e) {
    console.error("[POST /api/matches]", e);
    return new Response("Internal server error", { status: 500 });
  }
}
