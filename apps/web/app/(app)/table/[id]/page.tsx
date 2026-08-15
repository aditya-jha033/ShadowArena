import { TableFelt } from "@/components/game/TableFelt";

export default function TablePage({ params }: { params: { id: string } }) {
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
        <TableFelt />
      </main>
    </div>
  );
}
