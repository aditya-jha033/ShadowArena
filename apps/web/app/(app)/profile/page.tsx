"use client";

import { Button } from "@/components/ui/button";
import { Wallet, ShieldCheck, Box, Lock, Eye, EyeOff, User } from "lucide-react";
import { useWalletStore } from "@/lib/midnight/wallet";

export default function ProfilePage() {
  const { walletAddress, isConnected, disconnect, connect } = useWalletStore();

  const shortAddress = walletAddress
    ? `${walletAddress.substring(0, 10)}...${walletAddress.substring(walletAddress.length - 6)}`
    : null;

  return (
    <div className="flex flex-col min-h-screen bg-[#070709]">

      {/* Header */}
      <header className="px-6 h-16 flex items-center justify-between border-b border-yellow-500/10 bg-black/40 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-yellow-500/15 border border-yellow-500/20 flex items-center justify-center">
            <User className="w-4 h-4 text-yellow-400" />
          </div>
          <div>
            <div className="font-black text-base text-white">Profile</div>
            <div className="text-[10px] text-white/30 font-mono">Identity & Inventory</div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 lg:p-10 max-w-5xl mx-auto w-full space-y-8">

        {/* ── WALLET CONNECTION ── */}
        <section className="grid md:grid-cols-2 gap-5">

          {/* Wallet Card */}
          <div className="relative rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/8 to-transparent overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(212,175,55,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,55,0.02)_1px,transparent_1px)] bg-[size:30px_30px]" />
            <div className="relative p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/15 border border-yellow-500/20 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <div className="font-black text-white text-sm">1AM Wallet</div>
                    <div className="text-[10px] text-white/30 font-mono">Midnight Network</div>
                  </div>
                </div>
                {isConnected && (
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Connected
                  </div>
                )}
              </div>

              {isConnected && walletAddress ? (
                <div className="space-y-4">
                  <div className="bg-black/40 border border-yellow-500/10 rounded-xl p-4">
                    <div className="text-[10px] text-white/30 font-mono uppercase tracking-widest mb-1">Wallet Address</div>
                    <div className="text-sm font-mono text-yellow-400 break-all">{shortAddress}</div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Connected & ZK-verified on Midnight Previewnet</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40 transition-all"
                    onClick={disconnect}
                  >
                    Disconnect Wallet
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-white/40">Connect your 1AM Wallet to access your profile, inventory, and match history.</p>
                  <Button
                    onClick={connect}
                    className="bg-gradient-to-r from-yellow-600 to-amber-500 hover:from-yellow-500 hover:to-amber-400 text-black font-black rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.25)] transition-all"
                  >
                    Connect 1AM Wallet
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="relative rounded-2xl border border-white/[0.07] bg-black/30 overflow-hidden">
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-white/40" />
                </div>
                <div>
                  <div className="font-black text-white text-sm">Privacy Controls</div>
                  <div className="text-[10px] text-white/30 font-mono">Manage your public visibility</div>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { icon: EyeOff, label: "Stake History", desc: "Your wager amounts are never public", value: "Private", color: "text-emerald-400", border: "border-emerald-500/20", bg: "bg-emerald-500/5" },
                  { icon: Lock,   label: "Card Values",   desc: "Only ZK proofs reach the blockchain", value: "ZK-Hidden", color: "text-yellow-400", border: "border-yellow-500/20", bg: "bg-yellow-500/5" },
                  { icon: Eye,    label: "Match Results",  desc: "Win/loss outcomes are public on-chain", value: "Public", color: "text-white/50", border: "border-white/10", bg: "bg-white/5" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/[0.04]">
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4 text-white/30" />
                      <div>
                        <div className="text-xs font-bold text-white">{item.label}</div>
                        <div className="text-[10px] text-white/25">{item.desc}</div>
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono font-bold border ${item.border} ${item.bg} ${item.color} px-2 py-1 rounded-full`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── ZK PRIVACY EXPLAINER ── */}
        <section className="relative rounded-2xl border border-yellow-500/15 bg-gradient-to-r from-yellow-500/5 via-black/50 to-emerald-900/10 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(212,175,55,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,55,0.02)_1px,transparent_1px)] bg-[size:30px_30px]" />
          <div className="relative p-6">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-5 h-5 text-yellow-400" />
              <h3 className="font-black text-white">Your Privacy on Shadow Arena</h3>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { title: "Private Witnesses", desc: "Your actual card values exist only in your 1AM Wallet. They are never transmitted to any server or chain.", icon: "🔒" },
                { title: "Public State", desc: "Only cryptographic commitments (hashes) are stored on-chain. Opponents see proof validity, not your cards.", icon: "🔗" },
                { title: "ZK Settlement", desc: "The winner is determined by a zero-knowledge circuit that mathematically verifies both hands without revealing them.", icon: "⚡" },
              ].map((item) => (
                <div key={item.title} className="bg-black/30 border border-white/[0.05] rounded-xl p-4 space-y-2">
                  <span className="text-2xl">{item.icon}</span>
                  <div className="font-bold text-sm text-white">{item.title}</div>
                  <p className="text-[11px] text-white/35 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── INVENTORY ── */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-black text-white">Cosmetic Inventory</h2>
            <div className="flex-1 h-px bg-yellow-500/10" />
            <span className="text-[10px] font-mono text-white/20 border border-white/10 px-3 py-1 rounded">Phase 2</span>
          </div>

          {!isConnected ? (
            <div className="rounded-2xl border border-white/[0.06] py-16 text-center bg-black/20">
              <Wallet className="w-10 h-10 mx-auto mb-3 text-white/10" />
              <p className="text-white/30 text-sm">Connect your wallet to see your inventory.</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-yellow-500/10 py-16 text-center bg-black/20">
              <Box className="w-10 h-10 mx-auto mb-3 text-yellow-500/20" />
              <p className="text-white/30 text-sm">Cosmetic items will be available in Phase 2.</p>
              <p className="text-white/20 text-xs mt-1">Card backs, table skins, and more coming soon.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
