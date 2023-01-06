import create from 'zustand';

type ConnectedWallet = {
  address: string;
  avatar?: string;
  ens?: string;
};

type ConnectedWalletStore = {
  connectedWallet: ConnectedWallet | null;
  setConnectedWallet: (wallet: ConnectedWallet) => void;
  clearConnectedWallet: () => void;
};

type SortingTypes = 'recent' | 'liked';

type AppSettingsStore = {
  isSettingsSheetOpen: boolean;
  pushNotifications: boolean;
  blurEnabled: boolean;
  nfcAutoplayEnabled: boolean;
  nfcFeedSorting: SortingTypes;
  toggleSettingsSheet: () => void;
  closeSettingsSheet: () => void;
  togglePushNotifications: () => void;
  toggleBlur: () => void;
  toggleNfcAutoplay: () => void;
  setNFCFeedSorting: (nfcFeedSorting: SortingTypes) => void;
};

export const useAppSettingsStore = create<AppSettingsStore>(set => ({
  // make sure to save this to async storage and read it on app start
  isSettingsSheetOpen: false,
  pushNotifications: false,
  blurEnabled: true,
  nfcAutoplayEnabled: true,
  nfcFeedSorting: 'recent',
  toggleSettingsSheet: () => set(z => ({ isSettingsSheetOpen: !z.isSettingsSheetOpen })),
  closeSettingsSheet: () => set({ isSettingsSheetOpen: false }),
  togglePushNotifications: () => set(z => ({ pushNotifications: !z.pushNotifications })),
  toggleBlur: () => set(z => ({ blurEnabled: !z.blurEnabled })),
  toggleNfcAutoplay: () => set(z => ({ nfcAutoplayEnabled: !z.nfcAutoplayEnabled })),
  setNFCFeedSorting: (nfcFeedSorting: SortingTypes) => set({ nfcFeedSorting }),
}));

export const useConnectedWalletStore = create<ConnectedWalletStore>(set => ({
  connectedWallet: null,
  // make sure to save this to async storage and read it on app start
  setConnectedWallet: (wallet: ConnectedWallet) => set({ connectedWallet: wallet }),
  clearConnectedWallet: () => set({ connectedWallet: null }),
}));
