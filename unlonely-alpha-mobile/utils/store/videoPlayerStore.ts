import create from 'zustand';

type VideoPlayerStore = {
  isNFCPlaying: boolean;
  isLiveStreamPlaying: boolean;
  startNFCPlaying: () => void;
  stopNFCPlaying: () => void;
  startLiveStreamPlaying: () => void;
  stopLiveStreamPlaying: () => void;
};

export const useVideoPlayerStore = create<VideoPlayerStore>()(set => ({
  isNFCPlaying: false,
  isLiveStreamPlaying: false,
  startNFCPlaying: () => set({ isNFCPlaying: true, isLiveStreamPlaying: false }),
  stopNFCPlaying: () => set({ isNFCPlaying: false }),
  startLiveStreamPlaying: () => set({ isLiveStreamPlaying: true, isNFCPlaying: false }),
  stopLiveStreamPlaying: () => set({ isLiveStreamPlaying: false }),
}));
