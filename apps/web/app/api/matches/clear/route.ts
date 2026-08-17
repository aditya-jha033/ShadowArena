import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.matchMove.deleteMany();
    await prisma.matchPlayer.deleteMany();
    await prisma.tableSeat.deleteMany();
    await prisma.stake.deleteMany();
    await prisma.payout.deleteMany();
    await prisma.match.deleteMany();
    return Response.json({ success: true, message: "Database wiped perfectly." });
  } catch (e) {
    console.error(e);
    return new Response("Error wiping db", { status: 500 });
  }
}
