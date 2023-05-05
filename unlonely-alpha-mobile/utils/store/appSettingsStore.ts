import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type SortingTypes = 'createdAt' | 'score';

type AppSettingsStore = {
  isNotificationsPermissionGranted: boolean;
  notificationsToken: string | null;
  setNotificationsToken: (token: string | null) => void;
  isNotificationsLiveEnabled: boolean;
  isNotificationsNFCsEnabled: boolean;
  setNotificationsLive: (state: boolean) => void;
  setNotificationsNFCs: (state: boolean) => void;
  isBlurEnabled: boolean;
  isNfcAutoplayEnabled: boolean;
  nfcFeedSorting: SortingTypes;
  grantNotificationsPermission: () => void;
  revokeNotificationsPermission: () => void;
  toggleBlur: () => void;
  toggleNfcAutoplay: () => void;
  setNFCFeedSorting: (nfcFeedSorting: SortingTypes) => void;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
};

export const useAppSettingsStore = create<AppSettingsStore>()(
  persist(
    set => ({
      isNotificationsPermissionGranted: false,
      notificationsToken: null,
      setNotificationsToken: token => {
        set({ notificationsToken: token });
      },
      isNotificationsLiveEnabled: false,
      isNotificationsNFCsEnabled: false,
      setNotificationsLive: state => {
        set({ isNotificationsLiveEnabled: state });
      },
      setNotificationsNFCs: state => {
        set({
          isNotificationsNFCsEnabled: state,
        });
      },
      isBlurEnabled: true,
      isNfcAutoplayEnabled: false,
      nfcFeedSorting: 'createdAt',
      grantNotificationsPermission: () => set({ isNotificationsPermissionGranted: true }),
      revokeNotificationsPermission: () => set({ isNotificationsPermissionGranted: false }),
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
      name: 'unlonely-app-settings',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => state => {
        state.setHasHydrated(true);
      },
    }
  )
);
