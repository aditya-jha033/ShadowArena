import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { walletAddress } = await req.json();
    if (!walletAddress) return new Response("walletAddress required", { status: 400 });

    const user = await prisma.user.upsert({
      where: { walletAddress },
      update: {},
      create: { walletAddress },
    });

    return Response.json(user);
  } catch (e) {
    console.error("[POST /api/user]", e);
    return new Response("Internal server error", { status: 500 });
  }
}
