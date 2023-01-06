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

export const useAppSettingsStore = create<AppSettingsStore>(set => ({
  // make sure to save this to async storage and read it on app start
  isSettingsSheetOpen: false,
  isNotificationPermissionGranted: false,
  isLivePushNotificationsEnabled: true,
  isNewNfcPushNotificationsEnabled: true,
  isBlurEnabled: true,
  isNfcAutoplayEnabled: true,
  nfcFeedSorting: 'recent',
  toggleSettingsSheet: () => set(z => ({ isSettingsSheetOpen: !z.isSettingsSheetOpen })),
  closeSettingsSheet: () => set({ isSettingsSheetOpen: false }),
  grantNotificationPermissions: () => set({ isNotificationPermissionGranted: true }),
  toggleLivePushNotifications: () => set(z => ({ isLivePushNotificationsEnabled: !z.isLivePushNotificationsEnabled })),
  toggleNewNfcPushNotifications: () =>
    set(z => ({ isNewNfcPushNotificationsEnabled: !z.isNewNfcPushNotificationsEnabled })),
  toggleBlur: () => set(z => ({ isBlurEnabled: !z.isBlurEnabled })),
  toggleNfcAutoplay: () => set(z => ({ isNfcAutoplayEnabled: !z.isNfcAutoplayEnabled })),
  setNFCFeedSorting: (nfcFeedSorting: SortingTypes) => set({ nfcFeedSorting }),
}));

export const useConnectedWalletStore = create<ConnectedWalletStore>(set => ({
  connectedWallet: null,
  // make sure to save this to async storage and read it on app start
  setConnectedWallet: (wallet: ConnectedWallet) => set({ connectedWallet: wallet }),
  clearConnectedWallet: () => set({ connectedWallet: null }),
}));
