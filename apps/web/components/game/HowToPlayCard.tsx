"use client";

import { useState } from "react";
import { Shield, Zap, Swords, Coins, X, HelpCircle } from "lucide-react";

export function HowToPlayCard() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="relative rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-900/10 via-black to-[#070709] p-6 sm:p-8 overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
      
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute top-4 right-4 p-2 text-white/30 hover:text-white/80 transition-colors bg-white/5 rounded-lg hover:bg-white/10"
        aria-label="Dismiss guide"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
          <HelpCircle className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">How to Play: High Card Duel</h2>
          <p className="text-xs text-blue-400 font-mono mt-0.5 uppercase tracking-widest">Beginner&apos;s Guide</p>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4 relative z-10">
        
        {/* Step 1 */}
        <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-5 hover:bg-white/[0.05] transition-colors relative">
          <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-blue-950 border-2 border-blue-500 flex items-center justify-center font-black text-blue-400 text-sm">
            1
          </div>
          <Coins className="w-6 h-6 text-yellow-400 mb-3 mt-1" />
          <h3 className="font-bold text-white mb-2">Fund Wallet</h3>
          <p className="text-xs text-white/50 leading-relaxed">
            Connect your 1AM wallet. You need testnet tDUST to stake. (Gas is totally free!)
          </p>
        </div>

        {/* Step 2 */}
        <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-5 hover:bg-white/[0.05] transition-colors relative">
          <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-blue-950 border-2 border-blue-500 flex items-center justify-center font-black text-blue-400 text-sm">
            2
          </div>
          <Swords className="w-6 h-6 text-emerald-400 mb-3 mt-1" />
          <h3 className="font-bold text-white mb-2">Join a Table</h3>
          <p className="text-xs text-white/50 leading-relaxed">
            Create a match with a stake (public or private), or join an open table in the Lobby.
          </p>
        </div>

        {/* Step 3 */}
        <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-5 hover:bg-white/[0.05] transition-colors relative">
          <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-blue-950 border-2 border-blue-500 flex items-center justify-center font-black text-blue-400 text-sm">
            3
          </div>
          <Shield className="w-6 h-6 text-amber-400 mb-3 mt-1" />
          <h3 className="font-bold text-white mb-2">Lock in Card</h3>
          <p className="text-xs text-white/50 leading-relaxed">
            You&apos;re dealt 5 random cards. Secretly pick your highest. A ZK-proof locks your choice on-chain.
          </p>
        </div>

        {/* Step 4 */}
        <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-5 hover:bg-white/[0.05] transition-colors relative">
          <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-blue-950 border-2 border-blue-500 flex items-center justify-center font-black text-blue-400 text-sm">
            4
          </div>
          <Zap className="w-6 h-6 text-purple-400 mb-3 mt-1" />
          <h3 className="font-bold text-white mb-2">Reveal & Win</h3>
          <p className="text-xs text-white/50 leading-relaxed">
            Once both players commit, click reveal. The smart contract pays 2x the stake to the highest card!
          </p>
        </div>

      </div>
    </div>
  );
}
