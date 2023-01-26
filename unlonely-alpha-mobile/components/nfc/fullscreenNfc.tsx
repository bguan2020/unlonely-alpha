import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Linking, Platform, Share, StyleSheet, Text, View } from 'react-native';
import { ResizeMode, Video } from 'expo-av';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Clipboard from '@react-native-clipboard/clipboard';
import { toast } from '../toast/toast';
import { useHaptics } from '../../utils/haptics';
import { AnimatedMenuView } from '../buttons/animatedMenuView';
import { AnimatedPressable } from '../buttons/animatedPressable';
import { format, parseISO } from 'date-fns';
import { useAppSettingsStore } from '../../utils/store/appSettingsStore';
import { useVideoPlayerStore } from '../../utils/store/videoPlayerStore';
import { BlurLayer } from '../blur/blurLayer';
import { useDeviceInfo } from '../../utils/useDeviceInfo';

type FullscreenNfcProps = {
  height: number;
  ref: any;
  width: number;
  item: any;
};

type NfcVideoProps = {
  blurred?: boolean;
  height: number;
  play: boolean;
  item: any;
  videoRef?: any;
};

const VIDEO_START_POSITION = 1500; // milliseconds

const shareMenuActions = [
  {
    id: 'opensea',
    title: 'view on OpenSea',
    image: Platform.select({
      ios: 'globe',
      android: 'language',
    }),
  },
  {
    id: 'copy-link',
    title: 'copy NFC link',
    image: Platform.select({
      ios: 'link',
      android: 'link',
    }),
  },
  {
    id: 'share',
    title: 'share',
    image: Platform.select({
      ios: 'square.and.arrow.up',
      android: 'share',
    }),
  },
];

const NfcVideo = (props: NfcVideoProps) => {
  return (
    <Video
      isLooping={true}
      isMuted={props.blurred ? true : false}
      positionMillis={VIDEO_START_POSITION}
      usePoster
      posterSource={{ uri: `${props.item.videoLink}#t=${VIDEO_START_POSITION / 1000}` }}
      // loading a still from the video start position rather than the poster image
      // so it doesn’t create an awkward repeating transition when a new video starts playing
      posterStyle={{ width: '100%', height: props.height, resizeMode: 'contain' }}
      ref={props.videoRef}
      resizeMode={props.blurred ? ResizeMode.COVER : ResizeMode.CONTAIN}
      shouldPlay={props.play}
      source={{ uri: props.item.videoLink }}
      videoStyle={{ width: '100%', height: props.height }}
      style={styles.video}
    />
  );
};

