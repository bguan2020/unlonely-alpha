import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import IVSPlayer, { IVSPlayerRef, PlayerState } from 'amazon-ivs-react-native-player';
import { useEffect, useRef, useState } from 'react';
import { Audio, Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { easeGradient } from 'react-native-easing-gradient';
import { StreamBufferingOverlay } from './controls/streamBufferingOverlay';
import { StreamErrorOverlay } from './controls/streamErrorOverlay';
import { StreamLoadingOverlay } from './controls/streamLoadingOverlay';
import { StreamPlaybackOverlay } from './controls/streamPlaybackOverlay';
import { MotiView } from 'moti';
import { useVideoPlayerStore } from '../../utils/store/videoPlayerStore';
import { useLiveSettingsStore } from '../../utils/store/liveSettingsStore';
import { Image } from 'expo-image';

export function StreamPlayer({ awsId, thumbnailUrl, name }) {
  const { width } = useWindowDimensions();
  const { isLiveStreamPlaying, stopNFCPlaying, startLiveStreamPlaying, stopLiveStreamPlaying } = useVideoPlayerStore(
    z => ({
      isLiveStreamPlaying: z.isLiveStreamPlaying,
      stopNFCPlaying: z.stopNFCPlaying,
      startLiveStreamPlaying: z.startLiveStreamPlaying,
      stopLiveStreamPlaying: z.stopLiveStreamPlaying,
    })
  );
  const { streamPlayerKey, updateStreamPlayerKey, isAudioOnly } = useLiveSettingsStore(z => ({
    streamPlayerKey: z.streamPlayerKey,
    updateStreamPlayerKey: z.updateStreamPlayerKey,
    isAudioOnly: z.isAudioOnly,
  }));
  const mediaPlayerRef = useRef<IVSPlayerRef>(null);
  const [latency, setLatency] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [overlay, setOverlay] = useState<'loading' | 'playback' | 'buffering' | 'error'>('loading');
  const [overlayTapped, setOverlayTapped] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const forceOverlayDisplay = overlayTapped || !isPlaying || overlay === 'buffering' || overlay === 'error';

  const togglePip = () => {
    console.log('toggling pip');
    mediaPlayerRef.current?.togglePip();
  };

  const pressPlay = () => {
    mediaPlayerRef.current?.play();
    setIsPlaying(true);

    Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      shouldDuckAndroid: false,
      playThroughEarpieceAndroid: false,
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
    });

    // startLiveStreamPlaying();
    stopNFCPlaying();
  };

  const pressPause = () => {
    // stopLiveStreamPlaying();
    mediaPlayerRef.current?.pause();
    setIsPlaying(false);
  };

  const pressRetry = () => {
    setOverlay('loading');
    pressPlay();
    updateStreamPlayerKey(); // force repaint of player
  };

  useEffect(() => {
    // hide overlay after 1.5 seconds
    const timeout = setTimeout(() => {
      setOverlayTapped(false);
    }, 1500);

    return () => clearTimeout(timeout);
  }, [overlayTapped]);

  useEffect(() => {
    Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      shouldDuckAndroid: false,
      playThroughEarpieceAndroid: false,
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
    });
  }, []);

  useEffect(() => {
    if (isAudioOnly) {
      pressPause();
    }
  }, [isAudioOnly]);

  return (
    <>
      <View
        style={[
          styles.videoContainer,
          {
            width: '100%',
            height: Math.round(width * (9 / 16)),
          },
        ]}
      >
        <IVSPlayer
          key={streamPlayerKey}
          style={styles.videoPlayer}
          resizeMode="aspectFit"
          streamUrl={`https://0ef8576db087.us-west-2.playback.live-video.net/api/video/v1/us-west-2.500434899882.channel.${awsId}.m3u8`}
          initialBufferDuration={0.2}
          onLiveLatencyChange={latency => {
            // console.log('live latency: ', latency);

            setOverlay('playback');
            setLatency(latency);
          }}
          onData={data => {
            // loaded m3u8 and ready to play
            // console.log('onData', data);
            setOverlay('playback');
            setIsPlaying(false);
            setOverlayTapped(true);
          }}
          onError={error => {
            // playback error, probably stream is offline
            setErrorMessage(error);
            setOverlay('error');
            setIsPlaying(false);
          }}
          onLoad={() => {
            // started playing live stream
            setOverlay('playback');
            setIsPlaying(true);
            setOverlayTapped(false);
          }}
          onRebuffering={() => {
            // show buffering overlay
            setOverlay('buffering');
            setOverlayTapped(true);
          }}
          onPlayerStateChange={state => {
            if (state === PlayerState.Ended) {
              setOverlayTapped(true);
              setOverlay('error');
            }
          }}
          autoplay={false}
          volume={1}
          liveLowLatency={true}
          ref={mediaPlayerRef}
        />
        <Pressable
          onPress={() => {
            //  fade in controls after tap
            setOverlayTapped(true);
          }}
          style={styles.videoOverlay}
        >
          <MotiView
            style={styles.videoOverlay}
            pointerEvents={forceOverlayDisplay ? 'auto' : 'none'}
            animate={{
              opacity: forceOverlayDisplay ? 1 : 0,
            }}
          >
            {thumbnailUrl && !isPlaying && (
              <Image
                source={thumbnailUrl}
                style={{
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                }}
              />
            )}
            <LinearGradient
              colors={colors}
              locations={locations}
              start={[0, 1]}
              end={[0, 0]}
              style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
              }}
            />
            <View
              style={{
                position: 'absolute',
                left: 16,
                top: 24,
                width: '80%',
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: 'NeuePixelSans',
                  letterSpacing: 0.5,
                  color: 'white',
                  textAlign: 'left',
                }}
              >
                {name}
              </Text>
            </View>
            {overlay === 'loading' && <StreamLoadingOverlay />}
            {overlay === 'buffering' && <StreamBufferingOverlay />}
            {overlay === 'error' && <StreamErrorOverlay error={errorMessage} retry={pressRetry} />}
            {overlay === 'playback' && (
              <StreamPlaybackOverlay
                play={pressPlay}
                pause={pressPause}
                playing={isPlaying}
                latency={latency}
                togglePip={togglePip}
              />
            )}
          </MotiView>
        </Pressable>
      </View>
      <Video
        // DO NOT REMOVE
        // this whole component is a hack to get
        // the audio to play in the background
        // even when the phone is muted
        isMuted={false}
        volume={1}
        shouldPlay={isPlaying}
        source={{ uri: 'https://i.imgur.com/HRejmKy.mp4' }}
        style={{
          position: 'absolute',
          width: 2,
          height: 2,
          display: 'none',
        }}
      />
    </>
  );
}

const { colors, locations } = easeGradient({
  // Eased gradient function so it doesn’t look like garbage
  colorStops: {
    0: {
      color: 'rgba(0, 0, 0, 1)',
    },
    1: {
      color: 'rgba(0, 0, 0, 0.5)',
    },
  },
});

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoContainer: {
    backgroundColor: 'hsl(0, 0%, 2%)',
  },
  videoPlayer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
    ...StyleSheet.absoluteFillObject,
  },
  videoOverlayText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'NeuePixelSans',
    paddingTop: 12,
  },
});
