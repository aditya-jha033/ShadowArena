import { Button } from "@/components/ui/button";
import {
  Shield, EyeOff, CheckCircle2, ChevronRight,
  Swords, Dices, Trophy, Zap, Lock, Users, ArrowRight
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { WalletConnectButton } from "@/components/wallet/WalletConnectButton";
import { HeroGameComponent } from "@/components/game/HeroGameComponent";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

async function getStats() {
  try {
    const [matchesPlayed, zkProofs, users] = await Promise.all([
      prisma.match.count({ where: { status: "settled" } }),
      prisma.matchMove.count(),
      prisma.user.count(),
    ]);
    const stakeSum = await prisma.stake.aggregate({
      where: { isPrivate: false },
      _sum: { amount: true },
    });
    return {
      matchesPlayed,
      tDustStaked: Number(stakeSum._sum.amount ?? 0),
      zkProofsVerified: zkProofs,
      registeredUsers: users,
    };
  } catch (error) {
    return { matchesPlayed: 0, tDustStaked: 0, zkProofsVerified: 0, registeredUsers: 0 };
  }
}

export default async function LandingPage() {
  const stats = await getStats();
  return (
    <div className="flex flex-col min-h-screen bg-[#070709] text-white overflow-x-hidden">

      {/* ── NAV ── */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-6 lg:px-16 border-b border-yellow-500/10 bg-[#070709]/90 backdrop-blur-xl">
        <Link href="#" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="Shadow Arena" width={32} height={32} className="w-8 h-8 object-contain" />
          <span className="font-black text-[15px] tracking-tight text-yellow-400">Shadow Arena</span>
        </Link>
        <nav className="ml-auto flex items-center gap-8">
          <Link href="#how-it-works" className="text-sm text-white/40 hover:text-yellow-400 transition-colors hidden md:block">How it works</Link>
          <Link href="#games" className="text-sm text-white/40 hover:text-yellow-400 transition-colors hidden md:block">Games</Link>
          <Link href="#features" className="text-sm text-white/40 hover:text-yellow-400 transition-colors hidden md:block">Features</Link>
          <WalletConnectButton />
        </nav>
      </header>

      <main className="flex-1 pt-16">

        {/* ── HERO ── */}
        <section className="relative min-h-[calc(100vh-4rem)] flex items-center px-6 lg:px-16 py-20 overflow-hidden">
          
          {/* Background grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(212,175,55,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,55,0.03)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />
          
          {/* Corner glows */}
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-yellow-600/5 rounded-full blur-[150px] pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-700/8 rounded-full blur-[130px] pointer-events-none" />

          <div className="relative max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center">

            {/* LEFT — copy */}
            <div className="flex flex-col items-start text-left z-10">
              
              {/* Live badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-300 text-[11px] font-mono tracking-[0.15em] uppercase mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live on Midnight Preprod Network
              </div>

              <h1 className="text-[56px] sm:text-[66px] xl:text-[76px] font-black tracking-[-0.03em] leading-[0.95] mb-6">
                <span className="text-white/90">Play with</span>
                <br />
                <span className="text-white/60">hidden hands.</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-600">
                  Win with proof.
                </span>
              </h1>

              <p className="text-[16px] text-white/40 leading-relaxed mb-10 max-w-md">
                The only ZK gaming table on{" "}
                <span className="text-yellow-400/80 font-medium">Midnight Network</span>.
                Every move cryptographically proven. No house edge. Zero gas.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-12">
                <Link href="/lobby">
                  <Button className="h-13 px-10 text-[15px] font-black bg-gradient-to-r from-yellow-600 to-amber-500 hover:from-yellow-500 hover:to-amber-400 text-black rounded-xl gap-2 shadow-[0_0_30px_rgba(212,175,55,0.35)] transition-all hover:shadow-[0_0_50px_rgba(212,175,55,0.5)] hover:scale-[1.02]">
                    Enter the Arena <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button variant="ghost" className="h-13 px-8 text-[15px] text-white/40 hover:text-white hover:bg-yellow-500/[0.08] border border-white/[0.06] hover:border-yellow-500/30 rounded-xl transition-all">
                    How it works
                  </Button>
                </Link>
              </div>

              {/* Stats strip */}
              <div className="flex items-center gap-10 pt-6 border-t border-white/[0.06] w-full">
                {[
                  { value: stats.matchesPlayed.toLocaleString(), label: "Games Played" },
                  { value: stats.tDustStaked.toLocaleString(), label: "tDUST Staked" },
                  { value: stats.zkProofsVerified.toLocaleString(), label: "ZK Proofs" },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col">
                    <span className="text-[24px] font-black font-mono text-yellow-400">{s.value}</span>
                    <span className="text-[11px] text-white/30 uppercase tracking-wider">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — Animated Game Component */}
            <div className="relative hidden lg:flex h-[520px] items-center justify-center">
              <HeroGameComponent />
            </div>

          </div>
        </section>

        {/* ── STATS TICKER ── */}
        <section className="relative py-6 border-y border-yellow-500/10 bg-black/40 overflow-hidden">
          <div className="flex gap-12 animate-[marquee_20s_linear_infinite] w-max">
            {[...Array(3)].flatMap(() => [
              { label: "Games Played", value: stats.matchesPlayed.toLocaleString(), color: "text-white" },
              { label: "tDUST Staked", value: stats.tDustStaked.toLocaleString(), color: "text-yellow-400" },
              { label: "ZK Proofs Verified", value: stats.zkProofsVerified.toLocaleString(), color: "text-emerald-400" },
              { label: "Network Uptime", value: "99.9%", color: "text-teal-400" },
              { label: "On Midnight Preprod", value: "LIVE", color: "text-yellow-400" },
            ]).map((s, i) => (
              <div key={i} className="flex items-center gap-3 whitespace-nowrap px-8 border-r border-white/5">
                <span className="text-white/20 text-[11px] uppercase tracking-widest font-mono">{s.label}</span>
                <span className={`text-[16px] font-black font-mono ${s.color}`}>{s.value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section id="how-it-works" className="py-32 px-6 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(212,175,55,0.05),transparent_60%)] pointer-events-none" />
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-20">
              <p className="text-[11px] text-yellow-500 uppercase tracking-[0.25em] font-mono mb-4">Under the Hood</p>
              <h2 className="text-[42px] font-black tracking-tight mb-4">How ZK proofs protect every game.</h2>
              <p className="text-white/35 max-w-md mx-auto text-[15px]">Neither player can cheat — at any step of the match.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              {[
                {
                  icon: EyeOff, step: "01", title: "Your hand stays private",
                  desc: "Cards and moves exist only on your device. The contract sees only the ZK proof — never your actual hand.",
                  gradient: "from-yellow-500/10 to-amber-500/5",
                  border: "border-yellow-500/20",
                  iconColor: "text-yellow-400",
                  iconBg: "bg-yellow-500/10 border-yellow-500/20",
                },
                {
                  icon: CheckCircle2, step: "02", title: "Every move proven valid",
                  desc: "Each action generates a proof that rule compliance was met. Verified on Midnight Network in under a second.",
                  gradient: "from-emerald-500/10 to-teal-500/5",
                  border: "border-emerald-500/20",
                  iconColor: "text-emerald-400",
                  iconBg: "bg-emerald-500/10 border-emerald-500/20",
                },
                {
                  icon: Shield, step: "03", title: "Payout is trustless",
                  desc: "The stake-pool contract releases the pot to the verified winner automatically. No intermediary. Ever.",
                  gradient: "from-amber-500/10 to-orange-500/5",
                  border: "border-amber-500/20",
                  iconColor: "text-amber-400",
                  iconBg: "bg-amber-500/10 border-amber-500/20",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className={`group rounded-2xl border ${item.border} bg-gradient-to-br ${item.gradient} p-7 flex flex-col gap-5 hover:scale-[1.02] transition-all duration-300 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] relative overflow-hidden`}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.03] rounded-bl-full bg-white" />
                  <div className="flex items-start justify-between">
                    <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${item.iconBg}`}>
                      <item.icon className={`w-5 h-5 ${item.iconColor}`} />
                    </div>
                    <span className="font-mono text-[52px] font-black text-white/[0.04] leading-none">{item.step}</span>
                  </div>
                  <div>
                    <h3 className="text-[17px] font-bold mb-2">{item.title}</h3>
                    <p className="text-[13px] text-white/40 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── GAMES ── */}
        <section id="games" className="py-32 px-6 border-t border-white/[0.04] relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(6,78,59,0.1),transparent_70%)] pointer-events-none" />
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-20">
              <p className="text-[11px] text-emerald-400 uppercase tracking-[0.25em] font-mono mb-4">Choose Your Battle</p>
              <h2 className="text-[42px] font-black tracking-tight">The Arena.</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* High Card Duel - LIVE */}
              <div className="group relative rounded-2xl overflow-hidden border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-500 bg-[#0d0d0f] hover:shadow-[0_0_60px_rgba(212,175,55,0.1)]">
                <div className="relative h-56 flex items-center justify-center bg-gradient-to-br from-emerald-950/80 via-black to-black overflow-hidden">
                  {/* Felt texture */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(6,78,59,0.6),rgba(0,0,0,0.9))]" />
                  {/* Animated chip ring */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-40 h-40 rounded-full border-2 border-dashed border-yellow-500/10 group-hover:border-yellow-500/25 transition-all duration-700 animate-[spin_20s_linear_infinite]" />
                  </div>
                  <Swords className="w-16 h-16 text-yellow-400/30 group-hover:text-yellow-400/70 group-hover:scale-110 transition-all duration-500 relative z-10" />
                  <div className="absolute top-4 right-4 text-[10px] font-mono font-bold text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 rounded-md">● LIVE</div>
                  {/* Table border visual */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent" />
                </div>
                <div className="p-7 space-y-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-black">High Card Duel</h3>
                    <span className="text-[10px] font-mono text-yellow-500 border border-yellow-500/30 bg-yellow-500/5 px-2 py-0.5 rounded">ZK-PROOF</span>
                  </div>
                  <p className="text-[13px] text-white/40 leading-relaxed">
                    Commit a hidden card on-chain. The ZK shuffle proves no card is manipulated. Highest card claims the entire staked pot, settled trustlessly.
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {["100+ tDUST min", "~2 min / round", "ZK-shuffled deck"].map(tag => (
                      <span key={tag} className="text-[11px] font-mono text-yellow-500/40 border border-yellow-500/10 rounded px-2 py-0.5">{tag}</span>
                    ))}
                  </div>
                  <Link href="/lobby">
                    <Button className="w-full bg-gradient-to-r from-yellow-600 to-amber-500 hover:from-yellow-500 hover:to-amber-400 text-black font-black rounded-xl gap-2 mt-2 shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all">
                      Play Now <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Dice Duel - Coming Soon */}
              <div className="relative rounded-2xl overflow-hidden border border-white/[0.05] bg-[#0d0d0f] opacity-60">
                <div className="relative h-56 flex items-center justify-center bg-gradient-to-br from-slate-950/80 to-black overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(15,23,42,0.8),rgba(0,0,0,0.9))]" />
                  <Dices className="w-16 h-16 text-white/10 relative z-10" />
                  <div className="absolute top-4 right-4 text-[10px] font-mono font-bold text-white/30 border border-white/10 bg-white/5 px-2 py-1 rounded-md">COMING SOON</div>
                </div>
                <div className="p-7 space-y-4">
                  <h3 className="text-2xl font-black text-white/40">Dice Duel</h3>
                  <p className="text-[13px] text-white/25 leading-relaxed">
                    Predict the hidden roll. Lock in your wager privately. Provably fair on-chain randomness verified by ZK circuit.
                  </p>
                  <div className="flex gap-2">
                    <span className="text-[11px] font-mono text-white/20 border border-white/[0.06] rounded px-2 py-0.5">Q3 2026</span>
                  </div>
                  <Button disabled variant="outline" className="w-full border-white/10 text-white/20 rounded-xl mt-2 cursor-not-allowed">
                    Coming Soon
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="py-32 px-6 border-t border-white/[0.04]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-[11px] text-yellow-500 uppercase tracking-[0.25em] font-mono mb-4">Player Feedback</p>
              <h2 className="text-[36px] font-black tracking-tight mb-4">What the community says.</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { 
                  quote: "Finally a Web3 game where you don't have to trust the house. ZK proofs running entirely in the background is the future.",
                  name: "Beta Tester", 
                  addr: "mn_addr_preprod1jn2u7ky2jumthlqw40dl2sm3wxjjn3lycgll66yc6rz59guy74fsvj8p87", 
                  role: "Alpha Cohort" 
                },
                { 
                  quote: "The ability to play High Card Duel without paying gas fees because of 1AM wallet sponsorship makes this infinitely playable.",
                  name: "Beta Tester", 
                  addr: "mn_addr_preprod17w88tm9krmywaecx2th3agkjzu7uu4a420euh8yum3nm42p84n8q7wjann", 
                  role: "Beta Cohort" 
                },
                { 
                  quote: "Settlement on Preprod has been surprisingly fast. Staking tDUST and seeing it instantly hit my wallet when I win is incredible.",
                  name: "Beta Tester", 
                  addr: "mn_addr_preprod1r8mfahw8davsu6kpskeka9udgt3l4daqtgnxt4703fa80p65567q95hzv4", 
                  role: "Gamma Cohort" 
                }
              ].map((t, i) => (
                <div key={i} className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 relative group hover:border-yellow-500/20 transition-all duration-300">
                  <p className="text-sm text-white/60 leading-relaxed mb-6 italic">&quot;{t.quote}&quot;</p>
                  <div className="flex items-center gap-3 border-t border-white/[0.05] pt-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500/20 to-amber-500/10 flex items-center justify-center border border-yellow-500/20">
                      <Users className="w-4 h-4 text-yellow-500/70" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white/90">{t.name}</div>
                      <div className="text-[10px] font-mono text-white/30 truncate w-32" title={t.addr}>{t.addr.substring(0, 15)}...</div>
                    </div>
                    <div className="ml-auto text-[10px] font-mono text-yellow-500/40 border border-yellow-500/10 bg-yellow-500/5 px-2 py-0.5 rounded">{t.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section id="features" className="py-32 px-6 border-t border-white/[0.04]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-20">
              <p className="text-[11px] text-yellow-500 uppercase tracking-[0.25em] font-mono mb-4">Why Shadow Arena</p>
              <h2 className="text-[42px] font-black tracking-tight">Built different.</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Lock,   title: "Private by Default",  desc: "ZK proofs mean your strategy is yours alone. The blockchain cannot see your cards.", color: "group-hover:text-yellow-400 group-hover:border-yellow-500/30 group-hover:bg-yellow-500/10" },
                { icon: Zap,    title: "Gas-Free Gaming",     desc: "1AM Wallet sponsors all on-chain fees. Play without ever buying network tokens.", color: "group-hover:text-emerald-400 group-hover:border-emerald-500/30 group-hover:bg-emerald-500/10" },
                { icon: Trophy, title: "Tournaments",         desc: "Weekly brackets with tDUST entry passes and prize pools up to 50,000 tDUST.", color: "group-hover:text-amber-400 group-hover:border-amber-500/30 group-hover:bg-amber-500/10" },
                { icon: Users,  title: "Pure PvP",            desc: "Skill-based duels with custom stake amounts. No bots, no house edge, no bull.", color: "group-hover:text-teal-400 group-hover:border-teal-500/30 group-hover:bg-teal-500/10" },
              ].map((f) => (
                <div key={f.title} className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 flex flex-col gap-4 hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
                  <div className={`w-10 h-10 rounded-xl border border-white/10 bg-white/[0.04] flex items-center justify-center transition-all duration-300 ${f.color}`}>
                    <f.icon className="w-5 h-5 text-white/30 group-hover:text-inherit transition-colors" />
                  </div>
                  <h3 className="font-bold text-[14px]">{f.title}</h3>
                  <p className="text-[12px] text-white/30 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-32 px-6 border-t border-white/[0.04]">
          <div className="max-w-3xl mx-auto text-center relative">
            {/* Glow behind CTA */}
            <div className="absolute inset-0 bg-yellow-600/8 rounded-3xl blur-3xl" />
            <div className="relative rounded-3xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/[0.07] via-black/50 to-emerald-900/10 p-16 overflow-hidden">
              {/* Grid overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(212,175,55,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,55,0.03)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none rounded-3xl" />
              <p className="text-[11px] text-yellow-500 uppercase tracking-[0.25em] font-mono mb-6 relative z-10">Ready?</p>
              <h2 className="text-[44px] font-black tracking-tight mb-4 leading-tight relative z-10">
                Step into the{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">Shadow Arena.</span>
              </h2>
              <p className="text-white/35 mb-10 max-w-md mx-auto text-[15px] leading-relaxed relative z-10">
                Connect your 1AM Wallet and experience provably fair ZK card gaming on Midnight Preprod Network. Zero gas, forever.
              </p>
              <Link href="/lobby" className="relative z-10 inline-block">
                <Button className="h-14 px-14 text-[16px] font-black bg-gradient-to-r from-yellow-600 to-amber-500 hover:from-yellow-500 hover:to-amber-400 text-black rounded-xl gap-3 shadow-[0_0_40px_rgba(212,175,55,0.35)] hover:shadow-[0_0_70px_rgba(212,175,55,0.55)] transition-all hover:scale-[1.03]">
                  Enter the Arena <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-yellow-500/10 bg-black/40 py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Shadow Arena" width={24} height={24} className="w-6 h-6 object-contain" />
            <p className="text-[13px] text-white/25">
              © {new Date().getFullYear()} Shadow Arena · Built on{" "}
              <a href="https://midnight.network" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400 transition-colors">
                Midnight Network
              </a>
            </p>
          </div>
          <nav className="flex gap-7">
            {[
              { label: "GitHub", href: "https://github.com/aditya-jha033/ShadowArena" },
              { label: "X / Twitter", href: "https://x.com/shadowarenaweb3" },
              { label: "Docs", href: "/README.md" },
            ].map((item) => (
              <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className="text-[12px] text-white/25 hover:text-yellow-400 transition-colors">
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
