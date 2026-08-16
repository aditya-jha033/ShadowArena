"use client";

import { useState, useEffect } from "react";
import { useWalletStore } from "@/lib/midnight/wallet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ShieldAlert, Server, CheckCircle2, Loader2, Trash2, Lock } from "lucide-react";

const CONTRACTS = [
  { 
    id: "stake-pool", 
    name: "Stake Pool", 
    desc: "Public MVP Stake Pool",
    constructorArgs: [],
    required: true,
  },
  { 
    id: "stake-pool-private", 
    name: "Private Stake Pool", 
    desc: "ZSwap / Hidden Commitment Pool",
    // max: Uint<64> — max number of players (2 for a 1v1 arena game)
    constructorArgs: [2n],
    required: false,
  },
  { 
    id: "assets", 
    name: "Asset Manager", 
    desc: "Skins & Emotes NFT Contract",
    constructorArgs: [],
    required: false,
  },
  { 
    id: "shuffle-deal", 
    name: "Card Shuffler", 
    desc: "Mental Poker / ZK Shuffle Contract",
    constructorArgs: [],
    required: false,
  },
  { 
    id: "move-validity", 
    name: "Move Validator", 
    desc: "ZK Move & Win Condition Contract",
    constructorArgs: [],
    required: false,
  },
];

