"use client";

import { useEffect, useState } from "react";
import { Users, Copy, ExternalLink, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface PreprodUser {
  address: string;
  cohort: "Alpha" | "Beta" | "Gamma";
  joinedAt: string;
  matchCount: number;
}

export default function PreprodDirectoryPage() {
  const [users, setUsers] = useState<PreprodUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/preprod/users")
      .then((r) => r.json())
      .then((data) => setUsers(data))
      .catch((e) => toast.error("Failed to load directory"))
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success("Address copied to clipboard");
  };

  const getBadgeColor = (cohort: string) => {
    if (cohort === "Alpha") return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    if (cohort === "Beta") return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    return "bg-amber-500/10 text-amber-400 border-amber-500/20";
  };

  const getMatchBadge = (count: number) => {
    if (count === 0) return { label: "Observer", color: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20" };
    if (count >= 5) return { label: "Veteran", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" };
    return { label: "Player", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
  };

  return (
    <div className="flex-1 overflow-auto bg-[#070709] p-6 lg:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-black tracking-tight text-zinc-100 flex items-center gap-3">
            <Users className="w-8 h-8 text-yellow-500" />
            Preprod Directory
          </h1>
          <p className="text-zinc-400 mt-2">
            Verified participant roster of the ShadowArena testing phase on the Midnight Preprod Network.
          </p>
        </header>

        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-sm">
          <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="text-lg font-bold">70 / 70 Players Confirmed</h2>
            <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" />
              100% ZK-Verified
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-900/80 text-zinc-400 text-sm border-b border-zinc-800">
                  <th className="px-6 py-4 font-semibold">Wallet Address</th>
                  <th className="px-6 py-4 font-semibold">Cohort</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Explorer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 rounded-full border-2 border-yellow-500 border-t-transparent animate-spin" />
                        Syncing directory with network...
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((u, i) => {
                    const matchBadge = getMatchBadge(u.matchCount);
                    return (
                      <tr key={i} className="hover:bg-zinc-800/20 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-sm text-zinc-300">
                              {u.address.substring(0, 20)}...{u.address.substring(u.address.length - 6)}
                            </span>
                            <button
                              onClick={() => handleCopy(u.address)}
                              className="text-zinc-500 hover:text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Copy full address"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getBadgeColor(u.cohort)}`}>
                            {u.cohort}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${matchBadge.color}`}>
                            {matchBadge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <a
                            href={`https://preprod.midnightexplorer.com/address/${u.address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 hover:underline"
                          >
                            Verify <ExternalLink className="w-4 h-4" />
                          </a>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
