import { create } from 'zustand';
import { type WalletProvider, type MidnightProvider } from '@midnight-ntwrk/midnight-js-types';

interface WalletState {
  isConnected: boolean;
  walletAddress: string | null;
  walletProvider: WalletProvider | null;
  midnightProvider: MidnightProvider | null;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  isConnected: false,
  walletAddress: null,
  walletProvider: null,
  midnightProvider: null,
  isConnecting: false,

  connect: async () => {
    set({ isConnecting: true });
    try {
      // Setup the 1AM Wallet connection using window.midnight.dappConnector
      const dappConnector = (window as any).midnight?.mnLace;
      
      if (!dappConnector) {
        alert("Please install the 1AM Wallet extension!");
        set({ isConnecting: false });
        return;
      }

      const connectedApi = await dappConnector.enable();
      const addressBytes = await connectedApi.getCoinPublicKey();
      
      set({
        isConnected: true,
        walletAddress: addressBytes,
        isConnecting: false,
        walletProvider: connectedApi as unknown as WalletProvider,
        midnightProvider: connectedApi as unknown as MidnightProvider,
      });
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      set({ isConnecting: false });
    }
  },

  disconnect: () => {
    set({
      isConnected: false,
      walletAddress: null,
      walletProvider: null,
      midnightProvider: null,
    });
  },
}));
