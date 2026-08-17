const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany();
  console.log("Users:", users);
  const matches = await prisma.match.findMany({ include: { players: true, stakes: true } });
  console.log("Matches:", JSON.stringify(matches, null, 2));
}

check().catch(console.error).finally(() => prisma.$disconnect());
