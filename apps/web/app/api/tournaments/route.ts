import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const tournaments = await prisma.tournament.findMany({
      orderBy: { startsAt: "asc" },
      include: {
        _count: { select: { entries: true } },
      },
    });

    const data = tournaments.map((t) => ({
      id: t.id,
      name: t.name,
      status: t.status,
      entryFee: Number(t.entryFee),
      prizePool: Number(t.prizePool),
      startsAt: t.startsAt,
      entryCount: t._count.entries,
    }));

    return Response.json(data);
  } catch (e) {
    console.error("[GET /api/tournaments]", e);
    return new Response("Internal server error", { status: 500 });
  }
}
