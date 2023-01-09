import AsyncStorage from '@react-native-async-storage/async-storage';
import create from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

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
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
};

export const useAppSettingsStore = create<AppSettingsStore>()(
  persist(
    (set, get) => ({
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
      toggleLivePushNotifications: () =>
        set(z => ({ isLivePushNotificationsEnabled: !z.isLivePushNotificationsEnabled })),
      toggleNewNfcPushNotifications: () =>
        set(z => ({ isNewNfcPushNotificationsEnabled: !z.isNewNfcPushNotificationsEnabled })),
      toggleBlur: () => set(z => ({ isBlurEnabled: !z.isBlurEnabled })),
      toggleNfcAutoplay: () => set(z => ({ isNfcAutoplayEnabled: !z.isNfcAutoplayEnabled })),
      setNFCFeedSorting: (nfcFeedSorting: SortingTypes) => set({ nfcFeedSorting }),
      _hasHydrated: false,
      setHasHydrated: state => {
        set({
          _hasHydrated: state,
        });
      },
    }),
    {
      name: 'app-settings',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => state => {
        state.setHasHydrated(true);
      },
    }
  )
);

type ConnectedWallet = {
  address: string;
  ensAvatar?: string;
  ensName?: string;
};

type ConnectedWalletStore = {
  isCKSheetOpen: boolean;
  connectedWallet: ConnectedWallet | null;
  openCKSheet: () => void;
  closeCKSheet: () => void;
  setConnectedWallet: (wallet: ConnectedWallet) => void;
  clearConnectedWallet: () => void;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
};

export const useConnectedWalletStore = create<ConnectedWalletStore>()(
  persist(
    (set, get) => ({
      isCKSheetOpen: false,
      connectedWallet: null,
      openCKSheet: () => set({ isCKSheetOpen: true }),
      closeCKSheet: () => set({ isCKSheetOpen: false }),
      setConnectedWallet: (wallet: ConnectedWallet) => set({ connectedWallet: wallet }),
      clearConnectedWallet: () => set({ connectedWallet: null }),
      _hasHydrated: false,
      setHasHydrated: state => {
        set({
          _hasHydrated: state,
        });
      },
    }),
    {
      name: 'connected-wallet',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => state => {
        state.setHasHydrated(true);
      },
    }
  )
);