export const FullscreenNfc = forwardRef((props: FullscreenNfcProps, parentRef) => {
  const { isBlurEnabled, isNfcAutoplayEnabled, _hasHydrated } = useAppSettingsStore(z => ({
    isBlurEnabled: z.isBlurEnabled,
    isNfcAutoplayEnabled: z.isNfcAutoplayEnabled,
    _hasHydrated: z._hasHydrated,
  }));
  const { deviceiOS, deviceAndroid } = useDeviceInfo();
  const isNFCPlaying = useVideoPlayerStore(z => z.isNFCPlaying);
  const ref = useRef(null);
  const [shouldPlay, setShouldPlay] = useState(false);
  const [isLiked, setIsLiked] = useState(props.item.liked);
  const parsedDate = parseISO(props.item.createdAt);
  const nfcMintDate = format(parsedDate, 'EEEE, MMM dd h:mm a').toLocaleLowerCase();

  useImperativeHandle(parentRef, () => ({
    play,
    // unload,
    pause,
  }));

  const play = async () => {
    if (ref.current === null) return;
    const status = await ref.current.getStatusAsync();
    if (status?.isPlaying) return;

    try {
      if (_hasHydrated && isNfcAutoplayEnabled && isNFCPlaying) {
        // TODO: uncomment play stuff before release
        // await ref.current.playAsync();
        setShouldPlay(true);
      }
    } catch {
      alert('error playing video');
    }
  };

  const pause = async () => {
    if (ref.current === null) return;
    const status = await ref.current.getStatusAsync();
    if (!status?.isPlaying) return;

    try {
      // await ref.current.pauseAsync();
      setShouldPlay(false);
    } catch {
      alert('error stopping video');
    }
  };

  // const unload = async () => {
  //   if (ref.current === null) return;

  //   try {
  //     console.log('unloading video');
  //     await ref.current.unloadAsync();
  //   } catch {
  //     console.error('error unloading video');
  //   }
  // };

  // useEffect(() => {
  //   unload();
  // }, []);

  useEffect(() => {
    if (!isNfcAutoplayEnabled || !isNFCPlaying) {
      // setShouldPlay(false);
      pause();
    } else {
      // setShouldPlay(true);
      play();
    }
  }, [isNfcAutoplayEnabled, isNFCPlaying]);

  return (
    <View
      style={{
        flex: 1,
        width: '100%',
        height: props.height,
        backgroundColor: 'black',
      }}
    >
      {isBlurEnabled && !deviceAndroid && (
        <>
          <View
            style={{
              flex: 1,
              width: '100%',
              height: props.height,
              position: 'absolute',
            }}
          >
            <NfcVideo item={props.item} height={props.height} blurred play={shouldPlay} />
          </View>
          <BlurLayer
            blurAmount={20}
            blurType="dark"
            style={{
              position: 'absolute',
              height: props.height,
              width: '100%',
              backgroundColor: 'rgba(0,0,0, 0.5)',
            }}
          />
        </>
      )}
      <View
        style={{
          flex: 1,
          width: '100%',
          height: props.height,
        }}
      >
        <NfcVideo item={props.item} videoRef={ref} height={props.height} play={shouldPlay} />

        <View
          style={{
            flex: 1,
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: props.height,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <AnimatedPressable
            onPress={() => {
              setShouldPlay(!shouldPlay);
            }}
            style={{
              opacity: shouldPlay ? 0 : 1,
              width: 300,
              height: 200,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 1,
                shadowRadius: 18,
              }}
            >
              <Ionicons name="md-play" size={64} color="white" />
            </View>
          </AnimatedPressable>
        </View>

        <View
          style={{
            flex: 1,
            position: 'absolute',
            left: 0,
            bottom: 0,
            height: props.height / 2.7,
            width: '100%',
          }}
        >
          <View
            style={{
              height: 64,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 4,
            }}
          >
            <AnimatedMenuView
              onPressAction={({ nativeEvent }) => {
                if (nativeEvent.event === 'opensea') {
                  Linking.openURL(props.item.openseaLink);
                }
                if (nativeEvent.event === 'copy-link') {
                  Clipboard.setString(`https://www.unlonely.app/nfc/${props.item.id}`);
                  useHaptics('medium');
                  toast('copied to clipboard');
                }
                if (nativeEvent.event === 'share') {
                  useHaptics('medium');
                  Share.share({
                    message: `https://www.unlonely.app/nfc/${props.item.id}`,
                  });
                }
              }}
              actions={shareMenuActions}
              title={`minted on ${nfcMintDate}`}
              style={{
                width: 48,
                height: 48,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <View>
                <MaterialCommunityIcons name="dots-horizontal" size={32} color="rgba(255,255,255,0.75)" />
              </View>
            </AnimatedMenuView>
            {/* <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Text style={styles.likedCount}>{props.item.score}</Text>
              <AnimatedPressable
                style={{
                  width: 48,
                  height: 48,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={() => setIsLiked(!isLiked)}
                bouncy
              >
                {isLiked ? (
                  <Ionicons name="md-heart" size={32} color="rgba(255,255,255,0.75)" />
                ) : (
                  <Ionicons name="md-heart-outline" size={32} color="rgba(255,255,255,0.75)" />
                )}
              </AnimatedPressable>
            </View> */}
          </View>
          <View
            style={{
              flex: 1,
              justifyContent: 'flex-end',
              paddingBottom: 100,
            }}
          >
            <View
              style={{
                flex: 1,
                justifyContent: 'flex-end',
                paddingHorizontal: 16,
              }}
            >
              <Text style={styles.title}>{props.item.title}</Text>
              <Text style={styles.subtitle}>owned by {props.item.owner.username}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  video: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 28,
    lineHeight: 32,
    color: 'white',
    fontFamily: 'NeuePixelSans',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 1,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.75)',
    paddingVertical: 16,
    fontFamily: 'NeuePixelSans',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 1,
  },
  likedCount: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.75)',
    paddingVertical: 16,
    fontFamily: 'NeuePixelSans',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 1,
  },
});
