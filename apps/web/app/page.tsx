import { Button } from "@/components/ui/button";
import {
  Shield, EyeOff, CheckCircle2, ChevronRight,
  Swords, Dices, Trophy, Zap, Lock, Users, ArrowRight
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { WalletConnectButton } from "@/components/wallet/WalletConnectButton";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#060609] text-white overflow-x-hidden">

      {/* ── NAV ── */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-6 lg:px-16 border-b border-white/[0.06] bg-[#060609]/80 backdrop-blur-xl">
        <Link href="#" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="Shadow Arena" width={32} height={32} className="w-8 h-8 object-contain" />
          <span className="font-bold text-[15px] tracking-tight">Shadow Arena</span>
        </Link>
        <nav className="ml-auto flex items-center gap-8">
          <Link href="#how-it-works" className="text-sm text-white/50 hover:text-white transition-colors hidden md:block">How it works</Link>
          <Link href="#games" className="text-sm text-white/50 hover:text-white transition-colors hidden md:block">Games</Link>
          <Link href="#features" className="text-sm text-white/50 hover:text-white transition-colors hidden md:block">Features</Link>
          <WalletConnectButton />
        </nav>
      </header>

      <main className="flex-1 pt-16">

        {/* ── HERO ── */}
        <section className="relative min-h-[calc(100vh-4rem)] flex items-center px-6 lg:px-16 py-20 overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/15 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-teal-500/8 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center">

            {/* LEFT — copy */}
            <div className="flex flex-col items-start text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-[11px] font-mono tracking-[0.15em] uppercase mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live on Midnight Preview Network
              </div>

              <h1 className="text-[52px] sm:text-[62px] xl:text-[72px] font-black tracking-[-0.03em] leading-[1.0] mb-6">
                Play with
                <br />
                <span className="text-white/80">hidden hands.</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-300 to-teal-400">
                  Win with proof.
                </span>
              </h1>

              <p className="text-[16px] text-white/45 leading-relaxed mb-10 max-w-md">
                The only ZK gaming table on{" "}
                <span className="text-white/70 font-medium">Midnight Network</span>.
                Every move cryptographically proven. No house edge. Zero gas.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-12">
                <Link href="/lobby">
                  <Button className="h-12 px-8 text-[15px] font-bold bg-violet-600 hover:bg-violet-500 text-white rounded-xl gap-2 shadow-lg shadow-violet-900/40">
                    Enter the Arena <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button variant="ghost" className="h-12 px-8 text-[15px] text-white/50 hover:text-white hover:bg-white/[0.06] rounded-xl">
                    How it works
                  </Button>
                </Link>
              </div>

              {/* Inline mini-stats */}
              <div className="flex items-center gap-8 pt-4 border-t border-white/[0.07] w-full">
                {[
                  { value: "14K+", label: "Games" },
                  { value: "2.4M", label: "tDUST Staked" },
                  { value: "28K+", label: "Proofs Verified" },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col">
                    <span className="text-[22px] font-black font-mono text-white">{s.value}</span>
                    <span className="text-[11px] text-white/30 uppercase tracking-wider">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — image */}
            <div className="relative hidden lg:block">
              {/* Glow halo behind image */}
              <div className="absolute -inset-6 bg-violet-600/10 rounded-3xl blur-3xl" />
              <div className="relative rounded-2xl overflow-hidden border border-white/[0.09] shadow-2xl shadow-black/60">
                <Image
                  src="/hero-arena.jpg"
                  alt="Shadow Arena — ZK card game"
                  width={1400}
                  height={787}
                  className="w-full object-cover"
                  priority
                />
                {/* Subtle left-side fade so it bleeds into background */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#060609]/60 via-transparent to-transparent" />
              </div>
            </div>

          </div>
        </section>

        {/* ── STATS ── */}
        <section className="relative py-16 px-6 border-b border-white/[0.06]">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "14,205", label: "Games Played", color: "text-white" },
              { value: "2.4M", label: "tDUST Staked", color: "text-amber-400" },
              { value: "28,410", label: "ZK Proofs Verified", color: "text-teal-400" },
              { value: "99.9%", label: "Uptime", color: "text-emerald-400" },
            ].map((s) => (
              <div key={s.label} className="space-y-1">
                <div className={`text-[36px] font-black font-mono leading-none ${s.color}`}>{s.value}</div>
                <div className="text-[11px] text-white/35 uppercase tracking-widest">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section id="how-it-works" className="py-32 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-20">
              <p className="text-[11px] text-violet-400 uppercase tracking-[0.25em] font-mono mb-4">Under the Hood</p>
              <h2 className="text-[40px] font-black tracking-tight mb-4">How ZK proofs protect every game.</h2>
              <p className="text-white/40 max-w-md mx-auto text-[15px]">Neither player can cheat — at any step of the match.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              {[
                {
                  icon: EyeOff, step: "01", title: "Your hand stays private",
                  desc: "Cards and moves exist only on your device. The contract sees only the ZK proof — never your actual hand.",
                  accent: "violet",
                },
                {
                  icon: CheckCircle2, step: "02", title: "Every move proven valid",
                  desc: "Each action generates a proof that rule compliance was met. Verified on Midnight Network in under a second.",
                  accent: "teal",
                },
                {
                  icon: Shield, step: "03", title: "Payout is trustless",
                  desc: "The stake-pool contract releases the pot to the verified winner automatically. No intermediary. Ever.",
                  accent: "amber",
                },
              ].map((item) => {
                const colors: Record<string, string> = {
                  violet: "border-violet-500/20 bg-violet-500/[0.06] text-violet-400",
                  teal:   "border-teal-500/20 bg-teal-500/[0.06] text-teal-400",
                  amber:  "border-amber-500/20 bg-amber-500/[0.06] text-amber-400",
                };
                const cls = colors[item.accent];
                return (
                  <div key={item.step} className={`rounded-2xl border p-7 flex flex-col gap-5 ${cls.split(" ").slice(0,2).join(" ")}`}>
                    <div className="flex items-start justify-between">
                      <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${cls}`}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <span className="font-mono text-[48px] font-black text-white/[0.04] leading-none">{item.step}</span>
                    </div>
                    <div>
                      <h3 className="text-[17px] font-bold mb-2">{item.title}</h3>
                      <p className="text-[13px] text-white/40 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── GAMES ── */}
        <section id="games" className="py-32 px-6 border-t border-white/[0.05] bg-white/[0.015]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-20">
              <p className="text-[11px] text-teal-400 uppercase tracking-[0.25em] font-mono mb-4">Choose Your Battle</p>
              <h2 className="text-[40px] font-black tracking-tight">The Arena.</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* High Card Duel */}
              <div className="group relative rounded-2xl overflow-hidden border border-white/[0.08] hover:border-violet-500/40 transition-all duration-500 bg-[#0d0d12]">
                <div className="relative h-52 flex items-center justify-center bg-gradient-to-br from-violet-950/60 to-black overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_60%,rgba(124,58,237,0.25),transparent_70%)] group-hover:opacity-150 transition-opacity duration-500" />
                  <Swords className="w-20 h-20 text-violet-300/20 group-hover:text-violet-300/50 group-hover:scale-110 transition-all duration-500 relative z-10" />
                  <div className="absolute top-4 right-4 text-[10px] font-mono font-bold text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 rounded-md">● LIVE</div>
                </div>
                <div className="p-7 space-y-4">
                  <h3 className="text-2xl font-black">High Card Duel</h3>
                  <p className="text-[13px] text-white/40 leading-relaxed">
                    Commit a hidden card on-chain. The ZK shuffle proves no card is manipulated. Highest card claims the entire staked pot, settled trustlessly.
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {["100+ tDUST min", "~2 min / round", "ZK-shuffled deck"].map(tag => (
                      <span key={tag} className="text-[11px] font-mono text-white/30 border border-white/[0.08] rounded px-2 py-0.5">{tag}</span>
                    ))}
                  </div>
                  <Link href="/lobby">
                    <Button className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl gap-2 mt-2">
                      Play Now <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Dice Duel */}
              <div className="relative rounded-2xl overflow-hidden border border-white/[0.05] bg-[#0d0d12] opacity-55">
                <div className="relative h-52 flex items-center justify-center bg-gradient-to-br from-teal-950/40 to-black overflow-hidden">
                  <Dices className="w-20 h-20 text-teal-300/15 relative z-10" />
                  <div className="absolute top-4 right-4 text-[10px] font-mono font-bold text-amber-400 border border-amber-500/30 bg-amber-500/10 px-2 py-1 rounded-md">COMING SOON</div>
                </div>
                <div className="p-7 space-y-4">
                  <h3 className="text-2xl font-black">Dice Duel</h3>
                  <p className="text-[13px] text-white/40 leading-relaxed">
                    Predict the hidden roll. Lock in your wager privately. Provably fair on-chain randomness verified by ZK circuit.
                  </p>
                  <div className="flex gap-2">
                    <span className="text-[11px] font-mono text-white/25 border border-white/[0.06] rounded px-2 py-0.5">Q3 2026</span>
                  </div>
                  <Button disabled variant="outline" className="w-full border-white/10 text-white/30 rounded-xl mt-2 cursor-not-allowed">
                    Coming Soon
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section id="features" className="py-32 px-6 border-t border-white/[0.05]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-20">
              <p className="text-[11px] text-amber-400 uppercase tracking-[0.25em] font-mono mb-4">Why Shadow Arena</p>
              <h2 className="text-[40px] font-black tracking-tight">Built different.</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Lock, title: "Private by Default", desc: "ZK proofs mean your strategy is yours alone. The blockchain cannot see your cards." },
                { icon: Zap, title: "Dust-Free", desc: "1AM Wallet sponsors all on-chain fees. Play without ever buying network tokens." },
                { icon: Trophy, title: "Tournaments", desc: "Weekly brackets with tDUST entry passes and prize pools up to 50,000 tDUST." },
                { icon: Users, title: "Pure PvP", desc: "Skill-based duels with custom stake amounts. No bots, no house edge, no bull." },
              ].map((f) => (
                <div key={f.title} className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6 flex flex-col gap-4 hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300 group">
                  <div className="w-10 h-10 rounded-xl border border-white/10 bg-white/[0.04] flex items-center justify-center group-hover:border-violet-500/30 group-hover:bg-violet-500/10 transition-all">
                    <f.icon className="w-5 h-5 text-white/40 group-hover:text-violet-400 transition-colors" />
                  </div>
                  <h3 className="font-bold text-[14px]">{f.title}</h3>
                  <p className="text-[12px] text-white/35 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-32 px-6 border-t border-white/[0.05]">
          <div className="max-w-2xl mx-auto text-center relative">
            <div className="absolute inset-0 bg-violet-600/10 rounded-3xl blur-3xl" />
            <div className="relative rounded-3xl border border-violet-500/20 bg-violet-500/[0.06] p-16">
              <p className="text-[11px] text-violet-400 uppercase tracking-[0.25em] font-mono mb-6">Ready?</p>
              <h2 className="text-[40px] font-black tracking-tight mb-4 leading-tight">Step into the Shadow Arena.</h2>
              <p className="text-white/40 mb-10 max-w-md mx-auto text-[15px] leading-relaxed">
                Connect your 1AM Wallet and experience provably fair ZK card gaming on Midnight Preview Network. Zero gas, forever.
              </p>
              <Link href="/lobby">
                <Button className="h-14 px-12 text-[16px] font-black bg-violet-600 hover:bg-violet-500 text-white rounded-xl gap-3 shadow-2xl shadow-violet-900/50">
                  Enter the Arena <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/[0.05] bg-black/20 py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Shadow Arena" width={24} height={24} className="w-6 h-6 object-contain" />
            <p className="text-[13px] text-white/30">
              © {new Date().getFullYear()} Shadow Arena · Built on{" "}
              <a href="https://midnight.network" target="_blank" rel="noopener noreferrer" className="hover:text-white/70 transition-colors">
                Midnight Network
              </a>
            </p>
          </div>
          <nav className="flex gap-7">
            {["Terms", "Privacy", "GitHub", "Docs"].map((item) => (
              <Link key={item} href="#" className="text-[12px] text-white/30 hover:text-white/70 transition-colors">
                {item}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
