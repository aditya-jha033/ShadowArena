"use client";

import { useState, useEffect } from "react";
import { X, ExternalLink, ChevronRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWalletStore } from "@/lib/midnight/wallet";

export function CadetOnboarding() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const { isConnected } = useWalletStore();

  useEffect(() => {
    const seen = localStorage.getItem("onboarding_seen");
    if (!seen && !isConnected) {
      setOpen(true);
    }
  }, [isConnected]);

  const handleClose = () => {
    localStorage.setItem("onboarding_seen", "true");
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#070709] border border-yellow-500/20 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-yellow-500/10">
          <div className="flex items-center gap-2 text-yellow-400 font-black tracking-tight">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Shadow Arena Onboarding
          </div>
          <button onClick={handleClose} className="text-white/40 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6 flex gap-1">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className={`h-1 flex-1 rounded-full ${s <= step ? "bg-yellow-500" : "bg-white/10"}`} />
            ))}
          </div>

          <div className="min-h-[160px]">
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h3 className="text-2xl font-bold">Welcome to ZK Gaming.</h3>
                <p className="text-white/60 leading-relaxed">
                  Shadow Arena is a fully on-chain gaming platform powered by Midnight's Zero-Knowledge technology. Let's get you set up to play on the Preprod network.
                </p>
              </div>
            )}
            
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h3 className="text-2xl font-bold">1. Install 1AM Wallet</h3>
                <p className="text-white/60 leading-relaxed">
                  You'll need the 1AM Wallet Chrome extension to hold your assets and generate ZK proofs locally.
                </p>
                <a href="https://chrome.google.com/webstore" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 mt-2">
                  Download 1AM Wallet <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h3 className="text-2xl font-bold">2. Switch to Preprod</h3>
                <p className="text-white/60 leading-relaxed">
                  Open your 1AM wallet settings and ensure your network is set to <strong className="text-white">Midnight Preprod</strong>. The Preview network is deprecated!
                </p>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h3 className="text-2xl font-bold">3. Get Testnet tDUST</h3>
                <p className="text-white/60 leading-relaxed">
                  To stake in games, you need tDUST. Head over to the official Midnight Preprod Faucet to fund your wallet.
                </p>
                <a href="https://faucet.preprod.midnight.network/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 mt-2">
                  Open Preprod Faucet <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-black/40 border-t border-yellow-500/10 flex justify-between items-center">
          <button onClick={handleClose} className="text-sm text-white/40 hover:text-white">
            Skip tutorial
          </button>
          
          <Button 
            onClick={() => {
              if (step < 4) setStep(step + 1);
              else handleClose();
            }}
            className="bg-yellow-500 text-black hover:bg-yellow-400"
          >
            {step < 4 ? (
              <>Next Step <ChevronRight className="w-4 h-4 ml-1" /></>
            ) : (
              <>Let's Play <CheckCircle2 className="w-4 h-4 ml-1" /></>
            )}
          </Button>
        </div>

      </div>
    </div>
  );
}
