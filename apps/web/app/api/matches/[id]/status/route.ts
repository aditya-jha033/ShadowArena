import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        players: true,
      },
    });

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    return NextResponse.json({
      status: match.status,
      playerCount: match.players.length,
      isFull: match.players.length >= 2,
    });
  } catch (error) {
    console.error("[GET /api/matches/[id]/status]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
