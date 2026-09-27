import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** Fisher-Yates shuffle — generates a random ordering of cards 2–14 (Ace high) */
function shuffleDeck(): number[] {
  const deck = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export async function POST(req: Request) {
  try {
    const { walletAddress, gameMode, stakeAmount, isPrivate, stakeContractAddress, moveContractAddress } = await req.json();

    if (!walletAddress || !gameMode) {
      return new Response("walletAddress and gameMode are required", { status: 400 });
    }

    // Ensure user exists
    const user = await prisma.user.upsert({
      where: { walletAddress },
      update: {},
      create: { walletAddress },
    });

    // Generate a shuffled deck for this match (dealt to players when P2 joins)
    const deckData = shuffleDeck();

    // Create the match
    const match = await prisma.match.create({
      data: {
        gameType: gameMode,
        status: "pending",
        stakeContract: stakeContractAddress || null,
        moveContract: moveContractAddress || null,
        deckData,
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
              txRef: "pending",
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

