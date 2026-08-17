import { TableFelt } from "@/components/game/TableFelt";
import { prisma } from "@/lib/prisma";

export default async function TablePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const match = await prisma.match.findUnique({ where: { id: params.id } });

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-6 h-14 flex items-center border-b border-border/40 bg-card">
        <div className="font-bold tracking-tight">Table #{params.id}</div>
        <div className="ml-auto text-sm text-muted-foreground flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          Preview Network
        </div>
      </header>
      <main className="flex-1 flex flex-col">
        <TableFelt contractAddress={match?.moveContract || ""} />
      </main>
    </div>
  );
}
