import { create } from 'zustand';

type LiveSettingsStore = {
  isChatExpanded: boolean;
  toggleChatExpand: () => void;
  streamPlayerKey: number;
  updateStreamPlayerKey: () => void;
};

export const useLiveSettingsStore = create<LiveSettingsStore>()(set => ({
  isChatExpanded: false,
  toggleChatExpand: () => set(z => ({ isChatExpanded: !z.isChatExpanded })),
  streamPlayerKey: 0,
  updateStreamPlayerKey: () => set(z => ({ streamPlayerKey: z.streamPlayerKey + 1 })),
}));
