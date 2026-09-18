"use client";

import { HelpCircle, ExternalLink, ShieldCheck, Zap } from "lucide-react";

export default function HelpPage() {
  return (
    <div className="flex-1 overflow-auto bg-[#070709] p-6 lg:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-black tracking-tight text-zinc-100 flex items-center gap-3">
            <HelpCircle className="w-8 h-8 text-emerald-500" />
            Help & Support
          </h1>
          <p className="text-zinc-400 mt-2">
            Everything you need to know about playing on Shadow Arena with ZK proofs.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-4">
          <a href="https://github.com/aditya-jha033/ShadowArena#readme" target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-emerald-500/30 transition-all group">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <div>
                <div className="font-bold text-white">Cadet Flight Manual</div>
                <div className="text-xs text-white/40">Read the official documentation</div>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-white/20 group-hover:text-white" />
          </a>
          <button onClick={() => document.getElementById('feedback-form')?.scrollIntoView()} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-yellow-500/30 transition-all group text-left">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-yellow-400" />
              <div>
                <div className="font-bold text-white">Report an Issue</div>
                <div className="text-xs text-white/40">Found a bug? Let us know</div>
              </div>
            </div>
          </button>
        </div>

        <section>
          <h2 className="text-xl font-bold mb-4 text-white">Frequently Asked Questions</h2>
          <div className="w-full space-y-2">
            <details className="border border-white/10 bg-black/40 px-4 py-2 rounded-xl group cursor-pointer">
              <summary className="text-white font-bold py-2 outline-none group-open:text-emerald-400">Do I need to pay gas fees to play?</summary>
              <div className="text-white/60 leading-relaxed pt-2 pb-4">
                No! The 1AM Wallet sponsors all network fees on the Midnight Network for our DApp. You only need testnet tDUST to wager in matches, not to pay for transaction execution.
              </div>
            </details>
            
            <details className="border border-white/10 bg-black/40 px-4 py-2 rounded-xl group cursor-pointer">
              <summary className="text-white font-bold py-2 outline-none group-open:text-emerald-400">How do private stakes work?</summary>
              <div className="text-white/60 leading-relaxed pt-2 pb-4">
                When you create a table with a &quot;Private Stake&quot;, the exact amount of tDUST you are wagering is hidden on-chain via ZK proofs. You must share this amount privately with your opponent off-platform. The smart contract validates that both players locked identical amounts without ever revealing the amount to observers.
              </div>
            </details>

            <details className="border border-white/10 bg-black/40 px-4 py-2 rounded-xl group cursor-pointer">
              <summary className="text-white font-bold py-2 outline-none group-open:text-emerald-400">Can the opponent see my cards?</summary>
              <div className="text-white/60 leading-relaxed pt-2 pb-4">
                Never. Your cards are stored locally in your 1AM wallet. When you make a move, a zero-knowledge circuit locally generates a proof that your move is valid according to the game rules, and only that proof is sent on-chain.
              </div>
            </details>
          </div>
        </section>
      </div>
    </div>
  );
}
