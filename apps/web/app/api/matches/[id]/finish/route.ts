import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // The id parameter here is actually the contractAddress because of how TableFelt calls it
    const contractAddress = params.id;

    // Find the match by contract address
    const match = await prisma.match.findFirst({
      where: { moveContract: contractAddress },
    });

    if (match) {
      // Mark as finished
      await prisma.match.update({
        where: { id: match.id },
        data: { status: "finished" },
      });
    }

    return Response.json({ success: true });
  } catch (e) {
    console.error("[POST /api/matches/[id]/finish]", e);
    return new Response("Internal server error", { status: 500 });
  }
}
