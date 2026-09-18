import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { overallRating, whatBroke, whatConfused, suggestions, walletAddress } = body;

    if (!overallRating) {
      return NextResponse.json({ error: "overallRating is required" }, { status: 400 });
    }

    const feedback = await prisma.feedback.create({
      data: {
        overallRating,
        whatBroke,
        whatConfused,
        suggestions,
        walletAddress,
      },
    });

    return NextResponse.json({ success: true, id: feedback.id });
  } catch (e) {
    console.error("[POST /api/feedback]", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const feedbackList = await prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    return NextResponse.json(feedbackList);
  } catch (e) {
    console.error("[GET /api/feedback]", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
