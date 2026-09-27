import { TableFelt } from "@/components/game/TableFelt";
import { MatchStatusBanner } from "@/components/game/MatchStatusBanner";
import { prisma } from "@/lib/prisma";

export default async function TablePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const match = await prisma.match.findUnique({
    where: { id: params.id },
    include: {
      stakes: { where: { isPrivate: false } },
    },
  });

  const publicStake = match?.stakes[0];
  const stakeAmount = publicStake ? Number(publicStake.amount) : undefined;

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-6 h-14 flex items-center border-b border-border/40 bg-card">
        <div className="font-bold tracking-tight font-mono text-sm">
          Table #{params.id.slice(0, 8)}...
        </div>
        <div className="ml-auto text-sm text-muted-foreground flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          Preprod Network
        </div>
      </header>
      <main className="flex-1 flex flex-col">
        <MatchStatusBanner matchId={params.id} />
        <TableFelt
          matchId={params.id}
          contractAddress={match?.moveContract || ""}
          stakeAmount={stakeAmount}
          matchStatus={match?.status}
        />
      </main>
    </div>
  );
}
