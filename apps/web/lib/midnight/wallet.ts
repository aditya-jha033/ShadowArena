/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface WalletState {
  isConnected: boolean;
  walletAddress: string | null;
  userId: string | null;
  isConnecting: boolean;
  walletType: "1am" | "lace" | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

function detect1AMWallet(): Promise<{ api: any; type: "1am" | "lace" } | null> {
  return new Promise((resolve) => {
    let attempts = 0;
    const check = () => {
      const w1am = (window as any).midnight?.["1am"];
      const wLace = (window as any).midnight?.mnLace;
      if (w1am) { resolve({ api: w1am, type: "1am" }); return; }
      if (wLace) { resolve({ api: wLace, type: "lace" }); return; }
      if (++attempts > 50) { resolve(null); return; }
      setTimeout(check, 100);
    };
    check();
  });
}

async function upsertUser(walletAddress: string): Promise<string | null> {
  try {
    const res = await fetch("/api/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress }),
    });
    if (!res.ok) return null;
    const user = await res.json();
    return user.id ?? null;
  } catch {
    return null;
  }
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      isConnected: false,
      walletAddress: null,
      userId: null,
      isConnecting: false,
      walletType: null,

      connect: async () => {
        set({ isConnecting: true });
        try {
          const detected = await detect1AMWallet();

          if (!detected) {
            alert(
              "Please install the 1AM Wallet extension and make sure it is unlocked."
            );
            set({ isConnecting: false });
            return;
          }

          const { api, type } = detected;
          const connectedApi =
            type === "1am" ? await api.connect("preview") : await api.enable();

          let displayAddress: string;
          try {
            if (type === "1am") {
              const addr = await connectedApi.getUnshieldedAddress();
              displayAddress = addr?.unshieldedAddress ?? "Connected";
            } else {
              displayAddress =
                (await connectedApi.getCoinPublicKey()) ?? "Connected";
            }
          } catch {
            displayAddress = "Connected";
          }

          // Upsert user in DB and get their ID
          const userId = await upsertUser(displayAddress);

          set({
            isConnected: true,
            walletAddress: displayAddress,
            userId,
            isConnecting: false,
            walletType: type,
          });
        } catch (error: any) {
          console.error("Failed to connect wallet:", error);
          set({ isConnecting: false });
        }
      },

      disconnect: () => {
        set({
          isConnected: false,
          walletAddress: null,
          userId: null,
          walletType: null,
        });
      },
    }),
    {
      name: "shadow-arena-wallet",   // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist address + connection state, not the functions
      partialize: (state) => ({
        isConnected: state.isConnected,
        walletAddress: state.walletAddress,
        userId: state.userId,
        walletType: state.walletType,
      }),
    }
  )
);
