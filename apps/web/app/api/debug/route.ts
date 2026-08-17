import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const users = await prisma.user.findMany({
    include: { matches: true }
  });
  const matches = await prisma.match.findMany({
    include: { players: { include: { user: true } } }
  });
  return Response.json({ users, matches });
}
