import { create } from 'zustand';

type BottomSheetStore = {
  // main settings
  isSettingsSheetOpen: boolean;
  toggleSettingsSheet: () => void;
  openSettingsSheet: () => void;
  closeSettingsSheet: () => void;
  // connectkit webview
  isCKSheetOpen: boolean;
  openCKSheet: () => void;
  closeCKSheet: () => void;
  // single nfc deeplink view
  isNFCSheetOpen: boolean;
  openNFCSheet: () => void;
  closeNFCSheet: () => void;
  // host schedule challenge instructions
  challengeSheetOpen: boolean;
  openChallengeSheet: () => void;
  closeChallengeSheet: () => void;
};

export const useBottomSheetStore = create<BottomSheetStore>()(set => ({
  isSettingsSheetOpen: false,
  toggleSettingsSheet: () =>
    set(z => ({
      isSettingsSheetOpen: !z.isSettingsSheetOpen,
      isNFCSheetOpen: false,
    })),
  openSettingsSheet: () => set({ isSettingsSheetOpen: true }),
  closeSettingsSheet: () => set({ isSettingsSheetOpen: false }),
  isCKSheetOpen: false,
  openCKSheet: () =>
    set({
      isCKSheetOpen: true,
      isNFCSheetOpen: false,
    }),
  closeCKSheet: () => set({ isCKSheetOpen: false }),
  isNFCSheetOpen: false,
  openNFCSheet: () =>
    set({
      isNFCSheetOpen: true,
      isCKSheetOpen: false,
      isSettingsSheetOpen: false,
    }),
  closeNFCSheet: () => set({ isNFCSheetOpen: false }),
  challengeSheetOpen: false,
  openChallengeSheet: () => set({ challengeSheetOpen: true }),
  closeChallengeSheet: () => set({ challengeSheetOpen: false }),
}));
