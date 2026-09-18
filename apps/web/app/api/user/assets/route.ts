import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const walletAddress = searchParams.get("walletAddress");

    if (!walletAddress) {
      return NextResponse.json({ error: "walletAddress required" }, { status: 400 });
    }

    const assets = await prisma.assetOwnership.findMany({
      where: {
        user: { walletAddress },
      },
      include: {
        asset: true,
      },
    });

    return NextResponse.json(assets);
  } catch (error) {
    console.error("[GET /api/user/assets]", error);
    return NextResponse.json({ error: "Failed to fetch assets" }, { status: 500 });
  }
}
