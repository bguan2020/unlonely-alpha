import create from 'zustand';

type VideoPlayerStore = {
  isNFCPlaying: boolean;
  isLiveStreamPlaying: boolean;
  toggleNFCPlaying: () => void;
  toggleLiveStreamPlaying: () => void;
};

export const useVideoPlayerStore = create<VideoPlayerStore>()(set => ({
  isNFCPlaying: false,
  isLiveStreamPlaying: false,
  toggleNFCPlaying: () =>
    set(z => ({
      isNFCPlaying: !z.isNFCPlaying,
      isLiveStreamPlaying: false,
    })),
  toggleLiveStreamPlaying: () =>
    set(z => ({
      isLiveStreamPlaying: !z.isLiveStreamPlaying,
      isNFCPlaying: false,
    })),
}));
