import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
  try {
    const [matchesPlayed, zkProofs, users] = await Promise.all([
      prisma.match.count({ where: { status: "settled" } }),
      prisma.matchMove.count(),
      prisma.user.count(),
    ]);
    
    const stakeSum = await prisma.stake.aggregate({
      where: { isPrivate: false },
      _sum: { amount: true },
    });
    
    return Response.json({
      matchesPlayed,
      tDustStaked: Number(stakeSum._sum.amount ?? 0),
      zkProofsVerified: zkProofs,
      registeredUsers: users,
    });
  } catch (error) {
    console.error("[GET /api/stats]", error);
    return Response.json(
      { error: "Failed to fetch stats", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
