import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const listings = await prisma.marketplaceListing.findMany({
      where: { isActive: true },
      include: {
        asset: true,
        seller: { select: { walletAddress: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const data = dbListings.map((l: any) => {
      const addr = l.seller.walletAddress;
      const shortAddr =
        addr.length > 12
          ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
          : addr;
      return {
        id: l.id,
        assetId: l.assetId,
        name: l.asset.name,
        type: l.asset.type,
        imageUrl: l.asset.imageUrl,
        description: l.asset.description,
        price: Number(l.price),
        sellerAddress: shortAddr,
      };
    });

    return Response.json(data);
  } catch (e) {
    console.error("[GET /api/marketplace]", e);
    return new Response("Internal server error", { status: 500 });
  }
}
