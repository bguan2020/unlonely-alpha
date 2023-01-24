import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type UserStore = {
  connectedWallet: {
    address: string;
    ensAvatar?: string;
    ensName?: string;
  } | null;
  setConnectedWallet: (wallet: UserStore['connectedWallet']) => void;
  clearConnectedWallet: () => void;
  userData: {
    address?: string;
    username?: string;
    signature?: string;
    bio?: string;
    powerUserLvl?: number;
    videoSavantLvl?: number;
    nfcRank?: number;
    FCImageUrl?: string;
    isFCUser?: boolean;
    notificationsTokens?: string;
    notificationsLive?: boolean;
    notificationsNFCs?: boolean;
  } | null;
  setUser: (user: UserStore['userData']) => void;
  clearUser: () => void;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
};

export const useUserStore = create<UserStore>()(
  persist(
    set => ({
      connectedWallet: null,
      setConnectedWallet: (wallet: UserStore['connectedWallet']) => set({ connectedWallet: wallet }),
      clearConnectedWallet: () => set({ connectedWallet: null }),
      userData: null,
      setUser: (user: UserStore['userData']) => set({ userData: user }),
      clearUser: () => set({ userData: null }),
      _hasHydrated: false,
      setHasHydrated: state => {
        set({
          _hasHydrated: state,
        });
      },
    }),
    {
      name: 'unlonely-user',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => state => {
        state.setHasHydrated(true);
      },
    }
  )
);
