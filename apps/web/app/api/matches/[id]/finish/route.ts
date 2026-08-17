import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // The id parameter here is actually the contractAddress because of how TableFelt calls it
    const { id: contractAddress } = await params;

    // Find the match by contract address
    const match = await prisma.match.findFirst({
      where: { moveContract: contractAddress },
      include: { players: { include: { user: true } } }
    });

    if (match) {
      // Read moves to determine winner deterministically on the backend
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let moves: any = {};
      try {
        const movesFile = path.join(process.cwd(), '.moves.json');
        if (fs.existsSync(movesFile)) {
          moves = JSON.parse(fs.readFileSync(movesFile, 'utf8'));
        }
      } catch (e) {
        console.error("Failed to read moves", e);
      }

      const matchMoves = moves[contractAddress];
      if (matchMoves && matchMoves.p1 && matchMoves.p2) {
        const p1Val = Number(matchMoves.p1.value);
        const p2Val = Number(matchMoves.p2.value);

        let p1Result = "loss";
        let p2Result = "loss";
        if (p1Val > p2Val) {
          p1Result = "win";
        } else if (p2Val > p1Val) {
          p2Result = "win";
        } else {
          p1Result = "draw";
          p2Result = "draw";
        }

        // Update both players natively!
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const p1 = match.players.find((p: any) => p.seat === 0);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const p2 = match.players.find((p: any) => p.seat === 1);

        if (p1) {
          await prisma.matchPlayer.update({
            where: { id: p1.id },
            data: { result: p1Result }
          });
        }
        if (p2) {
          await prisma.matchPlayer.update({
            where: { id: p2.id },
            data: { result: p2Result }
          });
        }
      }

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
