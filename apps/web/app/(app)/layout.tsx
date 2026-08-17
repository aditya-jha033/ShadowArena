"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Swords, Trophy, ShoppingBag, User, ChevronRight } from "lucide-react";
import { WalletConnectButton } from "@/components/wallet/WalletConnectButton";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/lobby",       label: "Lobby",        icon: Swords },
  { href: "/dashboard",   label: "Dashboard",    icon: LayoutDashboard },
  { href: "/profile",     label: "Profile",      icon: User },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[hsl(240_10%_4%)] text-foreground">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-60 border-r border-white/[0.06] bg-black/30 shrink-0 sticky top-0 h-screen">
        <Link href="/" className="flex items-center gap-2.5 px-5 h-16 border-b border-white/[0.06]">
          <Image src="/logo.png" alt="Shadow Arena" width={28} height={28} className="w-7 h-7 object-contain rounded-md" />
          <span className="font-bold text-base tracking-tight">Shadow Arena</span>
        </Link>

        <nav className="flex-1 py-6 px-3 space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                  active
                    ? "bg-violet-600/20 text-violet-300 border border-violet-500/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
                {active && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-60" />}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-5 border-t border-white/[0.06] pt-4">
          <WalletConnectButton />
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 border-b border-white/[0.06] bg-black/60 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Shadow Arena" width={24} height={24} className="w-6 h-6 object-contain rounded" />
          <span className="font-bold text-sm">Shadow Arena</span>
        </Link>
        <WalletConnectButton />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 pt-14 md:pt-0">
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 flex items-center border-t border-white/[0.06] bg-black/80 backdrop-blur-md z-50">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} className={cn("flex-1 flex flex-col items-center gap-1 py-2", active ? "text-violet-400" : "text-muted-foreground")}>
                <Icon className="w-5 h-5" />
                <span className="text-[10px]">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
