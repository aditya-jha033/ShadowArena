"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Swords, User, Users, Shield, ChevronRight, HelpCircle } from "lucide-react";
import { WalletConnectButton } from "@/components/wallet/WalletConnectButton";
import { CadetOnboarding } from "@/components/onboarding/CadetOnboarding";
import { FeedbackModal } from "@/components/feedback/FeedbackModal";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/lobby",     label: "Lobby",     icon: Swords,          desc: "Open Tables" },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, desc: "Your Stats" },
  { href: "/profile",   label: "Profile",   icon: User,            desc: "Inventory" },
  { href: "/preprod-directory", label: "Directory", icon: Users,   desc: "70 Players" },
  { href: "/help",      label: "Support",   icon: HelpCircle,      desc: "FAQ & Docs" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[#070709] text-foreground">
      <CadetOnboarding />
      <FeedbackModal />

      {/* ── SIDEBAR ── */}
      <aside className="hidden md:flex flex-col w-64 border-r border-yellow-500/10 bg-black/60 shrink-0 sticky top-0 h-screen backdrop-blur-xl">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 px-5 h-16 border-b border-yellow-500/10 hover:bg-yellow-500/5 transition-colors">
          <Image src="/logo.png" alt="Shadow Arena" width={32} height={32} className="w-8 h-8 object-contain rounded-lg" />
          <div>
            <span className="font-black text-sm tracking-tight text-yellow-400 block leading-tight">Shadow Arena</span>
            <span className="text-[9px] text-yellow-500/40 uppercase tracking-widest font-mono">ZK Gaming</span>
          </div>
        </Link>

        {/* Network Badge */}
        <div className="mx-3 mt-4 flex items-center gap-2 px-3 py-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">Midnight Preprod · Live</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-6 px-3 space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon, desc }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                  active
                    ? "bg-yellow-500/15 text-yellow-400 border border-yellow-500/25 shadow-[0_0_20px_rgba(212,175,55,0.05)]"
                    : "text-white/40 hover:text-white hover:bg-white/[0.04] border border-transparent"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all",
                  active ? "bg-yellow-500/20" : "bg-white/[0.04] group-hover:bg-white/[0.08]"
                )}>
                  <Icon className={cn("w-4 h-4", active ? "text-yellow-400" : "text-white/30 group-hover:text-white/60")} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={active ? "text-yellow-400 font-bold" : ""}>{label}</div>
                  <div className="text-[10px] text-white/25 font-mono">{desc}</div>
                </div>
                {active && <ChevronRight className="w-3.5 h-3.5 text-yellow-500/60 shrink-0" />}
              </Link>
            );
          })}
        </nav>

        {/* Privacy note */}
        <div className="mx-3 mb-3 p-3 rounded-xl bg-black/40 border border-white/[0.05]">
          <div className="flex items-center gap-2 mb-1.5">
            <Shield className="w-3.5 h-3.5 text-yellow-500/60" />
            <span className="text-[10px] font-bold text-yellow-500/60 uppercase tracking-widest">Zero-Knowledge</span>
          </div>
          <p className="text-[10px] text-white/25 leading-relaxed">Your cards & moves are private. Only ZK proofs reach the chain.</p>
        </div>

        {/* Wallet */}
        <div className="px-3 pb-5 border-t border-yellow-500/10 pt-4">
          <WalletConnectButton />
        </div>
      </aside>

      {/* ── MOBILE TOP BAR ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 border-b border-yellow-500/10 bg-black/80 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Shadow Arena" width={24} height={24} className="w-6 h-6 object-contain rounded" />
          <span className="font-black text-sm text-yellow-400">Shadow Arena</span>
        </Link>
        <WalletConnectButton />
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 pt-14 md:pt-0">
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 flex items-center border-t border-yellow-500/10 bg-black/90 backdrop-blur-xl z-50">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} className={cn(
                "flex-1 flex flex-col items-center gap-1 py-2 transition-colors",
                active ? "text-yellow-400" : "text-white/30"
              )}>
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-mono">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