// Admin PIN gate component
function AdminPinGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    const adminPin = process.env.NEXT_PUBLIC_ADMIN_PIN;
    if (!adminPin) {
      if (isLocalhost) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUnlocked(true);
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setChecking(false);
      return;
    }
    const session = sessionStorage.getItem("shadowarena:admin_auth");
    if (session === adminPin) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUnlocked(true);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChecking(false);
  }, []);

  const handleUnlock = () => {
    const adminPin = process.env.NEXT_PUBLIC_ADMIN_PIN;
    if (!adminPin) {
      setError("Admin access is not configured. Contact the developer.");
      return;
    }
    if (pin === adminPin) {
      sessionStorage.setItem("shadowarena:admin_auth", adminPin);
      setUnlocked(true);
      setError("");
    } else {
      setError("Incorrect PIN. Access denied.");
      setPin("");
    }
  };

  if (checking) return null;

  if (!unlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center gap-6 p-8 rounded-2xl border border-border/40 bg-card shadow-2xl">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 border border-primary/20">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <div className="text-center space-y-1">
              <h1 className="text-xl font-bold text-foreground">Admin Access Required</h1>
              <p className="text-sm text-muted-foreground">
                Enter your admin PIN to access the deployment panel.
              </p>
            </div>
            <div className="w-full space-y-3">
              <input
                type="password"
                placeholder="Enter admin PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition"
                autoFocus
              />
              {error && (
                <p className="text-xs text-destructive font-medium">{error}</p>
              )}
              <Button onClick={handleUnlock} className="w-full">
                Unlock Admin Panel
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              This area is restricted to authorized operators only.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function DeployPage() {
  const { isConnected } = useWalletStore();
  const [deployingId, setDeployingId] = useState<string | null>(null);
  // Always start with {} so server and client render identically (avoids hydration mismatch).
  // localStorage is loaded after mount only on the client side.
  const [deployedAddresses, setDeployedAddresses] = useState<Record<string, string>>({});
  const [hydrated, setHydrated] = useState(false);

  // Load persisted addresses after first client render (post-hydration)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('shadowarena:deployedContracts');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setDeployedAddresses(JSON.parse(saved));
    } catch {}
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
  }, []);

  // Persist to localStorage whenever addresses change (only after hydration)
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem('shadowarena:deployedContracts', JSON.stringify(deployedAddresses));
  }, [deployedAddresses, hydrated]);

  const handleDeploy = async (contractId: string) => {
    if (!isConnected) {
      toast.error("Please connect your 1AM wallet first.");
      return;
    }

    const contract = CONTRACTS.find(c => c.id === contractId);
    setDeployingId(contractId);
    toast.info(`Initiating deployment for ${contractId}... Please check your 1AM wallet popup to sign.`);
    
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w1am = (window as any).midnight?.["1am"];
      if (!w1am) throw new Error("1AM Wallet not found");
      
      const api = await w1am.connect("preview");
      
      const { deployMidnightContract } = await import("@/lib/midnight/deploy");
      const { address: realAddress, txHash } = await deployMidnightContract(api, contractId, contract?.constructorArgs ?? []);
      
      setDeployedAddresses(prev => ({ ...prev, [contractId]: realAddress }));
      
      toast.success(`${contractId} deployed successfully!`, {
        description: `Tx: ${txHash.slice(0, 8)}...${txHash.slice(-8)}`,
        action: txHash ? {
          label: "Verify on Explorer",
          onClick: () => window.open(`https://preview.midnightexplorer.com/transactions/${txHash}`, "_blank", "noopener,noreferrer"),
        } : undefined,
      });
    } catch (error: unknown) {
      console.error(error);
      toast.error(`Deployment failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setDeployingId(null);
    }
  };

  return (
    <AdminPinGate>
    <div className="container mx-auto max-w-4xl py-12 px-6">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Contract Deployment</h1>
          <p className="text-zinc-400">Deploy your compiled ShadowArena circuits to the Midnight testnet.</p>
        </div>
        <div className="flex items-center gap-3">
          {Object.keys(deployedAddresses).length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-zinc-500 hover:text-red-400 hover:bg-red-400/10 gap-1.5"
              onClick={() => {
                setDeployedAddresses({});
                toast.info('Cleared saved contract addresses.');
              }}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Saved
            </Button>
          )}
          {!isConnected ? (
            <div className="flex items-center gap-2 text-yellow-500 bg-yellow-500/10 px-4 py-2 rounded-full border border-yellow-500/20">
              <ShieldAlert className="w-5 h-5" />
              <span className="text-sm font-medium">Wallet Not Connected</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-green-400 bg-green-400/10 px-4 py-2 rounded-full border border-green-400/20">
              <Server className="w-5 h-5" />
              <span className="text-sm font-medium">Connected to Preview Network</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4">
        {CONTRACTS.map((contract) => {
          const isDeployed = !!deployedAddresses[contract.id];
          const isDeploying = deployingId === contract.id;
          
          return (
            <Card key={contract.id} className="bg-zinc-900/50 border-zinc-800">
              <CardHeader className="pb-3 flex flex-row items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg text-zinc-100">{contract.name}</CardTitle>
                    {contract.required ? (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25">Required</span>
                    ) : (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-700/50 text-zinc-500 border border-zinc-700">Optional</span>
                    )}
                  </div>
                  <CardDescription className="text-zinc-400">{contract.desc}</CardDescription>
                </div>
                {isDeployed && (
                  <div className="flex items-center gap-1.5 text-green-400 text-sm font-medium bg-green-400/10 px-2.5 py-1 rounded-full border border-green-400/20">
                    <CheckCircle2 className="w-4 h-4" />
                    Deployed
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="bg-zinc-950 px-3 py-2 rounded-md font-mono text-xs text-zinc-500 flex-1 w-full border border-zinc-800 break-all truncate">
                    {isDeployed ? (
                      <span className="text-zinc-300">Contract Address: {deployedAddresses[contract.id]}</span>
                    ) : (
                      <span>Not deployed yet</span>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {isDeployed && (
                      <a
                        href={`https://preview.midnightexplorer.com/contracts/${deployedAddresses[contract.id]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 h-9 px-4 py-2"
                      >
                        Verify on Explorer ↗
                      </a>
                    )}
                    <Button 
                      onClick={() => handleDeploy(contract.id)}
                      disabled={isDeploying || isDeployed || !isConnected}
                      variant={isDeployed ? "outline" : "default"}
                      className={isDeployed ? "border-green-500/30 text-green-400 hover:bg-green-500/10" : "bg-indigo-600 hover:bg-indigo-700 text-white"}
                    >
                      {isDeploying ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Deploying...
                        </>
                      ) : isDeployed ? (
                        "Redeploy"
                      ) : (
                        "Deploy to Midnight"
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
    </AdminPinGate>
  );
}
