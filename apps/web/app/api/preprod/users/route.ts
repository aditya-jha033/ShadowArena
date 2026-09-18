import { NextResponse } from "next/server";
import { PREPROD_USERS } from "@/src/data/preprodUsers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const dbUsers = await prisma.user.findMany({
      include: {
        _count: {
          select: { matches: true },
        },
      },
    });

    const dbUserMap = new Map();
    for (const user of dbUsers) {
      dbUserMap.set(user.walletAddress, {
        matchCount: user._count.matches,
      });
    }

    const merged = PREPROD_USERS.map((user) => {
      const dbInfo = dbUserMap.get(user.address);
      return {
        ...user,
        matchCount: dbInfo?.matchCount || 0,
      };
    });

    return NextResponse.json(merged);
  } catch (error) {
    console.error("[GET /api/preprod/users]", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
