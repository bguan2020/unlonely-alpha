import create from 'zustand';

type SortingTypes = 'recent' | 'liked';

type AppSettingsStore = {
  isSettingsSheetOpen: boolean;
  isNotificationPermissionGranted: boolean;
  isLivePushNotificationsEnabled: boolean;
  isNewNfcPushNotificationsEnabled: boolean;
  isBlurEnabled: boolean;
  isNfcAutoplayEnabled: boolean;
  nfcFeedSorting: SortingTypes;
  toggleSettingsSheet: () => void;
  closeSettingsSheet: () => void;
  grantNotificationPermissions: () => void;
  toggleLivePushNotifications: () => void;
  toggleNewNfcPushNotifications: () => void;
  toggleBlur: () => void;
  toggleNfcAutoplay: () => void;
  setNFCFeedSorting: (nfcFeedSorting: SortingTypes) => void;
};

type ConnectedWallet = {
  address: string;
  avatar?: string;
  ens?: string;
};

type ConnectedWalletStore = {
  isCKSheetOpen: boolean;
  connectedWallet: ConnectedWallet | null;
  openCKSheet: () => void;
  closeCKSheet: () => void;
  setConnectedWallet: (wallet: ConnectedWallet) => void;
  clearConnectedWallet: () => void;
};

export const useAppSettingsStore = create<AppSettingsStore>(set => ({
  isSettingsSheetOpen: false,
  isNotificationPermissionGranted: false,
  isLivePushNotificationsEnabled: true,
  isNewNfcPushNotificationsEnabled: true,
  isBlurEnabled: true,
  isNfcAutoplayEnabled: true,
  nfcFeedSorting: 'recent',
  toggleSettingsSheet: () => set(z => ({ isSettingsSheetOpen: !z.isSettingsSheetOpen })),
  closeSettingsSheet: () => set({ isSettingsSheetOpen: false }),
  grantNotificationPermissions: () => {
    set({ isNotificationPermissionGranted: true });
    // save to async storage
  },
  toggleLivePushNotifications: () => {
    set(z => ({ isLivePushNotificationsEnabled: !z.isLivePushNotificationsEnabled }));
    // save to async storage
  },
  toggleNewNfcPushNotifications: () => {
    set(z => ({ isNewNfcPushNotificationsEnabled: !z.isNewNfcPushNotificationsEnabled }));
    // save to async storage
  },
  toggleBlur: () => {
    set(z => ({ isBlurEnabled: !z.isBlurEnabled }));
    // save to async storage
  },
  toggleNfcAutoplay: () => {
    set(z => ({ isNfcAutoplayEnabled: !z.isNfcAutoplayEnabled }));
    // save to async storage
  },
  setNFCFeedSorting: (nfcFeedSorting: SortingTypes) => {
    set({ nfcFeedSorting });
    // save to async storage
  },
}));

export const useConnectedWalletStore = create<ConnectedWalletStore>(set => ({
  isCKSheetOpen: false,
  connectedWallet: null,
  openCKSheet: () => set({ isCKSheetOpen: true }),
  closeCKSheet: () => set({ isCKSheetOpen: false }),
  setConnectedWallet: (wallet: ConnectedWallet) => {
    set({ connectedWallet: wallet });
    // save to async storage
  },
  clearConnectedWallet: () => {
    set({ connectedWallet: null });
    // save to async storage
  },
}));
