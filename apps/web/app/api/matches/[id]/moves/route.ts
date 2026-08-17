import fs from 'fs';
import path from 'path';

const movesFile = path.join(process.cwd(), '.moves.json');

function getMoves() {
  if (!fs.existsSync(movesFile)) return {};
  try {
    return JSON.parse(fs.readFileSync(movesFile, 'utf8'));
  } catch {
    return {};
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function saveMoves(moves: any) {
  fs.writeFileSync(movesFile, JSON.stringify(moves, null, 2));
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { player, value, nonce } = await req.json();
    
    const moves = getMoves();
    if (!moves[id]) moves[id] = {};
    
    // Store as array format to easily hydrate Uint8Array on the client
    moves[id][player] = { value, nonce: Array.from(Object.values(nonce)) };
    
    saveMoves(moves);
    return Response.json({ success: true });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    console.error(e);
    return new Response("Error", { status: 500 });
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const moves = getMoves();
  return Response.json(moves[id] || {});
}
