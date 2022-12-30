import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ResizeMode, Video } from 'expo-av';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

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

const NfcVideo = (props: NfcVideoProps) => (
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

export const FullscreenNfc = forwardRef((props: FullscreenNfcProps, parentRef) => {
  const ref = useRef(null);
  const [shouldPlay, setShouldPlay] = useState(false);

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
      // await ref.current.playAsync();
      // setShouldPlay(true);
      // TODO: uncomment play stuff before release
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

  return (
    <View
      style={{
        flex: 1,
        width: '100%',
        height: props.height,
      }}
    >
      <View
        style={{
          flex: 1,
          width: '100%',
          height: props.height,
          position: 'absolute',
        }}
      >
        {/* make it a user selectable setting to disable these blurs for better performance */}
        {/* also disable on android */}
        <NfcVideo item={props.item} height={props.height} blurred play={shouldPlay} />
      </View>
      <BlurView
        intensity={80}
        tint="dark"
        style={{
          position: 'absolute',
          height: props.height,
          width: '100%',
          backgroundColor: 'rgba(0,0,0, 0.5)',
        }}
      />
      <View
        style={{
          flex: 1,
          width: '100%',
          height: props.height,
        }}
      >
        <NfcVideo item={props.item} videoRef={ref} height={props.height} play={shouldPlay} />
        <Ionicons name="md-heart-outline" size={44} color="white" />
        <Text style={styles.title}>{props.item.title}</Text>
        <Text style={styles.subtitle}>owned by {props.item.owner.username}</Text>
        <View
          style={{
            position: 'absolute',
            zIndex: 3,
            right: 24,
            bottom: 200,
            backgroundColor: 'red',
          }}
        >
          <MaterialCommunityIcons name="dots-horizontal" size={24} color="white" />
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
    fontSize: 24,
    color: 'white',
    fontFamily: 'NeuePixelSans',
    paddingVertical: 24,
    paddingHorizontal: 24,
    bottom: 80,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 1,
  },
  subtitle: {
    fontSize: 18,
    color: 'white',
    fontFamily: 'NeuePixelSans',
    paddingVertical: 24,
    paddingHorizontal: 24,
    bottom: 80,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 1,
  },
});
function showActionSheetWithOptions(
  arg0: { options: string[]; cancelButtonIndex: number; destructiveButtonIndex: number },
  arg1: (selectedIndex: number) => void
) {
  throw new Error('Function not implemented.');
}
